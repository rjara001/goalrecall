import React, { useState, useEffect } from "react";
import { X, Compass } from "lucide-react";
import { UserProfile } from "../types";
import {
  INITIAL_USER,
  authenticateCustomAccount,
  registerCustomAccount,
} from "../utils/storage";
import { useI18n } from "../i18n";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  isFirebaseConfigured,
} from "../firebase";
import {
  describeAuthError,
  shouldUseRedirectFallback,
  isUserCancellation,
} from "../utils/authErrors";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";
import {
  AVATAR_PRESETS,
  AUTH_TEXTS,
  sanitizeUsernameHandle,
} from "./auth/authLocales";
import { AuthenticatedProfileView } from "./auth/AuthenticatedProfileView";
import { UnauthenticatedAuthView } from "./auth/UnauthenticatedAuthView";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (user: UserProfile) => void;
  onOpenAvatarModal?: () => void;
  onLoginDev?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenAvatarModal,
  onLoginDev,
}) => {
  const { t, language } = useI18n();
  const at = AUTH_TEXTS[language] || AUTH_TEXTS.en;

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupTitle, setSignupTitle] = useState("");
  const [signupAvatar, setSignupAvatar] = useState(AVATAR_PRESETS[0].url);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editUsername, setEditUsername] = useState(currentUser?.username || "");
  const [editTitle, setEditTitle] = useState(currentUser?.title || "");
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [editLocation, setEditLocation] = useState(currentUser?.location || "");

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditUsername(currentUser.username || "");
      setEditTitle(currentUser.title);
      setEditBio(currentUser.bio);
      setEditLocation(currentUser.location);
    }
  }, [currentUser]);

  useEffect(() => {
    setLoginError(null);
    setSignupError(null);
    setGoogleError(null);
  }, [authMode]);

  const signupUsernameStatus = useUsernameAvailability({
    enabled: authMode === "signup",
    username: signupUsername,
  });

  const editUsernameStatus = useUsernameAvailability({
    enabled: isEditingProfile,
    username: editUsername,
    currentUsername: currentUser?.username,
    userKey: currentUser?.email || currentUser?.id || "",
  });

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setGoogleError(null);
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      setGoogleError(t.auth.firebaseNotConfigured);
      return;
    }
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userHandle = sanitizeUsernameHandle(
        fbUser.email?.split("@")[0] ||
          fbUser.displayName ||
          fbUser.uid.substring(0, 8)
      );

      const googleUserProfile: UserProfile = {
        ...INITIAL_USER,
        id: "google-" + fbUser.uid,
        username:
          userHandle.length >= 3
            ? userHandle
            : `user_${fbUser.uid.substring(0, 6)}`,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuario",
        email: fbUser.email || "",
        avatar: fbUser.photoURL || INITIAL_USER.avatar,
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

      onLogin(googleUserProfile);
      onClose();
    } catch (err: any) {
      console.error("[AuthModal] Google Sign In error:", err);

      if (shouldUseRedirectFallback(err?.code || err?.message) && auth && googleProvider) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("[AuthModal] signInWithRedirect fallback also failed:", redirectErr);
        }
      }

      if (isUserCancellation(err?.code || err?.message)) {
        setGoogleError(t.auth.popupClosedByUser);
      } else {
        const errorInfo = describeAuthError(err);
        const localizedMsg =
          (t.auth as any)[errorInfo.key] || errorInfo.fallbackMessage;
        setGoogleError(localizedMsg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
      username: signupUsername ? sanitizeUsernameHandle(signupUsername) : undefined,
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const cleanUsername = sanitizeUsernameHandle(editUsername.trim());
    onUpdateProfile({
      ...currentUser,
      name: editName.trim() || currentUser.name,
      username: cleanUsername || currentUser.username,
      title: editTitle.trim() || currentUser.title,
      bio: editBio.trim() || currentUser.bio,
      location: editLocation.trim() || currentUser.location,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0D121F] border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {currentUser ? at.activeSession : t.auth.loginTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? `${at.connectedAs} ${currentUser.name}`
                  : t.auth.quickDemo}
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

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentUser ? (
            <AuthenticatedProfileView
              currentUser={currentUser}
              at={at}
              tAuthNameLabel={t.auth.nameLabel}
              tCommonCancel={t.common.cancel}
              tCommonSave={t.common.save}
              onOpenAvatarModal={onOpenAvatarModal}
              onLogoutAndClose={() => {
                onLogout();
                onClose();
              }}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              editName={editName}
              setEditName={setEditName}
              editUsername={editUsername}
              setEditUsername={setEditUsername}
              editUsernameStatus={editUsernameStatus}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editLocation={editLocation}
              setEditLocation={setEditLocation}
              editBio={editBio}
              setEditBio={setEditBio}
              onSaveProfile={handleSaveProfile}
            />
          ) : (
            <UnauthenticatedAuthView
              at={at}
              tAuth={t.auth}
              authMode={authMode}
              setAuthMode={setAuthMode}
              isGoogleLoading={isGoogleLoading}
              googleError={googleError}
              onGoogleLogin={handleGoogleLogin}
              onLoginDev={onLoginDev}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              showLoginPassword={showLoginPassword}
              setShowLoginPassword={setShowLoginPassword}
              loginError={loginError}
              onCustomLogin={handleCustomLogin}
              signupName={signupName}
              setSignupName={setSignupName}
              signupEmail={signupEmail}
              setSignupEmail={setSignupEmail}
              signupUsername={signupUsername}
              setSignupUsername={setSignupUsername}
              signupUsernameStatus={signupUsernameStatus}
              signupTitle={signupTitle}
              setSignupTitle={setSignupTitle}
              signupPassword={signupPassword}
              setSignupPassword={setSignupPassword}
              signupConfirmPassword={signupConfirmPassword}
              setSignupConfirmPassword={setSignupConfirmPassword}
              showSignupPassword={showSignupPassword}
              setShowSignupPassword={setShowSignupPassword}
              signupAvatar={signupAvatar}
              setSignupAvatar={setSignupAvatar}
              signupError={signupError}
              onCustomRegister={handleCustomRegister}
            />
          )}
        </div>
      </div>
    </div>
  );
};
