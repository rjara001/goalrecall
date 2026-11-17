import { describe, expect, it } from "bun:test";
import {
  buildDemoEcosystemSuggestions,
  normalizeGitHubEventToDraft,
  normalizeGitHubPullRequestToDraft,
  normalizeGitLabMergeRequestToDraft,
  normalizeJiraIssueToDraft,
} from "./devEcosystemIngestor";

describe("devEcosystemIngestor", () => {
  it("normalizes a GitHub PR into an Inbox achievement draft with XYZ impact and STAR story", () => {
    const item = normalizeGitHubPullRequestToDraft(
      {
        id: 101,
        number: 142,
        title: "Fix race condition en webhook de Stripe (-65% errores)",
        body: "Implementado mutex distribuido con Redis evitando cobros duplicados.",
        html_url: "https://github.com/acme/billing/pull/142",
        merged_at: "2026-11-10T14:20:00Z",
        user: { login: "rjara001" },
        labels: [{ name: "bugfix" }, { name: "redis" }],
        head: { ref: "fix/webhook-race" },
        base: { ref: "main" },
        additions: 48,
        deletions: 12,
        changed_files: 3,
      },
      "acme/billing"
    );

    expect(item.sourceType).toBe("git_pr");
    expect(item.sourceRef).toBe("github:acme/billing#142");
    expect(item.achievementDraft?.category).toBe("Fix 🐛");
    expect(item.achievementDraft?.impact).toContain("-65%");
    expect(item.achievementDraft?.tags).toContain("#GitHubPR");
    expect(item.achievementDraft?.starDraft?.action).toContain("Redis");
  });

  it("ignores unmerged PullRequestEvent unless closed, and normalizes ReleaseEvent", () => {
    const ignored = normalizeGitHubEventToDraft({
      id: "ev-1",
      type: "PullRequestEvent",
      repo: { name: "acme/api" },
      payload: {
        action: "opened",
        pull_request: { id: 1, number: 55, title: "WIP branch" },
      },
    });
    expect(ignored).toBeNull();

    const release = normalizeGitHubEventToDraft({
      id: "ev-2",
      type: "ReleaseEvent",
      created_at: "2026-11-12T10:00:00Z",
      repo: { name: "acme/api" },
      actor: { login: "rjara001" },
      payload: {
        release: {
          tag_name: "v2.4.0",
          name: "Release v2.4.0",
          body: "Zero-downtime deploy with Canary rollout",
          html_url: "https://github.com/acme/api/releases/tag/v2.4.0",
        },
      },
    });

    expect(release).not.toBeNull();
    expect(release?.achievementDraft?.category).toBe("Infra/DevOps 🚀");
    expect(release?.sourceRef).toContain("release:v2.4.0");
  });

  it("normalizes a GitLab Merge Request into an achievement draft", () => {
    const item = normalizeGitLabMergeRequestToDraft(
      {
        id: 22,
        iid: 88,
        title: "Refactor auth middleware architecture with JWT cache",
        description: "Redujo p95 a 18ms en validación de sesiones.",
        web_url: "https://gitlab.com/acme/gateway/-/merge_requests/88",
        merged_at: "2026-11-11T09:00:00Z",
        labels: ["security"],
        source_branch: "refactor/jwt-cache",
        target_branch: "main",
      },
      "acme/gateway"
    );

    expect(item.sourceType).toBe("gitlab_mr");
    expect(item.sourceRef).toBe("gitlab:acme/gateway!88");
    expect(item.achievementDraft?.tags).toContain("#GitLabMR");
    expect(item.achievementDraft?.impact).toContain("18ms");
  });

  it("extracts Atlassian ADF text and builds STAR draft for Done Jira issues", () => {
    const item = normalizeJiraIssueToDraft(
      {
        id: "1001",
        key: "PAY-309",
        fields: {
          summary: "Migrar cola de notificaciones a Kubernetes workers",
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Procesamiento 3x throughput bajo carga." }],
              },
            ],
          },
          issuetype: { name: "Story" },
          status: { name: "Done" },
          project: { key: "PAY", name: "Payments Core" },
          components: [{ name: "Workers" }],
          labels: ["k8s"],
          resolutiondate: "2026-11-14T16:00:00.000Z",
        },
      },
      "https://acme.atlassian.net/"
    );

    expect(item.sourceType).toBe("jira_issue");
    expect(item.sourceUrl).toBe("https://acme.atlassian.net/browse/PAY-309");
    expect(item.achievementDraft?.title).toBe("[PAY-309] Migrar cola de notificaciones a Kubernetes workers");
    expect(item.achievementDraft?.starDraft?.action).toContain("3x throughput");
    expect(item.achievementDraft?.tags).toContain("#JiraDone");
  });

  it("builds sample PR + Jira suggestions without leaking tokens", () => {
    const samples = buildDemoEcosystemSuggestions("all");
    expect(samples).toHaveLength(2);
    const serialized = JSON.stringify(samples);
    expect(serialized).not.toContain("Bearer");
    expect(serialized).not.toContain("ghp_");
  });
});
