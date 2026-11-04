import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Upload, 
  Check, 
  AlertCircle,
  Database,
  FileJson,
  Linkedin,
  Github,
  Globe,
  Code2,
  Rocket,
  Layers,
  BookOpen,
  Twitter,
  Plus,
  Minus,
  ExternalLink,
  Briefcase,
  Share2,
  Sparkles,
  Eye,
  Info,
  Palette,
  Camera
} from "lucide-react";
import { 
  exportBackupJson, 
  importBackupJson,
  getStoredUser, 
  saveUser 
} from "../utils/storage";
import { UserProfile, EmploymentSocialLinks } from "../types";
import { useI18n } from "../i18n";

const SETTINGS_TEXTS: Record<string, {
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
}> = {
  es: {
    headerTitle: "Configuración & Redes de Empleo",
    headerSubtitle: "Presencia profesional para reclutadores y vitrina pública (Public Deck)",
    tabSocial: "Redes de Empleo & Perfil",
    tabBackup: "Copia de Seguridad (JSON)",
    savedSuccess: "¡Redes de empleo y disponibilidad actualizadas con éxito!",
    showcaseNoticeTitle: "Aviso de Publicación en Vitrina (Public Deck)",
    showcaseNoticeDesc: "Todo enlace que no esté vacío se publicará de manera visible en tu vitrina ejecutiva para que reclutadores y líderes de ingeniería puedan consultarlo.",
    profilePhoto: "Foto de Perfil",
    photoDesc: "Visible en tu bitácora, vitrina pública (Public Deck) y exportaciones",
    changePhoto: "Cambiar Foto",
    statusLabel: "Estado de Búsqueda / Disponibilidad Laboral",
    statusDesc: "Este estado se muestra prominentemente en tu vitrina pública (Public Deck) para reclutadores.",
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
    exportDesc: "Guarda un archivo .json con tus logros, redes profesionales, empresas y mensajes para tener una copia física siempre segura.",
    exportBtn: "Exportar Respaldo (.json)",
    restoreTitle: "Restaurar Respaldo",
    restoreDesc: "Si cambias de computadora o navegador, selecciona tu archivo .json para recuperar todo tu historial y perfiles instantáneamente.",
    loadJsonBtn: "Cargar Archivo .json",
    langDesc: "Cambia el idioma de la interfaz. La configuración se guarda automáticamente en tu navegador para tus próximas visitas.",
    footerNotice: "Respaldo continuo: tus datos están sincronizados en tu navegador y puedes exportar copias físicas en cualquier momento.",
    closeBtn: "Cerrar",
  },
  en: {
    headerTitle: "Settings & Career Networks",
    headerSubtitle: "Professional presence for recruiters and public showcase (Public Deck)",
    tabSocial: "Career Networks & Profile",
    tabBackup: "Backup (JSON)",
    savedSuccess: "Career networks and availability updated successfully!",
    showcaseNoticeTitle: "Public Showcase Notice (Public Deck)",
    showcaseNoticeDesc: "Any non-empty link will be visibly published on your executive showcase for recruiters and engineering leaders to view.",
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
    exportDesc: "Save a .json file with your achievements, career networks, companies, and messages to keep a safe offline copy.",
    exportBtn: "Export Backup (.json)",
    restoreTitle: "Restore Backup",
    restoreDesc: "If you change computers or browsers, select your .json file to restore your full history and profiles immediately.",
    loadJsonBtn: "Upload .json File",
    langDesc: "Switch interface language. Preferences are saved automatically in your browser for future visits.",
    footerNotice: "Continuous backup: your data is local-first and you can export offline physical copies anytime.",
    closeBtn: "Close",
  },
  pt: {
    headerTitle: "Definições & Redes de Emprego",
    headerSubtitle: "Presença profissional para recrutadores e vitrine pública (Public Deck)",
    tabSocial: "Redes de Emprego & Perfil",
    tabBackup: "Cópia de Segurança (JSON)",
    savedSuccess: "Redes de emprego e disponibilidade atualizadas com sucesso!",
    showcaseNoticeTitle: "Aviso da Vitrine Pública (Public Deck)",
    showcaseNoticeDesc: "Qualquer ligação preenchida será visível na sua vitrine para recrutadores.",
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
    headerSubtitle: "Présence professionnelle pour les recruteurs et vitrine publique (Public Deck)",
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

interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  totalLogs: number;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
  onOpenAvatarModal?: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  totalLogs,
  currentUser,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  const { t, language, setLanguage, languages, currentLanguageInfo } = useI18n();
  const st = SETTINGS_TEXTS[language] || SETTINGS_TEXTS.en;
  const [activeTab, setActiveTab] = useState<"social" | "backup" | "language">("social");
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion state for secondary employment networks
  const [isOtherNetworksOpen, setIsOtherNetworksOpen] = useState(false);

  // Social links form state
  const [links, setLinks] = useState<EmploymentSocialLinks>({
    linkedin: "",
    github: "",
    portfolio: "",
    behance: "",
    leetcode: "",
    wellfound: "",
    stackoverflow: "",
    techBlog: "",
    twitter: "",
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    "🟢 Disponible de inmediato (Full Remote)"
  );
  const [username, setUsername] = useState<string>("");

  // Initialize or re-sync when modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      const activeUser = currentUser || getStoredUser();
      if (activeUser) {
        setLinks({
          linkedin: activeUser.socialLinks?.linkedin || activeUser.linkedin || "",
          github: activeUser.socialLinks?.github || activeUser.github || "",
          portfolio: activeUser.socialLinks?.portfolio || "",
          behance: activeUser.socialLinks?.behance || "",
          leetcode: activeUser.socialLinks?.leetcode || "",
          wellfound: activeUser.socialLinks?.wellfound || "",
          stackoverflow: activeUser.socialLinks?.stackoverflow || "",
          techBlog: activeUser.socialLinks?.techBlog || "",
          twitter: activeUser.socialLinks?.twitter || "",
        });
        if (activeUser.availabilityStatus) {
          setAvailabilityStatus(activeUser.availabilityStatus);
        }
        setUsername(activeUser.username || "");
      }
      setSaveSuccess(false);
      setImportStatus(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goal-recall-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackupJson(content);
      if (result.success) {
        setImportStatus({
          success: true,
          msg: `${result.count} logs restored.`,
        });
        onDataChanged();
      } else {
        setImportStatus({
          success: false,
          msg: result.error || "Import failed.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    const activeUser = currentUser || getStoredUser();
    if (!activeUser) return;

    const cleanLinks: EmploymentSocialLinks = {
      linkedin: links.linkedin?.trim() || "",
      github: links.github?.trim() || "",
      portfolio: links.portfolio?.trim() || "",
      behance: links.behance?.trim() || "",
      leetcode: links.leetcode?.trim() || "",
      wellfound: links.wellfound?.trim() || "",
      stackoverflow: links.stackoverflow?.trim() || "",
      techBlog: links.techBlog?.trim() || "",
      twitter: links.twitter?.trim() || "",
    };

    const cleanUsername = username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");

    const updatedUser: UserProfile = {
      ...activeUser,
      username: cleanUsername || activeUser.username,
      github: cleanLinks.github,
      linkedin: cleanLinks.linkedin,
      socialLinks: cleanLinks,
      availabilityStatus: availabilityStatus,
    };

    saveUser(updatedUser);
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    onDataChanged();

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const testLink = (url?: string) => {
    if (!url) return;
    const targetUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Count active secondary networks to show badge in accordion header
  const secondaryCount = [
    links.portfolio,
    links.behance,
    links.leetcode,
    links.wellfound,
    links.stackoverflow,
    links.techBlog,
    links.twitter,
  ].filter((v) => !!v?.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {st.headerTitle}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {st.headerSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "social"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{st.tabSocial}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "backup"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{st.tabBackup}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("language")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "language"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.common.language} ({currentLanguageInfo.flag} {currentLanguageInfo.code.toUpperCase()})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {activeTab === "social" ? (
            <form onSubmit={handleSaveSocialLinks} className="space-y-5">
              
              {/* Notification Banner */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-xs">
                    {st.savedSuccess}
                  </span>
                </div>
              )}

              {/* Vitrina Disclaimer Banner */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs shadow-inner">
                <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                    <span>{st.showcaseNoticeTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {st.showcaseNoticeDesc}
                  </p>
                </div>
              </div>

              {/* Custom Handle / Username Field */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enlace Personalizado de tu Vitrina Pública</span>
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    goalrecall/u/{username || "usuario"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Define tu identificador único (handle) para compartir un enlace directo con reclutadores (ej. <code>rjara001</code>).
                </p>
                <div className="flex items-center mt-1.5">
                  <span className="px-3 py-2 bg-slate-950/80 border border-r-0 border-slate-700 rounded-l-lg text-slate-400 font-mono text-xs select-none">
                    /u/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="rjara001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-r-lg text-cyan-300 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Profile Photo Quick Section */}
              {currentUser && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-xl object-cover border border-cyan-500/40 bg-slate-950 shadow"
                    />
                    <div>
                      <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{st.profilePhoto}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/50">
                          {currentUser.name.split(" ")[0]}
                        </span>
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {st.photoDesc}
                      </p>
                    </div>
                  </div>

                  {onOpenAvatarModal && (
                    <button
                      type="button"
                      onClick={onOpenAvatarModal}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold transition-all shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{st.changePhoto}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Status / Availability Selector */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-200">
                  {st.statusLabel}
                </label>
                <p className="text-[11px] text-slate-400">
                  {st.statusDesc}
                </p>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="🟢 Disponible de inmediato (Full Remote)">
                    {st.optFullRemote}
                  </option>
                  <option value="🟢 Disponible de inmediato (Híbrido / Presencial)">
                    {st.optHybrid}
                  </option>
                  <option value="💼 Abierto a ofertas interesantes (Confidencial)">
                    {st.optOpen}
                  </option>
                  <option value="⚡ Freelance / Contratos de Consultoría">
                    {st.optFreelance}
                  </option>
                  <option value="🔒 Empleado actualmente (No buscando activamente)">
                    {st.optEmployed}
                  </option>
                </select>
              </div>

              {/* 1. PRIMARY NETWORKS (Always visible - Most Relevant) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{st.primaryNetworks}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    {st.notEmptyNotice}
                  </span>
                </div>

                {/* LinkedIn */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
                      <div className="w-6 h-6 rounded-md bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-[#0A66C2]">
                        <Linkedin className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span>LinkedIn</span>
                      <span className="text-[10px] font-bold text-[#0A66C2] bg-[#0A66C2]/15 px-1.5 py-0.5 rounded border border-[#0A66C2]/30">
                        {st.highPriority}
                      </span>
                    </label>

                    {links.linkedin && (
                      <button
                        type="button"
                        onClick={() => testLink(links.linkedin)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{st.openLink}</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={links.linkedin}
                    onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* GitHub */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
                      <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                        <Github className="w-3.5 h-3.5" />
                      </div>
                      <span>GitHub</span>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {st.codeProjects}
                      </span>
                    </label>

                    {links.github && (
                      <button
                        type="button"
                        onClick={() => testLink(links.github)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{st.openLink}</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* 2. ACCORDION: Secondary Employment Networks with [+] */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setIsOtherNetworksOpen(!isOtherNetworksOpen)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
                      {isOtherNetworksOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {st.otherNetworks}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {st.otherNetworksDesc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {secondaryCount > 0 && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        {secondaryCount} {st.configured}
                      </span>
                    )}
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      {isOtherNetworksOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOtherNetworksOpen && (
                  <div className="p-4 pt-1 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in slide-in-from-top-1 duration-150">
                    
                    {/* Portfolio / Website */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{st.personalPortfolio}</span>
                        </label>
                        {links.portfolio && (
                          <button
                            type="button"
                            onClick={() => testLink(links.portfolio)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.portfolio}
                        onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.dev"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Behance / Dribbble / Portfolio Creativo */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Palette className="w-3.5 h-3.5 text-pink-400" />
                          <span>{st.designPortfolio}</span>
                        </label>
                        {links.behance && (
                          <button
                            type="button"
                            onClick={() => testLink(links.behance)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.behance}
                        onChange={(e) => setLinks({ ...links, behance: e.target.value })}
                        placeholder="https://behance.net/profile"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* LeetCode / HackerRank */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Code2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{st.codingPlatform}</span>
                        </label>
                        {links.leetcode && (
                          <button
                            type="button"
                            onClick={() => testLink(links.leetcode)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.leetcode}
                        onChange={(e) => setLinks({ ...links, leetcode: e.target.value })}
                        placeholder="https://leetcode.com/u/username"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Wellfound (AngelList) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Rocket className="w-3.5 h-3.5 text-red-400" />
                          <span>{st.startupPlatform}</span>
                        </label>
                        {links.wellfound && (
                          <button
                            type="button"
                            onClick={() => testLink(links.wellfound)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.wellfound}
                        onChange={(e) => setLinks({ ...links, wellfound: e.target.value })}
                        placeholder="https://wellfound.com/u/username"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Stack Overflow */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-orange-400" />
                          <span>{st.techReputation}</span>
                        </label>
                        {links.stackoverflow && (
                          <button
                            type="button"
                            onClick={() => testLink(links.stackoverflow)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.stackoverflow}
                        onChange={(e) => setLinks({ ...links, stackoverflow: e.target.value })}
                        placeholder="https://stackoverflow.com/users/id/name"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* Tech Blog / Substack / Dev.to */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>{st.techBlog}</span>
                        </label>
                        {links.techBlog && (
                          <button
                            type="button"
                            onClick={() => testLink(links.techBlog)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.techBlog}
                        onChange={(e) => setLinks({ ...links, techBlog: e.target.value })}
                        placeholder="https://dev.to/username"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    {/* X / Twitter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                          <span>{st.techCommunity}</span>
                        </label>
                        {links.twitter && (
                          <button
                            type="button"
                            onClick={() => testLink(links.twitter)}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> {st.openLink}
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={links.twitter}
                        onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                        placeholder="https://x.com/username"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all text-xs shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{st.saveBtn}</span>
                </button>
              </div>

            </form>
          ) : activeTab === "backup" ? (
            <div className="space-y-4">
              {/* Notification Feedback */}
              {importStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    importStatus.success
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                      : "bg-red-950/60 border-red-500/40 text-red-300"
                  }`}
                >
                  {importStatus.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{importStatus.msg}</span>
                </div>
              )}

              {/* Export Section */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">{st.exportTitle}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {st.exportDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-sm shadow-cyan-500/20"
                >
                  <FileJson className="w-4 h-4" />
                  <span>{st.exportBtn}</span>
                </button>
              </div>

              {/* Import Section */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">{st.restoreTitle}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {st.restoreDesc}
                    </p>
                  </div>
                </div>

                <label className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 hover:border-cyan-500 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer text-slate-200 hover:text-white transition-colors font-medium">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{st.loadJsonBtn}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Language Tab */
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-white text-xs">
                    {t.common.selectLanguage}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {st.langDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {languages.map((lang) => {
                  const isSelected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            {st.footerNotice}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {st.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
