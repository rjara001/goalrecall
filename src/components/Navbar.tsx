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
  LogIn,
  Users,
  Camera,
  Layers,
  Home,
  Briefcase
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeView: "landing" | "quarters" | "public" | "features" | "docs" | "offers";
  setActiveView: (view: "landing" | "quarters" | "public" | "features" | "docs" | "offers") => void;
  activeQuartersTab: "timeline" | "synthesis" | "inbox" | "docs" | "offers";
  setActiveQuartersTab: (tab: "timeline" | "synthesis" | "inbox" | "docs" | "offers") => void;
  onOpenQuickLog: () => void;
  onOpenCvUpload: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAvatarModal?: () => void;
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
  onOpenAvatarModal,
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
        <nav className="flex items-center gap-2 lg:gap-4 overflow-x-auto py-1">
          {activeView === "landing" ? (
            /* Contextual Navigation for Landing Page */
            <div className="flex items-center gap-1 sm:gap-2 text-xs">
              <button
                onClick={() => setActiveView("features")}
                className="px-2.5 py-1.5 rounded-lg text-cyan-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium flex items-center gap-1.5 border border-cyan-500/20 bg-cyan-950/30"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Características</span>
              </button>
              <button
                onClick={() => {
                  if (!user) onOpenAuth();
                  else setActiveView("offers");
                }}
                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors font-medium flex items-center gap-1.5"
                title="Motor de Ofertas & CVs Enfocados"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Ofertas & CVs</span>
              </button>
              <button
                onClick={() => setActiveView("docs")}
                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors font-medium flex items-center gap-1.5"
                title="Documentación y Guía del Usuario (/docs)"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guía (/docs)</span>
              </button>
              <a
                href="#workflow"
                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors font-medium hidden sm:inline-block"
              >
                Cómo Funciona
              </a>
              <a
                href="#comparison"
                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors font-medium hidden lg:inline-block"
              >
                Comparativa
              </a>
              <a
                href="#testimonials"
                className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors font-medium hidden lg:inline-block"
              >
                Testimonios
              </a>
              <button
                onClick={() => setActiveView("public")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/60 transition-all font-medium text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Demo Pública</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-800/40">
                  {publicLogsCount}
                </span>
              </button>
            </div>
          ) : (
            /* Contextual Navigation for App Views (Quarters, Public Deck, Features, Docs & Offers) */
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0">
              <button
                onClick={() => setActiveView("landing")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-400 hover:text-white transition-all"
                title="Volver a la página principal"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Inicio</span>
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
                onClick={() => {
                  if (!user) {
                    onOpenAuth();
                  } else {
                    setActiveView("offers");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "offers"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Ofertas & CVs</span>
              </button>

              <button
                onClick={() => setActiveView("features")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "features"
                    ? "bg-purple-600 text-white font-semibold shadow-sm shadow-purple-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Características</span>
              </button>

              <button
                onClick={() => setActiveView("docs")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "docs"
                    ? "bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Guía (/docs)</span>
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
          )}

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
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Landing State Action Buttons (REQ-01) */}
          {activeView === "landing" && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveView("quarters");
                      setActiveQuartersTab("timeline");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ir a Mi Bitácora →</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white font-medium text-xs rounded-lg hover:bg-slate-800/60 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Iniciar Sesión</span>
                  </button>

                  <button
                    onClick={onOpenQuickLog}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 transition-all active:scale-95 group"
                    title="Abre el playground de captura inmediata sin registro"
                  >
                    <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    <span>Probar Sandbox</span>
                    <kbd className="hidden sm:inline-block font-mono text-[9px] bg-cyan-950/30 text-slate-950 px-1 py-0.2 rounded border border-cyan-800/40">
                      ⌘K
                    </kbd>
                  </button>
                </div>
              )}
            </>
          )}

          {/* App Workspace Actions (Active in Quarters & Public) */}
          {activeView !== "landing" && (
            <>
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

              <button
                onClick={onOpenSettings}
                title="Configuración, Redes de Empleo & Respaldo JSON"
                className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Active User Profile Pill Button or Login Button in App Mode */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center p-1 pl-1.5 pr-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-xl text-xs text-slate-300 transition-all group">
                <div className="relative mr-2">
                  <img
                    src={user.avatar}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                  />
                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAvatarModal();
                      }}
                      title="Cambiar foto de perfil"
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center text-slate-950 shadow-sm"
                    >
                      <Camera className="w-2 h-2 stroke-[3]" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenAuth}
                  title={`Sesión activa: ${user.name} (${user.title}). Clic para ver perfil o credenciales.`}
                  className="text-left hidden sm:block focus:outline-none"
                >
                  <span className="font-semibold text-white block max-w-[100px] truncate text-[11px] leading-tight">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-mono block leading-tight text-cyan-400">
                    {user.authProvider === "google" ? "Google" : "Custom"} ▾
                  </span>
                </button>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar sesión y limpiar sesión activa"
                className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            activeView !== "landing" && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )
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
