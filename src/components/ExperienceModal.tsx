import React, { useState, useEffect } from "react";
import { 
  X, 
  Building, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Layers, 
  Sparkles, 
  Tag, 
  Check, 
  AlertCircle,
  FolderGit2
} from "lucide-react";
import { WorkExperience } from "../types";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  initialData?: WorkExperience | null;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [isPersonalProjects, setIsPersonalProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCompany(initialData.company || "");
      setRole(initialData.role || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setIsCurrent(initialData.isCurrent || false);
      setLocation(initialData.location || "");
      setSummary(initialData.summary || "");
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
      setTechnologies(["TypeScript", "React", "Node.js"]);
      setIsPersonalProjects(false);
    }
    setError(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setError("Por favor ingresa el nombre de la empresa o proyecto.");
      return;
    }
    if (!role.trim()) {
      setError("Por favor especifica el rol o cargo desempeñado.");
      return;
    }

    onSave({
      id: initialData?.id,
      company: company.trim(),
      role: role.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? "" : endDate.trim(),
      isCurrent,
      location: location.trim(),
      summary: summary.trim(),
      bullets: initialData?.bullets || [],
      technologies,
      isPersonalProjects,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              {isPersonalProjects ? <FolderGit2 className="w-4 h-4" /> : <Building className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? "Editar Empresa / Contenedor" : "Nueva Empresa / Experiencia"}
              </h2>
              <p className="text-xs text-slate-400">
                Los logros, victorias y viñetas técnicas colgarán jerárquicamente de esta entidad
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-lg flex items-center gap-2 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Company vs Personal Projects */}
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-200">Tipo de Entidad Contenedora</p>
              <p className="text-[11px] text-slate-400">
                {isPersonalProjects 
                  ? "Contenedor de proyectos propios, consultoría independiente o experimentos" 
                  : "Empresa u organización formal de tu trayectoria profesional"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !isPersonalProjects;
                setIsPersonalProjects(nextVal);
                if (nextVal && !company) {
                  setCompany("Proyectos Personales & Consultoría");
                  setRole("Ingeniero & Creador Independiente");
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors flex items-center gap-1.5 ${
                isPersonalProjects
                  ? "bg-purple-950/60 border-purple-600/60 text-purple-200"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              {isPersonalProjects ? <FolderGit2 className="w-3.5 h-3.5 text-purple-400" /> : <Building className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isPersonalProjects ? "Proyecto Personal" : "Empresa Formal"}</span>
            </button>
          </div>

          {/* Company Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {isPersonalProjects ? "Nombre del Proyecto / Iniciativa" : "Nombre de la Empresa"} *
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={isPersonalProjects ? "ej. OpenSource Tools / SaaS" : "ej. Mercado Libre, Stripe, Amazon"}
                  className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Rol / Cargo Técnico *
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="ej. Staff Systems Engineer / Lead Developer"
                  className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Fecha Inicio
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="ej. 2022 o 2022-03"
                  className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Fecha Fin
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  disabled={isCurrent}
                  value={isCurrent ? "Actualidad" : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder={isCurrent ? "Actualidad" : "ej. 2024 o 2024-06"}
                  className={`w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs ${
                    isCurrent ? "opacity-60 cursor-not-allowed bg-slate-900" : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ubicación / Modalidad
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ej. Remoto / Santiago, Chile"
                  className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Current Job Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCurrentCheckbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-[#080C14]"
            />
            <label htmlFor="isCurrentCheckbox" className="text-slate-300 text-xs font-medium cursor-pointer">
              Actualmente desempeño este rol / empresa activa
            </label>
          </div>

          {/* Summary / Mission of the Role */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Misión & Contexto General del Rol
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Breve resumen de la misión del equipo, alcance arquitectónico o responsabilidad principal..."
              className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Stack Tecnológico Principal
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  placeholder="Escribe una tecnología (ej. Go, Kafka, Docker) y presiona Enter o Añadir"
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
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
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
              <span>{initialData ? "Guardar Cambios" : "Crear Empresa / Experiencia"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
