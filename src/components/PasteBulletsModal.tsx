import React, { useState } from "react";
import { 
  X, 
  FileText, 
  Sparkles, 
  Layers, 
  Check, 
  Building, 
  FolderGit2, 
  Lock, 
  AlertCircle,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { LogEntry } from "../types";

interface PasteBulletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLogs: (logs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => void;
  onOpenCvModal?: () => void;
}

export const PasteBulletsModal: React.FC<PasteBulletsModalProps> = ({
  isOpen,
  onClose,
  onImportLogs,
  onOpenCvModal,
}) => {
  const [rawText, setRawText] = useState("");
  const [defaultClient, setDefaultClient] = useState("Cliente General");
  const [defaultProject, setDefaultProject] = useState("Core Platform");
  const [defaultCategory, setDefaultCategory] = useState<LogEntry["category"]>("Feature ✨");

  if (!isOpen) return null;

  // Split lines into potential bullet items (by bullet points •, -, *, or line breaks)
  const lines = rawText
    .split(/\n+/)
    .map((l) => l.replace(/^[\s•\-\*\d\.\)\>]+/, "").trim())
    .filter((l) => l.length > 8);

  const handleImport = () => {
    if (lines.length === 0) return;

    const newLogs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[] = lines.map((line) => {
      // Basic smart metric heuristic
      const metricMatch = line.match(/(\d+[\%|\$|k|ms|s|x|min|hr|req]+|reduc|increas|mejor|optimi)[^\,\.\;]*/i);
      const impactText = metricMatch ? metricMatch[0] : "Impacto técnico relevante en el entregable";

      return {
        date: new Date().toISOString().substring(0, 10),
        client: defaultClient.trim() || "Cliente General",
        project: defaultProject.trim() || "Core Platform",
        category: defaultCategory,
        title: line, // Logro multilínea completo (la viñeta cargada)
        description: line,
        impact: impactText,
        tags: ["#Importado", "#Viñeta"],
        isPublic: false, // Default strictly to private sandbox
      };
    });

    onImportLogs(newLogs);
    setRawText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pegar Viñetas en Bruto</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Ingesta Rápida
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Pega viñetas directas de tu bitácora o Jira. Se convertirán en logros protegidos en tu Sandbox.
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

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cliente / Empresa</span>
              </label>
              <input
                type="text"
                value={defaultClient}
                onChange={(e) => setDefaultClient(e.target.value)}
                placeholder="ej. Acme Corp"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Proyecto</span>
              </label>
              <input
                type="text"
                value={defaultProject}
                onChange={(e) => setDefaultProject(e.target.value)}
                placeholder="ej. Payments Gateway"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Categoría Inicial</span>
              </label>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value as any)}
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="Feature ✨">Feature ✨</option>
                <option value="Fix 🐛">Fix 🐛</option>
                <option value="Refactor 🧹">Refactor 🧹</option>
                <option value="Architecture 🏗️">Architecture 🏗️</option>
                <option value="Infra/DevOps 🚀">Infra/DevOps 🚀</option>
                <option value="Spike/R&D 🔬">Spike/R&D 🔬</option>
              </select>
            </div>
          </div>

          {onOpenCvModal && (
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>¿Tienes un CV o quieres que la IA detecte empresas, proyectos y métricas Google XYZ automáticamente?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCvModal();
                }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shrink-0 text-[11px] transition-colors"
              >
                Abrir Extractor CV
              </button>
            </div>
          )}

          {/* Raw Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pega las viñetas aquí (1 por línea o con guiones/viñetas):</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {lines.length} {lines.length === 1 ? "viñeta detectada" : "viñetas detectadas"}
              </span>
            </div>

            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`• Rediseñé el pipeline CI/CD en GitHub Actions reduciendo el build time en un 45%.
• Migré la base de datos de usuarios a Postgres 16 con cero downtime para 150k usuarios.
• Implementé rate-limiting con Redis para mitigar ataques DDoS en la API pública.`}
              className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
            />
          </div>

          {/* Parsing Preview Shell */}
          {lines.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Vista Previa de Extracción ({lines.length})
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Se guardarán en Sandbox Privado
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {lines.map((line, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium leading-relaxed">{line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-400">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Todos los logros importados entran por defecto en tu <strong>Sandbox Privado</strong>. Podrás editarlos o publicarlos en tu Public Deck cuando quieras.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={lines.length === 0}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              lines.length > 0
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>Crear {lines.length} {lines.length === 1 ? "Logro" : "Logros"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
