export interface SettingsLocaleText {
  headerTitle: string;
  headerSubtitle: string;
  tabSocial: string;
  tabBackup: string;
  savedSuccess: string;
  showcaseNoticeTitle: string;
  showcaseNoticeDesc: string;
  profilePhoto: string;
  photoDesc: string;
  changePhoto: string;
  statusLabel: string;
  statusDesc: string;
  optFullRemote: string;
  optHybrid: string;
  optOpen: string;
  optFreelance: string;
  optEmployed: string;
  primaryNetworks: string;
  notEmptyNotice: string;
  highPriority: string;
  codeProjects: string;
  openLink: string;
  otherNetworks: string;
  otherNetworksDesc: string;
  configured: string;
  personalPortfolio: string;
  designPortfolio: string;
  codingPlatform: string;
  startupPlatform: string;
  techReputation: string;
  techBlog: string;
  techCommunity: string;
  saveBtn: string;
  exportTitle: string;
  exportDesc: string;
  exportBtn: string;
  restoreTitle: string;
  restoreDesc: string;
  loadJsonBtn: string;
  langDesc: string;
  footerNotice: string;
  closeBtn: string;
}

export const SETTINGS_TEXTS: Record<string, SettingsLocaleText> = {
  es: {
    headerTitle: "Configuración & Redes de Empleo",
    headerSubtitle: "Presencia profesional para reclutadores y vitrina pública (Public Deck)",
    tabSocial: "Redes de Empleo & Perfil",
    tabBackup: "Copia de Seguridad (JSON)",
    savedSuccess: "¡Redes de empleo y disponibilidad actualizadas con éxito!",
    showcaseNoticeTitle: "Aviso de Publicación en Vitrina (Public Deck)",
    showcaseNoticeDesc:
      "Todo enlace que no esté vacío se publicará de manera visible en tu vitrina ejecutiva para que reclutadores y líderes de ingeniería puedan consultarlo.",
    profilePhoto: "Foto de Perfil",
    photoDesc: "Visible en tu bitácora, vitrina pública (Public Deck) y exportaciones",
    changePhoto: "Cambiar Foto",
    statusLabel: "Estado de Búsqueda / Disponibilidad Laboral",
    statusDesc:
      "Este estado se muestra prominentemente en tu vitrina pública (Public Deck) para reclutadores.",
    optFullRemote: "🟢 Disponible de inmediato (Full Remote)",
    optHybrid: "🟢 Disponible de inmediato (Híbrido / Presencial)",
    optOpen: "💼 Abierto a ofertas interesantes (Confidencial)",
    optFreelance: "⚡ Freelance / Contratos de Consultoría",
    optEmployed: "🔒 Empleado actualmente (No buscando activamente)",
    primaryNetworks: "Redes Laborales Principales (Más Relevantes)",
    notEmptyNotice: "No vacío = Visible en Vitrina",
    highPriority: "Prioridad Alta",
    codeProjects: "Código & Proyectos",
    openLink: "Abrir",
    otherNetworks: "Otras redes profesionales & portafolios",
    otherNetworksDesc: "Portafolio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X",
    configured: "configuradas",
    personalPortfolio: "Portafolio Web Personal",
    designPortfolio: "Behance / Dribbble (Portafolio Visual & Diseño)",
    codingPlatform: "LeetCode / HackerRank (Algoritmos & Coding)",
    startupPlatform: "Wellfound / AngelList (Startups & Tech Jobs)",
    techReputation: "Stack Overflow (Reputación Técnica)",
    techBlog: "Blog Técnico (Substack / Dev.to / Medium)",
    techCommunity: "X / Twitter (Comunidad Técnica & Networking)",
    saveBtn: "Guardar Redes & Disponibilidad",
    exportTitle: "Descargar Respaldo Completo",
    exportDesc:
      "Guarda un archivo .json con tus logros, redes profesionales, empresas y mensajes para tener una copia física siempre segura.",
    exportBtn: "Exportar Respaldo (.json)",
    restoreTitle: "Restaurar Respaldo",
    restoreDesc:
      "Si cambias de computadora o navegador, selecciona tu archivo .json para recuperar todo tu historial y perfiles instantáneamente.",
    loadJsonBtn: "Cargar Archivo .json",
    langDesc:
      "Cambia el idioma de la interfaz. La configuración se guarda automáticamente en tu navegador para tus próximas visitas.",
    footerNotice:
      "Respaldo continuo: tus datos están sincronizados en tu navegador y puedes exportar copias físicas en cualquier momento.",
    closeBtn: "Cerrar",
  },
  en: {
    headerTitle: "Settings & Career Networks",
    headerSubtitle: "Professional presence for recruiters and public showcase (Public Deck)",
    tabSocial: "Career Networks & Profile",
    tabBackup: "Backup (JSON)",
    savedSuccess: "Career networks and availability updated successfully!",
    showcaseNoticeTitle: "Public Showcase Notice (Public Deck)",
    showcaseNoticeDesc:
      "Any non-empty link will be visibly published on your executive showcase for recruiters and engineering leaders to view.",
    profilePhoto: "Profile Photo",
    photoDesc: "Visible in your logbook, Public Deck, and exports",
    changePhoto: "Change Photo",
    statusLabel: "Job Search Status / Availability",
    statusDesc: "This status is prominently displayed on your Public Deck for recruiters.",
    optFullRemote: "🟢 Available immediately (Full Remote)",
    optHybrid: "🟢 Available immediately (Hybrid / On-site)",
    optOpen: "💼 Open to attractive offers (Confidential)",
    optFreelance: "⚡ Freelance / Consulting Contracts",
    optEmployed: "🔒 Currently employed (Not actively looking)",
    primaryNetworks: "Primary Career Networks (Most Relevant)",
    notEmptyNotice: "Not empty = Visible in Showcase",
    highPriority: "High Priority",
    codeProjects: "Code & Projects",
    openLink: "Open",
    otherNetworks: "Other Professional Networks & Portfolios",
    otherNetworksDesc: "Portfolio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X",
    configured: "configured",
    personalPortfolio: "Personal Web Portfolio",
    designPortfolio: "Behance / Dribbble (Visual & Design Portfolio)",
    codingPlatform: "LeetCode / HackerRank (Algorithms & Coding)",
    startupPlatform: "Wellfound / AngelList (Startups & Tech Jobs)",
    techReputation: "Stack Overflow (Technical Reputation)",
    techBlog: "Technical Blog (Substack / Dev.to / Medium)",
    techCommunity: "X / Twitter (Tech Community & Networking)",
    saveBtn: "Save Networks & Availability",
    exportTitle: "Download Full Backup",
    exportDesc:
      "Save a .json file with your achievements, career networks, companies, and messages to keep a safe offline copy.",
    exportBtn: "Export Backup (.json)",
    restoreTitle: "Restore Backup",
    restoreDesc:
      "If you change computers or browsers, select your .json file to restore your full history and profiles immediately.",
    loadJsonBtn: "Upload .json File",
    langDesc:
      "Switch interface language. Preferences are saved automatically in your browser for future visits.",
    footerNotice:
      "Continuous backup: your data is local-first and you can export offline physical copies anytime.",
    closeBtn: "Close",
  },
  pt: {
    headerTitle: "Definições & Redes de Emprego",
    headerSubtitle: "Presença profissional para recrutadores e vitrine pública (Public Deck)",
    tabSocial: "Redes de Emprego & Perfil",
    tabBackup: "Cópia de Segurança (JSON)",
    savedSuccess: "Redes de emprego e disponibilidade atualizadas com sucesso!",
    showcaseNoticeTitle: "Aviso da Vitrine Pública (Public Deck)",
    showcaseNoticeDesc:
      "Qualquer ligação preenchida será visível na sua vitrine para recrutadores.",
    profilePhoto: "Foto de Perfil",
    photoDesc: "Visível no seu diário, vitrine pública e exportações",
    changePhoto: "Alterar Foto",
    statusLabel: "Disponibilidade Profissional",
    statusDesc: "Este estado é apresentado na sua vitrine pública para recrutadores.",
    optFullRemote: "🟢 Disponível de imediato (Full Remote)",
    optHybrid: "🟢 Disponível de imediato (Híbrido / Presencial)",
    optOpen: "💼 Aberto a propostas interessantes (Confidencial)",
    optFreelance: "⚡ Freelance / Consultoria",
    optEmployed: "🔒 Empregado atualmente",
    primaryNetworks: "Redes Profissionais Principais",
    notEmptyNotice: "Preenchido = Visível na Vitrine",
    highPriority: "Prioridade Alta",
    codeProjects: "Código & Projetos",
    openLink: "Abrir",
    otherNetworks: "Outras Redes & Portefólios",
    otherNetworksDesc: "Portefólio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X",
    configured: "configuradas",
    personalPortfolio: "Portefólio Web Pessoal",
    designPortfolio: "Behance / Dribbble (Design & Visual)",
    codingPlatform: "LeetCode / HackerRank (Algoritmos)",
    startupPlatform: "Wellfound / AngelList (Startups)",
    techReputation: "Stack Overflow (Reputação)",
    techBlog: "Blog Técnico (Substack / Dev.to)",
    techCommunity: "X / Twitter (Comunidade Técnica)",
    saveBtn: "Guardar Redes & Disponibilidade",
    exportTitle: "Descarregar Cópia de Segurança",
    exportDesc: "Guarda um ficheiro .json com todo o histórico.",
    exportBtn: "Exportar (.json)",
    restoreTitle: "Restaurar Cópia",
    restoreDesc: "Carregue o seu ficheiro .json para restaurar dados.",
    loadJsonBtn: "Carregar Ficheiro .json",
    langDesc: "Altere o idioma da aplicação.",
    footerNotice: "Cópia contínua e local com segurança total.",
    closeBtn: "Fechar",
  },
  fr: {
    headerTitle: "Paramètres & Réseaux Professionnels",
    headerSubtitle:
      "Présence professionnelle pour les recruteurs et vitrine publique (Public Deck)",
    tabSocial: "Réseaux Pro & Profil",
    tabBackup: "Sauvegarde (JSON)",
    savedSuccess: "Réseaux professionnels et disponibilité mis à jour avec succès !",
    showcaseNoticeTitle: "Avis de Vitrine Publique (Public Deck)",
    showcaseNoticeDesc: "Tout lien renseigné sera publié sur votre vitrine pour les recruteurs.",
    profilePhoto: "Photo de Profil",
    photoDesc: "Visible dans votre journal de bord et vitrine",
    changePhoto: "Changer la Photo",
    statusLabel: "Disponibilité Professionnelle",
    statusDesc: "Ce statut apparaît sur votre vitrine publique pour les recruteurs.",
    optFullRemote: "🟢 Disponible immédiatement (Full Remote)",
    optHybrid: "🟢 Disponible immédiatement (Hybride / Présentiel)",
    optOpen: "💼 Ouvert aux opportunités (Confidentiel)",
    optFreelance: "⚡ Freelance / Contrats de Conseil",
    optEmployed: "🔒 Actuellement en poste",
    primaryNetworks: "Réseaux Principaux (Plus Pertinents)",
    notEmptyNotice: "Rempli = Visible sur la Vitrine",
    highPriority: "Priorité Haute",
    codeProjects: "Code & Projets",
    openLink: "Ouvrir",
    otherNetworks: "Autres Réseaux & Portfolios",
    otherNetworksDesc: "Portfolio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X",
    configured: "configurés",
    personalPortfolio: "Portfolio Web Personnel",
    designPortfolio: "Behance / Dribbble (Design & Visuel)",
    codingPlatform: "LeetCode / HackerRank (Algorithmes)",
    startupPlatform: "Wellfound / AngelList (Startups)",
    techReputation: "Stack Overflow (Réputation)",
    techBlog: "Blog Technique (Substack / Dev.to)",
    techCommunity: "X / Twitter (Communauté & Réseau)",
    saveBtn: "Enregistrer Réseaux & Disponibilité",
    exportTitle: "Télécharger la Sauvegarde Complète",
    exportDesc: "Enregistre un fichier .json avec toutes vos données.",
    exportBtn: "Exporter (.json)",
    restoreTitle: "Restaurer la Sauvegarde",
    restoreDesc: "Sélectionnez votre fichier .json pour restaurer votre profil.",
    loadJsonBtn: "Charger le Fichier .json",
    langDesc: "Changez la langue de l'interface.",
    footerNotice: "Sauvegarde continue en local dans votre navigateur.",
    closeBtn: "Fermer",
  },
  de: {
    headerTitle: "Einstellungen & Karriere-Netzwerke",
    headerSubtitle: "Professionelle Präsenz für Recruiter und öffentliches Schaufenster (Public Deck)",
    tabSocial: "Karriere-Netzwerke & Profil",
    tabBackup: "Sicherung (JSON)",
    savedSuccess: "Karriere-Netzwerke und Verfügbarkeit erfolgreich aktualisiert!",
    showcaseNoticeTitle: "Hinweis zum öffentlichen Schaufenster",
    showcaseNoticeDesc: "Jeder ausgefüllte Link wird öffentlich in Ihrem Schaufenster angezeigt.",
    profilePhoto: "Profilbild",
    photoDesc: "Sichtbar in Ihrem Logbuch und Schaufenster",
    changePhoto: "Foto Ändern",
    statusLabel: "Verfügbarkeitsstatus",
    statusDesc: "Wird Recruitern auf Ihrem Public Deck angezeigt.",
    optFullRemote: "🟢 Sofort verfügbar (Full Remote)",
    optHybrid: "🟢 Sofort verfügbar (Hybrid / Vor Ort)",
    optOpen: "💼 Offen für Angebote (Vertraulich)",
    optFreelance: "⚡ Freelance / Beratungsprojekte",
    optEmployed: "🔒 Derzeit beschäftigt",
    primaryNetworks: "Hauptkarriere-Netzwerke",
    notEmptyNotice: "Ausgefüllt = Sichtbar im Schaufenster",
    highPriority: "Hohe Priorität",
    codeProjects: "Code & Projekte",
    openLink: "Öffnen",
    otherNetworks: "Weitere Netzwerke & Portfolios",
    otherNetworksDesc: "Portfolio, Behance/Dribbble, LeetCode, Substack, Wellfound, Stack Overflow, X",
    configured: "konfiguriert",
    personalPortfolio: "Persönliches Web-Portfolio",
    designPortfolio: "Behance / Dribbble (Design-Portfolio)",
    codingPlatform: "LeetCode / HackerRank (Algorithmen)",
    startupPlatform: "Wellfound / AngelList (Startups)",
    techReputation: "Stack Overflow (Reputation)",
    techBlog: "Technischer Blog (Substack / Dev.to)",
    techCommunity: "X / Twitter (Tech-Community)",
    saveBtn: "Netzwerke & Status Speichern",
    exportTitle: "Vollständige Sicherung Herunterladen",
    exportDesc: "Speichern Sie eine .json-Datei mit all Ihren Daten.",
    exportBtn: "Sicherung Exportieren (.json)",
    restoreTitle: "Sicherung Wiederherstellen",
    restoreDesc: "Wählen Sie Ihre .json-Datei aus, um alle Daten wiederherzustellen.",
    loadJsonBtn: ".json-Datei Hochladen",
    langDesc: "Sprache der Benutzeroberfläche ändern.",
    footerNotice: "Lokale Speicherung mit voller Datenkontrolle.",
    closeBtn: "Schließen",
  },
  ja: {
    headerTitle: "設定＆キャリアネットワーク",
    headerSubtitle: "採用担当者向けプロフェッショナル情報と公開ショーケース (Public Deck)",
    tabSocial: "キャリアネットワーク＆プロフィール",
    tabBackup: "バックアップ (JSON)",
    savedSuccess: "キャリアネットワークと稼働状況を保存しました！",
    showcaseNoticeTitle: "公開ショーケースへの掲載について",
    showcaseNoticeDesc: "入力されたリンクはすべて公開ショーケースで採用担当者に公開されます。",
    profilePhoto: "プロフィール写真",
    photoDesc: "ログブック、ショーケース、エクスポートに表示されます",
    changePhoto: "写真を変更",
    statusLabel: "転職活動状況 / 稼働状況",
    statusDesc: "採用担当者向けに公開ショーケースで目立つように表示されます。",
    optFullRemote: "🟢 即時稼働可能 (フルリモート)",
    optHybrid: "🟢 即時稼働可能 (ハイブリッド / 出社)",
    optOpen: "💼 魅力的なオファーがあれば検討 (非公開)",
    optFreelance: "⚡ フリーランス / 業務委託・コンサル",
    optEmployed: "🔒 在職中 (積極的な転職活動は行っていません)",
    primaryNetworks: "主要キャリアネットワーク",
    notEmptyNotice: "入力あり = ショーケースに表示",
    highPriority: "高優先度",
    codeProjects: "コード＆プロジェクト",
    openLink: "開く",
    otherNetworks: "その他のネットワーク＆ポートフォリオ",
    otherNetworksDesc: "ポートフォリオ、Behance、LeetCode、Substack、Wellfound、Stack Overflow、X",
    configured: "件設定済み",
    personalPortfolio: "個人ウェブポートフォリオ",
    designPortfolio: "Behance / Dribbble (デザインポートフォリオ)",
    codingPlatform: "LeetCode / HackerRank (コーディング・アルゴリズム)",
    startupPlatform: "Wellfound / AngelList (スタートアップ)",
    techReputation: "Stack Overflow (技術評価)",
    techBlog: "技術ブログ (Substack / Dev.to / Zenn / Qiita)",
    techCommunity: "X / Twitter (技術コミュニティ)",
    saveBtn: "ネットワークと稼働状況を保存",
    exportTitle: "完全バックアップをダウンロード",
    exportDesc: "実績、経歴、メッセージを含む .json ファイルをローカルに保存します。",
    exportBtn: "バックアップをエクスポート (.json)",
    restoreTitle: "バックアップから復元",
    restoreDesc: "PCやブラウザを変更した場合、.json ファイルを選択して即座に復元できます。",
    loadJsonBtn: ".json ファイルを読み込む",
    langDesc: "UI言語を変更します。設定はブラウザに自動保存されます。",
    footerNotice: "ローカルファースト設計：データは常に安全に保持され、いつでも書き出せます。",
    closeBtn: "閉じる",
  },
};
