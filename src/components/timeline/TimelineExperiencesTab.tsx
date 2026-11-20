import React, { useRef, useState } from "react";
import {
  ArrowRight,
  Braces,
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileUp,
  GripVertical,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { LogEntry, WorkExperience } from "../../types";
import { useI18n } from "../../i18n";
import { TimelineViewLocale } from "../../i18n/viewLocales";
import {
  buildExperienceExportFilename,
  buildExperienceExportJson,
  ParsedExperienceJson,
  parseExperienceJson,
} from "../../utils/experienceJson";
import {
  getExperienceBulletItems,
  getExperienceChildLogs,
  isLogIncludedInCv,
} from "../../utils/bulletToLogMapper";
import {
  formatLogUpdatedAt,
  formatRelativeUpdatedTime,
  isRecentlyUpdatedLog,
} from "./timelineUtils";
import { ExperienceJsonEditorModal } from "./ExperienceJsonEditorModal";

interface TimelineExperiencesTabProps {
  experiences: WorkExperience[];
  logs: LogEntry[];
  totalBulletsCount: number;
  extractedBulletSet: Set<string>;
  tl: TimelineViewLocale;
  onOpenPasteBullets: () => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: WorkExperience) => void;
  onDeleteExperience: (id: string) => void;
  onImportExperienceJson?: (
    experienceId: string,
    parsed: ParsedExperienceJson
  ) => Promise<void> | void;
  onAddLogToExperience: (experienceId: string) => void;
  onEditLog?: (entry: LogEntry) => void;
  onToggleIncludeInCv?: (id: string) => void;
  onReorderLogs?: (
    sourceLogId: string,
    targetLogId: string,
    position: "before" | "after",
    experienceId?: string
  ) => void;
  onExtractBulletToLog?: (
    experienceId: string,
    company: string,
    role: string,
    bullet: string,
    technologies?: string[]
  ) => void;
  onExtractAllBulletsForExperience?: (experienceId: string) => void;
  onJumpToCompanyLogs: (company: string) => void;
  nowMs: number;
}

