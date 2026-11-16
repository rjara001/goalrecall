import React from "react";
import { CheckCircle2, ListTodo, Plus } from "lucide-react";
import { CvPendingField } from "../../../types";

interface CvPendingTabProps {
  pendingFields: CvPendingField[];
  onOpenFillPending: (field: CvPendingField) => void;
}

export const CvPendingTab: React.FC<CvPendingTabProps> = ({
  pendingFields,
  onOpenFillPending,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-amber-400" />
            Campos que no fue posible identificar en tu CV
          </h4>
          <p className="text-xs text-slate-400">
            La herramienta identificó todo lo posible de forma verídica. Aquí tienes la lista de lo que
            falta rellenar: puedes completarlo ahora mismo con un clic o dejarlo para después.
          </p>
        </div>
      </div>

      {pendingFields.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
          <h5 className="text-sm font-bold text-white">¡No hay campos pendientes!</h5>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Tu CV contenía toda la información estándar requerida (contacto, titular, experiencias,
            habilidades, educación, certificaciones e idiomas).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingFields.map((field) => (
            <div
              key={field.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {field.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      field.severity === "high"
                        ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {field.severity === "high" ? "Recomendado" : "Opcional"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{field.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {field.suggestedPrompt}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenFillPending(field)}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Rellenar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
