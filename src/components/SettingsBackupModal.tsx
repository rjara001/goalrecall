import React, { useEffect, useState } from "react";
import { Briefcase, Database, Globe, Share2, X } from "lucide-react";
import {
  buildBackupExportJson,
  parseBackupJson,
  ParsedBackupBundle,
} from "../utils/storage/backupStorage";
import { checkUsernameAvailabilityFirestore } from "../utils/firestore/repository";
import { formatFirestoreUiError } from "../utils/firestore/errors";
import {
  CareerGoal,
  EmploymentSocialLinks,
  JobOffer,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../types";
import { useI18n } from "../i18n";
import { SETTINGS_TEXTS } from "./settings/settingsLocales";
import { SettingsSocialTab } from "./settings/SettingsSocialTab";
import { SettingsBackupTab } from "./settings/SettingsBackupTab";
import { SettingsLanguageTab } from "./settings/SettingsLanguageTab";

interface SettingsBackupState {
  user: UserProfile | null;
  logs: LogEntry[];
  experiences: WorkExperience[];
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  certifications: TechnicalCertification[];
  careerGoals: CareerGoal[];
}

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalLogs: number;
  currentUser?: UserProfile | null;
  backupState: SettingsBackupState;
  onImportBackupData?: (bundle: ParsedBackupBundle) => Promise<number>;
  onUpdateProfile?: (updated: UserProfile) => Promise<void> | void;
  onOpenAvatarModal?: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  backupState,
  onImportBackupData,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  const { t, language, currentLanguageInfo } = useI18n();
  const st = SETTINGS_TEXTS[language] || SETTINGS_TEXTS.en;

  const [activeTab, setActiveTab] = useState<"social" | "backup" | "language">("social");
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [socialSaveError, setSocialSaveError] = useState<string | null>(null);
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
      if (currentUser) {
        setLinks({
          linkedin: currentUser.socialLinks?.linkedin || currentUser.linkedin || "",
          github: currentUser.socialLinks?.github || currentUser.github || "",
          portfolio: currentUser.socialLinks?.portfolio || "",
          behance: currentUser.socialLinks?.behance || "",
          leetcode: currentUser.socialLinks?.leetcode || "",
          wellfound: currentUser.socialLinks?.wellfound || "",
          stackoverflow: currentUser.socialLinks?.stackoverflow || "",
          techBlog: currentUser.socialLinks?.techBlog || "",
          twitter: currentUser.socialLinks?.twitter || "",
        });
        if (currentUser.availabilityStatus) {
          setAvailabilityStatus(currentUser.availabilityStatus);
        }
        setUsername(currentUser.username || "");
        setUsernameStatus({ checking: false, available: true });
      }
      setSaveSuccess(false);
      setSocialSaveError(null);
      setImportStatus(null);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen || !username) {
      setUsernameStatus({ checking: false });
      return;
    }

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    if (currentUser?.username && currentUser.username.toLowerCase() === clean) {
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

    let cancelled = false;
    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailabilityFirestore(clean, currentUser?.id);
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: result.available,
            reason: result.reason,
            suggestions: result.suggestions,
          });
        }
      } catch {
        if (!cancelled) {
          setUsernameStatus({ checking: false, available: true });
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = buildBackupExportJson(backupState);
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
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const parsed = parseBackupJson(content);
      if (!parsed.success || !parsed.data) {
        setImportStatus({ success: false, msg: parsed.error || "Import failed." });
        return;
      }

      if (!onImportBackupData) {
        setImportStatus({
          success: false,
          msg: "Debes iniciar sesión con Google para importar respaldos en Firestore.",
        });
        return;
      }

      setIsImporting(true);
      setImportStatus(null);
      try {
        const writtenCount = await onImportBackupData(parsed.data);
        setImportStatus({
          success: true,
          msg: `${parsed.count} logs analizados y ${writtenCount} registros guardados en Firestore.`,
        });
      } catch (err) {
        setImportStatus({
          success: false,
          msg: formatFirestoreUiError(err, "No se pudo importar el respaldo en Firestore."),
        });
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSocial) return;
    if (!currentUser) {
      setSocialSaveError("Debes iniciar sesión con Google para guardar cambios de perfil.");
      return;
    }
    if (usernameStatus.available === false) {
      setSocialSaveError(usernameStatus.reason || "El handle /u/ elegido no está disponible.");
      return;
    }

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
      ...currentUser,
      username: cleanUsername || currentUser.username,
      github: cleanLinks.github,
      linkedin: cleanLinks.linkedin,
      socialLinks: cleanLinks,
      availabilityStatus,
    };

    setIsSavingSocial(true);
    setSocialSaveError(null);
    setSaveSuccess(false);

    try {
      if (onUpdateProfile) {
        await onUpdateProfile(updatedUser);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSocialSaveError(
        formatFirestoreUiError(err, "No se pudieron guardar los ajustes en Firestore.")
      );
    } finally {
      setIsSavingSocial(false);
    }
  };

  const testLink = (url?: string) => {
    if (!url) return;
    const targetUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[60] isolate flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
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
              type="button"
              disabled={isSavingSocial || isImporting}
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
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
              isSaving={isSavingSocial}
              saveError={socialSaveError}
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
              isImporting={isImporting}
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
