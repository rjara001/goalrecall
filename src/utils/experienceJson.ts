import { LogCategory, LogEntry, WorkExperience } from "../types";
import {
  cleanLegacyBulletText,
  deriveExperienceBulletsFromLogs,
  doesLogBelongToExperience,
  getExperienceChildLogs,
  inferCategoryForSavedExperienceBullet,
  isLogIncludedInCv,
} from "./bulletToLogMapper";

export const EXPERIENCE_JSON_VERSION = "goalrecall_experience_v1";

export interface ExperienceJsonPayload {
  id?: string;
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  summary?: string;
  bullets?: string[];
  technologies?: string[];
  isPersonalProjects?: boolean;
}

export interface ExperienceJsonLogDraft {
  id?: string;
  originalBullet?: string;
  date?: string;
  client?: string;
  project?: string;
  category?: LogCategory;
  title: string;
  logro?: string;
  includeInCv?: boolean;
  whatWasSought?: string;
  whyImportant?: string;
  howApplied?: string;
  impact?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  sortOrder?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ParsedExperienceJson {
  experience?: ExperienceJsonPayload;
  logs: ExperienceJsonLogDraft[];
}

export const MAX_EXPERIENCE_JSON_CHARS = 512 * 1024;

export interface ReconciledExperienceJsonImport {
  updatedExperience: WorkExperience;
  experienceChanged: boolean;
  hasChanges: boolean;
  contentEditedLogs: LogEntry[];
  metadataOnlyLogs: LogEntry[];
  logsToCreate: Array<Omit<LogEntry, "id" | "createdAt" | "updatedAt">>;
  unchangedCount: number;
}

function stripUndefinedKeys<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

function normalizeStringArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeOptionalString(raw: unknown): string | undefined {
  return typeof raw === "string" ? raw : undefined;
}

function normalizeSortOrder(raw: unknown): number | undefined {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return undefined;
  return Math.max(0, Math.min(100000, Math.trunc(raw)));
}

function normalizeValidDate(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed.length >= 4 && trimmed.length <= 32) {
    return trimmed;
  }
  return undefined;
}

export function buildExperienceExportFilename(
  experience: WorkExperience,
  suffix?: string
): string {
  const rawSlug = (experience.company || "experiencia")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const slug = rawSlug || "experiencia";
  const dateStamp = new Date().toISOString().substring(0, 10);
  const safeSuffix = suffix ? `-${suffix}` : "";
  return `experiencia-${slug}${safeSuffix}-${dateStamp}.json`;
}

export function buildExperienceExportJson(
  experience: WorkExperience,
  allLogs: LogEntry[]
): string {
  const childLogs = getExperienceChildLogs(experience, allLogs);
  const projectedBullets = deriveExperienceBulletsFromLogs(experience, allLogs);
  const bullets =
    projectedBullets.length > 0
      ? projectedBullets
      : Array.isArray(experience.bullets)
        ? experience.bullets
        : [];

  const exportedExperience = stripUndefinedKeys({
    id: experience.id,
    company: experience.company,
    role: experience.role,
    startDate: experience.startDate,
    endDate: experience.endDate,
    isCurrent: experience.isCurrent,
    location: experience.location,
    summary: experience.summary,
    bullets,
    technologies: Array.isArray(experience.technologies) ? experience.technologies : [],
    isPersonalProjects: experience.isPersonalProjects,
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
  });

  const exportedLogs = childLogs.map((log) =>
    stripUndefinedKeys({
      id: log.id,
      experienceId: log.experienceId || experience.id,
      originalBullet: log.originalBullet,
      date: log.date,
      client: log.client,
      project: log.project,
      category: log.category,
      title: log.title,
      logro: log.logro,
      includeInCv: log.includeInCv,
      whatWasSought: log.whatWasSought,
      whyImportant: log.whyImportant,
      howApplied: log.howApplied,
      impact: log.impact,
      description: log.description,
      tags: Array.isArray(log.tags) ? log.tags : [],
      isPublic: Boolean(log.isPublic),
      sortOrder: log.sortOrder,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    })
  );

  return JSON.stringify(
    {
      version: EXPERIENCE_JSON_VERSION,
      exportedAt: new Date().toISOString(),
      experience: exportedExperience,
      logs: exportedLogs,
    },
    null,
    2
  );
}

