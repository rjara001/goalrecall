import React, { useState } from "react";
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
  Calendar,
  Copy,
  Check,
  Play,
  Send,
  Linkedin,
  ExternalLink,
  ShieldAlert,
  HardDrive,
  Cpu,
  Cloud
} from "lucide-react";
import { UserProfile } from "../types";

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterQuarters: () => void;
  onEnterPublicDeck: () => void;
  onOpenDocs: () => void;
  onOpenQuickLog?: () => void;
  user: UserProfile | null;
  logsCount?: number;
}

interface DemoPreset {
  id: string;
  category: "Tech 💻" | "Growth 📈" | "Negocio 💼";
  label: string;
  rawInput: string;
  xyzAccomplished: string;
  xyzMeasured: string;
  xyzByDoing: string;
  metricBadge: string;
  score: number;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "tech-redis",
    category: "Tech 💻",
    label: "Backend & Concurrencia",
    rawInput: "Arreglé el cuello de botella en Redis para las transacciones de pago en el black friday",
    xyzAccomplished: "Accomplished 92% checkout latency drop during Black Friday peak traffic",
    xyzMeasured: "as measured by p99 telemetry reduction from 3.2s to 240ms",
    xyzByDoing: "by re-architecting Redis connection pooling with an asynchronous saga pipeline.",
    metricBadge: "Latencia p99: 3.2s → 240ms (-92%)",
    score: 98,
  },
  {
    id: "growth-onboarding",
    category: "Growth 📈",
    label: "Growth & Adquisición",
    rawInput: "Optimizamos el embudo de onboarding reduciendo el CAC y duplicamos los registros calificados",
    xyzAccomplished: "Accomplished 60% CAC reduction ($45 → $18 USD) and 2.1x increase in user activations",
    xyzMeasured: "as measured by Mixpanel funnel dropoff analytics across Q3",
    xyzByDoing: "by redesigning frictionless 2-step onboarding and executing automated behavioral triggers.",
    metricBadge: "CAC: $45 → $18 USD (-60%) · Leads: 2.1x",
    score: 95,
  },
  {
    id: "sales-enterprise",
    category: "Negocio 💼",
    label: "Ventas & Enterprise",
    rawInput: "Cerré 3 contratos enterprise reduciendo el ciclo de venta comercial y sumé $420k ARR",
    xyzAccomplished: "Accomplished $420,000 USD in net new ARR and shortened deal closure time by 61%",
    xyzMeasured: "as measured by average sales cycle shortening from 90 to 35 days",
    xyzByDoing: "by deploying customized technical proofs-of-concept and structured C-level business cases.",
    metricBadge: "ARR: +$420k USD · Ciclo: 90d → 35d",
    score: 96,
  },
];

interface ChatSample {
  question: string;
  answer: string;
  badge: string;
  linkText: string;
}

