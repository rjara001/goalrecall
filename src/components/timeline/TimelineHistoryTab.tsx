import React, { useMemo, useState } from "react";
import {
  Building,
  Clock,
  History,
  Loader2,
  RotateCcw,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { LogEntry, WorkExperience } from "../../types";
import { useI18n } from "../../i18n";
import {
  formatHistoryButtonLabel,
  normalizeRevisionUpdatesCount,
} from "../../utils/revisions/snapshot";
import { formatRelativeUpdatedTime } from "./timelineUtils";
import { formatExperiencePeriod } from "../../utils/experienceDateUtils";

interface TimelineHistoryTabProps {
  logs: LogEntry[];
  deletedLogs: LogEntry[];
  experiences: WorkExperience[];
  deletedExperiences: WorkExperience[];
  nowMs: number;
  onRestoreDeletedLog?: (id: string) => Promise<unknown> | void;
  onRestoreDeletedExperience?: (id: string) => Promise<unknown> | void;
  onRequestPermanentDeleteLog?: (log: LogEntry) => void;
  onRequestPermanentDeleteExperience?: (exp: WorkExperience) => void;
  onOpenLogHistory?: (entry: LogEntry) => void;
  onOpenExperienceHistory?: (exp: WorkExperience) => void;
}

type HistoryFilterScope = "all" | "deleted" | "experiences" | "logs";

function formatShortDateTime(ms?: number, language: string = "es"): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return null;
  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}

function matchesExperienceSearch(exp: WorkExperience, query: string): boolean {
  if (!query) return true;
  const haystacks = [
    exp.company,
    exp.role,
    exp.location || "",
    exp.summary || "",
    exp.startDate || "",
    exp.endDate || "",
    ...(exp.bullets || []),
    ...(exp.technologies || []),
  ];
  return haystacks.some((item) => item.toLowerCase().includes(query));
}

function matchesLogSearch(log: LogEntry, query: string): boolean {
  if (!query) return true;
  const haystacks = [
    log.title,
    log.impact,
    log.client,
    log.project,
    log.category,
    log.date,
    log.description || "",
    log.whatWasSought || "",
    log.whyImportant || "",
    log.howApplied || "",
    ...(log.tags || []),
  ];
  return haystacks.some((item) => item.toLowerCase().includes(query));
}

