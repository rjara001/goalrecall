import React, { useState, useRef, useEffect } from "react";
import { 
  Compass, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  ExternalLink, 
  Zap, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { LogEntry, UserProfile } from "../types";
import { queryFirstMate, SUGGESTED_QUERIES, FirstMateResponse } from "../utils/firstMateAi";

interface ChatMessage {
  id: string;
  sender: "user" | "first-mate";
  text: string;
  citedLogs?: LogEntry[];
  timestamp: string;
}

interface FirstMateChatProps {
  publicLogs: LogEntry[];
  userProfile: UserProfile;
  onSelectLog?: (log: LogEntry) => void;
  onOpenLeaveNote: () => void;
}

export const FirstMateChat: React.FC<FirstMateChatProps> = ({
  publicLogs,
  userProfile,
  onSelectLog,
  onOpenLeaveNote,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "first-mate",
      text: `¡Hola! Soy First Mate, el oficial de navegación y asistente técnico de ${userProfile.name}. Cuento con acceso a sus logros públicos verificados de arquitectura, rendimiento y desarrollo full-stack. ¿Qué te gustaría saber sobre su experiencia?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate smart agent processing with slight realistic delay
    setTimeout(() => {
      const response: FirstMateResponse = queryFirstMate(query, publicLogs, userProfile);
      
      const agentMsg: ChatMessage = {
        id: "agent-" + Date.now(),
        sender: "first-mate",
        text: response.message,
        citedLogs: response.citedLogs,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "msg-init-" + Date.now(),
        sender: "first-mate",
        text: `Memoria reiniciada. ¿Sobre qué tecnología o proyecto de ${userProfile.name} deseas consultar?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="bg-[#0B111E] border border-slate-800 rounded-2xl flex flex-col h-[560px] shadow-xl overflow-hidden">
      
      {/* Agent Header */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                FIRST MATE · ASISTENTE DE PERFIL
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Alimentado por {publicLogs.length} logros públicos verificados
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reiniciar conversación"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Questions Pill Carousel */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-mono shrink-0">Sugerencias:</span>
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors border border-slate-700/50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "first-mate" && (
              <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-cyan-600 text-white rounded-tr-none font-medium"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>

              {/* Cited Log Cards */}
              {msg.citedLogs && msg.citedLogs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                    Evidencia Verificada en Bitácora:
                  </span>
                  {msg.citedLogs.map((cited) => (
                    <div
                      key={cited.id}
                      onClick={() => onSelectLog?.(cited)}
                      className="p-2.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-lg cursor-pointer transition-all flex items-start justify-between gap-2 group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <span className="text-slate-300 font-semibold">{cited.client}</span>
                          <span>·</span>
                          <span>{cited.project}</span>
                        </div>
                        <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {cited.title}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                          {cited.impact}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-500 font-mono block px-1">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === "user" && (
              <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1">Consultando bitácora pública...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta a First Mate sobre proyectos, Redis, React, latencia..."
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isTyping}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 rounded-xl font-bold transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
