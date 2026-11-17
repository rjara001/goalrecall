import { LogCategory, LogEntry, WorkExperience } from "../types";

export interface ExperienceHealingResult {
  experiences: WorkExperience[];
  changed: boolean;
}

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
        (l) => l.experienceId === exp.id || l.client.trim().toLowerCase() === companyKey
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
  };
};
