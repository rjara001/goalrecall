export const AVATAR_PRESETS = [
  {
    label: "Architect",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Dev Leader",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Systems Pro",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Platform Engineer",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
];

export interface AuthLocaleText {
  activeSession: string;
  connectedAs: string;
  editProfile: string;
  closeEdit: string;
  logout: string;
  editDetails: string;
  changePhoto: string;
  jobTitle: string;
  location: string;
  bio: string;
  continueGoogle: string;
  orCustom: string;
  confirmPass: string;
  devAvatar: string;
  noAccount: string;
  hasAccount: string;
  devLoginPrompt: string;
}

export interface UsernameCheckStatus {
  checking: boolean;
  available?: boolean;
  reason?: string;
  suggestions?: string[];
}

export const sanitizeUsernameHandle = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

export const AUTH_TEXTS: Record<string, AuthLocaleText> = {
  es: {
    activeSession: "Sesión Activa & Perfil",
    connectedAs: "Conectado como",
    editProfile: "Editar Perfil",
    closeEdit: "Cerrar Edición",
    logout: "Cerrar Sesión",
    editDetails: "Editar Datos del Perfil",
    changePhoto: "Cambiar Foto",
    jobTitle: "Cargo / Especialidad",
    location: "Ubicación",
    bio: "Biografía",
    continueGoogle: "Continuar con Google",
    orCustom: "o con tu cuenta custom",
    confirmPass: "Confirmar Contraseña *",
    devAvatar: "Avatar de Desarrollador",
    noAccount: "¿No tienes una cuenta aún?",
    hasAccount: "¿Ya tienes una cuenta?",
    devLoginPrompt: "Modo Desarrollo: Acceso de prueba rápido",
  },
  en: {
    activeSession: "Active Session & Profile",
    connectedAs: "Logged in as",
    editProfile: "Edit Profile",
    closeEdit: "Close Edit",
    logout: "Log Out",
    editDetails: "Edit Profile Details",
    changePhoto: "Change Photo",
    jobTitle: "Role / Specialty",
    location: "Location",
    bio: "Biography",
    continueGoogle: "Continue with Google",
    orCustom: "or with your custom account",
    confirmPass: "Confirm Password *",
    devAvatar: "Developer Avatar",
    noAccount: "Don't have an account yet?",
    hasAccount: "Already have an account?",
    devLoginPrompt: "Dev Mode: Quick Test Login",
  },
  pt: {
    activeSession: "Sessão Ativa & Perfil",
    connectedAs: "Conectado como",
    editProfile: "Editar Perfil",
    closeEdit: "Fechar Edição",
    logout: "Sair",
    editDetails: "Editar Dados do Perfil",
    changePhoto: "Alterar Foto",
    jobTitle: "Cargo / Especialidade",
    location: "Localização",
    bio: "Biografia",
    continueGoogle: "Continuar com o Google",
    orCustom: "ou com a sua conta personalizada",
    confirmPass: "Confirmar Palavra-passe *",
    devAvatar: "Avatar de Programador",
    noAccount: "Ainda não tem conta?",
    hasAccount: "Já tem uma conta?",
    devLoginPrompt: "Modo Desenvolvedor: Acesso rápido",
  },
  fr: {
    activeSession: "Session Active & Profil",
    connectedAs: "Connecté en tant que",
    editProfile: "Modifier le Profil",
    closeEdit: "Fermer l'Édition",
    logout: "Déconnexion",
    editDetails: "Modifier les Détails du Profil",
    changePhoto: "Changer la Photo",
    jobTitle: "Poste / Spécialité",
    location: "Localisation",
    bio: "Biographie",
    continueGoogle: "Continuer avec Google",
    orCustom: "ou avec votre compte personnalisé",
    confirmPass: "Confirmer le Mot de Passe *",
    devAvatar: "Avatar de Développeur",
    noAccount: "Vous n'avez pas encore de compte ?",
    hasAccount: "Vous avez déjà un compte ?",
    devLoginPrompt: "Mode Dev: Accès Rapide",
  },
  de: {
    activeSession: "Aktive Sitzung & Profil",
    connectedAs: "Angemeldet als",
    editProfile: "Profil Bearbeiten",
    closeEdit: "Bearbeitung Schließen",
    logout: "Abmelden",
    editDetails: "Profildetails Bearbeiten",
    changePhoto: "Foto Ändern",
    jobTitle: "Position / Spezialisierung",
    location: "Standort",
    bio: "Biografie",
    continueGoogle: "Mit Google Fortfahren",
    orCustom: "oder mit Ihrem benutzerdefinierten Konto",
    confirmPass: "Passwort Bestätigen *",
    devAvatar: "Entwickler-Avatar",
    noAccount: "Noch kein Konto?",
    hasAccount: "Haben Sie bereits ein Konto?",
    devLoginPrompt: "Dev-Modus: Schnellzugriff",
  },
  ja: {
    activeSession: "アクティブセッション＆プロフィール",
    connectedAs: "ログイン中:",
    editProfile: "プロフィール編集",
    closeEdit: "編集を閉じる",
    logout: "ログアウト",
    editDetails: "プロフィール情報の編集",
    changePhoto: "写真を変更",
    jobTitle: "役職・専門分野",
    location: "居住地",
    bio: "自己紹介",
    continueGoogle: "Googleで続行",
    orCustom: "またはカスタムアカウントで",
    confirmPass: "パスワード確認 *",
    devAvatar: "開発者アバター",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "すでにアカウントをお持ちですか？",
    devLoginPrompt: "開発モード：クイックテスト",
  },
};
