import {
  ExperienceRevisionSnapshot,
  LogEntry,
  LogRevisionSnapshot,
  RevisionEntityType,
  RevisionSource,
  WorkExperience,
} from "../../types";

export const MAX_REVISIONS_PER_ENTITY = 25;

export const LOG_REVISION_FIELDS = [
  "title",
  "whatWasSought",
  "whyImportant",
  "howApplied",
  "impact",
  "description",
  "client",
  "project",
  "experienceId",
  "category",
  "date",
  "tags",
] as const;

export type LogRevisionFieldKey = (typeof LOG_REVISION_FIELDS)[number];

export const EXPERIENCE_REVISION_FIELDS = [
  "company",
  "role",
  "startDate",
  "endDate",
  "isCurrent",
  "location",
  "summary",
  "bullets",
  "technologies",
  "isPersonalProjects",
] as const;

export type ExperienceRevisionFieldKey = (typeof EXPERIENCE_REVISION_FIELDS)[number];

const LOG_FIELD_LABELS: Record<LogRevisionFieldKey, string> = {
  title: "Logro / Viñeta",
  impact: "Impacto",
  whatWasSought: "¿Qué se buscaba?",
  whyImportant: "¿Por qué era importante?",
  howApplied: "¿Cómo se aplicó?",
  description: "Detalle / Descripción",
  category: "Categoría",
  project: "Proyecto",
  client: "Cliente / Empresa",
  experienceId: "Experiencia vinculada",
  date: "Fecha",
  tags: "Etiquetas",
};

export interface RevisionFieldMeta {
  section: string;
  propertyLabel: string;
  hint: string;
}

const LOG_FIELD_META: Record<LogRevisionFieldKey, RevisionFieldMeta> = {
  title: {
    section: "Contenido Principal",
    propertyLabel: "1. Logro / Viñeta principal (CV)",
    hint: "Titular o bullet principal que resume este logro en la bitácora y CV.",
  },
  whatWasSought: {
    section: "Contexto STAR del Logro",
    propertyLabel: "2. ¿Qué se buscaba lograr? (Objetivo inicial)",
    hint: "Problema de negocio, meta o requerimiento que originó esta iniciativa.",
  },
  whyImportant: {
    section: "Contexto STAR del Logro",
    propertyLabel: "3. ¿Por qué era importante? (Riesgo / Valor)",
    hint: "Dolor del cliente, riesgo mitigado o impacto estratégico si no se resolvía.",
  },
  howApplied: {
    section: "Contexto STAR del Logro",
    propertyLabel: "4. ¿Cómo se aplicó la solución? (Arquitectura / Método)",
    hint: "Estrategia técnica, patrones de diseño, herramientas y decisiones clave.",
  },
  impact: {
    section: "Resultado Medible",
    propertyLabel: "5. El impacto (Fórmula XYZ)",
    hint: "Resultado cuantitativo o cualitativo medible obtenido con este logro.",
  },
  description: {
    section: "Profundidad Técnica",
    propertyLabel: "6. Detalle o Descripción técnica",
    hint: "Desarrollo extendido, decisiones de diseño y aprendizajes del logro.",
  },
  client: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Cliente / Empresa",
    hint: "Organización o cliente donde se realizó este logro.",
  },
  project: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Proyecto / Módulo",
    hint: "Producto, sistema o iniciativa específica asociada al logro.",
  },
  experienceId: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Experiencia laboral vinculada",
    hint: "Puesto de tu trayectoria profesional al que pertenece este logro.",
  },
  category: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Categoría del logro",
    hint: "Clasificación de la contribución (Architecture, Feature, Fix, Liderazgo, etc.).",
  },
  date: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Fecha del hito",
    hint: "Fecha registrada para ubicar el logro en la línea de tiempo.",
  },
  tags: {
    section: "Clasificación y Metadatos",
    propertyLabel: "Etiquetas (#Tags)",
    hint: "Tecnologías, competencias o palabras clave asociadas al logro.",
  },
};

