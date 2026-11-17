import React, { useState } from "react";
import {
  Inbox,
  Trash2,
  Check,
  Copy,
  Building,
  Clock,
  Send,
  ExternalLink,
  GitPullRequest,
  GitBranch,
  Ticket,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { UserProfile, VisitorMessage } from "../types";
import { useI18n } from "../i18n";
import { MODALS_LOCALES } from "../i18n/modalsLocales";
import { EcosystemIngestPanel } from "./inbox/EcosystemIngestPanel";

interface InboxViewProps {
  messages: VisitorMessage[];
  userProfile?: UserProfile | null;
  onMarkRead: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onIngestSuggestions?: (
    suggestions: VisitorMessage[]
  ) => { addedCount: number; skippedCount: number };
  onConvertSuggestionToLog?: (msg: VisitorMessage) => void;
  onQuickSaveSuggestion?: (msg: VisitorMessage) => void;
}

type InboxFilter = "all" | "ecosystem" | "visitors" | "unread";

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  userProfile,
  onMarkRead,
  onDeleteMessage,
  onIngestSuggestions,
  onConvertSuggestionToLog,
  onQuickSaveSuggestion,
}) => {
  const { t, language } = useI18n();
  const il = MODALS_LOCALES[language]?.inbox || MODALS_LOCALES.en.inbox;
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [expandedStarIds, setExpandedStarIds] = useState<Record<string, boolean>>({});

  const isEcosystemItem = (m: VisitorMessage) =>
    m.sourceType === "git_pr" || m.sourceType === "gitlab_mr" || m.sourceType === "jira_issue";

  const ecosystemCount = messages.filter(isEcosystemItem).length;
  const visitorCount = messages.length - ecosystemCount;
  const unreadCount = messages.filter((m) => !m.read).length;

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "ecosystem") return isEcosystemItem(m);
    if (filter === "visitors") return !isEcosystemItem(m);
    return true;
  });

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const toggleStarPreview = (id: string) => {
    setExpandedStarIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItemIcon = (msg: VisitorMessage) => {
    if (msg.sourceType === "git_pr") return <GitPullRequest className="w-4 h-4" />;
    if (msg.sourceType === "gitlab_mr") return <GitBranch className="w-4 h-4" />;
    if (msg.sourceType === "jira_issue") return <Ticket className="w-4 h-4" />;
    return <span>{msg.name.charAt(0).toUpperCase()}</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Inbox Header */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {t.inbox.title}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{t.inbox.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.inbox.subtitle}</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center p-1 bg-[#080C14] border border-slate-700/80 rounded-lg text-xs font-medium shrink-0 gap-0.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
              filter === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.common.all} ({messages.length})
          </button>
          <button
            onClick={() => setFilter("ecosystem")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
              filter === "ecosystem"
                ? "bg-slate-800 text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Git / Jira ({ecosystemCount})
          </button>
          <button
            onClick={() => setFilter("visitors")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
              filter === "visitors"
                ? "bg-slate-800 text-white font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Reclutadores ({visitorCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 tabular-nums ${
              filter === "unread"
                ? "bg-slate-800 text-cyan-300 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Sin leer</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-mono font-bold tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dev Ecosystem Ingestion Panel (Paso 4) */}
      {onIngestSuggestions && (
        <EcosystemIngestPanel
          defaultGitHubHandle={userProfile?.socialLinks?.github || userProfile?.github}
          onIngestSuggestions={onIngestSuggestions}
        />
      )}

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">{t.inbox.emptyTitle}</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{t.inbox.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isEco = isEcosystemItem(msg);
            const draft = msg.achievementDraft;
            const isStarExpanded = Boolean(expandedStarIds[msg.id]);

            return (
              <article
                key={msg.id}
                className={`p-5 rounded-xl border transition-all ${
                  msg.read
                    ? "bg-slate-900/40 border-slate-800/80 text-slate-300"
                    : "bg-slate-900/90 border-cyan-500/40 shadow-sm shadow-cyan-950/20"
                }`}
              >
                {/* Top Row: Source / Sender & Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                        msg.read
                          ? "bg-slate-800 text-slate-400"
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      }`}
                    >
                      {renderItemIcon(msg)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{msg.name}</h4>
                        {msg.convertedLogId && (
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Check className="w-3 h-3" />
                            <span>Convertido a Logro</span>
                          </span>
                        )}
                      </div>
                      {msg.organization && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                          <Building className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{msg.organization}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {msg.date}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="py-3 border-t border-b border-slate-800/70 space-y-2.5 mb-3">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  {isEco && draft && (
                    <div className="pt-2 space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-cyan-300/90">
                        <span>{draft.category}</span>
                        <span className="text-slate-600">·</span>
                        <span>{draft.project}</span>
                        {draft.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-300">
                        <span className="font-semibold text-white">Borrador XYZ:</span> {draft.impact}
                      </p>

                      {draft.starDraft && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleStarPreview(msg.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <span>{isStarExpanded ? "Ocultar formato STAR" : "Ver borrador STAR"}</span>
                            {isStarExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {isStarExpanded && (
                            <dl className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                              <div>
                                <dt className="font-mono text-slate-500 uppercase">Situación</dt>
                                <dd className="mt-0.5">{draft.starDraft.situation}</dd>
                              </div>
                              <div>
                                <dt className="font-mono text-slate-500 uppercase">Tarea</dt>
                                <dd className="mt-0.5">{draft.starDraft.task}</dd>
                              </div>
                              <div>
                                <dt className="font-mono text-slate-500 uppercase">Acción</dt>
                                <dd className="mt-0.5">{draft.starDraft.action}</dd>
                              </div>
                              <div>
                                <dt className="font-mono text-slate-500 uppercase">Resultado</dt>
                                <dd className="mt-0.5 text-emerald-300">{draft.starDraft.result}</dd>
                              </div>
                            </dl>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {isEco ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {onConvertSuggestionToLog && (
                        <button
                          type="button"
                          onClick={() => onConvertSuggestionToLog(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {msg.convertedLogId ? "Abrir copia en QuickLog" : "Convertir en Logro XYZ"}
                          </span>
                        </button>
                      )}
                      {onQuickSaveSuggestion && !msg.convertedLogId && (
                        <button
                          type="button"
                          onClick={() => onQuickSaveSuggestion(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Guardar 1-clic</span>
                        </button>
                      )}
                      {msg.sourceUrl && (
                        <a
                          href={msg.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 whitespace-nowrap shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver fuente</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{msg.email}</span>
                      <button
                        onClick={() => handleCopyEmail(msg.email, msg.id)}
                        className="p-1 hover:text-white text-slate-400 transition-colors"
                        title={il.copyEmailTooltip}
                      >
                        {copiedEmailId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`mailto:${msg.email}?subject=Re:%20Captain's%20Log%20Inquiry`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 ml-2 font-medium whitespace-nowrap shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>{t.publicDeck.contactDirectly}</span>
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {!msg.read && (
                      <button
                        onClick={() => onMarkRead(msg.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors whitespace-nowrap shrink-0"
                      >
                        {il.markAsRead}
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title={isEco ? "Descartar sugerencia" : t.common.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