function parseRawExperienceObject(raw: Record<string, unknown>): ExperienceJsonPayload | undefined {
  const hasExpSignal =
    typeof raw.company === "string" ||
    typeof raw.role === "string" ||
    typeof raw.startDate === "string" ||
    typeof raw.endDate === "string" ||
    typeof raw.location === "string" ||
    typeof raw.summary === "string" ||
    typeof raw.isCurrent === "boolean" ||
    Array.isArray(raw.technologies) ||
    Array.isArray(raw.bullets);

  if (!hasExpSignal) return undefined;

  return stripUndefinedKeys({
    id: typeof raw.id === "string" ? raw.id : undefined,
    company: typeof raw.company === "string" ? raw.company.trim() : undefined,
    role: typeof raw.role === "string" ? raw.role.trim() : undefined,
    startDate: typeof raw.startDate === "string" ? raw.startDate.trim() : undefined,
    endDate: typeof raw.endDate === "string" ? raw.endDate.trim() : undefined,
    isCurrent: typeof raw.isCurrent === "boolean" ? raw.isCurrent : undefined,
    location: normalizeOptionalString(raw.location),
    summary: normalizeOptionalString(raw.summary),
    bullets: normalizeStringArray(raw.bullets),
    technologies: normalizeStringArray(raw.technologies),
    isPersonalProjects:
      typeof raw.isPersonalProjects === "boolean" ? raw.isPersonalProjects : undefined,
  });
}

function parseRawLogDraft(raw: unknown): ExperienceJsonLogDraft | null {
  if (typeof raw === "string") {
    const clean = cleanLegacyBulletText(raw);
    return clean ? { title: clean } : null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  const rawTitle =
    typeof obj.title === "string"
      ? obj.title.trim()
      : typeof obj.logro === "string"
        ? obj.logro.trim()
        : "";
  if (!rawTitle) return null;

  return stripUndefinedKeys({
    id: typeof obj.id === "string" && obj.id.trim() ? obj.id.trim() : undefined,
    originalBullet: normalizeOptionalString(obj.originalBullet),
    date: normalizeValidDate(obj.date),
    client: typeof obj.client === "string" && obj.client.trim() ? obj.client.trim() : undefined,
    project: typeof obj.project === "string" && obj.project.trim() ? obj.project.trim() : undefined,
    category:
      typeof obj.category === "string" && obj.category.trim()
        ? (obj.category.trim() as LogCategory)
        : undefined,
    title: rawTitle,
    logro: typeof obj.logro === "string" && obj.logro.trim() ? obj.logro.trim() : rawTitle,
    includeInCv: typeof obj.includeInCv === "boolean" ? obj.includeInCv : undefined,
    whatWasSought: normalizeOptionalString(obj.whatWasSought),
    whyImportant: normalizeOptionalString(obj.whyImportant),
    howApplied: normalizeOptionalString(obj.howApplied),
    impact: typeof obj.impact === "string" ? obj.impact.trim() : undefined,
    description: normalizeOptionalString(obj.description),
    tags: normalizeStringArray(obj.tags),
    isPublic: typeof obj.isPublic === "boolean" ? obj.isPublic : undefined,
    sortOrder: normalizeSortOrder(obj.sortOrder),
    createdAt: typeof obj.createdAt === "number" ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : undefined,
  });
}

export function parseExperienceJson(
  jsonString: string
): { success: true; data: ParsedExperienceJson } | { success: false; error: string } {
  if (!jsonString || !jsonString.trim()) {
    return { success: false, error: "El archivo JSON está vacío." };
  }

  if (jsonString.length > MAX_EXPERIENCE_JSON_CHARS) {
    return {
      success: false,
      error: "El contenido JSON excede el tamaño máximo permitido (512 KB).",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? `JSON inválido: ${err.message}`
          : "No se pudo analizar el archivo JSON.",
    };
  }

  if (Array.isArray(parsed)) {
    const logs = parsed
      .map(parseRawLogDraft)
      .filter((item): item is ExperienceJsonLogDraft => item !== null);
    if (logs.length === 0) {
      return {
        success: false,
        error: "La lista JSON no contiene logros válidos (cada elemento requiere un campo title o texto).",
      };
    }
    return { success: true, data: { logs } };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      success: false,
      error: "Formato no válido: se esperaba un objeto JSON de experiencia.",
    };
  }

  const root = parsed as Record<string, unknown>;
  const rawExpObj =
    root.experience && typeof root.experience === "object" && !Array.isArray(root.experience)
      ? (root.experience as Record<string, unknown>)
      : root;

  const experience = parseRawExperienceObject(rawExpObj);

  const rawLogsArray = Array.isArray(root.logs)
    ? root.logs
    : root.experience &&
        typeof root.experience === "object" &&
        !Array.isArray(root.experience) &&
        Array.isArray((root.experience as Record<string, unknown>).logs)
      ? ((root.experience as Record<string, unknown>).logs as unknown[])
      : [];

  const logs = rawLogsArray
    .map(parseRawLogDraft)
    .filter((item): item is ExperienceJsonLogDraft => item !== null);

  if (!experience && logs.length === 0) {
    return {
      success: false,
      error:
        "El JSON no contiene datos de experiencia ni logros válidos (esperado: { experience, logs } o { company, role, bullets/logs }).",
    };
  }

  return {
    success: true,
    data: {
      experience,
      logs,
    },
  };
}

