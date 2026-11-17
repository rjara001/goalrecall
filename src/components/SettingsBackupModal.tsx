import React, { useEffect, useState } from "react";
import { Briefcase, Database, Globe, Share2, X } from "lucide-react";
import { exportBackupJson, getStoredUser, importBackupJson, saveUser } from "../utils/storage";
import { EmploymentSocialLinks, UserProfile } from "../types";
import { useI18n } from "../i18n";
import { SETTINGS_TEXTS } from "./settings/settingsLocales";
import { SettingsSocialTab } from "./settings/SettingsSocialTab";
import { SettingsBackupTab } from "./settings/SettingsBackupTab";
import { SettingsLanguageTab } from "./settings/SettingsLanguageTab";

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  totalLogs: number;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
  onOpenAvatarModal?: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  currentUser,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  const { t, language, currentLanguageInfo } = useI18n();
  const st = SETTINGS_TEXTS[language] || SETTINGS_TEXTS.en;

  const [activeTab, setActiveTab] = useState<"social" | "backup" | "language">("social");
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOtherNetworksOpen, setIsOtherNetworksOpen] = useState(false);

  const [links, setLinks] = useState<EmploymentSocialLinks>({
    linkedin: "",
    github: "",
    portfolio: "",
    behance: "",
    leetcode: "",
    wellfound: "",
    stackoverflow: "",
    techBlog: "",
    twitter: "",
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    "🟢 Disponible de inmediato (Full Remote)"
  );
  const [username, setUsername] = useState<string>("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
    suggestions?: string[];
  }>({ checking: false });

  useEffect(() => {
    if (isOpen) {
      const activeUser = currentUser || getStoredUser();
      if (activeUser) {
        setLinks({
          linkedin: activeUser.socialLinks?.linkedin || activeUser.linkedin || "",
          github: activeUser.socialLinks?.github || activeUser.github || "",
          portfolio: activeUser.socialLinks?.portfolio || "",
          behance: activeUser.socialLinks?.behance || "",
          leetcode: activeUser.socialLinks?.leetcode || "",
          wellfound: activeUser.socialLinks?.wellfound || "",
          stackoverflow: activeUser.socialLinks?.stackoverflow || "",
          techBlog: activeUser.socialLinks?.techBlog || "",
          twitter: activeUser.socialLinks?.twitter || "",
        });
        if (activeUser.availabilityStatus) {
          setAvailabilityStatus(activeUser.availabilityStatus);
        }
        setUsername(activeUser.username || "");
        setUsernameStatus({ checking: false, available: true });
      }
      setSaveSuccess(false);
      setImportStatus(null);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen || !username) {
      setUsernameStatus({ checking: false });
      return;
    }

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const activeUser = currentUser || getStoredUser();

    if (activeUser?.username && activeUser.username.toLowerCase() === clean) {
      setUsernameStatus({ checking: false, available: true });
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        reason: "Mínimo 3 caracteres alfanuméricos.",
      });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const userKey = activeUser?.email || activeUser?.id || "";
        const res = await fetch(
          `/api/public/check-username/${encodeURIComponent(clean)}?userKey=${encodeURIComponent(userKey)}`
        );
        if (res.ok) {
          const data = await res.json();
          setUsernameStatus({
            checking: false,
            available: data.available,
            reason: data.reason,
            suggestions: data.suggestions,
          });
        } else {
          setUsernameStatus({ checking: false, available: true });
        }
      } catch {
        setUsernameStatus({ checking: false, available: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goal-recall-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackupJson(content);
      if (result.success) {
        setImportStatus({ success: true, msg: `${result.count} logs restored.` });
        onDataChanged();
      } else {
        setImportStatus({ success: false, msg: result.error || "Import failed." });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    const activeUser = currentUser || getStoredUser();
    if (!activeUser) return;

    const cleanLinks: EmploymentSocialLinks = {
      linkedin: links.linkedin?.trim() || "",
      github: links.github?.trim() || "",
      portfolio: links.portfolio?.trim() || "",
      behance: links.behance?.trim() || "",
      leetcode: links.leetcode?.trim() || "",
      wellfound: links.wellfound?.trim() || "",
      stackoverflow: links.stackoverflow?.trim() || "",
      techBlog: links.techBlog?.trim() || "",
      twitter: links.twitter?.trim() || "",
    };

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");

    const updatedUser: UserProfile = {
      ...activeUser,
      username: cleanUsername || activeUser.username,
      github: cleanLinks.github,
      linkedin: cleanLinks.linkedin,
      socialLinks: cleanLinks,
      availabilityStatus,
    };

    saveUser(updatedUser);
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    onDataChanged();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const testLink = (url?: string) => {
    if (!url) return;
    const targetUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {st.headerTitle}
                </h3>
                <p className="text-[11px] text-slate-400">{st.headerSubtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "social"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{st.tabSocial}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "backup"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{st.tabBackup}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("language")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "language"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                {t.common.language} ({currentLanguageInfo.flag}{" "}
                {currentLanguageInfo.code.toUpperCase()})
              </span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {activeTab === "social" ? (
            <SettingsSocialTab
              st={st}
              currentUser={currentUser}
              links={links}
              setLinks={setLinks}
              availabilityStatus={availabilityStatus}
              setAvailabilityStatus={setAvailabilityStatus}
              username={username}
              setUsername={setUsername}
              usernameStatus={usernameStatus}
              saveSuccess={saveSuccess}
              isOtherNetworksOpen={isOtherNetworksOpen}
              setIsOtherNetworksOpen={setIsOtherNetworksOpen}
              onSubmit={handleSaveSocialLinks}
              onOpenAvatarModal={onOpenAvatarModal}
              onTestLink={testLink}
            />
          ) : activeTab === "backup" ? (
            <SettingsBackupTab
              st={st}
              importStatus={importStatus}
              onExport={handleExport}
              onFileUpload={handleFileUpload}
            />
          ) : (
            <SettingsLanguageTab st={st} />
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">{st.footerNotice}</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {st.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
