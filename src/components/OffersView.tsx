import React, { useState } from "react";
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2, 
  MapPin, 
  Target, 
  Zap, 
  Eye, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  Copy, 
  Printer, 
  Layers, 
  ExternalLink, 
  Edit3, 
  ArrowRight,
  TrendingUp,
  Bookmark,
  Share2,
  AlertCircle
} from "lucide-react";
import { JobOffer, JobOfferStatus, LogEntry, WorkExperience, UserProfile } from "../types";

interface OffersViewProps {
  offers: JobOffer[];
  logs: LogEntry[];
  experiences: WorkExperience[];
  user: UserProfile | null;
  onSaveOffer: (offer: JobOffer) => void;
  onAddOffer: (offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteOffer: (id: string) => void;
  onOpenQuickLog: () => void;
  onOpenCvUpload?: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  offers,
  logs,
  experiences,
  user,
  onSaveOffer,
  onAddOffer,
  onDeleteOffer,
  onOpenQuickLog,
  onOpenCvUpload,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    offers.length > 0 ? offers[0].id : ""
  );
  const [statusFilter, setStatusFilter] = useState<"all" | JobOfferStatus>("all");
  const [activeTab, setActiveTab] = useState<"ats" | "cv" | "interview">("ats");
  const [isNewOfferModalOpen, setIsNewOfferModalOpen] = useState(false);
  const [copiedCvText, setCopiedCvText] = useState(false);

