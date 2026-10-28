import { 
  LogEntry, 
  UserProfile, 
  VisitorMessage, 
  CustomAccount, 
  ExtractedCvData, 
  WorkExperience, 
  AiUsageRecord,
  JobOffer
} from "../types";

const STORAGE_KEYS = {
  LOGS: "captains_logs_v1",
  USER: "captains_user_v1",
  CUSTOM_ACCOUNTS: "goal_recall_custom_accounts_v1",
  INBOX: "captains_inbox_v1",
  PIN: "captains_pin_v1",
  CV_DATA: "captains_stored_cv_v1",
  EXPERIENCES: "captains_experiences_v1",
  AI_USAGE: "goal_recall_ai_usage_v1",
  JOB_OFFERS: "goal_recall_job_offers_v1",
};

export const INITIAL_EXPERIENCES: WorkExperience[] = [];

export const DEFAULT_USERS: UserProfile[] = [];

export const INITIAL_USER: UserProfile = {
  id: "usr-guest",
  name: "Usuario",
  email: "",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  title: "",
  bio: "",
  location: "",
  github: "",
  linkedin: "",
  skills: [],
  authProvider: "custom",
  isDemoUser: false,
  isCustom: true,
  createdAt: Date.now(),
};

export const INITIAL_LOGS: LogEntry[] = [];

export const DUMMY_LOG_IDS = new Set([
  "log-001",
  "log-002",
  "log-003",
  "log-004",
  "log-005",
  "log-006",
  "log-007",
]);

export const DUMMY_EXP_IDS = new Set([
  "exp-meli",
  "exp-stripe",
  "exp-clientx",
  "exp-core",
]);

export const purgeDummyPresetData = (): void => {
  try {
    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (rawLogs) {
      const parsedLogs: LogEntry[] = JSON.parse(rawLogs);
      if (Array.isArray(parsedLogs)) {
        const cleanLogs = parsedLogs.filter(
          (l) =>
            !DUMMY_LOG_IDS.has(l.id) &&
            l.client !== "ClientX" &&
            !l.title?.includes("Migrated checkout payment flow") &&
            !l.title?.includes("inventory decrement during flash sales") &&
            !l.title?.includes("settlement microservices") &&
            !l.title?.includes("anomaly detection pipeline") &&
            !l.title?.includes("zero-downtime hot reload") &&
            !l.title?.includes("monolithic controller") &&
            !l.title?.includes("local LLMs")
        );
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(cleanLogs));
      }
    }

    const rawExp = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
    if (rawExp) {
      const parsedExp: WorkExperience[] = JSON.parse(rawExp);
      if (Array.isArray(parsedExp)) {
        const cleanExp = parsedExp.filter(
          (e) =>
            !DUMMY_EXP_IDS.has(e.id) &&
            !e.company?.includes("Mercado Libre") &&
            !e.company?.includes("Stripe Platform") &&
            !e.company?.includes("ClientX") &&
            !e.company?.includes("Internal Core")
        );
        localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(cleanExp));
      }
    }

    const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user) {
        let changed = false;
        if (user.bio?.includes("12+ years architecting") || user.bio?.includes("Ingeniero de software enfocado")) {
          user.bio = "";
          changed = true;
        }
        if (user.github === "https://github.com") {
          user.github = "";
          changed = true;
        }
        if (user.linkedin === "https://linkedin.com") {
          user.linkedin = "";
          changed = true;
        }
        if (user.skills && user.skills.some((s: any) => s.name === "TypeScript / Node.js" || s.name === "Distributed Systems Architecture")) {
          user.skills = [];
          changed = true;
        }
        if (user.title === "Senior Full-Stack & Systems Architect" && user.name === "Rodrigo Jara") {
          user.title = "";
          changed = true;
        }
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
      }
    }

    const rawAccounts = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOUNTS);
    if (rawAccounts) {
      const accounts: CustomAccount[] = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const cleanedAccounts = accounts.map((acc) => {
          const isDummyBio = acc.bio?.includes("12+ years") || acc.bio?.includes("Ingeniero de software enfocado");
          return {
            ...acc,
            bio: isDummyBio ? "" : (acc.bio || ""),
            title: acc.title === "Senior Full-Stack & Systems Architect" ? "" : (acc.title || ""),
            github: acc.github === "https://github.com" ? "" : (acc.github || ""),
            linkedin: acc.linkedin === "https://linkedin.com" ? "" : (acc.linkedin || ""),
            skills: acc.skills?.filter((s: any) => s.name !== "TypeScript / Node.js" && s.name !== "Distributed Systems Architecture") || [],
          };
        });
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ACCOUNTS, JSON.stringify(cleanedAccounts));
      }
    }
  } catch (err) {
    console.warn("Purge dummy preset data check error:", err);
  }
};

