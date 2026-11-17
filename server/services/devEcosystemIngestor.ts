import type { InboxAchievementDraft, LogCategory, VisitorMessage } from "../../src/types";

export interface RawGitHubPullRequest {
  id: number | string;
  number: number;
  title: string;
  body?: string | null;
  html_url?: string;
  merged_at?: string | null;
  closed_at?: string | null;
  created_at?: string | null;
  user?: { login?: string } | null;
  labels?: Array<{ name?: string }>;
  head?: { ref?: string };
  base?: { ref?: string };
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface RawGitHubEvent {
  id: string;
  type: string;
  created_at?: string;
  repo?: { name?: string };
  actor?: { login?: string };
  payload?: {
    action?: string;
    pull_request?: RawGitHubPullRequest;
    release?: { tag_name?: string; name?: string; body?: string; html_url?: string };
    commits?: Array<{ sha?: string; message?: string }>;
  };
}

export interface RawGitLabMergeRequest {
  id: number | string;
  iid: number;
  title: string;
  description?: string | null;
  web_url?: string;
  merged_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  author?: { username?: string; name?: string };
  labels?: string[];
  source_branch?: string;
  target_branch?: string;
}

export interface RawJiraIssue {
  id: string;
  key: string;
  fields?: {
    summary?: string;
    description?: unknown;
    issuetype?: { name?: string };
    status?: { name?: string; statusCategory?: { key?: string; name?: string } };
    priority?: { name?: string };
    project?: { key?: string; name?: string };
    components?: Array<{ name?: string }>;
    labels?: string[];
    resolutiondate?: string | null;
    updated?: string;
    reporter?: { displayName?: string };
    assignee?: { displayName?: string };
  };
}

function cleanText(input: unknown, maxLen = 400): string {
  if (!input) return "";
  let raw = "";
  if (typeof input === "string") {
    raw = input;
  } else if (typeof input === "object") {
    // Extract plain text from Atlassian Document Format (ADF)
    const parts: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const obj = node as Record<string, unknown>;
      if (typeof obj.text === "string") parts.push(obj.text);
      if (Array.isArray(obj.content)) obj.content.forEach(walk);
    };
    walk(input);
    raw = parts.join(" ");
  }
  const normalized = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.substring(0, maxLen - 3).trim() + "...";
}

function inferCategoryFromText(text: string): LogCategory {
  const lower = text.toLowerCase();
  if (/\b(fix|bug|hotfix|incident|race|error|patch|crash)\b/i.test(lower)) return "Fix 🐛";
  if (/\b(refactor|cleanup|debt|migrate|upgrade|deprecate)\b/i.test(lower)) return "Refactor 🧹";
  if (/\b(arch|rfc|schema|index|cache|queue|event|microservice|distributed)\b/i.test(lower)) {
    return "Architecture 🏗️";
  }
  if (/\b(ci|cd|docker|k8s|kubernetes|terraform|deploy|infra|pipeline|helm|monitor|otel)\b/i.test(lower)) {
    return "Infra/DevOps 🚀";
  }
  if (/\b(spike|poc|benchmark|research|prototype|evaluate)\b/i.test(lower)) return "Spike/R&D 🔬";
  return "Feature ✨";
}

function extractQuantifiedMetric(text: string): string | null {
  const match = text.match(
    /(?:[-+]?\d+(?:[.,]\d+)?\s*(?:%|ms|s|x|req\/s|rps|kb|mb|gb|hrs?|min)|(?:p95|p99|sla|slo)\s*[^\.,;]{0,25})/i
  );
  return match ? match[0].trim() : null;
}

function extractTagsFromLabelsAndText(labels: string[], text: string, fallbackTag: string): string[] {
  const tags = new Set<string>();
  tags.add(fallbackTag);

  for (const label of labels) {
    const clean = label.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    if (clean.length >= 2 && clean.length <= 24) {
      tags.add(`#${clean}`);
    }
  }

  const techKeywords: Array<[RegExp, string]> = [
    [/\btypescript\b/i, "#TypeScript"],
    [/\breact\b/i, "#React"],
    [/\bpostgres|sql|index|query\b/i, "#Database"],
    [/\bredis|cache\b/i, "#Caching"],
    [/\bkubernetes|k8s|docker\b/i, "#CloudNative"],
    [/\bci\/cd|github actions|pipeline\b/i, "#DevOps"],
    [/\bapi|rest|graphql\b/i, "#API"],
    [/\bauth|oauth|security|soc2\b/i, "#Security"],
  ];

  for (const [re, tag] of techKeywords) {
    if (re.test(text) && tags.size < 6) {
      tags.add(tag);
    }
  }

  return Array.from(tags).slice(0, 6);
}

