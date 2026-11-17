import React from "react";
import { UserProfile } from "../types";
import { ActiveView, QuartersTab } from "../hooks/useAppRouting";
import { useI18n } from "../i18n";

export interface AppFooterProps {
  appVersion: string;
  user: UserProfile | null;
  onNavigateView: (view: ActiveView) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onSelectQuartersTab: (tab: QuartersTab) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  appVersion,
  user,
  onNavigateView,
  onOpenAuth,
  onOpenSettings,
  onSelectQuartersTab,
}) => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-900 bg-[#060910] py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-slate-300 font-bold">{t.app.footerTagline}</p>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.2 rounded font-semibold">
              v{appVersion}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{t.app.footerPrivacy}</p>
          <p className="font-mono text-xs text-slate-400">v{appVersion}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={() => onNavigateView("landing")}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.app.navHome}
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigateView("features")}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.app.navFeatures}
          </button>
          <span>·</span>
          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else onNavigateView("offers");
            }}
            className="hover:text-cyan-400 transition-colors text-indigo-300 font-medium"
          >
            {t.app.navOffers}
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigateView("docs")}
            className="hover:text-cyan-400 transition-colors font-medium text-cyan-300"
          >
            {t.app.navDocs}
          </button>
          <span>·</span>
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                onNavigateView("quarters");
                onSelectQuartersTab("timeline");
              }
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.app.navLogbook}
          </button>
          <span>·</span>
          <button
            onClick={() => onNavigateView("public")}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.app.navShowcase}
          </button>
          <span>·</span>
          <button
            onClick={onOpenSettings}
            className="hover:text-cyan-400 transition-colors"
          >
            {t.app.navSettings}
          </button>
        </div>
      </div>
    </footer>
  );
};
