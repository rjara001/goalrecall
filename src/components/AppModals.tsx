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
import { CertificationPrefillDraft } from "../hooks/useAppModals";
import { CvSavedResult } from "../features/cv-upload/hooks/useCvUpload";
import { ParsedBackupBundle } from "../utils/storage/backupStorage";
import {
  AiUsageRecord,
  CareerGoal,
  InboxAchievementDraft,
  JobOffer,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../types";

export interface AppModalsProps {
  user: UserProfile | null;
  logs: LogEntry[];
  experiences: WorkExperience[];
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  certifications: TechnicalCertification[];
  careerGoals: CareerGoal[];
  aiQuota: AiUsageRecord | null;
  onAiQuotaUpdated: (quota: AiUsageRecord) => void;
  isQuickLogOpen: boolean;
  editingLog: LogEntry | null;
  initialExperienceIdForLog?: string;
  initialBulletTextForLog?: string;
  initialDraftForLog?: InboxAchievementDraft | null;
  onCloseQuickLog: () => void;
  onSaveLog: (entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCreateQuickExperience: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
  ) => Promise<WorkExperience>;
  isExperienceModalOpen: boolean;
  editingExperience: WorkExperience | null;
  onCloseExperienceModal: () => void;
  onSaveExperience: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
    newLogBulletsToCreate?: string[]
  ) => Promise<void>;
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
  experiences,
  inbox,
  jobOffers,
  products,
  certifications,
  careerGoals,
  aiQuota,
  onAiQuotaUpdated,
  isQuickLogOpen,
  editingLog,
  initialExperienceIdForLog,
  initialBulletTextForLog,
  initialDraftForLog,
  onCloseQuickLog,
  onSaveLog,
  onCreateQuickExperience,
  isExperienceModalOpen,
  editingExperience,
  onCloseExperienceModal,
  onSaveExperience,
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
  return (
    <>
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={onCloseQuickLog}
        onSave={onSaveLog}
        onCreateExperience={onCreateQuickExperience}
        existingLogs={logs}
        experiences={experiences}
        initialData={editingLog}
        initialExperienceId={initialExperienceIdForLog}
        initialBulletText={initialBulletTextForLog}
        initialDraft={initialDraftForLog}
      />

      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={onCloseExperienceModal}
        onSave={onSaveExperience}
        initialData={editingExperience}
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
    </>
  );
};
