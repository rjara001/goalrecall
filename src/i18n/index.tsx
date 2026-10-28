import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { SupportedLanguage, SUPPORTED_LANGUAGES, TranslationSchema, LanguageInfo } from "./types";
import { es } from "./translations/es";
import { en } from "./translations/en";
import { pt } from "./translations/pt";
import { fr } from "./translations/fr";
import { de } from "./translations/de";
import { ja } from "./translations/ja";
import { Globe, ChevronDown, Check } from "lucide-react";

const translations: Record<SupportedLanguage, TranslationSchema> = {
  es,
  en,
  pt,
  fr,
  de,
  ja,
};

const STORAGE_KEY = "goalrecall_language";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  languages: LanguageInfo[];
  currentLanguageInfo: LanguageInfo;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved && translations[saved]) {
        return saved;
      }
      // Detect browser language
      const browserLang = navigator.language.slice(0, 2).toLowerCase();
      if (browserLang === "es") return "es";
      if (browserLang === "en") return "en";
      if (browserLang === "pt") return "pt";
      if (browserLang === "fr") return "fr";
      if (browserLang === "de") return "de";
      if (browserLang === "ja") return "ja";
    } catch {
      // fallback
    }
    return "es";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    if (translations[lang]) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      } catch (e) {
        console.error("Failed to save language preference:", e);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language] || translations.es,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageInfo,
    }),
    [language, currentLanguageInfo]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

interface LanguageSelectorProps {
  variant?: "navbar" | "dropdown" | "compact" | "footer";
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = "navbar", className = "" }) => {
  const { language, setLanguage, languages, currentLanguageInfo } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm"
        title="Cambiar idioma / Change language"
        aria-label="Language selector"
      >
        <span className="text-sm select-none">{currentLanguageInfo.flag}</span>
        <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300">
          {currentLanguageInfo.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-blue-400" />
              Idioma / Language
            </span>
          </div>

          <div className="py-1">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-blue-600/15 text-blue-400 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export * from "./types";
