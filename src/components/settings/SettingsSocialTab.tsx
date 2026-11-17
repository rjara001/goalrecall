import React from "react";
import {
  AlertCircle,
  BookOpen,
  Camera,
  Check,
  Code2,
  ExternalLink,
  Eye,
  Github,
  Globe,
  Layers,
  Linkedin,
  Minus,
  Palette,
  Plus,
  Rocket,
  Sparkles,
  Twitter,
} from "lucide-react";
import { EmploymentSocialLinks, UserProfile } from "../../types";
import { SettingsLocaleText } from "./settingsLocales";

interface UsernameStatusState {
  checking: boolean;
  available?: boolean;
  reason?: string;
  suggestions?: string[];
}

interface SettingsSocialTabProps {
  st: SettingsLocaleText;
  currentUser?: UserProfile | null;
  links: EmploymentSocialLinks;
  setLinks: React.Dispatch<React.SetStateAction<EmploymentSocialLinks>>;
  availabilityStatus: string;
  setAvailabilityStatus: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  usernameStatus: UsernameStatusState;
  saveSuccess: boolean;
  isOtherNetworksOpen: boolean;
  setIsOtherNetworksOpen: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenAvatarModal?: () => void;
  onTestLink: (url?: string) => void;
}

export const SettingsSocialTab: React.FC<SettingsSocialTabProps> = ({
  st,
  currentUser,
  links,
  setLinks,
  availabilityStatus,
  setAvailabilityStatus,
  username,
  setUsername,
  usernameStatus,
  saveSuccess,
  isOtherNetworksOpen,
  setIsOtherNetworksOpen,
  onSubmit,
  onOpenAvatarModal,
  onTestLink,
}) => {
  const secondaryCount = [
    links.portfolio,
    links.behance,
    links.leetcode,
    links.wellfound,
    links.stackoverflow,
    links.techBlog,
    links.twitter,
  ].filter((v) => !!v?.trim()).length;

  const secondaryFields: Array<{
    key: keyof EmploymentSocialLinks;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "portfolio",
      label: st.personalPortfolio,
      placeholder: "https://yourportfolio.dev",
      icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      key: "behance",
      label: st.designPortfolio,
      placeholder: "https://behance.net/profile",
      icon: <Palette className="w-3.5 h-3.5 text-pink-400" />,
    },
    {
      key: "leetcode",
      label: st.codingPlatform,
      placeholder: "https://leetcode.com/u/username",
      icon: <Code2 className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      key: "wellfound",
      label: st.startupPlatform,
      placeholder: "https://wellfound.com/u/username",
      icon: <Rocket className="w-3.5 h-3.5 text-red-400" />,
    },
    {
      key: "stackoverflow",
      label: st.techReputation,
      placeholder: "https://stackoverflow.com/users/id/name",
      icon: <Layers className="w-3.5 h-3.5 text-orange-400" />,
    },
    {
      key: "techBlog",
      label: st.techBlog,
      placeholder: "https://dev.to/username",
      icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      key: "twitter",
      label: st.techCommunity,
      placeholder: "https://x.com/username",
      icon: <Twitter className="w-3.5 h-3.5 text-sky-400" />,
    },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-xs">{st.savedSuccess}</span>
        </div>
      )}

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs shadow-inner">
        <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
            <span>{st.showcaseNoticeTitle}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{st.showcaseNoticeDesc}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enlace Personalizado de tu Vitrina Pública</span>
          </label>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
            goalrecall/u/{username || "usuario"}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Define tu identificador único (handle) para compartir un enlace directo con reclutadores
          (ej. <code>rjara001</code>).
        </p>
        <div className="flex items-center mt-1.5">
          <span className="px-3 py-2 bg-slate-950/80 border border-r-0 border-slate-700 rounded-l-lg text-slate-400 font-mono text-xs select-none">
            /u/
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
            }
            placeholder="rjara001"
            className={`w-full px-3 py-2 bg-slate-950 border rounded-r-lg text-xs font-mono focus:outline-none transition-colors ${
              usernameStatus.available === false
                ? "border-red-500/80 text-red-300"
                : usernameStatus.available === true
                ? "border-emerald-500/80 text-emerald-300"
                : "border-slate-700 text-cyan-300 focus:border-cyan-500"
            }`}
          />
        </div>

        {usernameStatus.checking ? (
          <p className="text-[11px] text-slate-400 font-mono animate-pulse">
            Verificando disponibilidad de la URL...
          </p>
        ) : usernameStatus.available === false ? (
          <div className="space-y-1.5">
            <p className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{usernameStatus.reason || "Esta URL no está disponible."}</span>
            </p>
            {usernameStatus.suggestions && usernameStatus.suggestions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-mono">Sugerencias libres:</span>
                {usernameStatus.suggestions.map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setUsername(sug)}
                    className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:text-white hover:bg-cyan-900 text-[10px] font-mono transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : usernameStatus.available === true && username.length >= 3 ? (
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <Check className="w-3.5 h-3.5" />
            <span>URL disponible: goalrecall/u/{username}</span>
          </p>
        ) : null}
      </div>

      {currentUser && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover border border-cyan-500/40 bg-slate-950 shadow"
            />
            <div>
              <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>{st.profilePhoto}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/50">
                  {currentUser.name.split(" ")[0]}
                </span>
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">{st.photoDesc}</p>
            </div>
          </div>

          {onOpenAvatarModal && (
            <button
              type="button"
              onClick={onOpenAvatarModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition-all shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{st.changePhoto}</span>
            </button>
          )}
        </div>
      )}

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
        <label className="block text-xs font-bold text-slate-200">{st.statusLabel}</label>
        <p className="text-[11px] text-slate-400">{st.statusDesc}</p>
        <select
          value={availabilityStatus}
          onChange={(e) => setAvailabilityStatus(e.target.value)}
          className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="🟢 Disponible de inmediato (Full Remote)">{st.optFullRemote}</option>
          <option value="🟢 Disponible de inmediato (Híbrido / Presencial)">{st.optHybrid}</option>
          <option value="💼 Abierto a ofertas interesantes (Confidencial)">{st.optOpen}</option>
          <option value="⚡ Freelance / Contratos de Consultoría">{st.optFreelance}</option>
          <option value="🔒 Empleado actualmente (No buscando activamente)">{st.optEmployed}</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{st.primaryNetworks}</span>
          </h4>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            {st.notEmptyNotice}
          </span>
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
              <div className="w-6 h-6 rounded-md bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-[#0A66C2]">
                <Linkedin className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>LinkedIn</span>
              <span className="text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/15 px-1.5 py-0.5 rounded border border-[#0A66C2]/30">
                {st.highPriority}
              </span>
            </label>

            {links.linkedin && (
              <button
                type="button"
                onClick={() => onTestLink(links.linkedin)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{st.openLink}</span>
              </button>
            )}
          </div>

          <input
            type="url"
            value={links.linkedin}
            onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <Github className="w-3.5 h-3.5" />
              </div>
              <span>GitHub</span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                {st.codeProjects}
              </span>
            </label>

            {links.github && (
              <button
                type="button"
                onClick={() => onTestLink(links.github)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{st.openLink}</span>
              </button>
            )}
          </div>

          <input
            type="url"
            value={links.github}
            onChange={(e) => setLinks({ ...links, github: e.target.value })}
            placeholder="https://github.com/username"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
        <button
          type="button"
          onClick={() => setIsOtherNetworksOpen(!isOtherNetworksOpen)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 text-left transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
              {isOtherNetworksOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                {st.otherNetworks}
              </span>
              <span className="text-[11px] text-slate-400 block">{st.otherNetworksDesc}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {secondaryCount > 0 && (
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                {secondaryCount} {st.configured}
              </span>
            )}
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {isOtherNetworksOpen ? "−" : "+"}
            </span>
          </div>
        </button>

        {isOtherNetworksOpen && (
          <div className="p-4 pt-1 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in slide-in-from-top-1 duration-150">
            {secondaryFields.map(({ key, label, placeholder, icon }) => {
              const value = links[key] || "";
              return (
                <div key={String(key)} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                      {icon}
                      <span>{label}</span>
                    </label>
                    {value && (
                      <button
                        type="button"
                        onClick={() => onTestLink(value)}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={usernameStatus.available === false}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-all text-xs shadow-md shadow-cyan-500/20"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{st.saveBtn}</span>
        </button>
      </div>
    </form>
  );
};
