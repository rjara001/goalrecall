import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Columns2,
  Eye,
  EyeOff,
  GitCompare,
  Rows3,
  RotateCcw,
  X,
} from "lucide-react";
import { EntityRevision } from "../../types";
import { DiffModalState } from "../../hooks/useAppModals";
import {
  buildRevisionFieldDiffs,
  RevisionFieldDiff,
  WordDiffSegment,
} from "../../utils/revisions/diff";
import { formatRevisionOriginLabel } from "../../utils/revisions/snapshot";

interface RevisionDiffModalProps {
  state: DiffModalState | null;
  onClose: () => void;
  onRestoreRevision: (revision: EntityRevision) => void;
}

type DiffLayoutMode = "side_by_side" | "unified";

function formatShortDate(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  try {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleDateString();
  }
}

function getStatusBadge(status: RevisionFieldDiff["status"]): {
  label: string;
  classes: string;
} {
  switch (status) {
    case "added":
      return {
        label: "Añadido",
        classes: "bg-emerald-950/70 border-emerald-700/60 text-emerald-300",
      };
    case "removed":
      return {
        label: "Eliminado",
        classes: "bg-rose-950/70 border-rose-700/60 text-rose-300",
      };
    case "modified":
      return {
        label: "Modificado",
        classes: "bg-amber-950/60 border-amber-700/60 text-amber-300",
      };
    default:
      return {
        label: "Sin cambios",
        classes: "bg-slate-900 border-slate-800 text-slate-500",
      };
  }
}

const renderWordSegments = (
  segments: WordDiffSegment[],
  emptyFallback: string
) => {
  if (segments.length === 0) {
    return <span className="italic text-slate-500">{emptyFallback}</span>;
  }

  return (
    <span className="whitespace-pre-wrap break-words leading-relaxed">
      {segments.map((seg, idx) => {
        if (seg.type === "added") {
          return (
            <ins
              key={idx}
              className="no-underline bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 rounded-sm px-1 py-0.5 mx-0.5"
            >
              <span className="select-none font-mono text-[10px] text-emerald-400 mr-0.5">
                +
              </span>
              {seg.text}
            </ins>
          );
        }
        if (seg.type === "removed") {
          return (
            <del
              key={idx}
              className="line-through decoration-rose-400/80 bg-rose-950/80 text-rose-200 border border-rose-700/50 rounded-sm px-1 py-0.5 mx-0.5"
            >
              <span className="select-none font-mono text-[10px] text-rose-400 mr-0.5 no-underline inline-block">
                −
              </span>
              {seg.text}
            </del>
          );
        }
        return (
          <span key={idx} className="text-slate-200">
            {seg.text}
          </span>
        );
      })}
    </span>
  );
};

