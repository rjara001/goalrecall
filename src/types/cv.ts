export interface ExtractedBullet {
  id: string;
  client: string;
  project: string;
  category: string;
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

export interface CvExtractionPayload {
  fileName: string;
  textContent?: string;
  fileBase64?: string;
  mimeType?: string;
  forceLocal?: boolean;
}

export interface CvExtractionResponse {
  cvData: any;
  achievements: any[];
  pendingFields: any[];
  completenessScore: number;
  engine: string;
}

export type CvExtractionStatus = "idle" | "loading" | "success" | "error";