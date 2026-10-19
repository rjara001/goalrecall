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
  Database,
  Key,
  Trash2
} from "lucide-react";
import { 
  exportBackupJson, 
  importBackupJson, 
  resetToDemoData,
  saveLogs,
  saveInbox
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
  const [isClearing, setIsClearing] = useState(false);

  // Google OAuth Client ID setting
  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem("goal_recall_google_client_id") || "";
  });
  const [clientIdSaved, setClientIdSaved] = useState(false);

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

  const handleClearAll = () => {
    saveLogs([]);
    saveInbox([]);
    setIsClearing(false);
    onDataChanged();
    setImportStatus({
      success: true,
      msg: "Se han eliminado todos los registros. Tu bitácora está limpia desde cero.",
    });
  };

  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = googleClientId.trim();
    if (clean) {
      localStorage.setItem("goal_recall_google_client_id", clean);
    } else {
      localStorage.removeItem("goal_recall_google_client_id");
    }
    setClientIdSaved(true);
    setTimeout(() => setClientIdSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ajustes & Configuración del Sistema
              </h3>
              <p className="text-[11px] text-slate-400">
                Google OAuth, Respaldos y Persistencia Local
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
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
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

          {/* Section: Google OAuth Configuration */}
          <div className="p-4 bg-slate-900/80 border border-cyan-900/50 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Key className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Google OAuth Client ID</h4>
                <p className="text-[11px] text-slate-400">
                  Para autenticar con ventana emergente de Google en tu aplicación
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGoogleClientId} className="space-y-2 pt-1">
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                placeholder="ej. 123456789-abcdef.apps.googleusercontent.com"
                className="w-full bg-[#080C14] border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {localStorage.getItem("goal_recall_google_client_id") ? "✓ Client ID guardado en tu navegador" : "Sin configurar (usa el botón predeterminado)"}
                </span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-sm shadow-cyan-500/20"
                >
                  {clientIdSaved ? <Check className="w-3.5 h-3.5 text-slate-950" /> : null}
                  <span>{clientIdSaved ? "¡Guardado!" : "Guardar Client ID"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Export Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Exportar Respaldo Completo (JSON)</h4>
                <p className="text-[11px] text-slate-400">
                  Descarga tus {totalLogs} logros, perfil y recados del inbox.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white font-semibold rounded-lg transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2.5">
            <div>
              <h4 className="font-bold text-white">Importar Respaldo</h4>
              <p className="text-[11px] text-slate-400">
                Restaura registros desde otro ordenador o dispositivo personal.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl bg-slate-950/50 cursor-pointer text-slate-300 hover:text-white transition-colors">
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
                Recarga los registros de prueba predeterminados.
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

          {/* Clear all data (Start clean from zero) */}
          <div className="p-4 bg-slate-950/80 border border-red-950/60 rounded-xl flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-red-300">Vaciar Bitácora (Iniciar de Cero)</h4>
              <p className="text-[11px] text-slate-500">
                Elimina todos los registros locales para empezar totalmente en blanco.
              </p>
            </div>
            {isClearing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                >
                  Confirmar Borrado
                </button>
                <button
                  onClick={() => setIsClearing(false)}
                  className="px-2 text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsClearing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 rounded-lg border border-red-800/40 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Todo</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
