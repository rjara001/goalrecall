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
  hasExplicitLogsField?: boolean;
}

export const MAX_EXPERIENCE_JSON_CHARS = 512 * 1024;

export interface ReconciledExperienceJsonImport {
  updatedExperience: WorkExperience;
  experienceChanged: boolean;
  hasChanges: boolean;
  contentEditedLogs: LogEntry[];
  metadataOnlyLogs: LogEntry[];
  logsToCreate: Array<Omit<LogEntry, "id" | "createdAt" | "updatedAt">>;
  logsToDelete: LogEntry[];
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
      ...(log.logro && log.logro.trim() && log.logro.trim() !== log.title.trim()
        ? { logro: log.logro }
        : {}),
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
    logro: typeof obj.logro === "string" && obj.logro.trim() ? obj.logro.trim() : undefined,
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
    if (parsed.length > 0 && logs.length === 0) {
      return {
        success: false,
        error: "La lista JSON no contiene logros válidos (cada elemento requiere un campo title o texto).",
      };
    }
    return { success: true, data: { logs, hasExplicitLogsField: true } };
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

  const hasExplicitLogsField =
    Array.isArray(root.logs) ||
    Boolean(
      root.experience &&
        typeof root.experience === "object" &&
        !Array.isArray(root.experience) &&
        Array.isArray((root.experience as Record<string, unknown>).logs)
    );

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