// Execute purge on module load
purgeDummyPresetData();

export const INITIAL_INBOX: VisitorMessage[] = [];

// --- Work Experiences Utilities ---

export const getStoredExperiences = (_userId?: string): WorkExperience[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
    if (!raw) {
      return [];
    }
    const parsed: WorkExperience[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (e) =>
        !DUMMY_EXP_IDS.has(e.id) &&
        !e.company?.includes("Mercado Libre") &&
        !e.company?.includes("Stripe Platform") &&
        !e.company?.includes("ClientX") &&
        !e.company?.includes("Internal Core")
    );
  } catch (e) {
    console.error("Error reading experiences from localStorage", e);
    return [];
  }
};

export const saveExperiences = (experiences: WorkExperience[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiences));
    triggerCloudSync();
  } catch (e) {
    console.error("Error saving experiences to localStorage", e);
  }
};

export const addExperience = (
  exp: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
): WorkExperience => {
  const experiences = getStoredExperiences();
  const newExp: WorkExperience = {
    ...exp,
    id: "exp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const updated = [newExp, ...experiences];
  saveExperiences(updated);
  return newExp;
};

export const updateExperience = (updatedExp: WorkExperience): void => {
  const experiences = getStoredExperiences();
  const index = experiences.findIndex((e) => e.id === updatedExp.id);
  if (index !== -1) {
    const oldCompany = experiences[index].company;
    experiences[index] = { ...updatedExp, updatedAt: Date.now() };
    saveExperiences(experiences);

    // If company name changed, update the client field of all linked logs
    if (oldCompany !== updatedExp.company) {
      const logs = getStoredLogs();
      let hasChanges = false;
      const updatedLogs = logs.map((l) => {
        if (l.experienceId === updatedExp.id) {
          hasChanges = true;
          return { ...l, client: updatedExp.company, updatedAt: Date.now() };
        }
        return l;
      });
      if (hasChanges) {
        saveLogs(updatedLogs);
      }
    }
  }
};

export const deleteExperience = (id: string): void => {
  const experiences = getStoredExperiences();
  // Don't allow deleting the default personal projects container
  const filtered = experiences.filter((e) => e.id !== id);
  saveExperiences(filtered);

  // Re-link any orphaned logs to personal projects
  const personal = experiences.find((e) => e.isPersonalProjects) || experiences[0];
  if (personal) {
    const logs = getStoredLogs();
    let hasChanges = false;
    const updatedLogs = logs.map((l) => {
      if (l.experienceId === id) {
        hasChanges = true;
        return {
          ...l,
          experienceId: personal.id,
          client: personal.company,
          updatedAt: Date.now(),
        };
      }
      return l;
    });
    if (hasChanges) {
      saveLogs(updatedLogs);
    }
  }
};

export const getExperienceById = (id: string): WorkExperience | undefined => {
  const experiences = getStoredExperiences();
  return experiences.find((e) => e.id === id);
};

export const getLogsForExperience = (experienceId: string): LogEntry[] => {
  const logs = getStoredLogs();
  return logs.filter((l) => l.experienceId === experienceId);
};

// --- Storage Utilities (Logs) ---

export const getStoredLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      return [];
    }
    const parsed: LogEntry[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter any dummy logs
    const nonDummy = parsed.filter(
      (l) =>
        !DUMMY_LOG_IDS.has(l.id) &&
        l.client !== "ClientX" &&
        !l.title?.includes("Migrated checkout payment flow") &&
        !l.title?.includes("inventory decrement during flash sales") &&
        !l.title?.includes("settlement microservices") &&
        !l.title?.includes("anomaly detection pipeline") &&
        !l.title?.includes("zero-downtime hot reload") &&
        !l.title?.includes("monolithic controller") &&
        !l.title?.includes("local LLMs")
    );

    // Ensure all logs have experienceId (Migration to Dual Model)
    const experiences = getStoredExperiences();
    let migrated = false;
    const updated = nonDummy.map((log) => {
      if (!log.experienceId) {
        migrated = true;
        // Find matching experience by company/client
        const matched = experiences.find(
          (e) =>
            e.company.toLowerCase().includes(log.client.toLowerCase()) ||
            log.client.toLowerCase().includes(e.company.toLowerCase())
        );
        const targetExpId = matched ? matched.id : (experiences.find((e) => e.isPersonalProjects)?.id || experiences[0]?.id || "exp-personal");
        return { ...log, experienceId: targetExpId };
      }
      return log;
    });

    if (migrated || nonDummy.length !== parsed.length) {
      saveLogs(updated);
    }

    return updated;
  } catch (e) {
    console.error("Error reading logs from localStorage", e);
    return [];
  }
};

