import React from "react";
import { Check, ListTodo, X } from "lucide-react";
import { PendingFieldEditingState } from "../../../types";

interface CvPendingFieldEditorProps {
  activeFieldEditing: PendingFieldEditingState | null;
  quickFieldValue: string;
  onQuickFieldValueChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const CvPendingFieldEditor: React.FC<CvPendingFieldEditorProps> = ({
  activeFieldEditing,
  quickFieldValue,
  onQuickFieldValueChange,
  onSave,
  onClose,
}) => {
  if (!activeFieldEditing) return null;

  return (
    <div className="fixed inset-0 z-[70] isolate flex items-center justify-center p-4 bg-black/80">
      <div
        className="w-full max-w-md bg-slate-900 border border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ListTodo className="w-4 h-4 text-amber-400" />
            Rellenar: {activeFieldEditing.label}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">{activeFieldEditing.suggestedPrompt}</p>

        <div>
          {activeFieldEditing.section === "summary" ? (
            <textarea
              rows={4}
              value={quickFieldValue}
              onChange={(e) => onQuickFieldValueChange(e.target.value)}
              placeholder="Escribe el contenido aquí..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          ) : (
            <input
              type="text"
              value={quickFieldValue}
              onChange={(e) => onQuickFieldValueChange(e.target.value)}
              placeholder="Escribe el valor aquí..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              autoFocus
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!quickFieldValue.trim()}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
            Guardar Campo
          </button>
        </div>
      </div>
    </div>
  );
};
