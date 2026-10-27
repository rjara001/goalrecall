import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogOut,
  Check,
  ShieldCheck,
  Briefcase,
  Compass,
  ArrowRight,
  UserPlus,
  LogIn,
  Key,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Camera,
} from "lucide-react";
import { UserProfile } from "../types";
import {
  INITIAL_USER,
  authenticateCustomAccount,
  registerCustomAccount,
} from "../utils/storage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onOpenAvatarModal?: () => void;
}

// Decode standard Google Identity Services JWT payload safely
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding Google JWT token", e);
    return null;
  }
}

const AVATAR_PRESETS = [
  { label: "Architect", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
  { label: "Dev Leader", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  { label: "Systems Pro", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
  { label: "Platform Engineer", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  // Modal tabs: "login" (custom or google) vs "signup" (custom register)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Custom Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Custom Register Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupTitle, setSignupTitle] = useState("");
  const [signupAvatar, setSignupAvatar] = useState(AVATAR_PRESETS[0].url);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Edit profile state (when logged in)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editTitle, setEditTitle] = useState(currentUser?.title || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [editLocation, setEditLocation] = useState(currentUser?.location || "");

  // Google OAuth / GIS Configuration state
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem("goal_recall_google_client_id") || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";
  });
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [tempClientId, setTempClientId] = useState(googleClientId);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Sync edit profile form when current user changes
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditTitle(currentUser.title);
      setEditBio(currentUser.bio);
      setEditLocation(currentUser.location);
    }
  }, [currentUser]);

  // Reset errors when switching tab
  useEffect(() => {
    setLoginError(null);
    setSignupError(null);
  }, [authMode]);

  // Initialize Google Identity Services when Client ID is available and unauthenticated
  useEffect(() => {
    if (!isOpen || currentUser || !googleClientId) return;

    let intervalId: any;
    let attempts = 0;

    const initGsi = () => {
      attempts++;
      const win = window as any;
      if (win.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          win.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response?.credential) {
                const decoded = parseJwt(response.credential);
                if (decoded) {
                  const googleUser: UserProfile = {
                    ...INITIAL_USER,
                    id: "google-" + decoded.sub,
                    name: decoded.name || decoded.email.split("@")[0],
                    email: decoded.email,
                    avatar: decoded.picture || INITIAL_USER.avatar,
                    title: "",
                    bio: "",
                    location: "",
                    github: "",
                    linkedin: "",
                    skills: [],
                    authProvider: "google",
                    isCustom: false,
                    createdAt: Date.now(),
                  };
                  onLogin(googleUser);
                  onClose();
                }
              }
            },
          });

          // Render official Google button
          googleBtnContainerRef.current.innerHTML = "";
          win.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            text: "signin_with",
            width: 320,
          });

          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.warn("Could not initialize Google Identity Services:", err);
        }
      } else if (attempts > 30) {
        if (intervalId) clearInterval(intervalId);
      }
    };

    initGsi();
    intervalId = setInterval(initGsi, 250);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, googleClientId, currentUser]);

  if (!isOpen) return null;

  // --- Handlers ---

  // 1. One-Click Google Login
  const handleInstantGoogleLogin = () => {
    const googleUser: UserProfile = {
      ...INITIAL_USER,
      id: "google-usr-" + Date.now(),
      name: "Rodrigo Jara",
      email: "rjara001@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: "",
      bio: "",
      location: "",
      github: "",
      linkedin: "",
      skills: [],
      authProvider: "google",
      isCustom: false,
      createdAt: Date.now(),
    };
    onLogin(googleUser);
    onClose();
  };

  // 2. Custom Login (Email/Username + Password)
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const result = authenticateCustomAccount(loginEmail, loginPassword);
    if (!result.success || !result.user) {
      setLoginError(result.error || "Error al autenticar credenciales.");
      return;
    }

    onLogin(result.user);
    onClose();
  };

  // 3. Custom Signup (Create new account with password)
  const handleCustomRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const result = registerCustomAccount({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      title: signupTitle || "Senior Software Engineer",
      avatar: signupAvatar,
    });

    if (!result.success || !result.user) {
      setSignupError(result.error || "No se pudo registrar la cuenta.");
      return;
    }

    onLogin(result.user);
    onClose();
  };

  // 4. Update Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      title: editTitle.trim() || currentUser.title,
      bio: editBio.trim() || currentUser.bio,
      location: editLocation.trim() || currentUser.location,
    };
    onUpdateProfile(updated);
    setIsEditingProfile(false);
  };

  // 5. Save Google Client ID
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = tempClientId.trim();
    setGoogleClientId(cleanId);
    if (cleanId) {
      localStorage.setItem("goal_recall_google_client_id", cleanId);
    } else {
      localStorage.removeItem("goal_recall_google_client_id");
    }
    setShowConfigClientId(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0D121F] border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUser ? "Sesión Activa & Perfil" : "Acceso a la Bitácora"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? `Conectado como ${currentUser.name}`
                  : "Google Login y Custom Login con correo/contraseña"}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentUser ? (
            /* --- STATE: LOGGED IN --- */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="relative group shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/40 bg-slate-800"
                    />
                    {onOpenAvatarModal && (
                      <button
                        type="button"
                        onClick={onOpenAvatarModal}
                        title="Cambiar foto de perfil"
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md transition-all active:scale-95 group-hover:scale-110"
                      >
                        <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white truncate">
                        {currentUser.name}
                      </h4>
                      {currentUser.authProvider === "google" ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Google Login</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Custom Login</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-cyan-300 font-medium truncate mt-0.5">
                      {currentUser.title}
                    </p>

                    <p className="text-xs text-slate-400 font-mono mt-1 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                {currentUser.bio && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    {currentUser.bio}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isEditingProfile ? "Cerrar Edición" : "Editar Perfil"}</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 font-semibold rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Form */}
              {isEditingProfile && (
                <form
                  onSubmit={handleSaveProfile}
                  className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                      Editar Datos del Perfil
                    </h5>
                    {onOpenAvatarModal && (
                      <button
                        type="button"
                        onClick={onOpenAvatarModal}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white text-[11px] font-semibold transition-colors"
                      >
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span>Cambiar Foto</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cargo / Especialidad</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Biografía</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-sm"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* --- STATE: UNAUTHENTICATED (LOGIN / SIGNUP) --- */
            <div className="space-y-4">
              {/* Tab Selector: Iniciar Sesión vs Crear Cuenta */}
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "login"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión (Custom / Google)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "signup"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta Custom</span>
                </button>
              </div>

              {/* SECCIÓN 1: GOOGLE LOGIN (Solo en Iniciar Sesión) */}
              {authMode === "login" && (
                <div className="space-y-2.5">
                  {/* Official Google Identity Services Container (if client ID is configured) */}
                  {googleClientId && (
                    <div className="flex justify-center py-1">
                      <div ref={googleBtnContainerRef} className="min-h-[44px]" />
                    </div>
                  )}

                  {/* One-Click Google Login Button */}
                  <button
                    onClick={handleInstantGoogleLogin}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 border border-slate-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google (rjara001@gmail.com)</span>
                  </button>

                  {/* Google Client ID Settings accordion */}
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setShowConfigClientId(!showConfigClientId)}
                      className="w-full text-left text-[11px] font-medium text-slate-400 hover:text-cyan-400 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-cyan-400" />
                        <span>Configuración Google Client ID {googleClientId ? "✓" : ""}</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {showConfigClientId ? "Ocultar ▲" : "Configurar ▼"}
                      </span>
                    </button>

                    {showConfigClientId && (
                      <form onSubmit={handleSaveClientId} className="pt-2 mt-2 border-t border-slate-800 space-y-2 text-xs">
                        <input
                          type="text"
                          value={tempClientId}
                          onChange={(e) => setTempClientId(e.target.value)}
                          placeholder="Pega Client ID de Google Cloud..."
                          className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-[11px] hover:bg-cyan-400"
                        >
                          Guardar Client ID
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                      o con tu cuenta custom
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: CUSTOM LOGIN FORM */}
              {authMode === "login" && (
                <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Correo Electrónico o Usuario *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="ej. rjara001@gmail.com o rodrigo"
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">
                        Contraseña *
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar a mi Bitácora (Custom Login)</span>
                  </button>

                  <div className="text-center pt-1 text-[11px] text-slate-400">
                    ¿No tienes una cuenta aún?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Crear cuenta custom
                    </button>
                  </div>
                </form>
              )}

              {/* SECCIÓN 3: CUSTOM SIGNUP FORM */}
              {authMode === "signup" && (
                <form onSubmit={handleCustomRegister} className="space-y-3.5 text-xs">
                  {signupError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="ej. Rodrigo Jara"
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="ej. rjara001@gmail.com"
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Cargo / Especialidad Técnica
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signupTitle}
                        onChange={(e) => setSignupTitle(e.target.value)}
                        placeholder="ej. Staff Systems Architect"
                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                      />
                      <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        >
                          {showSignupPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                          className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Avatar de Desarrollador
                    </label>
                    <div className="flex items-center gap-2.5">
                      {AVATAR_PRESETS.map((preset, idx) => {
                        const isSelected = signupAvatar === preset.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSignupAvatar(preset.url)}
                            className={`relative rounded-xl overflow-hidden w-10 h-10 border-2 transition-all ${
                              isSelected
                                ? "border-cyan-400 ring-2 ring-cyan-500/40 scale-105"
                                : "border-slate-700 opacity-60 hover:opacity-100"
                            }`}
                            title={preset.label}
                          >
                            <img
                              src={preset.url}
                              alt=""
                              aria-hidden="true"
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-cyan-900/50 flex items-center justify-center text-cyan-300">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrar Cuenta Custom & Iniciar Sesión</span>
                  </button>

                  <div className="text-center pt-1 text-[11px] text-slate-400">
                    ¿Ya tienes una cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
