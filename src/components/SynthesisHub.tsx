import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  ExternalLink, 
  ChevronRight, 
  Building, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { LogEntry, STARStory, XYZBullet } from "../types";
import { 
  generateXYZBullets, 
  generateSTARStories, 
  generateCaseStudyMarkdown 
} from "../utils/synthesis";

interface SynthesisHubProps {
  logs: LogEntry[];
  userName: string;
}

export const SynthesisHub: React.FC<SynthesisHubProps> = ({ logs, userName }) => {
  const [activeMode, setActiveMode] = useState<"xyz" | "star" | "casestudy">("xyz");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const clients = useMemo(() => Array.from(new Set(logs.map((l) => l.client))).filter(Boolean), [logs]);

  // Filter logs for synthesis
  const targetLogs = useMemo(() => {
    if (selectedClient === "all") return logs;
    return logs.filter((l) => l.client === selectedClient);
  }, [logs, selectedClient]);

  // Generated Items
  const xyzBullets: XYZBullet[] = useMemo(() => generateXYZBullets(targetLogs), [targetLogs]);
  const starStories: STARStory[] = useMemo(() => generateSTARStories(targetLogs), [targetLogs]);
  const caseStudyMd = useMemo(
    () => generateCaseStudyMarkdown(selectedClient === "all" ? "Core Engineering Portfolio" : selectedClient, targetLogs, userName),
    [selectedClient, targetLogs, userName]
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([caseStudyMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `case-study-${selectedClient.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Estudio de Síntesis de Carrera
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Automatización de CV & Entrevistas</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Transforma Bitácoras en Activos de Carrera
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Sintetiza tus logros diarios en bullets de CV con la fórmula Google XYZ, prepara historias STAR para entrevistas de conducta o exporta casos de estudio para tu portafolio.
          </p>
        </div>

        {/* Client Selector & Print Action */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">Todos los Clientes ({logs.length} logros)</option>
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            title="Imprimir o Guardar como PDF"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl gap-1">
        <button
          onClick={() => setActiveMode("xyz")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeMode === "xyz"
              ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Fórmula Google XYZ (CV)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20">
            {xyzBullets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMode("star")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeMode === "star"
              ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Historias STAR (Entrevistas)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20">
            {starStories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMode("casestudy")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeMode === "casestudy"
              ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Caso de Estudio (Portfolio Markdown)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="print-area">
        
        {/* MODE 1: GOOGLE XYZ BULLETS */}
        {activeMode === "xyz" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Estructura estándar de Google: "Accomplished [X] as measured by [Y], by doing [Z]"
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bullets de alto impacto calibrados para captar la atención de reclutadores y Hiring Managers.
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    xyzBullets.map((b) => `• ${b.bullet}`).join("\n"),
                    "all-xyz"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium rounded-lg border border-slate-700 transition-colors shrink-0"
              >
                {copiedId === "all-xyz" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === "all-xyz" ? "¡Copiados!" : "Copiar Todos"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {xyzBullets.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{item.client}</span>
                      <span>·</span>
                      <span>{item.project}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed group-hover:text-cyan-200 transition-colors">
                      • {item.bullet}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
                      <span className="font-semibold text-emerald-500">Métrica clave:</span>
                      <span>{item.impact}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(item.bullet, item.id)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    title="Copiar este bullet"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: STAR BEHAVIORAL INTERVIEW SHEETS */}
        {activeMode === "star" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl">
              <p className="text-xs font-bold text-slate-200">
                Framework STAR: Situación, Tarea, Acción y Resultado
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Utiliza estas fichas para responder preguntas de conducta: "¿Cuéntame sobre un fallo crítico que resolviste?" o "¿Cómo lideras decisiones de arquitectura?".
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {starStories.map((story) => (
                <div
                  key={story.id}
                  className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
                        <span className="text-slate-300 font-semibold">{story.client}</span>
                        <span>·</span>
                        <span>{story.project}</span>
                        <span>·</span>
                        <span className="text-cyan-400">{story.category}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {story.title}
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          `# HISTORIA STAR: ${story.title}\n\n` +
                          `**SITUACIÓN:** ${story.situation}\n\n` +
                          `**TAREA:** ${story.task}\n\n` +
                          `**ACCIÓN:** ${story.action}\n\n` +
                          `**RESULTADO:** ${story.result}`,
                          story.id
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors shrink-0"
                    >
                      {copiedId === story.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === story.id ? "¡Copiado!" : "Copiar Ficha STAR"}</span>
                    </button>
                  </div>

                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                        [S] Situación (Contexto)
                      </span>
                      <p className="text-slate-300 leading-relaxed">{story.situation}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                        [T] Tarea (Objetivo y Reto)
                      </span>
                      <p className="text-slate-300 leading-relaxed">{story.task}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1">
                        [A] Acción (Implementación Técnica)
                      </span>
                      <p className="text-slate-300 leading-relaxed">{story.action}</p>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-emerald-950/80 rounded-lg">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                        [R] Resultado (Impacto Cuantitativo)
                      </span>
                      <p className="text-emerald-200 font-mono font-medium leading-relaxed">{story.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: PORTFOLIO CASE STUDY (MARKDOWN) */}
        {activeMode === "casestudy" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Caso de estudio técnico estructurado en Markdown (.md)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Listo para pegar en repositorios de GitHub, Notion o tu sitio web de portafolio personal.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(caseStudyMd, "md-all")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  {copiedId === "md-all" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "md-all" ? "¡Copiado!" : "Copiar Markdown"}</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .md</span>
                </button>
              </div>
            </div>

            {/* Markdown Preview Box */}
            <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[550px] overflow-y-auto">
              {caseStudyMd}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
