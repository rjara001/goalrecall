import { useCallback, useEffect, useState } from "react";
import {
  addExperience,
  addJobOffer,
  addLog,
  addProduct,
  addVisitorMessage,
  clearSessionData,
  deleteExperience,
  deleteJobOffer,
  deleteLog,
  deleteMessage,
  deleteProduct,
  getStoredExperiences,
  getStoredInbox,
  getStoredJobOffers,
  getStoredLogs,
  getStoredProducts,
  getStoredUser,
  INITIAL_EXPERIENCES,
  INITIAL_INBOX,
  INITIAL_LOGS,
  INITIAL_USER,
  initializeStateFromCloud,
  markMessageRead,
  purgeDummyPresetData,
  resetToDemoData,
  restoreFromCloudIfEmpty,
  saveExperiences,
  saveUser,
  toggleLogPublic,
  toggleProductPublic,
  updateExperience,
  updateJobOffer,
  updateLog,
  updateProduct,
  updateUserAvatar,
} from "../utils/storage";
import { ensureAuthenticatedUser, fetchCloudUserState } from "../utils/cloudState";
import {
  buildLogFromExtractedBullet,
  buildLogFromSavedExperienceBullet,
  healExperiencesFromLogs,
} from "../utils/bulletToLogMapper";
import { auth, getRedirectResult } from "../firebase";
import {
  JobOffer,
  LogEntry,
  Product,
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
}

