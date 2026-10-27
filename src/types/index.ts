export type DefaultEngineeringCategory = 
  | "Feature ✨" 
  | "Fix 🐛" 
  | "Refactor 🧹" 
  | "Architecture 🏗️" 
  | "Infra/DevOps 🚀" 
  | "Spike/R&D 🔬";

export type DefaultMarketingCategory =
  | "Campaña / Growth 📈"
  | "Conversión & Funnel 🎯"
  | "Contenido & SEO ✍️"
  | "Branding & Eventos 🎨"
  | "Lanzamiento 🚀";

export type DefaultBusinessCategory =
  | "Diseño & UX 🖌️"
  | "Estrategia & Liderazgo 👥"
  | "Ventas & Revenue 💰"
  | "Operaciones & Proceso ⚙️"
  | "Alianzas & Partners 🤝";

export type LogCategory = 
  | DefaultEngineeringCategory 
  | DefaultMarketingCategory 
  | DefaultBusinessCategory 
  | (string & {});

export interface WorkExperience {
  id: string;
  userId?: string;
  company: string; // e.g. "ParserDigital / Chambers & Partners"
  role: string; // e.g. "Senior Full Stack Developer"
  startDate: string; // e.g. "Oct 2025" or "2022"
  endDate?: string; // e.g. "Present" or "2024"
  isCurrent?: boolean; // true if currently working here
  location?: string; // e.g. "Santiago, Chile / Remoto"
  summary?: string; // brief context/mission of the team or role
  bullets?: string[]; // real textual bullets extracted from CV
  technologies?: string[]; // primary tech stack
  isPersonalProjects?: boolean; // true if this is the personal projects container
  createdAt: number;
  updatedAt: number;
}

export interface LogEntry {
  id: string;
  userId?: string; // Links log to a specific user profile
  experienceId?: string; // Strictly links this achievement to its parent WorkExperience
  originalBullet?: string; // Reference to the original CV bullet this achievement was extracted from
  date: string; // ISO format: YYYY-MM-DD
  client: string; // e.g. "ParserDigital", "ClientX"
  project: string; // e.g. "Digital Submissions", "Checkout Revamp"
  category: LogCategory;
  // 1. Logro (multilínea): campo resumen, es la viñeta que aparecerá en el CV o que fue cargada desde el CV
  title: string;
  logro?: string; // Alias opcional para title
  
  // Acordeones estructurados independientes con signo +:
  whatWasSought?: string; // 2. ¿Qué se buscaba lograr?
  whyImportant?: string;  // 3. ¿Por qué era importante?
  howApplied?: string;    // 4. ¿Cómo se aplicó la solución?
  impact: string;         // 5. El impacto (resultado medible / fórmula XYZ)
  description?: string;   // 7. Detalle o Descripción: espacio amplio para explayarse en todo lo que se hizo
  
  tags: string[];
  isPublic: boolean; // Default false (Sandbox). If true, appears in Public Deck & First Mate
  createdAt: number;
  updatedAt: number;
}

export interface AiUsageRecord {
  monthKey: string; // e.g. "2026-10"
  count: number; // 0 to 3 for Free tier
  lastUsed: number; // timestamp ms for 2-minute cooldown
}

export interface EmploymentSocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  behance?: string; // Behance / Dribbble para Diseñadores y Creativos
  dribbble?: string;
  leetcode?: string;
  wellfound?: string; // AngelList
  stackoverflow?: string;
  techBlog?: string; // Dev.to, Substack, Medium
  twitter?: string; // X / Tech Twitter
  [key: string]: string | undefined;
}

export type SkillCategory = 
  | "Languages" 
  | "Frameworks" 
  | "Cloud/DevOps" 
  | "Architecture"
  | "Herramientas & Canales"
  | "Especialidad & Estrategia"
  | "Diseño & Creatividad"
  | "Metodologías"
  | (string & {});

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
  socialLinks?: EmploymentSocialLinks;
  availabilityStatus?: string;
  skills: { name: string; category: SkillCategory }[];
  authProvider?: "google" | "custom";
  plan?: "free" | "pro"; // Default "free"
  aiUsage?: AiUsageRecord;
  isDemoUser?: boolean;
  isCustom?: boolean;
  createdAt?: number;
}

export interface CustomAccount {
  id: string;
  name: string;
  email: string; // Used as login credential (case-insensitive)
  passwordHash: string; // Base64 encoded password hash
  title: string;
  avatar: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  socialLinks?: EmploymentSocialLinks;
  availabilityStatus?: string;
  skills?: { name: string; category: SkillCategory }[];
  createdAt: number;
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
  whatWasSought?: string;
  whyImportant?: string;
  howApplied?: string;
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

export interface CvContact {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface CvExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  bullets: string[];
  technologies: string[];
  category: LogCategory;
}

export interface CvEducation {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  status?: string;
}

export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
  credentialId?: string;
}

export interface CvProject {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface CvLanguage {
  id: string;
  language: string;
  level: string;
}

export interface ExtractedCvData {
  contact: CvContact;
  summary: string;
  skills: {
    technical: string[];
    frameworks: string[];
    toolsCloud: string[];
    softSkills: string[];
  };
  experiences: CvExperience[];
  education: CvEducation[];
  certifications: CvCertification[];
  projects: CvProject[];
  languages: CvLanguage[];
  rawTextPreview?: string;
}

export interface CvPendingField {
  id: string;
  section: "contact" | "summary" | "skills" | "experiences" | "education" | "certifications" | "projects" | "languages";
  fieldName: string;
  label: string;
  description: string;
  severity: "high" | "medium" | "low";
  suggestedPrompt: string;
}

