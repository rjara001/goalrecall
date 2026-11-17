import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  CheckSquare,
  Clock,
  Lock,
  Pencil,
  Plus,
  Square,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import {
  CareerGoal,
  CareerGoalCategory,
  CareerGoalStatus,
} from "../../types";
import { getCareerGoalProgress } from "../../utils/storage/careerGoalsStorage";

interface TimelineCareerGoalsTabProps {
  careerGoals: CareerGoal[];
  onOpenNewCareerGoal?: () => void;
  onEditCareerGoal?: (goal: CareerGoal) => void;
  onDeleteCareerGoal?: (id: string) => void;
  onSetCareerGoalStatus?: (id: string, status: CareerGoalStatus) => void;
  onToggleCareerGoalActionItem?: (goalId: string, itemId: string) => void;
  onConvertGoalToCertification?: (goal: CareerGoal) => void;
  onConvertGoalToLog?: (goal: CareerGoal) => void;
}

const CATEGORY_LABELS: Record<CareerGoalCategory, string> = {
  certification: "Certificación",
  study: "Estudio",
  academic: "Académico",
  target_company: "Empresa Objetivo",
  role_elevation: "Ascenso de Rol",
  open_source: "Open Source",
};

const COLUMNS: {
  status: CareerGoalStatus;
  title: string;
  subtitle: string;
  accentClass: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "backlog",
    title: "Planificadas",
    subtitle: "Prioridades futuras",
    accentClass: "text-slate-300",
    icon: <Target className="w-4 h-4 text-slate-400" />,
  },
  {
    status: "in_progress",
    title: "En Curso",
    subtitle: "Preparación activa",
    accentClass: "text-cyan-300",
    icon: <Clock className="w-4 h-4 text-cyan-400" />,
  },
  {
    status: "achieved",
    title: "Logradas",
    subtitle: "Hitos conquistados",
    accentClass: "text-emerald-300",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
];

