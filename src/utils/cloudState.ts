import {
  CareerGoal,
  ExtractedCvData,
  JobOffer,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  WorkExperience,
} from "../types";

export interface UserCloudState {
  user: UserProfile | null;
  storedCv: ExtractedCvData | null;
  experiences: WorkExperience[];
  logs: LogEntry[];
  jobOffers?: JobOffer[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  careerGoals?: CareerGoal[];
  updatedAt?: string;
}