const EXPERIENCE_FIELD_META: Record<ExperienceRevisionFieldKey, RevisionFieldMeta> = {
  company: {
    section: "Encabezado del Rol",
    propertyLabel: "Empresa / Organización",
    hint: "Nombre de la compañía o entidad donde desempeñaste el cargo.",
  },
  role: {
    section: "Encabezado del Rol",
    propertyLabel: "Cargo / Rol profesional",
    hint: "Título del puesto visible en tu trayectoria y CV.",
  },
  startDate: {
    section: "Periodo y Ubicación",
    propertyLabel: "Fecha de inicio",
    hint: "Mes y año de ingreso a esta experiencia.",
  },
  endDate: {
    section: "Periodo y Ubicación",
    propertyLabel: "Fecha de término",
    hint: "Mes y año de salida (vacío cuando es trabajo actual).",
  },
  isCurrent: {
    section: "Periodo y Ubicación",
    propertyLabel: "Trabajo actual",
    hint: "Indica si continúas desempeñando este cargo actualmente.",
  },
  location: {
    section: "Periodo y Ubicación",
    propertyLabel: "Ubicación / Modalidad",
    hint: "Ciudad, país o modalidad de trabajo (ej. Remoto, Híbrido).",
  },
  isPersonalProjects: {
    section: "Periodo y Ubicación",
    propertyLabel: "Bloque de proyectos personales",
    hint: "Indica si agrupa proyectos propios, freelance o independientes.",
  },
  summary: {
    section: "Narrativa del Puesto",
    propertyLabel: "Resumen del rol",
    hint: "Síntesis general de responsabilidades, equipo y alcance.",
  },
  bullets: {
    section: "Viñetas y Logros del CV",
    propertyLabel: "Viñetas / Logros clave",
    hint: "Lista ordenada de bullets destacados en tu CV.",
  },
  technologies: {
    section: "Stack Técnico",
    propertyLabel: "Tecnologías y herramientas",
    hint: "Lenguajes, frameworks y plataformas empleadas en el puesto.",
  },
};

const EXPERIENCE_FIELD_LABELS: Record<ExperienceRevisionFieldKey, string> = {
  company: "Empresa",
  role: "Rol / Puesto",
  startDate: "Fecha de inicio",
  endDate: "Fecha de fin",
  isCurrent: "Trabajo actual",
  location: "Ubicación",
  summary: "Resumen del rol",
  bullets: "Viñetas / Logros",
  technologies: "Tecnologías",
  isPersonalProjects: "Proyectos personales",
};

const REVISION_ORIGIN_LABELS: Record<RevisionSource, string> = {
  initial: "Inicial",
  manual_form: "Formulario",
  json_editor: "Editor JSON",
  json_import: "Archivo JSON",
  restore: "Restauración",
};

/**
 * Normalizes scalar or multiline text cleanly before snapshot comparison:
 * - Unifies CRLF/CR to LF
 * - Removes trailing horizontal spaces per line
 * - Trims leading/trailing whitespace & blank edges
 */
export function normalizeScalarText(value: unknown): string {
  if (typeof value !== "string") {
    if (value === null || value === undefined) return "";
    return String(value).replace(/\r\n?/g, "\n").trim();
  }
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

/**
 * Normalizes unordered sets like tags and technologies:
 * - Trims each item
 * - Drops empty entries
 * - Deduplicates case-insensitively while preserving first-seen normalized text
 * - Sorts canonically so reordering the exact same tags never creates a noisy revision
 */
export function normalizeUniqueStringList(values: unknown, maxItems = 50): string[] {
  if (!Array.isArray(values)) return [];
  const seenLower = new Set<string>();
  const normalized: string[] = [];

  for (const raw of values) {
    const clean = normalizeScalarText(raw);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seenLower.has(key)) continue;
    seenLower.add(key);
    normalized.push(clean);
    if (normalized.length >= maxItems) break;
  }

  return normalized.sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );
}

/**
 * Normalizes ordered line lists like experience bullets:
 * - Trims each bullet
 * - Drops empty entries
 * - Preserves exact order (order changes are meaningful in CV bullets)
 */
export function normalizeBulletsList(values: unknown, maxItems = 60): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const raw of values) {
    const clean = normalizeScalarText(raw);
    if (!clean) continue;
    out.push(clean);
    if (out.length >= maxItems) break;
  }
  return out;
}

export function buildLogRevisionSnapshot(
  entry: Partial<LogEntry> | Partial<LogRevisionSnapshot>
): LogRevisionSnapshot {
  const titleRaw = normalizeScalarText(
    entry.title || ("logro" in entry ? entry.logro : undefined)
  );
  const title = titleRaw || "Logro registrado";
  const impactRaw = normalizeScalarText(entry.impact);
  const dateRaw = normalizeScalarText(entry.date);

  return {
    date: dateRaw.length >= 4 ? dateRaw : new Date().toISOString().substring(0, 10),
    client: normalizeScalarText(entry.client) || "General",
    project: normalizeScalarText(entry.project) || "General",
    category: normalizeScalarText(entry.category) || "Feature ✨",
    title,
    whatWasSought: normalizeScalarText(entry.whatWasSought),
    whyImportant: normalizeScalarText(entry.whyImportant),
    howApplied: normalizeScalarText(entry.howApplied),
    impact: impactRaw || title,
    description: normalizeScalarText(entry.description),
    tags: normalizeUniqueStringList(entry.tags, 25),
    experienceId: normalizeScalarText(entry.experienceId),
  };
}

