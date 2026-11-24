import { useCallback, useEffect, useRef, useState } from "react";
import { User as FirebaseAuthUser } from "firebase/auth";
import {
  auth,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  testConnection,
} from "../firebase";
import {
  buildLogFromExtractedBullet,
  buildLogFromSavedExperienceBullet,
  compareLogEntriesByOrder,
  deriveExperienceBulletsFromLogs,
  doesLogBelongToExperience,
  findLegacyUnlinkedBullets,
  getExperienceChildLogs,
  reorderLogsWithinGroup,
} from "../utils/bulletToLogMapper";
import { ParsedBackupBundle } from "../utils/storage/backupStorage";
import {
  ParsedExperienceJson,
  reconcileImportedExperienceJson,
} from "../utils/experienceJson";
import { formatFirestoreUiError } from "../utils/firestore/errors";
import {
  createCareerGoalFirestore,
  createCertificationFirestore,
  createExperienceFirestore,
  createInboxBatchFirestore,
  createInboxMessageFirestore,
  createJobOfferFirestore,
  createLogFirestore,
  createLogsBatchFirestore,
  createProductFirestore,
  deleteCareerGoalFirestore,
  deleteCertificationFirestore,
  deleteExperienceFirestore,
  deleteJobOfferFirestore,
  deleteLogFirestore,
  deleteInboxMessageFirestore,
  deleteProductFirestore,
  ExperienceProjectionSync,
  importBackupBundleToFirestore,
  importExperienceJsonFirestore,
  loadWorkspaceFromFirestore,
  permanentlyDeleteExperienceFirestore,
  permanentlyDeleteLogFirestore,
  reorderLogsBatchFirestore,
  restoreExperienceFirestore,
  restoreLogFirestore,
  saveUserProfileFirestore,
  syncEntityUpdatesCountFirestore,
  syncPublicShowcaseFirestore,
  updateCareerGoalFirestore,
  updateCertificationFirestore,
  updateExperienceFirestore,
  updateInboxMessageStatusFirestore,
  updateJobOfferFirestore,
  updateLogFirestore,
  updateLogMetadataFirestore,
  updateProductFirestore,
} from "../utils/firestore/repository";
import {
  AiUsageRecord,
  CareerGoal,
  CareerGoalStatus,
  ExtractedCvData,
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
import { useI18n } from "../i18n";
import { ToastType } from "./useToast";

export interface UseWorkspaceDataOptions {
  showToast: (message: string, type?: ToastType) => void;
  onAuthenticatedNavigate: () => void;
  onLoggedOutNavigate: () => void;
  shouldRedirectLandingToQuarters?: () => boolean;
}

export const useWorkspaceData = ({
  showToast,
  onAuthenticatedNavigate,
  onLoggedOutNavigate,
  shouldRedirectLandingToQuarters,
}: UseWorkspaceDataOptions) => {
  const { t } = useI18n();

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const onAuthenticatedNavigateRef = useRef(onAuthenticatedNavigate);
  onAuthenticatedNavigateRef.current = onAuthenticatedNavigate;
  const onLoggedOutNavigateRef = useRef(onLoggedOutNavigate);
  onLoggedOutNavigateRef.current = onLoggedOutNavigate;
  const shouldRedirectLandingRef = useRef(shouldRedirectLandingToQuarters);
  shouldRedirectLandingRef.current = shouldRedirectLandingToQuarters;

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deletedLogs, setDeletedLogs] = useState<LogEntry[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [deletedExperiences, setDeletedExperiences] = useState<WorkExperience[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [storedCv, setStoredCv] = useState<ExtractedCvData | null>(null);
  const [aiQuota, setAiQuota] = useState<AiUsageRecord | null>(null);
  const [inbox, setInbox] = useState<VisitorMessage[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [certifications, setCertifications] = useState<TechnicalCertification[]>([]);
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);

  const hydratedUidRef = useRef<string | null>(null);
  const hydratingPromiseRef = useRef<Promise<void> | null>(null);

  const stateRef = useRef({
    user,
    logs,
    deletedLogs,
    experiences,
    deletedExperiences,
    inbox,
    jobOffers,
    products,
    certifications,
    careerGoals,
  });
  stateRef.current = {
    user,
    logs,
    deletedLogs,
    experiences,
    deletedExperiences,
    inbox,
    jobOffers,
    products,
    certifications,
    careerGoals,
  };

  const resetLocalState = useCallback(() => {
    hydratedUidRef.current = null;
    setUser(null);
    setStoredCv(null);
    setAiQuota(null);
    setLogs([]);
    setDeletedLogs([]);
    setExperiences([]);
    setDeletedExperiences([]);
    setInbox([]);
    setJobOffers([]);
    setProducts([]);
    setCertifications([]);
    setCareerGoals([]);
  }, []);

  const syncShowcaseIfPublished = useCallback(
    async (overrides?: {
      userProfile?: UserProfile | null;
      logs?: LogEntry[];
      products?: Product[];
      certifications?: TechnicalCertification[];
      createIfMissing?: boolean;
    }) => {
      const targetUser = overrides?.userProfile ?? stateRef.current.user;
      if (!targetUser?.username || !targetUser.id) return;
      try {
        await syncPublicShowcaseFirestore({
          username: targetUser.username,
          userProfile: targetUser,
          logs: overrides?.logs ?? stateRef.current.logs,
          products: overrides?.products ?? stateRef.current.products,
          certifications: overrides?.certifications ?? stateRef.current.certifications,
          createIfMissing: overrides?.createIfMissing ?? false,
        });
      } catch (err) {
        console.warn("[Firestore] Public showcase sync notice:", err);
      }
    },
    []
  );

  const hydrateFromFirebaseUser = useCallback(
    async (
      fbUser: FirebaseAuthUser,
      options?: { navigate?: boolean; showToastMessage?: boolean }
    ) => {
      if (!fbUser.emailVerified) {
        if (auth) {
          await signOut(auth).catch(() => undefined);
        }
        resetLocalState();
        throw new Error(
          "Tu cuenta de Google debe tener el correo electrónico verificado para acceder."
        );
      }

      if (hydratedUidRef.current === fbUser.uid && hydratingPromiseRef.current === null) {
        if (options?.navigate) {
          onAuthenticatedNavigateRef.current();
        }
        return;
      }

      setIsHydrating(true);
      const task = (async () => {
        try {
          const workspace = await loadWorkspaceFromFirestore(fbUser);
          hydratedUidRef.current = fbUser.uid;
          setUser(workspace.user);
          setStoredCv(workspace.cv);
          setAiQuota(workspace.aiQuota);
          setExperiences(workspace.experiences);
          setDeletedExperiences(workspace.deletedExperiences);
          setLogs(workspace.logs);
          setDeletedLogs(workspace.deletedLogs);
          setInbox(workspace.inbox);
          setJobOffers(workspace.jobOffers);
          setProducts(workspace.products);
          setCertifications(workspace.certifications);
          setCareerGoals(workspace.careerGoals);

          if (options?.showToastMessage) {
            showToastRef.current(`${workspace.user.name} · Google ✨`, "success");
          }
          if (options?.navigate) {
            onAuthenticatedNavigateRef.current();
          }
        } catch (err) {
          console.error("[Firestore] Error hydrating workspace:", err);
          showToastRef.current(
            formatFirestoreUiError(err, "No se pudo cargar tu espacio de trabajo."),
            "error"
          );
          throw err;
        } finally {
          setIsHydrating(false);
          hydratingPromiseRef.current = null;
        }
      })();

      hydratingPromiseRef.current = task;
      await task;
    },
    [resetLocalState]
  );

  // Initial Firestore connectivity probe + Firebase Auth listener + Google Redirect check
  useEffect(() => {
    void testConnection();

    if (!auth) {
      setIsHydrating(false);
      setIsAuthReady(true);
      return;
    }

    const firebaseAuth = auth;
    let isMounted = true;

    getRedirectResult(firebaseAuth)
      .then((result) => {
        if (isMounted && result?.user) {
          void hydrateFromFirebaseUser(result.user, {
            navigate: true,
            showToastMessage: true,
          }).catch(() => undefined);
        }
      })
      .catch((err) => {
        console.error("[Auth] Firebase getRedirectResult error:", err);
      });

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!isMounted) return;
      if (!fbUser) {
        resetLocalState();
        setIsHydrating(false);
        setIsAuthReady(true);
        return;
      }

      if (!fbUser.emailVerified) {
        await signOut(firebaseAuth).catch(() => undefined);
        resetLocalState();
        setIsHydrating(false);
        setIsAuthReady(true);
        showToastRef.current(
          "Tu cuenta de Google debe tener el correo verificado para operar en GoalRecall.",
          "error"
        );
        return;
      }

      try {
        const shouldRedirect = shouldRedirectLandingRef.current?.() ?? false;
        await hydrateFromFirebaseUser(fbUser, {
          navigate: shouldRedirect,
          showToastMessage: false,
        });
      } catch {
        // Already surfaced via toast
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [hydrateFromFirebaseUser, resetLocalState]);

  const handleLoginWithFirebaseUser = useCallback(
    async (fbUser: FirebaseAuthUser) => {
      await hydrateFromFirebaseUser(fbUser, {
        navigate: true,
        showToastMessage: true,
      });
    },
    [hydrateFromFirebaseUser]
  );

  const handleLogout = useCallback(async () => {
    if (auth) {
      await signOut(auth);
    }
    resetLocalState();
    onLoggedOutNavigateRef.current();
    showToastRef.current(`${t.nav.signOut} · ${t.common.success}`, "info");
  }, [resetLocalState, t.common.success, t.nav.signOut]);

  // CV Apply callback (persisted inside useCvUpload via saveCvAndApplyBatchFirestore)
  const handleCvAppliedState = useCallback(
    async (result: {
      cvData: ExtractedCvData;
      savedUser: UserProfile | null;
      savedExperiences: WorkExperience[];
      savedLogs: LogEntry[];
    }) => {
      const nextLogs = [...result.savedLogs, ...stateRef.current.logs];
      setStoredCv(result.cvData);
      if (result.savedUser) {
        setUser(result.savedUser);
      }
      setExperiences(result.savedExperiences);
      setLogs(nextLogs);

      await syncShowcaseIfPublished({
        userProfile: result.savedUser ?? stateRef.current.user,
        logs: nextLogs,
      });

      const appliedCount = result.savedLogs.length;
      showToastRef.current(
        appliedCount > 0
          ? `CV guardado y ${appliedCount} logro(s) añadidos a tu Bóveda Privada ✨`
          : "CV y perfil profesional guardados ✨",
        "success"
      );
    },
    [syncShowcaseIfPublished]
  );

  const computeAffectedExperienceSyncs = useCallback(
    (
      affectedLogs: Array<Pick<LogEntry, "experienceId" | "client">>,
      nextLogs: LogEntry[],
      currentExperiences: WorkExperience[]
    ): {
      syncList: ExperienceProjectionSync[];
      nextExperiences: WorkExperience[];
    } => {
      if (affectedLogs.length === 0 || currentExperiences.length === 0) {
        return { syncList: [], nextExperiences: currentExperiences };
      }

      const syncList: ExperienceProjectionSync[] = [];
      const syncMap = new Map<string, WorkExperience>();

      currentExperiences.forEach((exp) => {
        const isAffected = affectedLogs.some((log) =>
          doesLogBelongToExperience(log as LogEntry, exp)
        );
        if (!isAffected) return;

        const bullets = deriveExperienceBulletsFromLogs(exp, nextLogs);
        syncList.push({ experience: exp, bullets });
        syncMap.set(exp.id, { ...exp, bullets, updatedAt: Date.now() });
      });

      const nextExperiences =
        syncMap.size > 0
          ? currentExperiences.map((exp) => syncMap.get(exp.id) || exp)
          : currentExperiences;

      return { syncList, nextExperiences };
    },
    []
  );

  // Log Actions
  const handleSaveLog = useCallback(
    async (
      entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">,
      editingLog: LogEntry | null,
      sourceInboxMessageId?: string,
      revisionSource: RevisionSource = "manual_form"
    ): Promise<boolean> => {
      try {
        if (editingLog) {
          const mergedCandidate: LogEntry = {
            ...editingLog,
            ...entryData,
            logro: entryData.title,
          };
          const previewLogs = stateRef.current.logs.map((l) =>
            l.id === editingLog.id ? mergedCandidate : l
          );
          const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
            [editingLog, mergedCandidate],
            previewLogs,
            stateRef.current.experiences
          );

          const updated = await updateLogFirestore(mergedCandidate, syncList, {
            previousEntry: editingLog,
            source: revisionSource,
          });
          const nextLogs = stateRef.current.logs.map((l) =>
            l.id === updated.id ? updated : l
          );
          setLogs(nextLogs);
          if (syncList.length > 0) {
            setExperiences(nextExperiences);
          }
          await syncShowcaseIfPublished({ logs: nextLogs });
          showToastRef.current(t.toasts.logSaved, "success");
          return true;
        }

        const simulatedCreated: LogEntry = {
          ...entryData,
          id: `pending-${Date.now()}`,
          logro: entryData.title,
          includeInCv: entryData.includeInCv !== false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const previewLogs = [simulatedCreated, ...stateRef.current.logs];
        const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
          [simulatedCreated],
          previewLogs,
          stateRef.current.experiences
        );

        const created = await createLogFirestore(
          { ...entryData, logro: entryData.title },
          syncList
        );
        const nextLogs = [created, ...stateRef.current.logs];
        setLogs(nextLogs);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }

        if (sourceInboxMessageId) {
          await updateInboxMessageStatusFirestore(sourceInboxMessageId, {
            read: true,
            convertedLogId: created.id,
          });
          setInbox((prev) =>
            prev.map((m) =>
              m.id === sourceInboxMessageId
                ? { ...m, read: true, convertedLogId: created.id }
                : m
            )
          );
        }

        if (created.isPublic) {
          await syncShowcaseIfPublished({ logs: nextLogs });
        }

        showToastRef.current(
          created.isPublic ? t.toasts.logToggledPublic : t.toasts.logToggledPrivate,
          "success"
        );
        return false;
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo guardar el logro.");
        throw new Error(msg);
      }
    },
    [
      computeAffectedExperienceSyncs,
      syncShowcaseIfPublished,
      t.toasts.logSaved,
      t.toasts.logToggledPrivate,
      t.toasts.logToggledPublic,
    ]
  );

  const handleTogglePublic = useCallback(
    async (id: string) => {
      const target = stateRef.current.logs.find((l) => l.id === id);
      if (!target) return;
      try {
        const updated = await updateLogMetadataFirestore(target, {
          isPublic: !target.isPublic,
        });
        const nextLogs = stateRef.current.logs.map((l) =>
          l.id === id ? updated : l
        );
        setLogs(nextLogs);
        await syncShowcaseIfPublished({ logs: nextLogs });
        showToastRef.current(
          updated.isPublic ? t.toasts.logToggledPublic : t.toasts.logToggledPrivate,
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo cambiar la visibilidad del logro.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished, t.toasts.logToggledPrivate, t.toasts.logToggledPublic]
  );

  const handleToggleIncludeInCv = useCallback(
    async (id: string) => {
      const target = stateRef.current.logs.find((l) => l.id === id);
      if (!target) return;
      const nextIncludeInCv = !(target.includeInCv !== false);
      const nextCandidate: LogEntry = {
        ...target,
        includeInCv: nextIncludeInCv,
      };
      const previewLogs = stateRef.current.logs.map((l) =>
        l.id === id ? nextCandidate : l
      );
      const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
        [target],
        previewLogs,
        stateRef.current.experiences
      );

      try {
        const updated = await updateLogMetadataFirestore(
          target,
          { includeInCv: nextIncludeInCv },
          syncList
        );
        const nextLogs = stateRef.current.logs.map((l) =>
          l.id === id ? updated : l
        );
        setLogs(nextLogs);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        await syncShowcaseIfPublished({ logs: nextLogs });
        showToastRef.current(
          nextIncludeInCv
            ? "Logro incluido como viñeta en su Experiencia y CV ✨"
            : "Ocultado del CV (el logro sigue intacto en tu Bitácora)",
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo actualizar la inclusión en CV del logro."
        );
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, syncShowcaseIfPublished]
  );

  const handleReorderLogs = useCallback(
    async (
      sourceLogId: string,
      targetLogId: string,
      position: "before" | "after",
      experienceId?: string
    ) => {
      const prevLogs = stateRef.current.logs;
      const prevExperiences = stateRef.current.experiences;

      const targetExp = experienceId
        ? prevExperiences.find((e) => e.id === experienceId)
        : undefined;

      const groupLogs = targetExp
        ? getExperienceChildLogs(targetExp, prevLogs)
        : prevLogs.filter(
            (l) => !prevExperiences.some((exp) => doesLogBelongToExperience(l, exp))
          );

      const reordered = reorderLogsWithinGroup(
        prevLogs,
        groupLogs,
        sourceLogId,
        targetLogId,
        position
      );
      if (!reordered) return;

      const { nextLogs, changedLogs } = reordered;
      const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
        changedLogs,
        nextLogs,
        prevExperiences
      );

      setLogs(nextLogs);
      if (syncList.length > 0) {
        setExperiences(nextExperiences);
      }

      try {
        const persisted = await reorderLogsBatchFirestore(changedLogs, syncList);
        const persistedMap = new Map(persisted.map((l) => [l.id, l]));
        const syncedLogs = nextLogs.map((l) => persistedMap.get(l.id) || l);
        setLogs(syncedLogs);
        if (changedLogs.some((l) => l.isPublic)) {
          await syncShowcaseIfPublished({ logs: syncedLogs });
        }
      } catch (err) {
        setLogs(prevLogs);
        setExperiences(prevExperiences);
        const msg = formatFirestoreUiError(
          err,
          "No se pudo guardar el nuevo orden de los logros."
        );
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, syncShowcaseIfPublished]
  );

  const handleDeleteLog = useCallback(
    async (id: string) => {
      const target = stateRef.current.logs.find((l) => l.id === id);
      const nextLogs = stateRef.current.logs.filter((l) => l.id !== id);
      const { syncList, nextExperiences } = target
        ? computeAffectedExperienceSyncs([target], nextLogs, stateRef.current.experiences)
        : { syncList: [], nextExperiences: stateRef.current.experiences };

      try {
        const deletedAt = await deleteLogFirestore(id, syncList);
        setLogs(nextLogs);
        if (target) {
          setDeletedLogs((prev) => [
            { ...target, deletedAt, isPublic: false },
            ...prev.filter((l) => l.id !== id),
          ]);
        }
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        await syncShowcaseIfPublished({ logs: nextLogs });
        showToastRef.current(
          "Logro movido al historial. Puedes recuperarlo cuando quieras.",
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar el logro.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, syncShowcaseIfPublished]
  );

  const handleRestoreDeletedLog = useCallback(
    async (id: string): Promise<LogEntry | null> => {
      const target = stateRef.current.deletedLogs.find((l) => l.id === id);
      if (!target) return null;

      const activeExps = stateRef.current.experiences;
      const hasMatchingExp =
        Boolean(target.experienceId) &&
        activeExps.some((exp) => exp.id === target.experienceId);
      const fallbackExp =
        activeExps.find((e) => e.isPersonalProjects) || activeExps[0];

      const { deletedAt: _ignoredDeletedAt, ...baseTarget } = target;
      void _ignoredDeletedAt;
      const candidateRestored: LogEntry = hasMatchingExp
        ? baseTarget
        : fallbackExp
          ? {
              ...baseTarget,
              experienceId: fallbackExp.id,
              client: fallbackExp.company,
            }
          : {
              ...baseTarget,
              experienceId: undefined,
            };

      const previewLogs = [candidateRestored, ...stateRef.current.logs].sort(
        compareLogEntriesByOrder
      );
      const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
        [candidateRestored],
        previewLogs,
        activeExps
      );

      try {
        const restored = await restoreLogFirestore(candidateRestored, syncList);
        setDeletedLogs((prev) => prev.filter((l) => l.id !== id));
        const nextLogs = [restored, ...stateRef.current.logs.filter((l) => l.id !== id)].sort(
          compareLogEntriesByOrder
        );
        setLogs(nextLogs);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        showToastRef.current("Logro recuperado en tu bitácora ✨", "success");
        return restored;
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo recuperar el logro.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs]
  );

  const handlePermanentDeleteLog = useCallback(async (id: string) => {
    try {
      await permanentlyDeleteLogFirestore(id);
      setDeletedLogs((prev) => prev.filter((l) => l.id !== id));
      showToastRef.current("Logro eliminado definitivamente del historial.", "info");
    } catch (err) {
      const msg = formatFirestoreUiError(
        err,
        "No se pudo eliminar definitivamente el logro."
      );
      showToastRef.current(msg, "error");
      throw new Error(msg);
    }
  }, []);

  const handleDuplicateLog = useCallback(
    async (entry: LogEntry) => {
      try {
        const duplicatedTitle = `${entry.title} (${t.common.copy})`;
        const entryDraft: Omit<LogEntry, "id" | "createdAt" | "updatedAt"> = {
          experienceId: entry.experienceId,
          date: new Date().toISOString().substring(0, 10),
          client: entry.client,
          project: entry.project,
          category: entry.category,
          title: duplicatedTitle,
          logro: duplicatedTitle,
          whatWasSought: entry.whatWasSought,
          whyImportant: entry.whyImportant,
          howApplied: entry.howApplied,
          description: entry.description,
          impact: entry.impact,
          tags: entry.tags,
          isPublic: false,
          includeInCv: entry.includeInCv !== false,
        };
        const simulated: LogEntry = {
          ...entryDraft,
          id: `pending-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const previewLogs = [simulated, ...stateRef.current.logs];
        const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
          [simulated],
          previewLogs,
          stateRef.current.experiences
        );

        const created = await createLogFirestore(entryDraft, syncList);
        setLogs((prev) => [created, ...prev]);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        showToastRef.current(t.toasts.logDuplicated, "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo duplicar el logro.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, t.common.copy, t.toasts.logDuplicated]
  );

  const handleImportBatchLogs = useCallback(
    async (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => {
      if (batch.length === 0) return;
      try {
        const now = Date.now();
        const simulatedEntries: LogEntry[] = batch.map((item, idx) => ({
          ...item,
          id: `pending-${now}-${idx}`,
          includeInCv: item.includeInCv !== false,
          createdAt: now,
          updatedAt: now,
        }));
        const previewLogs = [...simulatedEntries, ...stateRef.current.logs];
        const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
          simulatedEntries,
          previewLogs,
          stateRef.current.experiences
        );

        const created = await createLogsBatchFirestore(batch, syncList);
        const nextLogs = [...created, ...stateRef.current.logs];
        setLogs(nextLogs);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        await syncShowcaseIfPublished({ logs: nextLogs });
        showToastRef.current(`${t.toasts.bulletsImported} (${created.length})`, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudieron importar las viñetas.");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, syncShowcaseIfPublished, t.toasts.bulletsImported]
  );

  // Experience Actions
  const handleCreateQuickExperience = useCallback(
    async (expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">) => {
      try {
        const res = await createExperienceFirestore(expData);
        setExperiences((prev) => [res.experience, ...prev]);
        return res.experience;
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo crear la nueva empresa.");
        throw new Error(msg);
      }
    },
    []
  );

  const handleSaveExperience = useCallback(
    async (
      expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
      newLogBulletsToCreate: string[] = [],
      editedLogs: LogEntry[] = [],
      revisionSource: RevisionSource = "manual_form"
    ) => {
      try {
        if (expData.id) {
          const existing = stateRef.current.experiences.find((e) => e.id === expData.id);
          const fullExp: WorkExperience = {
            ...(existing || { createdAt: Date.now() }),
            ...expData,
            id: expData.id,
            updatedAt: Date.now(),
          };

          const editedById = new Map<string, LogEntry>();
          editedLogs.forEach((l) => {
            editedById.set(l.id, {
              ...l,
              experienceId: l.experienceId || fullExp.id,
              client: fullExp.company,
              logro: l.title,
            });
          });

          const companyChanged = existing && existing.company !== fullExp.company;
          const contentEditedLogs: LogEntry[] = [];
          const metadataOnlyLogs: LogEntry[] = [];
          stateRef.current.logs.forEach((l) => {
            const edited = editedById.get(l.id);
            if (edited) {
              if (edited.title !== l.title) {
                contentEditedLogs.push(edited);
              } else {
                metadataOnlyLogs.push(edited);
              }
            } else if (companyChanged && doesLogBelongToExperience(l, existing)) {
              metadataOnlyLogs.push({
                ...l,
                experienceId: l.experienceId || fullExp.id,
                client: fullExp.company,
              });
            }
          });

          const previousLogsById = new Map(stateRef.current.logs.map((l) => [l.id, l]));
          const previousBullets = existing
            ? deriveExperienceBulletsFromLogs(existing, stateRef.current.logs)
            : [];

          const nowPreview = Date.now();
          const mutatedPreviewMap = new Map<string, LogEntry>();
          contentEditedLogs.forEach((l) => mutatedPreviewMap.set(l.id, l));
          metadataOnlyLogs.forEach((l) => mutatedPreviewMap.set(l.id, l));
          const syntheticCreated: LogEntry[] = (newLogBulletsToCreate || [])
            .map((b) => b.trim())
            .filter(Boolean)
            .map((clean, idx) => ({
              id: `preview-${nowPreview}-${idx}`,
              userId: fullExp.userId,
              experienceId: fullExp.id,
              date: new Date().toISOString().substring(0, 10),
              client: fullExp.company,
              project: fullExp.role,
              category: "Feature ✨",
              title: clean,
              logro: clean,
              impact: clean,
              tags: [],
              isPublic: false,
              includeInCv: true,
              createdAt: nowPreview,
              updatedAt: nowPreview,
            }));
          const previewLogs = [
            ...syntheticCreated,
            ...stateRef.current.logs.map((l) => mutatedPreviewMap.get(l.id) || l),
          ];
          const nextBullets = deriveExperienceBulletsFromLogs(fullExp, previewLogs);
          const expWithSyncedBullets: WorkExperience = {
            ...fullExp,
            bullets: nextBullets,
          };

          const res = await updateExperienceFirestore(
            expWithSyncedBullets,
            contentEditedLogs,
            newLogBulletsToCreate,
            metadataOnlyLogs,
            {
              previousExperience: existing,
              previousBullets,
              nextBullets,
              previousLogsById,
              source: revisionSource,
            }
          );

          const updatedMap = new Map(res.updatedLogs.map((l) => [l.id, l]));
          const nextLogs = [
            ...res.createdLogs,
            ...stateRef.current.logs.map((l) => updatedMap.get(l.id) || l),
          ];
          const syncedBullets = deriveExperienceBulletsFromLogs(res.experience, nextLogs);
          const finalExp: WorkExperience = {
            ...res.experience,
            bullets: syncedBullets,
          };

          setExperiences((prev) =>
            prev.map((e) => (e.id === finalExp.id ? finalExp : e))
          );
          setLogs(nextLogs);

          if (res.updatedLogs.length > 0 || res.createdLogs.length > 0) {
            await syncShowcaseIfPublished({ logs: nextLogs });
          }

          if (res.createdLogs.length > 0) {
            showToastRef.current(
              `${t.toasts.experienceSaved} (${res.createdLogs.length}) 🔒✨`,
              "success"
            );
          } else {
            showToastRef.current(`${t.toasts.experienceSaved}: ${expData.company}`, "success");
          }
        } else {
          const bullets = newLogBulletsToCreate || [];
          const res = await createExperienceFirestore(expData, bullets);
          setExperiences((prev) => [res.experience, ...prev]);
          if (res.createdLogs.length > 0) {
            setLogs((prev) => [...res.createdLogs, ...prev]);
            showToastRef.current(
              `${t.toasts.experienceSaved} (${res.createdLogs.length}) 🔒✨`,
              "success"
            );
          } else {
            showToastRef.current(`${t.toasts.experienceSaved}: ${expData.company}`, "success");
          }
        }
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo guardar la experiencia.");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished, t.toasts.experienceSaved]
  );

  const handleDeleteExperience = useCallback(
    async (id: string) => {
      const targetExp = stateRef.current.experiences.find((e) => e.id === id);
      const remaining = stateRef.current.experiences.filter((e) => e.id !== id);
      const fallback = remaining.find((e) => e.isPersonalProjects) || remaining[0];
      const reassignedLogs = fallback
        ? stateRef.current.logs
            .filter((l) =>
              targetExp ? doesLogBelongToExperience(l, targetExp) : l.experienceId === id
            )
            .map((l) => ({
              ...l,
              experienceId: fallback.id,
              client: fallback.company,
            }))
        : [];

      try {
        const deletedAt = await deleteExperienceFirestore(id, reassignedLogs);
        setExperiences(remaining);
        if (targetExp) {
          setDeletedExperiences((prev) => [
            { ...targetExp, deletedAt },
            ...prev.filter((e) => e.id !== id),
          ]);
        }
        if (reassignedLogs.length > 0) {
          const map = new Map(reassignedLogs.map((l) => [l.id, l]));
          const nextLogs = stateRef.current.logs.map((l) => map.get(l.id) || l);
          setLogs(nextLogs);
          await syncShowcaseIfPublished({ logs: nextLogs });
        }
        showToastRef.current(
          "Experiencia movida al historial. Puedes recuperarla cuando quieras.",
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar la experiencia.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleRestoreDeletedExperience = useCallback(
    async (id: string): Promise<WorkExperience | null> => {
      const target = stateRef.current.deletedExperiences.find((e) => e.id === id);
      if (!target) return null;
      try {
        const restored = await restoreExperienceFirestore(target);
        setDeletedExperiences((prev) => prev.filter((e) => e.id !== id));
        setExperiences((prev) =>
          [restored, ...prev.filter((e) => e.id !== id)].sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
          )
        );
        showToastRef.current(
          `Experiencia "${restored.company}" recuperada ✨`,
          "success"
        );
        return restored;
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo recuperar la experiencia.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    []
  );

  const handlePermanentDeleteExperience = useCallback(async (id: string) => {
    try {
      await permanentlyDeleteExperienceFirestore(id);
      setDeletedExperiences((prev) => prev.filter((e) => e.id !== id));
      showToastRef.current(
        "Experiencia eliminada definitivamente del historial.",
        "info"
      );
    } catch (err) {
      const msg = formatFirestoreUiError(
        err,
        "No se pudo eliminar definitivamente la experiencia."
      );
      showToastRef.current(msg, "error");
      throw new Error(msg);
    }
  }, []);

  const handleImportExperienceJson = useCallback(
    async (
      experienceId: string,
      parsed: ParsedExperienceJson,
      source: "json_editor" | "json_import" = "json_import"
    ) => {
      const targetExp = stateRef.current.experiences.find((e) => e.id === experienceId);
      if (!targetExp) {
        throw new Error("No se encontró la experiencia seleccionada.");
      }

      const previousLogsById = new Map(stateRef.current.logs.map((l) => [l.id, l]));
      const previousBullets = deriveExperienceBulletsFromLogs(
        targetExp,
        stateRef.current.logs
      );
      const reconciled = reconcileImportedExperienceJson(
        targetExp,
        stateRef.current.logs,
        parsed
      );

      try {
        const res = await importExperienceJsonFirestore({
          updatedExperience: reconciled.updatedExperience,
          contentEditedLogs: reconciled.contentEditedLogs,
          metadataOnlyLogs: reconciled.metadataOnlyLogs,
          logsToCreate: reconciled.logsToCreate,
          logsToDelete: reconciled.logsToDelete,
          previousExperience: targetExp,
          previousBullets,
          nextBullets: reconciled.updatedExperience.bullets || [],
          previousLogsById,
          source,
        });

        const deletedIdSet = new Set(res.deletedLogIds);
        const softDeletedLogs = stateRef.current.logs
          .filter((l) => deletedIdSet.has(l.id))
          .map((l) => ({ ...l, deletedAt: res.deletedAt, isPublic: false }));
        const updatedMap = new Map(res.updatedLogs.map((l) => [l.id, l]));
        const nextLogs = [
          ...res.createdLogs,
          ...stateRef.current.logs
            .filter((l) => !deletedIdSet.has(l.id))
            .map((l) => updatedMap.get(l.id) || l),
        ];
        const syncedBullets = deriveExperienceBulletsFromLogs(res.experience, nextLogs);
        const finalExp: WorkExperience = {
          ...res.experience,
          bullets:
            deletedIdSet.size > 0 || parsed.hasExplicitLogsField
              ? syncedBullets
              : syncedBullets.length > 0
                ? syncedBullets
                : res.experience.bullets,
        };

        setExperiences((prev) =>
          prev.map((e) => (e.id === finalExp.id ? finalExp : e))
        );
        setLogs(nextLogs);
        if (softDeletedLogs.length > 0) {
          setDeletedLogs((prev) => [
            ...softDeletedLogs,
            ...prev.filter((l) => !deletedIdSet.has(l.id)),
          ]);
        }

        if (
          res.createdLogs.some((l) => l.isPublic) ||
          res.updatedLogs.some((l) => l.isPublic) ||
          reconciled.logsToDelete.some((l) => l.isPublic)
        ) {
          await syncShowcaseIfPublished({ logs: nextLogs });
        }

        const editedCount = reconciled.contentEditedLogs.length;
        const metadataCount = reconciled.metadataOnlyLogs.length;
        const createdCount = res.createdLogs.length;
        const deletedCount = res.deletedLogIds.length;
        if (
          createdCount === 0 &&
          editedCount === 0 &&
          metadataCount === 0 &&
          deletedCount === 0
        ) {
          showToastRef.current(
            `JSON sincronizado en ${finalExp.company} sin cambios en logros`,
            "info"
          );
        } else {
          const parts: string[] = [];
          if (createdCount > 0) parts.push(`${createdCount} nuevo(s)`);
          if (editedCount + metadataCount > 0) {
            parts.push(`${editedCount + metadataCount} actualizado(s)`);
          }
          if (deletedCount > 0) parts.push(`${deletedCount} eliminado(s)`);
          showToastRef.current(
            `JSON reemplazado en ${finalExp.company}: ${parts.join(", ")} ✨`,
            "success"
          );
        }
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo importar la experiencia."
        );
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleExtractBulletToLog = useCallback(
    async (
      experienceId: string,
      company: string,
      role: string,
      bulletText: string,
      technologies?: string[]
    ) => {
      const newLog = buildLogFromExtractedBullet({
        experienceId,
        company,
        role,
        bulletText,
        technologies,
      });
      if (!newLog) return;

      try {
        const simulated: LogEntry = {
          ...newLog,
          id: `pending-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const previewLogs = [simulated, ...stateRef.current.logs];
        const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
          [simulated],
          previewLogs,
          stateRef.current.experiences
        );

        const created = await createLogFirestore(newLog, syncList);
        setLogs((prev) => [created, ...prev]);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        showToastRef.current(`${company}: ${t.toasts.logSaved} ✨`, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo guardar la viñeta en tu bitácora.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, t.toasts.logSaved]
  );

  const handleExtractAllBulletsForExperience = useCallback(
    async (experienceId: string) => {
      const exp = stateRef.current.experiences.find((e) => e.id === experienceId);
      if (!exp) return;

      const expLogs = getExperienceChildLogs(exp, stateRef.current.logs);
      const unextracted = findLegacyUnlinkedBullets(exp, expLogs);
      if (unextracted.length === 0) {
        showToastRef.current(`${t.toasts.bulletsImported} (${exp.company})`, "info");
        return;
      }

      const entries = unextracted
        .map((b) => buildLogFromSavedExperienceBullet(exp, exp.id, b))
        .map((entry) => ({
          ...entry,
          impact: entry.impact || entry.title,
          includeInCv: true,
        }));

      try {
        const now = Date.now();
        const simulatedEntries: LogEntry[] = entries.map((e, idx) => ({
          ...e,
          id: `pending-${now}-${idx}`,
          createdAt: now,
          updatedAt: now,
        }));
        const previewLogs = [...simulatedEntries, ...stateRef.current.logs];
        const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
          simulatedEntries,
          previewLogs,
          stateRef.current.experiences
        );

        const created = await createLogsBatchFirestore(entries, syncList);
        setLogs((prev) => [...created, ...prev]);
        if (syncList.length > 0) {
          setExperiences(nextExperiences);
        }
        showToastRef.current(
          `${t.toasts.bulletsImported} (${created.length} - ${exp.company}) 🚀`,
          "success"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudieron extraer las viñetas.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [computeAffectedExperienceSyncs, t.toasts.bulletsImported]
  );

  // Inbox Actions
  const handleSendVisitorMessage = useCallback(
    async (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => {
      try {
        const created = await createInboxMessageFirestore(msg);
        setInbox((prev) => [created, ...prev]);
        showToastRef.current(t.toasts.messageSent, "success");
      } catch (err) {
        const errMsg = formatFirestoreUiError(
          err,
          "No se pudo enviar el mensaje. Inicia sesión con Google o verifica tus permisos."
        );
        throw new Error(errMsg);
      }
    },
    [t.toasts.messageSent]
  );

  const handleMarkMessageRead = useCallback(async (id: string) => {
    try {
      await updateInboxMessageStatusFirestore(id, { read: true });
      setInbox((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch (err) {
      const msg = formatFirestoreUiError(err, "No se pudo actualizar el estado del mensaje.");
      showToastRef.current(msg, "error");
      throw new Error(msg);
    }
  }, []);

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      try {
        await deleteInboxMessageFirestore(id);
        setInbox((prev) => prev.filter((m) => m.id !== id));
        showToastRef.current(t.toasts.messageDeleted, "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar el mensaje.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [t.toasts.messageDeleted]
  );

  const handleIngestIntegrationSuggestions = useCallback(
    async (
      suggestions: VisitorMessage[]
    ): Promise<{ addedCount: number; skippedCount: number }> => {
      const existingIds = new Set(stateRef.current.inbox.map((m) => m.id));
      const newOnes = suggestions.filter((s) => !existingIds.has(s.id));
      const skippedCount = suggestions.length - newOnes.length;

      if (newOnes.length === 0) {
        showToastRef.current(
          "Todas esas sugerencias ya estaban importadas en tu Inbox.",
          "info"
        );
        return { addedCount: 0, skippedCount };
      }

      try {
        const saved = await createInboxBatchFirestore(newOnes);
        setInbox((prev) => [...saved, ...prev]);
        showToastRef.current(
          `${saved.length} sugerencia(s) guardadas en tu Inbox ✨`,
          "success"
        );
        return { addedCount: saved.length, skippedCount };
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudieron guardar las sugerencias."
        );
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    []
  );

  const handleQuickConvertInboxSuggestion = useCallback(async (msg: VisitorMessage) => {
    if (!msg.achievementDraft) return;
    const draft = msg.achievementDraft;
    const matchedExp =
      stateRef.current.experiences.find((e) =>
        e.company.toLowerCase().includes(draft.client.toLowerCase())
      ) || stateRef.current.experiences[0];

    const draftPayload: Omit<LogEntry, "id" | "createdAt" | "updatedAt"> = {
      experienceId: matchedExp?.id,
      date:
        msg.date && /^\d{4}-\d{2}-\d{2}/.test(msg.date)
          ? msg.date.substring(0, 10)
          : new Date().toISOString().substring(0, 10),
      client: draft.client,
      project: draft.project,
      category: draft.category,
      title: draft.title,
      logro: draft.title,
      whatWasSought: draft.whatWasSought,
      whyImportant: draft.whyImportant,
      howApplied: draft.howApplied,
      description: draft.description,
      impact: draft.impact,
      tags: draft.tags,
      isPublic: false,
      includeInCv: true,
    };

    try {
      const simulated: LogEntry = {
        ...draftPayload,
        id: `pending-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const previewLogs = [simulated, ...stateRef.current.logs];
      const { syncList, nextExperiences } = computeAffectedExperienceSyncs(
        [simulated],
        previewLogs,
        stateRef.current.experiences
      );

      const created = await createLogFirestore(draftPayload, syncList);

      await updateInboxMessageStatusFirestore(msg.id, {
        read: true,
        convertedLogId: created.id,
      });

      setLogs((prev) => [created, ...prev]);
      if (syncList.length > 0) {
        setExperiences(nextExperiences);
      }
      setInbox((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, read: true, convertedLogId: created.id } : m
        )
      );
      showToastRef.current("Logro guardado en Bóveda Privada desde Inbox ✨", "success");
    } catch (err) {
      const errMsg = formatFirestoreUiError(
        err,
        "No se pudo convertir el borrador en logro."
      );
      showToastRef.current(errMsg, "error");
      throw new Error(errMsg);
    }
  }, [computeAffectedExperienceSyncs]);

  // User Actions
  const handleUpdateProfile = useCallback(
    async (updated: UserProfile) => {
      try {
        const saved = await saveUserProfileFirestore(updated);
        setUser(saved);
        await syncShowcaseIfPublished({ userProfile: saved });
        showToastRef.current(t.toasts.profileUpdated, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo guardar el perfil."
        );
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished, t.toasts.profileUpdated]
  );

  const handleUpdateAvatar = useCallback(
    async (newAvatarUrl: string) => {
      const current = stateRef.current.user;
      if (!current) {
        throw new Error("Debes iniciar sesión con Google para cambiar tu avatar.");
      }
      try {
        const saved = await saveUserProfileFirestore({
          ...current,
          avatar: newAvatarUrl,
        });
        setUser(saved);
        await syncShowcaseIfPublished({ userProfile: saved });
        showToastRef.current(t.toasts.profileUpdated, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo guardar tu nuevo avatar."
        );
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished, t.toasts.profileUpdated]
  );

  // Job Offer Actions
  const handleSaveJobOffer = useCallback(
    async (updated: JobOffer) => {
      try {
        const saved = await updateJobOfferFirestore(updated);
        setJobOffers((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
        showToastRef.current(`${saved.company}: ${t.toasts.offerSaved} ✨`, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo actualizar la postulación.");
        throw new Error(msg);
      }
    },
    [t.toasts.offerSaved]
  );

  const handleAddJobOffer = useCallback(
    async (offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">) => {
      try {
        const created = await createJobOfferFirestore(offer);
        setJobOffers((prev) => [created, ...prev]);
        showToastRef.current(`${created.company}: ${t.toasts.offerSaved} 🎯`, "success");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo registrar la postulación.");
        throw new Error(msg);
      }
    },
    [t.toasts.offerSaved]
  );

  const handleDeleteJobOffer = useCallback(
    async (id: string) => {
      try {
        await deleteJobOfferFirestore(id);
        setJobOffers((prev) => prev.filter((o) => o.id !== id));
        showToastRef.current(t.toasts.offerDeleted, "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar la postulación.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [t.toasts.offerDeleted]
  );

  // Product Actions
  const handleSaveProduct = useCallback(
    async (productData: Omit<Product, "id" | "createdAt"> | Product, isEditing: boolean) => {
      try {
        if (isEditing && "id" in productData && productData.id) {
          const saved = await updateProductFirestore(productData as Product);
          const nextProducts = stateRef.current.products.map((p) =>
            p.id === saved.id ? saved : p
          );
          setProducts(nextProducts);
          await syncShowcaseIfPublished({ products: nextProducts });
          showToastRef.current("Producto actualizado.", "success");
        } else {
          const created = await createProductFirestore(
            productData as Omit<Product, "id" | "createdAt">
          );
          const nextProducts = [created, ...stateRef.current.products];
          setProducts(nextProducts);
          if (created.isPublic !== false) {
            await syncShowcaseIfPublished({ products: nextProducts });
          }
          showToastRef.current("Producto guardado en tu showcase.", "success");
        }
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo guardar el producto.");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProductFirestore(id);
        const nextProducts = stateRef.current.products.filter((p) => p.id !== id);
        setProducts(nextProducts);
        await syncShowcaseIfPublished({ products: nextProducts });
        showToastRef.current("Producto eliminado del showcase.", "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar el producto.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleToggleProductPublic = useCallback(
    async (id: string) => {
      const target = stateRef.current.products.find((p) => p.id === id);
      if (!target) return;
      try {
        const updated = await updateProductFirestore({
          ...target,
          isPublic: target.isPublic === false ? true : false,
        });
        const nextProducts = stateRef.current.products.map((p) =>
          p.id === id ? updated : p
        );
        setProducts(nextProducts);
        await syncShowcaseIfPublished({ products: nextProducts });
        showToastRef.current(
          updated.isPublic
            ? "Producto visible en la Vitrina Pública."
            : "Producto movido a Bóveda Privada.",
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo cambiar la visibilidad del producto.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  // Certification Actions
  const handleSaveCertification = useCallback(
    async (
      certData:
        | Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt">
        | TechnicalCertification,
      isEditing: boolean,
      sourceGoalId?: string
    ): Promise<TechnicalCertification> => {
      try {
        if (isEditing && "id" in certData && certData.id) {
          const saved = await updateCertificationFirestore(certData as TechnicalCertification);
          const nextCerts = stateRef.current.certifications.map((c) =>
            c.id === saved.id ? saved : c
          );
          setCertifications(nextCerts);
          await syncShowcaseIfPublished({ certifications: nextCerts });
          showToastRef.current("Certificación actualizada.", "success");
          return saved;
        }

        const linkedGoal = sourceGoalId
          ? stateRef.current.careerGoals.find((g) => g.id === sourceGoalId)
          : undefined;
        const created = await createCertificationFirestore(
          certData as Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt">,
          linkedGoal
        );

        const nextCerts = [created, ...stateRef.current.certifications];
        setCertifications(nextCerts);
        if (linkedGoal) {
          setCareerGoals((prev) =>
            prev.map((g) =>
              g.id === linkedGoal.id
                ? {
                    ...g,
                    status: "achieved",
                    achievedDate:
                      g.achievedDate || new Date().toISOString().substring(0, 10),
                    linkedCertificationId: created.id,
                    updatedAt: Date.now(),
                  }
                : g
            )
          );
        }
        if (created.isPublic !== false) {
          await syncShowcaseIfPublished({ certifications: nextCerts });
        }
        showToastRef.current("Certificación guardada en tu perfil técnico.", "success");
        return created;
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo guardar la certificación."
        );
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleDeleteCertification = useCallback(
    async (id: string) => {
      try {
        await deleteCertificationFirestore(id);
        const nextCerts = stateRef.current.certifications.filter((c) => c.id !== id);
        setCertifications(nextCerts);
        await syncShowcaseIfPublished({ certifications: nextCerts });
        showToastRef.current("Certificación eliminada.", "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo eliminar la certificación.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  const handleToggleCertificationPublic = useCallback(
    async (id: string) => {
      const target = stateRef.current.certifications.find((c) => c.id === id);
      if (!target) return;
      try {
        const updated = await updateCertificationFirestore({
          ...target,
          isPublic: target.isPublic === false ? true : false,
        });
        const nextCerts = stateRef.current.certifications.map((c) =>
          c.id === id ? updated : c
        );
        setCertifications(nextCerts);
        await syncShowcaseIfPublished({ certifications: nextCerts });
        showToastRef.current(
          updated.isPublic
            ? "Certificación visible en Vitrina Pública."
            : "Certificación oculta en Bóveda Privada.",
          "info"
        );
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo actualizar la visibilidad de la certificación."
        );
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    [syncShowcaseIfPublished]
  );

  // Career Goal Actions
  const handleSaveCareerGoal = useCallback(
    async (
      goalData: Omit<CareerGoal, "id" | "createdAt" | "updatedAt"> | CareerGoal,
      isEditing: boolean
    ) => {
      try {
        if (isEditing && "id" in goalData && goalData.id) {
          const saved = await updateCareerGoalFirestore(goalData as CareerGoal);
          setCareerGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
          showToastRef.current("Objetivo profesional actualizado.", "success");
        } else {
          const created = await createCareerGoalFirestore(
            goalData as Omit<CareerGoal, "id" | "createdAt" | "updatedAt">
          );
          setCareerGoals((prev) => [created, ...prev]);
          showToastRef.current("Nuevo objetivo añadido a tu Plan de Carrera.", "success");
        }
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo guardar el objetivo profesional."
        );
        throw new Error(msg);
      }
    },
    []
  );

  const handleDeleteCareerGoal = useCallback(async (id: string) => {
    try {
      await deleteCareerGoalFirestore(id);
      setCareerGoals((prev) => prev.filter((g) => g.id !== id));
      showToastRef.current("Objetivo eliminado del plan de carrera.", "info");
    } catch (err) {
      const msg = formatFirestoreUiError(err, "No se pudo eliminar el objetivo.");
      showToastRef.current(msg, "error");
      throw new Error(msg);
    }
  }, []);

  const handleSetCareerGoalStatus = useCallback(
    async (id: string, status: CareerGoalStatus) => {
      const current = stateRef.current.careerGoals.find((g) => g.id === id);
      if (!current) return;
      try {
        const saved = await updateCareerGoalFirestore({
          ...current,
          status,
          achievedDate:
            status === "achieved"
              ? current.achievedDate || new Date().toISOString().substring(0, 10)
              : undefined,
        });
        setCareerGoals((prev) => prev.map((g) => (g.id === id ? saved : g)));
        const statusLabel =
          status === "achieved"
            ? "Objetivo marcado como logrado"
            : status === "in_progress"
            ? "Objetivo movido a En Curso"
            : "Objetivo movido a Planificadas";
        showToastRef.current(statusLabel, status === "achieved" ? "success" : "info");
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo cambiar el estado del objetivo.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    []
  );

  const handleToggleCareerGoalActionItem = useCallback(
    async (goalId: string, itemId: string) => {
      const current = stateRef.current.careerGoals.find((g) => g.id === goalId);
      if (!current) return;
      const nextItems = (current.actionItems || []).map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );
      try {
        const saved = await updateCareerGoalFirestore({
          ...current,
          actionItems: nextItems,
        });
        setCareerGoals((prev) => prev.map((g) => (g.id === goalId ? saved : g)));
      } catch (err) {
        const msg = formatFirestoreUiError(err, "No se pudo actualizar el hito del objetivo.");
        showToastRef.current(msg, "error");
        throw new Error(msg);
      }
    },
    []
  );

  // JSON Backup Import into Firestore
  const handleImportBackupData = useCallback(
    async (bundle: ParsedBackupBundle): Promise<number> => {
      try {
        const writtenCount = await importBackupBundleToFirestore(bundle);
        if (auth?.currentUser && auth.currentUser.emailVerified) {
          hydratedUidRef.current = null;
          await hydrateFromFirebaseUser(auth.currentUser, {
            navigate: false,
            showToastMessage: false,
          });
        }
        showToastRef.current(
          `Respaldo importado (${writtenCount} registros sincronizados) ✨`,
          "success"
        );
        return writtenCount;
      } catch (err) {
        const msg = formatFirestoreUiError(
          err,
          "No se pudo importar el respaldo."
        );
        throw new Error(msg);
      }
    },
    [hydrateFromFirebaseUser]
  );

  const handleSyncRevisionUpdatesCount = useCallback(
    (entityType: RevisionEntityType, entityId: string, updatesCount: number) => {
      const clamped = Math.max(0, Math.min(1000000, Math.trunc(updatesCount)));
      if (entityType === "log") {
        const currentActive = stateRef.current.logs.find((l) => l.id === entityId);
        const currentDeleted = stateRef.current.deletedLogs.find((l) => l.id === entityId);
        const current = currentActive || currentDeleted;
        if (!current || current.updatesCount === clamped) return;
        if (currentActive) {
          setLogs((prev) =>
            prev.map((l) => (l.id === entityId ? { ...l, updatesCount: clamped } : l))
          );
        }
        if (currentDeleted) {
          setDeletedLogs((prev) =>
            prev.map((l) => (l.id === entityId ? { ...l, updatesCount: clamped } : l))
          );
        }
        void syncEntityUpdatesCountFirestore("log", entityId, clamped).catch(
          () => undefined
        );
        return;
      }

      const currentActive = stateRef.current.experiences.find((e) => e.id === entityId);
      const currentDeleted = stateRef.current.deletedExperiences.find((e) => e.id === entityId);
      const current = currentActive || currentDeleted;
      if (!current || current.updatesCount === clamped) return;
      if (currentActive) {
        setExperiences((prev) =>
          prev.map((e) => (e.id === entityId ? { ...e, updatesCount: clamped } : e))
        );
      }
      if (currentDeleted) {
        setDeletedExperiences((prev) =>
          prev.map((e) => (e.id === entityId ? { ...e, updatesCount: clamped } : e))
        );
      }
      void syncEntityUpdatesCountFirestore("experience", entityId, clamped).catch(
        () => undefined
      );
    },
    []
  );

  const unreadInboxCount = inbox.filter((m) => !m.read).length;
  const publicLogsCount = logs.filter((l) => l.isPublic).length;

  return {
    isAuthReady,
    isHydrating,
    logs,
    deletedLogs,
    experiences,
    deletedExperiences,
    setExperiences,
    user,
    setUser,
    storedCv,
    setStoredCv,
    aiQuota,
    setAiQuota,
    inbox,
    jobOffers,
    products,
    certifications,
    careerGoals,
    unreadInboxCount,
    publicLogsCount,
    handleCvAppliedState,
    handleSaveLog,
    handleTogglePublic,
    handleToggleIncludeInCv,
    handleReorderLogs,
    handleDeleteLog,
    handleRestoreDeletedLog,
    handlePermanentDeleteLog,
    handleDuplicateLog,
    handleImportBatchLogs,
    handleCreateQuickExperience,
    handleSaveExperience,
    handleDeleteExperience,
    handleRestoreDeletedExperience,
    handlePermanentDeleteExperience,
    handleImportExperienceJson,
    handleSyncRevisionUpdatesCount,
    handleExtractBulletToLog,
    handleExtractAllBulletsForExperience,
    handleSendVisitorMessage,
    handleMarkMessageRead,
    handleDeleteMessage,
    handleIngestIntegrationSuggestions,
    handleQuickConvertInboxSuggestion,
    handleLoginWithFirebaseUser,
    handleLogout,
    handleUpdateProfile,
    handleUpdateAvatar,
    handleSaveJobOffer,
    handleAddJobOffer,
    handleDeleteJobOffer,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleProductPublic,
    handleSaveCertification,
    handleDeleteCertification,
    handleToggleCertificationPublic,
    handleSaveCareerGoal,
    handleDeleteCareerGoal,
    handleSetCareerGoalStatus,
    handleToggleCareerGoalActionItem,
    handleImportBackupData,
  };
};
