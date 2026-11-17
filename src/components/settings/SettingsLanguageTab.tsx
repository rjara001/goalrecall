import React from "react";
import { Check, Globe } from "lucide-react";
import { SupportedLanguage, useI18n } from "../../i18n";
import { SettingsLocaleText } from "./settingsLocales";

interface SettingsLanguageTabProps {
  st: SettingsLocaleText;
}

export const SettingsLanguageTab: React.FC<SettingsLanguageTabProps> = ({ st }) => {
  const { t, language, setLanguage, languages } = useI18n();

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-blue-400" />
          <h4 className="font-bold text-white text-xs">{t.common.selectLanguage}</h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{st.langDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {languages.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as SupportedLanguage)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                isSelected
                  ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">{lang.flag}</span>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                    {lang.nativeName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {lang.name} ({lang.code.toUpperCase()})
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
