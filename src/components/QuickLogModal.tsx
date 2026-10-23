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
  SlidersHorizontal,
  Plus,
  Minus,
  Target,
  HelpCircle,
  Layers,
  FileText
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
    whatWasSought: "Garantizar consistencia transaccional y eliminar la degradación del servicio bajo alta concurrencia.",
    whyImportant: "El error provocaba bloqueos en pasarela transaccional con riesgo inminente de penalización económica y fuga de usuarios.",
    howApplied: "Implementación de cerrojo distribuido en Redis, reconciliación asíncrona de estado y validación con pruebas de carga k6.",
    description: "Identificación de condición de carrera bajo alta carga. Implementación de cerrojo distribuido y reconciliación de estado.",
    impact: "Recuperación de servicio en <15 min; cero pérdida de datos transaccionales",
    tags: ["#BugFix", "#P0", "#Concurrencia", "#HighAvailability"],
  },
  {
    name: "Decisión de Arquitectura",
    category: "Architecture 🏗️",
    title: "Transición a arquitectura orientada a eventos desacoplada",
    whatWasSought: "Desacoplar servicios centrales para permitir despliegues independientes y escalar el procesamiento sin bloqueos.",
    whyImportant: "Las llamadas síncronas bloqueantes generaban cascadas de fallos en servicios aguas abajo en horas de alto tráfico.",
    howApplied: "Diseño de patrón orquestador / saga con garantías de idempotencia y particionado de tópicos en bus de eventos.",
    description: "Diseño de patrón orquestador / saga con garantías de idempotencia para sustituir llamadas síncronas bloqueantes.",
    impact: "Reducción de latencia p99 en 80% y desacoplamiento de 4 microservicios",
    tags: ["#Architecture", "#EventDriven", "#Microservices", "#Escalabilidad"],
  },
  {
    name: "Optimización de Rendimiento",
    category: "Refactor 🧹",
    title: "Optimización de consultas de base de datos y estrategia de caché multinivel",
    whatWasSought: "Acelerar los tiempos de respuesta del dashboard para soportar analítica interactiva sin sobrecargar el cluster relacional.",
    whyImportant: "Los usuarios experimentaban timeouts de más de 5 segundos, degradando la adopción de la herramienta de reporte.",
    howApplied: "Reestructuración de consultas complejas, índices compuestos y caché reactiva L1/L2 con invalidación granular.",
    description: "Creación de índices compuestos, optimización de queries complejas y cacheo en Redis con invalidación reactiva.",
    impact: "Disminución del tiempo de respuesta de 2.4s a 110ms y -40% de carga en CPU",
    tags: ["#Performance", "#Redis", "#Database", "#Latency"],
  },
  {
    name: "Infraestructura & CI/CD",
    category: "Infra/DevOps 🚀",
    title: "Automatización de pipeline de despliegue continuo con pruebas canarias",
    whatWasSought: "Acelerar el ciclo de entrega de software de semanas a horas de forma segura y automatizada.",
    whyImportant: "Los despliegues manuales generaban errores humanos recurrentes y requerían ventanas nocturnas de mantenimiento.",
    howApplied: "Configuración de pipelines en CI/CD, contenedores Docker optimizados y pruebas canarias automatizadas.",
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
  // 1. Logro (multilínea): campo resumen, es la viñeta que aparecerá en el CV o que fue cargada
  const [title, setTitle] = useState("");

  // Acordeones estructurados con signo +:
  // 2. ¿Qué se buscaba lograr?
  const [whatWasSought, setWhatWasSought] = useState("");
  // 3. ¿Por qué era importante?
  const [whyImportant, setWhyImportant] = useState("");
  // 4. ¿Cómo se aplicó la solución?
  const [howApplied, setHowApplied] = useState("");
  // 5. El impacto (fórmula XYZ)
  const [impact, setImpact] = useState("");
  // 7. Detalle o Descripción (espacio amplio para explayarse en todo lo que se hizo)
  const [description, setDescription] = useState("");

  // Progressive Disclosure states - Cada elemento es un acordeón separado que inicia colapsado con signo +
  const [isWhatSoughtOpen, setIsWhatSoughtOpen] = useState(false);
  const [isWhyImportantOpen, setIsWhyImportantOpen] = useState(false);
  const [isHowAppliedOpen, setIsHowAppliedOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
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

  // Refs: title is now a multiline textarea
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
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

  // Initialize or reset form - TODOS LOS ACORDEONES INICIAN COLAPSADOS
  useEffect(() => {
    if (!isOpen) return;

    // Todos los acordeones independientes con signo + inician cerrados
    setIsWhatSoughtOpen(false);
    setIsWhyImportantOpen(false);
    setIsHowAppliedOpen(false);
    setIsImpactOpen(false);
    setIsDescriptionOpen(false);
    setIsContextVisible(false);
    setIsTemplatesOpen(false);

    import("../utils/storage").then(({ getStoredExperiences }) => {
      const exps = getStoredExperiences();
      setExperiencesList(exps);

      if (initialData) {
        setTitle(initialData.title);
        setWhatWasSought(initialData.whatWasSought || "");
        setWhyImportant(initialData.whyImportant || "");
        setHowApplied(initialData.howApplied || "");
        setImpact(initialData.impact || "");
        setDescription(initialData.description || "");

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
          // Logro (multilínea): preserva la viñeta completa sin truncar
          setTitle(cleanText);
          setDescription(cleanText);
          setWhatWasSought(`Entrega y despliegue de capacidades vinculadas a: ${cleanText.slice(0, 100)}`);
          setWhyImportant(`Alineado con los objetivos de ${defaultExp.company}.`);
          setHowApplied(defaultExp.technologies && defaultExp.technologies.length > 0 
            ? `Implementado con ${defaultExp.technologies.slice(0, 5).join(", ")}.` 
            : "");
          setImpact("Entregado con éxito y métricas verificables en producción");
          const techTags = defaultExp.technologies && defaultExp.technologies.length > 0 
            ? defaultExp.technologies.slice(0, 4).map((t: string) => t.startsWith("#") ? t : `#${t.replace(/\s+/g, '')}`)
            : ["#Producción", "#Arquitectura"];
          setTags(techTags);
        } else {
          setTitle("");
          setWhatWasSought("");
          setWhyImportant("");
          setHowApplied("");
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
    setWhatWasSought(preset.whatWasSought || "");
    setWhyImportant(preset.whyImportant || "");
    setHowApplied(preset.howApplied || "");
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
      whatWasSought: whatWasSought.trim() || undefined,
      whyImportant: whyImportant.trim() || undefined,
      howApplied: howApplied.trim() || undefined,
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
          
          {/* 1. LOGRO (MULTILÍNEA) - CAMPO RESUMEN / VIÑETA DE CV + DICTAR Y PLANTILLAS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Logro (Multilínea — Viñeta para CV) *
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
                    title="Dictar viñeta con voz"
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

            <textarea
              ref={titleInputRef}
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe la viñeta de logro completa tal como aparecerá en el CV o fue extraída..."
              required
              className="w-full bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner resize-y leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>💡 Campo resumen: es la viñeta principal de tu CV. Desglosa los detalles abajo con los acordeones (+).</span>
            </p>
          </div>

          {/* ACORDEONES ESTRUCTURADOS CON SIGNO + */}

          {/* 2. ¿QUÉ SE BUSCABA LOGRAR? (ACORDEÓN +) */}
          <div>
            {!isWhatSoughtOpen ? (
              <button
                type="button"
                onClick={() => setIsWhatSoughtOpen(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/20 text-indigo-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-indigo-500/40 underline-offset-4 group-hover:decoration-indigo-300 truncate">
                    {whatWasSought ? `🎯 Qué se buscaba lograr: "${whatWasSought.slice(0, 50)}${whatWasSought.length > 50 ? '...' : ''}"` : "+ ¿Qué se buscaba lograr?"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400/80 group-hover:text-indigo-200 shrink-0 ml-2">
                  {whatWasSought ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/30 via-slate-900/80 to-slate-900 border border-indigo-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    ¿Qué se buscaba lograr?
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsWhatSoughtOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={whatWasSought}
                  onChange={(e) => setWhatWasSought(e.target.value)}
                  placeholder="¿Cuál era el objetivo inicial, la meta de negocio o el requerimiento que dio origen a este trabajo? (ej. Desacoplar el checkout síncrono para soportar 15,000 rps en Black Friday)..."
                  className="w-full bg-slate-900 border border-indigo-500/60 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 transition-all resize-y leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Define el problema de negocio o requerimiento inicial que motivó esta iniciativa.
                </p>
              </div>
            )}
          </div>

          {/* 3. ¿POR QUÉ ERA IMPORTANTE? (ACORDEÓN +) */}
          <div>
            {!isWhyImportantOpen ? (
              <button
                type="button"
                onClick={() => setIsWhyImportantOpen(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/20 text-amber-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-amber-500/40 underline-offset-4 group-hover:decoration-amber-300 truncate">
                    {whyImportant ? `💡 Por qué era importante: "${whyImportant.slice(0, 50)}${whyImportant.length > 50 ? '...' : ''}"` : "+ ¿Por qué era importante?"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80 group-hover:text-amber-200 shrink-0 ml-2">
                  {whyImportant ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900 border border-amber-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    ¿Por qué era importante?
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsWhyImportantOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={whyImportant}
                  onChange={(e) => setWhyImportant(e.target.value)}
                  placeholder="¿Por qué era crítico resolverlo? (Dolor del cliente, riesgo mitigado, coste de inacción o impacto estratégico para la empresa)..."
                  className="w-full bg-slate-900 border border-amber-500/60 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all resize-y leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Explica el riesgo o valor de negocio en juego si esto no se hubiera implementado.
                </p>
              </div>
            )}
          </div>

          {/* 4. ¿CÓMO SE APLICÓ LA SOLUCIÓN? (ACORDEÓN +) */}
          <div>
            {!isHowAppliedOpen ? (
              <button
                type="button"
                onClick={() => setIsHowAppliedOpen(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-cyan-500/40 underline-offset-4 group-hover:decoration-cyan-300 truncate">
                    {howApplied ? `🛠️ Cómo se aplicó: "${howApplied.slice(0, 50)}${howApplied.length > 50 ? '...' : ''}"` : "+ ¿Cómo se aplicó la solución?"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                  {howApplied ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-slate-900 border border-cyan-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    ¿Cómo se aplicó la solución?
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHowAppliedOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={howApplied}
                  onChange={(e) => setHowApplied(e.target.value)}
                  placeholder="Estrategia técnica aplicada: arquitectura, patrones de diseño (CQRS, Saga), herramientas, bibliotecas y decisiones de diseño..."
                  className="w-full bg-slate-900 border border-cyan-500/60 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all resize-y leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Resume el método técnico y las herramientas empleadas para construir la solución.
                </p>
              </div>
            )}
          </div>

          {/* 5. EL IMPACTO (ACORDEÓN +) */}
          <div>
            {!isImpactOpen ? (
              <button
                type="button"
                onClick={() => setIsImpactOpen(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-950/20 text-emerald-400 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-emerald-500/40 underline-offset-4 group-hover:decoration-emerald-400 truncate">
                    {impact ? `⚡ El impacto: "${impact.slice(0, 50)}${impact.length > 50 ? '...' : ''}"` : "+ El impacto (Resultado medible / Fórmula XYZ)"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-500/70 group-hover:text-emerald-300 shrink-0 ml-2">
                  {impact ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-cyan-950/20 border border-emerald-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    El impacto (Resultado medible / Fórmula XYZ) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsImpactOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="ej. Reducción de latencia p99 en 85% (de 2.4s a 180ms) y despliegue exitoso para 10,000+ firmas sin fallos"
                  className="w-full bg-slate-900 border border-emerald-500/60 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all resize-y leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  <span className="text-emerald-300 font-semibold">Fórmula XYZ de Google:</span> Logró [X] medido por [Y] haciendo [Z]. Expresa el resultado en %, tiempo o volumen.
                </p>
              </div>
            )}
          </div>

          {/* 7. DETALLE O DESCRIPCIÓN (ACORDEÓN +) - ESPACIO DONDE PODEMOS EXPLAYARNOS */}
          <div>
            {!isDescriptionOpen ? (
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(true)}
                className="w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/20 text-purple-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <Plus className="w-3.5 h-3.5 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold underline decoration-purple-500/40 underline-offset-4 group-hover:decoration-purple-300 truncate">
                    {description ? `📝 Detalle o Descripción: "${description.slice(0, 50)}${description.length > 50 ? '...' : ''}"` : "+ Detalle o Descripción (Espacio amplio para explayarse)"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-purple-400/80 group-hover:text-purple-200 shrink-0 ml-2">
                  {description ? "Editar" : "Explayarse"} ▾
                </span>
              </button>
            ) : (
              <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-slate-900 border border-purple-500/50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Detalle o Descripción (Espacio para explayarse en profundidad)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDescriptionOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Aquí podemos explayarnos: pon todo el detalle técnico de lo que se hizo con respecto a este logro. Decisiones de arquitectura, patrones de diseño, optimizaciones de queries, índices creados, trampas de concurrencia superadas, fragmentos conceptuales o lecciones clave..."
                  className="w-full bg-slate-900/90 border border-purple-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-all resize-y min-h-[145px] leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Espacio amplio y sin límites para conservar todo el trasfondo técnico para entrevistas, revisiones de arquitectura o recuerdos de diseño.
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
