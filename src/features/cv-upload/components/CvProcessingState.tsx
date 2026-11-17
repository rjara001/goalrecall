import React from "react";
import { Sparkles } from "lucide-react";

interface CvProcessingStateProps {
  processingStep: string;
}

export const CvProcessingState: React.FC<CvProcessingStateProps> = ({
  processingStep,
}) => {
  return (
    <div className="py-16 text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
        <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-white mb-1">
          Auditando y Extrayendo Contenido Fidedigno
        </h4>
        <p className="text-xs text-purple-400 font-mono animate-pulse">
          {processingStep}
        </p>
        <p className="text-[11px] text-slate-500 mt-2 max-w-sm mx-auto">
          Extrayendo roles, empresas, viñetas, educación y computando la lista de campos pendientes...
        </p>
      </div>
    </div>
  );
};
