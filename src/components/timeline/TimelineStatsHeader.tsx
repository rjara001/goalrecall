import React, { useEffect, useRef, useState } from "react";
import { Award, Building, ChevronDown, Eye, FileUp, Lock, Plus, Rocket, Target, Zap } from "lucide-react";
import { useI18n } from "../../i18n";

export type TimelineViewMode =
  | "by_experience"
  | "achievements"
  | "products"
  | "certifications"
  | "career_goals";

interface TimelineStatsHeaderProps {
  experiencesCount: number;
  totalBulletsCount: number;
  logsCount: number;
  totalPrivateCount: number;
  totalPublicCount: number;
  productsCount: number;
  certificationsCount?: number;
  careerGoalsCount?: number;
  viewMode: TimelineViewMode;
  onChangeViewMode: (mode: TimelineViewMode) => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onOpenQuickLog: () => void;
  onOpenNewProduct?: () => void;
  onOpenNewCertification?: () => void;
  onOpenNewCareerGoal?: () => void;
}

export const TimelineStatsHeader: React.FC<TimelineStatsHeaderProps> = ({
  experiencesCount,
  totalBulletsCount,
  logsCount,
  totalPrivateCount,
  totalPublicCount,
  productsCount,
  certificationsCount = 0,
  careerGoalsCount = 0,
  viewMode,
  onChangeViewMode,
  onOpenCvUpload,
  onAddExperience,
  onOpenQuickLog,
  onOpenNewProduct,
  onOpenNewCertification,
  onOpenNewCareerGoal,
}) => {
  const { t } = useI18n();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    if (isCreateMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreateMenuOpen]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/60 border border-cyan-900/40 rounded-xl relative overflow-hidden">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            {t.common.company} / {t.timeline.rolePeriod}
          </p>
          <p className="text-2xl font-bold text-cyan-300 font-mono tabular-nums mt-1">
            {experiencesCount}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {totalBulletsCount} {t.timeline.bulletsAvailable}
          </span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-purple-900/40 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            {t.timeline.tabAllAchievements}
          </p>
          <p className="text-2xl font-bold text-purple-300 font-mono tabular-nums mt-1">
            {logsCount}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{t.nav.logbook}</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            {t.nav.privateVaultActive}
          </p>
          <p className="text-2xl font-bold text-slate-300 font-mono tabular-nums mt-1">
            {totalPrivateCount}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{t.timeline.isPrivate}</span>
        </div>

        <div className="p-3.5 bg-slate-900/60 border border-emerald-950/60 rounded-xl">
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            {t.nav.publicShowcase}
          </p>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {totalPublicCount}
          </p>
          <span className="text-[10px] text-emerald-500/70 font-mono">{t.timeline.isPublic}</span>
        </div>
      </div>

      <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => onChangeViewMode("by_experience")}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${
              viewMode === "by_experience"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>{t.timeline.tabByCompany}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                viewMode === "by_experience"
                  ? "bg-slate-950/40 text-slate-900 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {experiencesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode("achievements")}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${
              viewMode === "achievements"
                ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>{t.timeline.tabAllAchievements}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                viewMode === "achievements"
                  ? "bg-slate-950/40 text-slate-900 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {logsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode("products")}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${
              viewMode === "products"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Rocket className="w-4 h-4 shrink-0" />
            <span>Productos & Showcase</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                viewMode === "products"
                  ? "bg-slate-950/40 text-slate-900 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {productsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode("certifications")}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${
              viewMode === "certifications"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Certificaciones</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                viewMode === "certifications"
                  ? "bg-slate-950/40 text-slate-900 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {certificationsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode("career_goals")}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${
              viewMode === "career_goals"
                ? "bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 shadow-md shadow-cyan-500/25 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span>Plan de Carrera</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                viewMode === "career_goals"
                  ? "bg-slate-950/40 text-slate-900 font-bold"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {careerGoalsCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          <button
            type="button"
            onClick={onOpenCvUpload}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/60 hover:border-purple-400 text-purple-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-purple-950/30 whitespace-nowrap active:scale-95"
            title={t.cv.modalTitle}
          >
            <FileUp className="w-3.5 h-3.5 text-purple-300" />
            <span>{t.timeline.importCvBtn}</span>
          </button>

          <div className="relative" ref={createMenuRef}>
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear / Registrar</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isCreateMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0B101D] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800/80">
                  ¿Qué deseas registrar?
                </div>

                {onOpenNewProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onOpenNewProduct();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 group-hover:border-emerald-500">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        + Nuevo Producto
                      </p>
                      <p className="text-[11px] text-slate-400">
                        SaaS, librería, app o proyecto en showcase
                      </p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    onAddExperience();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-slate-800/70 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 group-hover:border-slate-500">
                    <Building className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {t.timeline.addCompanyBtn}
                    </p>
                    <p className="text-[11px] text-slate-400">Empresa, rol o periodo laboral</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    onOpenQuickLog();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-slate-800/70 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 group-hover:border-cyan-500">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {t.timeline.newAchievement}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Viñeta Google XYZ con impacto medible
                    </p>
                  </div>
                </button>

                {onOpenNewCertification && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onOpenNewCertification();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 group-hover:border-amber-500">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        + Nueva Certificación
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Credencial oficial Cloud, DevOps o Seguridad
                      </p>
                    </div>
                  </button>
                )}

                {onOpenNewCareerGoal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      onOpenNewCareerGoal();
                    }}
                    className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 group-hover:border-cyan-500">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        + Nuevo Objetivo de Carrera
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Meta privada de estudio, ascenso o certificación
                      </p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
