import { LogCategory, LogEntry, WorkExperience } from "../types";

export interface ExperienceHealingResult {
  experiences: WorkExperience[];
  changed: boolean;
}

export interface ExperienceBulletItem {
  key: string;
  text: string;
  log: LogEntry | null;
  isLegacyUnlinked: boolean;
}

export const normalizeBulletText = (text: string): string =>
  text
    .replace(/^[•●○▪■◆\-*–—›\d\.\)\>]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const cleanLegacyBulletText = (raw: string): string =>
  raw.replace(/^[•●○▪■◆\-*–—›\d\.\)\>]+\s*/, "").trim();

export const isJunkBulletString = (raw: string): boolean => {
  const clean = cleanLegacyBulletText(raw);
  return clean.length <= 10 || /^\d+\s*(?:of|\/)\s*\d+/i.test(clean);
};

export const isLogIncludedInCv = (log: LogEntry): boolean => log.includeInCv !== false;

export const doesLogBelongToExperience = (
  log: LogEntry,
  exp: WorkExperience
): boolean => {
  if (log.experienceId) {
    return log.experienceId === exp.id;
  }
  return log.client.trim().toLowerCase() === exp.company.trim().toLowerCase();
};

export const getExperienceChildLogs = (
  exp: WorkExperience,
  logs: LogEntry[]
): LogEntry[] => logs.filter((l) => doesLogBelongToExperience(l, exp));

export const findLegacyUnlinkedBullets = (
  exp: WorkExperience,
  expLogs: LogEntry[]
): string[] => {
  const matchedKeys = new Set<string>();
  expLogs.forEach((l) => {
    [l.title, l.logro, l.originalBullet, l.impact].forEach((val) => {
      if (val && val.trim()) {
        matchedKeys.add(normalizeBulletText(val));
      }
    });
  });

  const seenLegacy = new Set<string>();
  const legacy: string[] = [];

  (exp.bullets || []).forEach((raw) => {
    if (isJunkBulletString(raw)) return;
    const clean = cleanLegacyBulletText(raw);
    const norm = normalizeBulletText(clean);
    if (!norm || matchedKeys.has(norm) || seenLegacy.has(norm)) return;
    seenLegacy.add(norm);
    legacy.push(clean);
  });

  return legacy;
};

export const getExperienceBulletItems = (
  exp: WorkExperience,
  logs: LogEntry[]
): ExperienceBulletItem[] => {
  const expLogs = getExperienceChildLogs(exp, logs);
  const items: ExperienceBulletItem[] = [];
  const seenKeys = new Set<string>();

  expLogs.filter(isLogIncludedInCv).forEach((log) => {
    const text = (log.title || log.logro || log.impact || "").trim();
    if (!text) return;
    seenKeys.add(normalizeBulletText(text));
    items.push({
      key: `log-${log.id}`,
      text,
      log,
      isLegacyUnlinked: false,
    });
  });

  const legacyUnlinked = findLegacyUnlinkedBullets(exp, expLogs);
  legacyUnlinked.forEach((text, idx) => {
    const norm = normalizeBulletText(text);
    if (!norm || seenKeys.has(norm)) return;
    seenKeys.add(norm);
    items.push({
      key: `legacy-${exp.id}-${idx}`,
      text,
      log: null,
      isLegacyUnlinked: true,
    });
  });

  return items;
};

export const deriveExperienceBulletsFromLogs = (
  exp: WorkExperience,
  logs: LogEntry[]
): string[] => {
  return getExperienceBulletItems(exp, logs).map((item) => item.text);
};

/**
 * Auto-heals experiences that have zero bullets by re-hydrating bullets
 * from matching Bitácora logs belonging to that company/experience.
 */
export const healExperiencesFromLogs = (
  storedExps: WorkExperience[],
  storedLogs: LogEntry[]
): ExperienceHealingResult => {
  let changed = false;

  const experiences = storedExps.map((exp) => {
    if (!exp.bullets || exp.bullets.length === 0) {
      const companyKey = exp.company.trim().toLowerCase();
      const matched = storedLogs.filter(
        (l) =>
          (l.experienceId === exp.id || l.client.trim().toLowerCase() === companyKey) &&
          isLogIncludedInCv(l)
      );
      if (matched.length > 0) {
        changed = true;
        return {
          ...exp,
          bullets: matched.map((l) => l.originalBullet || l.impact || l.title).filter(Boolean),
        };
      }
    }
    return exp;
  });

  return { experiences, changed };
};