export const saveLogs = (logs: LogEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    triggerCloudSync();
  } catch (e) {
    console.error("Error saving logs to localStorage", e);
  }
};

export const addLog = (
  entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">
): LogEntry => {
  const logs = getStoredLogs();
  const experiences = getStoredExperiences();

  // Ensure experienceId is set
  let expId = entry.experienceId;
  if (!expId) {
    const matched = experiences.find(
      (e) =>
        e.company.toLowerCase() === entry.client.toLowerCase() ||
        entry.client.toLowerCase().includes(e.company.toLowerCase())
    );
    expId = matched ? matched.id : (experiences.find((e) => e.isPersonalProjects)?.id || experiences[0]?.id || "exp-personal");
  }

  const newLog: LogEntry = {
    ...entry,
    experienceId: expId,
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    isPublic: entry.isPublic ?? false, // Defaults to Sandbox Privado
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const updated = [newLog, ...logs];
  saveLogs(updated);
  return newLog;
};

export const updateLog = (updatedEntry: LogEntry): void => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === updatedEntry.id);
  if (index !== -1) {
    logs[index] = { ...updatedEntry, updatedAt: Date.now() };
    saveLogs(logs);
  }
};

export const toggleLogPublic = (id: string): LogEntry | null => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === id);
  if (index !== -1) {
    logs[index] = {
      ...logs[index],
      isPublic: !logs[index].isPublic,
      updatedAt: Date.now(),
    };
    saveLogs(logs);
    return logs[index];
  }
  return null;
};

export const deleteLog = (id: string): void => {
  const logs = getStoredLogs();
  const filtered = logs.filter((l) => l.id !== id);
  saveLogs(filtered);
};

// --- Custom Account Authentication Utilities ---

export const hashPassword = (pwd: string): string => {
  return btoa(encodeURIComponent("goal_recall_salt_" + pwd.trim()));
};

export const getStoredCustomAccounts = (): CustomAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOUNTS);
    if (!raw) {
      const seedAccount: CustomAccount = {
        id: "usr-rodrigo-jara",
        name: "Rodrigo Jara",
        email: "rjara001@gmail.com",
        passwordHash: hashPassword("admin123"),
        title: "",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "",
        location: "",
        github: "",
        linkedin: "",
        skills: [],
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ACCOUNTS, JSON.stringify([seedAccount]));
      return [seedAccount];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredCustomAccounts = (accounts: CustomAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error("Error saving custom accounts:", e);
  }
};