export function buildExperienceRevisionSnapshot(
  exp: Partial<WorkExperience> | Partial<ExperienceRevisionSnapshot>,
  overrideBullets?: string[]
): ExperienceRevisionSnapshot {
  const isCurrent = Boolean(exp.isCurrent);
  const rawEndDate = isCurrent ? "" : normalizeScalarText(exp.endDate);
  const rawBullets = overrideBullets !== undefined ? overrideBullets : exp.bullets;

  return {
    company: normalizeScalarText(exp.company) || "Empresa",
    role: normalizeScalarText(exp.role) || "Rol Profesional",
    startDate: normalizeScalarText(exp.startDate),
    endDate: rawEndDate,
    isCurrent,
    location: normalizeScalarText(exp.location),
    summary: normalizeScalarText(exp.summary),
    bullets: normalizeBulletsList(rawBullets, 60),
    technologies: normalizeUniqueStringList(exp.technologies, 50),
    isPersonalProjects: Boolean(exp.isPersonalProjects),
  };
}

function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function areStringArraysEqualIgnoreCase(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].toLowerCase() !== b[i].toLowerCase()) return false;
  }
  return true;
}

export function computeLogChangedFields(
  prevInput: Partial<LogEntry> | LogRevisionSnapshot,
  nextInput: Partial<LogEntry> | LogRevisionSnapshot
): LogRevisionFieldKey[] {
  const prev = buildLogRevisionSnapshot(prevInput);
  const next = buildLogRevisionSnapshot(nextInput);
  const changed: LogRevisionFieldKey[] = [];

  for (const field of LOG_REVISION_FIELDS) {
    if (field === "tags") {
      if (!areStringArraysEqualIgnoreCase(prev.tags, next.tags)) {
        changed.push(field);
      }
      continue;
    }
    if (prev[field] !== next[field]) {
      changed.push(field);
    }
  }

  return changed;
}

export function computeExperienceChangedFields(
  prevInput: Partial<WorkExperience> | ExperienceRevisionSnapshot,
  nextInput: Partial<WorkExperience> | ExperienceRevisionSnapshot,
  prevBulletsOverride?: string[],
  nextBulletsOverride?: string[]
): ExperienceRevisionFieldKey[] {
  const prev = buildExperienceRevisionSnapshot(prevInput, prevBulletsOverride);
  const next = buildExperienceRevisionSnapshot(nextInput, nextBulletsOverride);
  const changed: ExperienceRevisionFieldKey[] = [];

  for (const field of EXPERIENCE_REVISION_FIELDS) {
    if (field === "bullets") {
      if (!areStringArraysEqual(prev[field], next[field])) {
        changed.push(field);
      }
      continue;
    }
    if (field === "technologies") {
      if (!areStringArraysEqualIgnoreCase(prev[field], next[field])) {
        changed.push(field);
      }
      continue;
    }
    if (prev[field] !== next[field]) {
      changed.push(field);
    }
  }

  return changed;
}

export function getRevisionFieldLabel(
  entityType: RevisionEntityType,
  field: string
): string {
  if (entityType === "log") {
    return LOG_FIELD_LABELS[field as LogRevisionFieldKey] || field;
  }
  return EXPERIENCE_FIELD_LABELS[field as ExperienceRevisionFieldKey] || field;
}

export function getRevisionFieldMeta(
  entityType: RevisionEntityType,
  field: string
): RevisionFieldMeta {
  if (entityType === "log") {
    return (
      LOG_FIELD_META[field as LogRevisionFieldKey] || {
        section: "Propiedad del Logro",
        propertyLabel: getRevisionFieldLabel("log", field),
        hint: "Campo editable del logro.",
      }
    );
  }
  return (
    EXPERIENCE_FIELD_META[field as ExperienceRevisionFieldKey] || {
      section: "Propiedad de la Experiencia",
      propertyLabel: getRevisionFieldLabel("experience", field),
      hint: "Campo editable de la experiencia.",
    }
  );
}

export function formatRevisionOriginLabel(source: RevisionSource): string {
  return REVISION_ORIGIN_LABELS[source] || "Edición";
}

export function formatChangedFieldsSummary(
  changedFields: string[],
  entityType: RevisionEntityType,
  source: RevisionSource
): string {
  if (source === "initial" || changedFields.length === 0) {
    return "Versión inicial";
  }

  const labels = changedFields.map((f) => getRevisionFieldLabel(entityType, f));
  if (labels.length <= 3) {
    return `Modificó: ${labels.join(", ")}`;
  }

  const shown = labels.slice(0, 3).join(", ");
  const remaining = labels.length - 3;
  return `Modificó: ${shown} (+${remaining} más)`;
}

export function normalizeRevisionUpdatesCount(value?: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.min(1000000, Math.trunc(value));
}

export function formatHistoryButtonLabel(
  updatesCount?: number,
  language: "es" | "en" = "es"
): string {
  const baseLabel = language === "en" ? "History" : "Historial";
  const count = normalizeRevisionUpdatesCount(updatesCount);
  return count > 0 ? `(${count}) ${baseLabel}` : baseLabel;
}
