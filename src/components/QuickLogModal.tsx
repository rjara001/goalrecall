import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Tag, 
  Check, 
  ShieldAlert, 
  Eye, 
  Lock, 
  Calendar, 
  Building, 
  FolderGit2, 
  Zap, 
  Info,
  Clock
} from "lucide-react";
import { LogCategory, LogEntry, PresetTemplate } from "../types";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => void;
  existingLogs: LogEntry[];
  initialData?: LogEntry | null;
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
}) => {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [category, setCategory] = useState<LogCategory>("Feature ✨");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false); // Default to Sandbox Privado!

  // Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Auto-complete suggestion lists
  const existingClients = Array.from(new Set(existingLogs.map((l) => l.client))).filter(Boolean);
  const existingProjects = Array.from(new Set(existingLogs.map((l) => l.project))).filter(Boolean);

  // Initialize or reset form
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setClient(initialData.client);
      setProject(initialData.project);
      setCategory(initialData.category);
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setImpact(initialData.impact);
      setTags(initialData.tags || []);
      setIsPublic(initialData.isPublic);
    } else {
      setDate(new Date().toISOString().substring(0, 10));
      setClient(existingClients[0] || "ClientX");
      setProject(existingProjects[0] || "Core Revamp");
      setCategory("Feature ✨");
      setTitle("");
      setDescription("");
      setImpact("");
      setTags(["#FullStack", "#TypeScript"]);
      setIsPublic(false); // Sandbox by default
    }
  }, [initialData, isOpen]);

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
      recognition.lang = "es-ES"; // Default to Spanish; also handles English well

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          // If title is short, populate title, else append to description
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !impact.trim()) return;

    onSave({
      date,
      client: client.trim() || "Internal",
      project: project.trim() || "Core",
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      impact: impact.trim(),
      tags,
      isPublic,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? "Editar Registro de Log" : "Captura Rápida de Log (Frictionless)"}
              </h2>
              <p className="text-xs text-slate-400">
                Documenta tu victoria técnica con datos cuantitativos de impacto
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

        {/* Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
            Plantillas:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Metadata Row: Date, Client, Project */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                Cliente / Entidad
              </label>
              <input
                type="text"
                list="client-suggestions"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="ej. ClientX, Internal"
                required
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <datalist id="client-suggestions">
                {existingClients.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                Proyecto / Módulo
              </label>
              <input
                type="text"
                list="project-suggestions"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="ej. Checkout Revamp"
                required
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <datalist id="project-suggestions">
                {existingProjects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Categoría Técnica
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between transition-all ${
                    category === cat
                      ? "bg-cyan-500/10 border-cyan-500/80 text-cyan-300 font-semibold"
                      : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span>{cat}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Speech Recognition */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Título del Log (Qué se hizo) *
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    isListening
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Detener Voz</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dictar con Voz</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Migración de pasarela de pago a arquitectura de saga asíncrona"
              required
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Impact Metric (Crucial for XYZ & STAR) */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Impacto Medible / Resultado Cuantitativo *
            </label>
            <input
              type="text"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="ej. Reducción de latencia p99 de 3.2s a 240ms (-92%) y +14% de conversión"
              required
              className="w-full bg-slate-900/90 border border-emerald-500/40 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Vital para la fórmula XYZ de Google: <span className="font-mono text-slate-300">"Accomplished [X] as measured by [Y]..."</span>
            </p>
          </div>

          {/* Description (Technical steps) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pasos Técnicos / Detalles (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla decisiones de arquitectura, herramientas utilizadas, trampas evitadas o dificultades superadas..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Etiquetas Técnicas (Presiona Enter para añadir)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/90 border border-slate-700 rounded-lg min-h-[42px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-red-400"
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
                placeholder={tags.length === 0 ? "ej. #React, #PostgreSQL..." : "Añadir más..."}
                className="bg-transparent text-xs text-slate-200 focus:outline-none min-w-[120px] flex-1 px-1"
              />
            </div>
          </div>

          {/* Sandbox & Selective Publication Box */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-lg mt-0.5 ${isPublic ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                {isPublic ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {isPublic ? "Publicar en Public Deck (Visible)" : "Guardar en Sandbox Privado (Confidencial)"}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  {isPublic
                    ? "Esta entrada se expondrá en tu vitrina pública y el agente 'First Mate' podrá citarla ante reclutadores."
                    : "Por defecto es privada. Protege secretos comerciales y notas crudas. Podrás publicarla después con un clic."}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all"
            >
              {initialData ? "Actualizar Log" : "Guardar Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
