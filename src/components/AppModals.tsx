import React from "react";
import { User as FirebaseAuthUser } from "firebase/auth";
import { QuickLogModal } from "./QuickLogModal";
import { AuthModal } from "./AuthModal";
import { SettingsBackupModal } from "./SettingsBackupModal";
import { PasteBulletsModal } from "./PasteBulletsModal";
import { CvUploadModal } from "./CvUploadModal";
import { ExperienceModal } from "./ExperienceModal";
import { AvatarModal } from "./AvatarModal";
import { ProductModal } from "./ProductModal";
import { ShareDeckModal } from "./ShareDeckModal";
import { CertificationModal } from "./CertificationModal";
import { CareerGoalModal } from "./CareerGoalModal";
import { RevisionHistoryFlyout } from "./revisions/RevisionHistoryFlyout";
import { RevisionDiffModal } from "./revisions/RevisionDiffModal";
import {
  CertificationPrefillDraft,
  DiffModalState,
  HistoryTarget,
  RestoredExperienceDraft,
  RestoredLogDraft,
} from "../hooks/useAppModals";
import { CvSavedResult } from "../features/cv-upload/hooks/useCvUpload";
import { ParsedBackupBundle } from "../utils/storage/backupStorage";
import {
  AiUsageRecord,
  CareerGoal,
  EntityRevision,
  InboxAchievementDraft,
  JobOffer,
  LogEntry,
  Product,
  RevisionEntityType,
  RevisionSource,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../types";

export interface AppModalsProps {
  user: UserProfile | null;
  logs: LogEntry[];
  deletedLogs?: LogEntry[];
  experiences: WorkExperience[];
  deletedExperiences?: WorkExperience[];
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  certifications: TechnicalCertification[];
  careerGoals: CareerGoal[];
  aiQuota: AiUsageRecord | null;
  onAiQuotaUpdated: (quota: AiUsageRecord) => void;
  isQuickLogOpen: boolean;
  editingLog: LogEntry | null;
  restoredLogDraft?: RestoredLogDraft | null;
  onOpenLogHistory?: (log: LogEntry) => void;
  initialExperienceIdForLog?: string;
  initialBulletTextForLog?: string;
  initialDraftForLog?: InboxAchievementDraft | null;
  onCloseQuickLog: () => void;
  onSaveLog: (
    entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">,
    source?: RevisionSource
  ) => Promise<void>;
  onDeleteLog?: (id: string) => Promise<void>;
  onCreateQuickExperience: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
  ) => Promise<WorkExperience>;
  isExperienceModalOpen: boolean;
  editingExperience: WorkExperience | null;
  restoredExperienceDraft?: RestoredExperienceDraft | null;
  onOpenExperienceHistory?: (exp: WorkExperience) => void;
  onCloseExperienceModal: () => void;
  onSaveExperience: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
    newLogBulletsToCreate?: string[],
    editedLogs?: LogEntry[],
    source?: RevisionSource
  ) => Promise<void>;
  historyTarget: HistoryTarget | null;
  onCloseHistory: () => void;
  onRecoverDeletedHistoryTarget?: (target: HistoryTarget) => Promise<void> | void;
  diffModalState: DiffModalState | null;
  onOpenDiffModal: (params: DiffModalState) => void;
  onCloseDiffModal: () => void;
  onRestoreRevision: (revision: EntityRevision) => void;
  onSyncRevisionUpdatesCount?: (
    entityType: RevisionEntityType,
    entityId: string,
    updatesCount: number
  ) => void;
  isCvUploadOpen: boolean;
  onCloseCvUpload: () => void;
  onCvSaved: (result: CvSavedResult) => Promise<void>;
  onImportBatchLogs: (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => Promise<void>;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
  isPasteBulletsOpen: boolean;
  onClosePasteBullets: () => void;
  onOpenCvModal: () => void;
  isAuthOpen: boolean;
  onCloseAuth: () => void;
  onLogin: (fbUser: FirebaseAuthUser) => Promise<void>;
  onLogout: () => Promise<void> | void;
  onOpenAvatarModal: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  onImportBackupData: (bundle: ParsedBackupBundle) => Promise<number>;
  isAvatarModalOpen: boolean;
  onCloseAvatarModal: () => void;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void>;
  isShareModalOpen: boolean;
  onCloseShareModal: () => void;
  isProductModalOpen: boolean;
  editingProduct: Product | null;
  onCloseProductModal: () => void;
  onSaveProduct: (productData: Omit<Product, "id" | "createdAt"> | Product) => Promise<void>;
  isCertificationModalOpen: boolean;
  editingCertification: TechnicalCertification | null;
  certificationPrefill: CertificationPrefillDraft | null;
  onCloseCertificationModal: () => void;
  onSaveCertification: (
    certData: Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt"> | TechnicalCertification,
    sourceGoalId?: string
  ) => Promise<void>;
  isCareerGoalModalOpen: boolean;
  editingCareerGoal: CareerGoal | null;
  onCloseCareerGoalModal: () => void;
  onSaveCareerGoal: (
    goalData: Omit<CareerGoal, "id" | "createdAt" | "updatedAt"> | CareerGoal
  ) => Promise<void>;
}

