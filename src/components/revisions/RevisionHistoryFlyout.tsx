import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Clock,
  GitCompare,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  EntityRevision,
  ExperienceRevisionSnapshot,
  LogRevisionSnapshot,
  RevisionEntityType,
} from "../../types";
import { HistoryTarget } from "../../hooks/useAppModals";
import { listEntityRevisionsFirestore } from "../../utils/firestore/repository";
import { formatFirestoreUiError } from "../../utils/firestore/errors";
import {
  formatChangedFieldsSummary,
  formatRevisionOriginLabel,
  getRevisionFieldLabel,
  MAX_REVISIONS_PER_ENTITY,
} from "../../utils/revisions/snapshot";

interface RevisionHistoryFlyoutProps {
  target: HistoryTarget | null;
  onClose: () => void;
  onCompare: (params: {
    base: EntityRevision;
    target: EntityRevision;
    revisions: EntityRevision[];
  }) => void;
  onRestore: (revision: EntityRevision) => void;
  onRecoverDeleted?: (target: HistoryTarget) => Promise<void> | void;
  onSyncUpdatesCount?: (
    entityType: RevisionEntityType,
    entityId: string,
    updatesCount: number
  ) => void;
}

function formatRevisionTimestamp(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "Fecha desconocida";
  try {
    return new Intl.DateTimeFormat("es-CL", {
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

export const RevisionHistoryFlyout: React.FC<RevisionHistoryFlyoutProps> = ({
  target,
  onClose,
  onCompare,
  onRestore,
  onRecoverDeleted,
  onSyncUpdatesCount,
}) => {
  const [revisions, setRevisions] = useState<EntityRevision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [versionSearch, setVersionSearch] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);

  const loadRevisions = useCallback(async () => {
    if (!target) return;
    setIsLoading(true);
    setError(null);
    try {
      const rows = await listEntityRevisionsFirestore(
        target.entityType,
        target.entityId
      );
      setRevisions(rows);
      if (rows.length > 0) {
        onSyncUpdatesCount?.(
          target.entityType,
          target.entityId,
          Math.max(0, rows[0].versionNumber - 1)
        );
      }
      if (rows.length >= 2) {
        setSelectedTargetId(rows[0].id);
        setSelectedBaseId(rows[1].id);
      } else if (rows.length === 1) {
        setSelectedTargetId(rows[0].id);
        setSelectedBaseId(rows[0].id);
      } else {
        setSelectedTargetId(null);
        setSelectedBaseId(null);
      }
    } catch (err) {
      setError(
        formatFirestoreUiError(
          err,
          "No se pudo cargar el historial de revisiones."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [target?.entityType, target?.entityId, onSyncUpdatesCount]);

  useEffect(() => {
    if (!target) {
      setRevisions([]);
      setError(null);
      setSelectedBaseId(null);
      setSelectedTargetId(null);
      setVersionSearch("");
      setIsRecovering(false);
      return;
    }

    setVersionSearch("");
    setIsRecovering(false);
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listEntityRevisionsFirestore(target.entityType, target.entityId)
      .then((rows) => {
        if (cancelled) return;
        setRevisions(rows);
        if (rows.length > 0) {
          onSyncUpdatesCount?.(
            target.entityType,
            target.entityId,
            Math.max(0, rows[0].versionNumber - 1)
          );
        }
        if (rows.length >= 2) {
          setSelectedTargetId(rows[0].id);
          setSelectedBaseId(rows[1].id);
        } else if (rows.length === 1) {
          setSelectedTargetId(rows[0].id);
          setSelectedBaseId(rows[0].id);
        } else {
          setSelectedTargetId(null);
          setSelectedBaseId(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          formatFirestoreUiError(
            err,
            "No se pudo cargar el historial de versiones."
          )
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [target?.entityType, target?.entityId, reloadNonce, onSyncUpdatesCount]);

  const filteredRevisions = useMemo(() => {
    const q = versionSearch.trim().toLowerCase();
    if (!q) return revisions;
    return revisions.filter((rev) => {
      const versionLabel = `v${rev.versionNumber}`;
      const originLabel = formatRevisionOriginLabel(rev.source).toLowerCase();
      const changedLabels = rev.changedFields
        .map((f) => getRevisionFieldLabel(rev.entityType, f).toLowerCase())
        .join(" ");
      const snapshotText = JSON.stringify(rev.snapshot).toLowerCase();
      return (
        versionLabel.includes(q) ||
        originLabel.includes(q) ||
        changedLabels.includes(q) ||
        snapshotText.includes(q)
      );
    });
  }, [revisions, versionSearch]);

  if (!target) return null;

  const selectedBase = revisions.find((r) => r.id === selectedBaseId) || null;
  const selectedTarget = revisions.find((r) => r.id === selectedTargetId) || null;
  const canCompareSelected =
    Boolean(selectedBase) &&
    Boolean(selectedTarget) &&
    selectedBase!.id !== selectedTarget!.id;

  const currentSummaryPreview =
    target.entityType === "log"
      ? (target.currentSnapshot as LogRevisionSnapshot).title
      : `${(target.currentSnapshot as ExperienceRevisionSnapshot).role} · ${
          (target.currentSnapshot as ExperienceRevisionSnapshot).bullets.length
        } viñetas`;

  const handleRecoverClick = async () => {
    if (!onRecoverDeleted || isRecovering) return;
    setIsRecovering(true);
    setError(null);
    try {
      await onRecoverDeleted(target);
      onClose();
    } catch (err) {
      setError(
        formatFirestoreUiError(err, "No se pudo recuperar el registro eliminado.")
      );
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] isolate flex justify-end bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-flyout-title"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md h-full bg-[#0B101D] border-l border-slate-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0D1323] flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-mono uppercase tracking-wider">
              <History className="w-3.5 h-3.5 shrink-0" />
              <span>
                {target.entityType === "log"
                  ? "Historial del logro"
                  : "Historial de la experiencia"}
              </span>
            </div>
            <h3
              id="revision-flyout-title"
              className="text-sm font-bold text-white mt-1 line-clamp-2 leading-snug"
            >
              {target.title}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
              Carga bajo demanda · Retención máx. {MAX_REVISIONS_PER_ENTITY} versiones
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {target.isDeleted && (
          <div className="px-5 py-3 border-b border-amber-800/60 bg-amber-950/30 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-start gap-2 min-w-0">
              <Trash2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200 leading-snug">
                Este registro está eliminado. Puedes revisar sus versiones o recuperarlo.
              </p>
            </div>
            {onRecoverDeleted && (
              <button
                type="button"
                disabled={isRecovering}
                onClick={() => void handleRecoverClick()}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] inline-flex items-center gap-1 shrink-0 transition-colors disabled:opacity-50"
              >
                {isRecovering ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
                <span>Recuperar</span>
              </button>
            )}
          </div>
        )}

        {/* Search & Selection Toolbar for A vs B */}
        {!isLoading && !error && revisions.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-800/90 bg-[#080C14] flex flex-col gap-2.5 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={versionSearch}
                onChange={(e) => setVersionSearch(e.target.value)}
                placeholder="Buscar versión, campo o texto..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
              />
              {versionSearch && (
                <button
                  type="button"
                  onClick={() => setVersionSearch("")}
                  aria-label="Limpiar búsqueda de versiones"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {revisions.length >= 2 && (
              <>
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400">
                    Seleccionadas:{" "}
                    <strong className="font-mono tabular-nums text-amber-300">
                      A = v{selectedBase?.versionNumber ?? "—"}
                    </strong>{" "}
                    vs{" "}
                    <strong className="font-mono tabular-nums text-emerald-300">
                      B = v{selectedTarget?.versionNumber ?? "—"}
                    </strong>
                  </span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {filteredRevisions.length}
                    {versionSearch ? `/${revisions.length}` : ""}{" "}
                    {revisions.length === 1 ? "versión" : "versiones"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canCompareSelected}
                    onClick={() => {
                      if (selectedBase && selectedTarget) {
                        onCompare({
                          base: selectedBase,
                          target: selectedTarget,
                          revisions,
                        });
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>
                      Comparar seleccionadas
                      {selectedBase && selectedTarget
                        ? ` (v${selectedBase.versionNumber} vs v${selectedTarget.versionNumber})`
                        : ""}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#080C14] border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-slate-800" />
                    <div className="h-3.5 w-28 rounded bg-slate-800" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-slate-800/80" />
                  <div className="h-7 w-40 rounded bg-slate-800/60" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-950/60 border border-red-800/70 text-red-200 text-xs space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReloadNonce((n) => n + 1);
                  void loadRevisions();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/70 border border-red-700/60 text-red-100 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar carga</span>
              </button>
            </div>
          ) : revisions.length === 0 ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/70 text-cyan-300 font-mono text-[11px] font-semibold">
                    vActual
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Estado actual sin cambios registrados
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">
                  {currentSummaryPreview}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
                  Este registro fue creado antes del historial de versiones. Al guardar un
                  cambio real en formulario o JSON se capturará automáticamente{" "}
                  <strong className="text-slate-200">v1</strong> (estado previo) y{" "}
                  <strong className="text-slate-200">v2</strong> (primer cambio).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {revisions.length === 1 && (
                <div className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
                  Solo existe la versión inicial registrada. Guarda una nueva edición para
                  habilitar la comparación visual entre versiones.
                </div>
              )}

              {filteredRevisions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    No se encontraron versiones que coincidan con "{versionSearch}".
                  </p>
                  <button
                    type="button"
                    onClick={() => setVersionSearch("")}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-medium"
                  >
                    Mostrar todas las versiones
                  </button>
                </div>
              ) : (
                filteredRevisions.map((rev) => {
                  const fullIndex = revisions.findIndex((r) => r.id === rev.id);
                  const isCurrentLatest = fullIndex === 0;
                  const previousRev =
                    fullIndex >= 0 ? revisions[fullIndex + 1] || null : null;
                  const isSelectedA = selectedBaseId === rev.id;
                  const isSelectedB = selectedTargetId === rev.id;
                  const summaryText = formatChangedFieldsSummary(
                    rev.changedFields,
                    rev.entityType,
                    rev.source
                  );

                  return (
                    <div
                      key={rev.id}
                      className={`p-3.5 rounded-xl border transition-colors space-y-2.5 ${
                        isCurrentLatest
                          ? "bg-[#080C14] border-cyan-500/40"
                          : "bg-[#080C14] border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold tabular-nums border ${
                              isCurrentLatest
                                ? "bg-cyan-950/90 border-cyan-700/70 text-cyan-300"
                                : "bg-slate-900 border-slate-700 text-slate-200"
                            }`}
                          >
                            {isCurrentLatest
                              ? `vActual (v${rev.versionNumber})`
                              : `v${rev.versionNumber}`}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono">
                            {formatRevisionOriginLabel(rev.source)}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono tabular-nums flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatRevisionTimestamp(rev.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {summaryText}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        {revisions.length >= 2 ? (
                          <div
                            className="flex items-center gap-1"
                            role="group"
                            aria-label={`Seleccionar v${rev.versionNumber} para comparar`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedBaseId(rev.id)}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                                isSelectedA
                                  ? "bg-amber-950/80 border-amber-500/70 text-amber-200"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                              }`}
                              title="Marcar como Versión A (base)"
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTargetId(rev.id)}
                              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-colors ${
                                isSelectedB
                                  ? "bg-emerald-950/80 border-emerald-500/70 text-emerald-200"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                              }`}
                              title="Marcar como Versión B (objetivo)"
                            >
                              B
                            </button>
                          </div>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                          {previousRev && (
                            <button
                              type="button"
                              onClick={() =>
                                onCompare({
                                  base: previousRev,
                                  target: rev,
                                  revisions,
                                })
                              }
                              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                              title={`Comparar v${previousRev.versionNumber} vs v${rev.versionNumber}`}
                            >
                              <GitCompare className="w-3 h-3 text-cyan-400" />
                              <span>Comparar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onRestore(rev)}
                            className="px-2.5 py-1 rounded-md bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/70 text-cyan-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                            title={
                              target.isDeleted
                                ? `Recuperar este registro y precargar v${rev.versionNumber} en el editor`
                                : `Precargar v${rev.versionNumber} en el editor sin guardar hasta confirmar`
                            }
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>
                              {target.isDeleted ? "Recuperar esta versión" : "Restaurar"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