export const TimelineHistoryTab: React.FC<TimelineHistoryTabProps> = ({
  logs,
  deletedLogs,
  experiences,
  deletedExperiences,
  nowMs,
  onRestoreDeletedLog,
  onRestoreDeletedExperience,
  onRequestPermanentDeleteLog,
  onRequestPermanentDeleteExperience,
  onOpenLogHistory,
  onOpenExperienceHistory,
}) => {
  const { language } = useI18n();
  const isEn = language === "en";
  const historyLang: "en" | "es" = isEn ? "en" : "es";

  const [search, setSearch] = useState("");
  const [filterScope, setFilterScope] = useState<HistoryFilterScope>("all");
  const [onlyWithVersions, setOnlyWithVersions] = useState(false);
  const [restoringIds, setRestoringIds] = useState<Record<string, boolean>>({});

  const query = search.trim().toLowerCase();

  const totalDeletedCount = deletedExperiences.length + deletedLogs.length;

  const filteredDeletedItems = useMemo(() => {
    if (filterScope !== "all" && filterScope !== "deleted" && filterScope !== "experiences" && filterScope !== "logs") {
      return [];
    }

    const expItems =
      filterScope === "logs"
        ? []
        : deletedExperiences
            .filter((exp) => matchesExperienceSearch(exp, query))
            .filter((exp) => !onlyWithVersions || normalizeRevisionUpdatesCount(exp.updatesCount) > 0)
            .map((exp) => ({
              kind: "experience" as const,
              id: exp.id,
              timestamp: exp.deletedAt || exp.updatedAt || exp.createdAt || 0,
              exp,
            }));

    const logItems =
      filterScope === "experiences"
        ? []
        : deletedLogs
            .filter((log) => matchesLogSearch(log, query))
            .filter((log) => !onlyWithVersions || normalizeRevisionUpdatesCount(log.updatesCount) > 0)
            .map((log) => ({
              kind: "log" as const,
              id: log.id,
              timestamp: log.deletedAt || log.updatedAt || log.createdAt || 0,
              log,
            }));

    return [...expItems, ...logItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [deletedExperiences, deletedLogs, filterScope, onlyWithVersions, query]);

  const filteredActiveItems = useMemo(() => {
    if (filterScope === "deleted") return [];

    const expItems =
      filterScope === "logs"
        ? []
        : experiences
            .filter((exp) => matchesExperienceSearch(exp, query))
            .filter((exp) => !onlyWithVersions || normalizeRevisionUpdatesCount(exp.updatesCount) > 0)
            .map((exp) => ({
              kind: "experience" as const,
              id: exp.id,
              updatesCount: normalizeRevisionUpdatesCount(exp.updatesCount),
              timestamp: exp.updatedAt || exp.createdAt || 0,
              exp,
            }));

    const logItems =
      filterScope === "experiences"
        ? []
        : logs
            .filter((log) => matchesLogSearch(log, query))
            .filter((log) => !onlyWithVersions || normalizeRevisionUpdatesCount(log.updatesCount) > 0)
            .map((log) => ({
              kind: "log" as const,
              id: log.id,
              updatesCount: normalizeRevisionUpdatesCount(log.updatesCount),
              timestamp: log.updatedAt || log.createdAt || 0,
              log,
            }));

    return [...expItems, ...logItems].sort((a, b) => {
      const aHas = a.updatesCount > 0 ? 1 : 0;
      const bHas = b.updatesCount > 0 ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;
      return b.timestamp - a.timestamp;
    });
  }, [experiences, logs, filterScope, onlyWithVersions, query]);

  const handleRestoreExperience = async (id: string) => {
    if (!onRestoreDeletedExperience || restoringIds[`exp:${id}`]) return;
    setRestoringIds((prev) => ({ ...prev, [`exp:${id}`]: true }));
    try {
      await onRestoreDeletedExperience(id);
    } finally {
      setRestoringIds((prev) => {
        const next = { ...prev };
        delete next[`exp:${id}`];
        return next;
      });
    }
  };

  const handleRestoreLog = async (id: string) => {
    if (!onRestoreDeletedLog || restoringIds[`log:${id}`]) return;
    setRestoringIds((prev) => ({ ...prev, [`log:${id}`]: true }));
    try {
      await onRestoreDeletedLog(id);
    } finally {
      setRestoringIds((prev) => {
        const next = { ...prev };
        delete next[`log:${id}`];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>
                {isEn
                  ? "Version History & Recovery"
                  : "Historial de Versiones y Recuperación"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isEn
                ? "Search deleted experiences or achievements to recover them, or inspect and compare saved versions across your timeline."
                : "Busca experiencias o logros eliminados para recuperarlos, o abre el detalle de cualquier registro para buscar y comparar versiones."}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none shrink-0 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={onlyWithVersions}
              onChange={(e) => setOnlyWithVersions(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
            />
            <span>
              {isEn ? "Only with saved versions" : "Solo con versiones guardadas"}
            </span>
          </label>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isEn
                  ? "Search deleted experiences, deleted achievements, company, role, tags..."
                  : "Buscar experiencias eliminadas, logros eliminados o historial de versiones..."
              }
              className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={isEn ? "Clear search" : "Limpiar búsqueda"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            {(
              [
                { key: "all", label: isEn ? "All" : "Todo" },
                {
                  key: "deleted",
                  label: isEn
                    ? `Deleted (${totalDeletedCount})`
                    : `Eliminados (${totalDeletedCount})`,
                },
                { key: "experiences", label: isEn ? "Experiences" : "Experiencias" },
                { key: "logs", label: isEn ? "Achievements" : "Logros" },
              ] as const
            ).map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setFilterScope(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterScope === btn.key
                    ? btn.key === "deleted"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Deleted & Recoverable Items */}
      {(filterScope === "deleted" || filteredDeletedItems.length > 0 || totalDeletedCount > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Deleted & Recoverable (${filteredDeletedItems.length})`
                  : `Eliminados y Recuperables (${filteredDeletedItems.length})`}
              </span>
            </h4>
          </div>

          {filteredDeletedItems.length === 0 ? (
            <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center space-y-1.5">
              <p className="text-xs font-medium text-slate-300">
                {totalDeletedCount === 0
                  ? isEn
                    ? "No deleted experiences or achievements right now."
                    : "No tienes experiencias ni logros eliminados en este momento."
                  : isEn
                    ? "No deleted items match the current search or filter."
                    : "Ningún elemento eliminado coincide con tu búsqueda o filtro."}
              </p>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? "When you delete an experience or achievement, it stays here with all its versions so you can recover it anytime."
                  : "Cuando elimines una experiencia o un logro, quedará aquí con todas sus versiones para recuperarlo cuando quieras."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredDeletedItems.map((item) => {
                if (item.kind === "experience") {
                  const exp = item.exp;
                  const updatesCount = normalizeRevisionUpdatesCount(exp.updatesCount);
                  const isRestoring = Boolean(restoringIds[`exp:${exp.id}`]);
                  const relDeleted = formatRelativeUpdatedTime(exp.deletedAt, nowMs, language);
                  const absDeleted = formatShortDateTime(exp.deletedAt, language);

                  return (
                    <div
                      key={`deleted-exp-${exp.id}`}
                      className="p-4 rounded-2xl bg-[#0D1322] border border-amber-800/50 hover:border-amber-600/60 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {isEn ? "Deleted experience" : "Experiencia eliminada"}
                            </span>
                            {updatesCount > 0 && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-mono tabular-nums">
                                {updatesCount} {updatesCount === 1 ? "cambio" : "cambios"} · v
                                {updatesCount + 1}
                              </span>
                            )}
                            {relDeleted && (
                              <span
                                className="text-[11px] text-slate-400 font-mono inline-flex items-center gap-1"
                                title={absDeleted || undefined}
                              >
                                <Clock className="w-3 h-3 text-slate-500" />
                                {isEn ? `Deleted ${relDeleted}` : `Eliminado ${relDeleted}`}
                              </span>
                            )}
                          </div>

                          <h5 className="text-sm font-bold text-white">
                            {exp.role} <span className="text-slate-400 font-normal">@</span>{" "}
                            <span className="text-cyan-300">{exp.company}</span>
                          </h5>

                          <p className="text-xs text-slate-400">
                            {formatExperiencePeriod(exp, { language })}
                            {exp.location ? ` · ${exp.location}` : ""}
                            {(exp.bullets?.length || 0) > 0
                              ? ` · ${exp.bullets!.length} ${isEn ? "bullets" : "viñetas"}`
                              : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {onRestoreDeletedExperience && (
                            <button
                              type="button"
                              disabled={isRestoring}
                              onClick={() => void handleRestoreExperience(exp.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              {isRestoring ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                              <span>{isEn ? "Recover" : "Recuperar"}</span>
                            </button>
                          )}

                          {onOpenExperienceHistory && (
                            <button
                              type="button"
                              onClick={() => onOpenExperienceHistory(exp)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <History className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{formatHistoryButtonLabel(exp.updatesCount, historyLang)}</span>
                            </button>
                          )}

                          {onRequestPermanentDeleteExperience && (
                            <button
                              type="button"
                              onClick={() => onRequestPermanentDeleteExperience(exp)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                              title={
                                isEn ? "Delete permanently" : "Eliminar definitivamente"
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isEn ? "Purge" : "Eliminar definitivamente"}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                          {exp.bullets.slice(0, 2).map((bullet, idx) => (
                            <p
                              key={idx}
                              className="text-[11px] text-slate-300 line-clamp-1"
                            >
                              • {bullet}
                            </p>
                          ))}
                          {exp.bullets.length > 2 && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              +{exp.bullets.length - 2}{" "}
                              {isEn ? "more bullets stored" : "viñetas más guardadas"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                const log = item.log;
                const updatesCount = normalizeRevisionUpdatesCount(log.updatesCount);
                const isRestoring = Boolean(restoringIds[`log:${log.id}`]);
                const relDeleted = formatRelativeUpdatedTime(log.deletedAt, nowMs, language);
                const absDeleted = formatShortDateTime(log.deletedAt, language);

                return (
                  <div
                    key={`deleted-log-${log.id}`}
                    className="p-4 rounded-2xl bg-[#0D1322] border border-amber-800/50 hover:border-amber-600/60 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {isEn ? "Deleted achievement" : "Logro eliminado"}
                          </span>
                          <span className="text-[11px] font-mono text-cyan-400">
                            {log.client} · {log.date}
                          </span>
                          {updatesCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-mono tabular-nums">
                              {updatesCount} {updatesCount === 1 ? "cambio" : "cambios"} · v
                              {updatesCount + 1}
                            </span>
                          )}
                          {relDeleted && (
                            <span
                              className="text-[11px] text-slate-400 font-mono inline-flex items-center gap-1"
                              title={absDeleted || undefined}
                            >
                              <Clock className="w-3 h-3 text-slate-500" />
                              {isEn ? `Deleted ${relDeleted}` : `Eliminado ${relDeleted}`}
                            </span>
                          )}
                        </div>

                        <h5 className="text-sm font-bold text-white line-clamp-2 break-words">
                          {log.title || log.impact}
                        </h5>
                        {log.impact && log.impact !== log.title && (
                          <p className="text-xs text-slate-400 line-clamp-2">{log.impact}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {onRestoreDeletedLog && (
                          <button
                            type="button"
                            disabled={isRestoring}
                            onClick={() => void handleRestoreLog(log.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                            <span>{isEn ? "Recover" : "Recuperar"}</span>
                          </button>
                        )}

                        {onOpenLogHistory && (
                          <button
                            type="button"
                            onClick={() => onOpenLogHistory(log)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{formatHistoryButtonLabel(log.updatesCount, historyLang)}</span>
                          </button>
                        )}

                        {onRequestPermanentDeleteLog && (
                          <button
                            type="button"
                            onClick={() => onRequestPermanentDeleteLog(log)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/60 text-red-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            title={
                              isEn ? "Delete permanently" : "Eliminar definitivamente"
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isEn ? "Purge" : "Eliminar definitivamente"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Section 2: Active Items Version History */}
      {filterScope !== "deleted" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `Active Timeline Versions (${filteredActiveItems.length})`
                  : `Versiones de Registros Activos (${filteredActiveItems.length})`}
              </span>
            </h4>
          </div>

          {filteredActiveItems.length === 0 ? (
            <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-center space-y-1.5">
              <p className="text-xs font-medium text-slate-300">
                {isEn
                  ? "No active records match your search or filter."
                  : "Ningún registro activo coincide con tu búsqueda o filtro."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredActiveItems.map((item) => {
                if (item.kind === "experience") {
                  const exp = item.exp;
                  const relUpdated = formatRelativeUpdatedTime(item.timestamp, nowMs, language);

                  return (
                    <div
                      key={`active-exp-${exp.id}`}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-[10px] font-mono font-semibold inline-flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {isEn ? "Experience" : "Experiencia"}
                          </span>
                          <span className="text-[11px] font-mono tabular-nums text-slate-400">
                            {item.updatesCount > 0
                              ? `${item.updatesCount} ${item.updatesCount === 1 ? "cambio" : "cambios"} · v${item.updatesCount + 1}`
                              : isEn
                                ? "Initial state"
                                : "Estado inicial"}
                          </span>
                        </div>

                        <h5 className="text-sm font-bold text-white line-clamp-1">
                          {exp.role} @ {exp.company}
                        </h5>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {exp.summary ||
                            (exp.bullets && exp.bullets[0]) ||
                            formatExperiencePeriod(exp, { language })}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {relUpdated
                            ? isEn
                              ? `Updated ${relUpdated}`
                              : `Editado ${relUpdated}`
                            : formatExperiencePeriod(exp, { language })}
                        </span>

                        {onOpenExperienceHistory && (
                          <button
                            type="button"
                            onClick={() => onOpenExperienceHistory(exp)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                            <span>
                              {item.updatesCount > 0
                                ? formatHistoryButtonLabel(exp.updatesCount, historyLang)
                                : isEn
                                  ? "Inspect versions"
                                  : "Ver versiones"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                const log = item.log;
                const relUpdated = formatRelativeUpdatedTime(item.timestamp, nowMs, language);

                return (
                  <div
                    key={`active-log-${log.id}`}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300 text-[10px] font-mono font-semibold inline-flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {isEn ? "Achievement" : "Logro"}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {item.updatesCount > 0
                            ? `${item.updatesCount} ${item.updatesCount === 1 ? "cambio" : "cambios"} · v${item.updatesCount + 1}`
                            : isEn
                              ? "Initial state"
                              : "Estado inicial"}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-white line-clamp-2 break-words">
                        {log.title || log.impact}
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {log.client} · {log.date}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {relUpdated
                          ? isEn
                            ? `Updated ${relUpdated}`
                            : `Editado ${relUpdated}`
                          : log.date}
                      </span>

                      {onOpenLogHistory && (
                        <button
                          type="button"
                          onClick={() => onOpenLogHistory(log)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {item.updatesCount > 0
                              ? formatHistoryButtonLabel(log.updatesCount, historyLang)
                              : isEn
                                ? "Inspect versions"
                                : "Ver versiones"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
