import React from "react";
import { 
  Compass, 
  Plus, 
  FileUp,
  BookOpen, 
  Clock, 
  Sparkles, 
  Inbox, 
  Eye, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  User, 
  Settings as SettingsIcon,
  HelpCircle,
  Home,
  LogIn,
  Users
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeView: "landing" | "quarters" | "public";
  setActiveView: (view: "landing" | "quarters" | "public") => void;
  activeQuartersTab: "timeline" | "synthesis" | "inbox" | "docs";
  setActiveQuartersTab: (tab: "timeline" | "synthesis" | "inbox" | "docs") => void;
  onOpenQuickLog: () => void;
  onOpenCvUpload: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  user: UserProfile | null;
  unreadInboxCount: number;
  publicLogsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  activeQuartersTab,
  setActiveQuartersTab,
  onOpenQuickLog,
  onOpenCvUpload,
  onOpenAuth,
  onOpenSettings,
  onLogout,
  user,
  unreadInboxCount,
  publicLogsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark Brand */}
        <button
          onClick={() => setActiveView("landing")}
          className="flex items-center gap-3 shrink-0 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10 group-hover:border-cyan-400 transition-colors">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base lg:text-lg text-white group-hover:text-cyan-300 transition-colors">
                GOAL RECALL
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Bitácora Técnica & Historial de Logros
            </p>
          </div>
        </button>

        {/* Zone 2: Navigation & Mode Switcher */}
        <nav className="flex items-center gap-2 lg:gap-3 overflow-x-auto py-1">
          {/* Main Triple View Switcher */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setActiveView("landing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === "landing"
                  ? "bg-slate-800 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inicio</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setActiveView("quarters");
                  setActiveQuartersTab("timeline");
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === "quarters" && activeQuartersTab === "timeline"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mi Bitácora</span>
              <span className="hidden md:inline text-[10px] opacity-75">(Privada)</span>
            </button>

            <button
              onClick={() => setActiveView("public")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === "public"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vitrina Pública</span>
              <span className="text-[10px] font-mono font-bold bg-slate-800/80 px-1.5 py-0.2 rounded text-emerald-300">
                {publicLogsCount}
              </span>
            </button>
          </div>

          {/* Sub-navigation depending on mode */}
          {activeView === "quarters" && (
            <div className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-400">
              <button
                onClick={() => setActiveQuartersTab("inbox")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors relative ${
                  activeQuartersTab === "inbox" ? "text-cyan-400 bg-slate-800/50" : "hover:text-slate-200"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inbox</span>
                {unreadInboxCount > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-mono font-bold">
                    {unreadInboxCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveQuartersTab("docs")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeQuartersTab === "docs" ? "text-cyan-400 bg-slate-800/50" : "hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guía</span>
              </button>
            </div>
          )}

          {activeView === "landing" && (
            <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={() => {
                  setActiveView("quarters");
                  setActiveQuartersTab("docs");
                }}
                className="hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guía de Uso</span>
              </button>
              <button
                onClick={() => setActiveView("public")}
                className="hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vitrina Pública</span>
              </button>
            </div>
          )}
        </nav>

          {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {activeView === "quarters" && (
            <>
              <button
                onClick={onOpenCvUpload}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/50 hover:border-purple-400 text-purple-200 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                title="Importar logros y empresas desde tu CV (PDF o DOCX)"
              >
                <FileUp className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden md:inline">Importar CV</span>
              </button>

              <button
                onClick={onOpenQuickLog}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Nuevo Log</span>
                <kbd className="hidden md:inline-block font-mono text-[10px] bg-cyan-950/40 text-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/30">
                  ⌘K
                </kbd>
              </button>
            </>
          )}

          {activeView === "landing" && !user && (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Conectar con Google</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title="Copia de Seguridad & Respaldo JSON"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Active User Profile Pill Button or Login Button */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuth}
                title={`Sesión activa: ${user.name} (${user.title}). Clic para ver perfil o credenciales.`}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-xl text-xs text-slate-300 transition-all group"
              >
                <img
                  src={user.avatar}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                />
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-white block max-w-[100px] truncate text-[11px] leading-tight">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-mono block leading-tight text-cyan-400">
                    {user.authProvider === "google" ? "Google" : "Custom"} ▾
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Cerrar sesión y limpiar sesión activa"
                className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {activeView === "quarters" && (
        <div className="flex xl:hidden items-center justify-end gap-2 pt-2 mt-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveQuartersTab("inbox")}
            className={`px-3 py-1 rounded-md shrink-0 flex items-center gap-1.5 ${
              activeQuartersTab === "inbox" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox {unreadInboxCount > 0 && `(${unreadInboxCount})`}</span>
          </button>
          <button
            onClick={() => setActiveQuartersTab("docs")}
            className={`px-3 py-1 rounded-md shrink-0 flex items-center gap-1.5 ${
              activeQuartersTab === "docs" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía</span>
          </button>
        </div>
      )}
    </header>
  );
};
