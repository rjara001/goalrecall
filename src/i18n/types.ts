export type SupportedLanguage = "es" | "en" | "pt" | "fr" | "de" | "ja";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "pt", name: "Portugués", nativeName: "Português", flag: "🇧🇷" },
  { code: "fr", name: "Francés", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "Alemán", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japonés", nativeName: "日本語", flag: "🇯🇵" },
];

export interface TranslationSchema {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    save: string;
    cancel: string;
    close: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    copy: string;
    copied: string;
    back: string;
    next: string;
    download: string;
    upload: string;
    language: string;
    selectLanguage: string;
  };
  nav: {
    logbook: string;
    timeline: string;
    synthesis: string;
    inbox: string;
    offers: string;
    features: string;
    docs: string;
    publicView: string;
    importCv: string;
    newLog: string;
    settings: string;
    signIn: string;
    signUp: string;
    signOut: string;
    changeAvatar: string;
    guest: string;
  };
  landing: {
    badge: string;
    heroTitlePrefix: string;
    heroTitleHighlight: string;
    heroTitleSuffix: string;
    heroDescription: string;
    ctaPrimary: string;
    ctaDocs: string;
    ctaFeatures: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
    featuresHeading: string;
    featuresSubheading: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
  };
  timeline: {
    title: string;
    subtitle: string;
    addExperience: string;
    emptyTitle: string;
    emptyDesc: string;
    allYears: string;
    filterPlaceholder: string;
    impact: string;
    technologies: string;
    date: string;
    quarter: string;
    isPublic: string;
    isPrivate: string;
  };
  cv: {
    modalTitle: string;
    modalSubtitle: string;
    dragDrop: string;
    browseFiles: string;
    supportedFormats: string;
    extracting: string;
    downloadSample: string;
    downloadSampleDesc: string;
    successParsed: string;
    applyToProfile: string;
  };
  docs: {
    title: string;
    badge: string;
    subtitle: string;
    searchPlaceholder: string;
    categories: {
      quickStart: string;
      cvImport: string;
      quarters: string;
      synthesis: string;
      export: string;
      privacy: string;
    };
  };
  features: {
    title: string;
    badge: string;
    subtitle: string;
    allFeatures: string;
    dataFlow: string;
    singleSource: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    submitLogin: string;
    submitRegister: string;
    quickDemo: string;
    switchRegister: string;
    switchLogin: string;
  };
}
