import React from "react";
import { CheckCircle2, Linkedin, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { LANDING_SECTIONS } from "../../i18n/landingLocales";

interface LandingProofAndFooterProps {
  onOpenAuth: () => void;
  onEnterQuarters: () => void;
  onEnterPublicDeck: () => void;
  onOpenDocs: () => void;
  onOpenQuickLog?: () => void;
}

export const LandingProofAndFooter: React.FC<LandingProofAndFooterProps> = ({
  onOpenAuth,
  onEnterQuarters,
  onEnterPublicDeck,
  onOpenDocs,
  onOpenQuickLog,
}) => {
  const { t, language } = useI18n();
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  return (
    <>
      <section id="comparison" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {t.landing.comparisonTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.landing.comparisonTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.landing.comparisonSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-300 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold">{t.landing.tableFeature}</th>
                <th className="p-4 text-slate-400">{t.landing.tableLinkedIn}</th>
                <th className="p-4 text-slate-400">{t.landing.tableDocs}</th>
                <th className="p-4 text-cyan-300 bg-cyan-950/60 font-bold">
                  {t.landing.tableGoalRecall}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 font-sans">
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp1Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp1LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp1Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">
                  {t.landing.comp1GoalRecall}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp2Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp2LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp2Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">
                  {t.landing.comp2GoalRecall}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp3Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp3LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp3Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">
                  {t.landing.comp3GoalRecall}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-white">{t.landing.comp4Feature}</td>
                <td className="p-4 text-slate-500">{t.landing.comp4LinkedIn}</td>
                <td className="p-4 text-slate-500">{t.landing.comp4Docs}</td>
                <td className="p-4 text-emerald-400 font-bold bg-cyan-950/20">
                  {t.landing.comp4GoalRecall}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="testimonials" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {ls.testimonials.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.testimonials.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{ls.testimonials.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <footer className="pt-12 border-t border-slate-800 text-slate-400 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              {ls.footer.col1Title}
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenQuickLog || onEnterQuarters}
                  className="hover:text-cyan-300 transition-colors"
                >
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
                <button
                  onClick={onEnterPublicDeck}
                  className="hover:text-cyan-300 transition-colors"
                >
                  {ls.footer.col1Item4}
                </button>
              </li>
              <li>
                <button
                  onClick={onEnterPublicDeck}
                  className="hover:text-cyan-300 transition-colors"
                >
                  {ls.footer.col1Item5}
                </button>
              </li>
            </ul>
          </div>

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

          <div className="space-y-3">
            <p className="font-bold text-white font-mono text-[11px] tracking-wider uppercase">
              {ls.footer.col4Title}
            </p>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400">{ls.footer.col4Desc}</p>
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

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {ls.footer.copyright}
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {ls.footer.status}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};