  if (!experience && !hasExplicitLogsField && logs.length === 0) {
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
      hasExplicitLogsField,
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
  const logsToDelete: LogEntry[] = [];
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

  const hasExplicitLogsField =
    parsed.hasExplicitLogsField === true || parsed.logs.length > 0;
  const hasExplicitBulletsField = Array.isArray(incomingExp?.bullets);

  const originalCvBullets = deriveExperienceBulletsFromLogs(targetExp, existingAllLogs);
  const incomingBullets = hasExplicitBulletsField
    ? (incomingExp?.bullets || []).map(cleanLegacyBulletText).filter((b) => b.length > 0)
    : [];
  const bulletsChanged =
    hasExplicitBulletsField && !areStringArraysEqual(incomingBullets, originalCvBullets);

  const resolveEffectiveDraftTitle = (
    draft: ExperienceJsonLogDraft,
    matched?: LogEntry
  ): string => {
    const t = draft.title.trim();
    if (
      matched &&
      draft.logro &&
      draft.logro.trim().length > 0 &&
      t === matched.title.trim() &&
      draft.logro.trim() !== (matched.logro || "").trim()
    ) {
      return draft.logro.trim();
    }
    return t;
  };

  const didParsedLogsChange = (): boolean => {
    if (!hasExplicitLogsField) return false;
    if (parsed.logs.length !== existingChildLogs.length) return true;
    for (let i = 0; i < parsed.logs.length; i += 1) {
      const draft = parsed.logs[i];
      const existing = existingChildLogs[i];
      if (!existing) return true;
      if (draft.id && draft.id !== existing.id) return true;
      const effectiveTitle = resolveEffectiveDraftTitle(draft, existing);
      if (!draft.id && effectiveTitle.toLowerCase() !== existing.title.trim().toLowerCase()) {
        return true;
      }
      const candidate: LogEntry = {
        ...existing,
        experienceId: targetExp.id,
        client: nextCompany,
        project: draft.project ?? existing.project,
        category: draft.category ?? existing.category,
        date: draft.date ?? existing.date,
        title: effectiveTitle,
        logro: effectiveTitle,
        originalBullet:
          draft.originalBullet !== undefined ? draft.originalBullet : existing.originalBullet,
        whatWasSought:
          draft.whatWasSought !== undefined ? draft.whatWasSought : existing.whatWasSought,
        whyImportant:
          draft.whyImportant !== undefined ? draft.whyImportant : existing.whyImportant,
        howApplied: draft.howApplied !== undefined ? draft.howApplied : existing.howApplied,
        impact:
          draft.impact !== undefined
            ? draft.impact || effectiveTitle
            : existing.impact || effectiveTitle,
        description:
          draft.description !== undefined ? draft.description : existing.description,
        tags: draft.tags !== undefined ? draft.tags : existing.tags,
        isPublic: typeof draft.isPublic === "boolean" ? draft.isPublic : existing.isPublic,
        includeInCv:
          typeof draft.includeInCv === "boolean" ? draft.includeInCv : existing.includeInCv,
        sortOrder: draft.sortOrder !== undefined ? draft.sortOrder : existing.sortOrder,
      };
      if (hasLogContentChanged(existing, candidate) || hasLogMetadataChanged(existing, candidate)) {
        return true;
      }
    }
    return false;
  };

  const logsChanged = didParsedLogsChange();
  const isLegacyBulletsOnlySnapshot =
    existingChildLogs.length === 0 && parsed.logs.length === 0 && hasExplicitBulletsField;
  const shouldDriveFromBullets =
    (!hasExplicitLogsField && hasExplicitBulletsField) ||
    (!logsChanged && bulletsChanged) ||
    (isLegacyBulletsOnlySnapshot && bulletsChanged);

  const replaceAchievements =
    (hasExplicitLogsField && !isLegacyBulletsOnlySnapshot) ||
    hasExplicitBulletsField && shouldDriveFromBullets;

  const buildDraftsFromEditedBullets = (): ExperienceJsonLogDraft[] => {
    const existingCvLogs = existingChildLogs.filter(isLogIncludedInCv);
    const existingHiddenLogs = existingChildLogs.filter((l) => !isLogIncludedInCv(l));

    const usedCvIds = new Set<string>();
    const exactMatchByBulletIdx = new Map<number, LogEntry>();

    incomingBullets.forEach((bulletText, idx) => {
      const norm = bulletText.toLowerCase();
      const exact = existingCvLogs.find(
        (l) => !usedCvIds.has(l.id) && l.title.trim().toLowerCase() === norm
      );
      if (exact) {
        usedCvIds.add(exact.id);
        exactMatchByBulletIdx.set(idx, exact);
      }
    });

    const isOrderOrCountChanged =
      incomingBullets.length !== existingCvLogs.length ||
      incomingBullets.some((b, idx) => {
        const m = exactMatchByBulletIdx.get(idx);
        return !m || existingCvLogs[idx]?.id !== m.id;
      });

    const cvDrafts: ExperienceJsonLogDraft[] = incomingBullets.map((bulletText, idx) => {
      const exact = exactMatchByBulletIdx.get(idx);
      if (exact) {
        return {
          id: exact.id,
          title: bulletText,
          ...(isOrderOrCountChanged ? { sortOrder: idx } : {}),
        };
      }
      const positional = existingCvLogs[idx];
      if (positional && !usedCvIds.has(positional.id)) {
        usedCvIds.add(positional.id);
        return {
          id: positional.id,
          title: bulletText,
          ...(isOrderOrCountChanged ? { sortOrder: idx } : {}),
        };
      }
      return {
        title: bulletText,
        includeInCv: true,
        sortOrder: idx,
      };
    });

    const hiddenDrafts: ExperienceJsonLogDraft[] = existingHiddenLogs.map((l) => ({
      id: l.id,
      title: l.title,
      includeInCv: false,
      sortOrder: l.sortOrder,
    }));

    return [...cvDrafts, ...hiddenDrafts];
  };

  const effectiveDrafts: ExperienceJsonLogDraft[] =
    !hasExplicitLogsField && hasExplicitBulletsField
      ? incomingBullets.map((clean, idx) => ({
          title: clean,
          includeInCv: true,
          sortOrder: idx,
        }))
      : shouldDriveFromBullets
        ? buildDraftsFromEditedBullets()
        : hasExplicitLogsField
          ? parsed.logs
          : [];

  for (let draftIdx = 0; draftIdx < effectiveDrafts.length; draftIdx += 1) {
    const draft = effectiveDrafts[draftIdx];
    const byId = draft.id ? existingById.get(draft.id) : undefined;
    const tentativeTitle = resolveEffectiveDraftTitle(draft, byId);
    if (!tentativeTitle) continue;

    const matched = byId && !matchedExistingIds.has(byId.id)
      ? byId
      : findUnmatchedByTitle(tentativeTitle);

    const cleanTitle = resolveEffectiveDraftTitle(draft, matched);
    if (!cleanTitle) continue;

    if (matched) {
      matchedExistingIds.add(matched.id);
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
        sortOrder: draft.sortOrder !== undefined ? draft.sortOrder : draftIdx,
      });
    }
  }

  for (const existing of existingChildLogs) {
    if (matchedExistingIds.has(existing.id)) continue;

    if (replaceAchievements) {
      logsToDelete.push(existing);
    } else {
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
  }

  // Compute projected bullets array cleanly for parent WorkExperience
  const mutatedMap = new Map<string, LogEntry>();
  for (const l of contentEditedLogs) mutatedMap.set(l.id, l);
  for (const l of metadataOnlyLogs) mutatedMap.set(l.id, l);
  const deletedIdSet = new Set(logsToDelete.map((l) => l.id));

  const syntheticCreated: LogEntry[] = logsToCreate.map((item, idx) => ({
    ...item,
    id: `preview-${idx}`,
    createdAt: nowMs,
    updatedAt: nowMs,
  }));

  const previewAllLogs = [
    ...existingAllLogs
      .filter((l) => !deletedIdSet.has(l.id))
      .map((l) => {
        const updated = mutatedMap.get(l.id);
        if (updated) return updated;
        if (doesLogBelongToExperience(l, targetExp)) {
          return { ...l, experienceId: l.experienceId || targetExp.id, client: nextCompany };
        }
        return l;
      }),
    ...syntheticCreated,
  ];

  const expForProjection: WorkExperience = replaceAchievements
    ? { ...nextExpBase, bullets: [] }
    : nextExpBase;
  const projectedBullets = deriveExperienceBulletsFromLogs(expForProjection, previewAllLogs);
  const previewRemainingChildLogs = getExperienceChildLogs(expForProjection, previewAllLogs);
  const updatedExperience: WorkExperience = {
    ...nextExpBase,
    bullets:
      previewRemainingChildLogs.length > 0 || replaceAchievements
        ? projectedBullets
        : (targetExp.bullets || []).filter((b) =>
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
    logsToCreate.length > 0 ||
    logsToDelete.length > 0;

  return {
    updatedExperience,
    experienceChanged,
    hasChanges,
    contentEditedLogs,
    metadataOnlyLogs,
    logsToCreate,
    logsToDelete,
    unchangedCount,
  };
}
