import React from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Laptop,
  Lock,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { LANDING_SECTIONS } from "../../i18n/landingLocales";

interface LandingCapabilitiesSectionProps {
  onOpenQuickLog?: () => void;
  onEnterQuarters: () => void;
  onEnterPublicDeck: () => void;
  onOpenFeatures?: () => void;
}

export const LandingCapabilitiesSection: React.FC<LandingCapabilitiesSectionProps> = ({
  onOpenQuickLog,
  onEnterQuarters,
  onEnterPublicDeck,
  onOpenFeatures,
}) => {
  const { language } = useI18n();
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  return (
    <>
      <section className="space-y-6 pt-6 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            {ls.painPoint.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.painPoint.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{ls.painPoint.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{ls.painPoint.card1Title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ls.painPoint.card1Desc}</p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{ls.painPoint.card2Title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ls.painPoint.card2Desc}</p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{ls.painPoint.card3Title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ls.painPoint.card3Desc}</p>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {ls.bentoGrid.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.bentoGrid.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{ls.bentoGrid.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">{ls.bentoGrid.card1Title}</h3>
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

          <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">{ls.bentoGrid.card2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {ls.bentoGrid.card2Desc}
              </p>
              <p className="text-xs text-slate-400">{ls.bentoGrid.card2ToggleNote}</p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{ls.bentoGrid.card2Isolation}</span>
            </div>
          </div>

          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">{ls.bentoGrid.card3Title}</h3>
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

          <div className="md:col-span-6 p-6 sm:p-8 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">{ls.bentoGrid.card4Title}</h3>
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
                  <p className="text-xs text-slate-300 mt-0.5">{ls.catalogBanner.subtitle}</p>
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
    </>
  );
};
