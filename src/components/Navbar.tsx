import React, { useState, useRef, useEffect } from "react";
import { 
  Compass, 
  Plus, 
  FileUp,
  BookOpen, 
  Sparkles, 
  Inbox, 
  Eye, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Settings as SettingsIcon,
  LogIn,
  Camera,
  Layers,
  Home,
  Briefcase,
  ChevronDown,
  UserCheck
} from "lucide-react";
import { UserProfile } from "../types";
import { useI18n, LanguageSelector } from "../i18n";

import { Share2 } from "lucide-react";

interface NavbarProps {
  activeView: "landing" | "quarters" | "public" | "features" | "docs" | "offers";
  setActiveView: (view: "landing" | "quarters" | "public" | "features" | "docs" | "offers") => void;
  activeQuartersTab: "timeline" | "synthesis" | "inbox" | "docs" | "offers";
  setActiveQuartersTab: (tab: "timeline" | "synthesis" | "inbox" | "docs" | "offers") => void;
  onOpenQuickLog: () => void;
  onOpenCvUpload: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenShareModal?: () => void;
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
  onOpenShareModal,
  onOpenAvatarModal,
  onLogout,
  user,
  unreadInboxCount,
  publicLogsCount,
}) => {
  const { t } = useI18n();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark Brand */}
        <button
          onClick={() => {
            if (user) {
              setActiveView("quarters");
              setActiveQuartersTab("timeline");
              if (typeof window !== "undefined" && window.location.pathname !== "/quarters") {
                window.history.pushState(null, "", "/quarters");
              }
            } else {
              setActiveView("landing");
              if (typeof window !== "undefined" && window.location.pathname !== "/") {
                window.history.pushState(null, "", "/");
              }
            }
          }}
          className="flex items-center gap-2.5 shrink-0 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10 group-hover:border-cyan-400 transition-colors">
            <Compass className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm lg:text-base text-white group-hover:text-cyan-300 transition-colors">
                GOAL RECALL
              </span>
              <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/70 border border-cyan-800/50 px-1 py-0.2 rounded font-semibold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-none mt-0.5">
              {t.common.tagline}
            </p>
          </div>
        </button>

        {/* Zone 2: Navigation & Mode Switcher */}
        <nav className="flex items-center gap-2 overflow-x-auto py-1">
          {!user ? (
            /* Contextual Navigation for Anonymous / Public Visitors */
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveView("features")}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                  activeView === "features"
                    ? "text-cyan-300 bg-cyan-950/50 border border-cyan-800/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.nav.features}</span>
              </button>

              <button
                onClick={() => setActiveView("docs")}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                  activeView === "docs"
                    ? "text-cyan-300 bg-cyan-950/50 border border-cyan-800/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
                title="Documentación y Guía del Usuario (/docs)"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.nav.docs}</span>
              </button>
            </div>
          ) : (
            /* Contextual Navigation for Authenticated Users (Clean Workspace Tabs) */
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg shrink-0">
              <button
                onClick={() => {
                  setActiveView("quarters");
                  setActiveQuartersTab("timeline");
                  if (typeof window !== "undefined" && window.location.pathname !== "/quarters") {
                    window.history.pushState(null, "", "/quarters");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "quarters" && activeQuartersTab === "timeline"
                    ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.nav.logbook}</span>
                <span className="hidden md:inline text-[10px] opacity-75 font-mono">({t.nav.privateBadge})</span>
              </button>

              {/* Opción de Ofertas comentada temporalmente para desahogar la barra de navegación */}
              {/* <button
                onClick={() => {
                  setActiveView("offers");
                  if (typeof window !== "undefined" && window.location.pathname !== "/offers") {
                    window.history.pushState(null, "", "/offers");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "offers"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.nav.offers}</span>
              </button> */}

              <button
                onClick={() => {
                  setActiveView("public");
                  if (typeof window !== "undefined" && window.location.pathname !== "/public") {
                    window.history.pushState(null, "", "/public");
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeView === "public"
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t.nav.publicShowcase}</span>
                <span className="sm:hidden">{t.nav.publicView}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-800/80 px-1.5 py-0.2 rounded text-emerald-300">
                  {publicLogsCount}
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {!user ? (
            /* Unauthenticated Visitor Actions: Clean, non-overloaded */
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                <span>{t.nav.signIn}</span>
              </button>
            </div>
          ) : (
            /* Authenticated User Actions: Clean 1 Primary CTA + Profile Menu */
            <div className="flex items-center gap-2.5">
              {/* Primary Action Button: + Nuevo Logro */}
              <button
                onClick={onOpenQuickLog}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-cyan-500/25 transition-all active:scale-95"
                title={`${t.nav.newLog} (⌘K / Ctrl+K)`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">{t.nav.newLog}</span>
                <span className="sm:hidden">{t.nav.newLog}</span>
                <kbd className="hidden md:inline-block font-mono text-[9px] bg-cyan-950/30 text-slate-950 px-1 py-0.2 rounded border border-cyan-800/30 font-semibold">
                  ⌘K
                </kbd>
              </button>

              {/* User Profile Button with Clean Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-900 border rounded-xl text-xs text-slate-300 transition-all ${
                    isProfileMenuOpen 
                      ? "border-cyan-400 shadow-sm shadow-cyan-500/20" 
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                  aria-expanded={isProfileMenuOpen}
                  aria-label="User profile and settings"
                >
                  <img
                    src={user.avatar}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-lg object-cover border border-slate-700"
                  />
                  <span className="font-semibold text-white max-w-[90px] truncate text-xs hidden sm:inline-block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0B101D] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Header */}
                    <div className="px-4 py-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email || user.title || t.nav.guest}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-cyan-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-cyan-400" />
                          {t.nav.privateVaultActive}
                        </span>
                        <span className="bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          {user.authProvider === "google" ? "Google" : "Local"}
                        </span>
                      </div>
                    </div>

                    {/* Actions Group */}
                    <div className="py-1 text-xs">
                      {/* Compartir Vitrina inside Dropdown */}
                      {onOpenShareModal && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenShareModal();
                          }}
                          className="w-full text-left px-4 py-2 text-emerald-300 hover:text-emerald-200 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-medium block">Compartir Vitrina Pública</span>
                            <span className="text-[10px] text-slate-400 block">goalrecall/u/{user.username || "usuario"}</span>
                          </div>
                        </button>
                      )}

                      {/* Upload CV */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenCvUpload();
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                      >
                        <FileUp className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="font-medium block">{t.nav.importCv}</span>
                          <span className="text-[10px] text-slate-400 block">{t.nav.importCvDesc}</span>
                        </div>
                      </button>

                      {/* Settings & Backups */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="font-medium block">{t.nav.settings}</span>
                          <span className="text-[10px] text-slate-400 block">{t.nav.settingsDesc}</span>
                        </div>
                      </button>

                      {/* Avatar edit if enabled */}
                      {onOpenAvatarModal && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAvatarModal();
                          }}
                          className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                        >
                          <Camera className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium">{t.nav.changeAvatar}</span>
                        </button>
                      )}

                      {/* Documentation */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveView("docs");
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">{t.nav.userGuide}</span>
                      </button>

                      {/* Features view */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveView("features");
                          if (typeof window !== "undefined" && window.location.pathname !== "/features") {
                            window.history.pushState(null, "", "/features");
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">{t.nav.featuresGuide}</span>
                      </button>

                      {/* View Public Landing */}
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveView("landing");
                          if (typeof window !== "undefined" && window.location.pathname !== "/") {
                            window.history.pushState(null, "", "/");
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                      >
                        <Home className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-medium block">{t.nav.viewPublicLanding}</span>
                          <span className="text-[10px] text-slate-400 block">Explorar landing comercial</span>
                        </div>
                      </button>
                    </div>

                    {/* Language Selector Inside Dropdown */}
                    <div className="px-4 py-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{t.common.language}:</span>
                      <LanguageSelector />
                    </div>

                    {/* Logout */}
                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2.5 text-xs font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.signOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