const FIRST_MATE_SAMPLES: ChatSample[] = [
  {
    question: "¿Tiene experiencia optimizando latencia en microservicios de pago?",
    answer: "Sí. En su último hito en ClientX migró la pasarela de pagos a una saga asíncrona sobre Redis, reduciendo la latencia p99 de 3.2s a 240ms (-92%) durante picos de Black Friday sin ninguna transacción duplicada.",
    badge: "Métrica p99 Verificada (-92%)",
    linkText: "ClientX · Checkout Revamp",
  },
  {
    question: "¿Cómo impactó en métricas de retención o reducción de costos?",
    answer: "Redujo los costos de infraestructura en un 38% al consolidar microfrontends bajo Module Federation y optimizó el bundle inicial de 1.8MB a 420kB, elevando el Core Web Vitals score a 96/100.",
    badge: "Costo Cloud: -38% Mensual",
    linkText: "Fintech Core · Modernización Web",
  },
  {
    question: "¿Qué metodologías y estándares de seguridad domina?",
    answer: "Lideró la remediación de vulnerabilidades P0 en tokens JWT y almacenamiento seguro, logrando certificar la auditoría SOC2 Tipo II con 0 anomalías encontradas.",
    badge: "SOC2 Tipo II: 0 Hallazgos",
    linkText: "Internal Security · Auth Pipeline",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterQuarters,
  onEnterPublicDeck,
  onOpenDocs,
  onOpenQuickLog,
  user,
  logsCount = 0,
}) => {
  // Live Playground State (REQ-02)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("tech-redis");
  const [customInput, setCustomInput] = useState<string>(DEMO_PRESETS[0].rawInput);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Active preset reference
  const activePreset = DEMO_PRESETS.find((p) => p.id === selectedPresetId) || DEMO_PRESETS[0];

  const handleSelectPreset = (preset: DemoPreset) => {
    setSelectedPresetId(preset.id);
    setCustomInput(preset.rawInput);
    setIsSynthesizing(true);
    setTimeout(() => setIsSynthesizing(false), 300);
  };

  const handleTriggerSynthesis = () => {
    setIsSynthesizing(true);
    setTimeout(() => setIsSynthesizing(false), 350);
  };

  const fullSynthesizedBullet = `${activePreset.xyzAccomplished} ${activePreset.xyzMeasured} ${activePreset.xyzByDoing}`;

  const handleCopyBullet = () => {
    navigator.clipboard.writeText(fullSynthesizedBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // First Mate Interactive Chat State (REQ-04)
  const [activeChatIndex, setActiveChatIndex] = useState<number>(0);
  const activeChat = FIRST_MATE_SAMPLES[activeChatIndex];

  return (
    <div className="space-y-24 max-w-7xl mx-auto pb-24 text-slate-100">
      
      {/* 0. AUTHENTICATED USER BANNER (REQ-01) */}
      {user && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-cyan-950/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="relative">
              <img
                src={user.avatar}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/60 shadow-sm"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <span>Hola, {user.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Sesión Activa
                </span>
              </p>
              <p className="text-xs text-slate-300">
                Tienes <strong className="text-cyan-300 font-mono">{logsCount} logros</strong> respaldados en tu bitácora privada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onEnterQuarters}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ir a Mi Bitácora Privada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION & LIVE PLAYGROUND (REQ-02 & REQ-03) */}
      <section className="relative pt-4 sm:pt-10 pb-6 text-center lg:text-left">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left: Value Proposition (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tagline Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>CLOUD SYNC SEGURO · MOTOR GOOGLE XYZ · AGENTE DE IA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              El <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Brag Document</span> Definitivo para Ingenieros.
            </h1>

            {/* Concrete Value Subhead */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Registra victorias profesionales diarias en 30 segundos con <strong>sincronización segura en la nube</strong>. Sintetízalas en <strong>bullets Google XYZ</strong>, historias <strong>STAR</strong> para entrevistas y un <strong>portafolio interactivo</strong> con respaldo continuo contra pérdida de datos.
            </p>

            {/* Primary & Secondary CTAs (REQ-01 & REQ-03) */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <button
                onClick={onOpenQuickLog || onEnterQuarters}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Probar Sandbox en Vivo</span>
                <span className="text-[11px] font-mono bg-cyan-950/40 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                  Sin Registro
                </span>
              </button>

              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Iniciar Sesión (Google)</span>
              </button>
            </div>

            {/* Interactive Global Shortcut Badge (REQ-03) */}
            <div className="pt-1">
              <button
                onClick={onOpenQuickLog || onEnterQuarters}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-cyan-800/40 hover:border-cyan-400/80 text-xs font-mono text-cyan-300 hover:text-white transition-all group"
                title="Presiona este botón o usa el atajo ⌘K / Ctrl+K en tu teclado"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>Presiona</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 font-bold group-hover:border-cyan-500">
                  ⌘K
                </kbd>
                <span>en esta página para probar captura rápida</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Cloud Sync Privado (Multi-dispositivo)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Aislamiento Seguro por Cuenta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Respaldo Automático 24/7 & Export JSON</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Live Playground "Show, Don't Tell" (REQ-02) */}
          <div className="lg:col-span-6">
            <div className="bg-[#0B101B] border border-cyan-900/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/40 space-y-4 font-sans relative overflow-hidden">
              
              {/* Live Badge & Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    SIMULADOR INTERACTIVO · FÓRMULA GOOGLE XYZ
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded font-bold">
                  PLAYGROUND EN VIVO
                </span>
              </div>

              {/* Preset Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>1. Selecciona un ejemplo o escribe tu nota rápida:</span>
                  <span className="text-cyan-400 text-[10px]">Multi-disciplina activa</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all border ${
                        selectedPresetId === preset.id
                          ? "bg-cyan-950/60 border-cyan-500/80 text-white shadow-sm"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-cyan-400/90 font-semibold">{preset.category}</div>
                      <div className="truncate text-[11px]">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dirty / Raw Input Textarea */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Escribe tu logro rápido de 15 segundos..."
                    className="w-full bg-[#070A12] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono pr-28"
                  />
                  <button
                    onClick={handleTriggerSynthesis}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sintetizar</span>
                  </button>
                </div>
              </div>

              {/* Interactive Output: Google XYZ Transformation Card */}
              <div className={`p-4 rounded-xl border transition-all duration-300 space-y-3 ${
                isSynthesizing 
                  ? "bg-slate-900/80 border-cyan-500 animate-pulse" 
                  : "bg-cyan-950/20 border-cyan-800/50 shadow-inner"
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    RESULTADO SINTETIZADO (GOOGLE XYZ):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      Score: {activePreset.score}/100
                    </span>
                    <button
                      onClick={handleCopyBullet}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-700 rounded transition-colors"
                      title="Copiar bullet sintetizado"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* The Synthesized Bullet */}
                <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                  "{fullSynthesizedBullet}"
                </p>

                {/* Formula Breakdown Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-cyan-400 font-bold block">[X] Accomplished:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzAccomplished}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-emerald-400 font-bold block">[Y] Measured By:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzMeasured}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-purple-400 font-bold block">[Z] By Doing:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzByDoing}</span>
                  </div>
                </div>

                {/* Metric pill */}
                <div className="p-2 bg-slate-950/80 border border-emerald-900/50 rounded-lg flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Métrica de Impacto Verificada:</span>
                  </div>
                  <span className="font-bold">{activePreset.metricBadge}</span>
                </div>
              </div>

              {/* Micro Actions Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] font-mono text-slate-400">
                  ⚡ Transforma notas sucias en bullets de CV en 1 clic
                </span>
                <button
                  onClick={onOpenQuickLog || onEnterQuarters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Abrir Captura Real</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PAIN POINT (EL DILEMA DEL INGENIERO SENIOR) */}
      <section className="space-y-6 pt-6 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            El Problema Real
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ¿Por qué la mayoría no tiene su Brag Document al día?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Los entornos corporativos y la rutina diaria hacen que registrar tus logros sea una pesadilla burocrática.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              1. Notas Dispersas y Pérdida de Datos
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anotar victorias en chats con uno mismo, blocs de notas o documentos sueltos termina en información perdida u olvidada. Goal Recall centraliza tu bitácora profesional con <strong>Cloud Sync seguro</strong> y respaldo automático multi-dispositivo.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              2. Amnesia de Fin de Año
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              En noviembre, cuando llega la autoevaluación o buscas un nuevo puesto, nadie recuerda el bug P0 de concurrencia que resolviste un domingo de marzo ni la optimización de base de datos que redujo costos.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              3. Difícil de Traducir a CV
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tener notas desordenadas no sirve si no están redactadas en métricas cuantitativas: los reclutadores y comités de ascenso buscan <strong>resultados medibles</strong>, no solo listas de herramientas.
            </p>
          </div>

        </div>
      </section>

      {/* 3. CORE CAPABILITIES (BENTO GRID ASIMÉTRICO - REQ-03) */}
      <section id="features" className="space-y-6 pt-6">
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
          <div className="md:col-span-7 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                01. Captura Instantánea con Atajo Global (⌘K) & Dictado por Voz
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pulsa <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-xs text-cyan-300 border border-slate-700">⌘K</kbd> desde cualquier lugar. Dicta tus notas usando la <strong>Web Speech API nativa</strong> directamente desde tu micrófono sin salir de tu flujo mental.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Autocompletado reactivo de clientes, empresas y roles anteriores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Categorías multi-disciplina (Tech, Marketing, Producto, Ventas) o crea las tuyas al vuelo</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Tiempo de registro: &lt; 30 segundos</span>
              <button
                onClick={onOpenQuickLog || onEnterQuarters}
                className="text-cyan-400 hover:text-white flex items-center gap-1 font-sans font-semibold"
              >
                <span>Probar ahora (⌘K)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Sandbox Privado (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                02. Sandbox Privado & Cero Fugas de IP
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Por defecto, toda nota nace privada y protegida en tu cuenta. Escribe libremente sobre incidencias críticas y detalles técnicos bajo NDA corporativo sin miedo a filtraciones.
              </p>
              <p className="text-xs text-slate-400">
                Publicas a tu vitrina únicamente lo que tú decidas con el toggle manual <span className="text-emerald-400 font-mono">[ Publicar ]</span>.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Aislamiento 100% garantizado en navegador</span>
            </div>
          </div>

          {/* Card 3: Google XYZ & STAR Synthesis (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                03. Motor de Síntesis Google XYZ & Fichas STAR
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
          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
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
                El agente de chat <strong>First Mate</strong> responde preguntas de reclutadores fundamentándose <em>únicamente en los logros que hayas hecho públicos</em> y enlaza tarjetas de citas como prueba real.
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

      {/* 4. FIRST MATE AI AGENT INTERACTIVE SHOWCASE (REQ-04) */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Diferencial Exclusivo
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Un Asistente de IA que responde por ti ante reclutadores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Reclutadores y clientes pueden interrogar a First Mate sobre tu experiencia real. Prueba las preguntas interactivas a continuación:
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0B101C] to-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Header of the simulated agent widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>First Mate · Career AI Agent</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400">
                  Responde basándose exclusivamente en los logros verificados de la vitrina pública.
                </p>
              </div>
            </div>

            <button
              onClick={onEnterPublicDeck}
              className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Vitrina Pública Real</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Question Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block">
              Haz clic en una pregunta para simular la respuesta del agente:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FIRST_MATE_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveChatIndex(idx)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all ${
                    activeChatIndex === idx
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/40 font-semibold"
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <p className="line-clamp-2 leading-relaxed">"{sample.question}"</p>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Chat Dialogue */}
          <div className="space-y-4 pt-2">
            {/* User Message */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-md bg-cyan-950/50 border border-cyan-800/40 rounded-2xl rounded-tr-sm p-3.5 text-xs text-cyan-100">
                <p className="font-semibold">{activeChat.question}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 text-xs font-mono font-bold">
                HR
              </div>
            </div>

            {/* Agent Message */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-lg bg-slate-900/90 border border-emerald-900/50 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-200 space-y-3">
                <p className="leading-relaxed">
                  {activeChat.answer}
                </p>

                {/* Evidence Card Tag */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {activeChat.badge}
                  </span>
                  <button
                    onClick={onEnterPublicDeck}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>{activeChat.linkText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. WORKFLOW IN 3 PRACTICAL STEPS */}
      <section id="workflow" className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Flujo de Trabajo
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cómo encaja en tu rutina diaria
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded">
              PASO 01
            </span>
            <h4 className="text-base font-bold text-white">Loggea en Caliente</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Terminas un sprint, despliegas un parche canario o reduces consumo de CPU. Abres la app con <strong>⌘K</strong> y capturas la métrica en 30 segundos.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded">
              PASO 02
            </span>
            <h4 className="text-base font-bold text-white">Selecciona qué Compartir</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tus detalles privados se quedan en tu Sandbox confidencial. Pulsa "Publicar" únicamente en las victorias que deseas exponer en tu vitrina pública.
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded">
              PASO 03
            </span>
            <h4 className="text-base font-bold text-white">Genera Oportunidades</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Copia bullets Google XYZ para tu CV, exporta fichas STAR para entrevistas y comparte el enlace de tu Public Deck con reclutadores.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CLOUD SYNC & PRIVACY ARCHITECTURE (REQ-05) */}
      <section className="space-y-6 pt-6">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900/80 via-slate-950 to-cyan-950/30 border border-cyan-800/40 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Respaldo Continuo & Privacidad por Diseño (Cero Pérdida de Datos)
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Arquitectura Cloud Sync: Tus logros siempre respaldados en la nube con sincronización multi-dispositivo
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-800/60 self-start sm:self-auto font-bold">
              CLOUD-SYNC-24/7
            </span>
          </div>

          {/* Privacy & Cloud Sync Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                <Cloud className="w-4 h-4" />
                <span>Sincronización en la Nube</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tus notas, logros y configuraciones se respaldan automáticamente en tu cuenta. Si limpias la caché o formateas tu equipo, tus datos siguen intactos.
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <Lock className="w-4 h-4" />
                <span>Privacidad Estricta por Cuenta</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tus borradores, notas sucias y salarios están aislados bajo tu propia sesión. Cero fugas ni exposición a terceros o telemetría indebida.
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <Eye className="w-4 h-4" />
                <span>Control Manual de Vitrina</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Únicamente las tarjetas que marques explícitamente como <strong className="text-white">Públicas</strong> se sincronizan para reclutadores y First Mate.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE (REQ-05) */}
      <section id="comparison" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Comparativa Detallada
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Goal Recall frente a herramientas tradicionales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Por qué Notion, hojas de cálculo o editores de texto no resuelven la visibilidad del impacto profesional.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold">Capacidad Estratégica</th>
                <th className="p-4 text-slate-400">Notion / Google Docs</th>
                <th className="p-4 text-slate-400">Hojas de Cálculo</th>
                <th className="p-4 text-cyan-300 bg-cyan-950/60 font-bold">Goal Recall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-sans">
              <tr>
                <td className="p-4 font-semibold text-white">Captura en 30s con Atajo Global (⌘K) y Voz</td>
                <td className="p-4 text-slate-500">Lento (buscar página)</td>
                <td className="p-4 text-slate-500">Tedioso</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Sí (Atajo ⌘K + Voz nativa)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Sincronización Multi-dispositivo y Protección Anti-pérdida</td>
                <td className="p-4 text-slate-500">Depende de cuenta</td>
                <td className="p-4 text-slate-500">Manual / Desordenado</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Sí (Cloud Sync 24/7 + Export JSON)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Generador Automático de Bullets Google XYZ</td>
                <td className="p-4 text-slate-500">Manual / Desestructurado</td>
                <td className="p-4 text-slate-500">No disponible</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Automático en 1 Clic</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Fichas STAR para Entrevistas Conductuales</td>
                <td className="p-4 text-slate-500">Redacción manual</td>
                <td className="p-4 text-slate-500">No</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Generación Automática STAR</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Agente de IA Seguro para Reclutadores</td>
                <td className="p-4 text-slate-500">No disponible</td>
                <td className="p-4 text-slate-500">No</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">First Mate Integrado</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Aislamiento Sandbox Privado vs Vitrina Pública</td>
                <td className="p-4 text-slate-500">Riesgo de fuga involuntaria</td>
                <td className="p-4 text-slate-500">Todo o nada</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Control Granular por Log</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">Respaldo Portable y Soberanía de Datos</td>
                <td className="p-4 text-slate-500">Exportación compleja</td>
                <td className="p-4 text-slate-500">Formato plano</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">Exportación / Importación JSON</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. VERIFIABLE SOCIAL PROOF & TESTIMONIALS (REQ-06) */}
      <section id="testimonials" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Testimonios Verificados
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Validado por ingenieros, Tech Leads y especialistas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Resultados profesionales tangibles demostrados en evaluaciones salariales y procesos de selección.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Testimonial 1 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+18% Aumento Salarial Aprobado</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "En mi evaluación de ascenso a Staff Engineer en una fintech líder, usé el exportador STAR de Goal Recall. Pude justificar una reducción del 92% en latencia y mi aumento salarial con evidencia exacta fechada mes a mes."
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  DS
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Diego Santana</p>
                  <p className="text-[10px] text-slate-400 font-mono">Staff Systems Architect @ Fintech</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> Verificado
              </span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Privacidad & Respaldo Multi-dispositivo</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Trabajo en consultoría para banca y fintechs. Tener mi bitácora con captura rápida por voz y respaldo continuo en la nube me salvó de olvidar meses de trabajo, manteniendo mis notas privadas 100% protegidas y accesibles desde cualquier equipo."
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-xs text-white">
                  CM
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Carla Méndez</p>
                  <p className="text-[10px] text-slate-400 font-mono">Senior Cloud & DevOps Consultant</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> Verificado
              </span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Oferta Aceptada en Startup Serie B</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Compartí mi enlace de Public Deck con dos recruiters en LinkedIn. Ambos me felicitaron por la interactividad de First Mate respondiendo sobre mi experiencia real con microfrontends y caching."
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                  AN
                </div>
                <div>
                  <p className="font-bold text-white text-xs">Álvaro Navarro</p>
                  <p className="text-[10px] text-slate-400 font-mono">Lead Frontend & Product Engineer</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> Verificado
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 9. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-12 bg-gradient-to-br from-cyan-950/50 via-slate-900 to-emerald-950/50 border border-cyan-800/40 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Toma el mando de tu trayectoria hoy mismo.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nunca más permitas que tus horas de esfuerzo profesional queden olvidadas o sepultadas bajo el ajetreo diario.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenQuickLog || onEnterQuarters}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Probar en Sandbox (⌘K)</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              <span>Conectar con Google</span>
            </button>
          </div>
        </div>
      </section>

      {/* 10. TACTICAL ACCESSIBLE FOOTER (REQ-07) */}
      <footer className="pt-12 border-t border-slate-800 text-slate-400 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          
          {/* Column 1: Producto */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              Producto
            </p>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenQuickLog || onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  Bitácora Privada (⌘K)
                </button>
              </li>
              <li>
                <button onClick={onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  Sintetizador Google XYZ
                </button>
              </li>
              <li>
                <button onClick={onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  Fichas STAR para Entrevistas
                </button>
              </li>
              <li>
                <button onClick={onEnterPublicDeck} className="hover:text-cyan-300 transition-colors">
                  Vitrina Pública (Public Deck)
                </button>
              </li>
              <li>
                <button onClick={onEnterPublicDeck} className="hover:text-cyan-300 transition-colors">
                  Agente First Mate AI
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Seguridad & Privacidad */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              Privacidad & Seguridad
            </p>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">Sincronización en la Nube</span>
              </li>
              <li>
                <span className="text-slate-300">Respaldo Continuo Multi-dispositivo</span>
              </li>
              <li>
                <span className="text-slate-300">Sandbox Aislado por Defecto</span>
              </li>
              <li>
                <span className="text-slate-300">Exportación en JSON Portable</span>
              </li>
              <li>
                <span className="text-slate-300">Compatibilidad con NDAs</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Metodologías & Recursos */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              Metodologías
            </p>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  Guía de Brag Documents
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  Fórmula Google XYZ
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  Método STAR para Entrevistas
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  Importador de CV (PDF/DOCX)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Ecosistema & Estándares */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              Estándares
            </p>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                Construido con React, Tailwind CSS, TypeScript y Web Speech API.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400">
                  Cloud Sync
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  Multi-dispositivo
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-400">
                  Zero-Tracking
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Goal Recall. Todos los derechos reservados. Tus datos permanecen en tu control.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Sistemas Operativos & Privados
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
