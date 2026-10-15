import React, { useState } from "react";
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Check, 
  AlertCircle,
  Database
} from "lucide-react";
import { 
  exportBackupJson, 
  importBackupJson, 
  resetToDemoData 
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
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captains-log-backup-${new Date().toISOString().substring(0, 10)}.json`;
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
          msg: `¡Respaldo importado con éxito! Se cargaron ${result.count} logros.`,
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

  const handleReset = () => {
    resetToDemoData();
    setIsResetting(false);
    onDataChanged();
    setImportStatus({
      success: true,
      msg: "Se han restaurado los datos de demostración predeterminados.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ajustes & Respaldo de Datos (Local-First)
              </h3>
              <p className="text-[11px] text-slate-400">
                Soberanía total: exporta o transfiere tus registros
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
        <div className="p-6 space-y-6 text-xs">
          
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
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Exportar Respaldo Completo (JSON)</h4>
                <p className="text-[11px] text-slate-400">
                  Descarga un archivo con tus {totalLogs} logros, perfil y recados del inbox.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div>
              <h4 className="font-bold text-white">Importar Respaldo</h4>
              <p className="text-[11px] text-slate-400">
                Restaura registros desde otro ordenador o dispositivo personal.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl bg-slate-950/50 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Seleccionar archivo .json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-300">Restaurar Datos de Muestra</h4>
              <p className="text-[11px] text-slate-500">
                Recarga los registros de prueba para demostración y evaluación rápida.
              </p>
            </div>
            {isResetting ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setIsResetting(false)}
                  className="px-2 text-slate-400 hover:text-white"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsResetting(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
