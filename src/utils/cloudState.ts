import { auth, signInAnonymously } from "../firebase";
import { UserProfile, WorkExperience, LogEntry, JobOffer, Product, ExtractedCvData } from "../types";

export interface UserCloudState {
  user: UserProfile | null;
  storedCv: ExtractedCvData | null;
  experiences: WorkExperience[];
  logs: LogEntry[];
  jobOffers?: JobOffer[];
  products?: Product[];
  updatedAt?: string;
}

export const ensureAuthenticatedUser = async (): Promise<string | null> => {
  if (!auth) return null;

  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  }

  try {
    const cred = await signInAnonymously(auth);
    return await cred.user.getIdToken();
  } catch (err) {
    console.warn("[CloudState] Anonymous auth failed:", err);
    return null;
  }
};

export const fetchCloudUserState = async (): Promise<UserCloudState | null> => {
  try {
    const token = await ensureAuthenticatedUser();
    if (!token) return null;

    const res = await fetch("/api/user/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    const json = await res.json();
    if (json.success && json.exists && json.data) {
      return json.data as UserCloudState;
    }
    return null;
  } catch (err) {
    console.error("[CloudState] Failed to fetch user state from cloud:", err);
    return null;
  }
};

export const saveCloudUserState = async (
  partialState: Partial<UserCloudState>
): Promise<boolean> => {
  try {
    const token = await ensureAuthenticatedUser();
    if (!token) return false;

    const res = await fetch("/api/user/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(partialState),
    });

    if (!res.ok) {
      return false;
    }

    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error("[CloudState] Failed to save user state to cloud:", err);
    return false;
  }
};
