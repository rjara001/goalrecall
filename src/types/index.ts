export type LogCategory = 
  | "Feature ✨" 
  | "Fix 🐛" 
  | "Refactor 🧹" 
  | "Architecture 🏗️" 
  | "Infra/DevOps 🚀" 
  | "Spike/R&D 🔬";

export interface LogEntry {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  client: string; // e.g. "ClientX", "Internal"
  project: string; // e.g. "Checkout Revamp", "Cloud Migration"
  category: LogCategory;
  title: string;
  description?: string;
  impact: string; // Quantitative/qualitative outcome
  tags: string[];
  isPublic: boolean; // Default false (Sandbox). If true, appears in Public Deck & First Mate
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  github?: string;
  linkedin?: string;
  skills: { name: string; category: "Languages" | "Frameworks" | "Cloud/DevOps" | "Architecture" }[];
  isDemoUser?: boolean;
}

export interface VisitorMessage {
  id: string;
  name: string;
  email: string;
  organization?: string;
  message: string;
  date: string;
  read: boolean;
  replied: boolean;
}

export interface FilterState {
  search: string;
  client: string;
  project: string;
  category: string;
  tag: string;
  dateRange: "all" | "7d" | "30d" | "90d" | "year";
  visibility: "all" | "public_only" | "private_only";
}

export interface PresetTemplate {
  name: string;
  category: LogCategory;
  title: string;
  description: string;
  impact: string;
  tags: string[];
}

export interface XYZBullet {
  id: string;
  logId: string;
  client: string;
  project: string;
  date: string;
  bullet: string; // "Accomplished [X] as measured by [Y] by doing [Z]"
  originalTitle: string;
  impact: string;
}

export interface STARStory {
  id: string;
  title: string;
  category: LogCategory;
  client: string;
  project: string;
  situation: string; // Context & problem
  task: string;      // Objective & constraints
  action: string;    // Technical implementation
  result: string;    // Measurable outcome & impact
  tags: string[];
}
