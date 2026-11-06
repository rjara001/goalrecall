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
  Cloud,
  BookOpen
} from "lucide-react";
import { UserProfile } from "../types";
import { useI18n } from "../i18n";
import { 
  DEMO_PRESETS_BY_LANG, 
  FIRST_MATE_SAMPLES_BY_LANG, 
  LANDING_SECTIONS 
} from "../i18n/landingLocales";

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterQuarters: () => void;
  onEnterPublicDeck: () => void;
  onOpenDocs: () => void;
  onOpenQuickLog?: () => void;
  onOpenFeatures?: () => void;
  user: UserProfile | null;
  logsCount?: number;
}

interface DemoPreset {
  id: string;
  category: string;
  label: string;
  rawInput: string;
  xyzAccomplished: string;
  xyzMeasured: string;
  xyzByDoing: string;
  metricBadge: string;
  score: number;
}

const DEMO_PRESETS_ES: DemoPreset[] = [
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

const DEMO_PRESETS_EN: DemoPreset[] = [
  {
    id: "tech-redis",
    category: "Tech 💻",
    label: "Backend & Concurrency",
    rawInput: "Fixed Redis connection bottleneck for checkout payment transactions during black friday",
    xyzAccomplished: "Accomplished 92% checkout latency drop during Black Friday peak traffic",
    xyzMeasured: "as measured by p99 telemetry reduction from 3.2s to 240ms",
    xyzByDoing: "by re-architecting Redis connection pooling with an asynchronous saga pipeline.",
    metricBadge: "p99 Latency: 3.2s → 240ms (-92%)",
    score: 98,
  },
  {
    id: "growth-onboarding",
    category: "Growth 📈",
    label: "Growth & Acquisition",
    rawInput: "Optimized the onboarding funnel reducing CAC and doubled qualified signups",
    xyzAccomplished: "Accomplished 60% CAC reduction ($45 → $18 USD) and 2.1x increase in user activations",
    xyzMeasured: "as measured by Mixpanel funnel dropoff analytics across Q3",
    xyzByDoing: "by redesigning frictionless 2-step onboarding and executing automated behavioral triggers.",
    metricBadge: "CAC: $45 → $18 USD (-60%) · Leads: 2.1x",
    score: 95,
  },
  {
    id: "sales-enterprise",
    category: "Business 💼",
    label: "Sales & Enterprise",
    rawInput: "Closed 3 enterprise contracts reducing sales cycle and added $420k ARR",
    xyzAccomplished: "Accomplished $420,000 USD in net new ARR and shortened deal closure time by 61%",
    xyzMeasured: "as measured by average sales cycle shortening from 90 to 35 days",
    xyzByDoing: "by deploying customized technical proofs-of-concept and structured C-level business cases.",
    metricBadge: "ARR: +$420k USD · Cycle: 90d → 35d",
    score: 96,
  },
];

interface ChatSample {
  question: string;
  answer: string;
  badge: string;
  linkText: string;
}

const FIRST_MATE_SAMPLES_ES: ChatSample[] = [
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

const FIRST_MATE_SAMPLES_EN: ChatSample[] = [
  {
    question: "Do they have experience optimizing latency in payment microservices?",
    answer: "Yes. In their latest milestone at ClientX, they migrated the payment gateway to an asynchronous saga pipeline over Redis, cutting p99 latency from 3.2s to 240ms (-92%) during Black Friday traffic spikes without a single duplicate transaction.",
    badge: "Verified p99 Metric (-92%)",
    linkText: "ClientX · Checkout Revamp",
  },
  {
    question: "How did they impact retention or infrastructure cost metrics?",
    answer: "They slashed cloud infrastructure expenses by 38% by consolidating microfrontends with Module Federation and shrinking the initial bundle from 1.8MB to 420kB, lifting the Core Web Vitals score to 96/100.",
    badge: "Cloud Cost: -38% Monthly",
    linkText: "Fintech Core · Web Modernization",
  },
  {
    question: "What security and compliance frameworks do they master?",
    answer: "They led the remediation of P0 vulnerabilities in JWT handling and secrets storage, successfully certifying the SOC2 Tipo II audit with zero findings.",
    badge: "SOC2 Type II: 0 Findings",
    linkText: "Internal Security · Auth Pipeline",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterQuarters,
  onEnterPublicDeck,
  onOpenDocs,
  onOpenQuickLog,
  onOpenFeatures,
  user,
  logsCount = 0,
}) => {
  const { t, language } = useI18n();
  const demoPresets = DEMO_PRESETS_BY_LANG[language] || DEMO_PRESETS_BY_LANG.en;
  const firstMateSamples = FIRST_MATE_SAMPLES_BY_LANG[language] || FIRST_MATE_SAMPLES_BY_LANG.en;
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  // Live Playground State (REQ-02)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("tech-redis");
  const [customInput, setCustomInput] = useState<string>(demoPresets[0].rawInput);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Active preset reference
  const activePreset = demoPresets.find((p) => p.id === selectedPresetId) || demoPresets[0];

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
  const activeChat = firstMateSamples[activeChatIndex] || firstMateSamples[0];

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
                <span>{ls.userBanner.hello}, {user.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {ls.userBanner.activeSession}
                </span>
              </p>
              <p className="text-xs text-slate-300">
                {ls.userBanner.backupSummary(logsCount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onEnterQuarters}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === "es" ? "Volver a mi Espacio de Trabajo" : "Return to Workspace"}</span>
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
              <span>{t.landing.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              {t.landing.heroTitlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">{t.landing.heroTitleHighlight}</span> {t.landing.heroTitleSuffix}
            </h1>

            {/* Concrete Value Subhead */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {t.landing.heroDescription}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>{t.nav.signIn}</span>
              </button>

              <button
                onClick={onOpenDocs}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                title="Documentación Oficial y Guía de Usuario (/docs)"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{t.landing.ctaDocs}</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === "en" ? "Private Cloud Sync (Multi-Device)" : language === "pt" ? "Cloud Sync Privado (Multi-dispositivo)" : language === "fr" ? "Cloud Sync Privé (Multi-appareils)" : language === "de" ? "Privater Cloud Sync (Multi-Device)" : language === "ja" ? "プライベートCloud Sync（複数端末）" : "Cloud Sync Privado (Multi-dispositivo)"}</span>
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
                     {t.landing.tryLiveBadge}
                   </span>
                 </div>
                 <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded font-bold uppercase">
                   {t.landing.tryLiveBadge}
                 </span>
               </div>

              {/* Preset Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>{t.landing.tryLiveSubtitle}</span>
                  <span className="text-cyan-400 text-[10px]">{t.common.status}: Pro</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {demoPresets.map((preset) => (
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
                    placeholder={t.landing.rawDraftPlaceholder}
                    className="w-full bg-[#070A12] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono pr-28"
                  />
                  <button
                    onClick={handleTriggerSynthesis}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSynthesizing ? t.landing.synthesizing : t.landing.synthesizeBtn.split(" ")[0]}</span>
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
                    {t.landing.formatGoogleXyz}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      Score: {activePreset.score}/100
                    </span>
                    <button
                      onClick={handleCopyBullet}
                      className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-white px-2 py-0.5 bg-slate-900 border border-slate-700 rounded transition-colors"
                      title={t.common.copy}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{t.common.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t.common.copy}</span>
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
                    <span className="text-cyan-400 font-bold block">{t.landing.metricAccomplished}:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzAccomplished}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{t.landing.metricMeasured}:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzMeasured}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="text-purple-400 font-bold block">{t.landing.metricByDoing}:</span>
                    <span className="text-slate-300 line-clamp-1">{activePreset.xyzByDoing}</span>
                  </div>
                </div>

                {/* Metric pill */}
                <div className="p-2 bg-slate-950/80 border border-emerald-900/50 rounded-lg flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.common.metrics}:</span>
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
                  <span>{ls.userBanner.openCapture}</span>
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
            {ls.painPoint.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.painPoint.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {ls.painPoint.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {ls.painPoint.card1Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.painPoint.card1Desc}
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {ls.painPoint.card2Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.painPoint.card2Desc}
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {ls.painPoint.card3Title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.painPoint.card3Desc}
            </p>
          </div>

        </div>
      </section>

      {/* 3. CORE CAPABILITIES (BENTO GRID ASIMÉTRICO - REQ-03) */}
      <section id="features" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {ls.bentoGrid.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.bentoGrid.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {ls.bentoGrid.subtitle}
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
                {ls.bentoGrid.card1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card1Desc}
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{ls.bentoGrid.card1Bullet1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{ls.bentoGrid.card1Bullet2}</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">{ls.bentoGrid.card1Time}</span>
              <button
                onClick={onOpenQuickLog || onEnterQuarters}
                className="text-cyan-400 hover:text-white flex items-center gap-1 font-sans font-semibold"
              >
                <span>{ls.bentoGrid.card1Action}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Bóveda Privada (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {ls.bentoGrid.card2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card2Desc}
              </p>
              <p className="text-xs text-slate-400">
                {ls.bentoGrid.card2ToggleNote}
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{ls.bentoGrid.card2Isolation}</span>
            </div>
          </div>

          {/* Card 3: Google XYZ & STAR Synthesis (6 Cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {ls.bentoGrid.card3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card3Desc1}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card3Desc2}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterQuarters}
                className="text-xs text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1"
              >
                <span>{ls.bentoGrid.card3Action}</span>
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
                {ls.bentoGrid.card4Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card4Desc1}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card4Desc2}
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onEnterPublicDeck}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-700 transition-all"
              >
                <span>{ls.bentoGrid.card4Action}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Full Features Showcase View Banner */}
          {onOpenFeatures && (
            <div className="md:col-span-12 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{ls.catalogBanner.title}</span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/60 font-semibold">
                      {ls.catalogBanner.badge}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {ls.catalogBanner.subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenFeatures}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <span>{ls.catalogBanner.button}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 4. FIRST MATE AI AGENT INTERACTIVE SHOWCASE (REQ-04) */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            {ls.firstMate.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.firstMate.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {ls.firstMate.subtitle}
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
                  <span>{ls.firstMate.assistantTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-xs text-slate-400">
                  {ls.firstMate.statusOnline}
                </p>
              </div>
            </div>

            <button
              onClick={onEnterPublicDeck}
              className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{ls.firstMate.viewPublicDeckBtn}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Question Prompts */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block">
              {ls.firstMate.promptLabel}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {firstMateSamples.map((sample, idx) => (
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
            {ls.workflow.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.workflow.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded">
              {ls.workflow.step1Badge}
            </span>
            <h4 className="text-base font-bold text-white">{ls.workflow.step1Title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.workflow.step1Desc}
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded">
              {ls.workflow.step2Badge}
            </span>
            <h4 className="text-base font-bold text-white">{ls.workflow.step2Title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.workflow.step2Desc}
            </p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded">
              {ls.workflow.step3Badge}
            </span>
            <h4 className="text-base font-bold text-white">{ls.workflow.step3Title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {ls.workflow.step3Desc}
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
                {ls.cloudSync.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {ls.cloudSync.title}
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-800/60 self-start sm:self-auto font-bold">
              {ls.cloudSync.tag}
            </span>
          </div>

          {/* Privacy & Cloud Sync Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                <Cloud className="w-4 h-4" />
                <span>{ls.cloudSync.card1Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ls.cloudSync.card1Desc}
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <Lock className="w-4 h-4" />
                <span>{ls.cloudSync.card2Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ls.cloudSync.card2Desc}
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <Eye className="w-4 h-4" />
                <span>{ls.cloudSync.card3Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ls.cloudSync.card3Desc}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE (REQ-05) */}
      <section id="comparison" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {t.landing.comparisonTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.landing.comparisonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.landing.comparisonSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold">{t.landing.tableFeature}</th>
                <th className="p-4 text-slate-400">{t.landing.tableLinkedIn}</th>
                <th className="p-4 text-slate-400">{t.landing.tableDocs}</th>
                <th className="p-4 text-cyan-300 bg-cyan-950/60 font-bold">{t.landing.tableGoalRecall}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-sans">
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp1Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp1LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp1Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">{t.landing.comp1GoalRecall}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp2Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp2LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp2Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">{t.landing.comp2GoalRecall}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp3Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp3LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp3Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">{t.landing.comp3GoalRecall}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp4Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp4LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp4Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">{t.landing.comp4GoalRecall}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. VERIFIABLE SOCIAL PROOF & TESTIMONIALS (REQ-06) */}
      <section id="testimonials" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {ls.testimonials.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.testimonials.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {ls.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Testimonial 1 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ls.testimonials.t1Badge}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{ls.testimonials.t1Quote}"
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  DS
                </div>
                <div>
                  <p className="font-bold text-white text-xs">{ls.testimonials.t1Author}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ls.testimonials.t1Role}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> {ls.testimonials.verified}
              </span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ls.testimonials.t2Badge}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{ls.testimonials.t2Quote}"
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-xs text-white">
                  CM
                </div>
                <div>
                  <p className="font-bold text-white text-xs">{ls.testimonials.t2Author}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ls.testimonials.t2Role}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> {ls.testimonials.verified}
              </span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300 font-mono text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ls.testimonials.t1Badge}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{ls.testimonials.t1Quote}"
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                  AN
                </div>
                <div>
                  <p className="font-bold text-white text-xs">{ls.testimonials.t1Author}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{ls.testimonials.t1Role}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                <Linkedin className="w-3 h-3" /> {ls.testimonials.verified}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 9. BOTTOM CONVERSION CTA BANNER */}
      <section className="p-8 sm:p-12 bg-gradient-to-br from-cyan-950/50 via-slate-900 to-emerald-950/50 border border-cyan-800/40 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.landing.heroTitlePrefix} {t.landing.heroTitleHighlight}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.landing.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenQuickLog || onEnterQuarters}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ls.cta.tryPrivateVault}</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              <span>{ls.cta.connectGoogle}</span>
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
              {ls.footer.col1Title}
            </p>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenQuickLog || onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col1Item1}
                </button>
              </li>
              <li>
                <button onClick={onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col1Item2}
                </button>
              </li>
              <li>
                <button onClick={onEnterQuarters} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col1Item3}
                </button>
              </li>
              <li>
                <button onClick={onEnterPublicDeck} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col1Item4}
                </button>
              </li>
              <li>
                <button onClick={onEnterPublicDeck} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col1Item5}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Seguridad & Privacidad */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              {ls.footer.col2Title}
            </p>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">{ls.footer.col2Item1}</span>
              </li>
              <li>
                <span className="text-slate-300">{ls.footer.col2Item2}</span>
              </li>
              <li>
                <span className="text-slate-300">{ls.footer.col2Item3}</span>
              </li>
              <li>
                <span className="text-slate-300">{ls.footer.col2Item4}</span>
              </li>
              <li>
                <span className="text-slate-300">{ls.footer.col2Item5}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Metodologías & Recursos */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              {ls.footer.col3Title}
            </p>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col3Item1}
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col3Item2}
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col3Item3}
                </button>
              </li>
              <li>
                <button onClick={onOpenDocs} className="hover:text-cyan-300 transition-colors">
                  {ls.footer.col3Item4}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Ecosistema & Estándares */}
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              {ls.footer.col4Title}
            </p>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">
                {ls.footer.col4Desc}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400">
                  {ls.footer.tag1}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
                  {ls.footer.tag2}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-400">
                  {ls.footer.tag3}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {ls.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {ls.footer.status}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};
