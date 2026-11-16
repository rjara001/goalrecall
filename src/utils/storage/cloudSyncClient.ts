import { saveCloudUserState } from "../cloudState";
import { getStoredCustomAccounts, getStoredUser, sanitizeUsername } from "./authStorage";
import { getStoredExperiences } from "./experiencesStorage";
import { getStoredInbox } from "./inboxStorage";
import { getStoredJobOffers } from "./jobOffersStorage";
import { STORAGE_KEYS } from "./keys";
import { getStoredLogs } from "./logsStorage";
import { getStoredProducts } from "./productsStorage";
import { initializeStateFromCloud, setCloudSyncNotifier, workspaceState } from "./workspaceState";

export function computePayloadHash(obj: unknown): string {
  const str = JSON.stringify(obj);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16) + "_" + str.length;
}

let lastSyncedHash: string | null = null;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export const hasUnsavedCloudChanges = (): boolean => {
  try {
    const user = getStoredUser();
    const userKey = user?.email?.trim() || (user?.isCustom ? user?.id : "");
    if (!userKey || userKey === "usr-guest") return false;

    const dataSnapshot = {
      logs: getStoredLogs(),
      experiences: getStoredExperiences(),
      inbox: getStoredInbox(),
      jobOffers: getStoredJobOffers(),
      products: getStoredProducts(),
      user,
    };
    const currentHash = computePayloadHash(dataSnapshot);
    return lastSyncedHash !== null && currentHash !== lastSyncedHash;
  } catch {
    return false;
  }
};

export const triggerCloudSync = (immediate = false): void => {
  if (typeof window === "undefined") return;

  const performSync = async () => {
    try {
      let user = workspaceState.user || getStoredUser();
      if (!user) {
        const accounts = getStoredCustomAccounts();
        if (accounts.length > 0) {
          const acc = accounts[0];
          user = {
            id: acc.id,
            username: acc.username || "usuario",
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
          };
          workspaceState.user = user;
        }
      }

      if (user && !user.username) {
        user.username = user.name ? sanitizeUsername(user.name) : "usuario";
        if (user.username.length < 3) user.username = "usuario";
      }

      const dataSnapshot = {
        logs: workspaceState.logs,
        experiences: workspaceState.experiences,
        storedCv: workspaceState.cv,
        inbox: workspaceState.inbox,
        jobOffers: workspaceState.jobOffers,
        products: workspaceState.products,
        user: user || workspaceState.user,
      };

      const currentHash = computePayloadHash(dataSnapshot);
      if (lastSyncedHash === currentHash) return;

      const saved = await saveCloudUserState(dataSnapshot);
      if (saved) {
        lastSyncedHash = currentHash;
      }
    } catch (err) {
      console.warn("Server-First Cloud state sync error:", err);
    }
  };

  if (immediate) {
    performSync();
  } else {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(performSync, 1500);
  }
};

setCloudSyncNotifier(triggerCloudSync);

export const restoreFromCloudIfEmpty = async (userKey: string): Promise<boolean> => {
  if (typeof window === "undefined" || !userKey) return false;
  try {
    if (getStoredLogs().length > 0) return false;

    const res = await fetch(`/api/cloud-sync/load/${encodeURIComponent(userKey)}`);
    if (!res.ok) return false;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return false;

    const data = await res.json();
    if (data?.success && data?.backup?.payload) {
      const { payload } = data.backup;
      if (Array.isArray(payload.logs) && payload.logs.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(payload.logs));
      }
      if (payload.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
        initializeStateFromCloud(payload);
      }
      if (Array.isArray(payload.experiences) && payload.experiences.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(payload.experiences));
        initializeStateFromCloud(payload);
      }
      if (Array.isArray(payload.inbox)) {
        localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(payload.inbox));
      }
      if (Array.isArray(payload.jobOffers)) {
        localStorage.setItem(STORAGE_KEYS.JOB_OFFERS, JSON.stringify(payload.jobOffers));
      }
      if (Array.isArray(payload.products)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(payload.products));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Error restoring cloud backup:", err);
    return false;
  }
};
