import React, { useState, useMemo } from "react";
import { 
  Building, 
  Calendar, 
  Tag, 
  Zap, 
  Eye, 
  Mail, 
  Send, 
  Github, 
  Linkedin, 
  MapPin, 
  CheckCircle2, 
  Bot, 
  Filter, 
  MessageSquare,
  ShieldCheck,
  Compass,
  Target,
  HelpCircle,
  Layers,
  FileText,
  Globe,
  Code2,
  Rocket,
  BookOpen,
  Twitter,
  Plus,
  Minus,
  Palette,
  Share2
} from "lucide-react";
import { LogCategory, LogEntry, UserProfile, VisitorMessage, Product, WorkExperience } from "../types";
import { FirstMateChat } from "./FirstMateChat";
import { ProductCard } from "./ProductCard";
import { ShareDeckModal } from "./ShareDeckModal";
import { useI18n } from "../i18n";

interface PublicDeckProps {
  logs: LogEntry[];
  experiences?: WorkExperience[];
  products?: Product[];
  userProfile: UserProfile;
  onSendVisitorMessage: (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => void;
  onBackToLanding?: () => void;
  onOpenAuth?: () => void;
  isVisitorPreview?: boolean;
  isOwner?: boolean;
  onOpenNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onToggleProductPublic?: (id: string) => void;
}

export const PublicDeck: React.FC<PublicDeckProps> = ({
  logs,
  experiences = [],
  products = [],
  userProfile,
  onSendVisitorMessage,
  onBackToLanding,
  onOpenAuth,
  isVisitorPreview,
  isOwner = false,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductPublic,
}) => {
  const { t } = useI18n();

  // Owner preview mode toggle: "public_only" (default, strict visitor view) vs "all_owner_audit"
  const [ownerViewMode, setOwnerViewMode] = useState<"public_only" | "all_owner_audit">("public_only");

  // CRITICAL PRIVACY ISOLATION: Strict filter for public entries ONLY (Bóveda Privada is NEVER exposed by default)
  const publicLogs = useMemo(() => {
    if (isOwner && ownerViewMode === "all_owner_audit") {
      return logs;
    }
    return logs.filter((l) => l.isPublic);
  }, [logs, isOwner, ownerViewMode]);

  const publicProducts = useMemo(() => {
    if (isOwner && ownerViewMode === "all_owner_audit") {
      return products;
    }
    return products.filter((p) => p.isPublic !== false);
  }, [products, isOwner, ownerViewMode]);

  const publicExperiences = useMemo(() => {
    if (isOwner && ownerViewMode === "all_owner_audit") {
      return experiences;
    }
    const publicExpIds = new Set(publicLogs.map((l) => l.experienceId).filter(Boolean));
    return experiences.filter((e) => e.isPublic !== false || publicExpIds.has(e.id));
  }, [experiences, publicLogs, isOwner, ownerViewMode]);

  const [activeTab, setActiveTab] = useState<"achievements" | "experiences" | "products">("achievements");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [showOtherNetworks, setShowOtherNetworks] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Compute secondary employment networks
  const secondaryNetworks = useMemo(() => {
    const list: { name: string; url: string; icon: React.ReactNode }[] = [];
    const s = userProfile.socialLinks;
    if (s?.portfolio?.trim()) {
      list.push({ name: "Portafolio", url: s.portfolio.trim(), icon: <Globe className="w-3.5 h-3.5 text-emerald-400" /> });
    }
    if (s?.behance?.trim()) {
      list.push({ name: "Behance / Portafolio", url: s.behance.trim(), icon: <Palette className="w-3.5 h-3.5 text-pink-400" /> });
    }
    if (s?.leetcode?.trim()) {
      list.push({ name: "LeetCode", url: s.leetcode.trim(), icon: <Code2 className="w-3.5 h-3.5 text-amber-400" /> });
    }
    if (s?.wellfound?.trim()) {
      list.push({ name: "Wellfound", url: s.wellfound.trim(), icon: <Rocket className="w-3.5 h-3.5 text-red-400" /> });
    }
    if (s?.stackoverflow?.trim()) {
      list.push({ name: "Stack Overflow", url: s.stackoverflow.trim(), icon: <Layers className="w-3.5 h-3.5 text-orange-400" /> });
    }
    if (s?.techBlog?.trim()) {
      list.push({ name: "Blog Técnico", url: s.techBlog.trim(), icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" /> });
    }
    if (s?.twitter?.trim()) {
      list.push({ name: "X (Twitter)", url: s.twitter.trim(), icon: <Twitter className="w-3.5 h-3.5 text-sky-400" /> });
    }
    return list;
  }, [userProfile.socialLinks]);

  const primaryLinkedin = userProfile.socialLinks?.linkedin || userProfile.linkedin;
  const primaryGithub = userProfile.socialLinks?.github || userProfile.github;

  const toggleField = (key: string) => {
    setExpandedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Form State for "Leave a Note for the Captain"
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorOrg, setVisitorOrg] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  // Unique categories and tags across public logs only
  const categories = useMemo(() => Array.from(new Set(publicLogs.map((l) => l.category))), [publicLogs]);
  const tags = useMemo(() => Array.from(new Set(publicLogs.flatMap((l) => l.tags))), [publicLogs]);

  // Unique tech stacks across public products
  const allTechList = useMemo(() => {
    const set = new Set<string>();
    publicProducts.forEach((p) => {
      p.techStack?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [publicProducts]);

  // Filtered public logs
  const filteredPublicLogs = useMemo(() => {
    return publicLogs.filter((log) => {
      if (selectedCategory !== "all" && log.category !== selectedCategory) return false;
      if (selectedTag !== "all" && !log.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [publicLogs, selectedCategory, selectedTag]);

  // Filtered public products
  const filteredPublicProducts = useMemo(() => {
    return publicProducts.filter((prod) => {
      if (selectedTech !== "all" && !prod.techStack?.includes(selectedTech)) return false;
      return true;
    });
  }, [publicProducts, selectedTech]);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || !visitorMessage.trim()) return;

    onSendVisitorMessage({
      name: visitorName.trim(),
      email: visitorEmail.trim(),
      organization: visitorOrg.trim() || undefined,
      message: visitorMessage.trim(),
    });

    setNoteSent(true);
    setVisitorName("");
    setVisitorEmail("");
    setVisitorOrg("");
    setVisitorMessage("");

    setTimeout(() => {
      setNoteSent(false);
    }, 5000);
  };

  const handleSelectFromChat = (log: LogEntry) => {
    setActiveTab("achievements");
    setHighlightedLogId(log.id);
    setTimeout(() => {
      const element = document.getElementById(`public-log-${log.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleSelectProductFromChat = (prod: Product) => {
    setActiveTab("products");
    setHighlightedProductId(prod.id);
    setTimeout(() => {
      const element = document.getElementById(`public-product-${prod.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      
      {/* Visitor Preview Guidance Banner */}
      {isVisitorPreview && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <span>{t.publicDeck.badge}</span>
              </p>
              <p className="text-xs text-slate-300">
                {t.publicDeck.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
              >
                {t.common.back}
              </button>
            )}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-xl shadow-sm transition-all"
              >
                {t.nav.signIn}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Owner Guidance Banner with View Mode Switch */}
      {isOwner && !isVisitorPreview && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <span>Vitrina Pública (Vista de Propietario)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  {logs.filter((l) => l.isPublic).length} público(s) de {logs.length} en bitácora
                </span>
              </p>
              <p className="text-xs text-slate-300">
                {ownerViewMode === "public_only"
                  ? "Estás viendo tu vitrina exactamente como la ven reclutadores y visitantes (solo logros con estado público)."
                  : "Modo Auditoría de Dueño: Mostrando todos tus logros con su etiqueta de visibilidad (Público vs Bóveda Privada)."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
              title="Generar enlace seguro de tu vitrina para enviar a reclutadores"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir con Recruiter</span>
            </button>

            <div className="flex items-center p-1 bg-[#080C14] border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setOwnerViewMode("public_only")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  ownerViewMode === "public_only"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Solo Públicos ({logs.filter((l) => l.isPublic).length})
              </button>
              <button
                type="button"
                onClick={() => setOwnerViewMode("all_owner_audit")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  ownerViewMode === "all_owner_audit"
                    ? "bg-slate-800 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Auditar Todos ({logs.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header: Executive Profile */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B111E] to-[#080C14] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/40"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {userProfile.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.publicDeck.verifiedBadge}
                </span>
                {userProfile.availabilityStatus && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    {userProfile.availabilityStatus}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-cyan-300">
                {userProfile.title}
              </p>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{userProfile.location}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-emerald-400">{publicLogs.length} logros</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-cyan-400">{publicProducts.length} productos</span>
              </p>
            </div>
          </div>

          {/* Social Links & Quick Contact */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary LinkedIn */}
              {primaryLinkedin && (
                <a
                  href={primaryLinkedin.startsWith("http") ? primaryLinkedin : `https://${primaryLinkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/50 text-cyan-200 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-[#0A66C2]/10"
                  title="Perfil Profesional en LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2] fill-current" />
                  <span>LinkedIn</span>
                </a>
              )}

              {/* Primary GitHub */}
              {primaryGithub && (
                <a
                  href={primaryGithub.startsWith("http") ? primaryGithub : `https://${primaryGithub}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all"
                  title="Código & Repositorios en GitHub"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}

              {/* Secondary networks toggle */}
              {secondaryNetworks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowOtherNetworks(!showOtherNetworks)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
                  title="Ver otras redes de empleo y presencia técnica"
                >
                  <span className="font-mono text-cyan-400 font-bold text-xs">
                    {showOtherNetworks ? "−" : "+"}
                  </span>
                  <span>Otras Redes</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-400">
                    {secondaryNetworks.length}
                  </span>
                </button>
              )}

              {/* Share with recruiter button */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                title="Generar enlace seguro de tu vitrina para enviar a reclutadores"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir Vitrina</span>
              </button>

              <a
                href="#leave-note"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Dejar un Recado</span>
              </a>
            </div>

            {/* Secondary networks expandable bar */}
            {showOtherNetworks && secondaryNetworks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/95 border border-slate-800 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
                {secondaryNetworks.map((net) => (
                  <a
                    key={net.name}
                    href={net.url.startsWith("http") ? net.url : `https://${net.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-[11px] font-medium transition-colors"
                  >
                    {net.icon}
                    <span>{net.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio Text */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {userProfile.bio}
          </p>
        </div>

        {/* Skills Matrix */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {userProfile.skills.map((skill) => (
            <span
              key={skill.name}
              className="text-xs px-2.5 py-1 bg-slate-900/90 border border-slate-800 text-slate-300 rounded-lg font-mono"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Public Showcase Tabs + First Mate Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Showcase Container (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Navigation Tabs (As requested in user ASCII diagram) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 p-1 bg-[#080C14] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("achievements")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "achievements"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-amber-400">★</span>
                <span>Logros STAR</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700/60">
                  {publicLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "experiences"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-blue-400">🏢</span>
                <span>Experiencia Laboral</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-700/60">
                  {publicExperiences.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "products"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="text-emerald-400">🚀</span>
                <span>Productos & Showcase</span>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700/60">
                  {publicProducts.length}
                </span>
              </button>
            </div>

            {/* Right side filter based on active tab */}
            {activeTab === "achievements" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">{t.publicDeck.filterAll}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {activeTab === "experiences" && (
              <div className="text-[11px] font-mono text-slate-400">
                {publicExperiences.length} trayectoria{publicExperiences.length === 1 ? "" : "s"} verificada{publicExperiences.length === 1 ? "" : "s"}
              </div>
            )}

            {activeTab === "products" && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas las tecnologías ({allTechList.length})</option>
                  {allTechList.map((tech) => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>

                {isOwner && onOpenNewProduct && (
                  <button
                    type="button"
                    onClick={onOpenNewProduct}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Producto</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tab 1: Public Achievements */}
          {activeTab === "achievements" && (
            <>
              {filteredPublicLogs.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    {t.publicDeck.emptyPublicLogsTitle}
                  </p>
                  {isOwner && (
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Tus logros están en la Bóveda Privada por seguridad. Para exhibirlos aquí, ve a tu Cronología y activa el ícono de ojo verde en los logros que desees mostrar a reclutadores.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPublicLogs.map((log) => {
                    const isHighlighted = highlightedLogId === log.id;
                    return (
                      <div
                        id={`public-log-${log.id}`}
                        key={log.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isHighlighted
                            ? "bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/30"
                            : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800"
                        }`}
                      >
                        {/* Top Row: Unboxed Metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                          <div className="flex items-center gap-2 text-slate-400 font-medium">
                            <span className="text-white font-semibold">{log.client}</span>
                            <span>·</span>
                            <span className="text-slate-300">{log.project}</span>
                            <span>·</span>
                            <span className="font-mono text-slate-400">{log.date}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isOwner && ownerViewMode === "all_owner_audit" && (
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                log.isPublic
                                  ? "text-emerald-300 border-emerald-800/60 bg-emerald-950/60 font-semibold"
                                  : "text-amber-300 border-amber-800/60 bg-amber-950/60 font-semibold"
                              }`}>
                                {log.isPublic ? "Público" : "Bóveda Privada"}
                              </span>
                            )}
                            <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                              {log.category}
                            </span>
                          </div>
                        </div>

                        {/* Headline - Logro (Multilínea) */}
                        <div className="mb-2.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase block mb-1">
                            Logro Verificado (Viñeta CV)
                          </span>
                          <h3 className="text-base font-semibold text-white leading-relaxed whitespace-pre-wrap">
                            {log.title}
                          </h3>
                        </div>

                        {/* Impact Metric Box */}
                        <div className="p-3 bg-slate-950 border border-emerald-950 rounded-xl mb-3 flex items-start gap-2.5">
                          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                              Impacto Medible
                            </span>
                            <p className="text-xs sm:text-sm text-emerald-200 font-mono font-medium whitespace-pre-wrap">
                              {log.impact}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown Accordions for Recruiters & Visitors */}
                        {(log.whatWasSought || log.whyImportant || log.howApplied || log.description) && (
                          <div className="space-y-1.5 mb-3">
                            {log.whatWasSought && (
                              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                                <button
                                  type="button"
                                  onClick={() => toggleField(`${log.id}-what`)}
                                  className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-indigo-300 hover:bg-slate-900 transition-colors text-left"
                                >
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>{expandedFields[`${log.id}-what`] ? "−" : "+"} ¿Qué se buscaba lograr?</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {expandedFields[`${log.id}-what`] ? "Cerrar" : "Ver"}
                                  </span>
                                </button>
                                {expandedFields[`${log.id}-what`] && (
                                  <p className="px-3 pb-2 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                                    {log.whatWasSought}
                                  </p>
                                )}
                              </div>
                            )}

                            {log.whyImportant && (
                              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                                <button
                                  type="button"
                                  onClick={() => toggleField(`${log.id}-why`)}
                                  className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-amber-300 hover:bg-slate-900 transition-colors text-left"
                                >
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{expandedFields[`${log.id}-why`] ? "−" : "+"} ¿Por qué era importante?</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {expandedFields[`${log.id}-why`] ? "Cerrar" : "Ver"}
                                  </span>
                                </button>
                                {expandedFields[`${log.id}-why`] && (
                                  <p className="px-3 pb-2 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                                    {log.whyImportant}
                                  </p>
                                )}
                              </div>
                            )}

                            {log.howApplied && (
                              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                                <button
                                  type="button"
                                  onClick={() => toggleField(`${log.id}-how`)}
                                  className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-cyan-300 hover:bg-slate-900 transition-colors text-left"
                                >
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>{expandedFields[`${log.id}-how`] ? "−" : "+"} ¿Cómo se aplicó la solución?</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {expandedFields[`${log.id}-how`] ? "Cerrar" : "Ver"}
                                  </span>
                                </button>
                                {expandedFields[`${log.id}-how`] && (
                                  <p className="px-3 pb-2 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                                    {log.howApplied}
                                  </p>
                                )}
                              </div>
                            )}

                            {log.description && (
                              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                                <button
                                  type="button"
                                  onClick={() => toggleField(`${log.id}-desc`)}
                                  className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-purple-300 hover:bg-slate-900 transition-colors text-left"
                                >
                                  <span className="flex items-center gap-1.5 font-medium">
                                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{expandedFields[`${log.id}-desc`] ? "−" : "+"} Detalle o Descripción profunda</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {expandedFields[`${log.id}-desc`] ? "Cerrar" : "Ver"}
                                  </span>
                                </button>
                                {expandedFields[`${log.id}-desc`] && (
                                  <p className="px-3 pb-2 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                                    {log.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {log.tags && log.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {log.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Tab 2: Public Work Experiences (Timeline de Trayectoria) */}
          {activeTab === "experiences" && (
            <div className="space-y-6">
              {publicExperiences.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-2">
                  <Building className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    No hay experiencias laborales públicas disponibles
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Las posiciones y empresas marcadas como públicas o asociadas a logros públicos se exhiben en este timeline con sus viñetas y métricas.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {publicExperiences.map((exp) => {
                    const linkedLogs = publicLogs.filter((l) => l.experienceId === exp.id);
                    return (
                      <div
                        key={exp.id}
                        className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all space-y-4"
                      >
                        {/* Company & Role Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white tracking-tight">
                                {exp.company}
                              </h3>
                              {exp.isCurrent && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                                  Actual
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-cyan-300">
                              {exp.role || "Especialista / Ingeniero"}
                            </p>
                          </div>

                          <div className="text-right sm:text-right">
                            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                              📅 {exp.startDate || "—"} {exp.endDate ? `– ${exp.endDate}` : exp.isCurrent ? "– Actualidad" : ""}
                            </span>
                            {exp.location && (
                              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 sm:justify-end">
                                <MapPin className="w-3 h-3" />
                                <span>{exp.location}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Summary / Context */}
                        {exp.summary && (
                          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                            "{exp.summary}"
                          </p>
                        )}

                        {/* Technologies badges */}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {exp.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-mono px-2 py-0.5 bg-slate-800/80 text-cyan-300 border border-slate-700/50 rounded-md"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Public Achievements under this experience */}
                        {linkedLogs.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                              Logros Verificados en {exp.company} ({linkedLogs.length})
                            </span>
                            <div className="space-y-2">
                              {linkedLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="p-3 bg-slate-950/80 border border-emerald-950 rounded-xl space-y-1.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-semibold text-white leading-snug">
                                      {log.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                      {log.category}
                                    </span>
                                  </div>
                                  {log.impact && (
                                    <p className="text-xs text-emerald-300 font-mono">
                                      ⚡ {log.impact}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Original Bullets from CV if present */}
                        {exp.bullets && exp.bullets.length > 0 && linkedLogs.length === 0 && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                              Responsabilidades & Entregables
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                              {exp.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="leading-relaxed">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Products & Showcase */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {filteredPublicProducts.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 space-y-3">
                  <Rocket className="w-9 h-9 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    No hay productos visibles en el showcase
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Los productos, librerías, SaaS o herramientas registradas como públicas se exhiben aquí con sus capturas de pantalla, tecnologías y logros de arquitectura asociados.
                  </p>
                  {isOwner && onOpenNewProduct && (
                    <button
                      type="button"
                      onClick={onOpenNewProduct}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Primer Producto</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPublicProducts.map((prod) => {
                    const relatedLogs = publicLogs.filter((l) => prod.relatedAchievementIds?.includes(l.id));
                    const isHighlighted = highlightedProductId === prod.id;
                    return (
                      <div
                        id={`public-product-${prod.id}`}
                        key={prod.id}
                        className={isHighlighted ? "ring-2 ring-cyan-400 rounded-2xl" : ""}
                      >
                        <ProductCard
                          product={prod}
                          relatedLogs={relatedLogs}
                          onSelectLog={handleSelectFromChat}
                          isOwner={isOwner}
                          onEdit={onEditProduct}
                          onDelete={onDeleteProduct}
                          onTogglePublic={onToggleProductPublic}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: First Mate AI Agent & Leave Note Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* First Mate AI Widget */}
          <FirstMateChat
            publicLogs={publicLogs}
            publicProducts={publicProducts}
            userProfile={userProfile}
            activeTab={activeTab}
            onSelectLog={handleSelectFromChat}
            onSelectProduct={handleSelectProductFromChat}
            onOpenLeaveNote={() => {
              const el = document.getElementById("leave-note");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Contact / Note Form */}
          <div id="leave-note" className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t.publicDeck.recruiterNoteTitle}</h3>
                <p className="text-[11px] text-slate-400">
                  {t.publicDeck.recruiterNoteSubtitle}
                </p>
              </div>
            </div>

            {noteSent ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-200">{t.publicDeck.noteSentSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleNoteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.common.role} / {t.auth.nameLabel} *</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder={t.publicDeck.recruiterNamePlaceholder}
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.auth.emailLabel} *</label>
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder={t.publicDeck.recruiterEmailPlaceholder}
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.common.company} ({t.common.optional})</label>
                  <input
                    type="text"
                    value={visitorOrg}
                    onChange={(e) => setVisitorOrg(e.target.value)}
                    placeholder={t.publicDeck.recruiterCompanyPlaceholder}
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.common.notes} *</label>
                  <textarea
                    required
                    rows={3}
                    value={visitorMessage}
                    onChange={(e) => setVisitorMessage(e.target.value)}
                    placeholder={t.publicDeck.recruiterMessagePlaceholder}
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                >
                  {t.publicDeck.sendRecruiterNote}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Share with Recruiter Modal */}
      <ShareDeckModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        user={userProfile}
        logs={logs}
        products={products}
      />
    </div>
  );
};