export const registerCustomAccount = (params: {
  name: string;
  email: string;
  password: string;
  title?: string;
  avatar?: string;
}): { success: boolean; user?: UserProfile; error?: string } => {
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanName = params.name.trim();
  const cleanPwd = params.password.trim();

  if (!cleanName) {
    return { success: false, error: "Ingresa tu nombre completo." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Ingresa un correo electrónico válido." };
  }
  if (!cleanPwd || cleanPwd.length < 4) {
    return { success: false, error: "La contraseña debe tener al menos 4 caracteres." };
  }

  const existingAccounts = getStoredCustomAccounts();
  const alreadyExists = existingAccounts.some(
    (acc) => acc.email.toLowerCase() === cleanEmail
  );

  if (alreadyExists) {
    return {
      success: false,
      error: "Ya existe una cuenta con este correo electrónico. Por favor inicia sesión.",
    };
  }

  const newAccount: CustomAccount = {
    id: "usr-" + Date.now(),
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(cleanPwd),
    title: params.title?.trim() || "",
    avatar:
      params.avatar ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    bio: "",
    location: "",
    github: "",
    linkedin: "",
    skills: [],
    createdAt: Date.now(),
  };

  const updatedAccounts = [newAccount, ...existingAccounts];
  saveStoredCustomAccounts(updatedAccounts);

  const userProfile: UserProfile = {
    id: newAccount.id,
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

  if (!cleanInput) {
    return { success: false, error: "Ingresa tu correo o nombre de usuario." };
  }
  if (!cleanPwd) {
    return { success: false, error: "Ingresa tu contraseña." };
  }

  const accounts = getStoredCustomAccounts();
  const target = accounts.find(
    (acc) =>
      acc.email.toLowerCase() === cleanInput ||
      acc.name.toLowerCase() === cleanInput
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

// --- User Profile Utilities ---

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

export const deleteCustomUser = (_userId: string): { updatedList: UserProfile[]; newActiveUser: UserProfile } => {
  const list = getStoredUsersList();
  return { updatedList: list, newActiveUser: list[0] || INITIAL_USER };
};

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveUser = (user: UserProfile | null): void => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    triggerCloudSync();
  }
};

export const updateUserAvatar = (newAvatarUrl: string): UserProfile | null => {
  const current = getStoredUser();
  if (!current) return null;

  const updated: UserProfile = {
    ...current,
    avatar: newAvatarUrl,
  };
  saveUser(updated);

  // Also update corresponding custom account if applicable
  try {
    const rawAccounts = localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCOUNTS);
    if (rawAccounts) {
      const accounts: CustomAccount[] = JSON.parse(rawAccounts);
      if (Array.isArray(accounts)) {
        const idx = accounts.findIndex(
          (acc) =>
            acc.id === current.id ||
            (current.email && acc.email.toLowerCase() === current.email.toLowerCase())
        );
        if (idx !== -1) {
          accounts[idx] = {
            ...accounts[idx],
            avatar: newAvatarUrl,
          };
          saveStoredCustomAccounts(accounts);
        }
      }
    }
  } catch (err) {
    console.warn("Error updating avatar in custom accounts:", err);
  }

  return updated;
};

// --- Inbox Utilities ---

export const getStoredInbox = (): VisitorMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INBOX);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(INITIAL_INBOX));
      return INITIAL_INBOX;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INBOX;
  }
};

export const saveInbox = (messages: VisitorMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(messages));
  } catch (e) {
    console.error("Error saving inbox messages", e);
  }
};

export const addVisitorMessage = (
  msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">
): VisitorMessage => {
  const current = getStoredInbox();
  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  const newMsg: VisitorMessage = {
    ...msg,
    id: "msg-" + Date.now(),
    date: dateStr,
    read: false,
    replied: false,
  };
  saveInbox([newMsg, ...current]);
  return newMsg;
};

export const markMessageRead = (id: string): void => {
  const current = getStoredInbox();
  const updated = current.map((m) => (m.id === id ? { ...m, read: true } : m));
  saveInbox(updated);
};

export const deleteMessage = (id: string): void => {
  const current = getStoredInbox();
  saveInbox(current.filter((m) => m.id !== id));
};

// --- Backup & Restore ---

export const exportBackupJson = (): string => {
  const payload = {
    version: "captains_log_v1",
    exportedAt: new Date().toISOString(),
    user: getStoredUser(),
    logs: getStoredLogs(),
    experiences: getStoredExperiences(),
    inbox: getStoredInbox(),
    jobOffers: getStoredJobOffers(),
  };
  return JSON.stringify(payload, null, 2);
};