export const TimelineExperiencesTab: React.FC<TimelineExperiencesTabProps> = ({
  experiences,
  logs,
  totalBulletsCount,
  tl,
  onOpenPasteBullets,
  onOpenCvUpload,
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
  onImportExperienceJson,
  onAddLogToExperience,
  onEditLog,
  onToggleIncludeInCv,
  onReorderLogs,
  onExtractBulletToLog,
  onExtractAllBulletsForExperience,
  onJumpToCompanyLogs,
  nowMs,
}) => {
  const { language } = useI18n();
  const [expandedHiddenDrawer, setExpandedHiddenDrawer] = useState<Record<string, boolean>>({});
  const [draggedItem, setDraggedItem] = useState<{
    logId: string;
    expId: string;
    scope: "cv" | "hidden";
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    logId: string;
    expId: string;
    scope: "cv" | "hidden";
    position: "before" | "after";
  } | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadExpIdRef = useRef<string | null>(null);
  const [importingExpId, setImportingExpId] = useState<string | null>(null);
  const [jsonErrorByExpId, setJsonErrorByExpId] = useState<Record<string, string>>({});
  const [editingJsonExpId, setEditingJsonExpId] = useState<string | null>(null);

  const editingJsonExp = editingJsonExpId
    ? experiences.find((exp) => exp.id === editingJsonExpId) || null
    : null;

  const toggleHiddenDrawer = (expId: string) => {
    setExpandedHiddenDrawer((prev) => ({ ...prev, [expId]: !prev[expId] }));
  };

  const handleDownloadExperienceJson = (exp: WorkExperience) => {
    const jsonContent = buildExperienceExportJson(exp, logs);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = buildExperienceExportFilename(exp);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerJsonUpload = (expId: string) => {
    setJsonErrorByExpId((prev) => {
      if (!prev[expId]) return prev;
      const next = { ...prev };
      delete next[expId];
      return next;
    });
    pendingUploadExpIdRef.current = expId;
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = "";
      jsonFileInputRef.current.click();
    }
  };

  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetExpId = pendingUploadExpIdRef.current;
    pendingUploadExpIdRef.current = null;
    e.target.value = "";

    if (!file || !targetExpId) return;

    try {
      const content = await file.text();
      const parsed = parseExperienceJson(content);
      if (!parsed.success) {
        setJsonErrorByExpId((prev) => ({
          ...prev,
          [targetExpId]: parsed.error,
        }));
        return;
      }

      if (!onImportExperienceJson) return;

      setImportingExpId(targetExpId);
      await onImportExperienceJson(targetExpId, parsed.data);
    } catch (err) {
      setJsonErrorByExpId((prev) => ({
        ...prev,
        [targetExpId]:
          err instanceof Error
            ? err.message
            : "No se pudo leer o cargar el archivo JSON.",
      }));
    } finally {
      setImportingExpId((current) => (current === targetExpId ? null : current));
    }
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleRowDragStart = (
    e: React.DragEvent<HTMLElement>,
    logId: string,
    expId: string,
    scope: "cv" | "hidden"
  ) => {
    if (!onReorderLogs) {
      e.preventDefault();
      return;
    }
    const rowEl = e.currentTarget.closest("[data-log-id]");
    if (rowEl instanceof HTMLElement && typeof e.dataTransfer.setDragImage === "function") {
      e.dataTransfer.setDragImage(rowEl, 18, 18);
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", logId);
    setDraggedItem({ logId, expId, scope });
    setDropTarget(null);
  };

  const handleRowDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    targetLogId: string,
    expId: string,
    scope: "cv" | "hidden"
  ) => {
    if (!draggedItem || draggedItem.expId !== expId || draggedItem.scope !== scope) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedItem.logId === targetLogId) {
      if (dropTarget !== null) setDropTarget(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const position: "before" | "after" =
      e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDropTarget((prev) =>
      prev &&
      prev.logId === targetLogId &&
      prev.expId === expId &&
      prev.scope === scope &&
      prev.position === position
        ? prev
        : { logId: targetLogId, expId, scope, position }
    );
  };

  const handleRowDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetLogId: string,
    expId: string,
    scope: "cv" | "hidden"
  ) => {
    e.preventDefault();
    if (
      !onReorderLogs ||
      !draggedItem ||
      draggedItem.expId !== expId ||
      draggedItem.scope !== scope ||
      draggedItem.logId === targetLogId
    ) {
      resetDragState();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const position: "before" | "after" =
      dropTarget &&
      dropTarget.logId === targetLogId &&
      dropTarget.expId === expId &&
      dropTarget.scope === scope
        ? dropTarget.position
        : e.clientY < rect.top + rect.height / 2
          ? "before"
          : "after";
    const sourceLogId = draggedItem.logId;
    resetDragState();
    onReorderLogs(sourceLogId, targetLogId, position, expId);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <input
        ref={jsonFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={(e) => void handleJsonFileChange(e)}
        className="hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Experiencia Laboral ({experiences.length})
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
              {tl.bulletsRealCount(totalBulletsCount)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{tl.structureFromCvDesc}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCvUpload}
            className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-300" />
            <span>Cargar CV</span>
          </button>
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-14 px-6 border border-dashed border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-950/30">
            <Building className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-white">
              Comienza cargando tu Experiencia Laboral
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Importa tu Currículum en PDF, TXT o pega tus viñetas. El sistema creará
              automáticamente los contenedores de tus empresas, roles, fechas y viñetas fidedignas
              para extraer logros.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenCvUpload}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all active:scale-95"
            >
              <FileUp className="w-4 h-4 text-purple-200" />
              <span>{tl.importCvPdfBtn}</span>
            </button>
            <button
              type="button"
              onClick={onOpenPasteBullets}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{tl.pasteBulletsBtn}</span>
            </button>
            <button
              type="button"
              onClick={onAddExperience}
              className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{tl.addCompanyManualBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => {
            const expLogs = getExperienceChildLogs(exp, logs);
            const bulletItems = getExperienceBulletItems(exp, logs);
            const unextractedLegacyItems = bulletItems.filter((item) => item.isLegacyUnlinked);
            const hiddenFromCvLogs = expLogs.filter((l) => !isLogIncludedInCv(l));
            const isHiddenDrawerOpen = Boolean(expandedHiddenDrawer[exp.id]);

            return (
              <div
                key={exp.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      {exp.role || "Desarrollador / Ingeniero"}
                    </h3>

                    <div className="text-sm sm:text-base font-semibold text-cyan-400 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>@ {exp.company}</span>
                      {exp.isCurrent && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Actualidad
                        </span>
                      )}
                      {exp.isPersonalProjects && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          Proyectos Personales
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-mono text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {exp.startDate || "Inicio"} —{" "}
                        {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                      </span>
                      {exp.location && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {exp.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                    {unextractedLegacyItems.length > 0 && onExtractAllBulletsForExperience && (
                      <button
                        type="button"
                        onClick={() => onExtractAllBulletsForExperience(exp.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                        title={tl.extractAllBulletsBtn(unextractedLegacyItems.length)}
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{tl.extractAllBulletsBtn(unextractedLegacyItems.length)}</span>
                      </button>
                    )}

                    <div
                      className="inline-flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5 shrink-0"
                      role="group"
                      aria-label={language === "en" ? "Experience JSON actions" : "Acciones JSON de la experiencia"}
                    >
                      {onImportExperienceJson && (
                        <button
                          type="button"
                          onClick={() => {
                            setJsonErrorByExpId((prev) => {
                              if (!prev[exp.id]) return prev;
                              const next = { ...prev };
                              delete next[exp.id];
                              return next;
                            });
                            setEditingJsonExpId(exp.id);
                          }}
                          className="px-2.5 py-1 text-slate-200 hover:text-white hover:bg-slate-700/80 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                          title={
                            language === "en"
                              ? "Open, edit and save this experience JSON inline"
                              : "Abrir, editar y guardar el JSON de esta experiencia aquí mismo"
                          }
                        >
                          <Braces className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{language === "en" ? "Edit JSON" : "Editar JSON"}</span>
                        </button>
                      )}

                      {onImportExperienceJson && (
                        <span className="h-4 w-px bg-slate-700/80 mx-0.5" aria-hidden="true" />
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownloadExperienceJson(exp)}
                        className="px-2.5 py-1 text-slate-200 hover:text-white hover:bg-slate-700/80 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                        title={
                          language === "en"
                            ? "Download this experience and its achievements as JSON"
                            : "Descargar esta experiencia y sus logros en formato JSON"
                        }
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{language === "en" ? "Download" : "Descargar"}</span>
                      </button>

                      {onImportExperienceJson && (
                        <>
                          <span className="h-4 w-px bg-slate-700/80 mx-0.5" aria-hidden="true" />
                          <button
                            type="button"
                            disabled={importingExpId === exp.id}
                            onClick={() => handleTriggerJsonUpload(exp.id)}
                            className="px-2.5 py-1 disabled:opacity-60 disabled:cursor-not-allowed text-slate-200 hover:text-white hover:bg-slate-700/80 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                            title={
                              language === "en"
                                ? "Upload a JSON file to update or add achievements in this experience"
                                : "Cargar un archivo JSON para actualizar o añadir logros en esta experiencia"
                            }
                          >
                            {importingExpId === exp.id ? (
                              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span>
                              {importingExpId === exp.id
                                ? language === "en"
                                  ? "Loading..."
                                  : "Cargando..."
                                : language === "en"
                                  ? "Upload"
                                  : "Cargar"}
                            </span>
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddLogToExperience(exp.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                      title={tl.manualLogBtn}
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">{tl.manualLogBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditExperience(exp)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors shrink-0"
                      title={tl.editCompanyTooltip}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {!exp.isPersonalProjects && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(tl.deleteCompanyConfirm(exp.company))) {
                            onDeleteExperience(exp.id);
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 rounded-lg transition-colors shrink-0"
                        title={tl.deleteCompanyTooltip}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {jsonErrorByExpId[exp.id] && (
                  <div
                    role="alert"
                    className="px-3 py-2 rounded-lg bg-red-950/60 border border-red-800/70 text-red-200 text-xs flex items-center justify-between gap-2"
                  >
                    <span>{jsonErrorByExpId[exp.id]}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setJsonErrorByExpId((prev) => {
                          const next = { ...prev };
                          delete next[exp.id];
                          return next;
                        })
                      }
                      className="text-[11px] font-semibold text-red-300 hover:text-white whitespace-nowrap shrink-0"
                    >
                      {language === "en" ? "Dismiss" : "Cerrar"}
                    </button>
                  </div>
                )}

                {exp.summary && !exp.summary.includes("extraída de CV") && bulletItems.length === 0 && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl border-l-2 border-slate-800 pl-3 italic">
                    {exp.summary}
                  </p>
                )}

                <div className="space-y-3 pt-1">
                  {bulletItems.length > 0 ? (
                    <div className="space-y-2">
                      {onReorderLogs && bulletItems.filter((item) => item.log !== null).length > 1 && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pl-1">
                          <GripVertical className="w-3 h-3 text-slate-500" />
                          <span>Arrastra desde el ícono de puntos para reordenar; puedes seleccionar el texto libremente</span>
                        </p>
                      )}
                      {bulletItems.map((item) => {
                        const childLog = item.log;
                        const canDrag = Boolean(childLog && onReorderLogs);
                        const isDragging =
                          Boolean(childLog) &&
                          draggedItem?.logId === childLog?.id &&
                          draggedItem?.expId === exp.id &&
                          draggedItem?.scope === "cv";
                        const showDropBefore =
                          Boolean(childLog) &&
                          dropTarget?.logId === childLog?.id &&
                          dropTarget?.expId === exp.id &&
                          dropTarget?.scope === "cv" &&
                          dropTarget?.position === "before";
                        const showDropAfter =
                          Boolean(childLog) &&
                          dropTarget?.logId === childLog?.id &&
                          dropTarget?.expId === exp.id &&
                          dropTarget?.scope === "cv" &&
                          dropTarget?.position === "after";
                        const updatedLabel = childLog
                          ? formatLogUpdatedAt(childLog.updatedAt, language)
                          : null;
                        const isRecent = Boolean(childLog && isRecentlyUpdatedLog(childLog, nowMs));
                        const relativeUpdated = isRecent && childLog
                          ? formatRelativeUpdatedTime(childLog.updatedAt, nowMs, language)
                          : null;
                        return (
                          <div key={item.key} className="space-y-1">
                            {showDropBefore && (
                              <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />
                            )}
                            <div
                              data-log-id={childLog?.id}
                              onDragOver={
                                childLog && onReorderLogs
                                  ? (e) => handleRowDragOver(e, childLog.id, exp.id, "cv")
                                  : undefined
                              }
                              onDrop={
                                childLog && onReorderLogs
                                  ? (e) => handleRowDrop(e, childLog.id, exp.id, "cv")
                                  : undefined
                              }
                              className={`flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl border transition-colors ${
                                isDragging
                                  ? "opacity-50 border-cyan-500/60 bg-slate-950/40"
                                  : isRecent
                                    ? "border-cyan-500/40 bg-cyan-950/15 hover:border-cyan-400/60"
                                    : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80"
                              }`}
                            >
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                {canDrag && childLog && (
                                  <span
                                    draggable
                                    data-drag-handle="true"
                                    onDragStart={(e) => handleRowDragStart(e, childLog.id, exp.id, "cv")}
                                    onDragEnd={resetDragState}
                                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400 hover:bg-slate-800/80 p-1 -m-0.5 rounded shrink-0 select-none transition-colors"
                                    title="Arrastrar desde este ícono para reordenar"
                                    aria-label="Arrastrar para reordenar"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <span className="text-cyan-400 font-bold text-base leading-none select-none mt-0.5">
                                  •
                                </span>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <p className="text-slate-200/95 leading-relaxed break-words">
                                    {item.text}
                                  </p>
                                  {(updatedLabel || (isRecent && relativeUpdated)) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                      {updatedLabel && (
                                        <p className="text-[11px] italic text-slate-400/90 tabular-nums">
                                          {updatedLabel}
                                        </p>
                                      )}
                                      {isRecent && relativeUpdated && (
                                        <span className="text-[10px] font-mono tabular-nums text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                          {language === "en"
                                            ? `Recent · ${relativeUpdated}`
                                            : `Reciente · ${relativeUpdated}`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 sm:self-center pl-4 sm:pl-0">
                              {childLog ? (
                                <>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 px-2 py-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Logro vinculado
                                  </span>

                                  {onEditLog && (
                                    <button
                                      type="button"
                                      onClick={() => onEditLog(childLog)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 hover:text-cyan-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-md transition-colors"
                                      title="Editar título, impacto y detalles STAR del logro"
                                    >
                                      <Edit3 className="w-3 h-3 text-cyan-400" />
                                      <span>Editar</span>
                                    </button>
                                  )}

                                  {onToggleIncludeInCv && (
                                    <button
                                      type="button"
                                      onClick={() => onToggleIncludeInCv(childLog.id)}
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-800/60 px-2 py-1 rounded-md transition-colors"
                                      title="Ocultar del resumen de esta experiencia (se mantiene completo en Bitácora)"
                                    >
                                      <EyeOff className="w-3 h-3" />
                                      <span>Quitar del CV</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onExtractBulletToLog) {
                                      onExtractBulletToLog(
                                        exp.id,
                                        exp.company,
                                        exp.role,
                                        item.text,
                                        exp.technologies
                                      );
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 hover:border-cyan-500 px-2.5 py-1 rounded-md transition-all shadow-sm active:scale-95"
                                  title={tl.extractToLogBtn}
                                >
                                  <Zap className="w-3 h-3 text-cyan-400" />
                                  <span>Vincular logro</span>
                                </button>
                              )}
                            </div>
                            </div>
                            {showDropAfter && (
                              <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                      <span>{tl.noBulletsForExperience}</span>
                      <button
                        type="button"
                        onClick={() => onEditExperience(exp)}
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {tl.addBulletsAction}
                      </button>
                    </div>
                  )}

                  {hiddenFromCvLogs.length > 0 && (
                    <div className="border border-slate-800/70 rounded-xl bg-slate-950/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleHiddenDrawer(exp.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            Logros solo en Bitácora ({hiddenFromCvLogs.length})
                          </span>
                        </span>
                        {isHiddenDrawerOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>

                      {isHiddenDrawerOpen && (
                        <div className="p-2.5 pt-1 border-t border-slate-800/70 space-y-1.5">
                          {hiddenFromCvLogs.map((hiddenLog) => {
                            const canDragHidden = Boolean(onReorderLogs);
                            const isDraggingHidden =
                              draggedItem?.logId === hiddenLog.id &&
                              draggedItem?.expId === exp.id &&
                              draggedItem?.scope === "hidden";
                            const showHiddenBefore =
                              dropTarget?.logId === hiddenLog.id &&
                              dropTarget?.expId === exp.id &&
                              dropTarget?.scope === "hidden" &&
                              dropTarget?.position === "before";
                            const showHiddenAfter =
                              dropTarget?.logId === hiddenLog.id &&
                              dropTarget?.expId === exp.id &&
                              dropTarget?.scope === "hidden" &&
                              dropTarget?.position === "after";
                            const hiddenUpdatedLabel = formatLogUpdatedAt(
                              hiddenLog.updatedAt,
                              language
                            );
                            const isHiddenRecent = isRecentlyUpdatedLog(hiddenLog, nowMs);
                            const hiddenRelative = isHiddenRecent
                              ? formatRelativeUpdatedTime(hiddenLog.updatedAt, nowMs, language)
                              : null;
                            return (
                              <div key={hiddenLog.id} className="space-y-1">
                                {showHiddenBefore && (
                                  <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />
                                )}
                                <div
                                  data-log-id={hiddenLog.id}
                                  onDragOver={
                                    canDragHidden
                                      ? (e) => handleRowDragOver(e, hiddenLog.id, exp.id, "hidden")
                                      : undefined
                                  }
                                  onDrop={
                                    canDragHidden
                                      ? (e) => handleRowDrop(e, hiddenLog.id, exp.id, "hidden")
                                      : undefined
                                  }
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg border text-xs transition-colors ${
                                    isDraggingHidden
                                      ? "opacity-50 border-cyan-500/60 bg-slate-900/60"
                                      : isHiddenRecent
                                        ? "border-cyan-500/40 bg-cyan-950/15"
                                        : "border-slate-800/60 bg-slate-900/60"
                                  }`}
                                >
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    {canDragHidden && (
                                      <span
                                        draggable
                                        data-drag-handle="true"
                                        onDragStart={(e) => handleRowDragStart(e, hiddenLog.id, exp.id, "hidden")}
                                        onDragEnd={resetDragState}
                                        className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400 hover:bg-slate-800/80 p-1 -m-0.5 rounded shrink-0 select-none transition-colors"
                                        title="Arrastrar desde este ícono para reordenar"
                                        aria-label="Arrastrar para reordenar"
                                      >
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                      <p className="text-slate-400 line-clamp-2">
                                        {hiddenLog.title}
                                      </p>
                                      {(hiddenUpdatedLabel || (isHiddenRecent && hiddenRelative)) && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          {hiddenUpdatedLabel && (
                                            <p className="text-[11px] italic text-slate-500 tabular-nums">
                                              {hiddenUpdatedLabel}
                                            </p>
                                          )}
                                          {isHiddenRecent && hiddenRelative && (
                                            <span className="text-[10px] font-mono tabular-nums text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                              {language === "en"
                                                ? `Recent · ${hiddenRelative}`
                                                : `Reciente · ${hiddenRelative}`}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {onEditLog && (
                                      <button
                                        type="button"
                                        onClick={() => onEditLog(hiddenLog)}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-md transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Editar</span>
                                      </button>
                                    )}
                                    {onToggleIncludeInCv && (
                                      <button
                                        type="button"
                                        onClick={() => onToggleIncludeInCv(hiddenLog.id)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/70 px-2 py-1 rounded-md transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>Incluir en CV</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {showHiddenAfter && (
                                  <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] font-mono text-slate-300 bg-slate-800/90 border border-slate-700/70 px-2.5 py-1 rounded-md hover:border-cyan-500/40 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <strong className="text-slate-200">{expLogs.length}</strong>{" "}
                    {tl.linkedLogsCount(expLogs.length).replace(/^\d+\s*/, "")}
                    <span className="text-slate-500 font-mono">
                      {tl.logsRatio(
                        expLogs.filter((l) => l.isPublic).length,
                        expLogs.filter((l) => !l.isPublic).length
                      )}
                    </span>
                  </span>

                  {expLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onJumpToCompanyLogs(exp.company)}
                      className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 group/link"
                    >
                      <span>{tl.viewCompanyLogsTab(exp.company)}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ExperienceJsonEditorModal
        isOpen={Boolean(editingJsonExp)}
        experience={editingJsonExp}
        allLogs={logs}
        language={language}
        onClose={() => setEditingJsonExpId(null)}
        onSave={async (expId, parsed) => {
          if (onImportExperienceJson) {
            await onImportExperienceJson(expId, parsed);
          }
        }}
      />
    </div>
  );
};
