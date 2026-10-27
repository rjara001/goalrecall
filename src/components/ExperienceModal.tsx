import React, { useState, useEffect } from "react";
import { 
  X, 
  Building, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Tag, 
  Check, 
  FolderGit2, 
  Plus, 
  Compass, 
  ListPlus, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  Lock,
  ChevronRight
} from "lucide-react";
import { WorkExperience, LogEntry, LogCategory } from "../types";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
    bulletsToCreate?: string[]
  ) => void;
  initialData?: WorkExperience | null;
  existingLogs?: LogEntry[];
}

function predictCategory(text: string): LogCategory {
  const lower = text.toLowerCase();
  // Marketing & Growth
  if (lower.includes("campaña") || lower.includes("growth") || lower.includes("adquisici") || lower.includes("cac") || lower.includes("leads") || lower.includes("mql")) {
    return "Campaña / Growth 📈";
  }
  if (lower.includes("convers") || lower.includes("funnel") || lower.includes("embudo") || lower.includes("abandono") || lower.includes("a/b test") || lower.includes("experimento")) {
    return "Conversión & Funnel 🎯";
  }
  if (lower.includes("contenido") || lower.includes("seo") || lower.includes("copy") || lower.includes("artículo") || lower.includes("blog") || lower.includes("redacci")) {
    return "Contenido & SEO ✍️";
  }
  if (lower.includes("branding") || lower.includes("marca") || lower.includes("evento") || lower.includes("pr ") || lower.includes("prensa")) {
    return "Branding & Eventos 🎨";
  }
  if (lower.includes("diseño") || lower.includes("ux") || lower.includes("ui") || lower.includes("figma") || lower.includes("usabilidad") || lower.includes("prototip")) {
    return "Diseño & UX 🖌️";
  }
  if (lower.includes("venta") || lower.includes("revenue") || lower.includes("arr") || lower.includes("mrr") || lower.includes("comercial") || lower.includes("deal") || lower.includes("cierre")) {
    return "Ventas & Revenue 💰";
  }
  if (lower.includes("estrategia") || lower.includes("lider") || lower.includes("equipo") || lower.includes("contrataci") || lower.includes("mentoring")) {
    return "Estrategia & Liderazgo 👥";
  }
  if (lower.includes("lanzamiento") || lower.includes("launch") || lower.includes("go-to-market") || lower.includes("gtm")) {
    return "Lanzamiento 🚀";
  }
  // Engineering & Tech
  if (lower.includes("fix") || lower.includes("bug") || lower.includes("resolv") || lower.includes("parche") || lower.includes("incidenc")) {
    return "Fix 🐛";
  }
  if (lower.includes("refactor") || lower.includes("limpi") || lower.includes("migr") || lower.includes("deuda")) {
    return "Refactor 🧹";
  }
  if (lower.includes("infra") || lower.includes("devops") || lower.includes("docker") || lower.includes("k8s") || lower.includes("ci/cd") || lower.includes("pipeline") || lower.includes("aws") || lower.includes("gcp") || lower.includes("cloud")) {
    return "Infra/DevOps 🚀";
  }
  if (lower.includes("arquitect") || lower.includes("microservicio") || lower.includes("sistema") || lower.includes("patr")) {
    return "Architecture 🏗️";
  }
  if (lower.includes("investig") || lower.includes("spike") || lower.includes("poc") || lower.includes("evalu")) {
    return "Spike/R&D 🔬";
  }
  return "Feature ✨";
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingLogs = [],
}) => {
  // Step control: "form" | "confirm_autocreate"
  const [modalStep, setModalStep] = useState<"form" | "confirm_autocreate">("form");

  // Main priority fields
  const [summary, setSummary] = useState("");
  const [bulletsText, setBulletsText] = useState("");

  // Optional metadata fields (hidden in accordions)
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [isPersonalProjects, setIsPersonalProjects] = useState(false);

  // Accordion open/close states (default all collapsed with +)
  const [isCompanyRoleOpen, setIsCompanyRoleOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isLocationTechOpen, setIsLocationTechOpen] = useState(false);

  // Bullets to autocreate in confirmation step
  const [pendingBullets, setPendingBullets] = useState<string[]>([]);
  const [selectedBullets, setSelectedBullets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setCompany(initialData.company || "");
      setRole(initialData.role || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setIsCurrent(initialData.isCurrent || false);
      setLocation(initialData.location || "");
      setSummary(initialData.summary || "");
      setBulletsText(initialData.bullets?.join("\n") || "");
      setTechnologies(initialData.technologies || []);
      setIsPersonalProjects(initialData.isPersonalProjects || false);
    } else {
      setCompany("");
      setRole("");
      setStartDate(new Date().getFullYear().toString());
      setEndDate("");
      setIsCurrent(true);
      setLocation("Remoto");
      setSummary("");
      setBulletsText("");
      setTechnologies(["TypeScript", "React", "Node.js"]);
      setIsPersonalProjects(false);
    }
    setModalStep("form");
    setIsCompanyRoleOpen(false);
    setIsDatesOpen(false);
    setIsLocationTechOpen(false);
    setPendingBullets([]);
    setSelectedBullets({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTech = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== "Enter") return;
    if (e) e.preventDefault();

    const clean = techInput.trim();
    if (!clean) return;

    if (!technologies.includes(clean)) {
      setTechnologies([...technologies, clean]);
    }
    setTechInput("");
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const getCleanExpData = () => {
    const cleanCompany = company.trim() || (isPersonalProjects ? "Proyectos Personales & Consultoría" : "Experiencia Profesional");
    const cleanRole = role.trim() || "Ingeniero / Desarrollador de Software";

    const parsedBullets = bulletsText
      .split(/\n+/)
      .map((l) => l.replace(/^[•\-*–—›▪\d\.]+\s*/, "").trim())
      .filter((l) => l.length > 3);

    return {
      expData: {
        id: initialData?.id,
        company: cleanCompany,
        role: cleanRole,
        startDate: startDate.trim(),
        endDate: isCurrent ? "" : endDate.trim(),
        isCurrent,
        location: location.trim(),
        summary: summary.trim(),
        bullets: parsedBullets.length > 0 ? parsedBullets : (initialData?.bullets || []),
        technologies,
        isPersonalProjects,
      },
      parsedBullets,
    };
  };

  // Called when user clicks "Guardar Experiencia" on form
  const handleProceedToSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { expData, parsedBullets } = getCleanExpData();

    // Check which bullets are brand new (not already in existing logs)
    const existingBulletsSet = new Set(
      existingLogs
        .filter((l) => initialData?.id ? l.experienceId === initialData.id : false)
        .map((l) => (l.originalBullet || l.title || "").trim().toLowerCase())
    );

    const candidates = parsedBullets.filter(
      (b) => !existingBulletsSet.has(b.toLowerCase())
    );

    if (candidates.length > 0) {
      // Show confirmation modal presenting the autocreation
      setPendingBullets(candidates);
      const initialSelection: Record<string, boolean> = {};
      candidates.forEach((b) => {
        initialSelection[b] = true; // All selected by default
      });
      setSelectedBullets(initialSelection);
      setModalStep("confirm_autocreate");
    } else {
      // No new bullets to autocreate, save directly
      onSave(expData, []);
    }
  };

  const handleConfirmAutocreate = () => {
    const { expData } = getCleanExpData();
    const chosen = pendingBullets.filter((b) => selectedBullets[b]);
    onSave(expData, chosen);
  };

  const handleSaveOnlyExperience = () => {
    const { expData } = getCleanExpData();
    onSave(expData, []);
  };

  const toggleAllBullets = () => {
    const allSelected = pendingBullets.every((b) => selectedBullets[b]);
    const nextState: Record<string, boolean> = {};
    pendingBullets.forEach((b) => {
      nextState[b] = !allSelected;
    });
    setSelectedBullets(nextState);
  };

  const toggleSingleBullet = (bullet: string) => {
    setSelectedBullets((prev) => ({
      ...prev,
      [bullet]: !prev[bullet],
    }));
  };

  const selectedCount = pendingBullets.filter((b) => selectedBullets[b]).length;

  const bulletCount = bulletsText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              {modalStep === "confirm_autocreate" ? (
                <Sparkles className="w-4 h-4 text-cyan-300" />
              ) : isPersonalProjects ? (
                <FolderGit2 className="w-4 h-4" />
              ) : (
                <Building className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {modalStep === "confirm_autocreate"
                  ? "Autocreación de Logros"
                  : initialData
                  ? "Editar Experiencia"
                  : "Nueva Experiencia"}
              </h2>
              <p className="text-xs text-slate-400">
                {modalStep === "confirm_autocreate"
                  ? "Confirmación de registros automáticos en tu bitácora personal"
                  : "Enfocado en Misión y Logros. Metadatos opcionales en acordeones (+)."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 2: CONFIRMATION MODAL PRESENTING AUTOCREATION */}
        {modalStep === "confirm_autocreate" ? (
          <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1 animate-in fade-in duration-150">
            
            {/* Informative Presentation Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/40 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <span>Se registrarán automáticamente los siguientes logros</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Detectamos <strong>{pendingBullets.length} viñetas</strong> en tu experiencia. Para ahorrarte trabajo, se autocrearán en tu <strong>Sandbox Privado (Confidencial) 🔒</strong> vinculados a <span className="text-cyan-300 font-semibold">{company || "esta experiencia"}</span>.
              </p>
              <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  💡 <em>Podrás completarlos y enriquecerlos luego con sus acordeones (+ ¿Qué se buscaba?, + Impacto, + Solución) para darle máxima consistencia a tu perfil profesional.</em>
                </span>
              </div>
            </div>

            {/* List Header & Toggle All */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Viñetas seleccionadas para autocrear ({selectedCount} de {pendingBullets.length})
              </span>
              <button
                type="button"
                onClick={toggleAllBullets}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                {selectedCount === pendingBullets.length ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>

            {/* Bullets Checklist Card */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {pendingBullets.map((bullet, idx) => {
                const isChecked = !!selectedBullets[bullet];
                const cat = predictCategory(bullet);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSingleBullet(bullet)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? "bg-slate-900/90 border-cyan-500/40 text-slate-100 shadow-sm"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-cyan-400 shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs leading-relaxed font-sans">
                        {bullet}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {cat}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Sandbox Privado 🔒
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions for Step 2 */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setModalStep("form")}
                className="w-full sm:w-auto px-3 py-2 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a editar</span>
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveOnlyExperience}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Solo guardar empresa
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAutocreate}
                  disabled={selectedCount === 0}
                  className={`w-full sm:w-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 ${
                    selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confirmar y Autocrear ({selectedCount} Logros)</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* STEP 1: MAIN FORM */
          <form onSubmit={handleProceedToSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
            
            {/* 1. PRIMARY FIELD: Misión & Contexto General del Rol */}
            <div className="space-y-1.5 p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-cyan-300 text-xs">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Misión & Contexto General del Rol</span>
                </label>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  Principal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Describe qué hacía el equipo, el problema que resolvías y el alcance de tu responsabilidad.
              </p>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="ej. Lideré el equipo core de pagos y checkout. Nuestra misión era procesar transacciones de alta concurrencia asegurando 99.99% de disponibilidad y cumplimiento normativo..."
                className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
              />
            </div>

            {/* 2. PRIMARY FIELD: Viñetas & Logros del CV */}
            <div className="space-y-1.5 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                  <ListPlus className="w-4 h-4 text-emerald-400" />
                  <span>Viñetas & Logros del CV (una por línea)</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{bulletCount} {bulletCount === 1 ? "logro a autocrear" : "logros a autocrear"}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Escribe o pega las viñetas de tu CV. Cada línea se convertirá automáticamente en un logro editable en tu bitácora.
              </p>
              <textarea
                rows={4}
                value={bulletsText}
                onChange={(e) => setBulletsText(e.target.value)}
                placeholder="• Reduje el tiempo de respuesta de la API de 850ms a 120ms optimizando consultas e implementando Redis.&#10;• Diseñé e implementé la arquitectura de microfrontends con Angular 21, acelerando el release de features un 35%.&#10;• Lideré la migración a Kubernetes (EKS) reduciendo costos de infraestructura en $14K USD mensuales."
                className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed font-sans"
              />
            </div>

            {/* 3. ACORDEÓN OPCIONAL 1: Empresa / Organización & Rol Técnico (+) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              {!isCompanyRoleOpen ? (
                <button
                  type="button"
                  onClick={() => setIsCompanyRoleOpen(true)}
                  className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-xs truncate">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                      {company || role ? (
                        `🏢 ${company || 'Empresa'} · ${role || 'Rol Profesional'}`
                      ) : (
                        "+ Empresa / Organización & Rol Profesional (Opcional)"
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                    {company || role ? "Editar" : "Definir"} ▾
                  </span>
                </button>
              ) : (
                <div className="p-4 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      Empresa / Organización & Rol Profesional
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCompanyRoleOpen(false)}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Ocultar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                        Empresa / Organización (Opcional)
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="ej. Pozo Monte, Mercado Libre, HubSpot, Stripe"
                          className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                        Rol / Cargo Profesional (Opcional)
                      </label>
                      <div className="relative">
                        <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="ej. Growth Lead, Staff Engineer, Product Designer, VP Sales"
                          className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Entidad Contenedora */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-200 text-[11px]">Tipo de Entidad</p>
                      <p className="text-[10px] text-slate-400">
                        {isPersonalProjects 
                          ? "Proyectos personales, consultoría independiente o experimentos" 
                          : "Empresa u organización formal"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPersonalProjects(!isPersonalProjects)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-colors flex items-center gap-1.5 ${
                        isPersonalProjects
                          ? "bg-purple-950/60 border-purple-600/60 text-purple-200"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isPersonalProjects ? <FolderGit2 className="w-3 h-3 text-purple-400" /> : <Building className="w-3 h-3 text-cyan-400" />}
                      <span>{isPersonalProjects ? "Proyecto Personal" : "Empresa Formal"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ACORDEÓN OPCIONAL 2: Fechas & Período (Inicio, Fin, Actualidad) (+) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              {!isDatesOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDatesOpen(true)}
                  className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-xs truncate">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                      {startDate || endDate || isCurrent ? (
                        `📅 Fechas: ${startDate || '—'} a ${isCurrent ? 'Actualidad' : (endDate || '—')}`
                      ) : (
                        "+ Fechas & Período (Inicio / Fin / Actualidad) (Opcional)"
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                    {startDate || endDate || isCurrent ? "Editar" : "Definir"} ▾
                  </span>
                </button>
              ) : (
                <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Fechas & Período
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDatesOpen(false)}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Ocultar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                        Fecha Inicio (Opcional)
                      </label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          placeholder="ej. 2026 o 2022-03"
                          className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-medium text-slate-400 text-[11px]">
                          Fecha Fin (Opcional)
                        </label>
                        <label className="flex items-center gap-1 text-[11px] text-cyan-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCurrent}
                            onChange={(e) => setIsCurrent(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-[#080C14]"
                          />
                          <span>Actual</span>
                        </label>
                      </div>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          disabled={isCurrent}
                          value={isCurrent ? "Actualidad" : endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          placeholder={isCurrent ? "Actualidad" : "ej. 2026 o 2024-06"}
                          className={`w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs ${
                            isCurrent ? "opacity-60 cursor-not-allowed bg-slate-900" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. ACORDEÓN OPCIONAL 3: Ubicación & Stack Tecnológico (+) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              {!isLocationTechOpen ? (
                <button
                  type="button"
                  onClick={() => setIsLocationTechOpen(true)}
                  className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-xs truncate">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                      {location || technologies.length > 0 ? (
                        `🏷️ ${location || 'Ubicación'} · ${technologies.length} tags/herramientas`
                      ) : (
                        "+ Ubicación, Herramientas & Canales (Opcional)"
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                    {location || technologies.length > 0 ? "Editar" : "Definir"} ▾
                  </span>
                </button>
              ) : (
                <div className="p-4 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Ubicación, Herramientas & Canales Clave
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLocationTechOpen(false)}
                      className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Ocultar
                    </button>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                      Ubicación / Modalidad (Opcional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="ej. Remoto / Santiago, Chile / Híbrido"
                        className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                      Herramientas, Canales & Habilidades Asociadas (Opcional)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={handleAddTech}
                          placeholder="ej. HubSpot, Python, Figma, Google Ads, SQL, Notion (presiona Enter)"
                          className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTech}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
                      >
                        Añadir
                      </button>
                    </div>

                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                        {technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono text-[11px]"
                          >
                            <span>{tech}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTech(tech)}
                              className="text-cyan-400 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20 text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {bulletCount > 0 ? "Guardar y Revisar Logros" : "Guardar Experiencia"}
                </span>
                {bulletCount > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
