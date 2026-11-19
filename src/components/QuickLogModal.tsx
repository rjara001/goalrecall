import React, { useEffect, useRef } from "react";
import { AlertCircle, X, Sparkles, Eye, Lock, Zap, Loader2, FileText } from "lucide-react";
import { InboxAchievementDraft, LogEntry, WorkExperience } from "../types";
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

export {
  DEFAULT_TECH_CATEGORIES,
  DEFAULT_MARKETING_CATEGORIES,
  DEFAULT_BUSINESS_CATEGORIES,
};

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCreateExperience?: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
  ) => Promise<WorkExperience>;
  existingLogs: LogEntry[];
  experiences?: WorkExperience[];
  initialData?: LogEntry | null;
  initialExperienceId?: string;
  initialBulletText?: string;
  initialDraft?: InboxAchievementDraft | null;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onCreateExperience,
  existingLogs,
  experiences = [],
  initialData,
  initialExperienceId,
  initialBulletText,
  initialDraft,
}) => {
  const { t, language } = useI18n();
  const tl = VIEW_LOCALES[language]?.timeline || VIEW_LOCALES.en.timeline;
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const templatesDropdownRef = useRef<HTMLDivElement>(null);

  const form = useQuickLogForm({
    isOpen,
    existingLogs,
    experiences,
    initialData,
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
          {form.saveError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/70 border border-red-700/70 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{form.saveError}</span>
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

          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
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

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                disabled={form.isSaving}
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || form.isSaving}
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