export const useWorkspaceData = ({
  showToast,
  onAuthenticatedNavigate,
  onLoggedOutNavigate,
}: UseWorkspaceDataOptions) => {
  const { t } = useI18n();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inbox, setInbox] = useState<VisitorMessage[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const reloadDataFromStorage = useCallback(() => {
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    setUser(getStoredUser());
    setInbox(getStoredInbox());
    setJobOffers(getStoredJobOffers());
    setProducts(getStoredProducts());
  }, []);

  const handleLogin = useCallback(
    async (newUser: UserProfile) => {
      purgeDummyPresetData();
      saveUser(newUser);
      setUser(newUser);

      try {
        const cloudData = await fetchCloudUserState();
        if (cloudData) {
          initializeStateFromCloud(cloudData);
          if (cloudData.experiences) setExperiences(cloudData.experiences);
          if (cloudData.logs) setLogs(cloudData.logs);
          if (cloudData.jobOffers) setJobOffers(cloudData.jobOffers);
          if (cloudData.products) setProducts(cloudData.products);
          if (cloudData.user) {
            const merged = {
              ...newUser,
              ...cloudData.user,
              username: cloudData.user.username || newUser.username,
            };
            setUser(merged);
            saveUser(merged);
          } else {
            saveUser(newUser);
          }
          showToast(t.toasts.dataRestored, "success");
        } else if (newUser.email) {
          const restored = await restoreFromCloudIfEmpty(newUser.email);
          if (restored) {
            reloadDataFromStorage();
            showToast(t.toasts.dataRestored, "success");
          }
        }
      } catch (err) {
        console.warn("[App] Cloud data hydration notice:", err);
      }

      setLogs(getStoredLogs());
      setExperiences(getStoredExperiences());
      setInbox(getStoredInbox());
      setJobOffers(getStoredJobOffers());
      setProducts(getStoredProducts());
      const providerLabel = newUser.authProvider === "google" ? "Google" : "Email";
      showToast(`${newUser.name} · ${providerLabel} ✨`, "success");
      onAuthenticatedNavigate();
    },
    [onAuthenticatedNavigate, reloadDataFromStorage, showToast, t.toasts.dataRestored]
  );

  // Initial Data Load, Cloud Sync Hydration & Firebase Redirect Check
  useEffect(() => {
    purgeDummyPresetData();
    const storedLogs = getStoredLogs();
    const storedExps = getStoredExperiences();

    const healed = healExperiencesFromLogs(storedExps, storedLogs);
    if (healed.changed) {
      saveExperiences(healed.experiences);
    }
    setExperiences(healed.experiences);

    setLogs(storedLogs);
    const currentUser = getStoredUser();
    setUser(currentUser);
    setInbox(getStoredInbox());
    setJobOffers(getStoredJobOffers());
    setProducts(getStoredProducts());

    ensureAuthenticatedUser().then(() => {
      fetchCloudUserState().then((cloudData) => {
        if (cloudData) {
          initializeStateFromCloud(cloudData);
          if (cloudData.experiences) setExperiences(cloudData.experiences);
          if (cloudData.logs) setLogs(cloudData.logs);
          if (cloudData.user) setUser(cloudData.user);
          if (cloudData.jobOffers) setJobOffers(cloudData.jobOffers);
          if (cloudData.products) setProducts(cloudData.products);
        }
      });
    });

    if (currentUser?.email && storedLogs.length === 0) {
      restoreFromCloudIfEmpty(currentUser.email).then((restored) => {
        if (restored) {
          setLogs(getStoredLogs());
          setExperiences(getStoredExperiences());
          setInbox(getStoredInbox());
          setJobOffers(getStoredJobOffers());
          setProducts(getStoredProducts());
        }
      });
    }

    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            const fbUser = result.user;
            const userHandle = (
              fbUser.email?.split("@")[0] ||
              fbUser.displayName ||
              fbUser.uid.substring(0, 8)
            )
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "");

            const googleUserProfile: UserProfile = {
              ...INITIAL_USER,
              id: "google-" + fbUser.uid,
              username: userHandle.length >= 3 ? userHandle : `user_${fbUser.uid.substring(0, 6)}`,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuario",
              email: fbUser.email || "",
              avatar: fbUser.photoURL || INITIAL_USER.avatar,
              title: "",
              bio: "",
              location: "",
              github: "",
              linkedin: "",
              skills: [],
              authProvider: "google",
              isCustom: false,
              createdAt: Date.now(),
            };
            handleLogin(googleUserProfile);
          }
        })
        .catch((err) => {
          console.error("[App] Firebase getRedirectResult error:", err);
        });
    }
  }, [handleLogin]);

  // Log Actions
  const handleSaveLog = useCallback(
    (entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">, editingLog: LogEntry | null) => {
      if (editingLog) {
        updateLog({ ...editingLog, ...entryData });
        setLogs(getStoredLogs());
        showToast(t.toasts.logSaved);
        return true;
      }
      const created = addLog(entryData);
      setLogs(getStoredLogs());
      showToast(created.isPublic ? t.toasts.logToggledPublic : t.toasts.logToggledPrivate);
      return false;
    },
    [showToast, t.toasts.logSaved, t.toasts.logToggledPrivate, t.toasts.logToggledPublic]
  );

  const handleTogglePublic = useCallback(
    (id: string) => {
      const updated = toggleLogPublic(id);
      if (updated) {
        setLogs(getStoredLogs());
        showToast(updated.isPublic ? t.toasts.logToggledPublic : t.toasts.logToggledPrivate);
      }
    },
    [showToast, t.toasts.logToggledPrivate, t.toasts.logToggledPublic]
  );

  const handleDeleteLog = useCallback(
    (id: string) => {
      deleteLog(id);
      setLogs(getStoredLogs());
      showToast(t.toasts.logDeleted, "info");
    },
    [showToast, t.toasts.logDeleted]
  );

  const handleDuplicateLog = useCallback(
    (entry: LogEntry) => {
      addLog({
        date: new Date().toISOString().substring(0, 10),
        client: entry.client,
        project: entry.project,
        category: entry.category,
        title: `${entry.title} (${t.common.copy})`,
        description: entry.description,
        impact: entry.impact,
        tags: entry.tags,
        isPublic: false,
      });
      setLogs(getStoredLogs());
      showToast(t.toasts.logDuplicated, "info");
    },
    [showToast, t.common.copy, t.toasts.logDuplicated]
  );

  const handleImportBatchLogs = useCallback(
    (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => {
      batch.forEach((entry) => addLog(entry));
      setLogs(getStoredLogs());
      setExperiences(getStoredExperiences());
      showToast(`${t.toasts.bulletsImported} (${batch.length})`, "success");
    },
    [showToast, t.toasts.bulletsImported]
  );

  // Experience Actions
  const handleSaveExperience = useCallback(
    (
      expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
      newLogBulletsToCreate?: string[]
    ) => {
      let experienceId = expData.id;
      if (expData.id) {
        updateExperience(expData as WorkExperience);
      } else {
        const created = addExperience(expData);
        experienceId = created.id;
      }

      if (newLogBulletsToCreate && newLogBulletsToCreate.length > 0) {
        newLogBulletsToCreate.forEach((bulletText) => {
          addLog(buildLogFromSavedExperienceBullet(expData, experienceId, bulletText));
        });
        showToast(`${t.toasts.experienceSaved} (${newLogBulletsToCreate.length}) 🔒✨`, "success");
      } else {
        showToast(`${t.toasts.experienceSaved}: ${expData.company}`);
      }

      setExperiences(getStoredExperiences());
      setLogs(getStoredLogs());
    },
    [showToast, t.toasts.experienceSaved]
  );

  const handleDeleteExperience = useCallback(
    (id: string) => {
      deleteExperience(id);
      setExperiences(getStoredExperiences());
      setLogs(getStoredLogs());
      showToast(t.toasts.experienceDeleted, "info");
    },
    [showToast, t.toasts.experienceDeleted]
  );

  const handleExtractBulletToLog = useCallback(
    (
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

      addLog(newLog);
      setLogs(getStoredLogs());
      showToast(`${company}: ${t.toasts.logSaved} ✨`, "success");
    },
    [showToast, t.toasts.logSaved]
  );

  const handleExtractAllBulletsForExperience = useCallback(
    (experienceId: string) => {
      const exp = experiences.find((e) => e.id === experienceId);
      if (!exp) return;

      const bullets =
        exp.bullets && exp.bullets.length > 0
          ? exp.bullets
          : exp.summary && !exp.summary.includes("extraída de CV")
          ? [exp.summary]
          : [];

      if (bullets.length === 0) return;

      const currentLogs = getStoredLogs();
      const existingBullets = new Set(
        currentLogs
          .filter((l) => l.experienceId === experienceId)
          .map((l) => (l.originalBullet || l.impact).trim())
      );

      const unextracted = bullets.filter((b) => !existingBullets.has(b.trim()));
      if (unextracted.length === 0) {
        showToast(`${t.toasts.bulletsImported} (${exp.company})`, "info");
        return;
      }

      unextracted.forEach((b) => {
        handleExtractBulletToLog(exp.id, exp.company, exp.role, b, exp.technologies);
      });

      showToast(
        `${t.toasts.bulletsImported} (${unextracted.length} - ${exp.company}) 🚀`,
        "success"
      );
    },
    [experiences, handleExtractBulletToLog, showToast, t.toasts.bulletsImported]
  );

  // Inbox Actions
  const handleSendVisitorMessage = useCallback(
    (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => {
      addVisitorMessage(msg);
      setInbox(getStoredInbox());
      showToast(t.toasts.messageSent, "success");
    },
    [showToast, t.toasts.messageSent]
  );

  const handleMarkMessageRead = useCallback((id: string) => {
    markMessageRead(id);
    setInbox(getStoredInbox());
  }, []);

  const handleDeleteMessage = useCallback(
    (id: string) => {
      deleteMessage(id);
      setInbox(getStoredInbox());
      showToast(t.toasts.messageDeleted, "info");
    },
    [showToast, t.toasts.messageDeleted]
  );

  // User Actions
  const handleLoginDev = useCallback(() => {
    const devUser: UserProfile = {
      ...INITIAL_USER,
      id: "dev-" + Date.now(),
      username: "devlead",
      name: "Rodrigo Jara (Dev Lead)",
      email: "rjara@example.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      title: "Senior Full Stack Architect",
      bio: "Engineering lead focused on scalable cloud systems and clean architecture.",
      location: "Santiago, Chile / Remote",
      skills: [
        { name: "TypeScript", category: "Languages" },
        { name: "React", category: "Frameworks" },
        { name: "Node.js", category: "Frameworks" },
        { name: "Firebase", category: "Cloud/DevOps" },
      ],
      authProvider: "custom",
      isCustom: true,
      createdAt: Date.now(),
    };
    handleLogin(devUser);
  }, [handleLogin]);

  const handleLogout = useCallback(() => {
    clearSessionData();
    setUser(null);

    resetToDemoData();
    setLogs(INITIAL_LOGS);
    setExperiences(INITIAL_EXPERIENCES);
    setInbox(INITIAL_INBOX);
    setJobOffers([]);

    onLoggedOutNavigate();
    showToast(`${t.nav.signOut} · ${t.common.success}`, "info");
  }, [onLoggedOutNavigate, showToast, t.common.success, t.nav.signOut]);

  const handleUpdateProfile = useCallback(
    (updated: UserProfile) => {
      saveUser(updated);
      setUser(updated);
      if (updated.username) {
        fetch("/api/public/claim-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: updated.username,
            userKey: updated.id || updated.email || "usr-current",
            userProfile: updated,
            logs,
            products,
          }),
        }).catch((e) => console.error("Silent claim-username sync error:", e));
      }
      showToast(t.toasts.profileUpdated, "success");
    },
    [logs, products, showToast, t.toasts.profileUpdated]
  );

  const handleUpdateAvatar = useCallback(
    (newAvatarUrl: string) => {
      const updated = updateUserAvatar(newAvatarUrl);
      if (updated) {
        setUser(updated);
        showToast(t.toasts.profileUpdated, "success");
      }
    },
    [showToast, t.toasts.profileUpdated]
  );

  // Job Offer Actions
  const handleSaveJobOffer = useCallback(
    (updated: JobOffer) => {
      updateJobOffer(updated);
      setJobOffers(getStoredJobOffers());
      showToast(`${updated.company}: ${t.toasts.offerSaved} ✨`);
    },
    [showToast, t.toasts.offerSaved]
  );

  const handleAddJobOffer = useCallback(
    (offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">) => {
      const created = addJobOffer(offer);
      setJobOffers(getStoredJobOffers());
      showToast(`${created.company}: ${t.toasts.offerSaved} 🎯`, "success");
    },
    [showToast, t.toasts.offerSaved]
  );

  const handleDeleteJobOffer = useCallback(
    (id: string) => {
      deleteJobOffer(id);
      setJobOffers(getStoredJobOffers());
      showToast(t.toasts.offerDeleted, "info");
    },
    [showToast, t.toasts.offerDeleted]
  );

  // Product Actions
  const handleSaveProduct = useCallback(
    (productData: any, isEditing: boolean) => {
      if (isEditing) {
        updateProduct(productData);
        setProducts(getStoredProducts());
        showToast("Producto actualizado exitosamente.", "success");
      } else {
        addProduct(productData);
        setProducts(getStoredProducts());
        showToast("Producto agregado al showcase.", "success");
      }
    },
    [showToast]
  );

  const handleDeleteProduct = useCallback(
    (id: string) => {
      deleteProduct(id);
      setProducts(getStoredProducts());
      showToast("Producto eliminado del showcase.", "info");
    },
    [showToast]
  );

  const handleToggleProductPublic = useCallback(
    (id: string) => {
      const updated = toggleProductPublic(id);
      if (updated) {
        setProducts(getStoredProducts());
        showToast(
          updated.isPublic ? "Producto visible en la Vitrina Pública." : "Producto movido a Bóveda Privada.",
          "info"
        );
      }
    },
    [showToast]
  );

  const unreadInboxCount = inbox.filter((m) => !m.read).length;
  const publicLogsCount = logs.filter((l) => l.isPublic).length;

  return {
    logs,
    experiences,
    setExperiences,
    user,
    inbox,
    jobOffers,
    products,
    unreadInboxCount,
    publicLogsCount,
    reloadDataFromStorage,
    handleSaveLog,
    handleTogglePublic,
    handleDeleteLog,
    handleDuplicateLog,
    handleImportBatchLogs,
    handleSaveExperience,
    handleDeleteExperience,
    handleExtractBulletToLog,
    handleExtractAllBulletsForExperience,
    handleSendVisitorMessage,
    handleMarkMessageRead,
    handleDeleteMessage,
    handleLogin,
    handleLoginDev,
    handleLogout,
    handleUpdateProfile,
    handleUpdateAvatar,
    handleSaveJobOffer,
    handleAddJobOffer,
    handleDeleteJobOffer,
    handleSaveProduct,
    handleDeleteProduct,
    handleToggleProductPublic,
  };
};
