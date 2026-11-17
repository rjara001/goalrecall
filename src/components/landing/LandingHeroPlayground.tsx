import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Database,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { DEMO_PRESETS_BY_LANG, LANDING_SECTIONS } from "../../i18n/landingLocales";

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

interface LandingHeroPlaygroundProps {
  onOpenAuth: () => void;
  onEnterQuarters: () => void;
  onOpenDocs: () => void;
  onOpenQuickLog?: () => void;
}

export const LandingHeroPlayground: React.FC<LandingHeroPlaygroundProps> = ({
  onOpenAuth,
  onEnterQuarters,
  onOpenDocs,
  onOpenQuickLog,
}) => {
  const { t, language } = useI18n();
  const demoPresets = (DEMO_PRESETS_BY_LANG[language] || DEMO_PRESETS_BY_LANG.en) as DemoPreset[];
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  const [selectedPresetId, setSelectedPresetId] = useState<string>("tech-redis");
  const [customInput, setCustomInput] = useState<string>(demoPresets[0].rawInput);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

  const cloudSyncTrustLabel =
    language === "en"
      ? "Private Cloud Sync (Multi-Device)"
      : language === "pt"
      ? "Cloud Sync Privado (Multi-dispositivo)"
      : language === "fr"
      ? "Cloud Sync Privé (Multi-appareils)"
      : language === "de"
      ? "Privater Cloud Sync (Multi-Device)"
      : language === "ja"
      ? "プライベートCloud Sync（複数端末）"
      : "Cloud Sync Privado (Multi-dispositivo)";

  return (
    <section className="relative pt-4 sm:pt-10 pb-6 text-center lg:text-left">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t.landing.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
            {t.landing.heroTitlePrefix}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
              {t.landing.heroTitleHighlight}
            </span>{" "}
            {t.landing.heroTitleSuffix}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            {t.landing.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
            <button
              onClick={onOpenQuickLog || onEnterQuarters}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>{t.landing.ctaPrimary}</span>
              <span className="text-[11px] font-mono bg-cyan-950/40 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                {t.landing.stat3Value}
              </span>
            </button>

            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>{t.nav.signIn}</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="w-full sm:w-auto px-4 py-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 hover:border-cyan-500/40 text-cyan-300 hover:text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              title="Documentación Oficial y Guía de Usuario (/docs)"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{t.landing.ctaDocs}</span>
            </button>
          </div>

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

          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{cloudSyncTrustLabel}</span>
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

        <div className="lg:col-span-6">
          <div className="bg-[#0B101B] border border-cyan-900/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/40 space-y-4 font-sans relative overflow-hidden">
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
                    <div className="text-[10px] font-mono text-cyan-400/90 font-semibold">
                      {preset.category}
                    </div>
                    <div className="truncate text-[11px]">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

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
                  <span>
                    {isSynthesizing
                      ? t.landing.synthesizing
                      : t.landing.synthesizeBtn.split(" ")[0]}
                  </span>
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all duration-300 space-y-3 ${
                isSynthesizing
                  ? "bg-slate-900/80 border-cyan-500 animate-pulse"
                  : "bg-cyan-950/20 border-cyan-800/50 shadow-inner"
              }`}
            >
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

              <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                "{fullSynthesizedBullet}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-cyan-400 font-bold block">
                    {t.landing.metricAccomplished}:
                  </span>
                  <span className="text-slate-300 line-clamp-1">{activePreset.xyzAccomplished}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">
                    {t.landing.metricMeasured}:
                  </span>
                  <span className="text-slate-300 line-clamp-1">{activePreset.xyzMeasured}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-purple-400 font-bold block">
                    {t.landing.metricByDoing}:
                  </span>
                  <span className="text-slate-300 line-clamp-1">{activePreset.xyzByDoing}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950/80 border border-emerald-900/50 rounded-lg flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.common.metrics}:</span>
                </div>
                <span className="font-bold">{activePreset.metricBadge}</span>
              </div>
            </div>

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
  );
};
