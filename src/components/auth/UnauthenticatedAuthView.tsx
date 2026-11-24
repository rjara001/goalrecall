import React from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { AuthLocaleText } from "./authLocales";

interface UnauthenticatedAuthViewProps {
  at: AuthLocaleText;
  tAuth: {
    loginTitle: string;
    signingIn: string;
  };
  isGoogleLoading: boolean;
  googleError: string | null;
  onGoogleLogin: () => void;
}

export const UnauthenticatedAuthView: React.FC<UnauthenticatedAuthViewProps> = ({
  at,
  tAuth,
  isGoogleLoading,
  googleError,
  onGoogleLogin,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Acceso Seguro con Google</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          GoalRecall sincroniza tu bitácora, CV, experiencias y vitrina de forma privada en tu cuenta. Para consultar o guardar tus cambios se requiere una cuenta de Google verificada.
        </p>
      </div>

      {googleError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{googleError}</span>
        </div>
      )}

      <button
        type="button"
        disabled={isGoogleLoading}
        onClick={onGoogleLogin}
        className="w-full py-3 px-4 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
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
            <span>{at.continueGoogle || tAuth.loginTitle}</span>
          </>
        )}
      </button>
    </div>
  );
};
