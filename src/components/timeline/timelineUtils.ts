import { LogCategory, LogEntry, WorkExperience } from "../../types";

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
    if (exp.bullets && exp.bullets.length > 0) {
      return acc + exp.bullets.length;
    }
    const expLogsCount = logs.filter(
      (l) =>
        l.experienceId === exp.id ||
        (!l.experienceId && l.client.trim().toLowerCase() === exp.company.trim().toLowerCase())
    ).length;
    if (expLogsCount > 0) {
      return acc + expLogsCount;
    }
    return acc + (exp.summary && !exp.summary.includes("extraída de CV") ? 1 : 0);
  }, 0);
};

export const buildExtractedBulletSet = (logs: LogEntry[]): Set<string> => {
  const set = new Set<string>();
  logs.forEach((l) => {
    if (l.originalBullet) set.add(l.originalBullet.trim().toLowerCase());
    if (l.impact) set.add(l.impact.trim().toLowerCase());
  });
  return set;
};

export const cleanExperienceBullets = (
  exp: WorkExperience,
  expLogs: LogEntry[]
): string[] => {
  const expLogsBullets = expLogs
    .map((l) => l.originalBullet || l.impact || l.title)
    .filter(Boolean);
  const rawBullets =
    exp.bullets && exp.bullets.length > 0
      ? exp.bullets
      : expLogsBullets.length > 0
      ? expLogsBullets
      : exp.summary && !exp.summary.includes("extraída de CV")
      ? [exp.summary]
      : [];

  return rawBullets
    .map((b) => b.replace(/^[•●○▪■◆\-*–—›\d\.\)\>]+\s*/, "").trim())
    .filter((b) => b.length > 10 && !/^\d+\s*(?:of|\/)\s*\d+/i.test(b));
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
    const matched = filteredLogs.filter(
      (l) =>
        l.experienceId === exp.id ||
        (!l.experienceId && l.client.trim().toLowerCase() === exp.company.trim().toLowerCase())
    );
    matched.forEach((l) => assignedLogIds.add(l.id));
    result.push({ experience: exp, logs: matched });
  });

  const unassigned = filteredLogs.filter((l) => !assignedLogIds.has(l.id));
  return { result, unassigned };
};
