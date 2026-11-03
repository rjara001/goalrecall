import React from "react";
import { 
  Rocket, 
  ExternalLink, 
  Github, 
  Zap, 
  Globe, 
  Layers, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Code2,
  Sparkles
} from "lucide-react";
import { Product, LogEntry } from "../types";

interface ProductCardProps {
  product: Product;
  relatedLogs?: LogEntry[];
  onSelectLog?: (log: LogEntry) => void;
  isOwner?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onTogglePublic?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  relatedLogs = [],
  onSelectLog,
  isOwner = false,
  onEdit,
  onDelete,
  onTogglePublic,
}) => {
  const badgeLabel = product.badge || "SaaS / Propio";

  return (
    <div className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg shadow-black/20 flex flex-col">
      {/* Top Bar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
            <Rocket className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {product.title}
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm">
                [ {badgeLabel} ]
              </span>
              {isOwner && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  product.isPublic
                    ? "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
                    : "bg-amber-950/70 text-amber-300 border-amber-800/60"
                }`}>
                  {product.isPublic ? "Público" : "Bóveda Privada"}
                </span>
              )}
            </div>
            {product.tagline && (
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {product.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Owner Quick Controls */}
        {isOwner && (
          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            {onTogglePublic && (
              <button
                type="button"
                onClick={() => onTogglePublic(product.id)}
                title={product.isPublic ? "Ocultar de la vitrina pública" : "Hacer público en vitrina"}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  product.isPublic
                    ? "text-emerald-400 border-emerald-800/60 bg-emerald-950/50 hover:bg-emerald-900/50"
                    : "text-amber-400 border-amber-800/60 bg-amber-950/50 hover:bg-amber-900/50"
                }`}
              >
                {product.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                title="Editar producto"
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                title="Eliminar producto"
                className="p-1.5 rounded-lg border border-red-900/50 bg-red-950/30 text-red-400 hover:text-red-200 hover:bg-red-900/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Preview / Screenshot */}
        {product.imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-48 sm:h-56 object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
              onError={(e) => {
                // Graceful fallback if external URL fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {product.liveUrl && (
              <a
                href={product.liveUrl.startsWith("http") ? product.liveUrl : `https://${product.liveUrl}`}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-semibold backdrop-blur border border-slate-700/80 transition-all shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Sitio</span>
              </a>
            )}
          </div>
        ) : (
          <div className="h-32 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center text-slate-500 gap-2">
            <Code2 className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-mono">Sin captura de pantalla asociada</span>
          </div>
        )}

        {/* Technical Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {product.description}
        </p>

        {/* Tech Stack Pills */}
        {product.techStack && product.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.techStack.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#080C14] border border-slate-800 text-cyan-300/90 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* External Links Bar */}
        {(product.liveUrl || product.repoUrl) && (
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            {product.liveUrl && (
              <a
                href={product.liveUrl.startsWith("http") ? product.liveUrl : `https://${product.liveUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{product.liveUrl.replace(/^https?:\/\//, "")}</span>
              </a>
            )}

            {product.liveUrl && product.repoUrl && (
              <span className="text-slate-700">│</span>
            )}

            {product.repoUrl && (
              <a
                href={product.repoUrl.startsWith("http") ? product.repoUrl : `https://${product.repoUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-medium hover:underline"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Repositorio GitHub</span>
              </a>
            )}
          </div>
        )}

        {/* Associated Architecture Achievements (Google XYZ) */}
        {relatedLogs.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/90 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              <span>Logros de Arquitectura Asociados:</span>
            </div>
            <div className="space-y-2">
              {relatedLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => onSelectLog?.(log)}
                  className={`p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs transition-colors ${
                    onSelectLog ? "cursor-pointer hover:border-emerald-500/40 hover:bg-slate-950" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium leading-snug">
                        {log.title}
                      </p>
                      {log.impact && (
                        <p className="text-[11px] font-mono text-emerald-300 mt-1">
                          ⚡ {log.impact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