export const RevisionDiffModal: React.FC<RevisionDiffModalProps> = ({
  state,
  onClose,
  onRestoreRevision,
}) => {
  const [baseId, setBaseId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<DiffLayoutMode>("side_by_side");
  const [hideUnchanged, setHideUnchanged] = useState<boolean>(true);

  useEffect(() => {
    if (!state) return;
    setBaseId(state.initialBaseId);
    setTargetId(state.initialTargetId);
    setHideUnchanged(true);
  }, [state]);

  const baseRev = useMemo(
    () =>
      state?.revisions.find((r) => r.id === baseId) ||
      state?.revisions[state.revisions.length - 1] ||
      null,
    [state, baseId]
  );

  const targetRev = useMemo(
    () =>
      state?.revisions.find((r) => r.id === targetId) ||
      state?.revisions[0] ||
      null,
    [state, targetId]
  );

  const fieldDiffs = useMemo(() => {
    if (!state || !baseRev || !targetRev) return [];
    return buildRevisionFieldDiffs(
      state.entityType,
      baseRev.snapshot,
      targetRev.snapshot
    );
  }, [state, baseRev, targetRev]);

  const changedCount = useMemo(
    () => fieldDiffs.filter((f) => f.status !== "unchanged").length,
    [fieldDiffs]
  );

  const visibleDiffs = useMemo(
    () =>
      hideUnchanged
        ? fieldDiffs.filter((f) => f.status !== "unchanged")
        : fieldDiffs,
    [fieldDiffs, hideUnchanged]
  );

  if (!state || !baseRev || !targetRev) return null;

  const handleSwapVersions = () => {
    setBaseId(targetRev.id);
    setTargetId(baseRev.id);
  };

  return (
    <div
      className="fixed inset-0 z-[75] isolate bg-black/85 flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-diff-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-[#0B101D] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0D1323] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-mono uppercase tracking-wider">
              <GitCompare className="w-3.5 h-3.5 shrink-0" />
              <span>
                Comparación Visual ·{" "}
                {state.entityType === "log" ? "Logro" : "Experiencia"}
              </span>
            </div>
            <h3
              id="revision-diff-title"
              className="text-sm sm:text-base font-bold text-white mt-0.5 truncate"
            >
              {state.entityTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onRestoreRevision(baseRev)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title={`Precargar v${baseRev.versionNumber} en el editor sin guardar`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Restaurar v{baseRev.versionNumber}</span>
            </button>
            <button
              type="button"
              onClick={() => onRestoreRevision(targetRev)}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/70 text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title={`Precargar v${targetRev.versionNumber} en el editor sin guardar`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
              <span>Restaurar v{targetRev.versionNumber}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar comparador"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Version Selectors & View Controls */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#080C14] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-200 font-mono font-bold text-[11px]">
                A
              </span>
              <select
                value={baseRev.id}
                onChange={(e) => setBaseId(e.target.value)}
                aria-label="Versión A base"
                className="bg-[#0B101D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono tabular-nums focus:outline-none focus:border-cyan-500"
              >
                {state.revisions.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    v{rev.versionNumber} · {formatShortDate(rev.createdAt)} ·{" "}
                    {formatRevisionOriginLabel(rev.source)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleSwapVersions}
              title="Intercambiar Versión A y Versión B"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <label className="flex items-center gap-1.5 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 font-mono font-bold text-[11px]">
                B
              </span>
              <select
                value={targetRev.id}
                onChange={(e) => setTargetId(e.target.value)}
                aria-label="Versión B comparada"
                className="bg-[#0B101D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono tabular-nums focus:outline-none focus:border-cyan-500"
              >
                {state.revisions.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    v{rev.versionNumber} · {formatShortDate(rev.createdAt)} ·{" "}
                    {formatRevisionOriginLabel(rev.source)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono tabular-nums text-slate-400 mr-1">
              {changedCount}{" "}
              {changedCount === 1 ? "campo cambiado" : "campos cambiados"}
            </span>

            <div
              className="inline-flex items-center p-0.5 rounded-lg bg-[#0B101D] border border-slate-800"
              role="group"
              aria-label="Modo de visualización"
            >
              <button
                type="button"
                onClick={() => setLayoutMode("side_by_side")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  layoutMode === "side_by_side"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lado a Lado</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("unified")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  layoutMode === "unified"
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Rows3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Unificada</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setHideUnchanged((v) => !v)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                hideUnchanged
                  ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-cyan-950/60 border-cyan-800/60 text-cyan-200 hover:bg-cyan-950"
              }`}
            >
              {hideUnchanged ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mostrar sin cambios</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ocultar sin cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Changed Fields Quick Index */}
        {changedCount > 0 && (
          <div className="px-5 py-2 border-b border-slate-800/70 bg-[#090E18] flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 mr-1">
              {state.entityType === "log"
                ? "Partes del logro modificadas:"
                : "Secciones de experiencia modificadas:"}
            </span>
            {fieldDiffs
              .filter((f) => f.status !== "unchanged")
              .map((f) => (
                <a
                  key={f.field}
                  href={`#diff-field-${f.field}`}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  <span className="text-slate-400">{f.section} · </span>
                  <span className="font-semibold">{f.label}</span>
                </a>
              ))}
          </div>
        )}

        {/* Field-by-field Diff Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {visibleDiffs.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#080C14] border border-slate-800 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-200">
                No hay diferencias entre v{baseRev.versionNumber} y v
                {targetRev.versionNumber}
              </p>
              <p className="text-xs text-slate-400">
                Todos los campos normalizados coinciden entre las dos versiones
                seleccionadas.
              </p>
              {hideUnchanged && (
                <button
                  type="button"
                  onClick={() => setHideUnchanged(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
                >
                  Mostrar los {fieldDiffs.length} campos de todas formas
                </button>
              )}
            </div>
          ) : (
            visibleDiffs.map((field) => {
              const badge = getStatusBadge(field.status);
              const isList = field.kind === "list" && Boolean(field.listLines);

              return (
                <section
                  id={`diff-field-${field.field}`}
                  key={field.field}
                  className="rounded-xl bg-[#080C14] border border-slate-800"
                >
                  <div className="sticky top-0 z-10 px-4 py-2.5 bg-[#101829] border-b border-slate-800 rounded-t-xl flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                        {state.entityType === "log" ? "Propiedad del logro" : "Sección de experiencia"} · {field.section}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5">
                        {field.propertyLabel}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {field.hint}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded border font-mono text-[10px] font-semibold shrink-0 mt-0.5 ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {isList && field.listLines ? (
                    layoutMode === "unified" ? (
                      <div className="p-3.5 space-y-1.5 text-xs">
                        {field.listLines.length === 0 ? (
                          <span className="italic text-slate-500">(lista vacía)</span>
                        ) : (
                          field.listLines.map((line, idx) => (
                            <div
                              key={idx}
                              className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 leading-relaxed ${
                                line.type === "added"
                                  ? "bg-emerald-950/45 border-emerald-800/50 text-emerald-200"
                                  : line.type === "removed"
                                    ? "bg-rose-950/45 border-rose-800/50 text-rose-200 line-through decoration-rose-400/80"
                                    : "bg-slate-900/40 border-slate-800/70 text-slate-300"
                              }`}
                            >
                              <span
                                className={`font-mono font-bold select-none shrink-0 ${
                                  line.type === "added"
                                    ? "text-emerald-400"
                                    : line.type === "removed"
                                      ? "text-rose-400"
                                      : "text-slate-500"
                                }`}
                              >
                                {line.type === "added"
                                  ? "+"
                                  : line.type === "removed"
                                    ? "−"
                                    : "•"}
                              </span>
                              <span className="break-words">{line.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 text-xs">
                        <div className="p-3.5 space-y-1.5">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90 mb-2">
                            Versión A · v{baseRev.versionNumber}
                          </p>
                          {field.listLines.filter((l) => l.type !== "added").length === 0 ? (
                            <span className="italic text-slate-500">(sin elementos)</span>
                          ) : (
                            field.listLines
                              .filter((l) => l.type !== "added")
                              .map((line, idx) => (
                                <div
                                  key={idx}
                                  className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 leading-relaxed ${
                                    line.type === "removed"
                                      ? "bg-rose-950/45 border-rose-800/50 text-rose-200 line-through decoration-rose-400/80"
                                      : "bg-slate-900/40 border-slate-800/70 text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`font-mono font-bold select-none shrink-0 ${
                                      line.type === "removed"
                                        ? "text-rose-400"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {line.type === "removed" ? "−" : "•"}
                                  </span>
                                  <span className="break-words">{line.text}</span>
                                </div>
                              ))
                          )}
                        </div>

                        <div className="p-3.5 space-y-1.5">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/90 mb-2">
                            Versión B · v{targetRev.versionNumber}
                          </p>
                          {field.listLines.filter((l) => l.type !== "removed").length === 0 ? (
                            <span className="italic text-slate-500">(sin elementos)</span>
                          ) : (
                            field.listLines
                              .filter((l) => l.type !== "removed")
                              .map((line, idx) => (
                                <div
                                  key={idx}
                                  className={`px-2.5 py-1.5 rounded-lg border flex items-start gap-2 leading-relaxed ${
                                    line.type === "added"
                                      ? "bg-emerald-950/45 border-emerald-800/50 text-emerald-200"
                                      : "bg-slate-900/40 border-slate-800/70 text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`font-mono font-bold select-none shrink-0 ${
                                      line.type === "added"
                                        ? "text-emerald-400"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {line.type === "added" ? "+" : "•"}
                                  </span>
                                  <span className="break-words">{line.text}</span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )
                  ) : layoutMode === "unified" ? (
                    <div className="p-3.5 text-xs">
                      {renderWordSegments(field.unifiedSegments, "(vacío)")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 text-xs">
                      <div className="p-3.5 space-y-1.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-300/90">
                          Versión A · v{baseRev.versionNumber}
                        </p>
                        <div>
                          {renderWordSegments(field.oldSegments, "(vacío)")}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1.5">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/90">
                          Versión B · v{targetRev.versionNumber}
                        </p>
                        <div>
                          {renderWordSegments(field.newSegments, "(vacío)")}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
