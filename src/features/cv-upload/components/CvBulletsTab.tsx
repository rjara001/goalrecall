import React from "react";
import { CheckSquare, Sparkles, Square, Trash2 } from "lucide-react";
import { ExtractedBullet } from "../../../types";

interface CvBulletsTabProps {
  extractedBullets: ExtractedBullet[];
  onToggleSelectBullet: (id: string) => void;
  onToggleSelectAll: (select: boolean) => void;
  onRemoveBullet: (id: string) => void;
}

export const CvBulletsTab: React.FC<CvBulletsTabProps> = ({
  extractedBullets,
  onToggleSelectBullet,
  onToggleSelectAll,
  onRemoveBullet,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Logros extraídos listos para importar a tu Bitácora
          </h4>
          <p className="text-xs text-slate-400">
            Selecciona los logros que deseas agregar a tu Bóveda Privada (podrás publicarlos en tu
            Vitrina Pública o dejarlos confidenciales).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSelectAll(true)}
            className="px-2.5 py-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            Marcar Todos
          </button>
          <button
            type="button"
            onClick={() => onToggleSelectAll(false)}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-300 font-medium"
          >
            Desmarcar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {extractedBullets.map((bullet) => (
          <div
            key={bullet.id}
            className={`p-4 rounded-xl border transition-all ${
              bullet.selected
                ? "bg-slate-900/90 border-purple-500/50 shadow-md shadow-purple-950/20"
                : "bg-slate-950/40 border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleSelectBullet(bullet.id)}
                className="mt-0.5 text-purple-400 hover:text-purple-300"
              >
                {bullet.selected ? (
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{bullet.client}</span>
                    <span className="text-[11px] text-purple-400">/ {bullet.project}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {bullet.category}
                  </span>
                </div>

                <p className="text-xs text-slate-200">{bullet.title}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {bullet.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveBullet(bullet.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
