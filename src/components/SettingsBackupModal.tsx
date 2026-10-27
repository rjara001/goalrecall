import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Database,
  FileJson,
  Linkedin,
  Github,
  Globe,
  Code2,
  Rocket,
  Layers,
  BookOpen,
  Twitter,
  Plus,
  Minus,
  ExternalLink,
  Briefcase,
  Share2,
  Sparkles,
  Eye,
  Info,
  Palette,
  Camera
} from "lucide-react";
import { 
  exportBackupJson, 
  importBackupJson,
  getStoredUser, 
  saveUser 
} from "../utils/storage";
import { UserProfile, EmploymentSocialLinks } from "../types";

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
  totalLogs,
  currentUser,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  const [activeTab, setActiveTab] = useState<"social" | "backup">("social");
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion state for secondary employment networks
  const [isOtherNetworksOpen, setIsOtherNetworksOpen] = useState(false);

  // Social links form state
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

  // Initialize or re-sync when modal opens or currentUser changes
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
      }
      setSaveSuccess(false);
      setImportStatus(null);
    }
  }, [isOpen, currentUser]);

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
        setImportStatus({
          success: true,
          msg: `¡Respaldo importado con éxito! Se cargaron ${result.count} logros y tus experiencias.`,
        });
        onDataChanged();
      } else {
        setImportStatus({
          success: false,
          msg: result.error || "No se pudo importar el archivo.",
        });
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

    const updatedUser: UserProfile = {
      ...activeUser,
      github: cleanLinks.github,
      linkedin: cleanLinks.linkedin,
      socialLinks: cleanLinks,
      availabilityStatus: availabilityStatus,
    };

    saveUser(updatedUser);
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    onDataChanged();

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const testLink = (url?: string) => {
    if (!url) return;
    const targetUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Count active secondary networks to show badge in accordion header
  const secondaryCount = [
    links.portfolio,
    links.behance,
    links.leetcode,
    links.wellfound,
    links.stackoverflow,
    links.techBlog,
    links.twitter,
  ].filter((v) => !!v?.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Configuración & Redes de Empleo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Presencia profesional para reclutadores y vitrina pública (Public Deck)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
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
              <span>Redes de Empleo & Perfil</span>
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
              <span>Copia de Seguridad (JSON)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {activeTab === "social" ? (
            <form onSubmit={handleSaveSocialLinks} className="space-y-5">
              
              {/* Notification Banner */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-xs">
                    ¡Redes de empleo y disponibilidad actualizadas con éxito!
                  </span>
                </div>
              )}

              {/* Vitrina Disclaimer Banner */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs shadow-inner">
                <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                    <span>Aviso de Publicación en Vitrina (Public Deck)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Todo enlace que <strong>no esté vacío se publicará de manera visible</strong> en tu vitrina ejecutiva para que reclutadores y líderes de ingeniería puedan consultarlo. Si dejas un campo vacío o lo borras, no se mostrará nada.
                  </p>
                </div>
              </div>

              {/* Profile Photo Quick Section */}
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
                        <span>Foto de Perfil</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/50">
                          {currentUser.name.split(" ")[0]}
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Visible en tu bitácora, vitrina pública (Public Deck) y exportaciones
                      </p>
                    </div>
                  </div>

                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={onOpenAvatarModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition-all shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Cambiar Foto</span>
                    </button>
                  )}
                </div>
              )}

              {/* Status / Availability Selector */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  Estado de Búsqueda / Disponibilidad Laboral
                </label>
                <p className="text-[11px] text-slate-400">
                  Este estado se muestra prominentemente en tu vitrina pública (Public Deck) para reclutadores.
                </p>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="🟢 Disponible de inmediato (Full Remote)">
                    🟢 Disponible de inmediato (Full Remote)
                  </option>
                  <option value="🟢 Disponible de inmediato (Híbrido / Presencial)">
                    🟢 Disponible de inmediato (Híbrido / Presencial)
                  </option>
                  <option value="💼 Abierto a ofertas interesantes (Confidencial)">
                    💼 Abierto a ofertas interesantes (Confidencial)
                  </option>
                  <option value="⚡ Freelance / Contratos de Consultoría">
                    ⚡ Freelance / Contratos de Consultoría
                  </option>
                  <option value="🔒 Empleado actualmente (No buscando activamente)">
                    🔒 Empleado actualmente (No buscando activamente)
                  </option>
                </select>
              </div>

              {/* 1. PRIMARY NETWORKS (Always visible - Most Relevant) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Redes Laborales Principales (Más Relevantes)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    No vacío = Visible en Vitrina
                  </span>
                </div>

                {/* LinkedIn */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
                      <div className="w-6 h-6 rounded-md bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-[#0A66C2]">
                        <Linkedin className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span>LinkedIn</span>
                      <span className="text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/15 px-1.5 py-0.5 rounded border border-[#0A66C2]/30">
                        Prioridad Alta
                      </span>
                    </label>

                    {links.linkedin && (
                      <button
                        type="button"
                        onClick={() => testLink(links.linkedin)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Probar enlace en nueva pestaña"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={links.linkedin}
                    onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/tu-perfil-profesional"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* GitHub */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
                      <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                        <Github className="w-3.5 h-3.5" />
                      </div>
                      <span>GitHub</span>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        Código & Proyectos
                      </span>
                    </label>

                    {links.github && (
                      <button
                        type="button"
                        onClick={() => testLink(links.github)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Probar enlace en nueva pestaña"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="https://github.com/tu-usuario"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* 2. ACCORDION: Secondary Employment Networks with [+] */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setIsOtherNetworksOpen(!isOtherNetworksOpen)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                      {isOtherNetworksOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        Otras redes profesionales & portafolios
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Portafolio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X (visibles si se completan)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {secondaryCount > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        {secondaryCount} configuradas
                      </span>
                    )}
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {isOtherNetworksOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOtherNetworksOpen && (
                  <div className="p-4 pt-1 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in slide-in-from-top-1 duration-150">
                    
                    {/* Portfolio / Website */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Portafolio Web Personal</span>
                        </label>
                        {links.portfolio && (
                          <button
                            type="button"
                            onClick={() => testLink(links.portfolio)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.portfolio}
                        onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                        placeholder="https://tuportafolio.dev o https://sitio.com"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Behance / Dribbble / Portfolio Creativo */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Palette className="w-3.5 h-3.5 text-pink-400" />
                          <span>Behance / Dribbble (Portafolio Visual & Diseño)</span>
                        </label>
                        {links.behance && (
                          <button
                            type="button"
                            onClick={() => testLink(links.behance)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.behance}
                        onChange={(e) => setLinks({ ...links, behance: e.target.value })}
                        placeholder="https://behance.net/tu-perfil o https://dribbble.com/tu-usuario"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* LeetCode / HackerRank */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Code2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>LeetCode / HackerRank (Algoritmos & Coding)</span>
                        </label>
                        {links.leetcode && (
                          <button
                            type="button"
                            onClick={() => testLink(links.leetcode)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.leetcode}
                        onChange={(e) => setLinks({ ...links, leetcode: e.target.value })}
                        placeholder="https://leetcode.com/u/tu-usuario"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Wellfound (AngelList) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Rocket className="w-3.5 h-3.5 text-red-400" />
                          <span>Wellfound / AngelList (Startups & Tech Jobs)</span>
                        </label>
                        {links.wellfound && (
                          <button
                            type="button"
                            onClick={() => testLink(links.wellfound)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.wellfound}
                        onChange={(e) => setLinks({ ...links, wellfound: e.target.value })}
                        placeholder="https://wellfound.com/u/tu-usuario"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Stack Overflow */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-orange-400" />
                          <span>Stack Overflow (Reputación Técnica)</span>
                        </label>
                        {links.stackoverflow && (
                          <button
                            type="button"
                            onClick={() => testLink(links.stackoverflow)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.stackoverflow}
                        onChange={(e) => setLinks({ ...links, stackoverflow: e.target.value })}
                        placeholder="https://stackoverflow.com/users/id/tu-nombre"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Tech Blog / Substack / Dev.to */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>Blog Técnico (Substack / Dev.to / Medium)</span>
                        </label>
                        {links.techBlog && (
                          <button
                            type="button"
                            onClick={() => testLink(links.techBlog)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.techBlog}
                        onChange={(e) => setLinks({ ...links, techBlog: e.target.value })}
                        placeholder="https://dev.to/tu-usuario o https://tu.substack.com"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* X / Twitter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                          <span>X / Twitter (Comunidad Técnica & Networking)</span>
                        </label>
                        {links.twitter && (
                          <button
                            type="button"
                            onClick={() => testLink(links.twitter)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> Probar
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.twitter}
                        onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                        placeholder="https://x.com/tu-usuario"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all text-xs shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Redes & Disponibilidad</span>
                </button>
              </div>

            </form>
          ) : (
            <div className="space-y-4">
              {/* Notification Feedback */}
              {importStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    importStatus.success
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/60 border-red-500/40 text-red-300"
                  }`}
                >
                  {importStatus.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{importStatus.msg}</span>
                </div>
              )}

              {/* Export Section */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">Descargar Respaldo Completo</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Guarda un archivo <code className="text-cyan-300 font-mono">.json</code> con tus {totalLogs} logros, redes profesionales, empresas, viñetas y mensajes para tener una copia física siempre segura.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-sm shadow-cyan-500/20"
                >
                  <FileJson className="w-4 h-4" />
                  <span>Exportar Respaldo (.json)</span>
                </button>
              </div>

              {/* Import Section */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">Restaurar Respaldo</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Si cambias de computadora o navegador, selecciona tu archivo <code className="text-purple-300 font-mono">.json</code> para recuperar todo tu historial y perfiles instantáneamente.
                    </p>
                  </div>
                </div>

                <label className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 hover:border-cyan-500 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer text-slate-200 hover:text-white transition-colors font-medium">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Cargar Archivo .json</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Respaldo continuo: tus datos están sincronizados en la nube y puedes exportar copias físicas en cualquier momento.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
