import { CustomAccount, UserProfile } from "../../types";
import {
  DEFAULT_USERS,
  INITIAL_USER,
  RESERVED_USERNAMES,
  STORAGE_KEYS,
} from "./keys";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const sanitizeUsername = (raw: string): string => {
  return raw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
};

export const getStoredCustomAccounts = (): CustomAccount[] => {
  return workspaceState.customAccounts;
};

export const saveStoredCustomAccounts = (accounts: CustomAccount[]): void => {
  workspaceState.customAccounts = accounts;
};

export const checkLocalUsernameAvailability = (
  username: string,
  currentUserId?: string
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

  const accounts = getStoredCustomAccounts();
  const taken = accounts.find(
    (acc) =>
      acc.username?.toLowerCase() === clean && (!currentUserId || acc.id !== currentUserId)
  );

  if (taken) {
    return {
      available: false,
      reason: "Este nombre de usuario ya está tomado.",
      suggestions: [`${clean}001`, `${clean}01`, `${clean}_pro`],
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

  const accounts = getStoredCustomAccounts();
  let finalCandidate = candidate;
  let counter = 1;
  while (
    RESERVED_USERNAMES.has(finalCandidate) ||
    accounts.some((a) => a.username?.toLowerCase() === finalCandidate)
  ) {
    finalCandidate = `${candidate}${counter.toString().padStart(3, "0")}`;
    counter++;
  }

  return finalCandidate;
};

export const hashPassword = (pwd: string): string => {
  return btoa(encodeURIComponent("goal_recall_salt_" + pwd.trim()));
};

export const getStoredUser = (): UserProfile | null => {
  const user = workspaceState.user;
  if (user && !user.username && (user.name || user.email)) {
    user.username = generateDefaultUsername(user.name || "user", user.email);
  }
  return user;
};

export const saveUser = (user: UserProfile | null): void => {
  workspaceState.user = user;
  notifyCloudSync();
};

export const registerCustomAccount = (params: {
  name: string;
  email: string;
  password: string;
  username?: string;
  title?: string;
  avatar?: string;
}): { success: boolean; user?: UserProfile; error?: string } => {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanPwd = params.password.trim();

  if (!cleanName) return { success: false, error: "Ingresa tu nombre completo." };
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Ingresa un correo electrónico válido." };
  }
  if (!cleanPwd || cleanPwd.length < 4) {
    return { success: false, error: "La contraseña debe tener al menos 4 caracteres." };
  }

  const existingAccounts = getStoredCustomAccounts();
  if (existingAccounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      error: "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.",
    };
  }

  const username = params.username
    ? sanitizeUsername(params.username)
    : generateDefaultUsername(cleanName, cleanEmail);

  const availability = checkLocalUsernameAvailability(username);
  if (!availability.available) {
    return { success: false, error: `Nombre de usuario no disponible: ${availability.reason}` };
  }

  const newAccount: CustomAccount = {
    id: "usr-" + Date.now(),
    username,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(cleanPwd),
    title: params.title?.trim() || "",
    avatar:
      params.avatar ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "",
    location: "",
    github: "",
    linkedin: "",
    skills: [],
    createdAt: Date.now(),
  };

  saveStoredCustomAccounts([newAccount, ...existingAccounts]);

  const userProfile: UserProfile = {
    id: newAccount.id,
    username: newAccount.username,
    name: newAccount.name,
    email: newAccount.email,
    avatar: newAccount.avatar,
    title: newAccount.title,
    bio: newAccount.bio || "",
    location: newAccount.location || "Remoto",
    github: newAccount.github,
    linkedin: newAccount.linkedin,
    skills: newAccount.skills || [],
    authProvider: "custom",
    isCustom: true,
    createdAt: newAccount.createdAt,
  };

  saveUser(userProfile);
  return { success: true, user: userProfile };
};

export const authenticateCustomAccount = (
  emailOrUsername: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } => {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPwd = password.trim();

  if (!cleanInput) return { success: false, error: "Ingresa tu correo o nombre de usuario." };
  if (!cleanPwd) return { success: false, error: "Ingresa tu contraseña." };

  const target = getStoredCustomAccounts().find(
    (acc) => acc.email.toLowerCase() === cleanInput || acc.name.toLowerCase() === cleanInput
  );

  if (!target) {
    return {
      success: false,
      error: "Usuario o correo no encontrado. Revisa tus datos o crea una cuenta.",
    };
  }

  if (target.passwordHash !== hashPassword(cleanPwd)) {
    return {
      success: false,
      error: "Contraseña incorrecta. Por favor verifica tus credenciales.",
    };
  }

  const userProfile: UserProfile = {
    id: target.id,
    username: target.username || generateDefaultUsername(target.name, target.email),
    name: target.name,
    email: target.email,
    avatar: target.avatar,
    title: target.title,
    bio: target.bio || "",
    location: target.location || "Remoto",
    github: target.github,
    linkedin: target.linkedin,
    skills: target.skills || [],
    authProvider: "custom",
    isCustom: true,
    createdAt: target.createdAt,
  };

  saveUser(userProfile);
  return { success: true, user: userProfile };
};

export const getStoredUsersList = (): UserProfile[] => {
  const accounts = getStoredCustomAccounts();
  if (accounts.length > 0) {
    return accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      email: acc.email,
      avatar: acc.avatar,
      title: acc.title,
      bio: acc.bio || "",
      location: acc.location || "Remoto",
      github: acc.github,
      linkedin: acc.linkedin,
      skills: acc.skills || [],
      authProvider: "custom",
      isCustom: true,
      createdAt: acc.createdAt,
    }));
  }
  return DEFAULT_USERS;
};

export const saveUsersList = (_users: UserProfile[]): void => {
  // Maintained for backward compatibility
};

export const addCustomUser = (newUser: UserProfile): UserProfile[] => {
  saveUser(newUser);
  return getStoredUsersList();
};

export const updateCustomUser = (updatedUser: UserProfile): UserProfile[] => {
  saveUser(updatedUser);
  return getStoredUsersList();
};

export const deleteCustomUser = (
  _userId: string
): { updatedList: UserProfile[]; newActiveUser: UserProfile } => {
  const list = getStoredUsersList();
  return { updatedList: list, newActiveUser: list[0] || INITIAL_USER };
};

export const updateUserAvatar = (newAvatarUrl: string): UserProfile | null => {
  const current = getStoredUser();
  if (!current) return null;

  const updated: UserProfile = { ...current, avatar: newAvatarUrl };
  saveUser(updated);

  try {
    const rawAccounts =
      typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOUNTS) : null;
    if (rawAccounts) {
      const accounts: CustomAccount[] = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const idx = accounts.findIndex(
          (acc) =>
            acc.id === current.id ||
            (current.email && acc.email.toLowerCase() === current.email.toLowerCase())
        );
        if (idx !== -1) {
          accounts[idx] = { ...accounts[idx], avatar: newAvatarUrl };
          saveStoredCustomAccounts(accounts);
        }
      }
    }
  } catch (err) {
    console.warn("Error updating avatar in custom accounts:", err);
  }

  return updated;
};
