import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Braces,
  Check,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Wand2,
  X,
} from "lucide-react";
import { LogEntry, WorkExperience } from "../../types";
import {
  buildExperienceExportFilename,
  buildExperienceExportJson,
  ParsedExperienceJson,
  parseExperienceJson,
  reconcileImportedExperienceJson,
} from "../../utils/experienceJson";
import { formatFirestoreUiError } from "../../utils/firestore/errors";

interface ExperienceJsonEditorModalProps {
  isOpen: boolean;
  experience: WorkExperience | null;
  allLogs: LogEntry[];
  language: string;
  onClose: () => void;
  onSave: (experienceId: string, parsed: ParsedExperienceJson) => Promise<void> | void;
}

export const ExperienceJsonEditorModal: React.FC<ExperienceJsonEditorModalProps> = ({
  isOpen,
  experience,
  allLogs,
  language,
  onClose,
  onSave,
}) => {
  const isEn = language === "en";
  const [previousSnapshotJson, setPreviousSnapshotJson] = useState("");
  const [draftJson, setDraftJson] = useState("");
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);
  const [showPreSaveBackupPrompt, setShowPreSaveBackupPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preSavePromptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !experience) return;
    const initialSnapshot = buildExperienceExportJson(experience, allLogs);
    setPreviousSnapshotJson(initialSnapshot);
    setDraftJson(initialSnapshot);
    setHasDownloadedBackup(false);
    setShowPreSaveBackupPrompt(false);
    setIsSaving(false);
    setSaveError(null);
  }, [isOpen, experience?.id]);

  useEffect(() => {
    if (!showPreSaveBackupPrompt) return;
    window.requestAnimationFrame(() => {
      preSavePromptRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [showPreSaveBackupPrompt]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        if (showPreSaveBackupPrompt) {
          setShowPreSaveBackupPrompt(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, showPreSaveBackupPrompt, onClose]);

  const validation = useMemo(() => {
    if (!isOpen || !experience) {
      return {
        valid: false as const,
        error: "",
      };
    }
    const parsed = parseExperienceJson(draftJson);
    if (!parsed.success) {
      return {
        valid: false as const,
        error: parsed.error,
      };
    }
    const reconciled = reconcileImportedExperienceJson(
      experience,
      allLogs,
      parsed.data
    );
    return {
      valid: true as const,
      parsed: parsed.data,
      reconciled,
    };
  }, [isOpen, experience, allLogs, draftJson]);

  if (!isOpen || !experience) return null;

  const isDirty = draftJson.trim() !== previousSnapshotJson.trim();

  const triggerPreviousVersionDownload = () => {
    const content = previousSnapshotJson || buildExperienceExportJson(experience, allLogs);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildExperienceExportFilename(experience, "respaldo-anterior");
    a.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(draftJson);
      setDraftJson(JSON.stringify(parsed, null, 2));
      setSaveError(null);
    } catch {
      // Keep current draft so inline validation error stays visible
    }
  };

  const handleResetToOriginal = () => {
    setDraftJson(previousSnapshotJson);
    setShowPreSaveBackupPrompt(false);
    setSaveError(null);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${draftJson.slice(0, start)}  ${draftJson.slice(end)}`;
      setDraftJson(next);
      setShowPreSaveBackupPrompt(false);
      window.requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  const commitSave = async (withBackupDownload: boolean) => {
    if (!validation.valid || isSaving) return;

    if (withBackupDownload) {
      triggerPreviousVersionDownload();
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(experience.id, validation.parsed);
      onClose();
    } catch (err) {
      setSaveError(
        formatFirestoreUiError(
          err,
          isEn
            ? "Could not save experience JSON to Firestore."
            : "No se pudo guardar el JSON de la experiencia en Firestore."
        )
      );
      setShowPreSaveBackupPrompt(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestSave = () => {
    if (!validation.valid || isSaving) return;
    if (!validation.reconciled.hasChanges) {
      onClose();
      return;
    }
    if (!hasDownloadedBackup) {
      setShowPreSaveBackupPrompt(true);
      return;
    }
    void commitSave(false);
  };

  const diffSummaryParts: string[] = [];
  if (validation.valid) {
    const {
      experienceChanged,
      logsToCreate,
      contentEditedLogs,
      metadataOnlyLogs,
      logsToDelete,
      unchangedCount,
    } = validation.reconciled;
    if (experienceChanged) {
      diffSummaryParts.push(isEn ? "experience fields updated" : "campos de experiencia");
    }
    if (logsToCreate.length > 0) {
      diffSummaryParts.push(
        isEn
          ? `${logsToCreate.length} new achievement(s)`
          : `${logsToCreate.length} logro(s) nuevo(s)`
      );
    }
    if (contentEditedLogs.length > 0) {
      diffSummaryParts.push(
        isEn
          ? `${contentEditedLogs.length} text edit(s) (updates timestamp)`
          : `${contentEditedLogs.length} texto editado (actualiza fecha)`
      );
    }
    if (metadataOnlyLogs.length > 0) {
      diffSummaryParts.push(
        isEn
          ? `${metadataOnlyLogs.length} order/visibility change(s) (keeps timestamp)`
          : `${metadataOnlyLogs.length} orden/visibilidad (mantiene fecha)`
      );
    }
    if (logsToDelete.length > 0) {
      diffSummaryParts.push(
        isEn
          ? `${logsToDelete.length} achievement(s) removed`
          : `${logsToDelete.length} logro(s) a eliminar`
      );
    }
    if (diffSummaryParts.length === 0 && unchangedCount >= 0) {
      diffSummaryParts.push(
        isEn ? "no pending changes" : "sin cambios pendientes"
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-json-editor-title"
    >
      <div className="w-full max-w-4xl bg-[#0B101D] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h3
              id="exp-json-editor-title"
              className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate"
            >
              <Braces className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">
                {isEn
                  ? `Edit JSON · ${experience.company}`
                  : `Editar JSON · ${experience.company}`}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
              {isEn
                ? "Replaces this experience's achievement set with the JSON below (IDs, userId and audit timestamps are protected; omitted achievements will be removed)."
                : "Reemplaza el conjunto de logros de esta experiencia con este JSON (IDs, usuario y fechas de auditoría están protegidos; los logros omitidos se eliminarán)."}
            </p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label={isEn ? "Close" : "Cerrar"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Toolbar */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!validation.valid || isSaving}
              onClick={handleFormatJson}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? "Format JSON" : "Formatear"}</span>
            </button>
            <button
              type="button"
              disabled={!isDirty || isSaving}
              onClick={handleResetToOriginal}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? "Restore Original" : "Restaurar original"}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={triggerPreviousVersionDownload}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              hasDownloadedBackup
                ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-200 hover:bg-emerald-950/80"
                : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {hasDownloadedBackup ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>
              {hasDownloadedBackup
                ? isEn
                  ? "Previous version saved"
                  : "Versión anterior descargada"
                : isEn
                  ? "Download previous version"
                  : "Descargar versión anterior"}
            </span>
          </button>
        </div>

        {/* Body: Monospace Editor */}
        <div className="p-4 sm:p-5 flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={draftJson}
            onChange={(e) => {
              setDraftJson(e.target.value);
              setShowPreSaveBackupPrompt(false);
              if (saveError) setSaveError(null);
            }}
            onKeyDown={handleTextareaKeyDown}
            spellCheck={false}
            aria-label={isEn ? "Experience JSON editor" : "Editor JSON de experiencia"}
            className="w-full flex-1 min-h-[180px] sm:min-h-[220px] bg-[#080C14] border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-xs font-mono tabular-nums text-slate-100 leading-relaxed focus:outline-none resize-none"
          />

          {/* Validation / Diff Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1 shrink-0">
            {!validation.valid ? (
              <div className="flex items-start gap-2 text-red-300" role="alert">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{validation.error}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-emerald-300">
                  {isEn ? "Valid JSON" : "JSON válido"}
                </span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-slate-400 tabular-nums">
                  {diffSummaryParts.join(" · ")}
                </span>
              </div>
            )}

            <span className="text-[11px] font-mono tabular-nums text-slate-500">
              {draftJson.split("\n").length} {isEn ? "lines" : "líneas"} ·{" "}
              {Math.max(1, Math.round(draftJson.length / 1024))} KB
            </span>
          </div>

          {saveError && (
            <div
              role="alert"
              className="px-3 py-2 rounded-lg bg-red-950/70 border border-red-800/70 text-red-200 text-xs flex items-center gap-2 shrink-0"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Pre-save backup confirmation prompt */}
          {showPreSaveBackupPrompt && validation.valid && (
            <div
              ref={preSavePromptRef}
              className="p-3.5 rounded-xl bg-amber-950/35 border border-amber-700/50 space-y-2.5 shrink-0"
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-amber-100">
                    {isEn
                      ? "Download a backup of the previous version before saving?"
                      : "¿Descargar respaldo de la versión anterior antes de guardar?"}
                  </p>
                  <p className="text-amber-200/80">
                    {isEn
                      ? `Pending changes: ${diffSummaryParts.join(", ")}.`
                      : `Cambios a aplicar: ${diffSummaryParts.join(", ")}.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowPreSaveBackupPrompt(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {isEn ? "Back to editing" : "Volver a editar"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void commitSave(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {isEn ? "Save without backup" : "Guardar sin descargar"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void commitSave(true)}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isEn
                      ? "Download backup & Save"
                      : "Descargar respaldo y guardar"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-xs disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            {isEn ? "Cancel" : "Cancelar"}
          </button>
          <button
            type="button"
            disabled={!validation.valid || isSaving || !validation.reconciled.hasChanges}
            onClick={handleRequestSave}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>
              {isSaving
                ? isEn
                  ? "Saving..."
                  : "Guardando..."
                : isEn
                  ? "Save changes"
                  : "Guardar cambios"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
