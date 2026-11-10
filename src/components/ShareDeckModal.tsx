import React, { useState, useEffect } from "react";
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Lock, 
  Linkedin, 
  MessageSquare,
  Bot
} from "lucide-react";
import { LogEntry, Product, UserProfile, WorkExperience } from "../types";
import { generatePublicDeckShareUrl } from "../utils/publicDeckShare";

interface ShareDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  logs: LogEntry[];
  products: Product[];
  experiences?: WorkExperience[];
}

export const ShareDeckModal: React.FC<ShareDeckModalProps> = ({
  isOpen,
  onClose,
  user,
  logs,
  products,
  experiences = [],
}) => {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [cleanHandleUrl, setCleanHandleUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCleanLink, setCopiedCleanLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const publicLogs = logs.filter((l) => l.isPublic);
  const privateLogsCount = logs.filter((l) => !l.isPublic).length;
  const publicProducts = products.filter((p) => p.isPublic !== false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://goalrecall.com";
    const userHandle = user.username || (user.email ? user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "") : "usuario");
    setCleanHandleUrl(`${origin}/u/${userHandle}`);

    generatePublicDeckShareUrl(user, logs, products, experiences)
      .then((url) => {
        if (isMounted) {
          setShareUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error("Error generating share url:", err);
        if (isMounted) {
          setShareUrl(`${origin}/u/${userHandle}`);
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user, logs, products, experiences]);

  if (!isOpen) return null;

  const activePrimaryUrl = cleanHandleUrl || shareUrl;

  const handleCopyCleanLink = () => {
    if (!activePrimaryUrl) return;
    navigator.clipboard.writeText(activePrimaryUrl);
    setCopiedCleanLink(true);
    setTimeout(() => setCopiedCleanLink(false), 2500);
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const recruiterMessage = `Hola, te comparto mi vitrina técnica interactiva en GoalRecall:
${activePrimaryUrl}

Aquí puedes revisar mis logros y productos con métricas verificadas, tecnologías y consultar a mi asistente First Mate AI sobre cualquier detalle de mi trayectoria.

Quedo a tu disposición para conversar sobre la oportunidad.
Saludos,
${user.name || "Usuario"}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(recruiterMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleOpenPreview = () => {
    if (!shareUrl) return;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#090D16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-deck-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-deck-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Compartir Vitrina con Recruiter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Enlace Público Directo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Comparte tus logros verificados y portafolio sin exponer tu Bóveda Privada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* 1. Clean Direct URL Box (/u/:username) */}
          <div className="space-y-2 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40 border border-emerald-500/30">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enlace Directo de Usuario (Recomendado)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Limpio & Corto
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={cleanHandleUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 selection:bg-emerald-900 selection:text-white truncate font-bold"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCleanLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {copiedCleanLink ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.open(cleanHandleUrl, "_blank", "noopener,noreferrer")}
                  title="Abrir vitrina pública en nueva pestaña"
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Quien abra este enlace verá únicamente tus logros y productos públicos en <strong>goalrecall/u/{user.username || "usuario"}</strong>.
            </p>
          </div>

          {/* 1.1 Snapshot URL Box (Compressed Payload Fallback) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Enlace Snapshot Independiente (Offline/Backup)</span>
              {publicLogs.length > 0 ? (
                <span className="text-[11px] text-slate-400 font-mono">
                  {publicLogs.length} logro(s) público(s)
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-mono">
                  0 logros públicos
                </span>
              )}
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={isGenerating ? "Generando..." : shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-400 focus:outline-none truncate"
                />
              </div>

              <button
                type="button"
                disabled={isGenerating || !shareUrl}
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {/* 2. Message Template for LinkedIn / Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mensaje Listo para Recruiter (LinkedIn o Email)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Mensaje Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl font-mono text-[11px] text-slate-300 leading-relaxed space-y-2">
              <p className="text-slate-400">// Mensaje preformateado con enlace directo:</p>
              <div className="bg-[#070A11] p-3 rounded-xl border border-slate-800/80 text-slate-200 whitespace-pre-wrap select-all">
                {recruiterMessage}
              </div>
            </div>
          </div>

          {/* 3. Security & Privacy Audit */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantía de Privacidad en este Enlace</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                100% Sin Fuga de Datos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <Eye className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Logros Públicos: {publicLogs.length}</strong>
                  <span className="text-[11px] text-slate-400">
                    Solo los logros con visibilidad pública se incluyen en la vitrina.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Bóveda Privada: {privateLogsCount} protegidos</strong>
                  <span className="text-[11px] text-slate-400">
                    Tus notas de trabajo, métricas internas y datos bajo NDA no se comparten.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-300">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">First Mate AI Aislado</strong>
                  <span className="text-[11px] text-slate-400">
                    El agente responde dudas del recruiter citando solo tus logros públicos.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-300">
                <Linkedin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Contacto & Recados</strong>
                  <span className="text-[11px] text-slate-400">
                    El recruiter puede contactarte directo o dejar notas en tu buzón privado.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Practical Instructions */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>¿Dónde y cómo usar este enlace?</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside">
              <li>
                <strong>En tu CV / Currículum:</strong> Colócalo en la cabecera como <em>"Vitrina Técnica Interactiva: [enlace]"</em>.
              </li>
              <li>
                <strong>En LinkedIn:</strong> Agrégalo en tu sección <em>"Destacados"</em> o en tu titular profesional.
              </li>
              <li>
                <strong>Respuestas a Reclutadores:</strong> Cuando un recruiter te escriba preguntando por tu experiencia o proyectos, envíale el mensaje preformateado.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070A11] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            GoalRecall · Executive Showcase Share
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
