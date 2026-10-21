import React, { useState, useMemo } from "react";
import { 
  Search, 
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
  MapPin,
  Briefcase,
  ArrowRight,
  Layers,
  Award
} from "lucide-react";
import { LogCategory, LogEntry, WorkExperience } from "../types";

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
  onExtractBulletToLog?: (
    experienceId: string,
    company: string,
    role: string,
    bullet: string,
    technologies?: string[]
  ) => void;
  onExtractAllBulletsForExperience?: (experienceId: string) => void;
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
  onExtractBulletToLog,
  onExtractAllBulletsForExperience,
}) => {
  // Main view mode: 'by_experience' (Empresa / Experiencia) | 'achievements' (Logros)
  const [viewMode, setViewMode] = useState<"by_experience" | "achievements">("by_experience");
  
  // Filters for the Logros tab
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<"Todas" | LogCategory>("Todas");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState<"all" | "public_only" | "private_only">("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");

  // Filter lists
  const clients = useMemo(() => Array.from(new Set(logs.map((l) => l.client))).filter(Boolean), [logs]);
  const allTags = useMemo(() => Array.from(new Set(logs.flatMap((l) => l.tags))).filter(Boolean), [logs]);

  // Total bullets across all experiences
  const totalBulletsCount = useMemo(() => {
    return experiences.reduce((acc, exp) => acc + (exp.bullets?.length || 0), 0);
  }, [experiences]);

  // Set of all extracted bullet texts (normalized) for quick matching
  const extractedBulletSet = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.originalBullet) set.add(l.originalBullet.trim().toLowerCase());
      if (l.impact) set.add(l.impact.trim().toLowerCase());
    });
    return set;
  }, [logs]);

  // Filtered achievements
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter((log) => {
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

      if (selectedClient !== "all" && log.client !== selectedClient) {
        return false;
      }

      if (selectedCategory !== "Todas" && log.category !== selectedCategory) {
        return false;
      }

      if (selectedTag !== "all" && !log.tags.includes(selectedTag)) {
        return false;
      }

      if (selectedVisibility === "public_only" && !log.isPublic) return false;
      if (selectedVisibility === "private_only" && log.isPublic) return false;

      if (dateRange !== "all") {
        const logTime = new Date(log.date).getTime();
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        if (now - logTime > days * 86400000) return false;
      }

      return true;
    });
  }, [logs, search, selectedClient, selectedCategory, selectedTag, selectedVisibility, dateRange]);

  // Group achievements by experience container (everything hangs under experience)
  const experienceGroups = useMemo(() => {
    const result: { experience: WorkExperience; logs: LogEntry[] }[] = [];
    const assignedLogIds = new Set<string>();

    experiences.forEach((exp) => {
      const matched = filteredLogs.filter(
        (l) => l.experienceId === exp.id || (!l.experienceId && l.client.trim().toLowerCase() === exp.company.trim().toLowerCase())
      );
      matched.forEach((l) => assignedLogIds.add(l.id));
      result.push({
        experience: exp,
        logs: matched,
      });
    });

    const unassigned = filteredLogs.filter((l) => !assignedLogIds.has(l.id));
    return { result, unassigned };
  }, [experiences, filteredLogs]);

  const totalPublicCount = logs.filter((l) => l.isPublic).length;
  const totalPrivateCount = logs.filter((l) => !l.isPublic).length;

  return (
    <div className="space-y-6">
      
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 border border-cyan-900/40 rounded-xl relative overflow-hidden">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            Empresas / Experiencia
          </p>
          <p className="text-2xl font-bold text-cyan-300 font-mono tabular-nums mt-1">{experiences.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">{totalBulletsCount} viñetas de CV</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-purple-900/40 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Logros Extraídos
          </p>
          <p className="text-2xl font-bold text-purple-300 font-mono tabular-nums mt-1">{logs.length}</p>
          <span className="text-[10px] text-slate-500 font-mono">En tu Bitácora</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Sandbox Privado
          </p>
          <p className="text-2xl font-bold text-slate-300 font-mono tabular-nums mt-1">{totalPrivateCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Confidenciales</span>
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

      {/* Main Navigation Switcher: "Empresa / Experiencia" | "Logros" */}
      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        
        {/* Segmented Control */}
        <div className="inline-flex p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("by_experience")}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "by_experience"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Empresa / Experiencia</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              viewMode === "by_experience" ? "bg-slate-950/40 text-slate-900 font-bold" : "bg-slate-800 text-slate-400"
            }`}>
              {experiences.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("achievements")}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === "achievements"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Logros</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              viewMode === "achievements" ? "bg-slate-950/40 text-slate-900 font-bold" : "bg-slate-800 text-slate-400"
            }`}>
              {logs.length}
            </span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          <button
            type="button"
            onClick={onOpenCvUpload}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/60 hover:border-purple-400 text-purple-100 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-purple-950/30 whitespace-nowrap active:scale-95"
            title="Importar desde CV (PDF o DOCX)"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-300" />
            <span>Importar CV</span>
          </button>

          <button
            type="button"
            onClick={onAddExperience}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-cyan-800/60 hover:border-cyan-500 text-cyan-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Nueva Empresa / Experiencia</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickLog}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Registrar Logro</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPRESA / EXPERIENCIA (SALIDA FIEL DEL CV + EXTRACCIÓN DE LOGROS)  */}
      {/* ========================================================================= */}
      {viewMode === "by_experience" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Bar matching User Request Format */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  Experiencia Laboral ({experiences.length})
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                  {totalBulletsCount} viñetas reales
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Estructura extraída de tu CV. Cada empresa contiene sus viñetas reales y tecnologías; desde aquí puedes extraer logros a tu Bitácora.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenPasteBullets}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pegar Viñetas</span>
              </button>
              <button
                type="button"
                onClick={onOpenCvUpload}
                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <FileUp className="w-3.5 h-3.5 text-purple-300" />
                <span>Cargar CV</span>
              </button>
            </div>
          </div>

          {/* Empty State */}
          {experiences.length === 0 ? (
            <div className="text-center py-14 px-6 border border-dashed border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-950/30">
                <Building className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-white">Comienza cargando tu Experiencia Laboral</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Importa tu Currículum en PDF, TXT o pega tus viñetas. El sistema creará automáticamente los contenedores de tus empresas, roles, fechas y viñetas fidedignas para extraer logros.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenCvUpload}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-950/40 flex items-center gap-2 transition-all active:scale-95"
                >
                  <FileUp className="w-4 h-4 text-purple-200" />
                  <span>Importar desde CV (PDF)</span>
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
                  <span>+ Añadir Empresa Manualmente</span>
                </button>
              </div>
            </div>
          ) : (
            /* Experience Cards List matching User's Exact Format */
            <div className="space-y-6">
              {experiences.map((exp) => {
                // Find all logs linked to this experience
                const expLogs = logs.filter(
                  (l) => l.experienceId === exp.id || (!l.experienceId && l.client.trim().toLowerCase() === exp.company.trim().toLowerCase())
                );
                
                // Count unextracted bullets
                const bullets = exp.bullets || [];
                const unextractedBullets = bullets.filter(
                  (b) => !extractedBulletSet.has(b.trim().toLowerCase())
                );

                return (
                  <div
                    key={exp.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl transition-all"
                  >
                    {/* Top Row: Role, Company, Period, Top Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        {/* Role Name */}
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                          {exp.role || "Desarrollador / Ingeniero"}
                        </h3>

                        {/* Company Name with @ */}
                        <div className="text-sm sm:text-base font-semibold text-cyan-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span>@ {exp.company}</span>
                          {exp.isCurrent && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Actualidad
                            </span>
                          )}
                          {exp.isPersonalProjects && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              Proyectos Personales
                            </span>
                          )}
                        </div>

                        {/* Date Range & Location */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="font-mono text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {exp.startDate || "Inicio"} — {exp.isCurrent ? "Present" : (exp.endDate || "Present")}
                          </span>
                          {exp.location && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                {exp.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                        {unextractedBullets.length > 0 && onExtractAllBulletsForExperience && (
                          <button
                            type="button"
                            onClick={() => onExtractAllBulletsForExperience(exp.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/50 text-cyan-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                            title="Extraer todas las viñetas pendientes a la bitácora de logros"
                          >
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Extraer todos los logros ({unextractedBullets.length})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onAddLogToExperience(exp.id)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                          title="Registrar nuevo logro manual en esta empresa"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">Logro manual</span>
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
                              if (confirm(`¿Eliminar la empresa "${exp.company}"?`)) {
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

                    {/* Summary (if present) */}
                    {exp.summary && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-3xl border-l-2 border-slate-800 pl-3 italic">
                        {exp.summary}
                      </p>
                    )}

                    {/* Viñetas Reales (CV Bullets) */}
                    <div className="space-y-3 pt-1">
                      {bullets.length > 0 ? (
                        <div className="space-y-2">
                          {bullets.map((bullet, bIdx) => {
                            const isExtracted = extractedBulletSet.has(bullet.trim().toLowerCase());

                            return (
                              <div
                                key={bIdx}
                                className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 text-xs text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700/80 transition-colors"
                              >
                                <div className="flex items-start gap-2.5 flex-1">
                                  <span className="text-cyan-400 font-bold text-base leading-none select-none mt-0.5">•</span>
                                  <p className="text-slate-200/95 leading-relaxed">{bullet}</p>
                                </div>

                                {/* Inline Action Button */}
                                <div className="shrink-0 sm:self-center pl-4 sm:pl-0">
                                  {isExtracted ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Logro en Bitácora
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (onExtractBulletToLog) {
                                          onExtractBulletToLog(exp.id, exp.company, exp.role, bullet, exp.technologies);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-100 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 hover:border-cyan-500 px-2.5 py-1 rounded-md transition-all shadow-sm active:scale-95"
                                      title="Extraer esta viñeta como logro cuantificable en tu Bitácora"
                                    >
                                      <Zap className="w-3 h-3 text-cyan-400" />
                                      <span>Extraer como logro</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                          <span>No hay viñetas registradas para esta experiencia.</span>
                          <button
                            type="button"
                            onClick={() => onEditExperience(exp)}
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Añadir viñetas
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Technologies Tag Pills matching user's exact format */}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="text-[11px] font-mono text-slate-300 bg-slate-800/90 border border-slate-700/70 px-2.5 py-1 rounded-md hover:border-cyan-500/40 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Summary of Linked Achievements & direct jump to Logros */}
                    <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <strong className="text-slate-200">{expLogs.length}</strong> logros vinculados en Bitácora
                        <span className="text-slate-500 font-mono">
                          ({expLogs.filter((l) => l.isPublic).length} públicos · {expLogs.filter((l) => !l.isPublic).length} privados)
                        </span>
                      </span>

                      {expLogs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClient(exp.company);
                            setViewMode("achievements");
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 group/link"
                        >
                          <span>Ver logros de {exp.company} en tab Logros</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOGROS (TODO CUELGA DE LA EXPERIENCIA)                             */}
      {/* ========================================================================= */}
      {viewMode === "achievements" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Search & Filters Bar */}
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

          {/* Achievements List - Grouped by Experience Container */}
          {logs.length === 0 ? (
            /* Clean Empty State when no logs */
            <div className="text-center py-12 px-6 border border-dashed border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-white">Aún no tienes logros en tu Bitácora</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todo en tu bitácora cuelga de la experiencia. Dirígete a la pestaña <strong>Empresa / Experiencia</strong> para extraer viñetas directamente o registra un logro manualmente.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode("by_experience")}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Building className="w-4 h-4" />
                  <span>Ir a Empresa / Experiencia</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenQuickLog}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>+ Registrar Logro Manual</span>
                </button>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-10 border border-slate-800/80 rounded-2xl text-center bg-slate-900/40">
              <p className="text-sm font-semibold text-slate-300">No se encontraron logros con los filtros seleccionados.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedClient("all");
                  setSelectedCategory("Todas");
                  setSelectedTag("all");
                  setSelectedVisibility("all");
                  setDateRange("all");
                }}
                className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {experienceGroups.result
                .filter(({ logs: expLogs }) => expLogs.length > 0)
                .map(({ experience: exp, logs: expLogs }) => (
                  <div
                    key={exp.id}
                    className="bg-slate-900/70 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all shadow-xl"
                  >
                    {/* Experience Header Container */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
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
                            <h3 className="text-base font-bold text-white tracking-tight">
                              {exp.role} @ {exp.company}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {expLogs.length} {expLogs.length === 1 ? "logro" : "logros"}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">
                            {exp.startDate} — {exp.isCurrent ? "Present" : (exp.endDate || "Present")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAddLogToExperience(exp.id)}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Logro</span>
                        </button>
                      </div>
                    </div>

                    {/* Achievements Cards belonging to this experience */}
                    <div className="p-4 sm:p-5 space-y-3 bg-[#080C14]/40">
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

                            {/* Impact Metric Highlight (Google XYZ Formula) */}
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

                            {/* Reference to original CV bullet if available */}
                            {log.originalBullet && (
                              <div className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/80 mb-2 flex items-start gap-1.5">
                                <Sparkles className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">Viñeta origen CV: "{log.originalBullet}"</span>
                              </div>
                            )}

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
                    </div>
                  </div>
                ))}

              {/* Unassigned Achievements Section (if any) */}
              {experienceGroups.unassigned.length > 0 && (
                <div className="p-5 bg-amber-950/20 border border-amber-800/40 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <TagIcon className="w-4 h-4" />
                      <span>Logros sin contenedor asignado ({experienceGroups.unassigned.length})</span>
                    </div>
                    <span className="text-xs text-amber-400/80">
                      Asígnalos a una de tus empresas para mantener todo ordenado
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
    </div>
  );
};
