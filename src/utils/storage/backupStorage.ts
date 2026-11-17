import { CustomAccount, LogEntry, WorkExperience } from "../../types";
import { getStoredUser, saveUser } from "./authStorage";
import { getStoredCareerGoals, saveCareerGoals } from "./careerGoalsStorage";
import { getStoredCertifications, saveCertifications } from "./certificationsStorage";
import { getStoredExperiences, saveExperiences } from "./experiencesStorage";
import { getStoredInbox, saveInbox } from "./inboxStorage";
import { getStoredJobOffers, saveJobOffers } from "./jobOffersStorage";
import { DUMMY_EXP_IDS, DUMMY_LOG_IDS, STORAGE_KEYS } from "./keys";
import { getStoredLogs, saveLogs } from "./logsStorage";
import { getStoredProducts, saveProducts } from "./productsStorage";

export const purgeDummyPresetData = (): void => {
  if (typeof localStorage === "undefined") return;
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
        if (
          user.bio?.includes("12+ years architecting") ||
          user.bio?.includes("Ingeniero de software enfocado")
        ) {
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
        if (
          user.skills &&
          user.skills.some(
            (s: { name?: string }) =>
              s.name === "TypeScript / Node.js" ||
              s.name === "Distributed Systems Architecture"
          )
        ) {
          user.skills = [];
          changed = true;
        }
        if (user.title === "Senior Full-Stack & Systems Architect") {
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
          const isDummyBio =
            acc.bio?.includes("12+ years") ||
            acc.bio?.includes("Ingeniero de software enfocado");
          return {
            ...acc,
            bio: isDummyBio ? "" : acc.bio || "",
            title: acc.title === "Senior Full-Stack & Systems Architect" ? "" : acc.title || "",
            github: acc.github === "https://github.com" ? "" : acc.github || "",
            linkedin: acc.linkedin === "https://linkedin.com" ? "" : acc.linkedin || "",
            skills:
              acc.skills?.filter(
                (s: { name?: string }) =>
                  s.name !== "TypeScript / Node.js" &&
                  s.name !== "Distributed Systems Architecture"
              ) || [],
          };
        });
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ACCOUNTS, JSON.stringify(cleanedAccounts));
      }
    }
  } catch (err) {
    console.warn("Purge dummy preset data check error:", err);
  }
};

export const exportBackupJson = (): string => {
  const payload = {
    version: "captains_log_v1",
    exportedAt: new Date().toISOString(),
    user: getStoredUser(),
    logs: getStoredLogs(),
    experiences: getStoredExperiences(),
    inbox: getStoredInbox(),
    jobOffers: getStoredJobOffers(),
    products: getStoredProducts(),
    certifications: getStoredCertifications(),
    careerGoals: getStoredCareerGoals(),
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
    if (Array.isArray(parsed.products)) saveProducts(parsed.products);
    if (Array.isArray(parsed.certifications)) saveCertifications(parsed.certifications);
    if (Array.isArray(parsed.careerGoals)) saveCareerGoals(parsed.careerGoals);

    return { success: true, count: parsed.logs.length };
  } catch (e: unknown) {
    return {
      success: false,
      count: 0,
      error: e instanceof Error ? e.message : "Error al analizar el archivo JSON.",
    };
  }
};

export const resetToDemoData = (): void => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.JOB_OFFERS);
  localStorage.removeItem(STORAGE_KEYS.CERTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.CAREER_GOALS);
  saveCertifications([]);
  saveCareerGoals([]);
};
