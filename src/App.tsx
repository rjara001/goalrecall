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
import { 
  getStoredLogs, 
  saveLogs, 
  addLog, 
  updateLog, 
  toggleLogPublic, 
  deleteLog, 
  getStoredUser, 
  saveUser, 
  getStoredInbox, 
  addVisitorMessage, 
  markMessageRead, 
  deleteMessage,
  getStoredExperiences,
  saveExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  clearSessionData,
  resetToDemoData,
  purgeDummyPresetData,
  restoreFromCloudIfEmpty,
  INITIAL_LOGS,
  INITIAL_EXPERIENCES,
  INITIAL_INBOX,
  INITIAL_USER
} from "./utils/storage";
import { LogEntry, UserProfile, VisitorMessage, WorkExperience, LogCategory } from "./types";
import { Check, Info, AlertTriangle, Lock } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<"landing" | "quarters" | "public">("landing");
  const [activeQuartersTab, setActiveQuartersTab] = useState<"timeline" | "synthesis" | "inbox" | "docs">("timeline");
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inbox, setInbox] = useState<VisitorMessage[]>([]);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [isPasteBulletsOpen, setIsPasteBulletsOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [initialExperienceIdForLog, setInitialExperienceIdForLog] = useState<string | undefined>(undefined);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    // If local logs is empty but user is logged in (e.g. wiped browser cache), auto restore from cloud
    if (currentUser?.email && storedLogs.length === 0) {
      restoreFromCloudIfEmpty(currentUser.email).then((restored) => {
        if (restored) {
          setLogs(getStoredLogs());
          setExperiences(getStoredExperiences());
          setInbox(getStoredInbox());
        }
      });
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
      showToast("Log actualizado correctamente.");
    } else {
      const created = addLog(entryData);
      setLogs(getStoredLogs());
      if (created.isPublic) {
        showToast("Log creado y publicado en Public Deck ✨");
      } else {
        showToast("Log guardado en Sandbox Privado (Confidencial) 🔒");
      }
    }
  };

  const handleTogglePublic = (id: string) => {
    const updated = toggleLogPublic(id);
    if (updated) {
      setLogs(getStoredLogs());
      if (updated.isPublic) {
        showToast("Log publicado en Public Deck y visible para First Mate ✨");
      } else {
        showToast("Log devuelto a Sandbox Privado (Confidencial) 🔒");
      }
    }
  };

  const handleDeleteLog = (id: string) => {
    deleteLog(id);
    setLogs(getStoredLogs());
    showToast("Log eliminado de la bitácora.", "info");
  };

  const handleDuplicateLog = (entry: LogEntry) => {
    addLog({
      date: new Date().toISOString().substring(0, 10),
      client: entry.client,
      project: entry.project,
      category: entry.category,
      title: `${entry.title} (Copia)`,
      description: entry.description,
      impact: entry.impact,
      tags: entry.tags,
      isPublic: false, // Clone as private sandbox
    });
    setLogs(getStoredLogs());
    showToast("Log duplicado en Sandbox Privado.", "info");
  };

  const handleImportBatchLogs = (batch: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => {
    batch.forEach((entry) => addLog(entry));
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    showToast(`¡Se importaron ${batch.length} logros a tu Sandbox Privado! 🔒`, "success");
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
          isPublic: false, // Default to Sandbox Privado 🔒
        });
      });
      showToast(`¡Empresa guardada y se crearon ${newLogBulletsToCreate.length} logros en tu bitácora privada! 🔒✨`, "success");
    } else {
      showToast(`Empresa "${expData.company}" guardada correctamente.`);
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
    showToast("Empresa eliminada. Sus logros fueron transferidos a Proyectos Personales.", "info");
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
    showToast(`¡Viñeta extraída como logro en ${company}! ✨`, "success");
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
      showToast("Todas las viñetas de esta experiencia ya están en tu Bitácora.", "info");
      return;
    }

    unextracted.forEach((b) => {
      handleExtractBulletToLog(exp.id, exp.company, exp.role, b, exp.technologies);
    });

    showToast(`¡Se extrajeron ${unextracted.length} logros a la Bitácora para ${exp.company}! 🚀`, "success");
  };

  // Inbox Actions
  const handleSendVisitorMessage = (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => {
    addVisitorMessage(msg);
    setInbox(getStoredInbox());
    showToast("¡Recado recibido y guardado en tu Inbox privado!", "success");
  };

  const handleMarkMessageRead = (id: string) => {
    markMessageRead(id);
    setInbox(getStoredInbox());
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
    setInbox(getStoredInbox());
    showToast("Mensaje eliminado del inbox.", "info");
  };

  // User Actions
  const handleLogin = async (newUser: UserProfile) => {
    purgeDummyPresetData();
    saveUser(newUser);
    setUser(newUser);

    // If local logs is empty (e.g. new device or cleared cache), check for cloud backup
    const currentLogs = getStoredLogs();
    if (currentLogs.length === 0 && newUser.email) {
      const restored = await restoreFromCloudIfEmpty(newUser.email);
      if (restored) {
        showToast("¡Datos restaurados automáticamente desde la nube! ☁️", "success");
      }
    }

    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    setInbox(getStoredInbox());
    const providerLabel = newUser.authProvider === "google" ? "Google" : "Custom Login";
    showToast(`¡Bienvenido, ${newUser.name}! Sesión iniciada con ${providerLabel}. ✨`, "success");
    setActiveView("quarters");
  };

  const handleLogout = () => {
    // 1. Clear session user and temporary CV data from storage
    clearSessionData();
    setUser(null);

    // 2. Reset private data and storage to clean baseline demo state
    resetToDemoData();
    setLogs(INITIAL_LOGS);
    setExperiences(INITIAL_EXPERIENCES);
    setInbox(INITIAL_INBOX);

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
    showToast("Sesión cerrada exitosamente. Retornando a la página de inicio.", "info");
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    saveUser(updated);
    setUser(updated);
    showToast("Perfil de usuario actualizado correctamente.", "success");
  };

  const reloadDataFromStorage = () => {
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    setUser(getStoredUser());
    setInbox(getStoredInbox());
  };

  const unreadInboxCount = inbox.filter((m) => !m.read).length;
  const publicLogsCount = logs.filter((l) => l.isPublic).length;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        activeQuartersTab={activeQuartersTab}
        setActiveQuartersTab={setActiveQuartersTab}
        onOpenQuickLog={() => {
          setEditingLog(null);
          setIsQuickLogOpen(true);
        }}
        onOpenCvUpload={() => setIsCvUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        user={user}
        unreadInboxCount={unreadInboxCount}
        publicLogsCount={publicLogsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* VIEW 1: PUBLIC LANDING PAGE */}
        {activeView === "landing" && (
          <LandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onEnterQuarters={() => {
              if (!user) {
                setIsAuthOpen(true);
              } else {
                setActiveView("quarters");
              }
            }}
            onEnterPublicDeck={() => setActiveView("public")}
            onOpenDocs={() => {
              setActiveView("quarters");
              setActiveQuartersTab("docs");
            }}
            onOpenQuickLog={() => {
              setEditingLog(null);
              setIsQuickLogOpen(true);
            }}
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
                <h3 className="text-xl font-bold text-white">Espacio Privado Protegido</h3>
                <p className="text-slate-400 text-sm">
                  Inicia sesión para acceder a tu Bitácora privada, gestionar logros por empresa y sintetizar versiones de tu trayectoria.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setActiveView("landing")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : (
            <div>
              {activeQuartersTab === "timeline" && (
                <TimelineView
                  logs={logs}
                  experiences={experiences}
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
                  onGoToPublicDeck={() => setActiveView("public")}
                />
              )}
            </div>
          )
        )}

        {/* VIEW 3: PUBLIC DECK (RECRUITER / CLIENT SHOWCASE) */}
        {activeView === "public" && (
          <PublicDeck
            logs={logs}
            userProfile={user || INITIAL_USER}
            onSendVisitorMessage={handleSendVisitorMessage}
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
      />

      {/* Settings & Backup Modal */}
      <SettingsBackupModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataChanged={reloadDataFromStorage}
        totalLogs={logs.length}
        currentUser={user}
        onUpdateProfile={handleUpdateProfile}
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
            <p className="font-mono text-xs text-slate-300 font-bold">
              GOAL RECALL · Bitácora Profesional con Cloud Sync y Vitrina Pública Ejecutiva
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Privacidad garantizada: sincronización segura en la nube con respaldo continuo y aislamiento por cuenta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setActiveView("landing")}
              className="hover:text-cyan-400 transition-colors"
            >
              Inicio
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveView("quarters");
                setActiveQuartersTab("timeline");
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Captain's Quarters
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveView("public")}
              className="hover:text-cyan-400 transition-colors"
            >
              Public Deck
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveView("quarters");
                setActiveQuartersTab("docs");
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Manual de Vuelo (Guía)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Redes & Respaldo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
