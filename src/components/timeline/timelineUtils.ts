import { LogCategory, LogEntry, WorkExperience } from "../../types";
import {
  cleanLegacyBulletText,
  compareLogEntriesByOrder,
  doesLogBelongToExperience,
  findLegacyUnlinkedBullets,
  getExperienceChildLogs,
  isJunkBulletString,
  isLogIncludedInCv,
  normalizeBulletText,
} from "../../utils/bulletToLogMapper";

export const DEFAULT_PRESET_CATEGORIES: LogCategory[] = [
  "Feature ✨",
  "Fix 🐛",
  "Refactor 🧹",
  "Architecture 🏗️",
  "Infra/DevOps 🚀",
  "Spike/R&D 🔬",
  "Campaña / Growth 📈",
  "Conversión & Funnel 🎯",
  "Contenido & SEO ✍️",
  "Diseño & UX 🖌️",
  "Ventas & Revenue 💰",
];

export interface TimelineFilterParams {
  search: string;
  selectedClient: string;
  selectedCategory: "Todas" | LogCategory;
  selectedTag: string;
  selectedVisibility: "all" | "public_only" | "private_only";
  dateRange: "all" | "7d" | "30d" | "90d";
  nowMs?: number;
}

export const computeTotalBulletsCount = (
  experiences: WorkExperience[],
  logs: LogEntry[]
): number => {
  return experiences.reduce((acc, exp) => {
    const expLogs = getExperienceChildLogs(exp, logs);
    const derived = cleanExperienceBullets(exp, expLogs);
    return acc + derived.length;
  }, 0);
};

export const buildExtractedBulletSet = (logs: LogEntry[]): Set<string> => {
  const set = new Set<string>();
  logs.forEach((l) => {
    if (l.title) set.add(normalizeBulletText(l.title));
    if (l.logro) set.add(normalizeBulletText(l.logro));
    if (l.originalBullet) set.add(normalizeBulletText(l.originalBullet));
    if (l.impact) set.add(normalizeBulletText(l.impact));
  });
  return set;
};

export const cleanExperienceBullets = (
  exp: WorkExperience,
  expLogs: LogEntry[]
): string[] => {
  const orderedExpLogs = [...expLogs].sort(compareLogEntriesByOrder);
  const activeLogBullets = orderedExpLogs
    .filter(isLogIncludedInCv)
    .map((l) => (l.title || l.logro || l.impact || "").trim())
    .filter(Boolean);

  const legacyUnlinked = findLegacyUnlinkedBullets(exp, orderedExpLogs);
  const seen = new Set(activeLogBullets.map((b) => normalizeBulletText(b)));
  const combined = [...activeLogBullets];

  for (const bullet of legacyUnlinked) {
    const norm = normalizeBulletText(bullet);
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    combined.push(bullet);
  }

  if (combined.length > 0) {
    return combined;
  }

  if (
    expLogs.length === 0 &&
    exp.summary &&
    !exp.summary.includes("extraída de CV") &&
    !isJunkBulletString(exp.summary)
  ) {
    return [cleanLegacyBulletText(exp.summary)];
  }

  return [];
};

export const filterTimelineLogs = (
  logs: LogEntry[],
  {
    search,
    selectedClient,
    selectedCategory,
    selectedTag,
    selectedVisibility,
    dateRange,
    nowMs = Date.now(),
  }: TimelineFilterParams
): LogEntry[] => {
  return logs.filter((log) => {
    if (search) {
      const query = search.toLowerCase();
      const matches =
        log.title.toLowerCase().includes(query) ||
        log.impact.toLowerCase().includes(query) ||
        (log.description && log.description.toLowerCase().includes(query)) ||
        log.client.toLowerCase().includes(query) ||
        log.project.toLowerCase().includes(query) ||
        log.tags.some((t) => t.toLowerCase().includes(query));
      if (!matches) return false;
    }

    if (selectedClient !== "all" && log.client !== selectedClient) {
      return false;
    }

    if (selectedCategory !== "Todas" && log.category !== selectedCategory) {
      return false;
    }

    if (selectedTag !== "all" && !log.tags.includes(selectedTag)) {
      return false;
    }

    if (selectedVisibility === "public_only" && !log.isPublic) return false;
    if (selectedVisibility === "private_only" && log.isPublic) return false;

    if (dateRange !== "all") {
      const logTime = new Date(log.date).getTime();
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      if (nowMs - logTime > days * 86400000) return false;
    }

    return true;
  });
};

export const groupLogsByExperience = (
  experiences: WorkExperience[],
  filteredLogs: LogEntry[]
) => {
  const result: { experience: WorkExperience; logs: LogEntry[] }[] = [];
  const assignedLogIds = new Set<string>();

  experiences.forEach((exp) => {
    const matched = filteredLogs
      .filter((l) => doesLogBelongToExperience(l, exp))
      .sort(compareLogEntriesByOrder);
    matched.forEach((l) => assignedLogIds.add(l.id));
    result.push({ experience: exp, logs: matched });
  });

  const unassigned = filteredLogs
    .filter((l) => !assignedLogIds.has(l.id))
    .sort(compareLogEntriesByOrder);
  return { result, unassigned };
};

export const formatLogUpdatedAt = (
  updatedAt?: number,
  language: string = "es"
): string | null => {
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt) || updatedAt <= 0) {
    return null;
  }
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  const locale = language === "en" ? "en-US" : "es";
  const dateStr = date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const prefix = language === "en" ? "Updated" : "Actualizado";
  return `${prefix}: ${dateStr} · ${timeStr}`;
};

export const RECENT_EDIT_WINDOW_MS = 8 * 60 * 60 * 1000;

export const isRecentlyUpdatedLog = (
  log: { updatedAt?: number },
  nowMs: number = Date.now(),
  windowMs: number = RECENT_EDIT_WINDOW_MS
): boolean => {
  const updatedAt = log.updatedAt;
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt) || updatedAt <= 0) {
    return false;
  }
  if (updatedAt > nowMs + 60_000) {
    return false;
  }
  const ageMs = Math.max(0, nowMs - updatedAt);
  return ageMs <= windowMs;
};

export const getRecentlyEditedLogs = (
  logs: LogEntry[],
  nowMs: number = Date.now(),
  windowMs: number = RECENT_EDIT_WINDOW_MS,
  limit: number = 10
): LogEntry[] => {
  return logs
    .filter((log) => isRecentlyUpdatedLog(log, nowMs, windowMs))
    .sort((a, b) => {
      const diff = (b.updatedAt || 0) - (a.updatedAt || 0);
      if (diff !== 0) return diff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .slice(0, Math.max(1, limit));
};

export const getLatestUpdatedLogs = (
  logs: LogEntry[],
  limit: number = 3
): LogEntry[] => {
  return logs
    .filter(
      (log) =>
        typeof log.updatedAt === "number" &&
        Number.isFinite(log.updatedAt) &&
        log.updatedAt > 0
    )
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, Math.max(1, limit));
};

export const formatRelativeUpdatedTime = (
  updatedAt?: number,
  nowMs: number = Date.now(),
  language: string = "es"
): string | null => {
  if (typeof updatedAt !== "number" || !Number.isFinite(updatedAt) || updatedAt <= 0) {
    return null;
  }
  const diffMs = Math.max(0, nowMs - updatedAt);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) {
    return language === "en" ? "just now" : "hace un momento";
  }
  if (mins < 60) {
    return language === "en" ? `${mins}m ago` : `hace ${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return language === "en" ? `${hours}h ago` : `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return language === "en" ? `${days}d ago` : `hace ${days} d`;
};