function formatDateYmd(iso?: string | null): string {
  if (!iso) return new Date().toISOString().substring(0, 10);
  return iso.substring(0, 10);
}

export function normalizeGitHubPullRequestToDraft(
  pr: RawGitHubPullRequest,
  ownerRepo: string
): VisitorMessage {
  const cleanTitle = cleanText(pr.title, 180) || `PR #${pr.number}`;
  const cleanBody = cleanText(pr.body, 320);
  const combinedText = `${cleanTitle} ${cleanBody}`;
  const metric = extractQuantifiedMetric(combinedText);
  const projectName = ownerRepo.includes("/") ? ownerRepo.split("/")[1] : ownerRepo;
  const labels = (pr.labels || []).map((l) => l.name || "").filter(Boolean);
  const dateStr = formatDateYmd(pr.merged_at || pr.closed_at || pr.created_at);

  const statsNote =
    typeof pr.changed_files === "number"
      ? `${pr.changed_files} archivos modificados (+${pr.additions ?? 0}/-${pr.deletions ?? 0})`
      : "";

  const impact = metric
    ? `Impacto medido en PR #${pr.number}: ${metric}`
    : statsNote
    ? `Entregado a producción (${statsNote}) en ${ownerRepo}`
    : `Merge completado en ${ownerRepo} (PR #${pr.number}) listo para cuantificar con Google XYZ`;

  const draft: InboxAchievementDraft = {
    title: cleanTitle,
    client: ownerRepo.split("/")[0] || ownerRepo,
    project: projectName,
    category: inferCategoryFromText(combinedText),
    impact,
    whatWasSought: `Resolver y entregar PR #${pr.number} en ${ownerRepo}`,
    whyImportant: cleanBody || `Evolución clave de estabilidad, rendimiento o producto en ${projectName}`,
    howApplied: pr.head?.ref
      ? `Implementado y mergeado desde rama ${pr.head.ref} hacia ${pr.base?.ref || "main"}${statsNote ? ` (${statsNote})` : ""}`
      : `Implementado, revisado por pares y mergeado a ${pr.base?.ref || "main"}`,
    description: cleanBody || `Pull Request #${pr.number} mergeado en ${ownerRepo}.`,
    tags: extractTagsFromLabelsAndText(labels, combinedText, "#GitHubPR"),
    starDraft: {
      situation: `En el repositorio ${ownerRepo}, se requería abordar: ${cleanTitle}.`,
      task: `Diseñar e implementar el cambio mediante el PR #${pr.number} asegurando compatibilidad y pruebas.`,
      action: cleanBody || `Desarrollo de cambios técnicos (${statsNote || "code review y merge a main"}).`,
      result: impact,
    },
  };

  return {
    id: `ing-gh-${ownerRepo.replace(/[^a-zA-Z0-9_-]/g, "_")}-${pr.number}`,
    name: `GitHub · PR #${pr.number}`,
    email: pr.user?.login ? `${pr.user.login}@users.noreply.github.com` : "github-sync@goalrecall.local",
    organization: ownerRepo,
    message: `Detectamos el PR #${pr.number}: '${cleanTitle}'. ¿Convertir en logro Google XYZ?`,
    date: `${dateStr} 09:00`,
    read: false,
    replied: false,
    sourceType: "git_pr",
    sourceRef: `github:${ownerRepo}#${pr.number}`,
    sourceUrl: pr.html_url,
    repositoryOrProject: ownerRepo,
    achievementDraft: draft,
  };
}

