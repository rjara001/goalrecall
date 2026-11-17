import React from "react";
import {
  SlidersHorizontal,
  Calendar,
  Building,
  FolderGit2,
  Check,
  Plus,
  Tag,
} from "lucide-react";
import { LogCategory } from "../../types";
import { SupportedLanguage } from "../../i18n";

interface QuickLogContextPanelProps {
  language: SupportedLanguage;
  isContextVisible: boolean;
  setIsContextVisible: (v: boolean) => void;
  companyLabel: string;
  category: LogCategory;
  setCategory: (cat: LogCategory) => void;
  date: string;
  setDate: (d: string) => void;
  experienceId: string;
  setExperienceId: (id: string) => void;
  experiencesList: any[];
  isCreatingNewExp: boolean;
  setIsCreatingNewExp: (v: boolean) => void;
  newExpCompany: string;
  setNewExpCompany: (v: string) => void;
  newExpRole: string;
  setNewExpRole: (v: string) => void;
  setClient: (v: string) => void;
  project: string;
  setProject: (v: string) => void;
  existingProjects: string[];
  categoryFilterTab: "all" | "tech" | "marketing" | "business";
  setCategoryFilterTab: (tab: "all" | "tech" | "marketing" | "business") => void;
  displayedCategories: string[];
  customCategoryInput: string;
  setCustomCategoryInput: (v: string) => void;
  onAddCustomCategory: () => void;
  tags: string[];
  tagInput: string;
  setTagInput: (v: string) => void;
  onAddTag: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
}

export const QuickLogContextPanel: React.FC<QuickLogContextPanelProps> = ({
  language,
  isContextVisible,
  setIsContextVisible,
  companyLabel,
  category,
  setCategory,
  date,
  setDate,
  experienceId,
  setExperienceId,
  experiencesList,
  isCreatingNewExp,
  setIsCreatingNewExp,
  newExpCompany,
  setNewExpCompany,
  newExpRole,
  setNewExpRole,
  setClient,
  project,
  setProject,
  existingProjects,
  categoryFilterTab,
  setCategoryFilterTab,
  displayedCategories,
  customCategoryInput,
  setCustomCategoryInput,
  onAddCustomCategory,
  tags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
}) => {
  const closedTitle =
    language === "en"
      ? "Context & Options"
      : language === "pt"
      ? "Contexto e Opções"
      : language === "fr"
      ? "Contexte et Options"
      : language === "de"
      ? "Kontext & Optionen"
      : language === "ja"
      ? "コンテキストと設定"
      : "Contexto y Opciones Secundarias";

  const openTitle =
    language === "en"
      ? "Context & Settings"
      : language === "pt"
      ? "Contexto e Configuração"
      : language === "fr"
      ? "Contexte et Paramètres"
      : language === "de"
      ? "Kontext & Einstellungen"
      : language === "ja"
      ? "コンテキストと設定"
      : "Contexto y Configuración Secundaria";

  return (
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
              {closedTitle}
            </span>
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
              {openTitle}
            </span>
            <button
              type="button"
              onClick={() => setIsContextVisible(false)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Ocultar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Categoría del Logro
              </label>
              <div className="flex items-center gap-1 text-[10px]">
                {(
                  [
                    { id: "all", label: "Todas" },
                    { id: "tech", label: "Tech 💻" },
                    { id: "marketing", label: "Marketing 📈" },
                    { id: "business", label: "Negocio 💼" },
                  ] as const
                ).map((tab, idx) => (
                  <React.Fragment key={tab.id}>
                    {idx > 0 && <span>·</span>}
                    <button
                      type="button"
                      onClick={() => setCategoryFilterTab(tab.id)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        categoryFilterTab === tab.id
                          ? "bg-cyan-500/20 text-cyan-300 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
              {displayedCategories.map((cat: string) => (
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
                  <span className="truncate">{cat}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddCustomCategory();
                  }
                }}
                placeholder="+ Escribe otra categoría (ej. Social Media 📱, Finanzas 💳)..."
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={onAddCustomCategory}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-cyan-400" />
              Etiquetas / Tags (Herramientas, Canales o Competencias)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-lg min-h-[38px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 font-mono"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
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
                onKeyDown={onAddTag}
                placeholder={tags.length === 0 ? "ej. #Kafka, #Go, #PostgreSQL..." : "Añadir..."}
                className="bg-transparent text-xs text-slate-200 focus:outline-none min-w-[100px] flex-1 px-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
