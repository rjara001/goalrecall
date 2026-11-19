import React from "react";
import { Building, FolderGit2, Plus, Search, Tag as TagIcon, Zap } from "lucide-react";
import { LogCategory, LogEntry, WorkExperience } from "../../types";
import { TimelineViewLocale } from "../../i18n/viewLocales";
import { TimelineAchievementCard } from "./TimelineAchievementCard";

interface TimelineAchievementsTabProps {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  experiences: WorkExperience[];
  clients: string[];
  allTags: string[];
  dynamicCategories: Array<"Todas" | LogCategory>;
  experienceGroups: {
    result: { experience: WorkExperience; logs: LogEntry[] }[];
    unassigned: LogEntry[];
  };
  search: string;
  setSearch: (v: string) => void;
  selectedClient: string;
  setSelectedClient: (v: string) => void;
  selectedCategory: "Todas" | LogCategory;
  setSelectedCategory: (v: "Todas" | LogCategory) => void;
  selectedTag: string;
  setSelectedTag: (v: string) => void;
  selectedVisibility: "all" | "public_only" | "private_only";
  setSelectedVisibility: (v: "all" | "public_only" | "private_only") => void;
  dateRange: "all" | "7d" | "30d" | "90d";
  setDateRange: (v: "all" | "7d" | "30d" | "90d") => void;
  expandedFields: Record<string, boolean>;
  onToggleField: (key: string) => void;
  tl: TimelineViewLocale;
  onGoToExperiencesTab: () => void;
  onOpenQuickLog: () => void;
  onAddLogToExperience: (experienceId: string) => void;
  onTogglePublic: (id: string) => void;
  onToggleIncludeInCv?: (id: string) => void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  onDuplicateLog: (entry: LogEntry) => void;
}

export const TimelineAchievementsTab: React.FC<TimelineAchievementsTabProps> = ({
  logs,
  filteredLogs,
  experiences,
  clients,
  allTags,
  dynamicCategories,
  experienceGroups,
  search,
  setSearch,
  selectedClient,
  setSelectedClient,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  selectedVisibility,
  setSelectedVisibility,
  dateRange,
  setDateRange,
  expandedFields,
  onToggleField,
  tl,
  onGoToExperiencesTab,
  onOpenQuickLog,
  onAddLogToExperience,
  onTogglePublic,
  onToggleIncludeInCv,
  onEditLog,
  onDeleteLog,
  onDuplicateLog,
}) => {
  const handleResetFilters = () => {
    setSearch("");
    setSelectedClient("all");
    setSelectedCategory("Todas");
    setSelectedTag("all");
    setSelectedVisibility("all");
    setDateRange("all");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tl.searchPlaceholder}
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

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">{tl.allCompanies}</option>
              {experiences.map((exp) => (
                <option key={exp.id} value={exp.company}>
                  {exp.company}
                </option>
              ))}
              {clients
                .filter((c) => !experiences.some((e) => e.company === c))
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as any)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Toda Visibilidad</option>
              <option value="private_only">{tl.vaultPrivateOnly}</option>
              <option value="public_only">{tl.publicShowcaseOnly}</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-[#080C14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Cualquier fecha</option>
              <option value="7d">{tl.time7d}</option>
              <option value="30d">{tl.time30d}</option>
              <option value="90d">{tl.time90d}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
          {dynamicCategories.map((cat) => (
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
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? "all" : tag)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors shrink-0 ${
                  selectedTag === tag
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 px-6 border border-dashed border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950/60 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">{tl.emptyLogsTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{tl.emptyLogsDesc}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onGoToExperiencesTab}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all active:scale-95"
            >
              <Building className="w-4 h-4" />
              <span>{tl.goToExperienceTabBtn}</span>
            </button>
            <button
              type="button"
              onClick={onOpenQuickLog}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>{tl.logManualBtn}</span>
            </button>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-10 border border-slate-800/80 rounded-2xl text-center bg-slate-900/40">
          <p className="text-sm font-semibold text-slate-300">{tl.noLogsFiltered}</p>
          <button
            onClick={handleResetFilters}
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
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        exp.isPersonalProjects
                          ? "bg-purple-950/40 border-purple-500/40 text-purple-400"
                          : "bg-cyan-950/40 border-cyan-500/40 text-cyan-400"
                      }`}
                    >
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
                          {tl.logsCountBadge(expLogs.length)}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate || "Present"}
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
                      <span>{tl.addLogQuickBtn}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3 bg-[#080C14]/40">
                  <div className="grid grid-cols-1 gap-3">
                    {expLogs.map((log) => (
                      <TimelineAchievementCard
                        key={log.id}
                        log={log}
                        tl={tl}
                        expandedFields={expandedFields}
                        onToggleField={onToggleField}
                        onSelectTag={setSelectedTag}
                        onTogglePublic={onTogglePublic}
                        onToggleIncludeInCv={onToggleIncludeInCv}
                        onDuplicateLog={onDuplicateLog}
                        onEditLog={onEditLog}
                        onDeleteLog={onDeleteLog}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {experienceGroups.unassigned.length > 0 && (
            <div className="p-5 bg-amber-950/20 border border-amber-800/40 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <TagIcon className="w-4 h-4" />
                  <span>
                    {tl.unassignedContainerTitle(experienceGroups.unassigned.length)}
                  </span>
                </div>
                <span className="text-xs text-amber-400/80">{tl.unassignedContainerDesc}</span>
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
                        {tl.assignCompanyBtn}
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
  );
};
