import React from "react";
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Zap, 
  Mic, 
  Layers, 
  FileText, 
  Inbox, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  Terminal,
  Database,
  UserCheck
} from "lucide-react";

interface DocumentationViewProps {
  onOpenQuickLog: () => void;
  onGoToSynthesis: () => void;
  onGoToPublicDeck: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onOpenQuickLog,
  onGoToSynthesis,
  onGoToPublicDeck,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-[#0B1220] to-slate-900 border border-cyan-900/40 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
              MANUAL DE VUELO v1.0
            </span>
            <span className="text-xs text-slate-400">Guía Integral de Capacidades</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bienvenido a Goal Recall (Brag Document Tracker)
          </h1>
          
          <p className="text-sm text-slate-300 leading-relaxed">
            Goal Recall es una plataforma privada y táctica diseñada para ingenieros de software, Tech Leads y arquitectos. Te permite registrar victorias técnicas diarias sin fricción fuera de entornos corporativos cerrados y sintetizarlas automáticamente en activos de carrera para tu CV, entrevistas y portafolio público.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-cyan-500/20 transition-all"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Probar Captura Rápida (⌘K)</span>
            </button>
            <button
              onClick={onGoToPublicDeck}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Ver Vitrina Public Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Module 1: Quick Log & Voice */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <span>1. Captura Diaria Sin Fricción</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">Atajo ⌘K</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No esperes a la evaluación anual para recordar qué hiciste. Documenta tus victorias en 30 segundos con el modal rápido o dictando con tu voz:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Dictado por Voz:</strong> Presiona el botón del micrófono para dictar tus avances técnicos usando la Web Speech API nativa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Autocompletado reactivo:</strong> Sugerencias instantáneas de clientes y proyectos previos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Plantillas Predefinidas:</strong> Carga rápida de Incidentes P0, Refactors o Decisiones de Arquitectura.</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenQuickLog}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold pt-2"
          >
            <span>Abrir formulario de captura</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 2: Sandbox Privado */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <span>2. Sandbox Privado & Publicación Selectiva</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">Confidencial</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La protección de secretos de empresa es primordial. Por eso, el sistema implementa un modelo de aislamiento estricto:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Sandbox por Defecto:</strong> Toda nueva entrada nace privada (<code className="text-slate-300">isPublic: false</code>). Escribe notas crudas sin miedo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Publicación Selectiva:</strong> Cada tarjeta incluye el botón <code className="text-emerald-400">[ Publicar en Public Deck ]</code> para hacer visible un logro sanitizado.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Despublicar al Instante:</strong> Un clic devuelve la entrada al Sandbox y la elimina inmediatamente de la vitrina pública.</span>
              </li>
            </ul>
          </div>
          <div className="pt-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Tus datos residen 100% en tu dispositivo local</span>
          </div>
        </div>

        {/* Module 3: Career Synthesis */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <span>3. Motor de Síntesis de Carrera (CV & STAR)</span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded">Automatizado</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transforma notas técnicas en activos listos para postularte a vacantes senior o negociar aumentos salariales:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Fórmula Google XYZ:</strong> Genera bullets con estructura <em className="text-slate-300">"Accomplished [X] as measured by [Y] by doing [Z]"</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Fichas STAR:</strong> Organiza tus respuestas en Situación, Tarea, Acción y Resultado para entrevistas de conducta.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Casos de Estudio en Markdown:</strong> Exporta dossiers técnicos completos en formato .md para GitHub o Notion.</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onGoToSynthesis}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold pt-2"
          >
            <span>Ir al Sintetizador de Carrera</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Module 4: Public Deck & First Mate */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <span>4. Public Deck & Agente de IA "First Mate"</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Vitrina</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Comparte tu trayectoria con reclutadores de forma interactiva y segura:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Agente "First Mate":</strong> Responde dudas de reclutadores sobre tus tecnologías fundamentándose <strong className="text-slate-200">únicamente en logros públicos</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tarjetas de Citas:</strong> Las respuestas de IA enlazan directamente a las tarjetas de logros verificados.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Buzón de Recados (Inbox):</strong> Los reclutadores pueden dejarte un mensaje que aparecerá en tu bandeja privada.</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onGoToPublicDeck}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold pt-2"
          >
            <span>Visitar el Public Deck</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Practical Workflow */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Flujo de Trabajo Recomendado (Día a Día)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <span className="font-mono text-cyan-400 font-bold block text-sm">PASO 01</span>
            <p className="font-semibold text-white">Registra en Caliente</p>
            <p className="text-slate-400 leading-relaxed">
              Cada vez que merges un PR complejo, arregles un bug en producción o reduzcas latencia, pulsa <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-[10px]">⌘K</kbd> y anota el impacto.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <span className="font-mono text-cyan-400 font-bold block text-sm">PASO 02</span>
            <p className="font-semibold text-white">Revisa & Publica</p>
            <p className="text-slate-400 leading-relaxed">
              Tus notas permanecen en el Sandbox Privado. Si una victoria no contiene secretos comerciales, pulsa <span className="text-emerald-400 font-medium">"Publicar en Public Deck"</span> para alimentarlo a tu portafolio.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
            <span className="font-mono text-cyan-400 font-bold block text-sm">PASO 03</span>
            <p className="font-semibold text-white">Sintetiza & Comparte</p>
            <p className="text-slate-400 leading-relaxed">
              Cuando prepares tu CV o entrevista, ve a <span className="text-cyan-400 font-medium">Sintetizador</span> y copia las fórmulas XYZ o exporta tu portafolio completo en formato Markdown o PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Backup Callout */}
      <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Respaldo Completo en Archivo JSON</h4>
            <p className="text-[11px] text-slate-400">
              Puedes descargar un backup completo de tus logs y recados desde el botón de Ajustes (⚙️) para transferirlo entre dispositivos personales sin intermediarios en la nube.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
