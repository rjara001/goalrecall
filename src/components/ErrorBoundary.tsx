import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { formatFirestoreUiError, parseFirestoreErrorInfo } from "../utils/firestore/errors";

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const fsInfo = parseFirestoreErrorInfo(this.state.error);
    const uiMessage = formatFirestoreUiError(
      this.state.error,
      "Ocurrió un error inesperado al sincronizar tus datos."
    );

    return (
      <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#0B101D] border border-red-800/70 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700/60 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Error de Aplicación / Persistencia
              </h2>
              <p className="text-xs text-slate-400">
                La operación no se completó de forma segura.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-200 leading-relaxed break-words">
            {uiMessage}
          </div>

          {fsInfo && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>
                Operación: <span className="text-slate-200">{fsInfo.operationType}</span>
              </div>
              {fsInfo.path && (
                <div>
                  Ruta: <span className="text-slate-200">{fsInfo.path}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recargar Página</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