export const inferCategoryForSavedExperienceBullet = (bulletText: string): LogCategory => {
  const lower = bulletText.toLowerCase();

  if (
    lower.includes("campaña") ||
    lower.includes("growth") ||
    lower.includes("adquisici") ||
    lower.includes("cac") ||
    lower.includes("leads") ||
    lower.includes("mql")
  ) {
    return "Campaña / Growth 📈";
  }
  if (
    lower.includes("convers") ||
    lower.includes("funnel") ||
    lower.includes("embudo") ||
    lower.includes("abandono") ||
    lower.includes("a/b test")
  ) {
    return "Conversión & Funnel 🎯";
  }
  if (
    lower.includes("contenido") ||
    lower.includes("seo") ||
    lower.includes("copy") ||
    lower.includes("artículo") ||
    lower.includes("blog")
  ) {
    return "Contenido & SEO ✍️";
  }
  if (lower.includes("branding") || lower.includes("marca") || lower.includes("evento")) {
    return "Branding & Eventos 🎨";
  }
  if (
    lower.includes("diseño") ||
    lower.includes("ux") ||
    lower.includes("ui") ||
    lower.includes("figma") ||
    lower.includes("usabilidad")
  ) {
    return "Diseño & UX 🖌️";
  }
  if (
    lower.includes("venta") ||
    lower.includes("revenue") ||
    lower.includes("arr") ||
    lower.includes("mrr") ||
    lower.includes("comercial") ||
    lower.includes("deal")
  ) {
    return "Ventas & Revenue 💰";
  }
  if (
    lower.includes("estrategia") ||
    lower.includes("lider") ||
    lower.includes("equipo") ||
    lower.includes("contrataci")
  ) {
    return "Estrategia & Liderazgo 👥";
  }
  if (
    lower.includes("lanzamiento") ||
    lower.includes("launch") ||
    lower.includes("go-to-market")
  ) {
    return "Lanzamiento 🚀";
  }
  if (
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("resolv") ||
    lower.includes("incidenc")
  ) {
    return "Fix 🐛";
  }
  if (lower.includes("refactor") || lower.includes("migr") || lower.includes("deuda")) {
    return "Refactor 🧹";
  }
  if (
    lower.includes("infra") ||
    lower.includes("devops") ||
    lower.includes("docker") ||
    lower.includes("k8s") ||
    lower.includes("aws") ||
    lower.includes("ci/cd")
  ) {
    return "Infra/DevOps 🚀";
  }
  if (lower.includes("arquitect") || lower.includes("microserv")) {
    return "Architecture 🏗️";
  }
  if (lower.includes("investig") || lower.includes("spike") || lower.includes("poc")) {
    return "Spike/R&D 🔬";
  }

  return "Feature ✨";
};

export const inferCategoryForExtractedBullet = (cleanBullet: string): LogCategory => {
  const lower = cleanBullet.toLowerCase();

  if (
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("error") ||
    lower.includes("resolv") ||
    lower.includes("patch")
  ) {
    return "Fix 🐛";
  }
  if (
    lower.includes("refactor") ||
    lower.includes("migrat") ||
    lower.includes("reorganiz") ||
    lower.includes("clean") ||
    lower.includes("moderniz")
  ) {
    return "Refactor 🧹";
  }
  if (
    lower.includes("architect") ||
    lower.includes("microservic") ||
    lower.includes("system") ||
    lower.includes("design") ||
    lower.includes("vertical slice") ||
    lower.includes("notion-style")
  ) {
    return "Architecture 🏗️";
  }
  if (
    lower.includes("deploy") ||
    lower.includes("ci/cd") ||
    lower.includes("docker") ||
    lower.includes("kubernetes") ||
    lower.includes("pipeline") ||
    lower.includes("azure devops") ||
    lower.includes("aws") ||
    lower.includes("observability") ||
    lower.includes("opentelemetry") ||
    lower.includes("new relic")
  ) {
    return "Infra/DevOps 🚀";
  }
  if (
    lower.includes("ai") ||
    lower.includes("spike") ||
    lower.includes("research") ||
    lower.includes("r&d") ||
    lower.includes("copilot") ||
    lower.includes("investigat") ||
    lower.includes("poc")
  ) {
    return "Spike/R&D 🔬";
  }

  return "Feature ✨";
};

export const buildLogFromSavedExperienceBullet = (
  expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
  experienceId: string | undefined,
  bulletText: string,
  fallbackDate: string = new Date().toISOString().substring(0, 10)
): Omit<LogEntry, "id" | "createdAt" | "updatedAt"> => {
  const date = expData.startDate
    ? expData.startDate.length === 4
      ? `${expData.startDate}-01-01`
      : expData.startDate
    : fallbackDate;

  return {
    title: bulletText,
    logro: bulletText,
    client: expData.company,
    project: expData.role || expData.company,
    category: inferCategoryForSavedExperienceBullet(bulletText),
    date,
    experienceId,
    originalBullet: bulletText,
    impact: "",
    tags: expData.technologies && expData.technologies.length > 0 ? expData.technologies : [],
    isPublic: false,
    includeInCv: true,
  };
};

export interface ExtractBulletInput {
  experienceId: string;
  company: string;
  role: string;
  bulletText: string;
  technologies?: string[];
  date?: string;
}

export const buildLogFromExtractedBullet = ({
  experienceId,
  company,
  role,
  bulletText,
  technologies,
  date = new Date().toISOString().substring(0, 10),
}: ExtractBulletInput): Omit<LogEntry, "id" | "createdAt" | "updatedAt"> | null => {
  const cleanBullet = bulletText.trim();
  if (!cleanBullet) return null;

  let title = cleanBullet;
  const firstPeriod = cleanBullet.indexOf(".");
  if (firstPeriod > 20 && firstPeriod < 120) {
    title = cleanBullet.substring(0, firstPeriod);
  } else if (title.length > 110) {
    title = title.substring(0, 107) + "...";
  }

  const tags =
    technologies && technologies.length > 0
      ? technologies.slice(0, 4).map((tech) => `#${tech.replace(/[\s\.]/g, "")}`)
      : ["#CVVerídico", "#Producción"];

  return {
    experienceId,
    originalBullet: cleanBullet,
    date,
    client: company,
    project: role || "Ingeniería",
    category: inferCategoryForExtractedBullet(cleanBullet),
    title,
    description: `Logro extraído de viñeta real de CV (${company}).`,
    impact: cleanBullet,
    tags,
    isPublic: false,
    includeInCv: true,
  };
};
