import { CustomAccount, UserProfile } from "../../types";
import { RESERVED_USERNAMES } from "./keys";
import { workspaceState } from "./workspaceState";

export const sanitizeUsername = (raw: string): string => {
  return raw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
};

export const checkLocalUsernameAvailability = (
  username: string,
  _currentUserId?: string
): { available: boolean; reason?: string; suggestions?: string[] } => {
  const clean = sanitizeUsername(username);
  if (!clean || clean.length < 3) {
    return { available: false, reason: "Mínimo 3 caracteres alfanuméricos." };
  }
  if (clean.length > 30) {
    return { available: false, reason: "Máximo 30 caracteres permitidos." };
  }
  if (RESERVED_USERNAMES.has(clean)) {
    return {
      available: false,
      reason: "Palabra reservada del sistema.",
      suggestions: [`${clean}001`, `${clean}_pro`, `${clean}_dev`],
    };
  }
  return { available: true };
};

export const generateDefaultUsername = (name: string, email?: string): string => {
  let candidate = "";
  if (email && email.includes("@")) {
    candidate = sanitizeUsername(email.split("@")[0]);
  }
  if (!candidate || candidate.length < 3 || RESERVED_USERNAMES.has(candidate)) {
    candidate = sanitizeUsername(name);
  }
  if (!candidate || candidate.length < 3 || RESERVED_USERNAMES.has(candidate)) {
    candidate = `user_${Math.random().toString(36).substring(2, 7)}`;
  }
  return candidate;
};

export const getStoredUser = (): UserProfile | null => {
  return workspaceState.user;
};

export const saveUser = (user: UserProfile | null): void => {
  workspaceState.user = user;
};

export const getStoredCustomAccounts = (): CustomAccount[] => {
  return workspaceState.customAccounts;
};
