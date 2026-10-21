import React, { useState } from "react";
import { 
  X, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Database,
  FileJson
} from "lucide-react";
import { 
  exportBackupJson, 
  importBackupJson 
} from "../utils/storage";

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  totalLogs: number;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  totalLogs,
}) => {
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goal-recall-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackupJson(content);
      if (result.success) {
        setImportStatus({
          success: true,
          msg: `¡Respaldo importado con éxito! Se cargaron ${result.count} logros y tus experiencias.`,
        });
        onDataChanged();
      } else {
        setImportStatus({
          success: false,
          msg: result.error || "No se pudo importar el archivo.",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Copia de Seguridad (Respaldo JSON)
              </h3>
              <p className="text-[11px] text-slate-400">
                Guarda o restaura tu historial en tu propia computadora
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Notification Feedback */}
          {importStatus && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                importStatus.success
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/60 border-red-500/40 text-red-300"
              }`}
            >
              {importStatus.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{importStatus.msg}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-xs">Descargar Respaldo Completo</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Guarda un archivo <code className="text-cyan-300 font-mono">.json</code> con tus {totalLogs} logros, empresas, viñetas y mensajes para tener una copia física siempre segura.
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-sm shadow-cyan-500/20"
            >
              <FileJson className="w-4 h-4" />
              <span>Exportar Respaldo (.json)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                <Upload className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-xs">Restaurar Respaldo</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Si cambias de computadora o navegador, selecciona tu archivo <code className="text-purple-300 font-mono">.json</code> para recuperar todo tu historial instantáneamente.
                </p>
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 hover:border-cyan-500 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer text-slate-200 hover:text-white transition-colors font-medium">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Cargar Archivo .json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
