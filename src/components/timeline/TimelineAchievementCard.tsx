import React from "react";
import {
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Globe,
  GripVertical,
  HelpCircle,
  Layers,
  Lock,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import { LogEntry } from "../../types";
import { useI18n } from "../../i18n";
import { TimelineViewLocale } from "../../i18n/viewLocales";
import { isLogIncludedInCv } from "../../utils/bulletToLogMapper";
import { formatRelativeUpdatedTime, isRecentlyUpdatedLog } from "./timelineUtils";

interface TimelineAchievementCardProps {
  log: LogEntry;
  tl: TimelineViewLocale;
  expandedFields: Record<string, boolean>;
  onToggleField: (key: string) => void;
  onSelectTag: (tag: string) => void;
  onTogglePublic: (id: string) => void;
  onToggleIncludeInCv?: (id: string) => void;
  onDuplicateLog: (entry: LogEntry) => void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  dropIndicator?: "before" | "after" | null;
  onDragStartCard?: (e: React.DragEvent<HTMLElement>) => void;
  onDragOverCard?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropCard?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEndCard?: () => void;
  nowMs?: number;
  isFocused?: boolean;
}

export const TimelineAchievementCard: React.FC<TimelineAchievementCardProps> = ({
  log,
  tl,
  expandedFields,
  onToggleField,
  onSelectTag,
  onTogglePublic,
  onToggleIncludeInCv,
  onDuplicateLog,
  onEditLog,
  onDeleteLog,
  isDraggable = false,
  isDragging = false,
  dropIndicator = null,
  onDragStartCard,
  onDragOverCard,
  onDropCard,
  onDragEndCard,
  nowMs = Date.now(),
  isFocused = false,
}) => {
  const { language } = useI18n();
  const includedInCv = isLogIncludedInCv(log);
  const isRecent = isRecentlyUpdatedLog(log, nowMs);
  const relativeUpdated = isRecent
    ? formatRelativeUpdatedTime(log.updatedAt, nowMs, language)
    : null;
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    const cardEl = e.currentTarget.closest("[data-log-id]");
    if (cardEl instanceof HTMLElement && typeof e.dataTransfer.setDragImage === "function") {
      e.dataTransfer.setDragImage(cardEl, 20, 20);
    }
    onDragStartCard?.(e);
  };

  const handleDragEnd = () => {
    onDragEndCard?.();
  };

  return (
    <div className="space-y-1.5">
      {dropIndicator === "before" && <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />}
      <div
        data-log-id={log.id}
        onDragOver={isDraggable ? onDragOverCard : undefined}
        onDrop={isDraggable ? onDropCard : undefined}
        className={`p-4 hover:bg-slate-900 border rounded-xl transition-all group ${
          isDragging
            ? "opacity-50 border-cyan-500/60 bg-slate-900/80"
            : isFocused
              ? "border-cyan-400 ring-2 ring-cyan-400/70 bg-slate-900"
              : isRecent
                ? "border-cyan-500/45 bg-slate-900/95"
                : "border-slate-800 hover:border-slate-700/80 bg-slate-900/80"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-400 font-medium">
            {isDraggable && (
              <span
                draggable
                data-drag-handle="true"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400 hover:bg-slate-800/80 p-1 -m-0.5 rounded shrink-0 select-none transition-colors"
                title="Arrastrar desde este ícono para subir o bajar este logro"
                aria-label="Arrastrar para reordenar"
              >
                <GripVertical className="w-4 h-4" />
              </span>
            )}
            <span className="text-slate-200 font-semibold">{log.project}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="font-mono text-slate-400">{log.date}</span>
            {isRecent && relativeUpdated && (
              <span className="text-[10px] font-mono tabular-nums text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                {language === "en"
                  ? `Recent · ${relativeUpdated}`
                  : `Reciente · ${relativeUpdated}`}
              </span>
            )}
          </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700/60">
            {log.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
              includedInCv
                ? "text-cyan-300 bg-cyan-950/60 border-cyan-800/50"
                : "text-slate-400 bg-slate-800/70 border-slate-700/60"
            }`}
          >
            {includedInCv ? "En CV" : "Solo Bitácora"}
          </span>

          {log.isPublic ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              <Eye className="w-3 h-3" />
              Público
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              Bóveda Privada
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase block mb-1">
          {tl.achievementCvBulletLabel}
        </span>
        <h4 className="text-sm font-semibold text-white leading-relaxed whitespace-pre-wrap group-hover:text-cyan-100 transition-colors">
          {log.title}
        </h4>
      </div>

      <div className="space-y-2 mb-3">
        <div className="p-2.5 bg-slate-950/80 border border-emerald-950/60 rounded-lg flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
              {tl.impactXyzLabel}
            </span>
            <p className="text-xs text-emerald-200 font-mono font-medium leading-relaxed whitespace-pre-wrap">
              {log.impact}
            </p>
          </div>
        </div>

        {log.whatWasSought && (
          <div className="border border-indigo-950/70 rounded-lg overflow-hidden bg-slate-950/50">
            <button
              type="button"
              onClick={() => onToggleField(`${log.id}-what`)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-indigo-300 hover:bg-slate-900/60 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold">
                  {expandedFields[`${log.id}-what`] ? "−" : "+"} ¿Qué se buscaba lograr?
                </span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400/70 shrink-0 ml-2">
                {expandedFields[`${log.id}-what`] ? "Ocultar" : "Ver"}
              </span>
            </button>
            {expandedFields[`${log.id}-what`] && (
              <div className="px-3 pb-2.5 pt-1 text-xs text-slate-300 border-t border-indigo-950/70 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-100">
                {log.whatWasSought}
              </div>
            )}
          </div>
        )}

        {log.whyImportant && (
          <div className="border border-amber-950/70 rounded-lg overflow-hidden bg-slate-950/50">
            <button
              type="button"
              onClick={() => onToggleField(`${log.id}-why`)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-amber-300 hover:bg-slate-900/60 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">
                  {expandedFields[`${log.id}-why`] ? "−" : "+"} ¿Por qué era importante?
                </span>
              </span>
              <span className="text-[10px] font-mono text-amber-400/70 shrink-0 ml-2">
                {expandedFields[`${log.id}-why`] ? "Ocultar" : "Ver"}
              </span>
            </button>
            {expandedFields[`${log.id}-why`] && (
              <div className="px-3 pb-2.5 pt-1 text-xs text-slate-300 border-t border-amber-950/70 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-100">
                {log.whyImportant}
              </div>
            )}
          </div>
        )}

        {log.howApplied && (
          <div className="border border-cyan-950/70 rounded-lg overflow-hidden bg-slate-950/50">
            <button
              type="button"
              onClick={() => onToggleField(`${log.id}-how`)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-cyan-300 hover:bg-slate-900/60 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold">
                  {expandedFields[`${log.id}-how`] ? "−" : "+"} ¿Cómo se aplicó la solución?
                </span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400/70 shrink-0 ml-2">
                {expandedFields[`${log.id}-how`] ? "Ocultar" : "Ver"}
              </span>
            </button>
            {expandedFields[`${log.id}-how`] && (
              <div className="px-3 pb-2.5 pt-1 text-xs text-slate-300 border-t border-cyan-950/70 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-100">
                {log.howApplied}
              </div>
            )}
          </div>
        )}

        {log.description && (
          <div className="border border-purple-950/70 rounded-lg overflow-hidden bg-slate-950/50">
            <button
              type="button"
              onClick={() => onToggleField(`${log.id}-desc`)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-xs text-purple-300 hover:bg-slate-900/60 transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 font-medium truncate">
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-semibold">
                  {expandedFields[`${log.id}-desc`] ? "−" : "+"} Detalle o Descripción
                </span>
              </span>
              <span className="text-[10px] font-mono text-purple-400/70 shrink-0 ml-2">
                {expandedFields[`${log.id}-desc`] ? "Ocultar" : "Explayarse"}
              </span>
            </button>
            {expandedFields[`${log.id}-desc`] && (
              <div className="px-3 pb-2.5 pt-1 text-xs text-slate-300 border-t border-purple-950/70 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-100">
                {log.description}
              </div>
            )}
          </div>
        )}
      </div>

      {log.originalBullet && log.originalBullet !== log.title && (
        <div className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/80 mb-2 flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {tl.originalBulletLabel} "{log.originalBullet}"
          </span>
        </div>
      )}

      {log.tags && log.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          {log.tags.map((tag) => (
            <span
              key={tag}
              data-no-drag="true"
              onClick={() => onSelectTag(tag)}
              className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/30 border border-cyan-800/30 px-2 py-0.5 rounded hover:border-cyan-500 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onTogglePublic(log.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              log.isPublic
                ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {log.isPublic ? (
              <>
                <EyeOff className="w-3 h-3 text-emerald-400" />
                <span>{tl.unpublishBtn}</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Publicar en Public Deck</span>
              </>
            )}
          </button>

          {onToggleIncludeInCv && (
            <button
              type="button"
              onClick={() => onToggleIncludeInCv(log.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                includedInCv
                  ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title={
                includedInCv
                  ? "Aparece como viñeta en su Experiencia y CV (clic para mover a Solo Bitácora)"
                  : "Oculto del CV (clic para incluirlo como viñeta en su Experiencia)"
              }
            >
              <FileText className="w-3 h-3" />
              <span>{includedInCv ? "En CV" : "Solo Bitácora"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => onDuplicateLog(log)}
            title="Duplicar entrada"
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEditLog(log)}
            title={tl.editLogTooltip}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLog(log.id)}
            title={tl.deleteLogTooltip}
            className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      </div>
      {dropIndicator === "after" && <div className="h-0.5 bg-cyan-400 rounded-full mx-1" />}
    </div>
  );
};
