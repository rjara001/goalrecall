import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Zap, 
  Layers, 
  FileText, 
  Inbox, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Building2,
  Trophy,
  MessageSquare,
  Share2,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  FileUp,
  LogIn
} from "lucide-react";
import { UserProfile } from "../types";
import { useI18n, LanguageSelector } from "../i18n";
import { DOCS_LOCALES } from "../i18n/docsLocales";

interface DocumentationViewProps {
  onOpenQuickLog: () => void;
  onGoToTimeline: () => void;
  onGoToPublicDeck: () => void;
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onOpenCvUpload?: () => void;
  user: UserProfile | null;
}

type DocSection = 
  | "overview" 
  | "experiences" 
  | "achievements" 
  | "ai-assistant" 
  | "privacy-showcase" 
  | "ssot-export" 
  | "faq";

const SECTION_ICONS: Record<string, React.ElementType> = {
  overview: Compass,
  experiences: Building2,
  achievements: Trophy,
  "ai-assistant": Sparkles,
  "privacy-showcase": ShieldCheck,
  "ssot-export": Share2,
  faq: HelpCircle,
};

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onOpenQuickLog,
  onGoToTimeline,
  onGoToPublicDeck,
  onBackToLanding,
  onOpenAuth,
  onOpenCvUpload,
  user,
}) => {
  const { t, language } = useI18n();
  const dl = DOCS_LOCALES[language] || DOCS_LOCALES.en;

  const [activeSection, setActiveSection] = useState<DocSection>("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedExample, setCopiedExample] = useState(false);

  const sections = dl.sections.map((sec) => ({
    ...sec,
    id: sec.id as DocSection,
    icon: SECTION_ICONS[sec.id] || Compass,
  }));

  const handleCopyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              ← {t.common.back}
            </button>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {dl.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSelector />
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{dl.shortcutBtn}</span>
            </button>
            {user ? (
              <button
                onClick={onGoToTimeline}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <span>{t.app.navLogbook}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <span>{dl.accessAccount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1324] to-slate-900 border border-cyan-900/40 overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{dl.heroGuideDirect}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {dl.heroTitlePrefix}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                {dl.heroTitleHighlight}
              </span>
              {dl.heroTitleSuffix}
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              {dl.heroDescription}
            </p>
          </div>
        </div>

        {/* Main Content Layout with Sidebar Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 space-y-2">
            <div className="sticky top-20 p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                {dl.navTitle}
              </p>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-cyan-400"}`} />
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
                <button
                  onClick={onGoToPublicDeck}
                  className="w-full flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg hover:bg-emerald-950/30 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{dl.demoDeckBtn}</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Content Body */}
          <div className="lg:col-span-3 space-y-8">

            {/* SECTION 1: OVERVIEW & PURPOSE */}
            {activeSection === "overview" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.overview.title}</h2>
                    <p className="text-sm text-cyan-400 font-medium mt-1">{dl.overview.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                    <p>{dl.overview.p1}</p>
                    <ul className="space-y-2 pl-4 border-l-2 border-cyan-500/40 text-slate-200">
                      <li>• {dl.overview.bullet1}</li>
                      <li>• {dl.overview.bullet2}</li>
                      <li>• {dl.overview.bullet3}</li>
                    </ul>
                    <p>{dl.overview.p2}</p>
                    <p className="p-4 bg-slate-950/80 border border-cyan-900/40 rounded-xl text-slate-200 font-medium">
                      {dl.overview.vaultBox}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">{dl.overview.card1Title}</h4>
                      <p className="text-xs text-slate-400">{dl.overview.card1Desc}</p>
                    </div>
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white">{dl.overview.card2Title}</h4>
                      <p className="text-xs text-slate-400">{dl.overview.card2Desc}</p>
                    </div>
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">{dl.overview.card3Title}</h4>
                      <p className="text-xs text-slate-400">{dl.overview.card3Desc}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: EXPERIENCES & COMPANIES */}
            {activeSection === "experiences" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.experiences.title}</h2>
                    <p className="text-sm text-blue-400 font-medium mt-1">{dl.experiences.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {dl.experiences.p1}
                  </p>

                  {/* Option A & Option B */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Method 1 */}
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">A</span>
                        <h3 className="text-sm font-bold text-white">{dl.experiences.methodATitle}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.experiences.methodADesc}
                      </p>
                      <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                        <li>{user ? dl.experiences.methodAStep1User : dl.experiences.methodAStep1Guest}</li>
                        <li>{dl.experiences.methodAStep2}</li>
                        <li>{dl.experiences.methodAStep3}</li>
                      </ol>
                      {user ? (
                        onOpenCvUpload && (
                          <button
                            onClick={onOpenCvUpload}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            <FileUp className="w-3.5 h-3.5" />
                            <span>{dl.experiences.openCvBtn}</span>
                          </button>
                        )
                      ) : (
                        <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-xl space-y-2">
                          <p className="text-[11px] text-cyan-200 leading-snug">
                            🔒 {dl.experiences.guestPrivacy}
                          </p>
                          <button
                            onClick={onOpenAuth}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 rounded-lg text-xs font-bold shadow-sm transition-all"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{dl.experiences.createAccountBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Method 2 */}
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">B</span>
                        <h3 className="text-sm font-bold text-white">{dl.experiences.methodBTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.experiences.methodBDesc}
                      </p>
                      <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                        <li>{dl.experiences.methodBStep1}</li>
                        <li>{dl.experiences.methodBStep2}</li>
                        <li>{dl.experiences.methodBStep3}</li>
                        <li>{dl.experiences.methodBStep4}</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-start gap-3 text-xs text-cyan-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{dl.experiences.personalProjectsNote}</span>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: ACHIEVEMENTS IN 40 SECONDS */}
            {activeSection === "achievements" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.achievements.title}</h2>
                    <p className="text-sm text-amber-400 font-medium mt-1">{dl.achievements.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {dl.achievements.p1}
                  </p>

                  {/* Workflow Card */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">{dl.achievements.howToTitle}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">1</span>
                        <h4 className="font-bold text-white">{dl.achievements.step1Title}</h4>
                        <p className="text-slate-400 leading-relaxed">{dl.achievements.step1Desc}</p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">2</span>
                        <h4 className="font-bold text-white">{dl.achievements.step2Title}</h4>
                        <p className="text-slate-400 leading-relaxed">{dl.achievements.step2Desc}</p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">3</span>
                        <h4 className="font-bold text-white">{dl.achievements.step3Title}</h4>
                        <p className="text-slate-400 leading-relaxed">{dl.achievements.step3Desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Converting CV Bullets */}
                  <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/40 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wide">{dl.achievements.cvTrickTitle}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dl.achievements.cvTrickDesc}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: AI ASSISTANT (GOOGLE XYZ & STAR) */}
            {activeSection === "ai-assistant" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.aiAssistant.title}</h2>
                    <p className="text-sm text-purple-400 font-medium mt-1">{dl.aiAssistant.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {dl.aiAssistant.p1}
                  </p>

                  {/* Dual AI Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    
                    {/* Feature 1: Google XYZ */}
                    <div className="p-5 bg-slate-950/80 border border-purple-900/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 font-mono">
                          {dl.aiAssistant.xyzBadge}
                        </span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">{dl.aiAssistant.xyzTitle}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.aiAssistant.xyzLead}
                      </p>
                      <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl text-xs text-purple-200 font-mono">
                        {dl.aiAssistant.xyzFormula}
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>• {dl.aiAssistant.xyzX}</li>
                        <li>• {dl.aiAssistant.xyzY}</li>
                        <li>• {dl.aiAssistant.xyzZ}</li>
                      </ul>
                      <p className="text-xs text-slate-400 italic">
                        {dl.aiAssistant.xyzFooter}
                      </p>
                    </div>

                    {/* Feature 2: STAR Stories */}
                    <div className="p-5 bg-slate-950/80 border border-cyan-900/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60 font-mono">
                          {dl.aiAssistant.starBadge}
                        </span>
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">{dl.aiAssistant.starTitle}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.aiAssistant.starLead}
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1.5">
                        <li><strong className="text-cyan-300">{dl.aiAssistant.starS}</strong></li>
                        <li><strong className="text-cyan-300">{dl.aiAssistant.starT}</strong></li>
                        <li><strong className="text-cyan-300">{dl.aiAssistant.starA}</strong></li>
                        <li><strong className="text-cyan-300">{dl.aiAssistant.starR}</strong></li>
                      </ul>
                      <p className="text-xs text-slate-400 italic">
                        {dl.aiAssistant.starFooter}
                      </p>
                    </div>
                  </div>

                  {/* Live Example Box */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{dl.aiAssistant.exampleTitle}</h4>
                      <button
                        onClick={() => handleCopyExample(dl.aiAssistant.afterText)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {copiedExample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedExample ? dl.aiAssistant.copied : dl.aiAssistant.copyExample}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl space-y-1">
                        <span className="text-red-400 font-bold">{dl.aiAssistant.beforeLabel}</span>
                        <p className="text-slate-300">{dl.aiAssistant.beforeText}</p>
                      </div>
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                        <span className="text-emerald-400 font-bold">{dl.aiAssistant.afterLabel}</span>
                        <p className="text-slate-200">{dl.aiAssistant.afterText}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* SECTION 5: PRIVACY & PUBLIC SHOWCASE */}
            {activeSection === "privacy-showcase" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.privacy.title}</h2>
                    <p className="text-sm text-emerald-400 font-medium mt-1">{dl.privacy.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {dl.privacy.p1}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-950/80 border border-amber-900/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Lock className="w-4 h-4" />
                        <h3 className="text-sm font-bold">{dl.privacy.privateTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.privacy.privateDesc}
                      </p>
                    </div>

                    <div className="p-5 bg-slate-950/80 border border-emerald-900/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Eye className="w-4 h-4" />
                        <h3 className="text-sm font-bold">{dl.privacy.publicTitle}</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dl.privacy.publicDesc}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-white">
                      <Inbox className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">{dl.privacy.inboxTitle}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dl.privacy.inboxDesc}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: SSOT & REPLICATION */}
            {activeSection === "ssot-export" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.ssot.title}</h2>
                    <p className="text-sm text-indigo-400 font-medium mt-1">{dl.ssot.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                    <p>{dl.ssot.p1}</p>
                    <p>{dl.ssot.p2}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold">
                          <FileText className="w-4 h-4" />
                          <span>{dl.ssot.card1Title}</span>
                        </div>
                        <p className="text-slate-400">{dl.ssot.card1Desc}</p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Eye className="w-4 h-4" />
                          <span>{dl.ssot.card2Title}</span>
                        </div>
                        <p className="text-slate-400">{dl.ssot.card2Desc}</p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-purple-400 font-bold">
                          <MessageSquare className="w-4 h-4" />
                          <span>{dl.ssot.card3Title}</span>
                        </div>
                        <p className="text-slate-400">{dl.ssot.card3Desc}</p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <Database className="w-4 h-4" />
                          <span>{dl.ssot.card4Title}</span>
                        </div>
                        <p className="text-slate-400">{dl.ssot.card4Desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 7: FAQ */}
            {activeSection === "faq" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{dl.faq.title}</h2>
                    <p className="text-sm text-teal-400 font-medium mt-1">{dl.faq.subtitle}</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {dl.faq.items.map((item, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden transition-colors"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                          >
                            <span>{item.q}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Quick Action Footer inside Docs */}
            <div className="p-6 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 border border-cyan-800/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">{dl.footerReady.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{dl.footerReady.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenQuickLog}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{dl.footerReady.btn}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
