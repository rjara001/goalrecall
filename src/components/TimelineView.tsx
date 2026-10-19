import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Lock, 
  Trash2, 
  Edit3, 
  Copy, 
  Zap, 
  Building, 
  FolderGit2, 
  Tag as TagIcon, 
  Plus, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Globe,
  FileUp,
  ClipboardList,
  Mic,
  ArrowRight,
  Layers,
  MapPin,
  Briefcase,
  ChevronRight,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { FilterState, LogCategory, LogEntry, WorkExperience } from "../types";

interface TimelineViewProps {
  logs: LogEntry[];
  experiences: WorkExperience[];
  onTogglePublic: (id: string) => void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  onDuplicateLog: (entry: LogEntry) => void;
  onOpenQuickLog: () => void;
  onOpenPasteBullets: () => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: WorkExperience) => void;
  onDeleteExperience: (id: string) => void;
  onAddLogToExperience: (experienceId: string) => void;
}

const CATEGORIES: ("Todas" | LogCategory)[] = [
  "Todas",
  "Feature ✨",
  "Fix 🐛",
  "Refactor 🧹",
  "Architecture 🏗️",
  "Infra/DevOps 🚀",
  "Spike/R&D 🔬",
];

export const TimelineView: React.FC<TimelineViewProps> = ({
  logs,
  experiences,
  onTogglePublic,
  onEditLog,
  onDeleteLog,
  onDuplicateLog,
  onOpenQuickLog,
  onOpenPasteBullets,
  onOpenCvUpload,
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
  onAddLogToExperience,
}) => {
  // View mode: 'by_experience' (Dual Model container view) or 'chronological' (stream)
  const [viewMode, setViewMode] = useState<"by_experience" | "chronological">("by_experience");
  
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<"Todas" | LogCategory>("Todas");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState<"all" | "public_only" | "private_only">("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");

  // Extract unique filters
  const clients = useMemo(() => Array.from(new Set(logs.map((l) => l.client))).filter(Boolean), [logs]);
  const allTags = useMemo(() => Array.from(new Set(logs.flatMap((l) => l.tags))).filter(Boolean), [logs]);

  // Filtered entries
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
      // Search text
      if (search) {
        const query = search.toLowerCase();
        const matches =
          log.title.toLowerCase().includes(query) ||
          log.impact.toLowerCase().includes(query) ||
          (log.description && log.description.toLowerCase().includes(query)) ||
          log.client.toLowerCase().includes(query) ||
          log.project.toLowerCase().includes(query) ||
          log.tags.some((t) => t.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Client filter
      if (selectedClient !== "all" && log.client !== selectedClient) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "Todas" && log.category !== selectedCategory) {
        return false;
      }

      // Tag filter
      if (selectedTag !== "all" && !log.tags.includes(selectedTag)) {
        return false;
      }

      // Visibility filter
      if (selectedVisibility === "public_only" && !log.isPublic) return false;
      if (selectedVisibility === "private_only" && log.isPublic) return false;

      // Date range filter
      if (dateRange !== "all") {
        const logTime = new Date(log.date).getTime();
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        if (now - logTime > days * 86400000) return false;
      }

      return true;
    });
  }, [logs, search, selectedClient, selectedCategory, selectedTag, selectedVisibility, dateRange]);

  // Group logs chronologically by Month/Year
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: LogEntry[] } = {};
    filteredLogs.forEach((log) => {
      const d = new Date(log.date);
      const key = isNaN(d.getTime()) 
        ? "Registros Sin Fecha" 
        : d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
      if (!groups[capitalized]) groups[capitalized] = [];
      groups[capitalized].push(log);
    });
    return groups;
  }, [filteredLogs]);

  // Group logs by Experience Container
  const experienceGroups = useMemo(() => {
    const result: { experience: WorkExperience; logs: LogEntry[] }[] = [];
    const assignedLogIds = new Set<string>();

    experiences.forEach((exp) => {
      // Find logs matching either direct experienceId OR matching client name
      const matched = filteredLogs.filter(
        (l) => l.experienceId === exp.id || (!l.experienceId && l.client.trim().toLowerCase() === exp.company.trim().toLowerCase())
      );
      matched.forEach((l) => assignedLogIds.add(l.id));
      result.push({
        experience: exp,
        logs: matched,
      });
    });

    // Unassigned logs
    const unassigned = filteredLogs.filter((l) => !assignedLogIds.has(l.id));

    return { result, unassigned };
  }, [experiences, filteredLogs]);

  const totalPublicCount = logs.filter((l) => l.isPublic).length;
  const totalPrivateCount = logs.filter((l) => !l.isPublic).length;

  return (
    <div className="space-y-6">
      
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 border border-cyan-900/40 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              Empresas / Proyectos
            </p>
          </div>
          <p className="text-2xl font-bold text-cyan-300 font-mono tabular-nums mt-1">{experiences.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">Contenedores raíz</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Total de Logros
          </p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums mt-1">{logs.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">Impactos medibles</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Sandbox Privado
          </p>
          <p className="text-2xl font-bold text-slate-300 font-mono tabular-nums mt-1">{totalPrivateCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Solo tú puedes verlos</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-emerald-950/60 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Public Deck
          </p>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{totalPublicCount}</p>
          <span className="text-[10px] text-emerald-500/70 font-mono">Visibles al reclutador</span>
        </div>
      </div>

      {/* Main Switcher: "Por Empresa / Experiencia" vs "Línea de Tiempo Cronológica" */}
      <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        
        {/* Segmented Control for Dual Model */}
        <div className="inline-flex p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("by_experience")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "by_experience"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Por Empresa / Experiencia</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              viewMode === "by_experience" ? "bg-slate-950/40 text-slate-900 font-bold" : "bg-slate-800 text-slate-400"
            }`}>
              {experiences.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("chronological")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "chronological"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Línea Cronológica</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              viewMode === "chronological" ? "bg-slate-950/40 text-slate-900 font-bold" : "bg-slate-800 text-slate-400"
            }`}>
              {logs.length}
            </span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          <button
            type="button"
            onClick={onAddExperience}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-cyan-800/60 hover:border-cyan-500 text-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Nueva Empresa / Proyecto</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickLog}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Registrar Logro</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenCvUpload}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-900/70 to-indigo-900/70 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/60 hover:border-purple-400 text-purple-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-purple-950/30 whitespace-nowrap active:scale-95"
            title="Importar desde CV (PDF o DOCX)"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-300" />
            <span>Importar CV</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por logro, tecnología, métrica, empresa o impacto..."
              className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas las Empresas</option>
              {experiences.map((exp) => (
                <option key={exp.id} value={exp.company}>{exp.company}</option>
              ))}
              {clients.filter((c) => !experiences.some((e) => e.company === c)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Visibility Filter */}
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as any)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Toda Visibilidad</option>
              <option value="private_only">Solo Sandbox (Privado)</option>
              <option value="public_only">Solo Public Deck (Público)</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Cualquier fecha</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-mono shrink-0">Tags:</span>
            {selectedTag !== "all" && (
              <button
                onClick={() => setSelectedTag("all")}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Limpiar tag ({selectedTag}) ×
              </button>
            )}
            {allTags.slice(0, 10).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? "all" : t)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors shrink-0 ${
                  selectedTag === t
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: POR EMPRESA / EXPERIENCIA (DUAL DATA MODEL CONTAINER VIEW)       */}
      {/* ========================================================================= */}
      {viewMode === "by_experience" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Explanation Banner */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Modelo Dual de Carrera:</strong> Las empresas y proyectos son contenedores que agrupan tus logros. Cualquier habilidad o impacto cuelga siempre de su empresa de origen para facilitar la autogeneración de versiones de CV.
              </span>
            </div>
            <button
              onClick={onAddExperience}
              className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-md shrink-0 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Empresa</span>
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="text-center py-12 px-6 border border-dashed border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-white">Comienza cargando tu Carrera</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Importa tu Currículum (PDF o DOCX) para autodetectar automáticamente tus empresas, proyectos y logros técnicos con métricas, o agrégalos manualmente.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenCvUpload}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all active:scale-95"
                >
                  <FileUp className="w-4 h-4 text-purple-200" />
                  <span>Importar desde CV (PDF / DOCX)</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPasteBullets}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Pegar Viñetas</span>
                </button>
                <button
                  type="button"
                  onClick={onAddExperience}
                  className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Empresa Manualmente</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {experienceGroups.result.map(({ experience: exp, logs: expLogs }) => (
                <div
                  key={exp.id}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all shadow-xl"
                >
                  {/* Company Container Header */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/40 border-b border-slate-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Company Info & Title */}
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          exp.isPersonalProjects
                            ? "bg-purple-950/40 border-purple-500/40 text-purple-400"
                            : "bg-cyan-950/40 border-cyan-500/40 text-cyan-400"
                        }`}>
                          {exp.isPersonalProjects ? (
                            <FolderGit2 className="w-5 h-5" />
                          ) : (
                            <Building className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                              {exp.company}
                            </h3>

                            {exp.isCurrent && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Actualmente aquí
                              </span>
                            )}

                            {exp.isPersonalProjects && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                Proyectos Personales / Consultoría
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                            <span className="text-slate-200 font-medium flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                              {exp.role}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="font-mono text-slate-300 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {exp.startDate} — {exp.isCurrent ? "Presente" : (exp.endDate || "Presente")}
                            </span>
                            {exp.location && (
                              <>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {exp.location}
                                </span>
                              </>
                            )}
                          </div>

                          {exp.summary && (
                            <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
                              {exp.summary}
                            </p>
                          )}

                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                              {exp.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Container Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => onAddLogToExperience(exp.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>+ Logro</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditExperience(exp)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
                          title="Editar empresa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {!exp.isPersonalProjects && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar la empresa "${exp.company}"? Los logros se moverán a Proyectos Personales.`)) {
                                onDeleteExperience(exp.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 rounded-lg transition-colors"
                            title="Eliminar empresa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Achievements List */}
                  <div className="p-4 sm:p-5 space-y-3 bg-[#080C14]/40">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
                      <span className="font-semibold text-slate-300 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        Logros vinculados a {exp.company} ({expLogs.length})
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {expLogs.filter((l) => l.isPublic).length} públicos · {expLogs.filter((l) => !l.isPublic).length} privados
                      </span>
                    </div>

                    {expLogs.length === 0 ? (
                      <div className="p-6 border border-dashed border-slate-800/90 rounded-xl bg-slate-900/30 text-center">
                        <p className="text-xs text-slate-400 mb-2">
                          Aún no has registrado logros o impactos en <strong className="text-slate-300">{exp.company}</strong>.
                        </p>
                        <button
                          type="button"
                          onClick={() => onAddLogToExperience(exp.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Registrar primer logro en {exp.company}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {expLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all group"
                          >
                            {/* Card Top Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                              <div className="flex items-center gap-2 text-slate-400 font-medium">
                                <span className="text-slate-200 font-semibold">{log.project}</span>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="font-mono text-slate-400">{log.date}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
                                  {log.category}
                                </span>

                                {log.isPublic ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                                    <Eye className="w-3 h-3" />
                                    Público
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
                                    <Lock className="w-3 h-3" />
                                    Sandbox
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Headline Title */}
                            <h4 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
                              {log.title}
                            </h4>

                            {/* Impact Metric Highlight */}
                            <div className="p-2.5 bg-slate-950/80 border border-emerald-950/60 rounded-lg mb-2 flex items-start gap-2">
                              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                                  Impacto Cuantificable
                                </span>
                                <p className="text-xs text-emerald-200 font-mono font-medium leading-relaxed">
                                  {log.impact}
                                </p>
                              </div>
                            </div>

                            {/* Technical Description (if any) */}
                            {log.description && (
                              <p className="text-xs text-slate-300/90 leading-relaxed mb-2.5">
                                {log.description}
                              </p>
                            )}

                            {/* Tags List */}
                            {log.tags && log.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                {log.tags.map((t) => (
                                  <span
                                    key={t}
                                    onClick={() => setSelectedTag(t)}
                                    className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/30 border border-cyan-800/30 px-2 py-0.5 rounded hover:border-cyan-500 cursor-pointer transition-colors"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Card Actions Footer */}
                            <div className="pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                              <button
                                onClick={() => onTogglePublic(log.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                  log.isPublic
                                    ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                                }`}
                              >
                                {log.isPublic ? (
                                  <>
                                    <EyeOff className="w-3 h-3 text-emerald-400" />
                                    <span>Público · Despublicar</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 text-cyan-400" />
                                    <span>Publicar en Public Deck</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-1 text-slate-400">
                                <button
                                  onClick={() => onDuplicateLog(log)}
                                  title="Duplicar entrada"
                                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onEditLog(log)}
                                  title="Editar logro"
                                  className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteLog(log.id)}
                                  title="Eliminar logro"
                                  className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Unassigned achievements section (if any) */}
              {experienceGroups.unassigned.length > 0 && (
                <div className="p-5 bg-amber-950/20 border border-amber-800/40 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <TagIcon className="w-4 h-4" />
                      <span>Logros sin contenedor asignado ({experienceGroups.unassigned.length})</span>
                    </div>
                    <span className="text-xs text-amber-400/80">
                      Te sugerimos asignarlos a una de tus empresas o a Proyectos Personales
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {experienceGroups.unassigned.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{log.title}</p>
                          <p className="text-slate-400 text-[11px] font-mono">
                            {log.client} · {log.project} · {log.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditLog(log)}
                            className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md hover:bg-cyan-900/50"
                          >
                            Asignar Empresa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: LÍNEA CRONOLÓGICA (STREAM)                                       */}
      {/* ========================================================================= */}
      {viewMode === "chronological" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {logs.length === 0 ? (
            /* ZERO STATE: High Impact Ingestion Hub */
            <div className="space-y-6">
              {/* Welcome Ingestion Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-[#0D1322] to-slate-900/60 border border-slate-700/80 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 font-mono text-[11px] mb-3">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>BITÁCORA LISTA · INGESTA DE LOGROS</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Empieza tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Brag Document</span> desde Cero
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Selecciona la forma en que prefieres cargar tus victorias técnicas. Todo se almacena localmente en tu <strong>Sandbox Privado 🔒</strong> con cifrado en tu navegador.
                  </p>
                </div>
              </div>

              {/* 3 Ingestion Alternative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Alternativa 1: Usando el CV */}
                <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold">
                        1. Desde CV · Inteligente
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
                      Importar desde tu Currículum
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Sube tu archivo PDF o DOCX. El extractor aislará empresas, proyectos y métricas de impacto con fórmula Google XYZ.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={onOpenCvUpload}
                      className="w-full py-2.5 px-3 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/60 text-purple-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/30"
                    >
                      <FileUp className="w-3.5 h-3.5 text-purple-300" />
                      <span>Subir Archivo CV (PDF/DOCX)</span>
                    </button>
                  </div>
                </div>

                {/* Alternativa 2: Copiando y pegando viñetas */}
                <div className="p-5 bg-slate-900/70 border border-cyan-800/50 rounded-2xl flex flex-col justify-between hover:border-cyan-500/60 transition-all group relative shadow-lg shadow-cyan-950/20">
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold">
                      2. Lote · Inmediato
                    </span>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                      Pegar Viñetas en Bruto
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Copia y pega la lista de viñetas desde tu Notion, Jira, docs o portafolio. Se previsualizarán y crearán en un solo paso.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={onOpenPasteBullets}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Pegar Viñetas en Bruto</span>
                    </button>
                  </div>
                </div>

                {/* Alternativa 3: Manual */}
                <div className="p-5 bg-slate-900/70 border border-emerald-800/50 rounded-2xl flex flex-col justify-between hover:border-emerald-500/60 transition-all group">
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold">
                      3. Individual · Directo
                    </span>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                      Registro Manual / Voz
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Crea un logro con todos los detalles: empresa asociada, proyecto, métricas Google XYZ y dictado por voz (⌘K).
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={onOpenQuickLog}
                      className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-emerald-700/50 text-emerald-300 hover:text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Manualmente (+ Nuevo Log)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No se encontraron registros</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                No hay logros que coincidan con los filtros seleccionados.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedClient("all");
                  setSelectedCategory("Todas");
                  setSelectedTag("all");
                  setSelectedVisibility("all");
                  setDateRange("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByMonth).map(([monthLabel, entries]) => (
                <div key={monthLabel} className="space-y-3">
                  {/* Month Header */}
                  <div className="flex items-center gap-3 sticky top-[68px] z-20 bg-[#080C14]/95 py-2 backdrop-blur-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      {monthLabel}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">· {entries.length} logros</span>
                    <div className="h-[1px] bg-slate-800 flex-1" />
                  </div>

                  {/* Entries in this month */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {entries.map((log) => (
                      <div
                        key={log.id}
                        className="p-5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all group"
                      >
                        {/* Top Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-400 font-medium">
                            <span className="text-cyan-300 font-semibold flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-cyan-400" />
                              {log.client}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-slate-300">{log.project}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="font-mono text-slate-400">{log.date}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
                              {log.category}
                            </span>

                            {log.isPublic ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                                <Eye className="w-3 h-3" />
                                Público
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3" />
                                Sandbox
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Headline Title */}
                        <h4 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
                          {log.title}
                        </h4>

                        {/* Impact Metric Highlight */}
                        <div className="p-3 bg-slate-950/70 border border-emerald-950/60 rounded-lg mb-2.5 flex items-start gap-2.5">
                          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-500 font-bold block mb-0.5">
                              Impacto Medible
                            </span>
                            <p className="text-xs sm:text-sm text-emerald-200 font-mono font-medium leading-relaxed">
                              {log.impact}
                            </p>
                          </div>
                        </div>

                        {/* Technical Description (if any) */}
                        {log.description && (
                          <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                            {log.description}
                          </p>
                        )}

                        {/* Tags List */}
                        {log.tags && log.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            {log.tags.map((t) => (
                              <span
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/30 border border-cyan-800/30 px-2 py-0.5 rounded hover:border-cyan-500 cursor-pointer transition-colors"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Actions Footer */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          <button
                            onClick={() => onTogglePublic(log.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              log.isPublic
                                ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                            }`}
                          >
                            {log.isPublic ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                                <span>En Vitrina Pública · Despublicar</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Publicar en Public Deck</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1 text-slate-400">
                            <button
                              onClick={() => onDuplicateLog(log)}
                              title="Duplicar entrada"
                              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditLog(log)}
                              title="Editar logro"
                              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteLog(log.id)}
                              title="Eliminar de bitácora"
                              className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
