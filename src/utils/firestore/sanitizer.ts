import { deleteField, serverTimestamp } from "firebase/firestore";
import {
  AiUsageRecord,
  CareerGoal,
  CareerGoalCategory,
  CareerGoalStatus,
  EmploymentSocialLinks,
  ExtractedCvData,
  JobOffer,
  JobOfferStatus,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../../types";

export const RESERVED_USERNAMES = new Set([
  "admin", "root", "api", "docs", "features", "offers", "public", "quarters",
  "login", "register", "auth", "settings", "terms", "privacy", "help",
  "explore", "user", "users", "u", "p", "deck", "demo", "null", "undefined",
  "goalrecall", "support", "billing", "dashboard", "app",
]);

const SOCIAL_LINK_KEYS: (keyof EmploymentSocialLinks)[] = [
  "linkedin",
  "github",
  "portfolio",
  "behance",
  "dribbble",
  "leetcode",
  "wellfound",
  "stackoverflow",
  "techBlog",
  "twitter",
];

const VALID_GOAL_CATEGORIES = new Set<CareerGoalCategory>([
  "certification",
  "study",
  "academic",
  "target_company",
  "role_elevation",
  "open_source",
]);

const VALID_GOAL_STATUSES = new Set<CareerGoalStatus>([
  "backlog",
  "in_progress",
  "achieved",
]);

const VALID_OFFER_MODALITIES = new Set(["100% Remoto", "Híbrido", "Presencial"]);
const VALID_CONTRACT_TYPES = new Set([
  "B2B / Contractor",
  "Dependencia Directa",
  "Freelance",
  "Indefinido",
]);
const VALID_OFFER_STATUSES = new Set<JobOfferStatus>([
  "saved",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "accepted",
]);

const VALID_INBOX_SOURCES = new Set([
  "visitor_message",
  "git_pr",
  "gitlab_mr",
  "jira_issue",
]);

export function clampString(value: unknown, maxLen: number, fallback = ""): string {
  const str = typeof value === "string" ? value : value == null ? fallback : String(value);
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

export function nonEmptyString(value: unknown, maxLen: number, fallback: string): string {
  const trimmed = clampString(value, maxLen).trim();
  return trimmed.length > 0 ? trimmed : fallback.slice(0, maxLen);
}

export function sanitizeDocId(rawId: unknown, prefix = "doc"): string {
  const cleaned = (typeof rawId === "string" ? rawId : "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 128);
  if (cleaned.length >= 1) return cleaned;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.slice(0, 128);
}

export function sanitizeUsernameHandle(raw: unknown): string {
  return (typeof raw === "string" ? raw : "")
    .toLowerCase()
    .trim()
    .replace(/^u\//, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);
}

export function generateDefaultUsernameHandle(name: string, email?: string): string {
  let candidate = "";
  if (email && email.includes("@")) {
    candidate = sanitizeUsernameHandle(email.split("@")[0]);
  }
  if (!candidate || candidate.length < 3 || RESERVED_USERNAMES.has(candidate)) {
    candidate = sanitizeUsernameHandle(name);
  }
  if (!candidate || candidate.length < 3 || RESERVED_USERNAMES.has(candidate)) {
    candidate = `user_${Math.random().toString(36).slice(2, 7)}`;
  }
  return candidate.slice(0, 30);
}

export function isValidUsernameHandle(handle: string): boolean {
  return (
    handle.length >= 3 &&
    handle.length <= 30 &&
    /^[a-z0-9_-]+$/.test(handle) &&
    !RESERVED_USERNAMES.has(handle)
  );
}

export function stripUndefinedDeep<T>(input: T): T {
  if (Array.isArray(input)) {
    return input
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (input && typeof input === "object" && !(input instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return input;
}

export function sanitizeBoundedStringList(values: unknown, maxItems: number, maxItemLen = 200): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((v) => v !== null && v !== undefined && String(v).trim().length > 0)
    .slice(0, maxItems)
    .map((v) => clampString(String(v).trim(), maxItemLen));
}

export function sanitizeSocialLinks(links?: EmploymentSocialLinks): EmploymentSocialLinks {
  const clean: EmploymentSocialLinks = {};
  if (!links) return clean;
  for (const key of SOCIAL_LINK_KEYS) {
    const val = links[key];
    if (typeof val === "string") {
      clean[key] = clampString(val.trim(), 500);
    }
  }
  return clean;
}

export function sanitizeUserSkills(
  skills: unknown
): { name: string; category: string }[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .filter((item) => item && typeof item === "object")
    .slice(0, 40)
    .map((item) => {
      const rec = item as { name?: unknown; category?: unknown };
      return {
        name: nonEmptyString(rec.name, 100, "Skill"),
        category: nonEmptyString(rec.category, 80, "Languages"),
      };
    });
}

export function timestampToMillis(value: unknown, fallback = Date.now()): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object") {
    const maybeTs = value as { toMillis?: () => number; seconds?: number };
    if (typeof maybeTs.toMillis === "function") return maybeTs.toMillis();
    if (typeof maybeTs.seconds === "number") return maybeTs.seconds * 1000;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function timestampToIso(value: unknown, fallback = new Date().toISOString()): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  const ms = timestampToMillis(value, NaN);
  if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  return fallback;
}

// ---------------------------------------------------------------------------
// 1. UserProfile (/users/{uid})
// ---------------------------------------------------------------------------
function buildUserProfileBase(profile: Partial<UserProfile>, uid: string) {
  const email = nonEmptyString(profile.email, 254, "usuario@goalrecall.app");
  const name = nonEmptyString(profile.name, 150, "Profesional Técnico");
  const candidateHandle = sanitizeUsernameHandle(profile.username);

  const payload: Record<string, unknown> = {
    name,
    email,
    avatar: clampString(profile.avatar, 150000),
    title: clampString(profile.title, 200),
    bio: clampString(profile.bio, 4000),
    location: clampString(profile.location, 200),
    skills: sanitizeUserSkills(profile.skills),
  };

  if (isValidUsernameHandle(candidateHandle)) {
    payload.username = candidateHandle;
  }
  if (typeof profile.github === "string") {
    payload.github = clampString(profile.github, 500);
  }
  if (typeof profile.linkedin === "string") {
    payload.linkedin = clampString(profile.linkedin, 500);
  }
  if (profile.socialLinks && typeof profile.socialLinks === "object") {
    payload.socialLinks = sanitizeSocialLinks(profile.socialLinks);
  }
  if (typeof profile.availabilityStatus === "string") {
    payload.availabilityStatus = clampString(profile.availabilityStatus, 160);
  }

  return { payload, uid };
}

export function buildUserProfileCreatePayload(profile: Partial<UserProfile>, uid: string) {
  const { payload } = buildUserProfileBase(profile, uid);
  return {
    id: uid,
    ...payload,
    authProvider: "google" as const,
    plan: "free" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildUserProfileUpdatePayload(profile: Partial<UserProfile>, uid: string) {
  const { payload } = buildUserProfileBase(profile, uid);
  return {
    ...payload,
    updatedAt: serverTimestamp(),
  };
}

export function docToUserProfile(raw: Record<string, unknown>, uid: string): UserProfile {
  return {
    id: uid,
    username: typeof raw.username === "string" ? raw.username : undefined,
    name: nonEmptyString(raw.name, 150, "Profesional Técnico"),
    email: clampString(raw.email, 254),
    avatar: clampString(raw.avatar, 150000),
    title: clampString(raw.title, 200),
    bio: clampString(raw.bio, 4000),
    location: clampString(raw.location, 200),
    github: typeof raw.github === "string" ? raw.github : undefined,
    linkedin: typeof raw.linkedin === "string" ? raw.linkedin : undefined,
    socialLinks:
      raw.socialLinks && typeof raw.socialLinks === "object"
        ? (raw.socialLinks as EmploymentSocialLinks)
        : undefined,
    availabilityStatus:
      typeof raw.availabilityStatus === "string" ? raw.availabilityStatus : undefined,
    skills: Array.isArray(raw.skills)
      ? (raw.skills as { name: string; category: string }[])
      : [],
    authProvider: "google",
    plan: raw.plan === "pro" ? "pro" : "free",
    createdAt: timestampToMillis(raw.createdAt),
  };
}

// ---------------------------------------------------------------------------
// 2. StoredCv (/users/{uid}/cv/current)
// ---------------------------------------------------------------------------
function buildStoredCvFields(cv: ExtractedCvData) {
  const contact = {
    name: clampString(cv.contact?.name, 160),
    headline: clampString(cv.contact?.headline, 240),
    email: clampString(cv.contact?.email, 254),
    phone: clampString(cv.contact?.phone, 60),
    location: clampString(cv.contact?.location, 200),
    linkedin: clampString(cv.contact?.linkedin, 500),
    github: clampString(cv.contact?.github, 500),
    portfolio: clampString(cv.contact?.portfolio, 500),
  };

  const skills = {
    technical: sanitizeBoundedStringList(cv.skills?.technical, 80, 120),
    frameworks: sanitizeBoundedStringList(cv.skills?.frameworks, 80, 120),
    toolsCloud: sanitizeBoundedStringList(cv.skills?.toolsCloud, 80, 120),
    softSkills: sanitizeBoundedStringList(cv.skills?.softSkills, 80, 120),
  };

  const experiences = (Array.isArray(cv.experiences) ? cv.experiences : [])
    .slice(0, 50)
    .map((exp, idx) =>
      stripUndefinedDeep({
        id: sanitizeDocId(exp.id, `cvexp_${idx}`),
        company: nonEmptyString(exp.company, 200, "Empresa"),
        role: nonEmptyString(exp.role, 200, "Rol"),
        location: typeof exp.location === "string" ? clampString(exp.location, 200) : "",
        startDate: typeof exp.startDate === "string" ? clampString(exp.startDate, 40) : "",
        endDate: typeof exp.endDate === "string" ? clampString(exp.endDate, 40) : "",
        isCurrent: Boolean(exp.isCurrent),
        description: typeof exp.description === "string" ? clampString(exp.description, 4000) : "",
        bullets: sanitizeBoundedStringList(exp.bullets, 60, 2000),
        technologies: sanitizeBoundedStringList(exp.technologies, 50, 200),
        category: nonEmptyString(exp.category, 120, "Feature ✨"),
      })
    );

  const education = (Array.isArray(cv.education) ? cv.education : [])
    .slice(0, 30)
    .map((edu, idx) =>
      stripUndefinedDeep({
        id: sanitizeDocId(edu.id, `cvedu_${idx}`),
        degree: clampString(edu.degree, 240),
        institution: clampString(edu.institution, 240),
        year: typeof edu.year === "string" ? clampString(edu.year, 40) : "",
        status: typeof edu.status === "string" ? clampString(edu.status, 80) : "",
      })
    );

  const certifications = (Array.isArray(cv.certifications) ? cv.certifications : [])
    .slice(0, 50)
    .map((cert, idx) =>
      stripUndefinedDeep({
        id: sanitizeDocId(cert.id, `cvcert_${idx}`),
        name: clampString(cert.name, 240),
        issuer: clampString(cert.issuer, 200),
        year: typeof cert.year === "string" ? clampString(cert.year, 40) : "",
        credentialId:
          typeof cert.credentialId === "string" ? clampString(cert.credentialId, 160) : "",
      })
    );

  const projects = (Array.isArray(cv.projects) ? cv.projects : [])
    .slice(0, 40)
    .map((proj, idx) =>
      stripUndefinedDeep({
        id: sanitizeDocId(proj.id, `cvproj_${idx}`),
        name: clampString(proj.name, 200),
        role: typeof proj.role === "string" ? clampString(proj.role, 160) : "",
        description: clampString(proj.description, 3000),
        technologies: sanitizeBoundedStringList(proj.technologies, 40, 120),
        url: typeof proj.url === "string" ? clampString(proj.url, 500) : "",
      })
    );

  const languages = (Array.isArray(cv.languages) ? cv.languages : [])
    .slice(0, 20)
    .map((lang, idx) =>
      stripUndefinedDeep({
        id: sanitizeDocId(lang.id, `cvlang_${idx}`),
        language: clampString(lang.language, 100),
        level: clampString(lang.level, 100),
      })
    );

  const out: Record<string, unknown> = {
    contact,
    summary: clampString(cv.summary, 8000),
    skills,
    experiences,
    education,
    certifications,
    projects,
    languages,
  };

  if (typeof cv.rawTextPreview === "string") {
    out.rawTextPreview = clampString(cv.rawTextPreview, 1500);
  }

  return out;
}

export function buildStoredCvCreatePayload(cv: ExtractedCvData, uid: string, cvDocId = "current") {
  return {
    id: cvDocId,
    userId: uid,
    ...buildStoredCvFields(cv),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildStoredCvUpdatePayload(cv: ExtractedCvData) {
  return {
    ...buildStoredCvFields(cv),
    updatedAt: serverTimestamp(),
  };
}

export function docToStoredCv(raw: Record<string, unknown>): ExtractedCvData {
  const contactRaw = (raw.contact || {}) as Record<string, unknown>;
  const skillsRaw = (raw.skills || {}) as Record<string, unknown>;
  return {
    contact: {
      name: clampString(contactRaw.name, 160),
      headline: clampString(contactRaw.headline, 240),
      email: clampString(contactRaw.email, 254),
      phone: clampString(contactRaw.phone, 60),
      location: clampString(contactRaw.location, 200),
      linkedin: clampString(contactRaw.linkedin, 500),
      github: clampString(contactRaw.github, 500),
      portfolio: clampString(contactRaw.portfolio, 500),
    },
    summary: clampString(raw.summary, 8000),
    skills: {
      technical: sanitizeBoundedStringList(skillsRaw.technical, 80, 120),
      frameworks: sanitizeBoundedStringList(skillsRaw.frameworks, 80, 120),
      toolsCloud: sanitizeBoundedStringList(skillsRaw.toolsCloud, 80, 120),
      softSkills: sanitizeBoundedStringList(skillsRaw.softSkills, 80, 120),
    },
    experiences: Array.isArray(raw.experiences) ? (raw.experiences as ExtractedCvData["experiences"]) : [],
    education: Array.isArray(raw.education) ? (raw.education as ExtractedCvData["education"]) : [],
    certifications: Array.isArray(raw.certifications)
      ? (raw.certifications as ExtractedCvData["certifications"])
      : [],
    projects: Array.isArray(raw.projects) ? (raw.projects as ExtractedCvData["projects"]) : [],
    languages: Array.isArray(raw.languages) ? (raw.languages as ExtractedCvData["languages"]) : [],
    rawTextPreview: typeof raw.rawTextPreview === "string" ? raw.rawTextPreview : undefined,
  };
}

// ---------------------------------------------------------------------------
// 3. LogEntry (/users/{uid}/logs/{logId})
// ---------------------------------------------------------------------------
function buildLogFields(entry: Partial<LogEntry>) {
  const title = nonEmptyString(entry.title, 2000, "Logro registrado");
  const impact = nonEmptyString(entry.impact, 3000, title);
  const dateStr = nonEmptyString(
    entry.date,
    32,
    new Date().toISOString().substring(0, 10)
  );
  const ensuredDate = dateStr.length >= 4 ? dateStr : new Date().toISOString().substring(0, 10);

  const out: Record<string, unknown> = {
    date: ensuredDate,
    client: nonEmptyString(entry.client, 200, "General"),
    project: nonEmptyString(entry.project, 200, "General"),
    category: nonEmptyString(entry.category, 120, "Feature ✨"),
    title,
    impact,
    tags: sanitizeBoundedStringList(entry.tags, 25, 200),
    isPublic: Boolean(entry.isPublic),
  };

  if (typeof entry.includeInCv === "boolean") {
    out.includeInCv = entry.includeInCv;
  }
  if (typeof entry.sortOrder === "number" && Number.isFinite(entry.sortOrder)) {
    out.sortOrder = Math.max(0, Math.min(100000, Math.trunc(entry.sortOrder)));
  }
  if (typeof entry.experienceId === "string") {
    out.experienceId = clampString(entry.experienceId, 128);
  }
  if (typeof entry.originalBullet === "string") {
    out.originalBullet = clampString(entry.originalBullet, 2000);
  }
  if (typeof entry.logro === "string") {
    out.logro = clampString(entry.logro, 2000);
  }
  if (typeof entry.whatWasSought === "string") {
    out.whatWasSought = clampString(entry.whatWasSought, 4000);
  }
  if (typeof entry.whyImportant === "string") {
    out.whyImportant = clampString(entry.whyImportant, 4000);
  }
  if (typeof entry.howApplied === "string") {
    out.howApplied = clampString(entry.howApplied, 4000);
  }
  if (typeof entry.description === "string") {
    out.description = clampString(entry.description, 10000);
  }

  return out;
}

export function buildLogEntryCreatePayload(
  entry: Partial<LogEntry>,
  uid: string,
  logId: string
) {
  return {
    id: logId,
    userId: uid,
    ...buildLogFields(entry),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildLogEntryUpdatePayload(entry: Partial<LogEntry>) {
  return {
    ...buildLogFields(entry),
    updatedAt: serverTimestamp(),
  };
}

export function docToLogEntry(raw: Record<string, unknown>, id: string): LogEntry {
  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    experienceId: typeof raw.experienceId === "string" ? raw.experienceId : undefined,
    originalBullet: typeof raw.originalBullet === "string" ? raw.originalBullet : undefined,
    date: nonEmptyString(raw.date, 32, new Date().toISOString().substring(0, 10)),
    client: nonEmptyString(raw.client, 200, "General"),
    project: nonEmptyString(raw.project, 200, "General"),
    category: nonEmptyString(raw.category, 120, "Feature ✨"),
    title: nonEmptyString(raw.title, 2000, "Logro"),
    logro: typeof raw.logro === "string" ? raw.logro : undefined,
    includeInCv: typeof raw.includeInCv === "boolean" ? raw.includeInCv : undefined,
    whatWasSought: typeof raw.whatWasSought === "string" ? raw.whatWasSought : undefined,
    whyImportant: typeof raw.whyImportant === "string" ? raw.whyImportant : undefined,
    howApplied: typeof raw.howApplied === "string" ? raw.howApplied : undefined,
    impact: nonEmptyString(raw.impact, 3000, nonEmptyString(raw.title, 2000, "Impacto")),
    description: typeof raw.description === "string" ? raw.description : undefined,
    tags: sanitizeBoundedStringList(raw.tags, 25, 200),
    isPublic: Boolean(raw.isPublic),
    sortOrder:
      typeof raw.sortOrder === "number" && Number.isFinite(raw.sortOrder)
        ? Math.max(0, Math.min(100000, Math.trunc(raw.sortOrder)))
        : undefined,
    createdAt: timestampToMillis(raw.createdAt),
    updatedAt: timestampToMillis(raw.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// 4. WorkExperience (/users/{uid}/experiences/{expId})
// ---------------------------------------------------------------------------
function buildWorkExperienceFields(exp: Partial<WorkExperience>) {
  const out: Record<string, unknown> = {
    company: nonEmptyString(exp.company, 200, "Empresa"),
    role: nonEmptyString(exp.role, 200, "Rol Profesional"),
    startDate: clampString(exp.startDate, 40),
  };

  if (typeof exp.endDate === "string") {
    out.endDate = clampString(exp.endDate, 40);
  }
  if (typeof exp.isCurrent === "boolean") {
    out.isCurrent = exp.isCurrent;
  }
  if (typeof exp.location === "string") {
    out.location = clampString(exp.location, 200);
  }
  if (typeof exp.summary === "string") {
    out.summary = clampString(exp.summary, 5000);
  }
  if (Array.isArray(exp.bullets)) {
    out.bullets = sanitizeBoundedStringList(exp.bullets, 60, 2000);
  }
  if (Array.isArray(exp.technologies)) {
    out.technologies = sanitizeBoundedStringList(exp.technologies, 50, 200);
  }
  if (typeof exp.isPersonalProjects === "boolean") {
    out.isPersonalProjects = exp.isPersonalProjects;
  }

  return out;
}

export function buildWorkExperienceCreatePayload(
  exp: Partial<WorkExperience>,
  uid: string,
  expId: string
) {
  return {
    id: expId,
    userId: uid,
    ...buildWorkExperienceFields(exp),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildWorkExperienceUpdatePayload(exp: Partial<WorkExperience>) {
  return {
    ...buildWorkExperienceFields(exp),
    updatedAt: serverTimestamp(),
  };
}

export function docToWorkExperience(raw: Record<string, unknown>, id: string): WorkExperience {
  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    company: nonEmptyString(raw.company, 200, "Empresa"),
    role: nonEmptyString(raw.role, 200, "Rol"),
    startDate: clampString(raw.startDate, 40),
    endDate: typeof raw.endDate === "string" ? raw.endDate : undefined,
    isCurrent: typeof raw.isCurrent === "boolean" ? raw.isCurrent : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    summary: typeof raw.summary === "string" ? raw.summary : undefined,
    bullets: Array.isArray(raw.bullets)
      ? sanitizeBoundedStringList(raw.bullets, 60, 2000)
      : undefined,
    technologies: Array.isArray(raw.technologies)
      ? sanitizeBoundedStringList(raw.technologies, 50, 200)
      : undefined,
    isPersonalProjects:
      typeof raw.isPersonalProjects === "boolean" ? raw.isPersonalProjects : undefined,
    createdAt: timestampToMillis(raw.createdAt),
    updatedAt: timestampToMillis(raw.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// 5. Product (/users/{uid}/products/{productId})
// ---------------------------------------------------------------------------
function buildProductFields(product: Partial<Product>) {
  const title = nonEmptyString(product.title, 160, "Proyecto");
  const tagline = nonEmptyString(product.tagline, 300, title);

  const out: Record<string, unknown> = {
    title,
    tagline,
    description: clampString(product.description, 5000),
    imageUrl: clampString(product.imageUrl, 300000),
    techStack: sanitizeBoundedStringList(product.techStack, 30, 200),
    isPublic: product.isPublic ?? true,
  };

  if (typeof product.liveUrl === "string") {
    out.liveUrl = clampString(product.liveUrl, 1000);
  }
  if (typeof product.repoUrl === "string") {
    out.repoUrl = clampString(product.repoUrl, 1000);
  }
  if (typeof product.badge === "string") {
    out.badge = clampString(product.badge, 80);
  }
  if (Array.isArray(product.relatedAchievementIds)) {
    out.relatedAchievementIds = sanitizeBoundedStringList(
      product.relatedAchievementIds,
      50,
      128
    );
  }

  return out;
}

export function buildProductCreatePayload(
  product: Partial<Product>,
  uid: string,
  productId: string
) {
  return {
    id: productId,
    userId: uid,
    ...buildProductFields(product),
    createdAtIso: nonEmptyString(product.createdAt, 64, new Date().toISOString()),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildProductUpdatePayload(product: Partial<Product>) {
  // Note: firestore.rules does NOT allow createdAtIso inside update affectedKeys()
  return {
    ...buildProductFields(product),
    updatedAt: serverTimestamp(),
  };
}

export function docToProduct(raw: Record<string, unknown>, id: string): Product {
  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : "",
    title: nonEmptyString(raw.title, 160, "Proyecto"),
    tagline: nonEmptyString(raw.tagline, 300, "Proyecto técnico"),
    description: clampString(raw.description, 5000),
    imageUrl: clampString(raw.imageUrl, 300000),
    liveUrl: typeof raw.liveUrl === "string" ? raw.liveUrl : undefined,
    repoUrl: typeof raw.repoUrl === "string" ? raw.repoUrl : undefined,
    techStack: sanitizeBoundedStringList(raw.techStack, 30, 200),
    isPublic: raw.isPublic !== false,
    createdAt:
      typeof raw.createdAtIso === "string" && raw.createdAtIso.length > 0
        ? raw.createdAtIso
        : timestampToIso(raw.createdAt),
    updatedAt: raw.updatedAt ? timestampToIso(raw.updatedAt) : undefined,
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
    relatedAchievementIds: Array.isArray(raw.relatedAchievementIds)
      ? sanitizeBoundedStringList(raw.relatedAchievementIds, 50, 128)
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// 6. TechnicalCertification (/users/{uid}/certifications/{certId})
// ---------------------------------------------------------------------------
function buildCertificationFields(cert: Partial<TechnicalCertification>) {
  const issueDateRaw = nonEmptyString(
    cert.issueDate,
    32,
    new Date().toISOString().substring(0, 7)
  );
  const issueDate =
    issueDateRaw.length >= 4 ? issueDateRaw : new Date().toISOString().substring(0, 7);

  const out: Record<string, unknown> = {
    name: nonEmptyString(cert.name, 240, "Certificación"),
    issuer: nonEmptyString(cert.issuer, 200, "Institución"),
    issueDate,
    skills: sanitizeBoundedStringList(cert.skills, 30, 200),
    isPublic: cert.isPublic ?? true,
  };

  if (typeof cert.expirationDate === "string") {
    out.expirationDate = clampString(cert.expirationDate, 32);
  }
  if (typeof cert.credentialId === "string") {
    out.credentialId = clampString(cert.credentialId, 160);
  }
  if (typeof cert.credentialUrl === "string") {
    out.credentialUrl = clampString(cert.credentialUrl, 1000);
  }
  if (typeof cert.badgeImage === "string") {
    out.badgeImage = clampString(cert.badgeImage, 200000);
  }
  if (typeof cert.summary === "string") {
    out.summary = clampString(cert.summary, 3000);
  }

  return out;
}

export function buildCertificationCreatePayload(
  cert: Partial<TechnicalCertification>,
  uid: string,
  certId: string
) {
  return {
    id: certId,
    userId: uid,
    ...buildCertificationFields(cert),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildCertificationUpdatePayload(cert: Partial<TechnicalCertification>) {
  return {
    ...buildCertificationFields(cert),
    updatedAt: serverTimestamp(),
  };
}

export function docToCertification(
  raw: Record<string, unknown>,
  id: string
): TechnicalCertification {
  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    name: nonEmptyString(raw.name, 240, "Certificación"),
    issuer: nonEmptyString(raw.issuer, 200, "Institución"),
    issueDate: nonEmptyString(raw.issueDate, 32, new Date().toISOString().substring(0, 7)),
    expirationDate:
      typeof raw.expirationDate === "string" && raw.expirationDate.length > 0
        ? raw.expirationDate
        : undefined,
    credentialId:
      typeof raw.credentialId === "string" && raw.credentialId.length > 0
        ? raw.credentialId
        : undefined,
    credentialUrl:
      typeof raw.credentialUrl === "string" && raw.credentialUrl.length > 0
        ? raw.credentialUrl
        : undefined,
    skills: sanitizeBoundedStringList(raw.skills, 30, 200),
    badgeImage:
      typeof raw.badgeImage === "string" && raw.badgeImage.length > 0
        ? raw.badgeImage
        : undefined,
    summary:
      typeof raw.summary === "string" && raw.summary.length > 0 ? raw.summary : undefined,
    isPublic: raw.isPublic !== false,
    createdAt: timestampToMillis(raw.createdAt),
    updatedAt: timestampToMillis(raw.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// 7. CareerGoal (/users/{uid}/careerGoals/{goalId})
// ---------------------------------------------------------------------------
function buildCareerGoalFields(goal: Partial<CareerGoal>, forUpdate: boolean) {
  const category = VALID_GOAL_CATEGORIES.has(goal.category as CareerGoalCategory)
    ? (goal.category as CareerGoalCategory)
    : "study";
  const status = VALID_GOAL_STATUSES.has(goal.status as CareerGoalStatus)
    ? (goal.status as CareerGoalStatus)
    : "backlog";

  const actionItems = (Array.isArray(goal.actionItems) ? goal.actionItems : [])
    .filter((item) => item && typeof item === "object")
    .slice(0, 40)
    .map((item, idx) => ({
      id: sanitizeDocId(item.id, `step_${idx}`),
      text: clampString(item.text, 400),
      done: Boolean(item.done),
    }));

  const out: Record<string, unknown> = {
    title: nonEmptyString(goal.title, 240, "Meta de carrera"),
    category,
    status,
    actionItems,
  };

  if (typeof goal.targetDate === "string") {
    out.targetDate = clampString(goal.targetDate, 40);
  }
  if (typeof goal.whyImportant === "string") {
    out.whyImportant = clampString(goal.whyImportant, 3000);
  }
  if (typeof goal.notes === "string") {
    out.notes = clampString(goal.notes, 5000);
  }
  if (typeof goal.linkedCertificationId === "string") {
    out.linkedCertificationId = clampString(goal.linkedCertificationId, 128);
  }

  if (status === "achieved") {
    out.achievedDate = clampString(
      goal.achievedDate || new Date().toISOString().substring(0, 10),
      40
    );
  } else if (typeof goal.achievedDate === "string" && goal.achievedDate.trim().length > 0 && status === "in_progress") {
    out.achievedDate = clampString(goal.achievedDate, 40);
  } else if (forUpdate) {
    out.achievedDate = deleteField();
  }

  return out;
}

export function buildCareerGoalCreatePayload(
  goal: Partial<CareerGoal>,
  uid: string,
  goalId: string
) {
  return {
    id: goalId,
    userId: uid,
    ...buildCareerGoalFields(goal, false),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildCareerGoalUpdatePayload(goal: Partial<CareerGoal>) {
  return {
    ...buildCareerGoalFields(goal, true),
    updatedAt: serverTimestamp(),
  };
}

export function docToCareerGoal(raw: Record<string, unknown>, id: string): CareerGoal {
  const category = VALID_GOAL_CATEGORIES.has(raw.category as CareerGoalCategory)
    ? (raw.category as CareerGoalCategory)
    : "study";
  const status = VALID_GOAL_STATUSES.has(raw.status as CareerGoalStatus)
    ? (raw.status as CareerGoalStatus)
    : "backlog";

  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    title: nonEmptyString(raw.title, 240, "Meta de carrera"),
    category,
    targetDate:
      typeof raw.targetDate === "string" && raw.targetDate.length > 0 ? raw.targetDate : undefined,
    status,
    whyImportant:
      typeof raw.whyImportant === "string" && raw.whyImportant.length > 0
        ? raw.whyImportant
        : undefined,
    actionItems: Array.isArray(raw.actionItems)
      ? (raw.actionItems as CareerGoal["actionItems"])
      : [],
    notes: typeof raw.notes === "string" && raw.notes.length > 0 ? raw.notes : undefined,
    achievedDate:
      typeof raw.achievedDate === "string" && raw.achievedDate.length > 0
        ? raw.achievedDate
        : undefined,
    linkedCertificationId:
      typeof raw.linkedCertificationId === "string" && raw.linkedCertificationId.length > 0
        ? raw.linkedCertificationId
        : undefined,
    createdAt: timestampToMillis(raw.createdAt),
    updatedAt: timestampToMillis(raw.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// 8. JobOffer (/users/{uid}/offers/{offerId})
// ---------------------------------------------------------------------------
function buildJobOfferFields(offer: Partial<JobOffer>) {
  const modality = VALID_OFFER_MODALITIES.has(String(offer.modality))
    ? (offer.modality as JobOffer["modality"])
    : "100% Remoto";
  const contractType = VALID_CONTRACT_TYPES.has(String(offer.contractType))
    ? (offer.contractType as JobOffer["contractType"])
    : "B2B / Contractor";
  const status = VALID_OFFER_STATUSES.has(offer.status as JobOfferStatus)
    ? (offer.status as JobOfferStatus)
    : "saved";

  const out: Record<string, unknown> = {
    company: nonEmptyString(offer.company, 200, "Empresa"),
    role: nonEmptyString(offer.role, 200, "Rol"),
    description: clampString(offer.description, 20000),
    modality,
    contractType,
    status,
  };

  if (typeof offer.url === "string") out.url = clampString(offer.url, 1000);
  if (typeof offer.location === "string") out.location = clampString(offer.location, 200);
  if (offer.salaryExpectation && typeof offer.salaryExpectation === "object") {
    out.salaryExpectation = stripUndefinedDeep(offer.salaryExpectation);
  }
  if (typeof offer.extraConditions === "string") {
    out.extraConditions = clampString(offer.extraConditions, 3000);
  }
  if (offer.atsAnalysis && typeof offer.atsAnalysis === "object") {
    out.atsAnalysis = stripUndefinedDeep(offer.atsAnalysis);
  }
  if (offer.tailoredCv && typeof offer.tailoredCv === "object") {
    out.tailoredCv = stripUndefinedDeep(offer.tailoredCv);
  }
  if (offer.interviewPrep && typeof offer.interviewPrep === "object") {
    out.interviewPrep = stripUndefinedDeep(offer.interviewPrep);
  }
  if (typeof offer.appliedDate === "string") {
    out.appliedDate = clampString(offer.appliedDate, 40);
  }
  if (typeof offer.notes === "string") {
    out.notes = clampString(offer.notes, 6000);
  }

  return out;
}

export function buildJobOfferCreatePayload(
  offer: Partial<JobOffer>,
  uid: string,
  offerId: string
) {
  return {
    id: offerId,
    userId: uid,
    ...buildJobOfferFields(offer),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildJobOfferUpdatePayload(offer: Partial<JobOffer>) {
  return {
    ...buildJobOfferFields(offer),
    updatedAt: serverTimestamp(),
  };
}

export function docToJobOffer(raw: Record<string, unknown>, id: string): JobOffer {
  const modality = VALID_OFFER_MODALITIES.has(String(raw.modality))
    ? (raw.modality as JobOffer["modality"])
    : "100% Remoto";
  const contractType = VALID_CONTRACT_TYPES.has(String(raw.contractType))
    ? (raw.contractType as JobOffer["contractType"])
    : "B2B / Contractor";
  const status = VALID_OFFER_STATUSES.has(raw.status as JobOfferStatus)
    ? (raw.status as JobOfferStatus)
    : "saved";

  return {
    id,
    userId: typeof raw.userId === "string" ? raw.userId : undefined,
    company: nonEmptyString(raw.company, 200, "Empresa"),
    role: nonEmptyString(raw.role, 200, "Rol"),
    description: clampString(raw.description, 20000),
    url: typeof raw.url === "string" ? raw.url : undefined,
    location: typeof raw.location === "string" ? raw.location : undefined,
    modality,
    contractType,
    salaryExpectation:
      raw.salaryExpectation && typeof raw.salaryExpectation === "object"
        ? (raw.salaryExpectation as JobOffer["salaryExpectation"])
        : undefined,
    extraConditions:
      typeof raw.extraConditions === "string" ? raw.extraConditions : undefined,
    status,
    atsAnalysis:
      raw.atsAnalysis && typeof raw.atsAnalysis === "object"
        ? (raw.atsAnalysis as JobOffer["atsAnalysis"])
        : undefined,
    tailoredCv:
      raw.tailoredCv && typeof raw.tailoredCv === "object"
        ? (raw.tailoredCv as JobOffer["tailoredCv"])
        : undefined,
    interviewPrep:
      raw.interviewPrep && typeof raw.interviewPrep === "object"
        ? (raw.interviewPrep as JobOffer["interviewPrep"])
        : undefined,
    appliedDate: typeof raw.appliedDate === "string" ? raw.appliedDate : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    createdAt: timestampToMillis(raw.createdAt),
    updatedAt: timestampToMillis(raw.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// 9. InboxMessage (/users/{uid}/inbox/{messageId})
// ---------------------------------------------------------------------------
export function buildInboxMessageCreatePayload(
  msg: Partial<VisitorMessage>,
  uid: string,
  messageId: string
) {
  const dateStr = nonEmptyString(
    msg.date,
    40,
    new Date().toISOString().replace("T", " ").substring(0, 16)
  );
  const ensuredDate =
    dateStr.length >= 4
      ? dateStr
      : new Date().toISOString().replace("T", " ").substring(0, 16);

  const out: Record<string, unknown> = {
    id: messageId,
    userId: uid,
    name: nonEmptyString(msg.name, 160, "Contacto"),
    email: clampString(msg.email, 254),
    message: nonEmptyString(msg.message, 8000, "Sin contenido"),
    date: ensuredDate,
    read: Boolean(msg.read),
    replied: Boolean(msg.replied),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (typeof msg.organization === "string" && msg.organization.trim().length > 0) {
    out.organization = clampString(msg.organization.trim(), 200);
  }
  if (msg.sourceType && VALID_INBOX_SOURCES.has(msg.sourceType)) {
    out.sourceType = msg.sourceType;
  }
  if (typeof msg.sourceRef === "string" && msg.sourceRef.trim().length > 0) {
    out.sourceRef = clampString(msg.sourceRef.trim(), 300);
  }
  if (typeof msg.sourceUrl === "string" && msg.sourceUrl.trim().length > 0) {
    out.sourceUrl = clampString(msg.sourceUrl.trim(), 1000);
  }
  if (typeof msg.repositoryOrProject === "string" && msg.repositoryOrProject.trim().length > 0) {
    out.repositoryOrProject = clampString(msg.repositoryOrProject.trim(), 200);
  }
  if (msg.achievementDraft && typeof msg.achievementDraft === "object") {
    out.achievementDraft = stripUndefinedDeep(msg.achievementDraft);
  }
  if (typeof msg.convertedLogId === "string" && msg.convertedLogId.trim().length > 0) {
    out.convertedLogId = clampString(msg.convertedLogId.trim(), 128);
  }

  return out;
}

export function buildInboxMessageUpdatePayload(updates: {
  read?: boolean;
  replied?: boolean;
  convertedLogId?: string;
}) {
  const out: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof updates.read === "boolean") out.read = updates.read;
  if (typeof updates.replied === "boolean") out.replied = updates.replied;
  if (typeof updates.convertedLogId === "string") {
    out.convertedLogId = clampString(updates.convertedLogId, 128);
  }
  return out;
}

export function docToInboxMessage(raw: Record<string, unknown>, id: string): VisitorMessage {
  return {
    id,
    name: nonEmptyString(raw.name, 160, "Contacto"),
    email: clampString(raw.email, 254),
    organization:
      typeof raw.organization === "string" && raw.organization.length > 0
        ? raw.organization
        : undefined,
    message: nonEmptyString(raw.message, 8000, "Sin contenido"),
    date: nonEmptyString(
      raw.date,
      40,
      new Date().toISOString().replace("T", " ").substring(0, 16)
    ),
    read: Boolean(raw.read),
    replied: Boolean(raw.replied),
    sourceType: VALID_INBOX_SOURCES.has(String(raw.sourceType))
      ? (raw.sourceType as VisitorMessage["sourceType"])
      : undefined,
    sourceRef: typeof raw.sourceRef === "string" ? raw.sourceRef : undefined,
    sourceUrl: typeof raw.sourceUrl === "string" ? raw.sourceUrl : undefined,
    repositoryOrProject:
      typeof raw.repositoryOrProject === "string" ? raw.repositoryOrProject : undefined,
    achievementDraft:
      raw.achievementDraft && typeof raw.achievementDraft === "object"
        ? (raw.achievementDraft as VisitorMessage["achievementDraft"])
        : undefined,
    convertedLogId: typeof raw.convertedLogId === "string" ? raw.convertedLogId : undefined,
  };
}

// ---------------------------------------------------------------------------
// 10. AiQuota (/users/{uid}/quotas/ai)
// ---------------------------------------------------------------------------
export function buildAiQuotaCreatePayload(record: AiUsageRecord, uid: string, quotaId = "ai") {
  const monthKey = /^\d{4}-\d{2}$/.test(record.monthKey)
    ? record.monthKey
    : new Date().toISOString().substring(0, 7);
  return {
    id: quotaId,
    userId: uid,
    monthKey,
    count: Math.min(10000, Math.max(0, Math.trunc(Number(record.count) || 0))),
    lastUsed: Math.max(0, Math.trunc(Number(record.lastUsed) || 0)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildAiQuotaUpdatePayload(record: AiUsageRecord) {
  const monthKey = /^\d{4}-\d{2}$/.test(record.monthKey)
    ? record.monthKey
    : new Date().toISOString().substring(0, 7);
  return {
    monthKey,
    count: Math.min(10000, Math.max(0, Math.trunc(Number(record.count) || 0))),
    lastUsed: Math.max(0, Math.trunc(Number(record.lastUsed) || 0)),
    updatedAt: serverTimestamp(),
  };
}

export function docToAiQuota(raw: Record<string, unknown>, defaultMonthKey: string): AiUsageRecord {
  const monthKey =
    typeof raw.monthKey === "string" && /^\d{4}-\d{2}$/.test(raw.monthKey)
      ? raw.monthKey
      : defaultMonthKey;
  return {
    monthKey,
    count: Math.min(10000, Math.max(0, Math.trunc(Number(raw.count) || 0))),
    lastUsed: Math.max(0, Math.trunc(Number(raw.lastUsed) || 0)),
  };
}

// ---------------------------------------------------------------------------
// 11. PublicShowcase (/publicShowcases/{username}) — Strictly PII-Free
// ---------------------------------------------------------------------------
export function buildPublicUserProfile(profile: UserProfile, username: string) {
  const socialLinks = sanitizeSocialLinks(profile.socialLinks);
  const out: Record<string, unknown> = {
    id: sanitizeDocId(profile.id, "usr"),
    username,
    name: nonEmptyString(profile.name, 150, "Profesional Técnico"),
    avatar: clampString(profile.avatar, 150000),
    title: clampString(profile.title, 200),
    bio: clampString(profile.bio, 4000),
    location: clampString(profile.location, 200),
    skills: sanitizeUserSkills(profile.skills),
  };

  const github = socialLinks.github || profile.github;
  if (typeof github === "string") {
    out.github = clampString(github, 500);
  }
  const linkedin = socialLinks.linkedin || profile.linkedin;
  if (typeof linkedin === "string") {
    out.linkedin = clampString(linkedin, 500);
  }
  if (Object.keys(socialLinks).length > 0) {
    out.socialLinks = socialLinks;
  }
  if (typeof profile.availabilityStatus === "string") {
    out.availabilityStatus = clampString(profile.availabilityStatus, 160);
  }

  return out;
}

function sanitizePublicLogs(logs: LogEntry[]) {
  return logs
    .filter((l) => l.isPublic === true)
    .slice(0, 150)
    .map((l) =>
      stripUndefinedDeep({
        id: sanitizeDocId(l.id, "log"),
        date: nonEmptyString(l.date, 32, new Date().toISOString().substring(0, 10)),
        client: nonEmptyString(l.client, 200, "General"),
        project: nonEmptyString(l.project, 200, "General"),
        category: nonEmptyString(l.category, 120, "Feature ✨"),
        title: nonEmptyString(l.title, 2000, "Logro"),
        impact: nonEmptyString(l.impact, 3000, nonEmptyString(l.title, 2000, "Impacto")),
        whatWasSought: typeof l.whatWasSought === "string" ? clampString(l.whatWasSought, 4000) : undefined,
        whyImportant: typeof l.whyImportant === "string" ? clampString(l.whyImportant, 4000) : undefined,
        howApplied: typeof l.howApplied === "string" ? clampString(l.howApplied, 4000) : undefined,
        description: typeof l.description === "string" ? clampString(l.description, 6000) : undefined,
        tags: sanitizeBoundedStringList(l.tags, 25, 200),
        isPublic: true,
        createdAt: Number.isFinite(l.createdAt) ? l.createdAt : Date.now(),
        updatedAt: Number.isFinite(l.updatedAt) ? l.updatedAt : Date.now(),
      })
    );
}

function sanitizePublicProducts(products: Product[]) {
  return products
    .filter((p) => p.isPublic !== false)
    .slice(0, 50)
    .map((p) =>
      stripUndefinedDeep({
        id: sanitizeDocId(p.id, "prod"),
        userId: sanitizeDocId(p.userId, "usr"),
        title: nonEmptyString(p.title, 160, "Proyecto"),
        tagline: nonEmptyString(p.tagline, 300, nonEmptyString(p.title, 160, "Proyecto")),
        description: clampString(p.description, 5000),
        imageUrl: clampString(p.imageUrl, 300000),
        liveUrl: typeof p.liveUrl === "string" ? clampString(p.liveUrl, 1000) : undefined,
        repoUrl: typeof p.repoUrl === "string" ? clampString(p.repoUrl, 1000) : undefined,
        techStack: sanitizeBoundedStringList(p.techStack, 30, 200),
        isPublic: true,
        createdAt: nonEmptyString(p.createdAt, 64, new Date().toISOString()),
        badge: typeof p.badge === "string" ? clampString(p.badge, 80) : undefined,
        relatedAchievementIds: Array.isArray(p.relatedAchievementIds)
          ? sanitizeBoundedStringList(p.relatedAchievementIds, 50, 128)
          : undefined,
      })
    );
}

function sanitizePublicCertifications(certs: TechnicalCertification[]) {
  return certs
    .filter((c) => c.isPublic !== false)
    .slice(0, 50)
    .map((c) =>
      stripUndefinedDeep({
        id: sanitizeDocId(c.id, "cert"),
        name: nonEmptyString(c.name, 240, "Certificación"),
        issuer: nonEmptyString(c.issuer, 200, "Institución"),
        issueDate: nonEmptyString(c.issueDate, 32, new Date().toISOString().substring(0, 7)),
        expirationDate: typeof c.expirationDate === "string" ? clampString(c.expirationDate, 32) : undefined,
        credentialId: typeof c.credentialId === "string" ? clampString(c.credentialId, 160) : undefined,
        credentialUrl: typeof c.credentialUrl === "string" ? clampString(c.credentialUrl, 1000) : undefined,
        skills: sanitizeBoundedStringList(c.skills, 30, 200),
        badgeImage: typeof c.badgeImage === "string" ? clampString(c.badgeImage, 200000) : undefined,
        summary: typeof c.summary === "string" ? clampString(c.summary, 3000) : undefined,
        isPublic: true,
        createdAt: Number.isFinite(c.createdAt) ? c.createdAt : Date.now(),
        updatedAt: Number.isFinite(c.updatedAt) ? c.updatedAt : Date.now(),
      })
    );
}

export function buildPublicShowcaseCreatePayload(params: {
  username: string;
  ownerId: string;
  userProfile: UserProfile;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
}) {
  return {
    username: params.username,
    ownerId: params.ownerId,
    userProfile: buildPublicUserProfile(params.userProfile, params.username),
    logs: sanitizePublicLogs(params.logs),
    products: sanitizePublicProducts(params.products),
    certifications: sanitizePublicCertifications(params.certifications),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function buildPublicShowcaseUpdatePayload(params: {
  username: string;
  userProfile: UserProfile;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
}) {
  return {
    userProfile: buildPublicUserProfile(params.userProfile, params.username),
    logs: sanitizePublicLogs(params.logs),
    products: sanitizePublicProducts(params.products),
    certifications: sanitizePublicCertifications(params.certifications),
    updatedAt: serverTimestamp(),
  };
}

// ---------------------------------------------------------------------------
// 12. ProWaitlist (/proWaitlist/{entryId})
// ---------------------------------------------------------------------------
export function buildProWaitlistPayload(entryId: string, uid: string, email: string) {
  return {
    id: entryId,
    userId: uid,
    email: nonEmptyString(email.trim().toLowerCase(), 254, "usuario@goalrecall.app"),
    createdAt: serverTimestamp(),
  };
}
