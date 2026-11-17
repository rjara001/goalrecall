import React from "react";
import { RotateCcw, Save, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { LogEntry, UserProfile, WorkExperience } from "../../../types";
import { useI18n } from "../../../i18n";
import { MAX_FREE_MONTHLY_AI_USES } from "../../../utils/storage";
import { ProUpgradeModal } from "../../../components/ProUpgradeModal";
import { useCvUpload } from "../hooks/useCvUpload";
import { CvDropzone } from "./CvDropzone";
import { CvProcessingState } from "./CvProcessingState";
import { CvCompletenessBar } from "./CvCompletenessBar";
import { CvPendingTab } from "./CvPendingTab";
import { CvRadiographyTab } from "./CvRadiographyTab";
import { CvBulletsTab } from "./CvBulletsTab";
import { CvPendingFieldEditor } from "./CvPendingFieldEditor";

export interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLogs: (logs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => void;
  onExperiencesUpdated?: (updated: WorkExperience[]) => void;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const CvUploadModal: React.FC<CvUploadModalProps> = ({
  isOpen, onClose, onImportLogs, onExperiencesUpdated, currentUser, onUpdateProfile,
}) => {
  const { t } = useI18n();
  const state = useCvUpload({ isOpen, onClose, onImportLogs, onExperiencesUpdated, currentUser, onUpdateProfile });

  if (!isOpen) return null;

  const isProcessing = state.phase === "processing";
  const showUpload = (state.phase === "upload" || state.phase === "quota_exceeded") && !state.extractedCv;
  const showReview = state.phase === "review" && state.extractedCv !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-[#0B0F19] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-900/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{t.cv.modalTitle}</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {t.publicDeck.verifiedBadge}
                </span>
                <button
                  type="button"
                  onClick={() => state.setShowProModal(true)}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Detalles de cuota y plan"
                >
                  <Zap className={`w-3 h-3 ${state.aiUsage.count >= MAX_FREE_MONTHLY_AI_USES ? "text-amber-400" : "text-purple-400"}`} />
                  <span>{state.aiUsage.count} / {MAX_FREE_MONTHLY_AI_USES} AI</span>
                  <span className="text-purple-400 font-semibold underline ml-0.5">Pro</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">{t.cv.modalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.extractedCv && (
              <button
                type="button"
                onClick={state.resetState}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cargar otro documento"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo Archivo</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showUpload && (
            <CvDropzone
              activeTab={state.activeTab}
              onTabChange={state.setActiveTab}
              isDragging={state.isDragging}
              onDraggingChange={state.setIsDragging}
              pastedCvText={state.pastedCvText}
              onPastedTextChange={state.setPastedCvText}
              onFileSelect={state.handleFileSelect}
              onPasteText={state.handlePasteText}
              onLoadSamplePdf={state.handleLoadSamplePdf}
              onLoadSampleText={state.handleLoadSampleText}
              isLoadingSamplePdf={state.isLoadingSamplePdf}
              quotaExhausted={state.phase === "quota_exceeded"}
              aiUsageCount={state.aiUsage.count}
              errorMessage={state.errorMessage}
              onRunLocalExtractor={state.handleRunLocalExtractor}
              onShowProModal={() => state.setShowProModal(true)}
            />
          )}

          {isProcessing && <CvProcessingState processingStep={state.processingStep} />}

          {showReview && state.extractedCv && (
            <div className="space-y-6">
              <CvCompletenessBar
                completenessScore={state.completenessScore}
                pendingCount={state.pendingFields.length}
                bulletsCount={state.extractedBullets.length}
                reviewTab={state.reviewTab}
                onReviewTabChange={state.setReviewTab}
                fallbackNotice={state.fallbackNotice}
              />

              {state.reviewTab === "pending" && (
                <CvPendingTab pendingFields={state.pendingFields} onOpenFillPending={state.handleOpenFillPending} />
              )}

              {state.reviewTab === "radiography" && (
                <CvRadiographyTab
                  extractedCv={state.extractedCv}
                  onUpdateContactField={state.handleUpdateContactField}
                  onUpdateSummary={state.handleUpdateSummary}
                />
              )}

              {state.reviewTab === "bullets" && (
                <CvBulletsTab
                  extractedBullets={state.extractedBullets}
                  onToggleSelectBullet={state.toggleSelectBullet}
                  onToggleSelectAll={state.toggleSelectAll}
                  onRemoveBullet={state.removeBullet}
                />
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {state.extractedCv && (
              <span>Auditoría: <strong>{state.completenessScore}%</strong> · {state.pendingFields.length} pendientes</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              Cerrar
            </button>
            {state.extractedCv && (
              <button
                type="button"
                onClick={state.handleSaveAndApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar CV y Aplicar a mi Bitácora / Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      <CvPendingFieldEditor
        activeFieldEditing={state.activeFieldEditing}
        quickFieldValue={state.quickFieldValue}
        onQuickFieldValueChange={state.setQuickFieldValue}
        onSave={state.handleSaveFilledField}
        onClose={() => state.setActiveFieldEditing(null)}
      />

      <ProUpgradeModal
        isOpen={state.showProModal}
        onClose={() => { state.setShowProModal(false); state.setProEmailSaved(false); }}
        proEmail={state.proEmail}
        onProEmailChange={state.setProEmail}
        proEmailSaved={state.proEmailSaved}
        onSaveProEmail={state.handleSaveProEmail}
      />
    </div>
  );
};
