import React, { useState } from "react";
import { Check, CheckCircle2, Crown, Sparkles, X } from "lucide-react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  proEmail: string;
  onProEmailChange: (email: string) => void;
  proEmailSaved: boolean;
  onSaveProEmail: (email: string) => void;
  onUpgradeToPro?: () => Promise<void>;
}

const PRO_FEATURES = [
  { title: "Extracciones de CV ilimitadas", detail: "(sin límites mensuales ni tiempos de espera)." },
  { title: "Generación de CV personalizado", detail: "(ajustado al 80/20 de cada oferta)." },
  { title: "Preparador de entrevistas STAR", detail: "enfocado en las preguntas clave de la vacante." },
  { title: "Historial de preguntas y respuestas", detail: "para postulaciones repetidas." },
];

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen, onClose, proEmail, onProEmailChange, proEmailSaved, onSaveProEmail, onUpgradeToPro,
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!onUpgradeToPro) return;
    setIsUpgrading(true);
    try {
      await onUpgradeToPro();
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0B0F19] border border-purple-500/50 rounded-2xl p-6 shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Plan Pro · Acceso Ilimitado & Suite de Carrera</h3>
              <p className="text-[11px] text-slate-400">Para desarrolladores en búsqueda activa o en fase de optimización de perfil.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ¿Qué incluye el Plan Pro?
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {PRO_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{f.title}</strong> {f.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {onUpgradeToPro && (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isUpgrading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              {isUpgrading ? "Redirigiendo a pago..." : "Actualizar a Plan Pro"}
            </button>
          )}

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="text-xs text-purple-200">
              <p className="font-semibold text-white mb-0.5">Únete a la lista de espera con 50% de descuento:</p>
              <p className="text-[11px] text-slate-300">Déjanos tu correo para notificarte el lanzamiento y recibir tu descuento preferencial.</p>
            </div>
            {proEmailSaved ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>¡Listo! Registramos tu correo con prioridad de acceso.</span>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); onSaveProEmail(proEmail); }} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={proEmail}
                  onChange={(e) => onProEmailChange(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/30"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  Anotarme
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-500">Tu cuenta actual sigue funcionando al 100% sin costo alguno.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
