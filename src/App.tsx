import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { TimelineView } from "./components/TimelineView";
import { InboxView } from "./components/InboxView";
import { DocumentationView } from "./components/DocumentationView";
import { PublicDeck } from "./components/PublicDeck";
import { QuickLogModal } from "./components/QuickLogModal";
import { AuthModal } from "./components/AuthModal";
import { SettingsBackupModal } from "./components/SettingsBackupModal";
import { PasteBulletsModal } from "./components/PasteBulletsModal";
import { CvUploadModal } from "./components/CvUploadModal";
import { ExperienceModal } from "./components/ExperienceModal";
import { FeaturesView } from "./components/FeaturesView";
import { AvatarModal } from "./components/AvatarModal";
import { OffersView } from "./components/OffersView";
import { ProductModal } from "./components/ProductModal";
import { ShareDeckModal } from "./components/ShareDeckModal";
import { fetchCloudUserState, ensureAuthenticatedUser } from "./utils/cloudState";
import { initializeStateFromCloud,
  STORAGE_KEYS,
  getStoredLogs, 
  saveLogs, 
  addLog, 
  updateLog, 
  toggleLogPublic, 
  deleteLog, 
  getStoredUser, 
  saveUser, 
  updateUserAvatar,
  getStoredInbox, 
  addVisitorMessage, 
  markMessageRead, 
  deleteMessage,
  getStoredExperiences,
  saveExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  getStoredJobOffers,
  saveJobOffers,
  addJobOffer,
  updateJobOffer,
  deleteJobOffer,
  getStoredProducts,
  saveProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductPublic,
  clearSessionData,
  resetToDemoData,
  purgeDummyPresetData,
  restoreFromCloudIfEmpty,
  INITIAL_LOGS,
  INITIAL_EXPERIENCES,
  INITIAL_INBOX,
  INITIAL_USER
} from "./utils/storage";
import { LogEntry, UserProfile, VisitorMessage, WorkExperience, LogCategory, JobOffer, Product } from "./types";
import { Check, Info, AlertTriangle, Lock } from "lucide-react";
import { useI18n } from "./i18n";
import { APP_VERSION as FALLBACK_APP_VERSION } from "./constants/version";
import { parseSharedDeckFromUrl } from "./utils/publicDeckShare";
import { auth, getRedirectResult, onAuthStateChanged, firebaseSignOut } from "./firebase";

// Global app version defined in vite.config.ts (with safe fallback)
declare const APP_VERSION: string | undefined;
const currentAppVersion = typeof APP_VERSION !== "undefined" ? APP_VERSION : FALLBACK_APP_VERSION;

export type ActiveView = "landing" | "quarters" | "public" | "features" | "docs" | "offers";

