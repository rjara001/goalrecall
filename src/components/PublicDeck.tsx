import React, { useState, useMemo } from "react";
import { 
  Building, 
  Calendar, 
  Tag, 
  Zap, 
  Eye, 
  Mail, 
  Send, 
  Github, 
  Linkedin, 
  MapPin, 
  CheckCircle2, 
  Bot, 
  Filter, 
  MessageSquare,
  ShieldCheck,
  Compass
} from "lucide-react";
import { LogCategory, LogEntry, UserProfile, VisitorMessage } from "../types";
import { FirstMateChat } from "./FirstMateChat";

interface PublicDeckProps {
  logs: LogEntry[];
  userProfile: UserProfile;
  onSendVisitorMessage: (msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">) => void;
}

export const PublicDeck: React.FC<PublicDeckProps> = ({
  logs,
  userProfile,
  onSendVisitorMessage,
}) => {
  // CRITICAL SANDBOX ISOLATION: Strict filter for public entries ONLY
  const publicLogs = useMemo(() => logs.filter((l) => l.isPublic), [logs]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);

  // Form State for "Leave a Note for the Captain"
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorOrg, setVisitorOrg] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");
  const [noteSent, setNoteSent] = useState(false);

  // Unique categories and tags across public logs only
  const categories = useMemo(() => Array.from(new Set(publicLogs.map((l) => l.category))), [publicLogs]);
  const tags = useMemo(() => Array.from(new Set(publicLogs.flatMap((l) => l.tags))), [publicLogs]);

  // Filtered public logs
  const filteredPublicLogs = useMemo(() => {
    return publicLogs.filter((log) => {
      if (selectedCategory !== "all" && log.category !== selectedCategory) return false;
      if (selectedTag !== "all" && !log.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [publicLogs, selectedCategory, selectedTag]);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || !visitorMessage.trim()) return;

    onSendVisitorMessage({
      name: visitorName.trim(),
      email: visitorEmail.trim(),
      organization: visitorOrg.trim() || undefined,
      message: visitorMessage.trim(),
    });

    setNoteSent(true);
    setVisitorName("");
    setVisitorEmail("");
    setVisitorOrg("");
    setVisitorMessage("");

    setTimeout(() => {
      setNoteSent(false);
    }, 5000);
  };

  const handleSelectFromChat = (log: LogEntry) => {
    setHighlightedLogId(log.id);
    const element = document.getElementById(`public-log-${log.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      
      {/* Executive Hero Deck */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#0B1220] via-slate-900 to-[#0A101C] border border-emerald-950/80 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-950/40"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {userProfile.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Vitrina Verificada
                </span>
              </div>

              <p className="text-sm font-semibold text-cyan-300">
                {userProfile.title}
              </p>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{userProfile.location}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-emerald-400">{publicLogs.length} logros públicos</span>
              </p>
            </div>
          </div>

          {/* Social Links & Quick Contact */}
          <div className="flex flex-wrap items-center gap-2.5">
            {userProfile.github && (
              <a
                href={userProfile.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {userProfile.linkedin && (
              <a
                href={userProfile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
            <a
              href="#leave-note"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-sm shadow-emerald-500/20 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Dejar un Recado</span>
            </a>
          </div>
        </div>

        {/* Bio Text */}
        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {userProfile.bio}
          </p>
        </div>

        {/* Skills Matrix */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {userProfile.skills.map((skill) => (
            <span
              key={skill.name}
              className="text-xs px-2.5 py-1 bg-slate-900/90 border border-slate-800 text-slate-300 rounded-lg font-mono"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Public Achievements + First Mate Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Public Achievements Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Vitrina de Logros Públicos</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  {filteredPublicLogs.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Resultados medibles y victorias técnicas autorizadas para divulgación.
              </p>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Cards List */}
          {filteredPublicLogs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <p className="text-xs text-slate-400">
                No hay logros públicos en esta categoría.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPublicLogs.map((log) => {
                const isHighlighted = highlightedLogId === log.id;
                return (
                  <div
                    id={`public-log-${log.id}`}
                    key={log.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isHighlighted
                        ? "bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/30"
                        : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800"
                    }`}
                  >
                    {/* Top Row: Unboxed Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <span className="text-white font-semibold">{log.client}</span>
                        <span>·</span>
                        <span className="text-slate-300">{log.project}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">{log.date}</span>
                      </div>

                      <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
                        {log.category}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {log.title}
                    </h3>

                    {/* Impact Metric Box */}
                    <div className="p-3 bg-slate-950 border border-emerald-950 rounded-xl mb-3 flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                          Impacto Medible
                        </span>
                        <p className="text-xs sm:text-sm text-emerald-200 font-mono font-medium">
                          {log.impact}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {log.description && (
                      <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                        {log.description}
                      </p>
                    )}

                    {/* Tags */}
                    {log.tags && log.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {log.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => setSelectedTag(selectedTag === t ? "all" : t)}
                            className={`text-[11px] font-mono px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              selectedTag === t
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "text-cyan-400/90 bg-cyan-950/40 border border-cyan-800/30 hover:border-cyan-500"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: First Mate AI Agent & Leave Note Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* First Mate AI Widget */}
          <FirstMateChat
            publicLogs={publicLogs}
            userProfile={userProfile}
            onSelectLog={handleSelectFromChat}
            onOpenLeaveNote={() => {
              const el = document.getElementById("leave-note");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Contact / Note Form */}
          <div id="leave-note" className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Dejar un Recado para el Capitán</h3>
                <p className="text-[11px] text-slate-400">
                  ¿Preguntas sobre disponibilidad, asesoría técnica o reclutamiento?
                </p>
              </div>
            </div>

            {noteSent ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-200">¡Recado enviado con éxito!</p>
                <p className="text-[11px] text-emerald-300/80">
                  El mensaje se ha entregado en el Inbox privado de {userProfile.name}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNoteSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tu Nombre *</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="ej. Elena Rostova"
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tu Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="ej. elena@techventures.io"
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa / Organización (Opcional)</label>
                  <input
                    type="text"
                    value={visitorOrg}
                    onChange={(e) => setVisitorOrg(e.target.value)}
                    placeholder="ej. ScalePeak Cloud"
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mensaje *</label>
                  <textarea
                    required
                    rows={3}
                    value={visitorMessage}
                    onChange={(e) => setVisitorMessage(e.target.value)}
                    placeholder="Escribe tu consulta sobre proyectos, vacantes o retos de ingeniería..."
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                >
                  Enviar Mensaje al Capitán
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