function areStringArraysEqual(a: string[] | undefined, b: string[] | undefined): boolean {
  const arrA = a || [];
  const arrB = b || [];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((val, idx) => val === arrB[idx]);
}

function hasLogContentChanged(existing: LogEntry, candidate: LogEntry): boolean {
  return (
    existing.title !== candidate.title ||
    (existing.impact || "") !== (candidate.impact || "") ||
    existing.project !== candidate.project ||
    existing.category !== candidate.category ||
    existing.date !== candidate.date ||
    (existing.whatWasSought || "") !== (candidate.whatWasSought || "") ||
    (existing.whyImportant || "") !== (candidate.whyImportant || "") ||
    (existing.howApplied || "") !== (candidate.howApplied || "") ||
    (existing.description || "") !== (candidate.description || "") ||
    (existing.originalBullet || "") !== (candidate.originalBullet || "") ||
    !areStringArraysEqual(existing.tags, candidate.tags)
  );
}

function hasLogMetadataChanged(existing: LogEntry, candidate: LogEntry): boolean {
  return (
    existing.experienceId !== candidate.experienceId ||
    existing.client !== candidate.client ||
    Boolean(existing.isPublic) !== Boolean(candidate.isPublic) ||
    existing.includeInCv !== candidate.includeInCv ||
    existing.sortOrder !== candidate.sortOrder
  );
}