export default function App() {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p.startsWith("/u/") || h.startsWith("#/u/")) return "public";
      if (p === "/docs" || h === "#docs" || p.startsWith("/docs")) return "docs";
      if (p === "/features" || h === "#features") return "features";
      if (p === "/offers" || h === "#offers") return "offers";
      if (p === "/public" || h === "#public") return "public";
      if (p === "/quarters" || h === "#quarters") return "quarters";

      // If root path "/" or empty and an active user exists, redirect directly to quarters
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        if (stored) {
          const u = JSON.parse(stored);
          if (u && (u.id || u.email || u.name)) {
            return "quarters";
          }
        }
      } catch {
        // fallback
      }
    }
    return "landing";
  });
  const [activeQuartersTab, setActiveQuartersTab] = useState<"timeline" | "synthesis" | "inbox" | "docs" | "offers">("timeline");

  const handleNavigateView = (view: ActiveView) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      const targetPath = 
        view === "docs" ? "/docs" :
        view === "features" ? "/features" :
        view === "offers" ? "/offers" :
        view === "public" ? "/public" :
        view === "quarters" ? "/quarters" : "/";
      
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  };
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inbox, setInbox] = useState<VisitorMessage[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sharedDeck, setSharedDeck] = useState<{
    userProfile: UserProfile;
    logs: LogEntry[];
    products: Product[];
  } | null>(null);
  const [usernameLookupError, setUsernameLookupError] = useState<string | null>(null);
  const [isLoadingPublicUser, setIsLoadingPublicUser] = useState<boolean>(false);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [isPasteBulletsOpen, setIsPasteBulletsOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initialExperienceIdForLog, setInitialExperienceIdForLog] = useState<string | undefined>(undefined);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial Data Load & Auto-Healing of Experiences from Bitácora Logs
  useEffect(() => {
    purgeDummyPresetData();
    const storedLogs = getStoredLogs();
    const storedExps = getStoredExperiences();

    // Auto-heal experiences: if an experience has 0 bullets, but logs exist for this company in Bitácora,
    // re-hydrate its bullets array from those logs so the user sees all their real bullets!
    let expsChanged = false;
    const healedExps = storedExps.map((exp) => {
      if (!exp.bullets || exp.bullets.length === 0) {
        const companyKey = exp.company.trim().toLowerCase();
        const matched = storedLogs.filter(
          (l) => l.experienceId === exp.id || l.client.trim().toLowerCase() === companyKey
        );
        if (matched.length > 0) {
          expsChanged = true;
          return {
            ...exp,
            bullets: matched.map((l) => l.originalBullet || l.impact || l.title).filter(Boolean),
          };
        }
      }
      return exp;
    });

    if (expsChanged) {
      saveExperiences(healedExps);
      setExperiences(healedExps);
    } else {
      setExperiences(storedExps);
    }

    setLogs(storedLogs);
    const currentUser = getStoredUser();
    setUser(currentUser);
    setInbox(getStoredInbox());
    setJobOffers(getStoredJobOffers());
    setProducts(getStoredProducts());

    // Server-First initial load directly from Firestore via Cloud Functions
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

    // If local logs is empty but user is logged in (e.g. wiped browser cache), auto restore from cloud
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

    // Check Firebase Auth redirect result on mount if redirected
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            const fbUser = result.user;
            const userHandle = fbUser.email
              ? fbUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "")
              : "";
            const googleUserProfile: UserProfile = {
              ...INITIAL_USER,
              id: "google-" + fbUser.uid,
              username: userHandle || undefined,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Google User",
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

      // Maintain persistent Firebase Auth session across page refreshes
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && !fbUser.isAnonymous) {
          const stored = getStoredUser();
          const userHandle = fbUser.email
            ? fbUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "")
            : "";
          const activeUserProfile: UserProfile = {
            ...(stored || INITIAL_USER),
            id: stored?.id || "google-" + fbUser.uid,
            username: stored?.username || userHandle || undefined,
            name: stored?.name || fbUser.displayName || fbUser.email?.split("@")[0] || "Usuario",
            email: fbUser.email || stored?.email || "",
            avatar: stored?.avatar || fbUser.photoURL || INITIAL_USER.avatar,
            authProvider: stored?.authProvider || "google",
            isCustom: stored?.isCustom ?? false,
          };
          saveUser(activeUserProfile);
          setUser(activeUserProfile);

          // If on root "/" path or quarters, stay on quarters
          const p = window.location.pathname.toLowerCase();
          if (p === "/" || p === "" || p === "/quarters") {
            setActiveView("quarters");
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Global Keyboard Shortcuts (Cmd+K, Alt+L, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K or Alt + L opens quick log and switches to quarters if on landing
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEditingLog(null);
        setIsQuickLogOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEditingLog(null);
        setIsQuickLogOpen(true);
      } else if (e.key === "Escape") {
        setIsQuickLogOpen(false);
        setIsAuthOpen(false);
        setIsSettingsOpen(false);
        setEditingLog(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to load showcase from custom username route /u/:username
  const loadPublicShowcaseByUsername = async (targetUsername: string) => {
    const clean = targetUsername.toLowerCase().trim();
    if (!clean) return;

    // Check if the target is the currently active local user
    const localUser = getStoredUser();
    if (
      localUser &&
      ((localUser.username && localUser.username.toLowerCase() === clean) ||
        (localUser.email && localUser.email.split("@")[0].toLowerCase() === clean))
    ) {
      const localLogs = getStoredLogs();
      const localProducts = getStoredProducts();
      setSharedDeck({
        userProfile: localUser,
        logs: localLogs.filter((l) => l.isPublic),
        products: localProducts.filter((p) => p.isPublic !== false),
      });
      setUsernameLookupError(null);
      setIsLoadingPublicUser(false);
      setActiveView("public");
      return;
    }

    setIsLoadingPublicUser(true);
    setUsernameLookupError(null);

    try {
      const res = await fetch(`/api/public/u/${encodeURIComponent(clean)}`);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const data = await res.json();
        if (data && data.success && data.userProfile) {
          setSharedDeck({
            userProfile: data.userProfile,
            logs: data.logs || [],
            products: data.products || [],
          });
          setUsernameLookupError(null);
          setActiveView("public");
          return;
        }
      }
      // If not found in backend API
      setUsernameLookupError(`No se encontró la vitrina pública para el usuario "@${clean}".`);
      setSharedDeck(null);
      setActiveView("public");
    } catch (err) {
      console.error("Error loading public showcase by username:", err);
      setUsernameLookupError(`No fue posible cargar la vitrina para el usuario "@${clean}".`);
      setSharedDeck(null);
      setActiveView("public");
    } finally {
      setIsLoadingPublicUser(false);
    }
  };

  // Check for shared recruiter deck or /u/:username on mount & hash changes
  useEffect(() => {
    const checkRouteOrDeck = () => {
      const p = window.location.pathname;
      const h = window.location.hash;

      // 1. Detect /u/:username pattern
      if (p.startsWith("/u/") || h.startsWith("#/u/")) {
        const rawUsername = p.startsWith("/u/")
          ? p.replace("/u/", "").split("/")[0]
          : h.replace("#/u/", "").split("/")[0];
        if (rawUsername) {
          loadPublicShowcaseByUsername(rawUsername);
          return;
        }
      }

      // 2. Detect #deck=... or ?deck=...
      if (h.includes("deck=") || window.location.search.includes("deck=")) {
        parseSharedDeckFromUrl().then((deck) => {
          if (deck) {
            setSharedDeck(deck);
            setUsernameLookupError(null);
            setActiveView("public");
          }
        });
        return;
      }
    };

    checkRouteOrDeck();

    window.addEventListener("hashchange", checkRouteOrDeck);
    return () => window.removeEventListener("hashchange", checkRouteOrDeck);
  }, []);

  // Browser Navigation & History Handling (/u/:username, /docs, /features, /offers, /public)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();

      // Check /u/:username
      if (p.startsWith("/u/") || h.startsWith("#/u/")) {
        const rawUsername = p.startsWith("/u/")
          ? p.replace("/u/", "").split("/")[0]
          : h.replace("#/u/", "").split("/")[0];
        if (rawUsername) {
          loadPublicShowcaseByUsername(rawUsername);
          return;
        }
      }

      if (h.includes("deck=") || window.location.search.includes("deck=")) {
        parseSharedDeckFromUrl().then((deck) => {
          if (deck) {
            setSharedDeck(deck);
            setUsernameLookupError(null);
            setActiveView("public");
          }
        });
        return;
      }

      setUsernameLookupError(null);

      if (p === "/docs" || h === "#docs" || p.startsWith("/docs")) {
        setActiveView("docs");
      } else if (p === "/features" || h === "#features") {
        setActiveView("features");
      } else if (p === "/offers" || h === "#offers") {
        setActiveView("offers");
      } else if (p === "/public" || h === "#public") {
        setActiveView("public");
      } else if (p === "/quarters" || h === "#quarters") {
        setActiveView("quarters");
      } else {
        const stored = getStoredUser();
        if (stored) {
          setActiveView("quarters");
        } else {
          setActiveView("landing");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Log Actions
  const handleSaveLog = (entryData: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => {
    if (editingLog) {
      const updated: LogEntry = {
        ...editingLog,
        ...entryData,
      };
      updateLog(updated);
      setLogs(getStoredLogs());
      setEditingLog(null);
      showToast(t.toasts.logSaved);
    } else {
      const created = addLog(entryData);
      setLogs(getStoredLogs());
      if (created.isPublic) {
        showToast(t.toasts.logToggledPublic);
      } else {
        showToast(t.toasts.logToggledPrivate);
      }
    }
  };

  const handleTogglePublic = (id: string) => {
    const updated = toggleLogPublic(id);
    if (updated) {
      setLogs(getStoredLogs());
      if (updated.isPublic) {
        showToast(t.toasts.logToggledPublic);
      } else {
        showToast(t.toasts.logToggledPrivate);
      }
    }
  };

  const handleDeleteLog = (id: string) => {
    deleteLog(id);
    setLogs(getStoredLogs());
    showToast(t.toasts.logDeleted, "info");
  };

  const handleDuplicateLog = (entry: LogEntry) => {
    addLog({
      date: new Date().toISOString().substring(0, 10),
      client: entry.client,
      project: entry.project,
      category: entry.category,
      title: `${entry.title} (${t.common.copy})`,
      description: entry.description,
      impact: entry.impact,
      tags: entry.tags,
      isPublic: false, // Clone as private vault
    });
    setLogs(getStoredLogs());
    showToast(t.toasts.logDuplicated, "info");
  };

  const handleImportBatchLogs = (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => {
    batch.forEach((entry) => addLog(entry));
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    showToast(`${t.toasts.bulletsImported} (${batch.length})`, "success");
  };

  // Experience (Company / Project Container) Actions
  const handleOpenAddExperience = () => {
    setEditingExperience(null);
    setIsExperienceModalOpen(true);
  };

  const handleOpenEditExperience = (exp: WorkExperience) => {
    setEditingExperience(exp);
    setIsExperienceModalOpen(true);
  };

  const handleSaveExperience = (
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

    // Auto-create individual achievements in personal records if requested
    if (newLogBulletsToCreate && newLogBulletsToCreate.length > 0) {
      newLogBulletsToCreate.forEach((bulletText) => {
        const lower = bulletText.toLowerCase();
        let cat: LogCategory = "Feature ✨";
        if (lower.includes("campaña") || lower.includes("growth") || lower.includes("adquisici") || lower.includes("cac") || lower.includes("leads") || lower.includes("mql")) {
          cat = "Campaña / Growth 📈";
        } else if (lower.includes("convers") || lower.includes("funnel") || lower.includes("embudo") || lower.includes("abandono") || lower.includes("a/b test")) {
          cat = "Conversión & Funnel 🎯";
        } else if (lower.includes("contenido") || lower.includes("seo") || lower.includes("copy") || lower.includes("artículo") || lower.includes("blog")) {
          cat = "Contenido & SEO ✍️";
        } else if (lower.includes("branding") || lower.includes("marca") || lower.includes("evento")) {
          cat = "Branding & Eventos 🎨";
        } else if (lower.includes("diseño") || lower.includes("ux") || lower.includes("ui") || lower.includes("figma") || lower.includes("usabilidad")) {
          cat = "Diseño & UX 🖌️";
        } else if (lower.includes("venta") || lower.includes("revenue") || lower.includes("arr") || lower.includes("mrr") || lower.includes("comercial") || lower.includes("deal")) {
          cat = "Ventas & Revenue 💰";
        } else if (lower.includes("estrategia") || lower.includes("lider") || lower.includes("equipo") || lower.includes("contrataci")) {
          cat = "Estrategia & Liderazgo 👥";
        } else if (lower.includes("lanzamiento") || lower.includes("launch") || lower.includes("go-to-market")) {
          cat = "Lanzamiento 🚀";
        } else if (lower.includes("fix") || lower.includes("bug") || lower.includes("resolv") || lower.includes("incidenc")) {
          cat = "Fix 🐛";
        } else if (lower.includes("refactor") || lower.includes("migr") || lower.includes("deuda")) {
          cat = "Refactor 🧹";
        } else if (lower.includes("infra") || lower.includes("devops") || lower.includes("docker") || lower.includes("k8s") || lower.includes("aws") || lower.includes("ci/cd")) {
          cat = "Infra/DevOps 🚀";
        } else if (lower.includes("arquitect") || lower.includes("microserv")) {
          cat = "Architecture 🏗️";
        } else if (lower.includes("investig") || lower.includes("spike") || lower.includes("poc")) {
          cat = "Spike/R&D 🔬";
        }

        addLog({
          title: bulletText,
          logro: bulletText,
          client: expData.company,
          project: expData.role || expData.company,
          category: cat,
          date: expData.startDate ? (expData.startDate.length === 4 ? `${expData.startDate}-01-01` : expData.startDate) : new Date().toISOString().substring(0, 10),
          experienceId: experienceId,
          originalBullet: bulletText,
          impact: "",
          tags: expData.technologies && expData.technologies.length > 0 ? expData.technologies : [],
          isPublic: false, // Default to Bóveda Privada (Confidencial) 🔒
        });
      });
      showToast(`${t.toasts.experienceSaved} (${newLogBulletsToCreate.length}) 🔒✨`, "success");
    } else {
      showToast(`${t.toasts.experienceSaved}: ${expData.company}`);
    }

    setExperiences(getStoredExperiences());
    setLogs(getStoredLogs());
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
  };

  const handleDeleteExperience = (id: string) => {
    deleteExperience(id);
    setExperiences(getStoredExperiences());
    setLogs(getStoredLogs()); // Logs re-linked to personal projects
    showToast(t.toasts.experienceDeleted, "info");
  };

  const handleOpenAddLogToExperience = (experienceId: string) => {
    setEditingLog(null);
    setInitialExperienceIdForLog(experienceId);
    setIsQuickLogOpen(true);
  };

  const handleExtractBulletToLog = (
    experienceId: string,
    company: string,
    role: string,
    bulletText: string,
    technologies?: string[]
  ) => {
    const cleanBullet = bulletText.trim();
    if (!cleanBullet) return;

    let category: LogCategory = "Feature ✨";
    const lower = cleanBullet.toLowerCase();
    if (lower.includes("fix") || lower.includes("bug") || lower.includes("error") || lower.includes("resolv") || lower.includes("patch")) {
      category = "Fix 🐛";
    } else if (lower.includes("refactor") || lower.includes("migrat") || lower.includes("reorganiz") || lower.includes("clean") || lower.includes("moderniz")) {
      category = "Refactor 🧹";
    } else if (lower.includes("architect") || lower.includes("microservic") || lower.includes("system") || lower.includes("design") || lower.includes("vertical slice") || lower.includes("notion-style")) {
      category = "Architecture 🏗️";
    } else if (lower.includes("deploy") || lower.includes("ci/cd") || lower.includes("docker") || lower.includes("kubernetes") || lower.includes("pipeline") || lower.includes("azure devops") || lower.includes("aws") || lower.includes("observability") || lower.includes("opentelemetry") || lower.includes("new relic")) {
      category = "Infra/DevOps 🚀";
    } else if (lower.includes("ai") || lower.includes("spike") || lower.includes("research") || lower.includes("r&d") || lower.includes("copilot") || lower.includes("investigat") || lower.includes("poc")) {
      category = "Spike/R&D 🔬";
    }

    let title = cleanBullet;
    const firstPeriod = cleanBullet.indexOf(".");
    if (firstPeriod > 20 && firstPeriod < 120) {
      title = cleanBullet.substring(0, firstPeriod);
    } else if (title.length > 110) {
      title = title.substring(0, 107) + "...";
    }

    const tags = technologies && technologies.length > 0
      ? technologies.slice(0, 4).map((t) => `#${t.replace(/[\s\.]/g, "")}`)
      : ["#CVVerídico", "#Producción"];

    const newLog: Omit<LogEntry, "id" | "createdAt" | "updatedAt"> = {
      experienceId,
      originalBullet: cleanBullet,
      date: new Date().toISOString().substring(0, 10),
      client: company,
      project: role || "Ingeniería",
      category,
      title,
      description: `Logro extraído de viñeta real de CV (${company}).`,
      impact: cleanBullet,
      tags,
      isPublic: false,
    };

    addLog(newLog);
    setLogs(getStoredLogs());
    showToast(`${company}: ${t.toasts.logSaved} ✨`, "success");
  };

  const handleExtractAllBulletsForExperience = (experienceId: string) => {
    const exp = experiences.find((e) => e.id === experienceId);
    if (!exp) return;

    const bullets = (exp.bullets && exp.bullets.length > 0)
      ? exp.bullets
      : (exp.summary && !exp.summary.includes("extraída de CV") ? [exp.summary] : []);

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

    showToast(`${t.toasts.bulletsImported} (${unextracted.length} - ${exp.company}) 🚀`, "success");
  };

  // Inbox Actions
  const handleSendVisitorMessage = (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => {
    addVisitorMessage(msg);
    setInbox(getStoredInbox());
    showToast(t.toasts.messageSent, "success");
  };

  const handleMarkMessageRead = (id: string) => {
    markMessageRead(id);
    setInbox(getStoredInbox());
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
    setInbox(getStoredInbox());
    showToast(t.toasts.messageDeleted, "info");
  };

  // User Actions
  const handleLogin = async (newUser: UserProfile) => {
    purgeDummyPresetData();
    saveUser(newUser);
    setUser(newUser);

    // Hydrate user data directly from Firestore database
    try {
      const cloudData = await fetchCloudUserState();
      if (cloudData) {
        initializeStateFromCloud(cloudData);
        if (cloudData.experiences) setExperiences(cloudData.experiences);
        if (cloudData.logs) setLogs(cloudData.logs);
        if (cloudData.jobOffers) setJobOffers(cloudData.jobOffers);
        if (cloudData.products) setProducts(cloudData.products);
        if (cloudData.user) {
          const merged = { ...newUser, ...cloudData.user };
          setUser(merged);
          saveUser(merged);
        }
        showToast(t.toasts.dataRestored, "success");
      } else if (newUser.email) {
        const restored = await restoreFromCloudIfEmpty(newUser.email);
        if (restored) {
          setLogs(getStoredLogs());
          setExperiences(getStoredExperiences());
          setInbox(getStoredInbox());
          setJobOffers(getStoredJobOffers());
          setProducts(getStoredProducts());
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
    setActiveView("quarters");
  };

  const handleLoginDev = () => {
    const devUser: UserProfile = {
      ...INITIAL_USER,
      id: "dev-" + Date.now(),
      username: "devlead",
      name: "Rodrigo Jara (Dev Lead)",
      email: "rjara@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    // 1. Firebase Auth Sign Out if active
    if (auth && auth.currentUser && !auth.currentUser.isAnonymous) {
      firebaseSignOut(auth).catch((err) => console.warn("[App] Firebase sign out error:", err));
    }

    // 2. Clear session user and temporary CV data from storage
    clearSessionData();
    setUser(null);

    // 2. Reset private data and storage to clean baseline demo state
    resetToDemoData();
    setLogs(INITIAL_LOGS);
    setExperiences(INITIAL_EXPERIENCES);
    setInbox(INITIAL_INBOX);
    setJobOffers([]);

    // 3. Return directly to Landing Page
    setActiveView("landing");
    setActiveQuartersTab("timeline");

    // 4. Close all open modals & reset active edit states
    setIsAuthOpen(false);
    setIsSettingsOpen(false);
    setIsQuickLogOpen(false);
    setIsCvUploadOpen(false);
    setIsPasteBulletsOpen(false);
    setIsExperienceModalOpen(false);
    setEditingLog(null);
    setEditingExperience(null);
    setInitialExperienceIdForLog(undefined);

    // 5. User feedback
    showToast(`${t.nav.signOut} · ${t.common.success}`, "info");
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    saveUser(updated);
    setUser(updated);
    if (updated.username) {
      // Automatically register the handle on the backend index so /u/:username works right away
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
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    const updated = updateUserAvatar(newAvatarUrl);
    if (updated) {
      setUser(updated);
      showToast(t.toasts.profileUpdated, "success");
    }
  };

  // Job Offer Actions (Phase 2)
  const handleSaveJobOffer = (updated: JobOffer) => {
    updateJobOffer(updated);
    setJobOffers(getStoredJobOffers());
    showToast(`${updated.company}: ${t.toasts.offerSaved} ✨`);
  };

  const handleAddJobOffer = (offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">) => {
    const created = addJobOffer(offer);
    setJobOffers(getStoredJobOffers());
    showToast(`${created.company}: ${t.toasts.offerSaved} 🎯`, "success");
  };

  const handleDeleteJobOffer = (id: string) => {
    deleteJobOffer(id);
    setJobOffers(getStoredJobOffers());
    showToast(t.toasts.offerDeleted, "info");
  };

  // Product Actions (Showcase & Personal Projects)
  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(productData);
      setProducts(getStoredProducts());
      showToast("Producto actualizado exitosamente.", "success");
    } else {
      addProduct(productData);
      setProducts(getStoredProducts());
      showToast("Producto agregado al showcase.", "success");
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    setProducts(getStoredProducts());
    showToast("Producto eliminado del showcase.", "info");
  };

  const handleToggleProductPublic = (id: string) => {
    const updated = toggleProductPublic(id);
    if (updated) {
      setProducts(getStoredProducts());
      showToast(
        updated.isPublic ? "Producto visible en la Vitrina Pública." : "Producto movido a Bóveda Privada.",
        "info"
      );
    }
  };

  const reloadDataFromStorage = () => {
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    setUser(getStoredUser());
    setInbox(getStoredInbox());
    setJobOffers(getStoredJobOffers());
    setProducts(getStoredProducts());
  };

  const unreadInboxCount = inbox.filter((m) => !m.read).length;
  const publicLogsCount = logs.filter((l) => l.isPublic).length;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={(v) => {
          setUsernameLookupError(null);
          handleNavigateView(v);
        }}
        activeQuartersTab={activeQuartersTab}
        setActiveQuartersTab={setActiveQuartersTab}
        onOpenQuickLog={() => {
          setEditingLog(null);
          setIsQuickLogOpen(true);
        }}
        onOpenCvUpload={() => setIsCvUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onLogout={handleLogout}
        user={user}
        unreadInboxCount={unreadInboxCount}
        publicLogsCount={publicLogsCount}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${
        activeView === "features" || activeView === "docs" ? "px-0 py-0 max-w-none" : "max-w-7xl px-4 lg:px-8 py-6"
      }`}>
        
        {/* VIEW 1: PUBLIC LANDING PAGE */}
        {activeView === "landing" && (
          <LandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onEnterQuarters={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                handleNavigateView("quarters");
                setActiveQuartersTab("timeline");
              }
            }}
            onEnterPublicDeck={() => handleNavigateView("public")}
            onOpenDocs={() => handleNavigateView("docs")}
            onOpenQuickLog={() => {
              setEditingLog(null);
              setIsQuickLogOpen(true);
            }}
            onOpenFeatures={() => handleNavigateView("features")}
            user={user}
            logsCount={logs.length}
          />
        )}

        {/* VIEW 2: CAPTAIN'S QUARTERS (PRIVATE WORKSPACE) */}
        {activeView === "quarters" && (
          !user ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{t.app.privateSpaceProtected}</h3>
                <p className="text-slate-400 text-sm">
                  {t.app.privateSpaceDesc}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  {t.app.signInToAccess}
                </button>
                <button
                  onClick={() => handleNavigateView("landing")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                >
                  {t.app.backToHome}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {activeQuartersTab === "timeline" && (
                <TimelineView
                  logs={logs}
                  experiences={experiences}
                  products={products}
                  onTogglePublic={handleTogglePublic}
                  onEditLog={(log) => {
                    setEditingLog(log);
                    setIsQuickLogOpen(true);
                  }}
                  onDeleteLog={handleDeleteLog}
                  onDuplicateLog={handleDuplicateLog}
                  onOpenQuickLog={() => {
                    setEditingLog(null);
                    setInitialExperienceIdForLog(undefined);
                    setIsQuickLogOpen(true);
                  }}
                  onOpenPasteBullets={() => setIsPasteBulletsOpen(true)}
                  onOpenCvUpload={() => setIsCvUploadOpen(true)}
                  onAddExperience={handleOpenAddExperience}
                  onEditExperience={handleOpenEditExperience}
                  onDeleteExperience={handleDeleteExperience}
                  onAddLogToExperience={handleOpenAddLogToExperience}
                  onExtractBulletToLog={handleExtractBulletToLog}
                  onExtractAllBulletsForExperience={handleExtractAllBulletsForExperience}
                  onOpenNewProduct={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  onEditProduct={(p) => {
                    setEditingProduct(p);
                    setIsProductModalOpen(true);
                  }}
                  onDeleteProduct={handleDeleteProduct}
                  onToggleProductPublic={handleToggleProductPublic}
                />
              )}

              {activeQuartersTab === "inbox" && (
                <InboxView
                  messages={inbox}
                  onMarkRead={handleMarkMessageRead}
                  onDeleteMessage={handleDeleteMessage}
                />
              )}

              {activeQuartersTab === "docs" && (
                <DocumentationView
                  onOpenQuickLog={() => {
                    setEditingLog(null);
                    setInitialExperienceIdForLog(undefined);
                    setIsQuickLogOpen(true);
                  }}
                  onGoToTimeline={() => setActiveQuartersTab("timeline")}
                  onGoToPublicDeck={() => handleNavigateView("public")}
                  onBackToLanding={() => handleNavigateView("landing")}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onOpenCvUpload={() => setIsCvUploadOpen(true)}
                  user={user}
                />
              )}

              {activeQuartersTab === "offers" && (
                <OffersView
                  offers={jobOffers}
                  logs={logs}
                  experiences={experiences}
                  user={user}
                  onSaveOffer={handleSaveJobOffer}
                  onAddOffer={handleAddJobOffer}
                  onDeleteOffer={handleDeleteJobOffer}
                  onOpenQuickLog={() => {
                    setEditingLog(null);
                    setInitialExperienceIdForLog(undefined);
                    setIsQuickLogOpen(true);
                  }}
                  onOpenCvUpload={() => setIsCvUploadOpen(true)}
                />
              )}
            </div>
          )
        )}

        {/* VIEW 3: PUBLIC DECK (RECRUITER / CLIENT SHOWCASE) */}
        {activeView === "public" && (
          isLoadingPublicUser ? (
            <div className="py-24 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                <span className="text-xl font-bold font-mono">/u/</span>
              </div>
              <h3 className="text-base font-bold text-white">Cargando vitrina pública...</h3>
              <p className="text-xs text-slate-400">Verificando logros y credenciales técnicas del usuario.</p>
            </div>
          ) : usernameLookupError ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Vitrina No Encontrada</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {usernameLookupError} Es posible que el enlace no esté escrito correctamente o que el usuario aún no haya publicado contenido.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setUsernameLookupError(null);
                    handleNavigateView("landing");
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Ir al Inicio
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      setUsernameLookupError(null);
                      handleNavigateView("quarters");
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Ir a Mi Bitácora
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          ) : (
            <PublicDeck
              logs={sharedDeck ? sharedDeck.logs : logs}
              products={sharedDeck ? sharedDeck.products : products}
              userProfile={sharedDeck ? sharedDeck.userProfile : (user || INITIAL_USER)}
              onSendVisitorMessage={handleSendVisitorMessage}
              onBackToLanding={() => {
                if (sharedDeck) {
                  if (typeof window !== "undefined") {
                    window.location.hash = "";
                  }
                  setSharedDeck(null);
                }
                setUsernameLookupError(null);
                handleNavigateView("landing");
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
              isVisitorPreview={Boolean(sharedDeck || !user)}
              isOwner={Boolean(!sharedDeck && user && !user.isDemoUser)}
              onOpenNewProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onToggleProductPublic={handleToggleProductPublic}
            />
          )
        )}

        {/* VIEW 4: DEDICATED FEATURES SHOWCASE PAGE */}
        {activeView === "features" && (
          <FeaturesView
            onBackToLanding={() => handleNavigateView("landing")}
            onGoToQuarters={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                handleNavigateView("quarters");
                setActiveQuartersTab("timeline");
              }
            }}
            onOpenQuickLog={() => {
              setEditingLog(null);
              setIsQuickLogOpen(true);
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            user={user}
          />
        )}

        {/* VIEW 5: PUBLIC USER GUIDE & DOCUMENTATION (/docs) */}
        {activeView === "docs" && (
          <DocumentationView
            onOpenQuickLog={() => {
              setEditingLog(null);
              setInitialExperienceIdForLog(undefined);
              setIsQuickLogOpen(true);
            }}
            onGoToTimeline={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                handleNavigateView("quarters");
                setActiveQuartersTab("timeline");
              }
            }}
            onGoToPublicDeck={() => handleNavigateView("public")}
            onBackToLanding={() => handleNavigateView("landing")}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenCvUpload={() => setIsCvUploadOpen(true)}
            user={user}
          />
        )}

        {/* VIEW 6: OFFERS & TAILORED CV ENGINE (PHASE 2) */}
        {activeView === "offers" && (
          <OffersView
            offers={jobOffers}
            logs={logs}
            experiences={experiences}
            user={user}
            onSaveOffer={handleSaveJobOffer}
            onAddOffer={handleAddJobOffer}
            onDeleteOffer={handleDeleteJobOffer}
            onOpenQuickLog={() => {
              setEditingLog(null);
              setInitialExperienceIdForLog(undefined);
              setIsQuickLogOpen(true);
            }}
            onOpenCvUpload={() => setIsCvUploadOpen(true)}
          />
        )}
      </main>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => {
          setIsQuickLogOpen(false);
          setEditingLog(null);
          setInitialExperienceIdForLog(undefined);
        }}
        onSave={handleSaveLog}
        existingLogs={logs}
        initialData={editingLog}
        initialExperienceId={initialExperienceIdForLog}
      />

      {/* Experience Modal (Companies / Personal Projects Container) */}
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => {
          setIsExperienceModalOpen(false);
          setEditingExperience(null);
        }}
        onSave={handleSaveExperience}
        initialData={editingExperience}
        existingLogs={logs}
      />

      {/* CV Upload Modal (Alternativa 1) */}
      <CvUploadModal
        isOpen={isCvUploadOpen}
        onClose={() => setIsCvUploadOpen(false)}
        onImportLogs={handleImportBatchLogs}
        onExperiencesUpdated={(updated) => setExperiences(updated)}
        currentUser={user}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Paste Bullets Batch Modal (Alternativa 2) */}
      <PasteBulletsModal
        isOpen={isPasteBulletsOpen}
        onClose={() => setIsPasteBulletsOpen(false)}
        onImportLogs={handleImportBatchLogs}
        onOpenCvModal={() => setIsCvUploadOpen(true)}
      />

      {/* Auth Modal (Google Login + Custom Login/Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onLoginDev={handleLoginDev}
      />

      {/* Settings & Backup Modal */}
      <SettingsBackupModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataChanged={reloadDataFromStorage}
        totalLogs={logs.length}
        currentUser={user}
        onUpdateProfile={handleUpdateProfile}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Avatar Changer Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
        userName={user?.name || "Usuario"}
        onSaveAvatar={handleUpdateAvatar}
      />

      {/* Global Share Deck Modal */}
      {user && (
        <ShareDeckModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          user={user}
          logs={logs}
          products={products}
        />
      )}

      {/* Product Modal (Showcase & Personal Projects) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        availableLogs={logs}
      />

      {/* Toast Feedback Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          {toast.type === "success" && <Check className="w-4 h-4 text-emerald-400" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
          {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <span className="text-xs font-medium text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-slate-300 font-bold">
                {t.app.footerTagline}
              </p>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.2 rounded font-semibold">
                v{currentAppVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t.app.footerPrivacy}
            </p>
            <p className="font-mono text-xs text-slate-400">
              v{APP_VERSION}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => handleNavigateView("landing")}
              className="hover:text-cyan-400 transition-colors"
            >
              {t.app.navHome}
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigateView("features")}
              className="hover:text-cyan-400 transition-colors"
            >
              {t.app.navFeatures}
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (!user) setIsAuthOpen(true);
                else handleNavigateView("offers");
              }}
              className="hover:text-cyan-400 transition-colors text-indigo-300 font-medium"
            >
              {t.app.navOffers}
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigateView("docs")}
              className="hover:text-cyan-400 transition-colors font-medium text-cyan-300"
            >
              {t.app.navDocs}
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (!user) {
                  setIsAuthOpen(true);
                } else {
                  handleNavigateView("quarters");
                  setActiveQuartersTab("timeline");
                }
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              {t.app.navLogbook}
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigateView("public")}
              className="hover:text-cyan-400 transition-colors"
            >
              {t.app.navShowcase}
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              {t.app.navSettings}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
