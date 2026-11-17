import React from "react";
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
import {
  CareerGoal,
  InboxAchievementDraft,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  WorkExperience,
} from "../types";

export interface AppModalsProps {
  user: UserProfile | null;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
  isQuickLogOpen: boolean;
  editingLog: LogEntry | null;
  initialExperienceIdForLog?: string;
  initialBulletTextForLog?: string;
  initialDraftForLog?: InboxAchievementDraft | null;
  onCloseQuickLog: () => void;
  onSaveLog: (entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => void;
  isExperienceModalOpen: boolean;
  editingExperience: WorkExperience | null;
  onCloseExperienceModal: () => void;
  onSaveExperience: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
    newLogBulletsToCreate?: string[]
  ) => void;
  isCvUploadOpen: boolean;
  onCloseCvUpload: () => void;
  onImportBatchLogs: (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => void;
  onExperiencesUpdated: (updated: WorkExperience[]) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  isPasteBulletsOpen: boolean;
  onClosePasteBullets: () => void;
  onOpenCvModal: () => void;
  isAuthOpen: boolean;
  onCloseAuth: () => void;
  onLogin: (newUser: UserProfile) => Promise<void> | void;
  onLogout: () => void;
  onOpenAvatarModal: () => void;
  onLoginDev: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  onDataChanged: () => void;
  isAvatarModalOpen: boolean;
  onCloseAvatarModal: () => void;
  onSaveAvatar: (newAvatarUrl: string) => void;
  isShareModalOpen: boolean;
  onCloseShareModal: () => void;
  isProductModalOpen: boolean;
  editingProduct: Product | null;
  onCloseProductModal: () => void;
  onSaveProduct: (productData: any) => void;
  isCertificationModalOpen: boolean;
  editingCertification: TechnicalCertification | null;
  certificationPrefill: CertificationPrefillDraft | null;
  onCloseCertificationModal: () => void;
  onSaveCertification: (
    certData: Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt"> | TechnicalCertification,
    sourceGoalId?: string
  ) => void;
  isCareerGoalModalOpen: boolean;
  editingCareerGoal: CareerGoal | null;
  onCloseCareerGoalModal: () => void;
  onSaveCareerGoal: (
    goalData: Omit<CareerGoal, "id" | "createdAt" | "updatedAt"> | CareerGoal
  ) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  user,
  logs,
  products,
  certifications,
  isQuickLogOpen,
  editingLog,
  initialExperienceIdForLog,
  initialBulletTextForLog,
  initialDraftForLog,
  onCloseQuickLog,
  onSaveLog,
  isExperienceModalOpen,
  editingExperience,
  onCloseExperienceModal,
  onSaveExperience,
  isCvUploadOpen,
  onCloseCvUpload,
  onImportBatchLogs,
  onExperiencesUpdated,
  onUpdateProfile,
  isPasteBulletsOpen,
  onClosePasteBullets,
  onOpenCvModal,
  isAuthOpen,
  onCloseAuth,
  onLogin,
  onLogout,
  onOpenAvatarModal,
  onLoginDev,
  isSettingsOpen,
  onCloseSettings,
  onDataChanged,
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
        existingLogs={logs}
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
        onImportLogs={onImportBatchLogs}
        onExperiencesUpdated={onExperiencesUpdated}
        currentUser={user}
        onUpdateProfile={onUpdateProfile}
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
        onLoginDev={onLoginDev}
      />

      <SettingsBackupModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        onDataChanged={onDataChanged}
        totalLogs={logs.length}
        currentUser={user}
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
