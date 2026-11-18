import {
  CareerGoal,
  JobOffer,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../../types";
import { getStoredUser, saveUser } from "./authStorage";
import { getStoredCareerGoals, saveCareerGoals } from "./careerGoalsStorage";
import { getStoredCertifications, saveCertifications } from "./certificationsStorage";
import { getStoredExperiences, saveExperiences } from "./experiencesStorage";
import { getStoredInbox, saveInbox } from "./inboxStorage";
import { getStoredJobOffers, saveJobOffers } from "./jobOffersStorage";
import { getStoredLogs, saveLogs } from "./logsStorage";
import { getStoredProducts, saveProducts } from "./productsStorage";

export interface ParsedBackupBundle {
  user?: UserProfile;
  logs: LogEntry[];
  experiences?: WorkExperience[];
  inbox?: VisitorMessage[];
  jobOffers?: JobOffer[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  careerGoals?: CareerGoal[];
}

export const buildBackupExportJson = (state: {
  user: UserProfile | null;
  logs: LogEntry[];
  experiences: WorkExperience[];
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  certifications: TechnicalCertification[];
  careerGoals: CareerGoal[];
}): string => {
  return JSON.stringify(
    {
      version: "captains_log_v1",
      exportedAt: new Date().toISOString(),
      ...state,
    },
    null,
    2
  );
};

export const parseBackupJson = (
  jsonString: string
): { success: boolean; data?: ParsedBackupBundle; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.logs)) {
      return {
        success: false,
        count: 0,
        error: "Formato de archivo no válido: no se encontró la lista de logs.",
      };
    }
    return {
      success: true,
      count: parsed.logs.length,
      data: {
        user: parsed.user,
        logs: parsed.logs,
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : undefined,
        inbox: Array.isArray(parsed.inbox) ? parsed.inbox : undefined,
        jobOffers: Array.isArray(parsed.jobOffers) ? parsed.jobOffers : undefined,
        products: Array.isArray(parsed.products) ? parsed.products : undefined,
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : undefined,
        careerGoals: Array.isArray(parsed.careerGoals) ? parsed.careerGoals : undefined,
      },
    };
  } catch (e: unknown) {
    return {
      success: false,
      count: 0,
      error: e instanceof Error ? e.message : "Error al analizar el archivo JSON.",
    };
  }
};

export const exportBackupJson = (): string => {
  return buildBackupExportJson({
    user: getStoredUser(),
    logs: getStoredLogs(),
    experiences: getStoredExperiences(),
    inbox: getStoredInbox(),
    jobOffers: getStoredJobOffers(),
    products: getStoredProducts(),
    certifications: getStoredCertifications(),
    careerGoals: getStoredCareerGoals(),
  });
};

export const importBackupJson = (
  jsonString: string
): { success: boolean; count: number; error?: string } => {
  const parsed = parseBackupJson(jsonString);
  if (!parsed.success || !parsed.data) {
    return { success: false, count: 0, error: parsed.error };
  }

  saveLogs(parsed.data.logs);
  if (parsed.data.user) saveUser(parsed.data.user);
  if (parsed.data.experiences) saveExperiences(parsed.data.experiences);
  if (parsed.data.inbox) saveInbox(parsed.data.inbox);
  if (parsed.data.jobOffers) saveJobOffers(parsed.data.jobOffers);
  if (parsed.data.products) saveProducts(parsed.data.products);
  if (parsed.data.certifications) saveCertifications(parsed.data.certifications);
  if (parsed.data.careerGoals) saveCareerGoals(parsed.data.careerGoals);

  return { success: true, count: parsed.count };
};
