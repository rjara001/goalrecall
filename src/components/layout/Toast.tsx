import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, Info, AlertTriangle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  toast: ToastItem | null;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast, dismissToast }}>
      {children}
      {toast && <ToastContainer toast={toast} onDismiss={dismissToast} />}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      showToast: (msg: string) => console.log("[Toast]", msg),
      toast: null,
      dismissToast: () => {},
    };
  }
  return context;
}

export const ToastContainer: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 max-w-md">
      {toast.type === "success" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
      {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
      {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
      {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span className="text-xs font-medium text-slate-100 flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
