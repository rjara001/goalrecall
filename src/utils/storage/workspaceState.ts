import {
  CustomAccount,
  ExtractedCvData,
  JobOffer,
  LogEntry,
  Product,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../../types";
import type { UserCloudState } from "../cloudState";

export interface InMemoryWorkspaceState {
  experiences: WorkExperience[];
  logs: LogEntry[];
  user: UserProfile | null;
  cv: ExtractedCvData | null;
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  customAccounts: CustomAccount[];
}

export const workspaceState: InMemoryWorkspaceState = {
  experiences: [],
  logs: [],
  user: null,
  cv: null,
  inbox: [],
  jobOffers: [],
  products: [],
  customAccounts: [],
};

let syncNotifier: ((immediate?: boolean) => void) | null = null;

export function setCloudSyncNotifier(fn: (immediate?: boolean) => void): void {
  syncNotifier = fn;
}

export function notifyCloudSync(immediate = false): void {
  syncNotifier?.(immediate);
}

export const initializeStateFromCloud = (cloudData: Partial<UserCloudState>): void => {
  if (cloudData.user) {
    workspaceState.user = workspaceState.user
      ? { ...workspaceState.user, ...cloudData.user }
      : cloudData.user;
  }
  if (cloudData.storedCv !== undefined) workspaceState.cv = cloudData.storedCv;
  if (Array.isArray(cloudData.experiences)) workspaceState.experiences = cloudData.experiences;
  if (Array.isArray(cloudData.logs)) workspaceState.logs = cloudData.logs;
  if (Array.isArray(cloudData.jobOffers)) workspaceState.jobOffers = cloudData.jobOffers;
  if (Array.isArray(cloudData.products)) workspaceState.products = cloudData.products;
};
