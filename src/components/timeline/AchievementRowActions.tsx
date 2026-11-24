import React, { useEffect, useRef } from "react";
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  History,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { LogEntry } from "../../types";
import { useI18n } from "../../i18n";
import {
  formatHistoryButtonLabel,
  normalizeRevisionUpdatesCount,
} from "../../utils/revisions/snapshot";

interface AchievementRowActionsProps {
  log: LogEntry;
  isOpen: boolean;
  onToggleOpen: () => void;
  onCloseMenu: () => void;
  onEdit?: (entry: LogEntry) => void;
  onOpenHistory?: (entry: LogEntry) => void;
  onToggleIncludeInCv?: (id: string) => void;
  onDelete?: (id: string) => void;
  deleteTooltip?: string;
  isIncludedInCv: boolean;
  showLinkedIndicator?: boolean;
}

export const AchievementRowActions: React.FC<AchievementRowActionsProps> = ({
  log,
  isOpen,
  onToggleOpen,
  onCloseMenu,
  onEdit,
  onOpenHistory,
  onToggleIncludeInCv,
  onDelete,
  deleteTooltip,
  isIncludedInCv,
  showLinkedIndicator = false,
}) => {
  const { language } = useI18n();
  const isEn = language === "en";
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        onCloseMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCloseMenu]);

  const updatesCount = normalizeRevisionUpdatesCount(log.updatesCount);
  const historyFullLabel = formatHistoryButtonLabel(
    log.updatesCount,
    isEn ? "en" : "es"
  );
  const editLabel = isEn
    ? "Edit title, impact and STAR details"
    : "Editar título, impacto y detalles STAR del logro";
  const linkedLabel = isEn
    ? "Linked achievement in your logbook"
    : "Logro vinculado en tu bitácora";
  const moreActionsLabel = isEn ? "More actions" : "Más acciones";
  const hasSecondaryActions = Boolean(
    onOpenHistory || onToggleIncludeInCv || onDelete
  );

  return (
    <div
      ref={menuContainerRef}
      className="relative flex items-center gap-1 shrink-0"
      data-no-drag="true"
    >
      {showLinkedIndicator && (
        <span
          className="inline-flex items-center justify-center w-6 h-8 text-emerald-400/90 shrink-0"
          title={linkedLabel}
          aria-label={linkedLabel}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </span>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={() => {
            onCloseMenu();
            onEdit(log);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 hover:text-cyan-200 transition-colors shrink-0"
          title={editLabel}
          aria-label={isEn ? "Edit achievement" : "Editar logro"}
        >
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      )}

      {onOpenHistory && (
        <button
          type="button"
          onClick={() => {
            onCloseMenu();
            onOpenHistory(log);
          }}
          className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-cyan-200 text-[11px] font-mono font-semibold tabular-nums transition-colors shrink-0 whitespace-nowrap"
          title={historyFullLabel}
          aria-label={historyFullLabel}
        >
          <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {updatesCount > 0 && <span>({updatesCount})</span>}
        </button>
      )}

      {hasSecondaryActions && (
        <>
          <button
            type="button"
            onClick={onToggleOpen}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            title={moreActionsLabel}
            aria-label={moreActionsLabel}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors shrink-0 ${
              isOpen
                ? "bg-slate-700 border-cyan-500/60 text-white"
                : "bg-slate-800/90 hover:bg-slate-700 border-slate-700/80 text-slate-400 hover:text-white"
            }`}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isOpen && (
            <div
              role="menu"
              aria-label={moreActionsLabel}
              className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[#0B101D] border border-slate-700/90 shadow-2xl py-1.5 z-40 animate-in fade-in duration-100"
            >
              {onOpenHistory && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu();
                    onOpenHistory(log);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center justify-between gap-2 transition-colors whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {isEn ? "Version history" : "Ver historial"}
                    </span>
                  </span>
                  {updatesCount > 0 && (
                    <span className="text-[11px] font-mono tabular-nums text-cyan-300">
                      ({updatesCount})
                    </span>
                  )}
                </button>
              )}

              {onToggleIncludeInCv && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseMenu();
                    onToggleIncludeInCv(log.id);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 hover:text-amber-200 flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  {isIncludedInCv ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {isEn
                          ? "Hide from CV (keep in logbook)"
                          : "Quitar del CV (solo bitácora)"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {isEn ? "Include in CV" : "Incluir en CV"}
                      </span>
                    </>
                  )}
                </button>
              )}

              {onDelete && (
                <>
                  {(onOpenHistory || onToggleIncludeInCv) && (
                    <div
                      className="my-1 border-t border-slate-800"
                      role="separator"
                    />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseMenu();
                      onDelete(log.id);
                    }}
                    title={deleteTooltip}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-red-300 hover:bg-red-950/50 hover:text-red-200 flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>
                      {isEn ? "Delete achievement" : "Eliminar logro"}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
