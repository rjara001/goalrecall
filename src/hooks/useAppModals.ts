import { useCallback, useEffect, useState } from "react";
import {
  CareerGoal,
  InboxAchievementDraft,
  LogEntry,
  Product,
  TechnicalCertification,
  WorkExperience,
} from "../types";

export interface CertificationPrefillDraft {
  name: string;
  issuer?: string;
  issueDate?: string;
  summary?: string;
  skills?: string[];
  sourceGoalId?: string;
}

export const useAppModals = () => {
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [isPasteBulletsOpen, setIsPasteBulletsOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [isCareerGoalModalOpen, setIsCareerGoalModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCertification, setEditingCertification] =
    useState<TechnicalCertification | null>(null);
  const [certificationPrefill, setCertificationPrefill] =
    useState<CertificationPrefillDraft | null>(null);
  const [editingCareerGoal, setEditingCareerGoal] = useState<CareerGoal | null>(null);
  const [initialExperienceIdForLog, setInitialExperienceIdForLog] = useState<string | undefined>(
    undefined
  );
  const [initialBulletTextForLog, setInitialBulletTextForLog] = useState<string | undefined>(
    undefined
  );
  const [initialDraftForLog, setInitialDraftForLog] = useState<InboxAchievementDraft | null>(null);
  const [sourceInboxMessageIdForLog, setSourceInboxMessageIdForLog] = useState<string | undefined>(
    undefined
  );
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const openQuickLog = useCallback(
    (
      experienceId?: string,
      initialBulletText?: string,
      options?: { draft?: InboxAchievementDraft; sourceInboxId?: string }
    ) => {
      setEditingLog(null);
      setInitialExperienceIdForLog(experienceId);
      setInitialBulletTextForLog(initialBulletText);
      setInitialDraftForLog(options?.draft || null);
      setSourceInboxMessageIdForLog(options?.sourceInboxId);
      setIsQuickLogOpen(true);
    },
    []
  );

  const openEditLog = useCallback((log: LogEntry) => {
    setEditingLog(log);
    setInitialBulletTextForLog(undefined);
    setInitialDraftForLog(null);
    setSourceInboxMessageIdForLog(undefined);
    setIsQuickLogOpen(true);
  }, []);

  const closeQuickLog = useCallback(() => {
    setIsQuickLogOpen(false);
    setEditingLog(null);
    setInitialExperienceIdForLog(undefined);
    setInitialBulletTextForLog(undefined);
    setInitialDraftForLog(null);
    setSourceInboxMessageIdForLog(undefined);
  }, []);

  const openAddExperience = useCallback(() => {
    setEditingExperience(null);
    setIsExperienceModalOpen(true);
  }, []);

  const openEditExperience = useCallback((exp: WorkExperience) => {
    setEditingExperience(exp);
    setIsExperienceModalOpen(true);
  }, []);

  const closeExperienceModal = useCallback(() => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
  }, []);

  const openNewProduct = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }, []);

  const openEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  }, []);

  const openNewCertification = useCallback((prefill?: CertificationPrefillDraft) => {
    setEditingCertification(null);
    setCertificationPrefill(prefill || null);
    setIsCertificationModalOpen(true);
  }, []);

  const openEditCertification = useCallback((cert: TechnicalCertification) => {
    setCertificationPrefill(null);
    setEditingCertification(cert);
    setIsCertificationModalOpen(true);
  }, []);

  const closeCertificationModal = useCallback(() => {
    setIsCertificationModalOpen(false);
    setEditingCertification(null);
    setCertificationPrefill(null);
  }, []);

  const openNewCareerGoal = useCallback(() => {
    setEditingCareerGoal(null);
    setIsCareerGoalModalOpen(true);
  }, []);

  const openEditCareerGoal = useCallback((goal: CareerGoal) => {
    setEditingCareerGoal(goal);
    setIsCareerGoalModalOpen(true);
  }, []);

  const closeCareerGoalModal = useCallback(() => {
    setIsCareerGoalModalOpen(false);
    setEditingCareerGoal(null);
  }, []);

  const resetAllModals = useCallback(() => {
    setIsAuthOpen(false);
    setIsSettingsOpen(false);
    setIsQuickLogOpen(false);
    setIsCvUploadOpen(false);
    setIsPasteBulletsOpen(false);
    setIsExperienceModalOpen(false);
    setIsProductModalOpen(false);
    setIsCertificationModalOpen(false);
    setIsCareerGoalModalOpen(false);
    setIsAvatarModalOpen(false);
    setIsShareModalOpen(false);
    setEditingLog(null);
    setEditingExperience(null);
    setEditingProduct(null);
    setEditingCertification(null);
    setCertificationPrefill(null);
    setEditingCareerGoal(null);
    setInitialExperienceIdForLog(undefined);
    setInitialBulletTextForLog(undefined);
    setInitialDraftForLog(null);
    setSourceInboxMessageIdForLog(undefined);
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl+K, Alt+L, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEditingLog(null);
        setInitialBulletTextForLog(undefined);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
        setIsQuickLogOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEditingLog(null);
        setInitialBulletTextForLog(undefined);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
        setIsQuickLogOpen(true);
      } else if (e.key === "Escape") {
        setIsQuickLogOpen(false);
        setIsAuthOpen(false);
        setIsSettingsOpen(false);
        setIsProductModalOpen(false);
        setIsCertificationModalOpen(false);
        setIsCareerGoalModalOpen(false);
        setEditingLog(null);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isQuickLogOpen,
    setIsQuickLogOpen,
    isCvUploadOpen,
    setIsCvUploadOpen,
    isPasteBulletsOpen,
    setIsPasteBulletsOpen,
    isExperienceModalOpen,
    setIsExperienceModalOpen,
    isProductModalOpen,
    setIsProductModalOpen,
    isCertificationModalOpen,
    setIsCertificationModalOpen,
    isCareerGoalModalOpen,
    setIsCareerGoalModalOpen,
    editingExperience,
    setEditingExperience,
    editingProduct,
    setEditingProduct,
    editingCertification,
    setEditingCertification,
    certificationPrefill,
    editingCareerGoal,
    setEditingCareerGoal,
    initialExperienceIdForLog,
    setInitialExperienceIdForLog,
    initialBulletTextForLog,
    initialDraftForLog,
    sourceInboxMessageIdForLog,
    editingLog,
    setEditingLog,
    isAuthOpen,
    setIsAuthOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    openQuickLog,
    openEditLog,
    closeQuickLog,
    openAddExperience,
    openEditExperience,
    closeExperienceModal,
    openNewProduct,
    openEditProduct,
    closeProductModal,
    openNewCertification,
    openEditCertification,
    closeCertificationModal,
    openNewCareerGoal,
    openEditCareerGoal,
    closeCareerGoalModal,
    resetAllModals,
  };
};
