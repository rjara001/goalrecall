import React, { useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  Github,
  ShieldCheck,
} from "lucide-react";
import {
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
} from "../../types";
import {
  buildLiveSvgBadgeUrl,
  DEFAULT_GITHUB_EXPORT_OPTIONS,
  generateEmbedWidgetSnippet,
  generateGitHubProfileMarkdown,
  GitHubProfileExportOptions,
  resolvePublicHandle,
  selectTopPublicLogs,
} from "../../utils/githubProfileGenerator";

interface GitHubProfileExportPanelProps {
  user: UserProfile;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
}

export const GitHubProfileExportPanel: React.FC<
  GitHubProfileExportPanelProps
> = ({ user, logs, products, certifications }) => {
  const [options, setOptions] = useState<GitHubProfileExportOptions>(
    DEFAULT_GITHUB_EXPORT_OPTIONS
  );
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://goalrecall.com";
  const handle = resolvePublicHandle(user);

  const publicLogs = useMemo(() => logs.filter((l) => l.isPublic === true), [logs]);
  const publicProducts = useMemo(
    () => products.filter((p) => p.isPublic !== false),
    [products]
  );
  const publicCertifications = useMemo(
    () => certifications.filter((c) => c.isPublic !== false),
    [certifications]
  );

  const markdown = useMemo(
    () =>
      generateGitHubProfileMarkdown({
        user,
        logs: publicLogs,
        products: publicProducts,
        certifications: publicCertifications,
        baseUrl: origin,
        options,
      }),
    [user, publicLogs, publicProducts, publicCertifications, origin, options]
  );

  const embedSnippet = useMemo(
    () => generateEmbedWidgetSnippet(origin, handle, user.name),
    [origin, handle, user.name]
  );

  const liveSvgUrl = useMemo(
    () => buildLiveSvgBadgeUrl(origin, handle, "card"),
    [origin, handle]
  );

  const topLogSample = useMemo(
    () => selectTopPublicLogs(publicLogs, 1)[0],
    [publicLogs]
  );

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2400);
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2400);
  };

  return (
    <div className="space-y-5 text-xs">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <Github className="w-4 h-4 text-cyan-400" />
            <span>Generador de Perfil GitHub / GitLab (README.md)</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Solo contenido público</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Pega este bloque en tu repositorio especial{" "}
          <span className="font-mono text-slate-200">
            github.com/{handle}/{handle}/README.md
          </span>{" "}
          para exhibir tus top victorias Google XYZ, certificaciones verificadas y enlace a First Mate AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeTopLogs}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeTopLogs: e.target.checked,
                }))
              }
              className="rounded border-slate-700 bg-slate-950 text-emerald-500"
            />
            <span>Top {options.maxTopLogs} logros XYZ ({publicLogs.length})</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeCertifications}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeCertifications: e.target.checked,
                }))
              }
              className="rounded border-slate-700 bg-slate-950 text-emerald-500"
            />
            <span>Certificaciones ({publicCertifications.length})</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeProducts}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeProducts: e.target.checked,
                }))
              }
              className="rounded border-slate-700 bg-slate-950 text-emerald-500"
            />
            <span>Productos & Showcase ({publicProducts.length})</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeFirstMateCta}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  includeFirstMateCta: e.target.checked,
                }))
              }
              className="rounded border-slate-700 bg-slate-950 text-emerald-500"
            />
            <span>Enlace a First Mate AI</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium">Formato de badges:</span>
          <button
            type="button"
            onClick={() =>
              setOptions((prev) => ({ ...prev, badgeStyle: "shields" }))
            }
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border whitespace-nowrap transition-colors ${
              options.badgeStyle === "shields"
                ? "bg-emerald-950/70 border-emerald-600 text-emerald-300 font-semibold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Shields.io Estático
          </button>
          <button
            type="button"
            onClick={() =>
              setOptions((prev) => ({ ...prev, badgeStyle: "live_svg" }))
            }
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border whitespace-nowrap transition-colors ${
              options.badgeStyle === "live_svg"
                ? "bg-cyan-950/70 border-cyan-600 text-cyan-300 font-semibold"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Tarjeta SVG Dinámica
          </button>
        </div>
      </div>

      {/* Badge Summary Preview */}
      <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono text-slate-400">Vista previa de tarjeta SVG</span>
          <span className="font-mono tabular-nums text-emerald-400 truncate max-w-[260px]">
            /api/public/u/{handle}/badge.svg
          </span>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-white truncate">
              {user.name || "Profesional Técnico"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 whitespace-nowrap">
              VERIFIED DECK
            </span>
          </div>
          <p className="text-[11px] font-mono tabular-nums text-slate-400">
            {publicLogs.length} logros públicos · {publicCertifications.length} certificaciones ·{" "}
            {publicProducts.length} productos
          </p>
          {topLogSample?.impact && (
            <p className="text-[11px] font-mono text-emerald-300 truncate">
              {topLogSample.impact}
            </p>
          )}
        </div>
        {options.badgeStyle === "live_svg" && (
          <p className="text-[10px] font-mono text-slate-500 break-all">
            Endpoint: {liveSvgUrl}
          </p>
        )}
      </div>

      {/* Markdown Output */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-white">Código Markdown para README.md</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadReadme}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar README.md</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="p-3.5 rounded-xl bg-[#070A11] border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56 whitespace-pre-wrap leading-relaxed">
          {markdown}
        </pre>
      </div>

      {/* Embeddable Widget Snippet */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Widget Embebible para Portafolio / Notion</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmbed}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors"
          >
            {copiedEmbed ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar HTML Embed</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-2.5 rounded-lg bg-[#070A11] border border-slate-800/80 text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap break-all">
          {embedSnippet}
        </pre>
      </div>
    </div>
  );
};
