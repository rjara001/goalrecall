import React from "react";
import { AlertCircle, Check, Download, FileJson, Upload } from "lucide-react";
import { SettingsLocaleText } from "./settingsLocales";

interface SettingsBackupTabProps {
  st: SettingsLocaleText;
  importStatus: { success: boolean; msg: string } | null;
  onExport: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsBackupTab: React.FC<SettingsBackupTabProps> = ({
  st,
  importStatus,
  onExport,
  onFileUpload,
}) => {
  return (
    <div className="space-y-4">
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

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-xs">{st.exportTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{st.exportDesc}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-sm shadow-cyan-500/20"
        >
          <FileJson className="w-4 h-4" />
          <span>{st.exportBtn}</span>
        </button>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
            <Upload className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-xs">{st.restoreTitle}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{st.restoreDesc}</p>
          </div>
        </div>

        <label className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 hover:border-cyan-500 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer text-slate-200 hover:text-white transition-colors font-medium">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>{st.loadJsonBtn}</span>
          <input type="file" accept=".json" onChange={onFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
};
