import { LogCategory, LogEntry, WorkExperience } from "../../types";
import {
  cleanLegacyBulletText,
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
  const activeLogBullets = expLogs
    .filter(isLogIncludedInCv)
    .map((l) => (l.title || l.logro || l.impact || "").trim())
    .filter(Boolean);

  const legacyUnlinked = findLegacyUnlinkedBullets(exp, expLogs);
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
    const matched = filteredLogs.filter((l) => doesLogBelongToExperience(l, exp));
    matched.forEach((l) => assignedLogIds.add(l.id));
    result.push({ experience: exp, logs: matched });
  });

  const unassigned = filteredLogs.filter((l) => !assignedLogIds.has(l.id));
  return { result, unassigned };
};
