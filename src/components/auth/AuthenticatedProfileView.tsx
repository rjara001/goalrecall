import React from "react";
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  LogOut,
} from "lucide-react";
import { UserProfile } from "../../types";
import { AuthLocaleText, UsernameCheckStatus, sanitizeUsernameHandle } from "./authLocales";

interface AuthenticatedProfileViewProps {
  currentUser: UserProfile;
  at: AuthLocaleText;
  tAuthNameLabel: string;
  tCommonCancel: string;
  tCommonSave: string;
  onOpenAvatarModal?: () => void;
  onLogoutAndClose: () => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;
  editName: string;
  setEditName: (v: string) => void;
  editUsername: string;
  setEditUsername: (v: string) => void;
  editUsernameStatus: UsernameCheckStatus;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editLocation: string;
  setEditLocation: (v: string) => void;
  editBio: string;
  setEditBio: (v: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
}

export const AuthenticatedProfileView: React.FC<AuthenticatedProfileViewProps> = ({
  currentUser,
  at,
  tAuthNameLabel,
  tCommonCancel,
  tCommonSave,
  onOpenAvatarModal,
  onLogoutAndClose,
  isEditingProfile,
  setIsEditingProfile,
  editName,
  setEditName,
  editUsername,
  setEditUsername,
  editUsernameStatus,
  editTitle,
  setEditTitle,
  editLocation,
  setEditLocation,
  editBio,
  setEditBio,
  onSaveProfile,
}) => {
  return (
    <div className="space-y-5">
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
                title={at.changePhoto}
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
            <span>{isEditingProfile ? at.closeEdit : at.editProfile}</span>
          </button>

          <button
            onClick={onLogoutAndClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 font-semibold rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{at.logout}</span>
          </button>
        </div>
      </div>

      {isEditingProfile && (
        <form
          onSubmit={onSaveProfile}
          className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 animate-in fade-in text-xs"
        >
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
              {at.editDetails}
            </h5>
            {onOpenAvatarModal && (
              <button
                type="button"
                onClick={onOpenAvatarModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:text-white text-[11px] font-semibold transition-colors"
              >
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>{at.changePhoto}</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {tAuthNameLabel}
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>Usuario / Handle Público</span>
              <span className="text-[10px] font-mono text-cyan-400">
                /u/{editUsername || "usuario"}
              </span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-slate-950 border border-r-0 border-slate-700 rounded-l-xl text-slate-400 font-mono text-xs select-none">
                /u/
              </span>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(sanitizeUsernameHandle(e.target.value))}
                placeholder="rjara001"
                className={`w-full bg-[#080C14] border rounded-r-xl px-3 py-2 font-mono text-xs focus:outline-none transition-colors ${
                  editUsernameStatus.available === false
                    ? "border-red-500/80 text-red-300"
                    : editUsernameStatus.available === true
                    ? "border-emerald-500/80 text-emerald-300"
                    : "border-slate-700 text-cyan-300 focus:border-cyan-500"
                }`}
              />
            </div>
            {editUsernameStatus.available === false && (
              <div className="mt-1 space-y-1">
                <p className="text-[10px] text-red-400 font-semibold">
                  {editUsernameStatus.reason}
                </p>
                {editUsernameStatus.suggestions && (
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">Sugerencias:</span>
                    {editUsernameStatus.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditUsername(s)}
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
            <label className="block text-slate-300 font-medium mb-1">
              {at.jobTitle}
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {at.location}
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full bg-[#080C14] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">{at.bio}</label>
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
              {tCommonCancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-sm"
            >
              {tCommonSave}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