export function reconcileImportedExperienceJson(
  targetExp: WorkExperience,
  existingAllLogs: LogEntry[],
  parsed: ParsedExperienceJson,
  nowMs = Date.now()
): ReconciledExperienceJsonImport {
  const incomingExp = parsed.experience;
  const nextCompany =
    incomingExp?.company && incomingExp.company.length > 0
      ? incomingExp.company
      : targetExp.company;
  const nextRole =
    incomingExp?.role && incomingExp.role.length > 0 ? incomingExp.role : targetExp.role;
  const nextIsCurrent =
    typeof incomingExp?.isCurrent === "boolean" ? incomingExp.isCurrent : targetExp.isCurrent;
  const nextStartDate =
    typeof incomingExp?.startDate === "string" && incomingExp.startDate.length > 0
      ? incomingExp.startDate
      : targetExp.startDate;
  const nextEndDate = nextIsCurrent
    ? ""
    : typeof incomingExp?.endDate === "string"
      ? incomingExp.endDate
      : targetExp.endDate;
  const nextLocation =
    typeof incomingExp?.location === "string" ? incomingExp.location : targetExp.location;
  const nextSummary =
    typeof incomingExp?.summary === "string" ? incomingExp.summary : targetExp.summary;
  const nextTechnologies = Array.isArray(incomingExp?.technologies)
    ? incomingExp.technologies
    : targetExp.technologies;

  const nextExpBase: WorkExperience = {
    ...targetExp,
    company: nextCompany,
    role: nextRole,
    startDate: nextStartDate,
    endDate: nextEndDate,
    isCurrent: nextIsCurrent,
    location: nextLocation,
    summary: nextSummary,
    technologies: nextTechnologies,
    updatedAt: nowMs,
  };

  const existingChildLogs = getExperienceChildLogs(targetExp, existingAllLogs);
  const existingById = new Map<string, LogEntry>(existingChildLogs.map((l) => [l.id, l]));
  const matchedExistingIds = new Set<string>();

  const contentEditedLogs: LogEntry[] = [];
  const metadataOnlyLogs: LogEntry[] = [];
  const logsToCreate: Array<Omit<LogEntry, "id" | "createdAt" | "updatedAt">> = [];
  let unchangedCount = 0;

  const findUnmatchedByTitle = (title: string): LogEntry | undefined => {
    const normalized = title.trim().toLowerCase();
    return existingChildLogs.find(
      (l) =>
        !matchedExistingIds.has(l.id) &&
        l.title.trim().toLowerCase() === normalized
    );
  };

  const defaultDate = new Date(nowMs).toISOString().substring(0, 10);
  const defaultTags =
    Array.isArray(nextTechnologies) && nextTechnologies.length > 0
      ? nextTechnologies.slice(0, 4).map((t) => `#${t.replace(/\s+/g, "")}`)
      : [];

  const resultingTitleSet = new Set<string>();
  const matchedPreviousTitleSet = new Set<string>();

  for (const draft of parsed.logs) {
    const cleanTitle = draft.title.trim();
    if (!cleanTitle) continue;
    resultingTitleSet.add(cleanTitle.toLowerCase());

    const byId = draft.id ? existingById.get(draft.id) : undefined;
    const matched = byId && !matchedExistingIds.has(byId.id)
      ? byId
      : findUnmatchedByTitle(cleanTitle);

    if (matched) {
      matchedExistingIds.add(matched.id);
      matchedPreviousTitleSet.add(matched.title.trim().toLowerCase());
      if (matched.originalBullet) {
        matchedPreviousTitleSet.add(matched.originalBullet.trim().toLowerCase());
      }
      const nextCandidate: LogEntry = {
        ...matched,
        experienceId: targetExp.id,
        client: nextCompany,
        project: draft.project ?? matched.project,
        category: draft.category ?? matched.category,
        date: draft.date ?? matched.date,
        title: cleanTitle,
        logro: cleanTitle,
        originalBullet:
          draft.originalBullet !== undefined ? draft.originalBullet : matched.originalBullet,
        whatWasSought:
          draft.whatWasSought !== undefined ? draft.whatWasSought : matched.whatWasSought,
        whyImportant:
          draft.whyImportant !== undefined ? draft.whyImportant : matched.whyImportant,
        howApplied: draft.howApplied !== undefined ? draft.howApplied : matched.howApplied,
        impact:
          draft.impact !== undefined
            ? draft.impact || cleanTitle
            : matched.impact || cleanTitle,
        description:
          draft.description !== undefined ? draft.description : matched.description,
        tags: draft.tags !== undefined ? draft.tags : matched.tags,
        isPublic: typeof draft.isPublic === "boolean" ? draft.isPublic : matched.isPublic,
        includeInCv:
          typeof draft.includeInCv === "boolean" ? draft.includeInCv : matched.includeInCv,
        sortOrder: draft.sortOrder !== undefined ? draft.sortOrder : matched.sortOrder,
      };

      if (hasLogContentChanged(matched, nextCandidate)) {
        contentEditedLogs.push({
          ...nextCandidate,
          updatedAt: nowMs,
        });
      } else if (hasLogMetadataChanged(matched, nextCandidate)) {
        metadataOnlyLogs.push(nextCandidate);
      } else {
        unchangedCount += 1;
      }
    } else {
      logsToCreate.push({
        experienceId: targetExp.id,
        originalBullet: draft.originalBullet ?? cleanTitle,
        date: draft.date || defaultDate,
        client: nextCompany,
        project: draft.project || nextRole || nextCompany,
        category: draft.category || inferCategoryForSavedExperienceBullet(cleanTitle),
        title: cleanTitle,
        logro: cleanTitle,
        includeInCv: typeof draft.includeInCv === "boolean" ? draft.includeInCv : true,
        whatWasSought: draft.whatWasSought,
        whyImportant: draft.whyImportant,
        howApplied: draft.howApplied,
        impact: draft.impact || cleanTitle,
        description:
          draft.description ??
          `Importado desde JSON para ${nextCompany} (${nextRole}).`,
        tags: draft.tags !== undefined ? draft.tags : defaultTags,
        isPublic: Boolean(draft.isPublic),
        sortOrder: draft.sortOrder,
      });
    }
  }

  // Sync remaining existing child logs of targetExp if company rename or legacy linking applies
  for (const existing of existingChildLogs) {
    if (matchedExistingIds.has(existing.id)) continue;
    resultingTitleSet.add(existing.title.trim().toLowerCase());

    const needsLinkOrClientSync =
      existing.experienceId !== targetExp.id || existing.client !== nextCompany;
    if (needsLinkOrClientSync) {
      metadataOnlyLogs.push({
        ...existing,
        experienceId: existing.experienceId || targetExp.id,
        client: nextCompany,
      });
    }
  }

  // Materialize any extra bullets listed in parsed.experience.bullets not yet covered
  // Skip stale bullets that merely mirror the pre-edit title of a matched log updated above
  if (Array.isArray(incomingExp?.bullets)) {
    for (const rawBullet of incomingExp.bullets) {
      const clean = cleanLegacyBulletText(rawBullet);
      if (!clean) continue;
      const lower = clean.toLowerCase();
      if (resultingTitleSet.has(lower) || matchedPreviousTitleSet.has(lower)) continue;
      resultingTitleSet.add(lower);
      logsToCreate.push({
        experienceId: targetExp.id,
        originalBullet: clean,
        date: defaultDate,
        client: nextCompany,
        project: nextRole || nextCompany,
        category: inferCategoryForSavedExperienceBullet(clean),
        title: clean,
        logro: clean,
        includeInCv: true,
        impact: clean,
        description: `Importado desde JSON para ${nextCompany} (${nextRole}).`,
        tags: defaultTags,
        isPublic: false,
      });
    }
  }

  // Compute projected bullets array cleanly for parent WorkExperience
  const mutatedMap = new Map<string, LogEntry>();
  for (const l of contentEditedLogs) mutatedMap.set(l.id, l);
  for (const l of metadataOnlyLogs) mutatedMap.set(l.id, l);

  const syntheticCreated: LogEntry[] = logsToCreate.map((item, idx) => ({
    ...item,
    id: `preview-${idx}`,
    createdAt: nowMs,
    updatedAt: nowMs,
  }));

  const previewAllLogs = [
    ...existingAllLogs.map((l) => {
      const updated = mutatedMap.get(l.id);
      if (updated) return updated;
      if (doesLogBelongToExperience(l, targetExp)) {
        return { ...l, experienceId: l.experienceId || targetExp.id, client: nextCompany };
      }
      return l;
    }),
    ...syntheticCreated,
  ];

  const projectedBullets = deriveExperienceBulletsFromLogs(nextExpBase, previewAllLogs);
  const updatedExperience: WorkExperience = {
    ...nextExpBase,
    bullets:
      projectedBullets.length > 0
        ? projectedBullets
        : (incomingExp?.bullets || targetExp.bullets || []).filter((b) =>
            existingChildLogs.every(
              (l) => isLogIncludedInCv(l) || l.title.trim() !== b.trim()
            )
          ),
  };

  const experienceChanged =
    targetExp.company !== updatedExperience.company ||
    targetExp.role !== updatedExperience.role ||
    targetExp.startDate !== updatedExperience.startDate ||
    (targetExp.endDate || "") !== (updatedExperience.endDate || "") ||
    Boolean(targetExp.isCurrent) !== Boolean(updatedExperience.isCurrent) ||
    (targetExp.location || "") !== (updatedExperience.location || "") ||
    (targetExp.summary || "") !== (updatedExperience.summary || "") ||
    !areStringArraysEqual(targetExp.technologies, updatedExperience.technologies) ||
    !areStringArraysEqual(targetExp.bullets, updatedExperience.bullets);

  const hasChanges =
    experienceChanged ||
    contentEditedLogs.length > 0 ||
    metadataOnlyLogs.length > 0 ||
    logsToCreate.length > 0;

  return {
    updatedExperience,
    experienceChanged,
    hasChanges,
    contentEditedLogs,
    metadataOnlyLogs,
    logsToCreate,
    unchangedCount,
  };
}
