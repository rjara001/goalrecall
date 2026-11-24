import { useCallback, useEffect, useRef, useState } from "react";
import {
  CareerGoal,
  EntityRevision,
  ExperienceRevisionSnapshot,
  InboxAchievementDraft,
  LogEntry,
  LogRevisionSnapshot,
  Product,
  RevisionEntityType,
  TechnicalCertification,
  WorkExperience,
} from "../types";
import { deriveExperienceBulletsFromLogs } from "../utils/bulletToLogMapper";
import {
  buildExperienceRevisionSnapshot,
  buildLogRevisionSnapshot,
} from "../utils/revisions/snapshot";

export interface CertificationPrefillDraft {
  name: string;
  issuer?: string;
  issueDate?: string;
  summary?: string;
  skills?: string[];
  sourceGoalId?: string;
}

export interface RestoredLogDraft {
  logId?: string;
  versionNumber: number;
  snapshot: LogRevisionSnapshot;
}

export interface RestoredExperienceDraft {
  experienceId?: string;
  versionNumber: number;
  snapshot: ExperienceRevisionSnapshot;
}

export interface HistoryTarget {
  entityType: RevisionEntityType;
  entityId: string;
  title: string;
  currentSnapshot: LogRevisionSnapshot | ExperienceRevisionSnapshot;
  isDeleted?: boolean;
}

export interface DiffModalState {
  entityType: RevisionEntityType;
  entityTitle: string;
  revisions: EntityRevision[];
  initialBaseId: string;
  initialTargetId: string;
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
  const [restoredLogDraft, setRestoredLogDraft] = useState<RestoredLogDraft | null>(null);
  const [restoredExperienceDraft, setRestoredExperienceDraft] =
    useState<RestoredExperienceDraft | null>(null);
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(null);
  const [diffModalState, setDiffModalState] = useState<DiffModalState | null>(null);
  const [jsonEditorResetNonce, setJsonEditorResetNonce] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const historyTargetRef = useRef(historyTarget);
  historyTargetRef.current = historyTarget;
  const diffModalStateRef = useRef(diffModalState);
  diffModalStateRef.current = diffModalState;

  const openQuickLog = useCallback(
    (
      experienceId?: string,
      initialBulletText?: string,
      options?: { draft?: InboxAchievementDraft; sourceInboxId?: string }
    ) => {
      setEditingLog(null);
      setRestoredLogDraft(null);
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
    setRestoredLogDraft(null);
    setInitialBulletTextForLog(undefined);
    setInitialDraftForLog(null);
    setSourceInboxMessageIdForLog(undefined);
    setIsQuickLogOpen(true);
  }, []);

  const closeQuickLog = useCallback(() => {
    setIsQuickLogOpen(false);
    setEditingLog(null);
    setRestoredLogDraft(null);
    setInitialExperienceIdForLog(undefined);
    setInitialBulletTextForLog(undefined);
    setInitialDraftForLog(null);
    setSourceInboxMessageIdForLog(undefined);
  }, []);

  const openAddExperience = useCallback(() => {
    setEditingExperience(null);
    setRestoredExperienceDraft(null);
    setIsExperienceModalOpen(true);
  }, []);

  const openEditExperience = useCallback((exp: WorkExperience) => {
    setEditingExperience(exp);
    setRestoredExperienceDraft(null);
    setIsExperienceModalOpen(true);
  }, []);

  const closeExperienceModal = useCallback(() => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
    setRestoredExperienceDraft(null);
  }, []);

  const openLogHistory = useCallback((log: LogEntry) => {
    setDiffModalState(null);
    setHistoryTarget({
      entityType: "log",
      entityId: log.id,
      title: log.title || log.logro || "Logro registrado",
      currentSnapshot: buildLogRevisionSnapshot(log),
      isDeleted: Boolean(log.deletedAt),
    });
  }, []);

  const openExperienceHistory = useCallback(
    (exp: WorkExperience, logs: LogEntry[]) => {
      const currentBullets = deriveExperienceBulletsFromLogs(exp, logs);
      setDiffModalState(null);
      setHistoryTarget({
        entityType: "experience",
        entityId: exp.id,
        title: `${exp.role} @ ${exp.company}`,
        currentSnapshot: buildExperienceRevisionSnapshot(exp, currentBullets),
        isDeleted: Boolean(exp.deletedAt),
      });
    },
    []
  );

  const closeHistory = useCallback(() => {
    setDiffModalState(null);
    setHistoryTarget(null);
  }, []);

  const openDiffModal = useCallback((params: DiffModalState) => {
    setDiffModalState(params);
  }, []);

  const closeDiffModal = useCallback(() => {
    setDiffModalState(null);
  }, []);

  const restoreRevision = useCallback(
    (revision: EntityRevision, logs: LogEntry[], experiences: WorkExperience[]) => {
      setDiffModalState(null);
      setHistoryTarget(null);
      setJsonEditorResetNonce((n) => n + 1);

      if (revision.entityType === "log") {
        const targetLog = logs.find((l) => l.id === revision.parentId) || null;
        setEditingLog(targetLog);
        setRestoredLogDraft({
          logId: targetLog?.id,
          versionNumber: revision.versionNumber,
          snapshot: revision.snapshot as LogRevisionSnapshot,
        });
        setInitialExperienceIdForLog(undefined);
        setInitialBulletTextForLog(undefined);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
        setIsQuickLogOpen(true);
        return;
      }

      const targetExp = experiences.find((e) => e.id === revision.parentId) || null;
      setEditingExperience(targetExp);
      setRestoredExperienceDraft({
        experienceId: targetExp?.id,
        versionNumber: revision.versionNumber,
        snapshot: revision.snapshot as ExperienceRevisionSnapshot,
      });
      setIsExperienceModalOpen(true);
    },
    []
  );

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
    setRestoredLogDraft(null);
    setEditingExperience(null);
    setRestoredExperienceDraft(null);
    setHistoryTarget(null);
    setDiffModalState(null);
    setJsonEditorResetNonce((n) => n + 1);
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
        setRestoredLogDraft(null);
        setInitialBulletTextForLog(undefined);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
        setIsQuickLogOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEditingLog(null);
        setRestoredLogDraft(null);
        setInitialBulletTextForLog(undefined);
        setInitialDraftForLog(null);
        setSourceInboxMessageIdForLog(undefined);
        setIsQuickLogOpen(true);
      } else if (e.key === "Escape") {
        if (diffModalStateRef.current) {
          setDiffModalState(null);
          return;
        }
        if (historyTargetRef.current) {
          setHistoryTarget(null);
          return;
        }
        setIsQuickLogOpen(false);
        setIsAuthOpen(false);
        setIsSettingsOpen(false);
        setIsProductModalOpen(false);
        setIsCertificationModalOpen(false);
        setIsCareerGoalModalOpen(false);
        setEditingLog(null);
        setRestoredLogDraft(null);
        setRestoredExperienceDraft(null);
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
    restoredExperienceDraft,
    setRestoredExperienceDraft,
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
    restoredLogDraft,
    setRestoredLogDraft,
    historyTarget,
    diffModalState,
    jsonEditorResetNonce,
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
    openLogHistory,
    openExperienceHistory,
    closeHistory,
    openDiffModal,
    closeDiffModal,
    restoreRevision,
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