export const importBackupJson = (
  jsonString: string
): { success: boolean; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.logs)) {
      return {
        success: false,
        count: 0,
        error: "Formato de archivo no válido: no se encontró la lista de logs.",
      };
    }

    saveLogs(parsed.logs);
    if (parsed.user) saveUser(parsed.user);
    if (Array.isArray(parsed.experiences)) saveExperiences(parsed.experiences);
    if (Array.isArray(parsed.inbox)) saveInbox(parsed.inbox);
    if (Array.isArray(parsed.jobOffers)) saveJobOffers(parsed.jobOffers);

    return { success: true, count: parsed.logs.length };
  } catch (e: any) {
    return {
      success: false,
      count: 0,
      error: e.message || "Error al analizar el archivo JSON.",
    };
  }
};

export const resetToDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.JOB_OFFERS);
};

export const getStoredCv = (userId?: string): ExtractedCvData | null => {
  try {
    const key = userId ? `${STORAGE_KEYS.CV_DATA}_${userId}` : STORAGE_KEYS.CV_DATA;
    const item = localStorage.getItem(key);
    if (!item && userId) {
      // fallback to global key
      const fallback = localStorage.getItem(STORAGE_KEYS.CV_DATA);
      return fallback ? JSON.parse(fallback) : null;
    }
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Error reading stored CV:", e);
    return null;
  }
};

export const saveStoredCv = (cvData: ExtractedCvData, userId?: string): void => {
  try {
    const key = userId ? `${STORAGE_KEYS.CV_DATA}_${userId}` : STORAGE_KEYS.CV_DATA;
    localStorage.setItem(key, JSON.stringify(cvData));
    localStorage.setItem(STORAGE_KEYS.CV_DATA, JSON.stringify(cvData));
  } catch (e) {
    console.error("Error saving stored CV:", e);
  }
};

export const clearStoredCv = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CV_DATA);
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(STORAGE_KEYS.CV_DATA) || k.startsWith("captains_stored_cv"))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Error clearing stored CV:", e);
  }
};

export const clearSessionData = (): void => {
  saveUser(null);
  clearStoredCv();
};

// --- AI Usage Quota & Rate Limiting ---

export const MAX_FREE_MONTHLY_AI_USES = 3;
export const AI_COOLDOWN_MS = 10_000; // 10 seconds cooldown between uploads

export const getAiUsage = (): AiUsageRecord => {
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
    if (!raw) {
      return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
    }
    const parsed: AiUsageRecord = JSON.parse(raw);
    if (parsed.monthKey !== currentMonthKey) {
      // Month changed: auto reset count
      const newRecord: AiUsageRecord = { monthKey: currentMonthKey, count: 0, lastUsed: parsed.lastUsed || 0 };
      localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(newRecord));
      return newRecord;
    }
    return parsed;
  } catch (e) {
    return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
  }
};

export const checkCanUseAi = (plan: "free" | "pro" = "free"): {
  canUse: boolean;
  reason?: string;
  remaining: number;
  cooldownRemainingMs: number;
  usage: AiUsageRecord;
} => {
  const usage = getAiUsage();
  const now = Date.now();
  const cooldownRemainingMs = Math.max(0, usage.lastUsed + AI_COOLDOWN_MS - now);

  if (plan === "pro") {
    return {
      canUse: cooldownRemainingMs === 0,
      reason: cooldownRemainingMs > 0 ? "Por favor espera a que termine el tiempo de enfriamiento entre llamadas." : undefined,
      remaining: 999,
      cooldownRemainingMs,
      usage,
    };
  }

  // Free Tier rules:
  const remaining = Math.max(0, MAX_FREE_MONTHLY_AI_USES - usage.count);

  if (remaining <= 0) {
    return {
      canUse: false,
      reason: `Has utilizado las ${MAX_FREE_MONTHLY_AI_USES} extracciones con IA incluidas en tu cuenta gratuita este mes.`,
      remaining: 0,
      cooldownRemainingMs,
      usage,
    };
  }

  if (cooldownRemainingMs > 0) {
    const secondsLeft = Math.ceil(cooldownRemainingMs / 1000);
    return {
      canUse: false,
      reason: `Por favor espera ${secondsLeft} segundos antes de realizar otra extracción con IA.`,
      remaining,
      cooldownRemainingMs,
      usage,
    };
  }

  return {
    canUse: true,
    remaining,
    cooldownRemainingMs: 0,
    usage,
  };
};

