import React, { useState } from "react";
import { 
  Compass, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Database, 
  Lock, 
  Eye, 
  Briefcase, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sliders, 
  Layers, 
  Clock, 
  FolderGit2, 
  Share2, 
  BrainCircuit, 
  Code2, 
  Cpu, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Inbox,
  UserCheck,
  TrendingUp,
  Award,
  Terminal,
  Bookmark,
  Target as TargetIcon
} from "lucide-react";
import { UserProfile } from "../types";
import { useI18n } from "../i18n";
import { FEATURES_LOCALES } from "../i18n/featuresLocales";

interface FeaturesViewProps {
  onBackToLanding: () => void;
  onGoToQuarters: () => void;
  onOpenQuickLog: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
}

type FeatureCategory = 
  | "all" 
  | "capture" 
  | "ai" 
  | "cv" 
  | "public" 
  | "cloud" 
  | "roadmap";

const FEATURE_ICONS: Record<string, React.ElementType> = {
  "f-capture": Clock,
  "f-hierarchy": Layers,
  "f-avatar": UserCheck,
  "f-xyz": Sparkles,
  "f-star": BrainCircuit,
  "f-cv-extractor": FileText,
  "f-export": FolderGit2,
  "f-public-deck": Eye,
  "f-first-mate": TargetIcon,
  "f-cloud-sync": Database,
  "f-backup-json": ShieldCheck,
  "f-roadmap-etapa2": TrendingUp,
};

