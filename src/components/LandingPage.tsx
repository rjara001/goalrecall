import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";
import { useI18n } from "../i18n";
import { LANDING_SECTIONS } from "../i18n/landingLocales";
import { LandingHeroPlayground } from "./landing/LandingHeroPlayground";
import { LandingCapabilitiesSection } from "./landing/LandingCapabilitiesSection";
import { LandingFirstMateAndWorkflow } from "./landing/LandingFirstMateAndWorkflow";
import { LandingProofAndFooter } from "./landing/LandingProofAndFooter";

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
  const { language } = useI18n();
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  return (
    <div className="space-y-24 max-w-7xl mx-auto pb-24 text-slate-100">
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
                <span>
                  {ls.userBanner.hello}, {user.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {ls.userBanner.activeSession}
                </span>
              </p>
              <p className="text-xs text-slate-300">{ls.userBanner.backupSummary(logsCount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onEnterQuarters}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {language === "es" ? "Volver a mi Espacio de Trabajo" : "Return to Workspace"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <LandingHeroPlayground
        onOpenAuth={onOpenAuth}
        onEnterQuarters={onEnterQuarters}
        onOpenDocs={onOpenDocs}
        onOpenQuickLog={onOpenQuickLog}
      />

      <LandingCapabilitiesSection
        onOpenQuickLog={onOpenQuickLog}
        onEnterQuarters={onEnterQuarters}
        onEnterPublicDeck={onEnterPublicDeck}
        onOpenFeatures={onOpenFeatures}
      />

      <LandingFirstMateAndWorkflow onEnterPublicDeck={onEnterPublicDeck} />

      <LandingProofAndFooter
        onOpenAuth={onOpenAuth}
        onEnterQuarters={onEnterQuarters}
        onEnterPublicDeck={onEnterPublicDeck}
        onOpenDocs={onOpenDocs}
        onOpenQuickLog={onOpenQuickLog}
      />
    </div>
  );
};
