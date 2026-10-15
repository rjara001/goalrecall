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
  Globe
} from "lucide-react";
import { FilterState, LogCategory, LogEntry } from "../types";

interface TimelineViewProps {
  logs: LogEntry[];
  onTogglePublic: (id: string) => void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  onDuplicateLog: (entry: LogEntry) => void;
  onOpenQuickLog: () => void;
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
  onTogglePublic,
  onEditLog,
  onDeleteLog,
  onDuplicateLog,
  onOpenQuickLog,
}) => {
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

  const totalPublicCount = logs.filter((l) => l.isPublic).length;
  const totalPrivateCount = logs.filter((l) => !l.isPublic).length;

  return (
    <div className="space-y-6">
      
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Total de Logros</p>
          <p className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">{logs.length}</p>
        </div>
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Sandbox Privado
          </p>
          <p className="text-xl font-bold text-slate-300 font-mono tabular-nums mt-0.5">{totalPrivateCount}</p>
        </div>
        <div className="p-3.5 bg-slate-900/60 border border-emerald-950/60 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Public Deck
          </p>
          <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">{totalPublicCount}</p>
        </div>
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            Clientes / Entidades
          </p>
          <p className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">{clients.length}</p>
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
              placeholder="Buscar por logro, tecnología, impacto o cliente..."
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
          <div className="flex items-center gap-2">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los Clientes</option>
              {clients.map((c) => (
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

      {/* Timeline Stream */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No se encontraron registros</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No hay logros que coincidan con los filtros seleccionados o la bitácora está vacía.
          </p>
          <button
            onClick={onOpenQuickLog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Nuevo Registro (⌘K)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByMonth).map(([monthLabel, entries]) => (
            <div key={monthLabel} className="space-y-3">
              {/* Month Header (Clean Unboxed Typography) */}
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
                    {/* Top Row: Unboxed Metadata & Category */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <span className="text-slate-200 font-semibold">{log.client}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300">{log.project}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">{log.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
                          {log.category}
                        </span>

                        {/* Sandbox vs Public Indicator */}
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
                      
                      {/* CRITICAL: Direct Selective Publishing Action Button */}
                      <button
                        onClick={() => onTogglePublic(log.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          log.isPublic
                            ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
                        }`}
                        title={
                          log.isPublic
                            ? "Actualmente visible en Public Deck. Haz clic para despublicar al Sandbox privado."
                            : "Actualmente privado. Haz clic para publicar en Public Deck y activar para First Mate."
                        }
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

                      {/* Secondary Actions: Edit, Duplicate, Delete */}
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
  );
};
