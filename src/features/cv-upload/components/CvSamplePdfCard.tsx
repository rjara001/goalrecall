import React from "react";
import { Download, FileText, Zap } from "lucide-react";

interface CvSamplePdfCardProps {
  onLoadSamplePdf: () => void;
  isLoadingSamplePdf: boolean;
  isProcessing: boolean;
}

export const CvSamplePdfCard: React.FC<CvSamplePdfCardProps> = ({
  onLoadSamplePdf,
  isLoadingSamplePdf,
  isProcessing,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="text-sm font-bold text-white tracking-tight">
                CV de Pruebas Generado (PDF Real)
              </h5>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                CV_Profesional_Demo.pdf
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Contiene una trayectoria técnica de muestra: 8 empresas (CloudScale Systems, NovaStream Analytics, Aura SaaS, Vanguard Tech, FinPulse Global, Horizon Bank, OmniCommerce, Proyectos Personales), 28 viñetas técnicas con métricas, tecnologías y educación.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">8 Experiencias</span>
              <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">28 Viñetas Técnicas</span>
              <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">Stack Tecnológico</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">100% Sin Alucinaciones</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={onLoadSamplePdf}
            disabled={isLoadingSamplePdf || isProcessing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{isLoadingSamplePdf ? "Cargando PDF..." : "Probar en 1 Clic"}</span>
          </button>

          <a
            href="/demo-cv.pdf"
            download="CV_Profesional_Demo.pdf"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Descargar PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};
