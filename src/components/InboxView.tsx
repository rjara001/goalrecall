import React, { useState } from "react";
import { 
  Inbox, 
  Mail, 
  Trash2, 
  Check, 
  Copy, 
  Building, 
  Clock, 
  Send, 
  User, 
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { VisitorMessage } from "../types";

interface InboxViewProps {
  messages: VisitorMessage[];
  onMarkRead: (id: string) => void;
  onDeleteMessage: (id: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  onMarkRead,
  onDeleteMessage,
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Inbox Header */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Bandeja de Recados · Goal Recall
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Mensajes de Reclutadores & Clientes</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Mensajes Recibidos desde el Public Deck
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Las notas dejadas en el formulario público "Leave a Note for the Captain" se guardan de forma privada aquí.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-[#080C14] border border-slate-700/80 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({messages.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              filter === "unread" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>No leídos</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-mono font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Bandeja al día</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === "unread"
              ? "No tienes mensajes nuevos sin leer."
              : "Aún no has recibido recados desde tu vitrina pública."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-xl border transition-all ${
                msg.read
                  ? "bg-slate-900/40 border-slate-800/80 text-slate-300"
                  : "bg-slate-900/90 border-cyan-500/40 shadow-sm shadow-cyan-950/20"
              }`}
            >
              {/* Top Row: Sender Info & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    msg.read ? "bg-slate-800 text-slate-400" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  }`}>
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{msg.name}</h4>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" title="Mensaje nuevo" />
                      )}
                    </div>
                    {msg.organization && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{msg.organization}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {msg.date}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800/60 rounded-lg mb-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">{msg.email}</span>
                  <button
                    onClick={() => handleCopyEmail(msg.email, msg.id)}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title="Copiar dirección de email"
                  >
                    {copiedEmailId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`mailto:${msg.email}?subject=Re:%20Captain's%20Log%20Inquiry`}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 ml-2 font-medium"
                  >
                    <Send className="w-3 h-3" />
                    <span>Responder por correo</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => onMarkRead(msg.id)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                    >
                      Marcar como leído
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar mensaje"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
