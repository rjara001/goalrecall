import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { LogEntry, WorkExperience } from "../../types";
import { isLogIncludedInCv } from "../../utils/bulletToLogMapper";
import { formatRelativeUpdatedTime } from "./timelineUtils";

interface RecentEditedLogsSelectorProps {
  recentLogs: LogEntry[];
  fallbackLogs?: LogEntry[];
  experiences: WorkExperience[];
  nowMs: number;
  language: string;
  onSelectLog: (log: LogEntry) => void;
}

export const RecentEditedLogsSelector: React.FC<RecentEditedLogsSelectorProps> = ({
  recentLogs,
  fallbackLogs = [],
  experiences,
  nowMs,
  language,
  onSelectLog,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const experienceNameById = useMemo(() => {
    const map = new Map<string, string>();
    experiences.forEach((exp) => {
      map.set(exp.id, exp.company);
    });
    return map;
  }, [experiences]);

  const hasRecent = recentLogs.length > 0;
  const itemsToRender = hasRecent ? recentLogs : fallbackLogs;

  const resolveCompanyLabel = (log: LogEntry): string => {
    if (log.experienceId && experienceNameById.has(log.experienceId)) {
      return experienceNameById.get(log.experienceId) || log.client;
    }
    return log.client || "General";
  };

  const buttonLabel = language === "en" ? "Edited (8h)" : "Editados (8 h)";

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
          hasRecent
            ? "bg-cyan-950/50 hover:bg-cyan-950/80 border-cyan-500/40 text-cyan-200"
            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
        }`}
        title={
          language === "en"
            ? "Quick jump to achievements edited in the last 8 hours"
            : "Ir rápido a los logros editados en las últimas 8 horas"
        }
      >
        <Clock
          className={`w-3.5 h-3.5 shrink-0 ${
            hasRecent ? "text-cyan-400" : "text-slate-400"
          }`}
        />
        <span>{buttonLabel}</span>
        <span
          className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
            hasRecent
              ? "bg-cyan-900/70 text-cyan-200"
              : "bg-slate-900/90 text-slate-400"
          }`}
        >
          {recentLogs.length}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B101D] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50"
        >
          <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-300">
              {hasRecent
                ? language === "en"
                  ? `Updated in last 8h (${recentLogs.length})`
                  : `Actualizados últimas 8 h (${recentLogs.length})`
                : language === "en"
                  ? "No edits in the last 8h"
                  : "Sin cambios en las últimas 8 h"}
            </span>
            {!hasRecent && itemsToRender.length > 0 && (
              <span className="text-[10px] font-mono text-slate-500">
                {language === "en" ? "Previous edits" : "Ediciones previas"}
              </span>
            )}
          </div>

          {itemsToRender.length === 0 ? (
            <div className="px-3.5 py-4 text-xs text-slate-400 text-center">
              {language === "en"
                ? "Edit or create an achievement to see it listed here."
                : "Edita o crea un logro para verlo listado aquí."}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {itemsToRender.map((log) => {
                const relTime = formatRelativeUpdatedTime(log.updatedAt, nowMs, language);
                const inCv = isLogIncludedInCv(log);
                return (
                  <button
                    key={log.id}
                    type="button"
                    role="option"
                    onClick={() => {
                      setIsOpen(false);
                      onSelectLog(log);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/70 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-medium text-slate-100 group-hover:text-cyan-200 truncate transition-colors">
                        {log.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {resolveCompanyLabel(log)}
                        <span aria-hidden="true" className="mx-1.5 text-slate-600">
                          ·
                        </span>
                        <span className={inCv ? "text-slate-400" : "text-amber-300/90"}>
                          {inCv
                            ? language === "en"
                              ? "In CV"
                              : "En CV"
                            : language === "en"
                              ? "Logbook only"
                              : "Solo Bitácora"}
                        </span>
                      </p>
                    </div>
                    {relTime && (
                      <span
                        className={`text-[11px] font-mono tabular-nums shrink-0 mt-0.5 ${
                          hasRecent ? "text-cyan-300" : "text-slate-500"
                        }`}
                      >
                        {relTime}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
