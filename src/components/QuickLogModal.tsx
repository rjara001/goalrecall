import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, X, Sparkles, Eye, Lock, Zap, Loader2, FileText, History, RotateCcw, Trash2 } from "lucide-react";
import { InboxAchievementDraft, LogEntry, RevisionSource, WorkExperience } from "../types";
import type { RestoredLogDraft } from "../hooks/useAppModals";
import { useI18n } from "../i18n";
import { VIEW_LOCALES } from "../i18n/viewLocales";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  DEFAULT_TECH_CATEGORIES,
  DEFAULT_MARKETING_CATEGORIES,
  DEFAULT_BUSINESS_CATEGORIES,
} from "./quick-log/quickLogPresets";
import { useQuickLogForm } from "./quick-log/useQuickLogForm";
import { QuickLogTitleField } from "./quick-log/QuickLogTitleField";
import { QuickLogAccordions } from "./quick-log/QuickLogAccordions";
import { QuickLogContextPanel } from "./quick-log/QuickLogContextPanel";
import { formatHistoryButtonLabel } from "../utils/revisions/snapshot";

export {
  DEFAULT_TECH_CATEGORIES,
  DEFAULT_MARKETING_CATEGORIES,
  DEFAULT_BUSINESS_CATEGORIES,
};

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">,
    source?: RevisionSource
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void> | void;
  onCreateExperience?: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
  ) => Promise<WorkExperience>;
  existingLogs: LogEntry[];
  experiences?: WorkExperience[];
  initialData?: LogEntry | null;
  restoredDraft?: RestoredLogDraft | null;
  onOpenHistory?: () => void;
  initialExperienceId?: string;
  initialBulletText?: string;
  initialDraft?: InboxAchievementDraft | null;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onCreateExperience,
  existingLogs,
  experiences = [],
  initialData,
  restoredDraft,
  onOpenHistory,
  initialExperienceId,
  initialBulletText,
  initialDraft,
}) => {
  const { t, language } = useI18n();
  const tl = VIEW_LOCALES[language]?.timeline || VIEW_LOCALES.en.timeline;
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const templatesDropdownRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
    setDeleteError(null);
  }, [isOpen, initialData?.id]);

  const form = useQuickLogForm({
    isOpen,
    existingLogs,
    experiences,
    initialData,
    restoredDraft,
    initialExperienceId,
    initialBulletText,
    initialDraft,
    onSave,
    onCreateExperience,
    onClose,
    titleInputRef,
  });

  const { isListening, speechSupported, toggleListening } = useSpeechRecognition(
    (transcript) =>
      form.setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesDropdownRef.current &&
        !templatesDropdownRef.current.contains(event.target as Node)
      ) {
        form.setIsTemplatesOpen(false);
      }
    };
    if (form.isTemplatesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [form.isTemplatesOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void form.handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] isolate flex items-center justify-center p-3 sm:p-5 bg-black/85 animate-in fade-in duration-200"
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-[#0B0F19] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              {initialData ? t.modals.quickLogEditTitle : t.modals.quickLogTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {initialData?.id && onOpenHistory && (
              <button
                type="button"
                disabled={form.isSaving}
                onClick={onOpenHistory}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium tabular-nums inline-flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Ver historial de cambios de este logro"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatHistoryButtonLabel(initialData.updatesCount, "es")}</span>
              </button>
            )}
            <button
              type="button"
              disabled={form.isSaving}
              onClick={onClose}
              aria-label={t.common.close}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2 bg-slate-900/50 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-1 rounded-md shrink-0 ${
                  form.includeInCv
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span
                  className={`text-xs font-semibold ${
                    form.includeInCv ? "text-cyan-300" : "text-slate-300"
                  }`}
                >
                  {form.includeInCv ? "Viñeta activa en Experiencia / CV" : "Solo en Bitácora"}
                </span>
              </div>
            </div>

            <label
              className="relative inline-flex items-center cursor-pointer shrink-0"
              title={
                form.includeInCv
                  ? "Ocultar de viñetas de Experiencia y CV"
                  : "Mostrar como viñeta en Experiencia y CV"
              }
            >
              <input
                type="checkbox"
                checked={form.includeInCv}
                onChange={(e) => form.setIncludeInCv(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-cyan-500" />
            </label>
          </div>

          <span className="hidden sm:inline text-slate-700">·</span>

          <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`p-1 rounded-md shrink-0 ${
                  form.isPublic
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                }`}
              >
                {form.isPublic ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="truncate">
                <span
                  className={`text-xs font-semibold ${
                    form.isPublic ? "text-emerald-300" : "text-slate-300"
                  }`}
                >
                  {form.isPublic ? "Visible en Vitrina Pública" : "Bóveda Privada"}
                </span>
              </div>
            </div>

            <label
              className="relative inline-flex items-center cursor-pointer shrink-0"
              title={
                form.isPublic ? "Cambiar a Bóveda Privada" : "Hacer Visible en Vitrina Pública"
              }
            >
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => form.setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        <form onSubmit={form.handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {restoredDraft && (
            <div
              role="status"
              className="p-3 rounded-xl bg-cyan-950/45 border border-cyan-700/60 text-cyan-100 text-xs flex items-start gap-2.5"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Borrador restaurado desde{" "}
                <strong className="font-mono">v{restoredDraft.versionNumber}</strong>.
                No se guardará hasta que pulses Guardar.
              </span>
            </div>
          )}

          {(form.saveError || deleteError) && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/70 border border-red-700/70 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{deleteError || form.saveError}</span>
            </div>
          )}

          <QuickLogTitleField
            language={language}
            titleInputRef={titleInputRef}
            templatesDropdownRef={templatesDropdownRef}
            title={form.title}
            setTitle={form.setTitle}
            speechSupported={speechSupported}
            isListening={isListening}
            onToggleListening={toggleListening}
            isTemplatesOpen={form.isTemplatesOpen}
            setIsTemplatesOpen={form.setIsTemplatesOpen}
            onApplyPreset={form.applyPreset}
          />

          <QuickLogAccordions
            tl={tl}
            whatWasSought={form.whatWasSought}
            setWhatWasSought={form.setWhatWasSought}
            isWhatSoughtOpen={form.isWhatSoughtOpen}
            setIsWhatSoughtOpen={form.setIsWhatSoughtOpen}
            whyImportant={form.whyImportant}
            setWhyImportant={form.setWhyImportant}
            isWhyImportantOpen={form.isWhyImportantOpen}
            setIsWhyImportantOpen={form.setIsWhyImportantOpen}
            howApplied={form.howApplied}
            setHowApplied={form.setHowApplied}
            isHowAppliedOpen={form.isHowAppliedOpen}
            setIsHowAppliedOpen={form.setIsHowAppliedOpen}
            impact={form.impact}
            setImpact={form.setImpact}
            isImpactOpen={form.isImpactOpen}
            setIsImpactOpen={form.setIsImpactOpen}
            description={form.description}
            setDescription={form.setDescription}
            isDescriptionOpen={form.isDescriptionOpen}
            setIsDescriptionOpen={form.setIsDescriptionOpen}
          />

          <QuickLogContextPanel
            language={language}
            isContextVisible={form.isContextVisible}
            setIsContextVisible={form.setIsContextVisible}
            companyLabel={form.companyLabel}
            category={form.category}
            setCategory={form.setCategory}
            date={form.date}
            setDate={form.setDate}
            experienceId={form.experienceId}
            setExperienceId={form.setExperienceId}
            experiencesList={form.experiencesList}
            isCreatingNewExp={form.isCreatingNewExp}
            setIsCreatingNewExp={form.setIsCreatingNewExp}
            newExpCompany={form.newExpCompany}
            setNewExpCompany={form.setNewExpCompany}
            newExpRole={form.newExpRole}
            setNewExpRole={form.setNewExpRole}
            setClient={form.setClient}
            project={form.project}
            setProject={form.setProject}
            existingProjects={form.existingProjects}
            categoryFilterTab={form.categoryFilterTab}
            setCategoryFilterTab={form.setCategoryFilterTab}
            displayedCategories={form.displayedCategories}
            customCategoryInput={form.customCategoryInput}
            setCustomCategoryInput={form.setCustomCategoryInput}
            onAddCustomCategory={form.handleAddCustomCategory}
            tags={form.tags}
            tagInput={form.tagInput}
            setTagInput={form.setTagInput}
            onAddTag={form.handleAddTag}
            onRemoveTag={form.removeTag}
          />

          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {initialData?.id && onDelete ? (
                confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isDeleting || form.isSaving}
                      onClick={async () => {
                        if (!initialData?.id || isDeleting) return;
                        setIsDeleting(true);
                        setDeleteError(null);
                        try {
                          await onDelete(initialData.id);
                          onClose();
                        } catch (err) {
                          setDeleteError(
                            err instanceof Error ? err.message : "No se pudo eliminar el logro."
                          );
                          setConfirmDelete(false);
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isDeleting
                          ? language === "en"
                            ? "Deleting..."
                            : "Eliminando..."
                          : language === "en"
                            ? "Confirm delete"
                            : "Confirmar"}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={form.isSaving || isDeleting}
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/30 hover:bg-red-950/60 border border-red-800/50 rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-40"
                    title={tl.deleteLogTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === "en" ? "Delete" : "Eliminar"}</span>
                  </button>
                )
              ) : (
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                    Ctrl / ⌘
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                    Enter
                  </kbd>{" "}
                  para guardar rápido
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                disabled={form.isSaving || isDeleting}
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || form.isSaving || isDeleting}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-sm shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                {form.isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                {form.isSaving ? "Guardando..." : t.modals.saveLogBtn}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
