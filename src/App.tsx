import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { TimelineView } from "./components/TimelineView";
import { SynthesisHub } from "./components/SynthesisHub";
import { InboxView } from "./components/InboxView";
import { DocumentationView } from "./components/DocumentationView";
import { PublicDeck } from "./components/PublicDeck";
import { QuickLogModal } from "./components/QuickLogModal";
import { AuthModal } from "./components/AuthModal";
import { SettingsBackupModal } from "./components/SettingsBackupModal";
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
  deleteMessage 
} from "./utils/storage";
import { LogEntry, UserProfile, VisitorMessage } from "./types";
import { Check, Info, Bell, AlertTriangle } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<"quarters" | "public">("quarters");
  const [activeQuartersTab, setActiveQuartersTab] = useState<"timeline" | "synthesis" | "inbox" | "docs">("timeline");
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [inbox, setInbox] = useState<VisitorMessage[]>([]);

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
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
    setLogs(getStoredLogs());
    setUser(getStoredUser());
    setInbox(getStoredInbox());
  }, []);

  // Global Keyboard Shortcuts (Cmd+K, Alt+L, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K or Alt + L
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
    showToast(`¡Bienvenido, ${newUser.name}! Sesión sincronizada.`);
  };

  const handleLogout = () => {
    saveUser(null);
    setUser(null);
    showToast("Has cerrado la sesión.", "info");
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    saveUser(updated);
    setUser(updated);
    showToast("Perfil del Capitán actualizado.");
  };

  const reloadDataFromStorage = () => {
    setLogs(getStoredLogs());
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
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        unreadInboxCount={unreadInboxCount}
        publicLogsCount={publicLogsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {activeView === "quarters" ? (
          /* Captain's Quarters (Private Workspace) */
          <div>
            {activeQuartersTab === "timeline" && (
              <TimelineView
                logs={logs}
                onTogglePublic={handleTogglePublic}
                onEditLog={(log) => {
                  setEditingLog(log);
                  setIsQuickLogOpen(true);
                }}
                onDeleteLog={handleDeleteLog}
                onDuplicateLog={handleDuplicateLog}
                onOpenQuickLog={() => {
                  setEditingLog(null);
                  setIsQuickLogOpen(true);
                }}
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
                  setIsQuickLogOpen(true);
                }}
                onGoToSynthesis={() => setActiveQuartersTab("synthesis")}
                onGoToPublicDeck={() => setActiveView("public")}
              />
            )}
          </div>
        ) : (
          /* Public Deck (Recruiter / Client Showcase) */
          user ? (
            <PublicDeck
              logs={logs}
              userProfile={user}
              onSendVisitorMessage={handleSendVisitorMessage}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-sm">Cargando perfil público...</p>
            </div>
          )
        )}
      </main>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => {
          setIsQuickLogOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        existingLogs={logs}
        initialData={editingLog}
      />

      {/* Auth Modal */}
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
      <footer className="border-t border-slate-900 bg-[#060910] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px]">
            CAPTAIN'S LOG · Bitácora Local-First y Vitrina Pública Ejecutiva
          </p>
          <div className="flex items-center gap-4 text-[11px]">
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
              Exportar Respaldo JSON
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