export const FeaturesView: React.FC<FeaturesViewProps> = ({
  onBackToLanding,
  onGoToQuarters,
  onOpenQuickLog,
  onOpenAuth,
  user,
}) => {
  const { t, language } = useI18n();
  const fl = FEATURES_LOCALES[language] || FEATURES_LOCALES.en;

  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory>("all");
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"xyz" | "star" | "cv" | "cloud">("xyz");

  // Simulator 1: Google XYZ Interactive Formula Builder
  const [simX, setSimX] = useState("reducción del 34% en latencia p99 durante picos de tráfico");
  const [simY, setSimY] = useState("métricas de Prometheus y tiempos de respuesta de Datadog");
  const [simZ, setSimZ] = useState("rediseñando la capa de caché distribuida con Redis Cluster e índices secundarios");
  const [copiedXyz, setCopiedXyz] = useState(false);

  // Simulator 2: Real CV Extractor Preview
  const [sampleCvText, setSampleCvText] = useState(
    `EXPERIENCIA LABORAL\n\nAcme Cloud Labs / Apex Global (Oct 2025 - Presente)\nSenior Full Stack Developer\n- Lideró la migración del motor de rankings a Next.js 15 y Node.js, reduciendo el First Contentful Paint en 42%.\n- Implementó arquitectura de microservicios con colas de RabbitMQ para procesar 15,000 postulaciones diarias.\n\nNovaStream Analytics (2023 - 2025)\nData Platform Engineer\n- Optimizó pipelines de Spark y BigQuery, disminuyendo costos de computación en $18,000 USD mensuales.`
  );
  const [isCvExtracted, setIsCvExtracted] = useState(true);

  // Simulator 3: STAR Story Accordion State
  const [activeStarStep, setActiveStarStep] = useState<"S" | "T" | "A" | "R">("R");

  const copySimulatedXyz = () => {
    const fullText = `Logró ${simX}, medido a través de ${simY}, mediante ${simZ}.`;
    navigator.clipboard.writeText(fullText);
    setCopiedXyz(true);
    setTimeout(() => setCopiedXyz(false), 2500);
  };

  const categories = fl.categories.map((cat) => ({
    ...cat,
    count: cat.id === "all" ? fl.features.length : fl.features.filter((f) => f.category === cat.id).length,
  }));

  const features = fl.features.map((feat) => ({
    ...feat,
    icon: FEATURE_ICONS[feat.id] || Zap,
  }));

  const filteredFeatures = features.filter((feat) => {
    if (selectedCategory === "all") return true;
    return feat.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Banner Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>{t.app.backToHome}</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>GOAL RECALL</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                {t.features.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{t.app.navLogbook}</span>
            </button>

            {user ? (
              <button
                onClick={onGoToQuarters}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-cyan-300 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.app.navLogbook}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                <span>{t.auth.loginTitle}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-[#0B1120] via-[#080C14] to-[#070A11]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.features.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {t.features.title}{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
              GoalRecall
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.features.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> {fl.pills.noLockIn}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> {fl.pills.googleXyz}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> {fl.pills.cvIngest}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> {fl.pills.cloudSync}
            </span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PLAYGROUND (MICRO-SIMULATORS) */}
      <section className="py-12 px-4 sm:px-8 border-b border-slate-800 bg-[#0A0E1A]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Terminal className="w-4 h-4" />
                <span>{fl.simulators.kicker}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {fl.simulators.heading}
              </h2>
            </div>
            
            {/* Simulator Switcher */}
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs shrink-0">
              <button
                onClick={() => setActiveSimulatorTab("xyz")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === "xyz"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{fl.simulators.tabXyz}</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab("star")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === "star"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>{fl.simulators.tabStar}</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab("cv")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === "cv"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{fl.simulators.tabCv}</span>
              </button>

              <button
                onClick={() => setActiveSimulatorTab("cloud")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeSimulatorTab === "cloud"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Sync & JSON</span>
              </button>
            </div>
          </div>

          {/* SIMULATOR TAB 1: GOOGLE XYZ */}
          {activeSimulatorTab === "xyz" && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-purple-500/30 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                      XYZ
                    </span>
                    <span>{fl.simulators.xyzLabel}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fl.simulators.xyzDesc}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-full self-start sm:self-auto">
                  Estándar de Evaluación FAANG
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-purple-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center text-[10px]">
                      X
                    </span>
                    <span>{language === "en" ? "What did you achieve? (Result)" : language === "pt" ? "O que você alcançou? (Resultado)" : language === "fr" ? "Qu avez-vous accompli ? (Résultat)" : language === "de" ? "Was haben Sie erreicht? (Ergebnis)" : language === "ja" ? "何を達成しましたか？（結果）" : "¿Qué lograste? (El Resultado)"}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={simX}
                    onChange={(e) => setSimX(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-200 flex items-center justify-center text-[10px]">
                      Y
                    </span>
                    <span>{language === "en" ? "How was it measured? (Metric)" : language === "pt" ? "Como foi medido? (Métrica)" : language === "fr" ? "Comment a-t-il été mesuré ? (Métrique)" : language === "de" ? "Wie wurde es gemessen? (Metrik)" : language === "ja" ? "どのように測定されましたか？（指標）" : "¿Cómo se midió? (La Métrica)"}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={simY}
                    onChange={(e) => setSimY(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center text-[10px]">
                      Z
                    </span>
                    <span>{language === "en" ? "How did you do it? (Action)" : language === "pt" ? "Como você fez? (Ação Técnica)" : language === "fr" ? "Comment l avez-vous fait ? (Action)" : language === "de" ? "Wie haben Sie es umgesetzt? (Aktion)" : language === "ja" ? "どのように実行しましたか？（技術的施策）" : "¿Cómo lo hiciste? (La Acción Técnica)"}</span>
                  </label>
                  <textarea
                    rows={3}
                    value={simZ}
                    onChange={(e) => setSimZ(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Output Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Viñeta Cuantificada Generada (Lista para tu CV o Bitácora):</span>
                  </span>
                  <button
                    onClick={copySimulatedXyz}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  >
                    {copiedXyz ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-300 font-semibold">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm font-medium text-slate-100 leading-relaxed font-sans pl-2 border-l-2 border-purple-500">
                  • Logró{" "}
                  <strong className="text-purple-300 font-semibold">{simX}</strong>, medido a
                  través de <strong className="text-cyan-300 font-semibold">{simY}</strong>,
                  mediante{" "}
                  <strong className="text-emerald-300 font-semibold">{simZ}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* SIMULATOR TAB 2: STAR STORY */}
          {activeSimulatorTab === "star" && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-indigo-500/30 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono font-bold">
                      STAR
                    </span>
                    <span>{fl.simulators.starLabel}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fl.simulators.starDesc}
                  </p>
                </div>
                <div className="flex gap-1">
                  {(["S", "T", "A", "R"] as const).map((step) => (
                    <button
                      key={step}
                      onClick={() => setActiveStarStep(step)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs font-mono transition-all ${
                        activeStarStep === step
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40 scale-105"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div
                  onClick={() => setActiveStarStep("S")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeStarStep === "S"
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-indigo-300 mb-1 flex items-center justify-between">
                    <span>{fl.simulators.starS}</span>
                    <span className="font-mono text-[10px] bg-indigo-900/80 px-1.5 py-0.5 rounded">S</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {fl.simulators.starSDesc}
                  </p>
                </div>

                <div
                  onClick={() => setActiveStarStep("T")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeStarStep === "T"
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-indigo-300 mb-1 flex items-center justify-between">
                    <span>{fl.simulators.starT}</span>
                    <span className="font-mono text-[10px] bg-indigo-900/80 px-1.5 py-0.5 rounded">T</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {fl.simulators.starTDesc}
                  </p>
                </div>

                <div
                  onClick={() => setActiveStarStep("A")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeStarStep === "A"
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-indigo-300 mb-1 flex items-center justify-between">
                    <span>{fl.simulators.starA}</span>
                    <span className="font-mono text-[10px] bg-indigo-900/80 px-1.5 py-0.5 rounded">A</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {fl.simulators.starADesc}
                  </p>
                </div>

                <div
                  onClick={() => setActiveStarStep("R")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeStarStep === "R"
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="font-bold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>{fl.simulators.starR}</span>
                    <span className="font-mono text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-800/40">R</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {fl.simulators.starRDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR TAB 3: CV PARSER */}
          {activeSimulatorTab === "cv" && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-emerald-500/30 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Extractor de CV en Tiempo Real (Cero Alucinaciones)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Convierte texto plano o PDF en empresas, fechas, tecnologías y viñetas textuales
                  </p>
                </div>
                <button
                  onClick={() => setIsCvExtracted(!isCvExtracted)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  {isCvExtracted ? "Re-procesar Texto" : "Extraer Entidades"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300 block">
                    Texto del CV / Documento:
                  </label>
                  <textarea
                    rows={8}
                    value={sampleCvText}
                    onChange={(e) => setSampleCvText(e.target.value)}
                    className="w-full font-mono text-[11px] bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-emerald-400 flex items-center justify-between">
                    <span>Entidades Estructuradas Extraídas:</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                      2 Empresas • 3 Viñetas Reales
                    </span>
                  </label>
                  
                  <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800 h-[190px] overflow-y-auto">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Acme Cloud Labs / Apex Global</span>
                        <span className="text-[10px] text-slate-400 font-mono">Oct 2025 - Presente</span>
                      </div>
                      <p className="text-cyan-300 text-[11px]">Senior Full Stack Developer</p>
                      <div className="flex gap-1.5 pt-1">
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Next.js 15</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Node.js</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">RabbitMQ</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">NovaStream Analytics</span>
                        <span className="text-[10px] text-slate-400 font-mono">2023 - 2025</span>
                      </div>
                      <p className="text-cyan-300 text-[11px]">Data Platform Engineer</p>
                      <div className="flex gap-1.5 pt-1">
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Spark</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">BigQuery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR TAB 4: CLOUD SYNC & JSON */}
          {activeSimulatorTab === "cloud" && (
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-teal-500/30 shadow-xl space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-400" />
                    <span>Esquema Abierto de Sincronización & JSON (Cero Lock-In)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sincronización continua en /api/cloud-sync/push y exportación universal
                  </p>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800/60 self-start sm:self-auto">
                  Status: 200 OK • Sincronizado
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1 leading-relaxed">
                <span className="text-slate-500">// Payload generado automáticamente por GoalRecall</span>
                <p className="text-teal-400">{"{"}</p>
                <p className="pl-4"><span className="text-purple-400">"version"</span>: <span className="text-amber-300">"captains_log_v1"</span>,</p>
                <p className="pl-4"><span className="text-purple-400">"exportedAt"</span>: <span className="text-amber-300">"2026-10-27T22:30:00.000Z"</span>,</p>
                <p className="pl-4"><span className="text-purple-400">"user"</span>: {"{"} <span className="text-cyan-300">"name"</span>: <span className="text-amber-300">"Alex Morgan"</span>, <span className="text-cyan-300">"email"</span>: <span className="text-amber-300">"alex.morgan@ejemplo.com"</span>, <span className="text-cyan-300">"avatar"</span>: <span className="text-amber-300">"https://..."</span> {"}"},</p>
                <p className="pl-4"><span className="text-purple-400">"logs"</span>: [ {"{"} <span className="text-cyan-300">"id"</span>: <span className="text-amber-300">"log-101"</span>, <span className="text-cyan-300">"title"</span>: <span className="text-amber-300">"..."</span>, <span className="text-cyan-300">"impact"</span>: <span className="text-amber-300">"..."</span>, <span className="text-cyan-300">"isPublic"</span>: <span className="text-blue-400">false</span> {"}"} ],</p>
                <p className="pl-4"><span className="text-purple-400">"experiences"</span>: [ {"{"} <span className="text-cyan-300">"company"</span>: <span className="text-amber-300">"Acme Cloud Labs"</span>, <span className="text-cyan-300">"role"</span>: <span className="text-amber-300">"Senior Developer"</span> {"}"} ],</p>
                <p className="pl-4"><span className="text-purple-400">"inbox"</span>: [ ... ]</p>
                <p className="text-teal-400">{"}"}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{t.features.allFeatures}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtra por área funcional para explorar en detalle cada capacidad del sistema
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as FeatureCategory)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
          {filteredFeatures.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-500/50 transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {feat.short}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase tracking-wider">
                      Aspectos Técnicos:
                    </span>
                    {feat.techHighlights.map((tech, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                        <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-emerald-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{feat.metric}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section className="py-16 px-4 sm:px-8 border-t border-slate-800 bg-[#090D18]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Análisis Comparativo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.landing.comparisonTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              {t.landing.comparisonSubtitle}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                    <th className="p-4 font-bold">{t.landing.tableFeature}</th>
                    <th className="p-4 font-bold text-cyan-300 bg-cyan-950/40 border-x border-cyan-800/40">{t.landing.tableGoalRecall}</th>
                    <th className="p-4 font-bold text-slate-400">Notion / Obsidian</th>
                    <th className="p-4 font-bold text-slate-400">{t.landing.tableDocs}</th>
                    <th className="p-4 font-bold text-slate-400">{t.landing.tableLinkedIn}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-4 font-semibold text-white">{t.landing.comp1Feature}</td>
                    <td className="p-4 font-bold text-cyan-300 bg-cyan-950/20 border-x border-cyan-800/40">
                      {t.landing.comp1GoalRecall}
                    </td>
                    <td className="p-4 text-slate-400">10-15 min (Página en blanco)</td>
                    <td className="p-4 text-slate-400">{t.landing.comp1Docs}</td>
                    <td className="p-4 text-slate-400">{t.landing.comp1LinkedIn}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">{t.landing.comp2Feature}</td>
                    <td className="p-4 font-bold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/40">
                      {t.landing.comp2GoalRecall}
                    </td>
                    <td className="p-4 text-slate-400">❌ Manual / Prompting propio</td>
                    <td className="p-4 text-slate-400">{t.landing.comp2Docs}</td>
                    <td className="p-4 text-slate-400">{t.landing.comp2LinkedIn}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">{t.landing.comp3Feature}</td>
                    <td className="p-4 font-bold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/40">
                      {t.landing.comp3GoalRecall}
                    </td>
                    <td className="p-4 text-slate-400">❌ Copiar y pegar a mano</td>
                    <td className="p-4 text-slate-400">{t.landing.comp3Docs}</td>
                    <td className="p-4 text-slate-400">{t.landing.comp3LinkedIn}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">{t.landing.comp4Feature}</td>
                    <td className="p-4 font-bold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/40">
                      {t.landing.comp4GoalRecall}
                    </td>
                    <td className="p-4 text-slate-400">⚠️ Privado pero sin vitrina</td>
                    <td className="p-4 text-slate-400">{t.landing.comp4Docs}</td>
                    <td className="p-4 text-slate-400">{t.landing.comp4LinkedIn}</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Vitrina para Reclutadores (Public Deck)</td>
                    <td className="p-4 font-bold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/40">
                      ✅ 1 Clic con filtro de privacidad
                    </td>
                    <td className="p-4 text-slate-400">❌ Desordenado / No profesional</td>
                    <td className="p-4 text-slate-400">⚠️ Archivo estático sin métricas</td>
                    <td className="p-4 text-slate-400">⚠️ Estándar y sobrecargado</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Portabilidad & Cero Lock-In</td>
                    <td className="p-4 font-bold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/40">
                      ✅ Export/Import JSON completo
                    </td>
                    <td className="p-4 text-slate-400">⚠️ Export Markdown parcial</td>
                    <td className="p-4 text-slate-400">✅ Archivo propio</td>
                    <td className="p-4 text-slate-400">❌ Datos cautivos en red social</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 px-4 sm:px-8 border-t border-slate-800 bg-gradient-to-b from-[#090D18] to-[#060910]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto shadow-lg shadow-cyan-950/40">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {fl.footer.readyTitle}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {fl.footer.readySubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{fl.footer.startNow}</span>
            </button>

            {user ? (
              <button
                onClick={onGoToQuarters}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{t.app.navLogbook}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <span>Crear Cuenta o Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-8 border-t border-slate-800/80 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} GoalRecall — {t.landing.badge}.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={onBackToLanding} className="hover:text-white transition-colors">
              {t.app.navHome}
            </button>
            <button onClick={() => setSelectedCategory("all")} className="hover:text-white transition-colors">
              {t.app.navFeatures}
            </button>
            <button onClick={onOpenQuickLog} className="hover:text-white transition-colors">
              {t.nav.newLog}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