export function normalizeGitHubEventToDraft(event: RawGitHubEvent): VisitorMessage | null {
  const repoName = event.repo?.name || "repositorio";
  if (event.type === "PullRequestEvent" && event.payload?.pull_request) {
    const pr = event.payload.pull_request;
    if (pr.merged_at || event.payload.action === "closed") {
      return normalizeGitHubPullRequestToDraft(pr, repoName);
    }
    return null;
  }

  if (event.type === "ReleaseEvent" && event.payload?.release) {
    const rel = event.payload.release;
    const title = cleanText(rel.name || rel.tag_name || "Nuevo Release", 140);
    const body = cleanText(rel.body, 280);
    const dateStr = formatDateYmd(event.created_at);
    return {
      id: `ing-gh-rel-${event.id}`,
      name: `GitHub · Release ${rel.tag_name || ""}`.trim(),
      email: event.actor?.login ? `${event.actor.login}@users.noreply.github.com` : "github-sync@goalrecall.local",
      organization: repoName,
      message: `Detectamos el Release ${rel.tag_name || title} en ${repoName}. ¿Convertir en logro Google XYZ?`,
      date: `${dateStr} 09:00`,
      read: false,
      replied: false,
      sourceType: "git_pr",
      sourceRef: `github:${repoName}:release:${rel.tag_name || event.id}`,
      sourceUrl: rel.html_url,
      repositoryOrProject: repoName,
      achievementDraft: {
        title: `Lanzamiento ${rel.tag_name || title} en ${repoName}`,
        client: repoName.split("/")[0] || repoName,
        project: repoName.split("/")[1] || repoName,
        category: "Infra/DevOps 🚀",
        impact: `Release ${rel.tag_name || title} desplegado exitosamente en ${repoName}`,
        description: body || `Publicación oficial de la versión ${rel.tag_name || title}.`,
        tags: extractTagsFromLabelsAndText([], `${title} ${body}`, "#Release"),
      },
    };
  }

  return null;
}

export function normalizeGitLabMergeRequestToDraft(
  mr: RawGitLabMergeRequest,
  projectPath: string
): VisitorMessage {
  const cleanTitle = cleanText(mr.title, 180) || `MR !${mr.iid}`;
  const cleanDesc = cleanText(mr.description, 320);
  const combinedText = `${cleanTitle} ${cleanDesc}`;
  const metric = extractQuantifiedMetric(combinedText);
  const projectName = projectPath.includes("/") ? projectPath.split("/").pop() || projectPath : projectPath;
  const dateStr = formatDateYmd(mr.merged_at || mr.updated_at || mr.created_at);

  const impact = metric
    ? `Impacto medido en MR !${mr.iid}: ${metric}`
    : `Merge Request !${mr.iid} integrado en ${projectPath}`;

  const draft: InboxAchievementDraft = {
    title: cleanTitle,
    client: projectPath.split("/")[0] || projectPath,
    project: projectName,
    category: inferCategoryFromText(combinedText),
    impact,
    whatWasSought: `Completar e integrar MR !${mr.iid} en ${projectPath}`,
    whyImportant: cleanDesc || `Mejora técnica validada en ${projectName}`,
    howApplied: mr.source_branch
      ? `Merge de rama ${mr.source_branch} hacia ${mr.target_branch || "main"}`
      : `Implementado e integrado a ${mr.target_branch || "main"}`,
    description: cleanDesc || `Merge Request !${mr.iid} en ${projectPath}.`,
    tags: extractTagsFromLabelsAndText(mr.labels || [], combinedText, "#GitLabMR"),
    starDraft: {
      situation: `En ${projectPath}, surgió la necesidad de: ${cleanTitle}.`,
      task: `Ejecutar el cambio mediante el Merge Request !${mr.iid} cumpliendo criterios técnicos.`,
      action: cleanDesc || `Desarrollo e integración en ${mr.target_branch || "main"}.`,
      result: impact,
    },
  };

  return {
    id: `ing-gl-${projectPath.replace(/[^a-zA-Z0-9_-]/g, "_")}-${mr.iid}`,
    name: `GitLab · MR !${mr.iid}`,
    email: mr.author?.username ? `${mr.author.username}@users.noreply.gitlab.com` : "gitlab-sync@goalrecall.local",
    organization: projectPath,
    message: `Detectamos el MR !${mr.iid}: '${cleanTitle}'. ¿Convertir en logro Google XYZ?`,
    date: `${dateStr} 09:00`,
    read: false,
    replied: false,
    sourceType: "gitlab_mr",
    sourceRef: `gitlab:${projectPath}!${mr.iid}`,
    sourceUrl: mr.web_url,
    repositoryOrProject: projectPath,
    achievementDraft: draft,
  };
}

