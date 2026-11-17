import React, { useState } from "react";
import {
  GitPullRequest,
  GitBranch,
  Ticket,
  RefreshCw,
  Sparkles,
  KeyRound,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { VisitorMessage } from "../../types";

type EcosystemProvider = "github" | "gitlab" | "jira";

interface EcosystemIngestPanelProps {
  defaultGitHubHandle?: string;
  onIngestSuggestions: (
    suggestions: VisitorMessage[]
  ) => { addedCount: number; skippedCount: number };
}

export const EcosystemIngestPanel: React.FC<EcosystemIngestPanelProps> = ({
  defaultGitHubHandle,
  onIngestSuggestions,
}) => {
  const cleanInitialHandle = defaultGitHubHandle
    ? defaultGitHubHandle.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/+$/, "")
    : "";

  const [provider, setProvider] = useState<EcosystemProvider>("github");
  const [githubMode, setGithubMode] = useState<"repo" | "user">("repo");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubUser, setGithubUser] = useState(cleanInitialHandle);
  const [gitlabProject, setGitlabProject] = useState("");
  const [gitlabBaseUrl, setGitlabBaseUrl] = useState("https://gitlab.com");
  const [jiraBaseUrl, setJiraBaseUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraProjectKey, setJiraProjectKey] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [gitToken, setGitToken] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSyncNote, setLastSyncNote] = useState<string | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLastSyncNote(null);
    setIsLoading(true);

    try {
      let endpoint = "/api/integrations/github/sync";
      let payload: Record<string, unknown> = {};

      if (provider === "github") {
        payload =
          githubMode === "repo"
            ? { repo: githubRepo.trim(), token: gitToken.trim() || undefined, limit: 10 }
            : { username: githubUser.trim(), token: gitToken.trim() || undefined, limit: 10 };
      } else if (provider === "gitlab") {
        endpoint = "/api/integrations/gitlab/sync";
        payload = {
          projectPath: gitlabProject.trim(),
          baseUrl: gitlabBaseUrl.trim() || "https://gitlab.com",
          token: gitToken.trim() || undefined,
          limit: 10,
        };
      } else {
        endpoint = "/api/integrations/jira/sync";
        payload = {
          baseUrl: jiraBaseUrl.trim(),
          email: jiraEmail.trim(),
          apiToken: jiraToken.trim() || undefined,
          projectKey: jiraProjectKey.trim() || undefined,
          limit: 10,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "No se pudo sincronizar con el proveedor.");
        return;
      }

      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      if (suggestions.length === 0) {
        setLastSyncNote("Sin PRs/tickets cerrados recientes para importar.");
        return;
      }

      const result = onIngestSuggestions(suggestions);
      setLastSyncNote(
        result.addedCount > 0
          ? `${result.addedCount} borrador(es) agregados al Inbox.`
          : "Sugerencias ya sincronizadas previamente."
      );
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error de red al conectar con el servidor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoIngest = async () => {
    setErrorMsg(null);
    setLastSyncNote(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/integrations/demo-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "all" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "No se pudo generar la muestra de ingesta.");
        return;
      }
      const result = onIngestSuggestions(data.suggestions || []);
      setLastSyncNote(
        result.addedCount > 0
          ? `${result.addedCount} borradores de muestra (PR #142 + CORE-418) cargados.`
          : "Los borradores de muestra ya están en tu Inbox."
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al cargar muestra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Ingesta Automática Git &amp; Jira</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Convierte PRs/MRs mergeados y tickets resueltos en borradores Google XYZ y STAR listos para tu bitácora.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDemoIngest}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Probar con muestra PR + Jira</span>
        </button>
      </div>

      {/* Provider Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="inline-flex items-center p-1 bg-[#080C14] border border-slate-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => {
              setProvider("github");
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              provider === "github"
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProvider("gitlab");
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              provider === "gitlab"
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitLab</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setProvider("jira");
              setErrorMsg(null);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              provider === "jira"
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Jira Cloud</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAuth((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{provider === "jira" ? "Credenciales de sesión" : "Token opcional (repos privados)"}</span>
          {showAuth || provider === "jira" ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <form onSubmit={handleSync} className="space-y-3">
        {provider === "github" && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={githubMode}
              onChange={(e) => setGithubMode(e.target.value as "repo" | "user")}
              aria-label="Modo de búsqueda en GitHub"
              className="px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="repo">Repositorio (owner/repo)</option>
              <option value="user">Actividad de Usuario</option>
            </select>
            <input
              type="text"
              value={githubMode === "repo" ? githubRepo : githubUser}
              onChange={(e) =>
                githubMode === "repo"
                  ? setGithubRepo(e.target.value)
                  : setGithubUser(e.target.value)
              }
              placeholder={
                githubMode === "repo" ? "Ej: vercel/next.js" : "Ej: octocat"
              }
              className="flex-1 px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sincronizar PRs</span>
            </button>
          </div>
        )}

        {provider === "gitlab" && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={gitlabProject}
              onChange={(e) => setGitlabProject(e.target.value)}
              placeholder="Proyecto GitLab (ej: gitlab-org/gitlab)"
              className="flex-1 px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <input
              type="url"
              value={gitlabBaseUrl}
              onChange={(e) => setGitlabBaseUrl(e.target.value)}
              placeholder="https://gitlab.com"
              className="sm:w-48 px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sincronizar MRs</span>
            </button>
          </div>
        )}

        {provider === "jira" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="url"
              value={jiraBaseUrl}
              onChange={(e) => setJiraBaseUrl(e.target.value)}
              placeholder="https://tu-org.atlassian.net"
              className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <input
              type="text"
              value={jiraProjectKey}
              onChange={(e) => setJiraProjectKey(e.target.value)}
              placeholder="Proyecto (opcional, ej: CORE)"
              className="px-3 py-2 rounded-lg bg-[#080C14] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Traer Done</span>
            </button>
          </div>
        )}

        {(showAuth || provider === "jira") && (
          <div className="pt-2 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {provider === "jira" ? (
              <>
                <input
                  type="email"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  placeholder="Email de cuenta Atlassian"
                  className="px-3 py-2 rounded-lg bg-[#080C14] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
                <input
                  type="password"
                  value={jiraToken}
                  onChange={(e) => setJiraToken(e.target.value)}
                  placeholder="Jira API Token (solo sesión actual)"
                  className="px-3 py-2 rounded-lg bg-[#080C14] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
                />
              </>
            ) : (
              <input
                type="password"
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                placeholder={
                  provider === "github"
                    ? "GitHub PAT opcional (no se almacena en servidor)"
                    : "GitLab Personal Access Token opcional"
                }
                className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#080C14] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            )}
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lastSyncNote && !errorMsg && (
          <p className="text-[11px] font-mono text-emerald-400">{lastSyncNote}</p>
        )}
      </form>
    </section>
  );
};
