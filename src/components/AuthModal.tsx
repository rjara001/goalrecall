import React, { useState, useEffect } from "react";
import { X, Compass } from "lucide-react";
import { User as FirebaseAuthUser } from "firebase/auth";
import { UserProfile } from "../types";
import { useI18n } from "../i18n";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  isFirebaseConfigured,
} from "../firebase";
import {
  describeAuthError,
  shouldUseRedirectFallback,
  isUserCancellation,
} from "../utils/authErrors";
import { formatFirestoreUiError } from "../utils/firestore/errors";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";
import { AUTH_TEXTS, sanitizeUsernameHandle } from "./auth/authLocales";
import { AuthenticatedProfileView } from "./auth/AuthenticatedProfileView";
import { UnauthenticatedAuthView } from "./auth/UnauthenticatedAuthView";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (fbUser: FirebaseAuthUser) => Promise<void>;
  onLogout: () => Promise<void> | void;
  onUpdateProfile: (user: UserProfile) => Promise<void>;
  onOpenAvatarModal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onOpenAvatarModal,
}) => {
  const { t, language } = useI18n();
  const at = AUTH_TEXTS[language] || AUTH_TEXTS.en;

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
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
    if (isOpen) {
      setGoogleError(null);
      setProfileSaveError(null);
    }
  }, [isOpen]);

  const editUsernameStatus = useUsernameAvailability({
    enabled: isEditingProfile,
    username: editUsername,
    currentUsername: currentUser?.username,
    userKey: currentUser?.id || "",
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

      if (!fbUser.emailVerified) {
        await signOut(auth).catch(() => undefined);
        setGoogleError(
          "Tu cuenta de Google debe tener el correo electrónico verificado para iniciar sesión."
        );
        return;
      }

      await onLogin(fbUser);
      onClose();
    } catch (err: unknown) {
      console.error("[AuthModal] Google Sign In error:", err);

      const errObj = err as { code?: string; message?: string };
      if (
        shouldUseRedirectFallback(errObj?.code || errObj?.message) &&
        auth &&
        googleProvider
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error(
            "[AuthModal] signInWithRedirect fallback also failed:",
            redirectErr
          );
        }
      }

      if (isUserCancellation(errObj?.code || errObj?.message)) {
        setGoogleError(t.auth.popupClosedByUser);
      } else {
        const errorInfo = describeAuthError(err);
        const authStrings = t.auth as unknown as Record<string, string>;
        const localizedMsg =
          authStrings[errorInfo.key] ||
          formatFirestoreUiError(err, errorInfo.fallbackMessage);
        setGoogleError(localizedMsg);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSavingProfile) return;
    if (editUsernameStatus.available === false) {
      setProfileSaveError(editUsernameStatus.reason || "El handle /u/ no está disponible.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);

    try {
      const cleanUsername = sanitizeUsernameHandle(editUsername.trim());
      await onUpdateProfile({
        ...currentUser,
        name: editName.trim() || currentUser.name,
        username: cleanUsername || currentUser.username,
        title: editTitle.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
      });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileSaveError(
        formatFirestoreUiError(err, "No se pudo actualizar tu perfil.")
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] isolate flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
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
                  : "Acceso privado y sincronización automática con tu cuenta de Google"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isGoogleLoading || isSavingProfile}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
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
                void Promise.resolve(onLogout()).finally(() => onClose());
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
              isSavingProfile={isSavingProfile}
              profileSaveError={profileSaveError}
              onSaveProfile={handleSaveProfile}
            />
          ) : (
            <UnauthenticatedAuthView
              at={at}
              tAuth={t.auth}
              isGoogleLoading={isGoogleLoading}
              googleError={googleError}
              onGoogleLogin={handleGoogleLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};
