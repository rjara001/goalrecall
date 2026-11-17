import React, { useEffect, useState } from "react";
import { CheckSquare, Plus, Square, Target, Trash2, X } from "lucide-react";
import {
  CareerGoal,
  CareerGoalActionItem,
  CareerGoalCategory,
  CareerGoalStatus,
} from "../types";

interface CareerGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    goal: Omit<CareerGoal, "id" | "createdAt" | "updatedAt"> | CareerGoal
  ) => void;
  goal?: CareerGoal | null;
}

const CATEGORY_OPTIONS: { value: CareerGoalCategory; label: string }[] = [
  { value: "certification", label: "Certificación" },
  { value: "study", label: "Estudio & Deep Dive" },
  { value: "academic", label: "Académico / Posgrado" },
  { value: "target_company", label: "Empresa Objetivo" },
  { value: "role_elevation", label: "Ascenso / Nivel de Rol" },
  { value: "open_source", label: "Open Source / Producto" },
];

const STATUS_OPTIONS: { value: CareerGoalStatus; label: string }[] = [
  { value: "backlog", label: "Planificada" },
  { value: "in_progress", label: "En Curso" },
  { value: "achieved", label: "Lograda" },
];

export const CareerGoalModal: React.FC<CareerGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CareerGoalCategory>("certification");
  const [status, setStatus] = useState<CareerGoalStatus>("backlog");
  const [targetDate, setTargetDate] = useState("");
  const [whyImportant, setWhyImportant] = useState("");
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<CareerGoalActionItem[]>([]);
  const [newActionInput, setNewActionInput] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (goal) {
      setTitle(goal.title || "");
      setCategory(goal.category || "certification");
      setStatus(goal.status || "backlog");
      setTargetDate(goal.targetDate || "");
      setWhyImportant(goal.whyImportant || "");
      setNotes(goal.notes || "");
      setActionItems(goal.actionItems || []);
    } else {
      setTitle("");
      setCategory("certification");
      setStatus("backlog");
      setTargetDate("");
      setWhyImportant("");
      setNotes("");
      setActionItems([]);
    }
    setNewActionInput("");
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleAddActionItem = () => {
    const clean = newActionInput.trim();
    if (!clean) return;
    const item: CareerGoalActionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: clean,
      done: false,
    };
    setActionItems((prev) => [...prev, item]);
    setNewActionInput("");
  };

  const handleToggleItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      ...(goal
        ? {
            id: goal.id,
            createdAt: goal.createdAt,
            achievedDate: goal.achievedDate,
            linkedCertificationId: goal.linkedCertificationId,
          }
        : {}),
      userId: goal?.userId,
      title: title.trim(),
      category,
      status,
      targetDate: targetDate.trim() || undefined,
      whyImportant: whyImportant.trim() || undefined,
      actionItems,
      notes: notes.trim() || undefined,
    };

    onSave(
      payload as Omit<CareerGoal, "id" | "createdAt" | "updatedAt"> | CareerGoal
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0B111E] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-goal-modal-title"
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 id="career-goal-modal-title" className="text-base font-bold text-white">
                {goal ? "Editar Objetivo de Carrera" : "Nuevo Objetivo de Carrera"}
              </h2>
              <p className="text-xs text-slate-400">
                Meta privada de crecimiento técnico, certificación, estudio o rol objetivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Meta u objetivo profesional *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Certificarme en CKA (Certified Kubernetes Administrator)"
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CareerGoalCategory)}
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Estado en hoja de ruta</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CareerGoalStatus)}
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                Horizonte / Fecha objetivo
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="Ej: 2026-Q3 o 2027"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              ¿Por qué este hito es estratégico para tu carrera?
            </label>
            <textarea
              rows={2}
              value={whyImportant}
              onChange={(e) => setWhyImportant(e.target.value)}
              placeholder="Ej: Valida operación productiva de clústeres para roles Staff Infrastructure / Platform Engineering."
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Checklist de hitos intermedios
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newActionInput}
                onChange={(e) => setNewActionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                placeholder="Ej: Completar simulacros de Killer.sh con >80%"
                className="flex-1 bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir hito</span>
              </button>
            </div>

            {actionItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      {item.done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span
                        className={`truncate ${
                          item.done ? "line-through text-slate-500" : "text-slate-200"
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                      aria-label="Eliminar hito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Recursos, enlaces a temarios o notas privadas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Temario oficial, repositorio de labs, libros de referencia..."
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
            >
              {goal ? "Guardar Cambios" : "Guardar Objetivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
