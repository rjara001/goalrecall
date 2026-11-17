import React, { useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Cloud,
  ExternalLink,
  Eye,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { FIRST_MATE_SAMPLES_BY_LANG, LANDING_SECTIONS } from "../../i18n/landingLocales";

interface LandingFirstMateAndWorkflowProps {
  onEnterPublicDeck: () => void;
}

export const LandingFirstMateAndWorkflow: React.FC<LandingFirstMateAndWorkflowProps> = ({
  onEnterPublicDeck,
}) => {
  const { language } = useI18n();
  const firstMateSamples = FIRST_MATE_SAMPLES_BY_LANG[language] || FIRST_MATE_SAMPLES_BY_LANG.en;
  const ls = LANDING_SECTIONS[language] || LANDING_SECTIONS.en;

  const [activeChatIndex, setActiveChatIndex] = useState<number>(0);
  const activeChat = firstMateSamples[activeChatIndex] || firstMateSamples[0];

  return (
    <>
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            {ls.firstMate.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {ls.firstMate.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{ls.firstMate.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0B101C] to-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
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
                <p className="text-xs text-slate-400">{ls.firstMate.statusOnline}</p>
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

          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-md bg-cyan-950/50 border border-cyan-800/40 rounded-2xl rounded-tr-sm p-3.5 text-xs text-cyan-100">
                <p className="font-semibold">{activeChat.question}</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 text-xs font-mono font-bold">
                HR
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-lg bg-slate-900/90 border border-emerald-900/50 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-200 space-y-3">
                <p className="leading-relaxed">{activeChat.answer}</p>

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
            <p className="text-xs text-slate-300 leading-relaxed">{ls.workflow.step1Desc}</p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded">
              {ls.workflow.step2Badge}
            </span>
            <h4 className="text-base font-bold text-white">{ls.workflow.step2Title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{ls.workflow.step2Desc}</p>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2.5 py-1 rounded">
              {ls.workflow.step3Badge}
            </span>
            <h4 className="text-base font-bold text-white">{ls.workflow.step3Title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{ls.workflow.step3Desc}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-6">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900/80 via-slate-950 to-cyan-950/30 border border-cyan-800/40 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {ls.cloudSync.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{ls.cloudSync.title}</h3>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-3 py-1.5 rounded-lg border border-cyan-800/60 self-start sm:self-auto font-bold">
              {ls.cloudSync.tag}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                <Cloud className="w-4 h-4" />
                <span>{ls.cloudSync.card1Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ls.cloudSync.card1Desc}</p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <Lock className="w-4 h-4" />
                <span>{ls.cloudSync.card2Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ls.cloudSync.card2Desc}</p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <Eye className="w-4 h-4" />
                <span>{ls.cloudSync.card3Title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ls.cloudSync.card3Desc}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
