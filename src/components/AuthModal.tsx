import React, { useState } from "react";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  LogOut, 
  Check, 
  ShieldCheck, 
  Briefcase,
  Compass
} from "lucide-react";
import { UserProfile } from "../types";
import { INITIAL_USER } from "../utils/storage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit Profile fields
  const [name, setName] = useState(currentUser?.name || "");
  const [title, setTitle] = useState(currentUser?.title || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [location, setLocation] = useState(currentUser?.location || "");

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // Instant Google Auth simulation with demo profile
    onLogin(INITIAL_USER);
    onClose();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const customUser: UserProfile = {
      ...INITIAL_USER,
      id: "user-" + Date.now(),
      email,
      name: email.split("@")[0].replace(".", " "),
      isDemoUser: false,
    };
    onLogin(customUser);
    onClose();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      title: title.trim() || currentUser.title,
      bio: bio.trim() || currentUser.bio,
      location: location.trim() || currentUser.location,
    };
    onUpdateProfile(updated);
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUser ? "Perfil del Capitán" : "Identificación & Sesión"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Sincronización local y control de identidad
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-cyan-500/40"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{currentUser.name}</h4>
                  <p className="text-xs text-cyan-400 truncate">{currentUser.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                </div>
              </div>

              {!isEditingProfile ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-mono block">Biografía pública:</span>
                    <p className="text-slate-300 leading-relaxed text-xs">{currentUser.bio}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setName(currentUser.name);
                        setTitle(currentUser.title);
                        setBio(currentUser.bio);
                        setLocation(currentUser.location);
                        setIsEditingProfile(true);
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Editar Perfil
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="px-3 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Título Técnico</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Biografía</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-cyan-400"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Inicia sesión para que tus registros viajen contigo de forma segura sin depender de pendrives o nubes corporativas.
              </p>

              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md"
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
                <span>Entrar con Google (Acceso con 1 Clic)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-mono">o con correo</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. capitan@ingenieria.dev"
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all"
                >
                  Entrar a Captain's Log
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
