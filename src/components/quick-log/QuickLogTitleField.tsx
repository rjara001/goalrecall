import React from "react";
import { ChevronDown, Mic, MicOff, Zap } from "lucide-react";
import { PresetTemplate } from "../../types";
import { SupportedLanguage } from "../../i18n";
import { QUICK_LOG_PRESETS } from "./quickLogPresets";

interface QuickLogTitleFieldProps {
  language: SupportedLanguage;
  titleInputRef: React.RefObject<HTMLTextAreaElement | null>;
  templatesDropdownRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  setTitle: (val: string) => void;
  speechSupported: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  isTemplatesOpen: boolean;
  setIsTemplatesOpen: (open: boolean) => void;
  onApplyPreset: (preset: PresetTemplate) => void;
}

const DICTATE_COPY: Record<string, { start: string; stop: string; template: string }> = {
  en: { start: "Dictate", stop: "Stop", template: "Use Template" },
  pt: { start: "Ditar", stop: "Parar", template: "Usar Modelo" },
  fr: { start: "Dicter", stop: "Arrêter", template: "Utiliser Modèle" },
  de: { start: "Diktieren", stop: "Stopp", template: "Vorlage verwenden" },
  ja: { start: "音声入力", stop: "停止", template: "テンプレートを使用" },
  es: { start: "Dictar", stop: "Detener", template: "Usar Plantilla" },
};

export const QuickLogTitleField: React.FC<QuickLogTitleFieldProps> = ({
  language,
  titleInputRef,
  templatesDropdownRef,
  title,
  setTitle,
  speechSupported,
  isListening,
  onToggleListening,
  isTemplatesOpen,
  setIsTemplatesOpen,
  onApplyPreset,
}) => {
  const copy = DICTATE_COPY[language] || DICTATE_COPY.es;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          Logro (Multilínea — Viñeta para CV) *
        </label>

        <div className="flex items-center gap-2">
          {speechSupported && (
            <button
              type="button"
              onClick={onToggleListening}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
              }`}
              title="Dictar viñeta con voz"
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              <span>{isListening ? copy.stop : copy.start}</span>
            </button>
          )}

          <div className="relative" ref={templatesDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all"
            >
              <Zap className="w-3 h-3 fill-amber-300" />
              <span>{copy.template}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  isTemplatesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isTemplatesOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#0F1422] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Selecciona un formato guía:
                </div>
                {QUICK_LOG_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onApplyPreset(p)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2 font-mono">
                      {p.category.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <textarea
        ref={titleInputRef}
        rows={3}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Escribe la viñeta de logro completa tal como aparecerá en el CV o fue extraída..."
        required
        className="w-full bg-slate-900/90 border border-slate-700/90 hover:border-slate-600 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner resize-y leading-relaxed"
      />
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <span>
          💡 Campo resumen: es la viñeta principal de tu CV. Desglosa los detalles abajo con los
          acordeones (+).
        </span>
      </p>
    </div>
  );
};
