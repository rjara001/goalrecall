import React from "react";
import { CheckCircle2, FileText, Info, ListTodo, Sparkles } from "lucide-react";
import { CvFallbackReason } from "../../../types";

interface CvCompletenessBarProps {
  completenessScore: number;
  pendingCount: number;
  bulletsCount: number;
  reviewTab: "radiography" | "pending" | "bullets";
  onReviewTabChange: (tab: "radiography" | "pending" | "bullets") => void;
  fallbackNotice?: CvFallbackReason | null;
}

const FALLBACK_LABELS: Record<CvFallbackReason, string> = {
  unauthenticated: "Inicia sesión para habilitar extracción asistida por IA; procesado localmente con éxito.",
  timeout: "El servicio de IA tardó más de lo esperado; procesado automáticamente con el extractor local.",
  network: "Servicio en línea no disponible temporalmente; procesado automáticamente con el lector local.",
  server_error: "Servicio de IA temporalmente no disponible; procesado automáticamente con el extractor local.",
  forced_local: "Procesado localmente a costo $0.00.",
};

export const CvCompletenessBar: React.FC<CvCompletenessBarProps> = ({
  completenessScore,
  pendingCount,
  bulletsCount,
  reviewTab,
  onReviewTabChange,
  fallbackNotice,
}) => {
  return (
    <div className="space-y-3">
      {fallbackNotice && (
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{FALLBACK_LABELS[fallbackNotice]}</span>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                Completitud del CV Extraído
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300">
                {completenessScore}% Identificado
              </span>
            </div>
            <div className="w-full sm:w-72 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${completenessScore}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
                <ListTodo className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>{pendingCount} campos</strong> pendientes por rellenar
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡CV Completo al 100%!</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => onReviewTabChange("pending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reviewTab === "pending"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Lista de Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => onReviewTabChange("radiography")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reviewTab === "radiography"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Radiografía Completa del CV
          </button>
          <button
            onClick={() => onReviewTabChange("bullets")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reviewTab === "bullets"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Viñetas para la Bitácora ({bulletsCount})
          </button>
        </div>
      </div>
    </div>
  );
};
