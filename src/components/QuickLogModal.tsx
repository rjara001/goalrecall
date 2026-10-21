import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Tag, 
  Check, 
  Eye, 
  Lock, 
  Calendar, 
  Building, 
  FolderGit2, 
  Zap, 
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import { LogCategory, LogEntry, PresetTemplate } from "../types";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => void;
  existingLogs: LogEntry[];
  initialData?: LogEntry | null;
  initialExperienceId?: string;
  initialBulletText?: string;
}

const CATEGORIES: LogCategory[] = [
  "Feature ✨",
  "Fix 🐛",
  "Refactor 🧹",
  "Architecture 🏗️",
  "Infra/DevOps 🚀",
  "Spike/R&D 🔬",
];

const PRESETS: PresetTemplate[] = [
  {
    name: "Incidente P0 / Bug Crítico",
    category: "Fix 🐛",
    title: "Resolución de fallo crítico de concurrencia en producción",
    description: "Identificación de condición de carrera bajo alta carga. Implementación de cerrojo distribuido y reconciliación de estado.",
    impact: "Recuperación de servicio en <15 min; cero pérdida de datos transaccionales",
    tags: ["#BugFix", "#P0", "#Concurrencia", "#HighAvailability"],
  },
  {
    name: "Decisión de Arquitectura",
    category: "Architecture 🏗️",
    title: "Transición a arquitectura orientada a eventos desacoplada",
    description: "Diseño de patrón orquestador / saga con garantías de idempotencia para sustituir llamadas síncronas bloqueantes.",
    impact: "Reducción de latencia p99 en 80% y desacoplamiento de 4 microservicios",
    tags: ["#Architecture", "#EventDriven", "#Microservices", "#Escalabilidad"],
  },
  {
    name: "Optimización de Rendimiento",
    category: "Refactor 🧹",
    title: "Optimización de consultas de base de datos y estrategia de caché multinivel",
    description: "Creación de índices compuestos, optimización de queries complejas y cacheo en Redis con invalidación reactiva.",
    impact: "Disminución del tiempo de respuesta de 2.4s a 110ms y -40% de carga en CPU",
    tags: ["#Performance", "#Redis", "#Database", "#Latency"],
  },
  {
    name: "Infraestructura & CI/CD",
    category: "Infra/DevOps 🚀",
    title: "Automatización de pipeline de despliegue continuo con pruebas canarias",
    description: "Implementación de pipelines paralelos en GitHub Actions y verificación automatizada de salud.",
    impact: "Reducción del tiempo de build de 25 min a 4 min; despliegues sin interrupción",
    tags: ["#DevOps", "#CICD", "#Docker", "#Automatizacion"],
  },
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingLogs,
  initialData,
  initialExperienceId,
  initialBulletText,
}) => {
  // Primary focused fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");

  // Progressive Disclosure states - ALWAYS START COLLAPSED
  const [isImpactVisible, setIsImpactVisible] = useState(false);
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Secondary metadata fields
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [experienceId, setExperienceId] = useState<string>("");
  const [isCreatingNewExp, setIsCreatingNewExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpRole, setNewExpRole] = useState("");
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [category, setCategory] = useState<LogCategory>("Feature ✨");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false); // Default: Sandbox Privado
  const [experiencesList, setExperiencesList] = useState<any[]>([]);

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const templatesDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-complete suggestion lists
  const existingProjects = Array.from(new Set(existingLogs.map((l) => l.project))).filter(Boolean);

  // Close templates dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesDropdownRef.current && 
        !templatesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplatesOpen(false);
      }
    };

    if (isTemplatesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTemplatesOpen]);

  // Initialize or reset form - ALWAYS START WITH ACCORDIONS COLLAPSED
  useEffect(() => {
    if (!isOpen) return;

    // Both accordions ALWAYS arrive collapsed
    setIsImpactVisible(false);
    setIsContextVisible(false);
    setIsTemplatesOpen(false);

    import("../utils/storage").then(({ getStoredExperiences }) => {
      const exps = getStoredExperiences();
      setExperiencesList(exps);

      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setImpact(initialData.impact);

        setDate(initialData.date);
        setExperienceId(initialData.experienceId || exps[0]?.id || "exp-personal");
        setClient(initialData.client);
        setProject(initialData.project);
        setCategory(initialData.category);
        setTags(initialData.tags || []);
        setIsPublic(initialData.isPublic);
      } else {
        const targetExp = initialExperienceId 
          ? exps.find((e) => e.id === initialExperienceId) 
          : null;
        const defaultExp = targetExp || exps[0] || { id: "exp-personal", company: "Proyectos Personales & Consultoría Independiente" };
        
        setDate(new Date().toISOString().substring(0, 10));
        setExperienceId(defaultExp.id);
        setClient(defaultExp.company);
        setProject(existingProjects[0] || "Producción");
        setCategory("Feature ✨");

        if (initialBulletText) {
          const cleanText = initialBulletText.trim();
          setTitle(cleanText.length > 95 ? cleanText.substring(0, 92) + "..." : cleanText);
          setDescription(cleanText);
          setImpact("Entregado con éxito y métricas verificables en producción");
          const techTags = defaultExp.technologies && defaultExp.technologies.length > 0 
            ? defaultExp.technologies.slice(0, 4).map((t: string) => t.startsWith("#") ? t : `#${t.replace(/\s+/g, '')}`)
            : ["#Producción", "#Arquitectura"];
          setTags(techTags);
        } else {
          setTitle("");
          setDescription("");
          setImpact("");
          setTags(["#FullStack", "#TypeScript"]);
        }
        setIsPublic(false); // Sandbox by default
      }

      // Auto focus on title
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    });
  }, [initialData, isOpen, initialExperienceId, initialBulletText]);

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setTitle((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  };

  const applyPreset = (preset: PresetTemplate) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setDescription(preset.description);
    setImpact(preset.impact);
    setTags(preset.tags);
    setIsTemplatesOpen(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const formatted = tagInput.trim().startsWith("#") ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!tags.includes(formatted)) {
        setTags([...tags, formatted]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const finalImpact = impact.trim() || "Completado y verificado en entorno de producción";

    let targetExpId = experienceId;
    let targetClient = client;

    if (isCreatingNewExp && newExpCompany.trim()) {
      const { addExperience } = await import("../utils/storage");
      const createdExp = addExperience({
        company: newExpCompany.trim(),
        role: newExpRole.trim() || "Ingeniero",
        startDate: new Date().getFullYear().toString(),
        isCurrent: true,
        summary: "Experiencia registrada para asignación de logros.",
        isPersonalProjects: false,
      });
      targetExpId = createdExp.id;
      targetClient = createdExp.company;
    }

    onSave({
      date,
      experienceId: targetExpId,
      client: targetClient.trim() || "Empresa",
      project: project.trim() || "General",
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      impact: finalImpact,
      tags,
      isPublic,
    });
    onClose();
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to quickly submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  // Selected company label for preview chip
  const currentExpObj = experiencesList.find((exp) => exp.id === experienceId);
  const companyLabel = isCreatingNewExp 
    ? (newExpCompany || "Nueva Empresa") 
    : (currentExpObj?.company || client || "Personal");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="w-full max-w-2xl bg-[#0B0F19] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                {initialData ? "Editar Logro Técnico" : "Captura Rápida de Log"}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/40 text-cyan-300">
                  Fricción Cero
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Sandbox / Privacy Bar at the top (Sutil, no invasivo) */}
        <div className="px-6 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-md shrink-0 ${isPublic ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-800/80 text-slate-400 border border-slate-700/60"}`}>
              {isPublic ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className={`text-xs font-semibold ${isPublic ? "text-emerald-300" : "text-slate-200"}`}>
                {isPublic ? "Visible en Public Deck" : "Sandbox Privado (Confidencial)"}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                — {isPublic ? "Visible para reclutadores y exportaciones públicas" : "Solo tú puedes verlo; ideal para notas crudas y confidencialidad"}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0" title={isPublic ? "Cambiar a Sandbox Privado" : "Hacer Visible en Public Deck"}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Form Body - Maximum room for Title & Description */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. TÍTULO DEL LOG + ACCIONES (DICTAR Y USAR PLANTILLAS) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Título del Log (Qué se hizo) *
              </label>

              <div className="flex items-center gap-2">
                {/* Speech to text */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                      isListening
                        ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                        : "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                    }`}
                    title="Dictar título con voz"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3" />
                        <span>Detener</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Dictar</span>
                      </>
                    )}
                  </button>
                )}

                {/* Templates Dropdown Trigger */}
                <div className="relative" ref={templatesDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                    className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all"
                  >
                    <Zap className="w-3 h-3 fill-amber-300" />
                    <span>Usar Plantilla</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isTemplatesOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isTemplatesOpen && (
                    <div className="absolute right-0 mt-1.5 w-64 bg-[#0F1422] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        Selecciona un formato guía:
                      </div>
                      {PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2 font-mono">{p.category.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Reemplazo de arquitectura síncrona por pipelines asíncronos con Kafka"
              required
              className="w-full bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner"
            />
          </div>

          {/* 2. PASOS TÉCNICOS / DETALLES (MÁS ALTO - rows={6}, min-h-[145px]) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Pasos Técnicos / Detalles (Opcional)
              </label>
              <span className="text-[11px] text-slate-500">
                Arquitectura, librerías, refactor o problemas resueltos
              </span>
            </div>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe cómo lo resolviste: decisiones de arquitectura, patrones de diseño (ej. Saga, CQRS), optimizaciones de queries, índices creados o trampas de concurrencia superadas..."
              className="w-full bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all resize-y min-h-[145px] leading-relaxed"
            />
          </div>

          {/* 3. IMPACTO MEDIBLE (ACORDEÓN - LLEGA COLAPSADO POR DEFECTO) */}
          <div>
            {!isImpactVisible ? (
              <button
                type="button"
                onClick={() => setIsImpactVisible(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-950/20 text-emerald-400 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-emerald-500/40 underline-offset-4 group-hover:decoration-emerald-400">
                    {impact ? `⚡ Impacto: "${impact.slice(0, 50)}${impact.length > 50 ? '...' : ''}"` : "+ Agregar Impacto Medible / Resultado Cuantitativo (Fórmula XYZ)"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-500/70 group-hover:text-emerald-300">
                  {impact ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-cyan-950/20 border border-emerald-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Impacto Medible / Resultado Cuantitativo *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsImpactVisible(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <input
                  type="text"
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="ej. Reducción de latencia p99 en 85% (de 2.4s a 180ms) y cero caídas en tráfico pico"
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all"
                />
                <p className="text-[11px] text-slate-400">
                  <span className="text-emerald-300 font-semibold">Fórmula XYZ de Google:</span> Logró [X] medido por [Y] haciendo [Z]. Expresa el resultado en %, tiempo o volumen.
                </p>
              </div>
            )}
          </div>

          {/* 4. CONFIGURACIÓN DE CONTEXTO (ACORDEÓN - LLEGA COLAPSADO POR DEFECTO) */}
          <div>
            {!isContextVisible ? (
              <button
                type="button"
                onClick={() => setIsContextVisible(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/40 text-slate-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 overflow-hidden text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  <span className="font-medium underline decoration-slate-600 underline-offset-4 group-hover:decoration-slate-400">
                    Contexto y Opciones Secundarias
                  </span>
                  {/* Scannable live preview pills */}
                  <div className="hidden sm:flex items-center gap-1.5 ml-2 truncate">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                      🏢 {companyLabel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                      {category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                      📅 {date}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-white shrink-0 ml-2">
                  Ajustar ▾
                </span>
              </button>
            ) : (
              <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/60 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Contexto y Configuración Secundaria
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsContextVisible(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>

                {/* Row: Date, Experience, Project */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Fecha */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      Fecha del Hito
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Empresa / Experiencia */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-cyan-400" />
                        Empresa Asignada
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewExp(!isCreatingNewExp)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                      >
                        {isCreatingNewExp ? "← Existente" : "+ Nueva"}
                      </button>
                    </div>

                    {isCreatingNewExp ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={newExpCompany}
                          onChange={(e) => {
                            setNewExpCompany(e.target.value);
                            setClient(e.target.value);
                          }}
                          placeholder="Empresa (ej. Stripe)"
                          className="w-full bg-slate-900 border border-cyan-500/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        <input
                          type="text"
                          value={newExpRole}
                          onChange={(e) => setNewExpRole(e.target.value)}
                          placeholder="Cargo (ej. Senior Backend)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <select
                        value={experienceId}
                        onChange={(e) => {
                          setExperienceId(e.target.value);
                          const selected = experiencesList.find((exp) => exp.id === e.target.value);
                          if (selected) {
                            setClient(selected.company);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        {experiencesList.map((exp) => (
                          <option key={exp.id} value={exp.id}>
                            {exp.company} {exp.role ? `— ${exp.role}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Proyecto / Módulo */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <FolderGit2 className="w-3 h-3 text-cyan-400" />
                      Proyecto / Módulo
                    </label>
                    <input
                      type="text"
                      list="project-suggestions"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="ej. Core Submissions"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <datalist id="project-suggestions">
                      {existingProjects.map((p) => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Categoría Técnica */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Categoría Técnica
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-2.5 py-1.5 text-xs rounded-lg border text-left flex items-center justify-between transition-all ${
                          category === cat
                            ? "bg-cyan-500/15 border-cyan-500/80 text-cyan-300 font-semibold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span>{cat}</span>
                        {category === cat && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    Etiquetas Técnicas (Presiona Enter o coma para añadir)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-lg min-h-[38px]">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 font-mono"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="hover:text-red-400 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={tags.length === 0 ? "ej. #Kafka, #Go, #PostgreSQL..." : "Añadir..."}
                      className="bg-transparent text-xs text-slate-200 focus:outline-none min-w-[100px] flex-1 px-1"
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">Ctrl / ⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">Enter</kbd> para guardar rápido
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-sm shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                {initialData ? "Actualizar Log" : "Guardar Log"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
