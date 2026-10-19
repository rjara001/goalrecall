import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { TimelineView } from "./components/TimelineView";
import { SynthesisHub } from "./components/SynthesisHub";
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
  addExperience,
  updateExperience,
  deleteExperience,
  clearSessionData,
  resetToDemoData,
  purgeDummyPresetData,
  INITIAL_LOGS,
  INITIAL_EXPERIENCES,
  INITIAL_INBOX,
  INITIAL_USER
} from "./utils/storage";
import { LogEntry, UserProfile, VisitorMessage, WorkExperience } from "./types";
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

  // Initial Data Load
  useEffect(() => {
    purgeDummyPresetData();
    setLogs(getStoredLogs());
    setExperiences(getStoredExperiences());
    setUser(getStoredUser());
    setInbox(getStoredInbox());
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
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    if (expData.id) {
      updateExperience(expData as WorkExperience);
      setExperiences(getStoredExperiences());
      setLogs(getStoredLogs()); // Company name updates might cascade to logs
      setIsExperienceModalOpen(false);
      setEditingExperience(null);
      showToast(`Empresa "${expData.company}" actualizada correctamente.`);
    } else {
      const created = addExperience(expData);
      setExperiences(getStoredExperiences());
      setIsExperienceModalOpen(false);
      setEditingExperience(null);
      showToast(`Empresa/Proyecto "${created.company}" creado con éxito. ✨`);
    }
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
  const handleLogin = (newUser: UserProfile) => {
    saveUser(newUser);
    setUser(newUser);
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
            user={user}
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
                />
              )}

              {activeQuartersTab === "synthesis" && (
                <SynthesisHub logs={logs} userName={user?.name || "Senior Software Engineer"} />
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
                  onGoToSynthesis={() => setActiveQuartersTab("synthesis")}
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
      />

      {/* CV Upload Modal (Alternativa 1) */}
      <CvUploadModal
        isOpen={isCvUploadOpen}
        onClose={() => setIsCvUploadOpen(false)}
        onImportLogs={handleImportBatchLogs}
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
              GOAL RECALL · Bitácora Local-First y Vitrina Pública Ejecutiva
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Privacidad garantizada: tus datos residen en tu navegador sin telemetría de terceros.
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
              Respaldo JSON
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
