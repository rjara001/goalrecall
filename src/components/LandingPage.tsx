import React from "react";
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Zap, 
  Terminal, 
  Briefcase, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  Clock, 
  FileText, 
  Laptop, 
  Database,
  UserCheck,
  ChevronRight,
  FolderGit2,
  Calendar
} from "lucide-react";
import { UserProfile } from "../types";

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterQuarters: () => void;
  onEnterPublicDeck: () => void;
  onOpenDocs: () => void;
  user: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterQuarters,
  onEnterPublicDeck,
  onOpenDocs,
  user,
}) => {
  return (
    <div className="space-y-20 max-w-7xl mx-auto pb-24 text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-6 text-center lg:text-left">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left: Value Proposition (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline Kicker (Clean unboxed text) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LOCAL-FIRST · SÍNTESIS DE CARRERA · ASISTENTE DE IA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              El <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Brag Document</span> Definitivo para Ingenieros.
            </h1>

            {/* Concrete Value Subhead */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Registra victorias técnicas diarias en 30 segundos fuera de VMs corporativas restringidas. Sintetízalas automáticamente en bullets de CV con la fórmula <strong>Google XYZ</strong>, historias <strong>STAR</strong> para entrevistas y un <strong>portafolio interactivo</strong> que responde a reclutadores con IA.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#1e293b"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#1e293b"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#1e293b"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Iniciar Sesión (Google / Custom)</span>
              </button>

              <button
                onClick={onEnterQuarters}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Abrir Mi Bitácora (⌘K)</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Local-First (Cero Fugas)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Sandbox Privado por Defecto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Respaldo en JSON Portable</span>
              </div>
            </div>
          </div>

          {/* Right: Tactical Command Preview Mockup (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0D121F] border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-cyan-950/30 space-y-3 font-sans relative">
              
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  GOAL RECALL · WORKSPACE LIVE
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </div>

              {/* Sample Log Card 1 */}
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>ClientX · Checkout Revamp</span>
                  <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded flex items-center gap-1 text-[10px]">
                    <Eye className="w-2.5 h-2.5" /> Público
                  </span>
                </div>
                <p className="text-xs font-bold text-white leading-snug">
                  Migración de pasarela de pago a saga asíncrona
                </p>
                <div className="p-2 bg-slate-950 border border-emerald-950/80 rounded-lg flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Latencia p99: 3.2s → 240ms (-92%)</span>
                </div>
              </div>

              {/* Sample Log Card 2 (Private Sandbox) */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Internal Core · Security</span>
                  <span className="text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded flex items-center gap-1 text-[10px]">
                    <Lock className="w-2.5 h-2.5" /> Sandbox Privado
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-snug">
                  Parche a vulnerabilidad P0 de revocación JWT
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Impacto: Auditoría SOC2 superada con 0 anomalías
                </p>
              </div>

              {/* Google XYZ Formula Snippet */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                  SÍNTESIS AUTOMÁTICA (FÓRMULA GOOGLE XYZ):
                </span>
                <p className="text-xs text-cyan-200/90 leading-relaxed italic">
                  "Accomplished 92% checkout latency drop as measured by p99 telemetry, by architecting an event-driven Redis saga."
                </p>
              </div>

              {/* First Mate AI Bot Prompt Bar */}
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] text-slate-300">
                    First Mate: "¿Tiene experiencia con Redis?"
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                  IA Activa
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (EL DILEMA DEL INGENIERO SENIOR) */}
      <section className="space-y-6 pt-8 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            El Problema Real
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ¿Por qué la mayoría de ingenieros no tiene un Brag Document al día?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Los entornos corporativos modernos hacen que registrar tus logros sea una pesadilla burocrática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              1. Laptops y VMs Bloqueadas
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trabajar en clientes bancarios o grandes consultoras implica máquinas virtuales donde no puedes instalar tu Notion personal ni exportar archivos a través del proxy.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              2. Amnesia de Fin de Año
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              En noviembre, cuando llega la autoevaluación o buscas un nuevo puesto, nadie recuerda el bug P0 de concurrencia que resolviste un domingo de marzo.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              3. Difícil de Traducir a CV
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tener notas desordenadas no sirve si no están redactadas en métricas de impacto: los reclutadores buscan resultados cuantitativos, no solo nombres de frameworks.
            </p>
          </div>

        </div>
      </section>

      {/* 3. CORE CAPABILITIES (BENTO GRID ASIMÉTRICO) */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Arquitectura de Solución
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Todo lo que necesitas para tu progreso profesional
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Diseñado meticulosamente para eliminar la fricción entre tu trabajo diario y tu portafolio público.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Card 1: Frictionless Capture (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                01. Captura Instantánea con Atajo Global & Dictado por Voz
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pulsa <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-xs text-cyan-300 border border-slate-700">⌘K</kbd> desde cualquier lugar. Dicta tus notas usando la <strong>Web Speech API nativa</strong> directamente desde tu micrófono sin salir de tu flujo mental.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Autocompletado reactivo de clientes y proyectos anteriores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Plantillas predefinidas: Incidentes P0, Refactor, Arquitectura</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
              <span>Tiempo de registro: &lt; 30 segundos</span>
            </div>
          </div>

          {/* Card 2: Sandbox Privado (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                02. Sandbox Privado & Cero Fugas de IP
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Por defecto, toda nota nace privada en tu Sandbox local. Escribe libremente sobre incidencias críticas y secretos técnicos sin miedo a filtraciones.
              </p>
              <p className="text-xs text-slate-400">
                Publicas a tu vitrina únicamente lo que tú decidas con el botón interactivo <span className="text-emerald-400 font-mono">[ Publicar ]</span>.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Aislamiento 100% garantizado en memoria</span>
            </div>
          </div>

          {/* Card 3: Google XYZ & STAR Synthesis (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                03. Motor de Síntesis Google XYZ & STAR
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Transforma cualquier registro técnico en un bullet de CV estructurado según el estándar de Google: <em>"Accomplished [X] as measured by [Y] by doing [Z]"</em>.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Genera fichas para entrevistas conductuales organizadas en <strong>Situación, Tarea, Acción y Resultado</strong> con un clic.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterQuarters}
                className="text-xs text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1"
              >
                <span>Probar sintetizador de CV</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Public Deck & First Mate AI (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                04. Public Deck & Agente de IA "First Mate"
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tu vitrina pública ejecutiva donde reclutadores y clientes exploran tus logros verificados.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                El agente de chat <strong>First Mate</strong> responde preguntas técnicas fundamentándose <em>únicamente en los logros que hayas hecho públicos</em> y enlaza tarjetas de citas como prueba.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterPublicDeck}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Explorar Public Deck en vivo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (3-STEP PRACTICAL SEQUENCE) */}
      <section className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Flujo de Trabajo
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cómo encaja en tu rutina diaria
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded">
              PASO 01
            </span>
            <h4 className="text-base font-bold text-white">Loggea en Caliente</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Terminas un sprint, despliegas un parche canario o reduces consumo de CPU. Abres la app y capturas la métrica en 30 segundos.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded">
              PASO 02
            </span>
            <h4 className="text-base font-bold text-white">Selecciona qué Compartir</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tus secretos de cliente se quedan en tu Sandbox. Pulsa "Publicar" en las victorias generales que te prestigian ante el mercado.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded">
              PASO 03
            </span>
            <h4 className="text-base font-bold text-white">Genera Oportunidades</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Copia bullets Google XYZ para tu CV, exporta casos de estudio en Markdown y comparte tu enlace de Public Deck con reclutadores.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMPARISON TABLE */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Comparativa
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Goal Recall frente a alternativas tradicionales
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold">Característica</th>
                <th className="p-4 text-slate-400">Notion / Google Docs</th>
                <th className="p-4 text-slate-400">Hojas de Cálculo</th>
                <th className="p-4 text-cyan-300 bg-cyan-950/40 font-bold">Goal Recall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-sans">
              <tr>
                <td className="p-4 font-semibold text-white">Captura &lt; 30s con Atajo Global (⌘K)</td>
                <td className="p-4 text-slate-500">Lento (buscar página)</td>
                <td className="p-4 text-slate-500">Tedioso</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Sí (Atajo + Voz)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Funciona en Laptops Corporativas Bloqueadas</td>
                <td className="p-4 text-red-400/80">Bloqueado por proxies</td>
                <td className="p-4 text-slate-500">Depende de cuenta</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Sí (100% Local / PWA)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Generador Google XYZ para CV</td>
                <td className="p-4 text-slate-500">Manual</td>
                <td className="p-4 text-slate-500">No disponible</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Automático en 1 Clic</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Fichas STAR para Entrevistas Conductuales</td>
                <td className="p-4 text-slate-500">Manual</td>
                <td className="p-4 text-slate-500">No</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Generación Automática</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Agente de IA Seguro para Reclutadores</td>
                <td className="p-4 text-slate-500">No disponible</td>
                <td className="p-4 text-slate-500">No</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">First Mate Integrado</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Sandbox Privado vs Vitrina Pública</td>
                <td className="p-4 text-slate-500">Riesgo de fuga</td>
                <td className="p-4 text-slate-500">Todo o nada</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Toggle por Tarjeta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. ENGINEERING TESTIMONIALS (ATTRIBUTABLE SOCIAL PROOF) */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Diseñado por y para ingenieros senior
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "En mi última evaluación de Staff Engineer en una fintech, usé el exportador STAR de Goal Recall. Pude justificar una reducción del 92% en latencia y un aumento salarial del 18% con evidencia exacta de cada mes."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <p className="font-bold text-white">Diego Santana</p>
              <p className="text-[11px] text-slate-400 font-mono">Staff Systems Architect · Madrid</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Trabajo en consultoría para clientes bancarios con laptops ultra restringidas. Tener mi bitácora en PWA local con dictado por voz me salvó de olvidar meses de trabajo sin violar NDAs."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <p className="font-bold text-white">Carla Méndez</p>
              <p className="text-[11px] text-slate-400 font-mono">Senior Cloud Consultant · Remoto</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Compartí mi enlace de Public Deck con dos recruiters en LinkedIn. Ambos me comentaron lo alucinante que fue chatear con First Mate sobre mi experiencia específica con Redis y PostgreSQL."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <p className="font-bold text-white">Álvaro Navarro</p>
              <p className="text-[11px] text-slate-400 font-mono">Lead Frontend Engineer · Barcelona</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-12 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyan-800/40 rounded-3xl text-center space-y-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Toma el mando de tu trayectoria hoy mismo.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nunca más permitas que tus horas de esfuerzo técnico queden olvidadas o sepultadas bajo el ajetreo diario.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Comenzar con Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterQuarters}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              <span>Abrir Modo Bitácora</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