export const AppModals: React.FC<AppModalsProps> = ({
  user,
  logs,
  deletedLogs = [],
  experiences,
  deletedExperiences = [],
  inbox,
  jobOffers,
  products,
  certifications,
  careerGoals,
  aiQuota,
  onAiQuotaUpdated,
  isQuickLogOpen,
  editingLog,
  restoredLogDraft,
  onOpenLogHistory,
  initialExperienceIdForLog,
  initialBulletTextForLog,
  initialDraftForLog,
  onCloseQuickLog,
  onSaveLog,
  onDeleteLog,
  onCreateQuickExperience,
  isExperienceModalOpen,
  editingExperience,
  restoredExperienceDraft,
  onOpenExperienceHistory,
  onCloseExperienceModal,
  onSaveExperience,
  historyTarget,
  onCloseHistory,
  onRecoverDeletedHistoryTarget,
  diffModalState,
  onOpenDiffModal,
  onCloseDiffModal,
  onRestoreRevision,
  onSyncRevisionUpdatesCount,
  isCvUploadOpen,
  onCloseCvUpload,
  onCvSaved,
  onImportBatchLogs,
  onUpdateProfile,
  isPasteBulletsOpen,
  onClosePasteBullets,
  onOpenCvModal,
  isAuthOpen,
  onCloseAuth,
  onLogin,
  onLogout,
  onOpenAvatarModal,
  isSettingsOpen,
  onCloseSettings,
  onImportBackupData,
  isAvatarModalOpen,
  onCloseAvatarModal,
  onSaveAvatar,
  isShareModalOpen,
  onCloseShareModal,
  isProductModalOpen,
  editingProduct,
  onCloseProductModal,
  onSaveProduct,
  isCertificationModalOpen,
  editingCertification,
  certificationPrefill,
  onCloseCertificationModal,
  onSaveCertification,
  isCareerGoalModalOpen,
  editingCareerGoal,
  onCloseCareerGoalModal,
  onSaveCareerGoal,
}) => {
  const liveEditingLog = editingLog
    ? logs.find((l) => l.id === editingLog.id) ||
      deletedLogs.find((l) => l.id === editingLog.id) ||
      editingLog
    : null;
  const liveEditingExperience = editingExperience
    ? experiences.find((e) => e.id === editingExperience.id) ||
      deletedExperiences.find((e) => e.id === editingExperience.id) ||
      editingExperience
    : null;

  return (
    <>
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={onCloseQuickLog}
        onSave={onSaveLog}
        onDelete={onDeleteLog}
        onCreateExperience={onCreateQuickExperience}
        existingLogs={logs}
        experiences={experiences}
        initialData={liveEditingLog}
        restoredDraft={restoredLogDraft}
        onOpenHistory={liveEditingLog ? () => onOpenLogHistory?.(liveEditingLog) : undefined}
        initialExperienceId={initialExperienceIdForLog}
        initialBulletText={initialBulletTextForLog}
        initialDraft={initialDraftForLog}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={onCloseExperienceModal}
        onSave={onSaveExperience}
        initialData={liveEditingExperience}
        restoredDraft={restoredExperienceDraft}
        onOpenHistory={
          liveEditingExperience
            ? () => onOpenExperienceHistory?.(liveEditingExperience)
            : undefined
        }
        existingLogs={logs}
      />

      <CvUploadModal
        isOpen={isCvUploadOpen}
        onClose={onCloseCvUpload}
        existingExperiences={experiences}
        currentUser={user}
        aiQuota={aiQuota}
        onAiQuotaUpdated={onAiQuotaUpdated}
        onCvSaved={onCvSaved}
      />

      <PasteBulletsModal
        isOpen={isPasteBulletsOpen}
        onClose={onClosePasteBullets}
        onImportLogs={onImportBatchLogs}
        onOpenCvModal={onOpenCvModal}
        experiences={experiences}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={onCloseAuth}
        currentUser={user}
        onLogin={onLogin}
        onLogout={onLogout}
        onUpdateProfile={onUpdateProfile}
        onOpenAvatarModal={onOpenAvatarModal}
      />

      <SettingsBackupModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        totalLogs={logs.length}
        currentUser={user}
        backupState={{
          user,
          logs,
          experiences,
          inbox,
          jobOffers,
          products,
          certifications,
          careerGoals,
        }}
        onImportBackupData={onImportBackupData}
        onUpdateProfile={onUpdateProfile}
        onOpenAvatarModal={onOpenAvatarModal}
      />

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={onCloseAvatarModal}
        currentAvatar={
          user?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        }
        userName={user?.name || "Usuario"}
        onSaveAvatar={onSaveAvatar}
      />

      {user && (
        <ShareDeckModal
          isOpen={isShareModalOpen}
          onClose={onCloseShareModal}
          user={user}
          logs={logs}
          products={products}
          certifications={certifications}
        />
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={onCloseProductModal}
        onSave={onSaveProduct}
        product={editingProduct}
        availableLogs={logs}
      />

      <CertificationModal
        isOpen={isCertificationModalOpen}
        onClose={onCloseCertificationModal}
        onSave={onSaveCertification}
        certification={editingCertification}
        prefill={certificationPrefill}
      />

      <CareerGoalModal
        isOpen={isCareerGoalModalOpen}
        onClose={onCloseCareerGoalModal}
        onSave={onSaveCareerGoal}
        goal={editingCareerGoal}
      />

      <RevisionHistoryFlyout
        target={historyTarget}
        onClose={onCloseHistory}
        onCompare={({ base, target, revisions }) => {
          if (!historyTarget) return;
          onOpenDiffModal({
            entityType: historyTarget.entityType,
            entityTitle: historyTarget.title,
            revisions,
            initialBaseId: base.id,
            initialTargetId: target.id,
          });
        }}
        onRestore={onRestoreRevision}
        onRecoverDeleted={onRecoverDeletedHistoryTarget}
        onSyncUpdatesCount={onSyncRevisionUpdatesCount}
      />

      <RevisionDiffModal
        state={diffModalState}
        onClose={onCloseDiffModal}
        onRestoreRevision={onRestoreRevision}
      />
    </>
  );
};