export function normalizeJiraIssueToDraft(issue: RawJiraIssue, baseUrl: string): VisitorMessage {
  const fields = issue.fields || {};
  const summary = cleanText(fields.summary, 180) || issue.key;
  const description = cleanText(fields.description, 360);
  const projectKey = fields.project?.key || issue.key.split("-")[0] || "JIRA";
  const projectName = fields.project?.name || projectKey;
  const issueType = fields.issuetype?.name || "Task";
  const statusName = fields.status?.name || "Done";
  const components = (fields.components || []).map((c) => c.name || "").filter(Boolean);
  const labels = [...(fields.labels || []), ...components];
  const combinedText = `${summary} ${description} ${issueType}`;
  const metric = extractQuantifiedMetric(combinedText);
  const dateStr = formatDateYmd(fields.resolutiondate || fields.updated);

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const browseUrl = normalizedBase ? `${normalizedBase}/browse/${issue.key}` : undefined;
  const resultText = metric
    ? `Ticket ${issue.key} (${statusName}) con impacto: ${metric}`
    : `Ticket ${issue.key} (${issueType}) cerrado en estado '${statusName}' dentro de ${projectName}`;

  const draft: InboxAchievementDraft = {
    title: `[${issue.key}] ${summary}`,
    client: projectName,
    project: components[0] || projectKey,
    category: inferCategoryFromText(combinedText),
    impact: resultText,
    whatWasSought: `Cumplir el alcance del ticket ${issue.key} (${issueType}) en ${projectName}`,
    whyImportant: description || `Hito priorizado (${fields.priority?.name || "Sprint"}) resuelto para ${projectName}`,
    howApplied: `Resolución técnica y verificación de criterios de aceptación hasta estado ${statusName}`,
    description: description || `Ticket Jira ${issue.key}: ${summary}`,
    tags: extractTagsFromLabelsAndText(labels, combinedText, "#JiraDone"),
    starDraft: {
      situation: `En ${projectName} (${components[0] || projectKey}), se identificó la necesidad: ${summary}.`,
      task: `Llevar el ticket ${issue.key} (${issueType}) hasta '${statusName}' cumpliendo criterios de aceptación.`,
      action: description || `Ejecución técnica, pruebas y validación integral del requerimiento ${issue.key}.`,
      result: resultText,
    },
  };

  return {
    id: `ing-jira-${issue.key.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    name: `Jira · ${issue.key} (${statusName})`,
    email: "jira-sync@goalrecall.local",
    organization: projectName,
    message: `Ticket resuelto ${issue.key}: '${summary}'. Borrador STAR y Google XYZ listo para convertir en logro.`,
    date: `${dateStr} 09:00`,
    read: false,
    replied: false,
    sourceType: "jira_issue",
    sourceRef: `jira:${issue.key}`,
    sourceUrl: browseUrl,
    repositoryOrProject: projectName,
    achievementDraft: draft,
  };
}

export function buildDemoEcosystemSuggestions(source: "all" | "github" | "jira" = "all"): VisitorMessage[] {
  const demoPr = normalizeGitHubPullRequestToDraft(
    {
      id: 9142,
      number: 142,
      title: "Optimizada query de liquidaciones con índice compuesto (-68% p99 latency)",
      body: "Se agregó índice compuesto en PostgreSQL sobre (tenant_id, settled_at DESC) reduciendo el tiempo de consulta de 940ms a 295ms bajo carga pico.",
      html_url: "https://github.com/acme/payments-core/pull/142",
      merged_at: new Date().toISOString(),
      user: { login: "devlead" },
      labels: [{ name: "performance" }, { name: "postgres" }],
      head: { ref: "perf/settlements-index" },
      base: { ref: "main" },
      additions: 84,
      deletions: 19,
      changed_files: 4,
    },
    "acme/payments-core"
  );

  const demoJira = normalizeJiraIssueToDraft(
    {
      id: "418",
      key: "CORE-418",
      fields: {
        summary: "Implementar circuit breaker e idempotencia en webhook de facturación",
        description:
          "Criterio de aceptación: 0 cobros duplicados ante reintentos y recuperación automática en <15s usando Redis idempotency keys.",
        issuetype: { name: "Story" },
        status: { name: "Done" },
        priority: { name: "High" },
        project: { key: "CORE", name: "Checkout Platform" },
        components: [{ name: "Billing" }],
        labels: ["resilience", "redis"],
        resolutiondate: new Date().toISOString(),
      },
    },
    "https://acme.atlassian.net"
  );

  if (source === "github") return [demoPr];
  if (source === "jira") return [demoJira];
  return [demoPr, demoJira];
}