  // New Offer Form State
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formLocation, setFormLocation] = useState("Remoto");
  const [formModality, setFormModality] = useState<"100% Remoto" | "Híbrido" | "Presencial">("100% Remoto");
  const [formContractType, setFormContractType] = useState<"B2B / Contractor" | "Dependencia Directa" | "Freelance" | "Indefinido">("B2B / Contractor");
  const [formSalaryMin, setFormSalaryMin] = useState<string>("7000");
  const [formSalaryMax, setFormSalaryMax] = useState<string>("9500");
  const [formSalaryCurrency, setFormSalaryCurrency] = useState("USD");
  const [formExtraConditions, setFormExtraConditions] = useState("MacBook Pro, 25 días libres, seguro de salud internacional.");

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  const filteredOffers = offers.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim() || !formDescription.trim()) return;

    // Automatic ATS keywords & requirements analysis based on description
    const textLower = formDescription.toLowerCase();
    const commonTechs = [
      "react", "node", "typescript", "python", "golang", "go", "java", "rust",
      "aws", "gcp", "azure", "docker", "kubernetes", "redis", "postgresql", 
      "sql", "graphql", "microservicios", "kafka", "rabbitmq", "ci/cd", 
      "latencia", "rendimiento", "seguridad", "liderazgo", "scrum"
    ];

    const matchedKeywords = commonTechs.filter((t) => textLower.includes(t));
    const sampleMissing = ["Kafka", "DynamoDB", "Terraform"].filter(
      (m) => !matchedKeywords.includes(m.toLowerCase())
    );

    const calculatedScore = Math.min(
      95,
      Math.max(65, 60 + matchedKeywords.length * 4)
    );

    const newOfferData: Omit<JobOffer, "id" | "createdAt" | "updatedAt"> = {
      company: formCompany.trim(),
      role: formRole.trim(),
      description: formDescription.trim(),
      url: formUrl.trim(),
      location: formLocation.trim(),
      modality: formModality,
      contractType: formContractType,
      salaryExpectation: {
        min: Number(formSalaryMin) || undefined,
        max: Number(formSalaryMax) || undefined,
        currency: formSalaryCurrency,
        period: "mensual",
      },
      extraConditions: formExtraConditions.trim(),
      status: "saved",
      atsAnalysis: {
        score: calculatedScore,
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords.map(k => k.toUpperCase()) : ["SISTEMAS DISTRIBUIDOS", "MICROSERVICIOS", "APIS"],
        missingKeywords: sampleMissing,
        recommendations: [
          `Prioriza logros con la fórmula Google XYZ relacionados con ${formRole}.`,
          "Destaca la reducción de tiempos o mejora de latencias en producción.",
          "Verifica tener lista una historia STAR de resolución de incidentes."
        ],
        keyRequirements: [
          `Experiencia probada en responsabilidades de ${formRole}`,
          "Capacidad de trabajo autónomo en entornos remotos",
          "Decisiones técnicas sustentadas con métricas verificables"
        ]
      },
      tailoredCv: {
        headline: `${formRole} | Infraestructura & Software`,
        targetSummary: `Profesional con experiencia comprobada postulando al rol de ${formRole} en ${formCompany}. Enfoque en escalabilidad, mejores prácticas y entrega de impacto de negocio medible.`,
        selectedLogIds: logs.slice(0, 5).map(l => l.id),
        selectedExperienceIds: experiences.map(e => e.id),
        highlightedSkills: matchedKeywords.slice(0, 6)
      },
      interviewPrep: {
        cheatSheet: [
          `Alinear el elevator pitch a la misión y desafíos de ${formCompany}.`,
          `Preparar 2 logros medibles con métricas duras para el rol de ${formRole}.`,
          "Tener claras las condiciones pretendidas (rango salarial y modalidad)."
        ],
        frequentQuestions: [
          {
            question: `¿Por qué te interesa el puesto de ${formRole} en ${formCompany}?`,
            focus: "Alineación de Rol & Motivación",
            suggestedStrategy: "Explicar cómo tus mayores logros técnicos y tu experiencia previa coinciden de lleno con los retos de este equipo."
          },
          {
            question: "¿Cómo abordas un incidente crítico o una falla en producción bajo presión?",
            focus: "Metodología STAR",
            suggestedStrategy: "Describir el proceso de triage, comunicación con stakeholders, remediación inmediata y post-mortem sin culpas."
          }
        ]
      }
    };

    onAddOffer(newOfferData);
    setIsNewOfferModalOpen(false);

    // Reset Form
    setFormCompany("");
    setFormRole("");
    setFormDescription("");
    setFormUrl("");
  };

  const handleStatusChange = (newStatus: JobOfferStatus) => {
    if (!currentOffer) return;
    onSaveOffer({
      ...currentOffer,
      status: newStatus,
      appliedDate: newStatus === "applied" && !currentOffer.appliedDate 
        ? new Date().toISOString().substring(0, 10) 
        : currentOffer.appliedDate
    });
  };

  const handleToggleLogSelection = (logId: string) => {
    if (!currentOffer) return;
    const currentSelected = currentOffer.tailoredCv?.selectedLogIds || [];
    const isSelected = currentSelected.includes(logId);
    const updatedSelected = isSelected
      ? currentSelected.filter((id) => id !== logId)
      : [...currentSelected, logId];

    onSaveOffer({
      ...currentOffer,
      tailoredCv: {
        headline: currentOffer.tailoredCv?.headline || currentOffer.role,
        targetSummary: currentOffer.tailoredCv?.targetSummary || "",
        highlightedSkills: currentOffer.tailoredCv?.highlightedSkills || [],
        selectedExperienceIds: currentOffer.tailoredCv?.selectedExperienceIds || [],
        selectedLogIds: updatedSelected,
      }
    });
  };

  const copyCvMarkdown = () => {
    if (!currentOffer) return;
    const headline = currentOffer.tailoredCv?.headline || `${user?.name || "Candidato"} - ${currentOffer.role}`;
    const summary = currentOffer.tailoredCv?.targetSummary || user?.bio || "";
    const selectedLogs = logs.filter(l => (currentOffer.tailoredCv?.selectedLogIds || []).includes(l.id));

    let output = `# ${user?.name || "Candidato"} | ${headline}\n`;
    output += `Email: ${user?.email || ""} | Ubicación: ${user?.location || "Remoto"}\n`;
    if (user?.linkedin) output += `LinkedIn: ${user.linkedin} | `;
    if (user?.github) output += `GitHub: ${user.github}\n\n`;
    output += `## PERFIL PROFESIONAL\n${summary}\n\n`;
    output += `## LOGROS DESTACADOS ADAPTADOS A ${currentOffer.company.toUpperCase()}\n`;
    
    selectedLogs.forEach(l => {
      output += `- [${l.client}] ${l.title}: ${l.impact}\n`;
    });

    navigator.clipboard.writeText(output);
    setCopiedCvText(true);
    setTimeout(() => setCopiedCvText(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner: Motor de Ofertas & Postulaciones (Fase 2) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0C1222] to-slate-900 border border-indigo-900/40 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fase 2: Motor de Ofertas, CV Enfocado & ATS Match</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tus Postulaciones basadas en la Oferta
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Carga cualquier vacante laboral, define tus condiciones de compensación y deja que GoalRecall cruce tus logros con los requisitos del ATS para generar un CV enfocado y preparar tu entrevista técnica.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewOfferModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cargar Nueva Oferta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Offers Sidebar / Pipeline + Active Offer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Offers List & Status Filter */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-medium">
            {[
              { id: "all", label: "Todas" },
              { id: "saved", label: "Guardadas" },
              { id: "applied", label: "Postuladas" },
              { id: "interviewing", label: "Entrevistas" },
              { id: "offered", label: "Ofertas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Offers Cards */}
          <div className="space-y-3">
            {filteredOffers.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-3">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No hay ofertas en este estado.</p>
                <button
                  onClick={() => setIsNewOfferModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Cargar una oferta ahora
                </button>
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const isSelected = offer.id === currentOffer?.id;
                const statusColors = {
                  saved: "bg-slate-800 text-slate-300 border-slate-700",
                  applied: "bg-blue-950 text-blue-300 border-blue-800/60",
                  interviewing: "bg-purple-950 text-purple-300 border-purple-800/60",
                  offered: "bg-emerald-950 text-emerald-300 border-emerald-800/60",
                  rejected: "bg-red-950 text-red-300 border-red-800/60",
                  accepted: "bg-emerald-900 text-emerald-200 border-emerald-700",
                };

                const statusLabels = {
                  saved: "Guardada",
                  applied: "Postulado",
                  interviewing: "En Entrevistas",
                  offered: "Oferta Recibida",
                  rejected: "Descartada",
                  accepted: "Aceptada",
                };

                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-indigo-950/30 border-indigo-500/80 shadow-md shadow-indigo-950/40"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">{offer.role}</h3>
                        <p className="text-xs text-indigo-300 font-medium flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{offer.company}</span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusColors[offer.status]}`}>
                        {statusLabels[offer.status]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{offer.modality}</span>
                      </span>
                      {offer.salaryExpectation?.min && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <DollarSign className="w-3 h-3" />
                          <span>${offer.salaryExpectation.min.toLocaleString()} {offer.salaryExpectation.currency}</span>
                        </span>
                      )}
                    </div>

                    {offer.atsAnalysis?.score && (
                      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Afinidad ATS:</span>
                        <span className="font-bold font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                          {offer.atsAnalysis.score}% Match
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Offer Workspace */}
        <div className="lg:col-span-8">
          {currentOffer ? (
            <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-6">
              
              {/* Header with Role, Company, Conditions & Status Switcher */}
              <div className="space-y-4 pb-5 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white">{currentOffer.role}</h2>
                      {currentOffer.url && (
                        <a
                          href={currentOffer.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-indigo-400 p-1"
                          title="Abrir enlace de la vacante"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-indigo-300 font-semibold mt-0.5 flex items-center gap-2">
                      <span>{currentOffer.company}</span>
                      <span>·</span>
                      <span className="text-slate-400 font-normal">{currentOffer.location || "Remoto"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteOffer(currentOffer.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Eliminar esta oferta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Candidate Conditions Summary Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono uppercase">Compensación Pretendida:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {currentOffer.salaryExpectation?.min
                        ? `$${currentOffer.salaryExpectation.min.toLocaleString()} - $${currentOffer.salaryExpectation.max?.toLocaleString()} ${currentOffer.salaryExpectation.currency}/${currentOffer.salaryExpectation.period}`
                        : "No especificado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono uppercase">Modalidad & Contrato:</span>
                    <span className="font-semibold text-slate-200">
                      {currentOffer.modality} · {currentOffer.contractType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-mono uppercase">Condiciones / Extras:</span>
                    <span className="text-slate-300 truncate block" title={currentOffer.extraConditions}>
                      {currentOffer.extraConditions || "Estándar"}
                    </span>
                  </div>
                </div>

                {/* Pipeline Status Selector */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400 font-mono">Estado de postulación:</span>
                  {(["saved", "applied", "interviewing", "offered", "rejected"] as JobOfferStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        currentOffer.status === st
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st === "saved" && "Guardada"}
                      {st === "applied" && "Postulado"}
                      {st === "interviewing" && "En Entrevistas"}
                      {st === "offered" && "Oferta"}
                      {st === "rejected" && "Descartada"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Selector: ATS Analysis | Tailored CV | Interview Prep */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab("ats")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "ats"
                      ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Análisis ATS & Afinidades</span>
                  {currentOffer.atsAnalysis?.score && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900/60 text-white font-mono">
                      {currentOffer.atsAnalysis.score}%
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("cv")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "cv"
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generador de CV Enfocado</span>
                </button>

                <button
                  onClick={() => setActiveTab("interview")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "interview"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Preparador de Entrevistas</span>
                </button>
              </div>

              {/* TAB 1: ATS ANALYSIS */}
              {activeTab === "ats" && currentOffer.atsAnalysis && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-5 bg-slate-950/80 border border-cyan-900/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">
                        Diagnóstico ATS Match
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        Afinidad con los Requisitos de {currentOffer.company}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Evaluación algorítmica de palabras clave detectadas en tu base de datos de logros frente al texto de la vacante.
                      </p>
                    </div>

                    <div className="px-5 py-3 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-center shrink-0">
                      <span className="text-2xl font-black text-cyan-300 font-mono">
                        {currentOffer.atsAnalysis.score}%
                      </span>
                      <span className="block text-[10px] text-cyan-400/80 font-mono uppercase">
                        Compatibilidad
                      </span>
                    </div>
                  </div>

                  {/* Matched vs Missing Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Términos Cumplidos en tu Bóveda</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {currentOffer.atsAnalysis.matchedKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Palabras Clave Faltantes en el CV</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {currentOffer.atsAnalysis.missingKeywords.length > 0 ? (
                          currentOffer.atsAnalysis.missingKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No se detectaron brechas graves.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Recomendaciones Estratégicas para esta Oferta:</span>
                    </h4>
                    <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
                      {currentOffer.atsAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Original Job Description Accordion */}
                  <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Texto Original de la Vacante</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-2">
                      {currentOffer.description}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: TAILORED CV GENERATOR & PREVIEW */}
              {activeTab === "cv" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl">
                    <div>
                      <h3 className="text-sm font-bold text-white">Previsualizador de CV Enfocado para {currentOffer.company}</h3>
                      <p className="text-xs text-purple-300">
                        Selecciona qué logros de tu Bóveda (SSOT) deseas incluir en esta postulación.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyCvMarkdown}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        {copiedCvText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCvText ? "Copiado" : "Copiar Texto"}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Achievement Selector from SSOT */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Logros Disponibles en tu Bitácora (Marca los que quieras incluir):
                    </h4>
                    
                    {logs.length === 0 ? (
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                        <span>Aún no tienes logros en tu Bitácora.</span>
                        <button
                          onClick={onOpenQuickLog}
                          className="text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          + Registrar Primer Logro
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {logs.map((log) => {
                          const isIncluded = (currentOffer.tailoredCv?.selectedLogIds || []).includes(log.id);
                          return (
                            <div
                              key={log.id}
                              onClick={() => handleToggleLogSelection(log.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                isIncluded
                                  ? "bg-purple-950/40 border-purple-600 text-white"
                                  : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => {}}
                                className="mt-1 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="text-xs space-y-0.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200">[{log.client}] {log.title}</span>
                                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded">
                                    {log.category}
                                  </span>
                                </div>
                                <p className="text-slate-300 line-clamp-1">{log.impact}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Live Rendered CV Paper Preview */}
                  <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl shadow-xl font-sans space-y-5 border border-slate-200">
                    <div className="border-b border-slate-300 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                          {user?.name || "Tu Nombre Profesional"}
                        </h2>
                        <p className="text-sm font-bold text-indigo-700 mt-0.5">
                          {currentOffer.tailoredCv?.headline || currentOffer.role}
                        </p>
                      </div>
                      <div className="text-xs text-slate-600 sm:text-right font-mono space-y-0.5">
                        <p>{user?.email || "correo@ejemplo.com"}</p>
                        <p>{user?.location || "Remoto / Global"}</p>
                        {user?.linkedin && <p>linkedin.com/in/{user.linkedin.replace(/.*linkedin\.com\/in\//, "")}</p>}
                      </div>
                    </div>

                    {/* Summary Block */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                        Resumen Profesional Adaptado
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed pt-1">
                        {currentOffer.tailoredCv?.targetSummary || user?.bio || "Especialista enfocado en soluciones de alto impacto y arquitectura de sistemas."}
                      </p>
                    </div>

                    {/* Tailored Achievements Section */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                        Logros Destacados para {currentOffer.company.toUpperCase()}
                      </h3>
                      
                      {logs.filter(l => (currentOffer.tailoredCv?.selectedLogIds || []).includes(l.id)).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No has marcado logros arriba para incluir en este CV. Selecciona tus viñetas en la lista superior.
                        </p>
                      ) : (
                        <ul className="space-y-2 text-xs text-slate-800">
                          {logs
                            .filter(l => (currentOffer.tailoredCv?.selectedLogIds || []).includes(l.id))
                            .map((log) => (
                              <li key={log.id} className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <div>
                                  <span className="font-semibold text-slate-950">[{log.client}] {log.title}: </span>
                                  <span>{log.impact}</span>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: INTERVIEW PREPARATION */}
              {activeTab === "interview" && currentOffer.interviewPrep && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Cheat Sheet */}
                  <div className="p-5 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>Cheat Sheet de Repaso Rápido (Léelo 10 min antes de la llamada)</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-200 pl-4 list-disc">
                      {currentOffer.interviewPrep.cheatSheet.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Anticipated Q&A Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Preguntas Técnicas & Conductuales más Probables para {currentOffer.role}:
                    </h4>

                    {currentOffer.interviewPrep.frequentQuestions.map((qa, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Pregunta {i + 1}: "{qa.question}"</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                            {qa.focus}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <strong className="text-emerald-400 block">Estrategia de Respuesta Recomendada:</strong>
                          <p>{qa.suggestedStrategy}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
              <Briefcase className="w-12 h-12 text-indigo-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No hay ofertas seleccionadas</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Carga los datos de una postulación para generar tu CV enfocado y analizar palabras clave ATS.
              </p>
              <button
                onClick={() => setIsNewOfferModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                + Cargar Oferta Ahora
              </button>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: Nueva Oferta Laboral */}
      {isNewOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B101D] border border-indigo-900/60 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsNewOfferModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-mono font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>NUEVA VACANTE / POSTULACIÓN</span>
              </div>
              <h3 className="text-xl font-bold text-white">Ingresar Ficha de Oferta Laboral</h3>
              <p className="text-xs text-slate-400">
                Pega la descripción del rol para extraer requisitos y cruzarlo con tus logros.
              </p>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Stripe, Nubank, Mercado Libre"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Título del Rol *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Staff Backend Engineer"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Descripción / Requisitos de la Oferta *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Pega aquí los requisitos, stack y responsabilidades del puesto..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Conditions: Salary & Modality */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-indigo-300 uppercase font-mono block">
                  Tus Condiciones Pretendidas para esta Vacante:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Salario Mínimo</label>
                    <input
                      type="number"
                      placeholder="6000"
                      value={formSalaryMin}
                      onChange={(e) => setFormSalaryMin(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Salario Máximo</label>
                    <input
                      type="number"
                      placeholder="9000"
                      value={formSalaryMax}
                      onChange={(e) => setFormSalaryMax(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Divisa</label>
                    <select
                      value={formSalaryCurrency}
                      onChange={(e) => setFormSalaryCurrency(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="CLP">CLP</option>
                      <option value="MXN">MXN</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Modalidad</label>
                    <select
                      value={formModality}
                      onChange={(e) => setFormModality(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      <option value="100% Remoto">100% Remoto</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-900/30 transition-all"
                >
                  Guardar & Analizar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