export const recordAiUsage = (): AiUsageRecord => {
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const current = getAiUsage();
  const updated: AiUsageRecord = {
    monthKey: currentMonthKey,
    count: (current.monthKey === currentMonthKey ? current.count : 0) + 1,
    lastUsed: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving AI usage", e);
  }
  return updated;
};

export const saveProWaitlistEmail = (email: string): boolean => {
  try {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) return false;
    const raw = localStorage.getItem("goal_recall_pro_waitlist_v1");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem("goal_recall_pro_waitlist_v1", JSON.stringify(list));
    }
    return true;
  } catch (e) {
    console.error("Error saving waitlist email", e);
    return false;
  }
};

export const getProWaitlistEmails = (): string[] => {
  try {
    const raw = localStorage.getItem("goal_recall_pro_waitlist_v1");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const INITIAL_JOB_OFFERS: JobOffer[] = [
  {
    id: "offer-sample-stripe",
    company: "Stripe",
    role: "Staff Backend / Infrastructure Engineer",
    location: "Remoto (Global / LatAm & US)",
    modality: "100% Remoto",
    contractType: "B2B / Contractor",
    salaryExpectation: {
      min: 8000,
      max: 11000,
      currency: "USD",
      period: "mensual",
    },
    extraConditions: "MacBook Pro M3 Max, $2,000 USD estipendio anual para home-office, 25 días hábiles libres y seguro internacional.",
    status: "saved",
    description: `Buscamos un Ingeniero Backend Senior o Staff para liderar la arquitectura de procesamiento de pagos de alta concurrencia.
Requisitos:
- Experiencia sólida en sistemas distribuidos de alto volumen (Redis, Kafka, colas RabbitMQ/SQS).
- Optimización de latencias p99 y tolerancia a fallos en producción.
- Experiencia con microservicios en Node.js, Go o Rust, con bases de datos PostgreSQL o DynamoDB.
- Habilidad comprobada para formular soluciones técnicas con impacto medible en el negocio (Google XYZ).
- Capacidad para liderar revisiones de diseño arquitectónico y mentorear ingenieros.`,
    atsAnalysis: {
      score: 92,
      matchedKeywords: [
        "Sistemas distribuidos",
        "Redis",
        "Latencia p99",
        "Microservicios",
        "PostgreSQL",
        "RabbitMQ",
        "Tolerancia a fallos"
      ],
      missingKeywords: [
        "Go / Golang",
        "Kafka",
        "DynamoDB"
      ],
      recommendations: [
        "Prioriza logros relacionados con reducción de latencias y escalamiento en microservicios.",
        "Destaca la fórmula Google XYZ en viñetas de pagos y arquitectura distribuida.",
        "Menciona tu experiencia resolviendo incidentes críticos bajo presión en el bloque STAR."
      ],
      keyRequirements: [
        "Arquitectura de pagos de alta concurrencia",
        "Monitoreo con Datadog / Prometheus",
        "Diseño de sagas asíncronas sin transacciones duplicadas"
      ]
    },
    tailoredCv: {
      headline: "Staff Distributed Systems & Infrastructure Engineer",
      targetSummary: "Ingeniero de infraestructura y sistemas distribuidos con comprobada experiencia liderando arquitecturas críticas de pagos y microservicios. Especialista en reducción de latencia p99, caching distribuido de alta disponibilidad y optimización de costos en cloud.",
      selectedLogIds: [],
      selectedExperienceIds: [],
      highlightedSkills: ["Redis Cluster", "PostgreSQL", "RabbitMQ", "Microservicios", "Prometheus", "Node.js"]
    },
    interviewPrep: {
      cheatSheet: [
        "Punto clave: Enfatizar reducción de latencias p99 de 3.2s a 240ms en Black Friday.",
        "Arquitectura: Detallar el patrón de saga asíncrona implementado sobre Redis para evitar pagos duplicados.",
        "Trade-offs: Discutir consistencia eventual vs. consistencia estricta en el decremento de inventario.",
        "Liderazgo: Mencionar cómo se documentaron los ADRs (Architecture Decision Records) para alinear al equipo."
      ],
      frequentQuestions: [
        {
          question: "¿Cómo manejas la idempotencia y las transacciones duplicadas en un sistema de pagos bajo picos de tráfico?",
          focus: "Arquitectura & Resiliencia",
          suggestedStrategy: "Explicar el uso de tokens únicos de idempotencia cacheados en Redis con TTL estricto y bloqueos distribuidos (Redlock) antes de procesar el pago."
        },
        {
          question: "Cuéntame de una ocasión en que tuviste que diagnosticar una degradación de latencia p99 en producción.",
          focus: "Resolución de Incidentes (STAR)",
          suggestedStrategy: "Usar la estructura STAR: Situación con degradación en horas punta, Tarea de no afectar la tasa de conversión, Acción con flamegraphs y perfilado de queries lentas, y Resultado con mejora porcentual verificada."
        },
        {
          question: "¿Cómo justificas los trade-offs económicos al escalar infraestructura en la nube?",
          focus: "Visión de Negocio & Costos",
          suggestedStrategy: "Explicar cómo optimizar queries y consolidar instancias redujo el costo mensual antes de solicitar más computación a ciegas."
        }
      ]
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  }
];

export const getStoredJobOffers = (): JobOffer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOB_OFFERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.JOB_OFFERS, JSON.stringify(INITIAL_JOB_OFFERS));
      return INITIAL_JOB_OFFERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_JOB_OFFERS;
  } catch (e) {
    console.error("Error reading stored job offers:", e);
    return INITIAL_JOB_OFFERS;
  }
};

