import { describe, expect, it } from "bun:test";
import { LogEntry, WorkExperience } from "../../types";
import { buildRevisionFieldDiffs, diffLines, diffWords } from "./diff";
import {
  buildExperienceRevisionSnapshot,
  buildLogRevisionSnapshot,
  computeExperienceChangedFields,
  computeLogChangedFields,
  formatChangedFieldsSummary,
  formatHistoryButtonLabel,
  normalizeRevisionUpdatesCount,
  normalizeScalarText,
} from "./snapshot";

describe("Revision Snapshot Normalization & Change Detection", () => {
  it("treats invisible whitespace, CRLF, and trailing blank lines as no-op edits on logs", () => {
    const baseLog: Partial<LogEntry> = {
      title: "Reduje latencia de API en 42%\nmediante caché Redis.",
      impact: "Ahorro de 180ms p95",
      whatWasSought: "Bajar latencia en checkout",
      whyImportant: "",
      howApplied: undefined,
      description: "Primer párrafo.\nSegundo párrafo.",
      tags: ["Redis", "Backend", "Go"],
      date: "2026-03-10",
      client: "Acme Corp",
      project: "Checkout",
      category: "Architecture 🏗️",
      experienceId: "exp-1",
    };

    const noisyEdit: Partial<LogEntry> = {
      ...baseLog,
      title: "  Reduje latencia de API en 42%   \r\nmediante caché Redis.  \n\n",
      impact: "  Ahorro de 180ms p95 ",
      whyImportant: "   ",
      howApplied: "\r\n",
      description: "Primer párrafo.   \r\nSegundo párrafo.\n",
      tags: ["go", "  Redis ", "", "Backend", "redis"],
      client: " Acme Corp  ",
    };

    expect(normalizeScalarText("  Hola   \r\nmundo  \n")).toBe("Hola\nmundo");
    expect(computeLogChangedFields(baseLog, noisyEdit)).toEqual([]);
  });

  it("ignores endDate differences when experience isCurrent is true, and respects bullet ordering", () => {
    const baseExp: Partial<WorkExperience> = {
      company: "Acme Cloud",
      role: "Staff Engineer",
      startDate: "2024-01",
      endDate: "Presente",
      isCurrent: true,
      location: "Remoto",
      summary: "Liderazgo técnico.",
      bullets: ["Migración a Kubernetes", "Observabilidad con OpenTelemetry"],
      technologies: ["Kubernetes", "Go", "Terraform"],
      isPersonalProjects: false,
    };

    const cosmeticExp: Partial<WorkExperience> = {
      ...baseExp,
      endDate: "",
      location: "  Remoto ",
      technologies: ["  terraform ", "Go", "kubernetes", "go"],
      bullets: ["  Migración a Kubernetes  ", "Observabilidad con OpenTelemetry\r\n"],
    };

    expect(computeExperienceChangedFields(baseExp, cosmeticExp)).toEqual([]);

    const reorderedBulletsExp: Partial<WorkExperience> = {
      ...baseExp,
      bullets: ["Observabilidad con OpenTelemetry", "Migración a Kubernetes"],
    };
    expect(computeExperienceChangedFields(baseExp, reorderedBulletsExp)).toEqual([
      "bullets",
    ]);
  });

  it("produces clean Spanish summaries for changedFields and initial versions", () => {
    expect(formatChangedFieldsSummary([], "log", "initial")).toBe("Versión inicial");
    expect(formatChangedFieldsSummary(["title", "impact"], "log", "manual_form")).toBe(
      "Modificó: Logro / Viñeta, Impacto"
    );
    expect(
      formatChangedFieldsSummary(
        ["company", "role", "summary", "bullets", "technologies"],
        "experience",
        "json_editor"
      )
    ).toBe("Modificó: Empresa, Rol / Puesto, Resumen del rol (+2 más)");
  });

  it("falls back impact to title in LogRevisionSnapshot just like Firestore persistence", () => {
    const snap = buildLogRevisionSnapshot({
      title: "Lanzamiento v2 sin caídas",
      impact: "   ",
      tags: ["Release"],
    });
    expect(snap.impact).toBe("Lanzamiento v2 sin caídas");
    expect(snap.tags).toEqual(["Release"]);
  });

  it("computes word-level and line-level visual diffs accurately", () => {
    const wordDiff = diffWords(
      "Optimicé consultas SQL reduciendo latencia en 30%",
      "Optimicé consultas PostgreSQL reduciendo latencia en 55%"
    );
    expect(wordDiff.some((s) => s.type === "removed" && s.text.includes("SQL"))).toBe(true);
    expect(
      wordDiff.some((s) => s.type === "added" && s.text.includes("PostgreSQL"))
    ).toBe(true);
    expect(wordDiff.some((s) => s.type === "removed" && s.text.includes("30%"))).toBe(true);
    expect(wordDiff.some((s) => s.type === "added" && s.text.includes("55%"))).toBe(true);

    const lineDiff = diffLines(
      ["Bullet A", "Bullet B"],
      ["Bullet A", "Bullet B v2", "Bullet C"]
    );
    expect(lineDiff.map((l) => l.type)).toEqual([
      "equal",
      "removed",
      "added",
      "added",
    ]);
  });

  it("builds structured field diffs for Experience snapshots", () => {
    const base = buildExperienceRevisionSnapshot({
      company: "Acme",
      role: "Backend Engineer",
      startDate: "2023-01",
      isCurrent: true,
      bullets: ["A", "B"],
      technologies: ["Go"],
    });
    const target = buildExperienceRevisionSnapshot({
      company: "Acme",
      role: "Senior Backend Engineer",
      startDate: "2023-01",
      isCurrent: true,
      bullets: ["A", "B", "C"],
      technologies: ["Go", "PostgreSQL"],
    });

    const diffs = buildRevisionFieldDiffs("experience", base, target);
    const modifiedFields = diffs
      .filter((d) => d.status !== "unchanged")
      .map((d) => d.field);

    expect(modifiedFields).toEqual(["role", "bullets", "technologies"]);
    const roleDiff = diffs.find((d) => d.field === "role");
    expect(roleDiff?.newSegments.some((s) => s.type === "added" && s.text.includes("Senior"))).toBe(
      true
    );
  });

  it("formats History button label with update count '(N) Historial' only when updatesCount > 0", () => {
    expect(formatHistoryButtonLabel(undefined, "es")).toBe("Historial");
    expect(formatHistoryButtonLabel(0, "es")).toBe("Historial");
    expect(formatHistoryButtonLabel(-3, "es")).toBe("Historial");
    expect(formatHistoryButtonLabel(NaN, "es")).toBe("Historial");
    expect(formatHistoryButtonLabel(4, "es")).toBe("(4) Historial");
    expect(formatHistoryButtonLabel(4.9, "es")).toBe("(4) Historial");
    expect(formatHistoryButtonLabel(4, "en")).toBe("(4) History");
    expect(formatHistoryButtonLabel(0, "en")).toBe("History");
    expect(normalizeRevisionUpdatesCount(25)).toBe(25);
    expect(normalizeRevisionUpdatesCount(-1)).toBe(0);
  });

  it("includes clear section, propertyLabel, and hint metadata on log field diffs", () => {
    const base = buildLogRevisionSnapshot({
      title: "Migración a microservicios",
      whatWasSought: "Reducir acoplamiento del checkout",
    });
    const target = buildLogRevisionSnapshot({
      title: "Migración a microservicios",
      whatWasSought: "Desacoplar checkout para soportar 15k rps",
    });

    const diffs = buildRevisionFieldDiffs("log", base, target);
    const whatDiff = diffs.find((d) => d.field === "whatWasSought");
    expect(whatDiff?.status).toBe("modified");
    expect(whatDiff?.section).toBe("Contexto STAR del Logro");
    expect(whatDiff?.propertyLabel).toContain("¿Qué se buscaba lograr?");
    expect(whatDiff?.hint.length).toBeGreaterThan(10);
  });
});
