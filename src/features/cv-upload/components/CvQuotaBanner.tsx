import React from "react";
import { Crown, Sparkles, Zap } from "lucide-react";
import { MAX_FREE_MONTHLY_AI_USES } from "../../../utils/storage";

interface CvQuotaBannerProps {
  aiUsageCount: number;
  onRunLocalExtractor: () => void;
  onShowProModal: () => void;
}

export const CvQuotaBanner: React.FC<CvQuotaBannerProps> = ({
  aiUsageCount,
  onRunLocalExtractor,
  onShowProModal,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/50 shadow-xl space-y-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-300">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">
              Límite mensual de extracciones con IA alcanzado ({aiUsageCount}/{MAX_FREE_MONTHLY_AI_USES})
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold">
              Cuenta Gratuita
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para asegurar que tu cuenta permanezca <strong>siempre 100% gratuita y sin costo ($0.00)</strong>, las extracciones con IA tienen un límite de 3 usos al mes (se renueva automáticamente el primer día de cada mes).
          </p>
          <p className="text-xs text-slate-400">
            ¡No te preocupes! Puedes procesar tu documento inmediatamente con nuestro motor local sin IA a costo cero, o unirte a la lista del Plan Pro.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onRunLocalExtractor}
          className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Procesar con Extractor Local ($0.00)</span>
        </button>

        <button
          type="button"
          onClick={onShowProModal}
          className="px-4 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-purple-400/30 shadow-lg shadow-purple-950/40 cursor-pointer"
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>Desbloquear Ilimitado (Plan Pro)</span>
        </button>
      </div>
    </div>
  );
};
