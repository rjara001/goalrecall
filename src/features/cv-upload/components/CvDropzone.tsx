import React, { useRef } from "react";
import { AlertCircle, FileText, FileUp, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { MAX_CV_TEXT_CHARS } from "../constants";
import { CvSamplePdfCard } from "./CvSamplePdfCard";
import { CvQuotaBanner } from "./CvQuotaBanner";

interface CvDropzoneProps {
  activeTab: "file" | "text";
  onTabChange: (tab: "file" | "text") => void;
  isDragging: boolean;
  onDraggingChange: (dragging: boolean) => void;
  pastedCvText: string;
  onPastedTextChange: (text: string) => void;
  onFileSelect: (file: File) => void;
  onPasteText: (text: string) => void;
  onLoadSamplePdf: () => void;
  onLoadSampleText: () => void;
  isLoadingSamplePdf: boolean;
  quotaExhausted: boolean;
  aiUsageCount: number;
  errorMessage: string | null;
  onRunLocalExtractor: () => void;
  onShowProModal: () => void;
}

export const CvDropzone: React.FC<CvDropzoneProps> = ({
  activeTab, onTabChange, isDragging, onDraggingChange, pastedCvText, onPastedTextChange,
  onFileSelect, onPasteText, onLoadSamplePdf, onLoadSampleText, isLoadingSamplePdf,
  quotaExhausted, aiUsageCount, errorMessage, onRunLocalExtractor, onShowProModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDraggingChange(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const tabClass = (tab: "file" | "text") =>
    `flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
      activeTab === tab ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-transparent text-slate-400 hover:text-slate-200"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-800">
        <button type="button" onClick={() => onTabChange("file")} className={tabClass("file")}>
          <FileUp className="w-4 h-4" /> Subir Archivo (PDF, DOCX, TXT)
        </button>
        <button type="button" onClick={() => onTabChange("text")} className={tabClass("text")}>
          <FileText className="w-4 h-4" /> Pegar Texto del CV
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">Garantía de Fidelidad de Datos:</p>
          <p className="text-slate-400">
            Nuestro motor extrae exclusivamente los datos reales de tu documento. Lo que falte quedará catalogado como{" "}
            <strong>Pendiente de rellenar</strong> en tu auditoría para que lo completes a tu ritmo.
          </p>
        </div>
      </div>

      {activeTab === "file" ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); onDraggingChange(true); }}
            onDragLeave={() => onDraggingChange(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging ? "border-purple-400 bg-purple-500/10 scale-[1.01]" : "border-slate-700/80 hover:border-purple-500/60 bg-slate-900/40 hover:bg-slate-900/70"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Arrastra tu CV aquí o haz clic para seleccionarlo</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">Soporta PDFs nativos, documentos Word (.docx) o texto plano (máx. 2 MB).</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              <span>PDF</span><span>•</span><span>DOCX</span><span>•</span><span>TXT / Markdown</span><span>•</span>
              <span className="text-purple-300 font-medium">Hasta 2 MB</span>
            </div>
          </div>

          <CvSamplePdfCard onLoadSamplePdf={onLoadSamplePdf} isLoadingSamplePdf={isLoadingSamplePdf} isProcessing={false} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" /> Contenido textual de tu CV
            </label>
            <span className="text-[11px] text-slate-500 font-mono">{pastedCvText.length} / {MAX_CV_TEXT_CHARS.toLocaleString()} caracteres máx.</span>
          </div>
          <textarea
            rows={8}
            value={pastedCvText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder="Pega aquí el contenido completo de tu CV: experiencia, educación, habilidades, contacto..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onPasteText(pastedCvText)}
              disabled={!pastedCvText.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
            >
              <Sparkles className="w-4 h-4" /> Extraer Información Verídica
            </button>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400">¿Quieres ver cómo funciona de inmediato sin subir un archivo?</div>
        <button
          type="button"
          onClick={onLoadSampleText}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-purple-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Probar con CV de Muestra (Senior Engineer)
        </button>
      </div>

      {quotaExhausted && <CvQuotaBanner aiUsageCount={aiUsageCount} onRunLocalExtractor={onRunLocalExtractor} onShowProModal={onShowProModal} />}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