export const saveJobOffers = (offers: JobOffer[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.JOB_OFFERS, JSON.stringify(offers));
    triggerCloudSync();
  } catch (e) {
    console.error("Error saving job offers:", e);
  }
};

export const addJobOffer = (offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">): JobOffer => {
  const current = getStoredJobOffers();
  const newOffer: JobOffer = {
    ...offer,
    id: `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveJobOffers([newOffer, ...current]);
  return newOffer;
};

export const updateJobOffer = (updated: JobOffer): void => {
  const current = getStoredJobOffers();
  const next = current.map((o) => (o.id === updated.id ? { ...updated, updatedAt: Date.now() } : o));
  saveJobOffers(next);
};

export const deleteJobOffer = (id: string): void => {
  const current = getStoredJobOffers();
  saveJobOffers(current.filter((o) => o.id !== id));
};

// --- Cloud Sync Multi-Device & Cache-Wipe Protection ---

let syncTimeout: any = null;

export const triggerCloudSync = (immediate = false): void => {
  if (typeof window === "undefined") return;

  const performSync = async () => {
    try {
      const user = getStoredUser();
      const userKey = user?.email?.trim() || (user?.isCustom ? user?.id : "");
      if (!userKey || userKey === "usr-guest") return;

      const payload = {
        version: "captains_log_v1",
        exportedAt: new Date().toISOString(),
        user,
        logs: getStoredLogs(),
        experiences: getStoredExperiences(),
        inbox: getStoredInbox(),
        jobOffers: getStoredJobOffers(),
      };

      await fetch("/api/cloud-sync/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey, payload }),
      });
    } catch (err) {
      console.warn("Background cloud sync notice:", err);
    }
  };

  if (immediate) {
    performSync();
  } else {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(performSync, 1200);
  }
};

export const restoreFromCloudIfEmpty = async (userKey: string): Promise<boolean> => {
  if (typeof window === "undefined" || !userKey) return false;
  try {
    const localLogs = getStoredLogs();
    if (localLogs.length > 0) return false; // Already has local data

    const res = await fetch(`/api/cloud-sync/load/${encodeURIComponent(userKey)}`);
    if (!res.ok) return false;

    const data = await res.json();
    if (data?.success && data?.backup?.payload) {
      const { payload } = data.backup;
      if (Array.isArray(payload.logs) && payload.logs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(payload.logs));
      }
      if (payload.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
      }
      if (Array.isArray(payload.experiences) && payload.experiences.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(payload.experiences));
      }
      if (Array.isArray(payload.inbox)) {
        localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(payload.inbox));
      }
      if (Array.isArray(payload.jobOffers)) {
        localStorage.setItem(STORAGE_KEYS.JOB_OFFERS, JSON.stringify(payload.jobOffers));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Error restoring cloud backup:", err);
    return false;
  }
};
