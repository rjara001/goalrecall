import { Router, Request, Response } from "express";
import {
  buildDemoEcosystemSuggestions,
  normalizeGitHubEventToDraft,
  normalizeGitHubPullRequestToDraft,
  normalizeGitLabMergeRequestToDraft,
  normalizeJiraIssueToDraft,
  RawGitHubEvent,
  RawGitHubPullRequest,
  RawGitLabMergeRequest,
  RawJiraIssue,
} from "../services/devEcosystemIngestor";
import type { VisitorMessage } from "../../src/types";

export function createIntegrationsRouter(): Router {
  const router = Router();

  router.post("/github/sync", async (req: Request, res: Response) => {
    try {
      const repo = typeof req.body?.repo === "string" ? req.body.repo.trim() : "";
      const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
      const limit = Math.min(Math.max(Number(req.body?.limit) || 10, 1), 25);
      const token =
        (typeof req.body?.token === "string" ? req.body.token.trim() : "") ||
        process.env.GITHUB_TOKEN ||
        "";

      if (!repo && !username) {
        res.status(400).json({
          success: false,
          error: "Debes indicar un repositorio (owner/repo) o un usuario de GitHub.",
        });
        return;
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "GoalRecall-Ingestor/1.0",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (repo) {
        const cleanRepo = repo
          .replace(/^https?:\/\/github\.com\//i, "")
          .replace(/\.git$/i, "")
          .replace(/^\/+|\/+$/g, "");
        if (!/^[^/]+\/[^/]+$/.test(cleanRepo)) {
          res.status(400).json({
            success: false,
            error: "Formato de repositorio inválido. Usa el formato owner/repo (ej. vercel/next.js).",
          });
          return;
        }

        const apiUrl = `https://api.github.com/repos/${cleanRepo}/pulls?state=closed&sort=updated&direction=desc&per_page=${limit}`;
        const ghRes = await fetch(apiUrl, { headers });
        if (!ghRes.ok) {
          res.status(ghRes.status === 404 ? 404 : 502).json({
            success: false,
            error:
              ghRes.status === 404
                ? `No se encontró el repositorio '${cleanRepo}' o es privado.`
                : `GitHub API respondió con estado ${ghRes.status}.`,
          });
          return;
        }

        const prs = (await ghRes.json()) as RawGitHubPullRequest[];
        const merged = prs.filter((pr) => Boolean(pr.merged_at));
        const suggestions = (merged.length > 0 ? merged : prs.slice(0, 5)).map((pr) =>
          normalizeGitHubPullRequestToDraft(pr, cleanRepo)
        );

        res.json({ success: true, provider: "github", sourceCount: prs.length, suggestions });
        return;
      }

      const cleanUser = username.replace(/^@/, "").trim();
      const eventsUrl = `https://api.github.com/users/${encodeURIComponent(cleanUser)}/events/public?per_page=${Math.min(limit * 3, 30)}`;
      const evRes = await fetch(eventsUrl, { headers });
      if (!evRes.ok) {
        res.status(evRes.status === 404 ? 404 : 502).json({
          success: false,
          error:
            evRes.status === 404
              ? `Usuario de GitHub '@${cleanUser}' no encontrado.`
              : `GitHub API respondió con estado ${evRes.status}.`,
        });
        return;
      }

      const events = (await evRes.json()) as RawGitHubEvent[];
      const suggestions = events
        .map((ev) => normalizeGitHubEventToDraft(ev))
        .filter((item): item is VisitorMessage => Boolean(item))
        .slice(0, limit);

      res.json({ success: true, provider: "github", sourceCount: events.length, suggestions });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al sincronizar con GitHub.",
      });
    }
  });

  router.post("/gitlab/sync", async (req: Request, res: Response) => {
    try {
      const projectPath =
        typeof req.body?.projectPath === "string" ? req.body.projectPath.trim() : "";
      const baseUrl = (
        (typeof req.body?.baseUrl === "string" && req.body.baseUrl.trim()) ||
        "https://gitlab.com"
      ).replace(/\/+$/, "");
      const limit = Math.min(Math.max(Number(req.body?.limit) || 10, 1), 25);
      const token =
        (typeof req.body?.token === "string" ? req.body.token.trim() : "") ||
        process.env.GITLAB_TOKEN ||
        "";

      if (!projectPath) {
        res.status(400).json({
          success: false,
          error: "Debes indicar el path o ID del proyecto en GitLab (ej. grupo/proyecto).",
        });
        return;
      }

      const cleanProject = projectPath
        .replace(/^https?:\/\/[^/]+\//i, "")
        .replace(/\.git$/i, "")
        .replace(/^\/+|\/+$/g, "");

      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["PRIVATE-TOKEN"] = token;

      const apiUrl = `${baseUrl}/api/v4/projects/${encodeURIComponent(cleanProject)}/merge_requests?state=merged&order_by=updated_at&sort=desc&per_page=${limit}`;
      const glRes = await fetch(apiUrl, { headers });
      if (!glRes.ok) {
        res.status(glRes.status === 404 ? 404 : 502).json({
          success: false,
          error:
            glRes.status === 404
              ? `No se encontró el proyecto '${cleanProject}' en GitLab o requiere token.`
              : `GitLab API respondió con estado ${glRes.status}.`,
        });
        return;
      }

      const mrs = (await glRes.json()) as RawGitLabMergeRequest[];
      const suggestions = mrs.map((mr) =>
        normalizeGitLabMergeRequestToDraft(mr, cleanProject)
      );

      res.json({ success: true, provider: "gitlab", sourceCount: mrs.length, suggestions });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al sincronizar con GitLab.",
      });
    }
  });

  router.post("/jira/sync", async (req: Request, res: Response) => {
    try {
      const baseUrl = (
        (typeof req.body?.baseUrl === "string" && req.body.baseUrl.trim()) ||
        process.env.JIRA_BASE_URL ||
        ""
      ).replace(/\/+$/, "");
      const email =
        (typeof req.body?.email === "string" && req.body.email.trim()) ||
        process.env.JIRA_EMAIL ||
        "";
      const apiToken =
        (typeof req.body?.apiToken === "string" && req.body.apiToken.trim()) ||
        process.env.JIRA_API_TOKEN ||
        "";
      const projectKey =
        typeof req.body?.projectKey === "string" ? req.body.projectKey.trim() : "";
      const limit = Math.min(Math.max(Number(req.body?.limit) || 10, 1), 25);

      if (!baseUrl || !email || !apiToken) {
        res.status(400).json({
          success: false,
          error:
            "Jira Cloud requiere dominio (https://tu-org.atlassian.net), email y token de sesión.",
        });
        return;
      }

      const defaultJql = projectKey
        ? `project = "${projectKey.replace(/[^a-zA-Z0-9_-]/g, "")}" AND statusCategory = Done ORDER BY updated DESC`
        : "assignee = currentUser() AND statusCategory = Done ORDER BY updated DESC";
      const jql =
        typeof req.body?.jql === "string" && req.body.jql.trim()
          ? req.body.jql.trim()
          : defaultJql;

      const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
      const jiraRes = await fetch(`${baseUrl}/rest/api/3/search/jql`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          jql,
          maxResults: limit,
          fields: [
            "summary",
            "description",
            "issuetype",
            "status",
            "priority",
            "project",
            "components",
            "labels",
            "resolutiondate",
            "updated",
          ],
        }),
      });

      if (!jiraRes.ok) {
        res.status(jiraRes.status === 401 || jiraRes.status === 403 ? 401 : 502).json({
          success: false,
          error:
            jiraRes.status === 401 || jiraRes.status === 403
              ? "Credenciales de Jira Cloud rechazadas. Verifica dominio, email y token."
              : `Jira API respondió con estado ${jiraRes.status}.`,
        });
        return;
      }

      const json = (await jiraRes.json()) as { issues?: RawJiraIssue[] };
      const issues = Array.isArray(json.issues) ? json.issues : [];
      const suggestions = issues.map((issue) => normalizeJiraIssueToDraft(issue, baseUrl));

      res.json({ success: true, provider: "jira", sourceCount: issues.length, suggestions });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Error al sincronizar con Jira Cloud.",
      });
    }
  });

  router.post("/demo-ingest", (req: Request, res: Response) => {
    const sourceRaw = typeof req.body?.source === "string" ? req.body.source : "all";
    const source =
      sourceRaw === "github" || sourceRaw === "jira" ? sourceRaw : ("all" as const);
    const suggestions = buildDemoEcosystemSuggestions(source);
    res.json({
      success: true,
      provider: "sample",
      sourceCount: suggestions.length,
      suggestions,
    });
  });

  return router;
}
