import React from "react";
import { 
  Compass, 
  Plus, 
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
  HelpCircle
} from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeView: "quarters" | "public";
  setActiveView: (view: "quarters" | "public") => void;
  activeQuartersTab: "timeline" | "synthesis" | "inbox" | "docs";
  setActiveQuartersTab: (tab: "timeline" | "synthesis" | "inbox" | "docs") => void;
  onOpenQuickLog: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
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
  onOpenAuth,
  onOpenSettings,
  user,
  unreadInboxCount,
  publicLogsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base lg:text-lg text-white">
                CAPTAIN'S LOG
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                BITÁCORA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Brag Document & Career Synthesis
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation & Mode Switcher */}
        <nav className="flex items-center gap-2 lg:gap-4 overflow-x-auto py-1">
          {/* Main Dual-Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setActiveView("quarters")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeView === "quarters"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Captain's Quarters</span>
              <span className="hidden md:inline text-[10px] opacity-75">(Privado)</span>
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
              <span>Public Deck</span>
              <span className="text-[10px] font-mono font-bold bg-slate-800/80 px-1.5 py-0.2 rounded text-emerald-300">
                {publicLogsCount}
              </span>
            </button>
          </div>

          {/* Sub-navigation depending on mode */}
          {activeView === "quarters" ? (
            <div className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-400">
              <button
                onClick={() => setActiveQuartersTab("timeline")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeQuartersTab === "timeline" ? "text-cyan-400 bg-slate-800/50" : "hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setActiveQuartersTab("synthesis")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  activeQuartersTab === "synthesis" ? "text-cyan-400 bg-slate-800/50" : "hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sintetizador CV/STAR</span>
              </button>
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
                <span>Guía / Docs</span>
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400/90 font-mono text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Vitrina Pública Activa
              </span>
              <button
                onClick={() => {
                  setActiveView("quarters");
                  setActiveQuartersTab("docs");
                }}
                className="hover:text-cyan-400 flex items-center gap-1 text-[11px] underline underline-offset-4 ml-2"
              >
                <HelpCircle className="w-3 h-3" />
                ¿Cómo funciona?
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {activeView === "quarters" && (
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
          )}

          <button
            onClick={onOpenSettings}
            title="Ajustes y Respaldo JSON"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <button
              onClick={onOpenAuth}
              title={`Sesión iniciada como ${user.name}`}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <span className="hidden sm:inline font-medium max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {activeView === "quarters" && (
        <div className="flex lg:hidden items-center justify-between gap-1 pt-2.5 mt-2 border-t border-slate-800/60 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveQuartersTab("timeline")}
            className={`px-3 py-1 rounded-md shrink-0 ${
              activeQuartersTab === "timeline" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveQuartersTab("synthesis")}
            className={`px-3 py-1 rounded-md shrink-0 ${
              activeQuartersTab === "synthesis" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            Sintetizador CV
          </button>
          <button
            onClick={() => setActiveQuartersTab("inbox")}
            className={`px-3 py-1 rounded-md shrink-0 flex items-center gap-1 ${
              activeQuartersTab === "inbox" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            Inbox {unreadInboxCount > 0 && `(${unreadInboxCount})`}
          </button>
          <button
            onClick={() => setActiveQuartersTab("docs")}
            className={`px-3 py-1 rounded-md shrink-0 ${
              activeQuartersTab === "docs" ? "text-cyan-400 bg-slate-800/70" : "text-slate-400"
            }`}
          >
            Guía / Docs
          </button>
        </div>
      )}
    </header>
  );
};
