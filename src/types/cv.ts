import type { CvPendingField, ExtractedCvData, LogCategory } from "./index";

export interface ExtractedBullet {
  id: string;
  client: string;
  project: string;
  category: LogCategory;
  title: string;
  description: string;
  impact: string;
  whatWasSought?: string;
  whyImportant?: string;
  howApplied?: string;
  tags: string[];
  xyzScore: number;
  metricHighlight?: string;
  originalText?: string;
  selected: boolean;
  isEditing?: boolean;
}

export interface ExtractedAchievementItem {
  id: string;
  client: string;
  project: string;
  title: string;
  description: string;
  impact: string;
  whatWasSought?: string;
  whyImportant?: string;
  howApplied?: string;
  category: string;
  tags: string[];
  xyzScore: number;
  metricHighlight?: string;
}

export interface LocalExtractionResult {
  cvData: ExtractedCvData;
  achievements: ExtractedAchievementItem[];
  pendingFields: CvPendingField[];
  completedCount: number;
  totalChecks: number;
  completenessScore: number;
  engine: string;
  fileName: string;
}

export type CvFallbackReason =
  | "unauthenticated"
  | "network"
  | "server_error"
  | "timeout"
  | "forced_local";

export interface CvExtractionPayload {
  fileName: string;
  textContent?: string;
  fileBase64?: string;
  mimeType?: string;
  forceLocal?: boolean;
}

export interface CvExtractionResponse {
  cvData: ExtractedCvData;
  achievements: ExtractedAchievementItem[];
  pendingFields: CvPendingField[];
  completenessScore: number;
  engine: string;
  fallbackReason?: CvFallbackReason;
}

export type CvExtractionStatus = "idle" | "loading" | "success" | "error";

export type CvUploadPhase = "upload" | "processing" | "quota_exceeded" | "review";

export interface PendingFieldEditingState {
  fieldId: string;
  label: string;
  section: CvPendingField["section"];
  fieldName: string;
  currentValue: string;
  suggestedPrompt: string;
}