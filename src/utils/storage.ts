import { purgeDummyPresetData } from "./storage/backupStorage";

export * from "./storage/keys";
export * from "./storage/workspaceState";
export * from "./storage/experiencesStorage";
export * from "./storage/logsStorage";
export * from "./storage/authStorage";
export * from "./storage/inboxStorage";
export * from "./storage/jobOffersStorage";
export * from "./storage/productsStorage";
export * from "./storage/certificationsStorage";
export * from "./storage/careerGoalsStorage";
export * from "./storage/cvStorage";
export * from "./storage/aiQuotaStorage";
export * from "./storage/backupStorage";
export * from "./storage/cloudSyncClient";

purgeDummyPresetData();
