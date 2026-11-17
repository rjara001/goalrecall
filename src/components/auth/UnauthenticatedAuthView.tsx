import React from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Briefcase,
  UserPlus,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  AVATAR_PRESETS,
  AuthLocaleText,
  UsernameCheckStatus,
  sanitizeUsernameHandle,
} from "./authLocales";

interface UnauthenticatedAuthViewProps {
  at: AuthLocaleText;
  tAuth: {
    loginTitle: string;
    registerTitle: string;
    signingIn: string;
    emailLabel: string;
    passwordLabel: string;
    submitLogin: string;
    switchRegister: string;
    nameLabel: string;
    submitRegister: string;
    switchLogin: string;
  };
  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;
  isGoogleLoading: boolean;
  googleError: string | null;
  onGoogleLogin: () => void;
  onLoginDev?: () => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (v: boolean) => void;
  loginError: string | null;
  onCustomLogin: (e: React.FormEvent) => void;
  signupName: string;
  setSignupName: (v: string) => void;
  signupEmail: string;
  setSignupEmail: (v: string) => void;
  signupUsername: string;
  setSignupUsername: (v: string) => void;
  signupUsernameStatus: UsernameCheckStatus;
  signupTitle: string;
  setSignupTitle: (v: string) => void;
  signupPassword: string;
  setSignupPassword: (v: string) => void;
  signupConfirmPassword: string;
  setSignupConfirmPassword: (v: string) => void;
  showSignupPassword: boolean;
  setShowSignupPassword: (v: boolean) => void;
  signupAvatar: string;
  setSignupAvatar: (url: string) => void;
  signupError: string | null;
  onCustomRegister: (e: React.FormEvent) => void;
}

export const UnauthenticatedAuthView: React.FC<UnauthenticatedAuthViewProps> = ({
  at,
  tAuth,
  authMode,
  setAuthMode,
  isGoogleLoading,
  googleError,
  onGoogleLogin,
  onLoginDev,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  loginError,
  onCustomLogin,
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupUsername,
  setSignupUsername,
  signupUsernameStatus,
  signupTitle,
  setSignupTitle,
  signupPassword,
  setSignupPassword,
  signupConfirmPassword,
  setSignupConfirmPassword,
  showSignupPassword,
  setShowSignupPassword,
  signupAvatar,
  setSignupAvatar,
  signupError,
  onCustomRegister,
}) => {
  return (
    <div className="space-y-4">
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
          <span>{tAuth.loginTitle}</span>
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
          <span>{tAuth.registerTitle}</span>
        </button>
      </div>

      {authMode === "login" && (
        <div className="space-y-2.5">
          {googleError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{googleError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={onGoogleLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>{tAuth.signingIn}</span>
              </>
            ) : (
              <>
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
                <span>{at.continueGoogle}</span>
              </>
            )}
          </button>

          {onLoginDev && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={onLoginDev}
                className="w-full py-1.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] rounded-lg border border-slate-800 border-dashed transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{at.devLoginPrompt}</span>
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              {at.orCustom}
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>
        </div>
      )}

      {authMode === "login" && (
        <form onSubmit={onCustomLogin} className="space-y-3.5 text-xs">
          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tAuth.emailLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">
                {tAuth.passwordLabel}
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
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{tAuth.submitLogin}</span>
          </button>

          <div className="text-center pt-1 text-[11px] text-slate-400">
            {at.noAccount}{" "}
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className="text-cyan-400 hover:underline font-semibold"
            >
              {tAuth.switchRegister}
            </button>
          </div>
        </form>
      )}

      {authMode === "signup" && (
        <form onSubmit={onCustomRegister} className="space-y-3.5 text-xs">
          {signupError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tAuth.nameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {tAuth.emailLabel}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
              <span>Usuario / Handle Público</span>
              <span className="text-[10px] font-mono text-cyan-400">
                /u/{signupUsername || "usuario"}
              </span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-[#080C14] border border-r-0 border-slate-700 rounded-l-xl text-slate-400 font-mono text-xs select-none">
                /u/
              </span>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(sanitizeUsernameHandle(e.target.value))}
                placeholder="alexmorgan"
                className={`w-full bg-[#080C14] border rounded-r-xl px-3 py-2 font-mono text-xs focus:outline-none transition-colors placeholder-slate-600 ${
                  signupUsernameStatus.available === false
                    ? "border-red-500/80 text-red-300"
                    : signupUsernameStatus.available === true && signupUsername.length >= 3
                    ? "border-emerald-500/80 text-emerald-300"
                    : "border-slate-700 text-cyan-300 focus:border-cyan-500"
                }`}
              />
            </div>
            {signupUsernameStatus.available === false && (
              <div className="mt-1 space-y-1">
                <p className="text-[10px] text-red-400 font-semibold">
                  {signupUsernameStatus.reason}
                </p>
                {signupUsernameStatus.suggestions && (
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">Sugerencias:</span>
                    {signupUsernameStatus.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSignupUsername(s)}
                        className="text-[10px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {at.jobTitle}
            </label>
            <div className="relative">
              <input
                type="text"
                value={signupTitle}
                onChange={(e) => setSignupTitle(e.target.value)}
                placeholder="Staff Systems Architect"
                className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
              />
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {tAuth.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
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
                {at.confirmPass}
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080C14] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {at.devAvatar}
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
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all shadow-sm shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{tAuth.submitRegister}</span>
          </button>

          <div className="text-center pt-1 text-[11px] text-slate-400">
            {at.hasAccount}{" "}
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="text-cyan-400 hover:underline font-semibold"
            >
              {tAuth.switchLogin}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