export const TimelineCareerGoalsTab: React.FC<TimelineCareerGoalsTabProps> = ({
  careerGoals,
  onOpenNewCareerGoal,
  onEditCareerGoal,
  onDeleteCareerGoal,
  onSetCareerGoalStatus,
  onToggleCareerGoalActionItem,
  onConvertGoalToCertification,
  onConvertGoalToLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | CareerGoalCategory>("all");

  const filteredGoals = useMemo(() => {
    if (selectedCategory === "all") return careerGoals;
    return careerGoals.filter((g) => g.category === selectedCategory);
  }, [careerGoals, selectedCategory]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Plan de Carrera & Objetivos (Privado)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Solo tú</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Organiza tus certificaciones pendientes, deep dives técnicos y metas de rol sin exponerlas en la vitrina pública.
            </p>
          </div>

          {onOpenNewCareerGoal && (
            <button
              type="button"
              onClick={onOpenNewCareerGoal}
              className="px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Objetivo</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-cyan-950/80 border-cyan-600 text-cyan-200 font-semibold"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Todas ({careerGoals.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as CareerGoalCategory[]).map((cat) => {
            const count = careerGoals.filter((g) => g.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-cyan-950/80 border-cyan-600 text-cyan-200 font-semibold"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {careerGoals.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20 space-y-3">
          <Target className="w-8 h-8 text-cyan-400/80 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              Tu hoja de ruta profesional está lista para empezar
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Define certificaciones objetivo, rutas de estudio, empresas aspiracionales o metas de ascenso con checklist de hitos intermedios.
            </p>
          </div>
          {onOpenNewCareerGoal && (
            <button
              type="button"
              onClick={onOpenNewCareerGoal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Primer Objetivo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colGoals = filteredGoals.filter((g) => g.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <div>
                      <h4 className={`text-xs font-bold ${col.accentClass}`}>{col.title}</h4>
                      <p className="text-[10px] text-slate-500">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {colGoals.length}
                  </span>
                </div>

                {colGoals.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-6 text-center">
                    Sin objetivos en esta columna
                  </p>
                ) : (
                  <div className="space-y-3">
                    {colGoals.map((goal) => {
                      const progress = getCareerGoalProgress(goal);
                      return (
                        <div
                          key={goal.id}
                          className="p-4 bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                <span className="text-cyan-300">
                                  {CATEGORY_LABELS[goal.category]}
                                </span>
                                {goal.targetDate && (
                                  <>
                                    <span>·</span>
                                    <span className="tabular-nums">Meta: {goal.targetDate}</span>
                                  </>
                                )}
                                {goal.achievedDate && goal.status === "achieved" && (
                                  <>
                                    <span>·</span>
                                    <span className="text-emerald-400 tabular-nums">
                                      Logrado: {goal.achievedDate}
                                    </span>
                                  </>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-white leading-snug">
                                {goal.title}
                              </h5>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {onEditCareerGoal && (
                                <button
                                  type="button"
                                  onClick={() => onEditCareerGoal(goal)}
                                  title="Editar objetivo"
                                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteCareerGoal && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteCareerGoal(goal.id)}
                                  title="Eliminar objetivo"
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {goal.whyImportant && (
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {goal.whyImportant}
                            </p>
                          )}

                          {goal.actionItems && goal.actionItems.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
                                <span>
                                  Hitos: {progress.done}/{progress.total}
                                </span>
                                <span className="text-cyan-300">{progress.percent}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-400 transition-all"
                                  style={{ width: `${progress.percent}%` }}
                                />
                              </div>
                              <div className="space-y-1">
                                {goal.actionItems.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                      onToggleCareerGoalActionItem?.(goal.id, item.id)
                                    }
                                    className="w-full flex items-start gap-2 text-left text-[11px] py-0.5 hover:text-white transition-colors"
                                  >
                                    {item.done ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                    )}
                                    <span
                                      className={
                                        item.done
                                          ? "line-through text-slate-500"
                                          : "text-slate-300"
                                      }
                                    >
                                      {item.text}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {goal.notes && (
                            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 whitespace-pre-wrap">
                              {goal.notes}
                            </p>
                          )}

                          {/* Status controls */}
                          {onSetCareerGoalStatus && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                              {goal.status !== "backlog" && (
                                <button
                                  type="button"
                                  onClick={() => onSetCareerGoalStatus(goal.id, "backlog")}
                                  className="px-2 py-1 text-[10px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded whitespace-nowrap transition-colors"
                                >
                                  Planificada
                                </button>
                              )}
                              {goal.status !== "in_progress" && (
                                <button
                                  type="button"
                                  onClick={() => onSetCareerGoalStatus(goal.id, "in_progress")}
                                  className="px-2 py-1 text-[10px] font-mono bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 text-cyan-300 rounded flex items-center gap-1 whitespace-nowrap transition-colors"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  <span>En Curso</span>
                                </button>
                              )}
                              {goal.status !== "achieved" && (
                                <button
                                  type="button"
                                  onClick={() => onSetCareerGoalStatus(goal.id, "achieved")}
                                  className="px-2 py-1 text-[10px] font-mono bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/70 text-emerald-300 rounded flex items-center gap-1 whitespace-nowrap transition-colors"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Marcar Logrado</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* 1-click conversions on Achieved goals */}
                          {goal.status === "achieved" && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                              {goal.category === "certification" &&
                                (goal.linkedCertificationId ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300">
                                    <Award className="w-3 h-3" />
                                    <span>Certificación vinculada</span>
                                  </span>
                                ) : (
                                  onConvertGoalToCertification && (
                                    <button
                                      type="button"
                                      onClick={() => onConvertGoalToCertification(goal)}
                                      className="px-2.5 py-1 text-[11px] font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md flex items-center gap-1 whitespace-nowrap transition-colors"
                                    >
                                      <Award className="w-3.5 h-3.5" />
                                      <span>Convertir en Certificación</span>
                                    </button>
                                  )
                                ))}

                              {onConvertGoalToLog && (
                                <button
                                  type="button"
                                  onClick={() => onConvertGoalToLog(goal)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-md flex items-center gap-1 whitespace-nowrap transition-colors"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Registrar como Logro</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
