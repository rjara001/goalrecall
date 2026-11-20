import { describe, expect, it } from "bun:test";
import { LogEntry, WorkExperience } from "../types";
import {
  buildExperienceExportFilename,
  buildExperienceExportJson,
  EXPERIENCE_JSON_VERSION,
  parseExperienceJson,
  reconcileImportedExperienceJson,
} from "./experienceJson";

const sampleExp: WorkExperience = {
  id: "exp-acme",
  userId: "uid-secret",
  company: "Acme Cloud Labs",
  role: "Staff Full Stack Engineer",
  startDate: "2023-01",
  endDate: "",
  isCurrent: true,
  location: "Santiago / Remoto",
  summary: "Liderazgo técnico de plataforma",
  bullets: ["Reduje latencia p99 en 42%"],
  technologies: ["TypeScript", "React", "Firestore"],
  createdAt: 1700000000000,
  updatedAt: 1700000500000,
};

const sampleLogs: LogEntry[] = [
  {
    id: "log-1",
    userId: "uid-secret",
    experienceId: "exp-acme",
    date: "2024-06-10",
    client: "Acme Cloud Labs",
    project: "Core API",
    category: "Architecture 🏗️",
    title: "Reduje latencia p99 en 42%",
    logro: "Reduje latencia p99 en 42%",
    impact: "42% menos latencia en checkout",
    whatWasSought: "Bajar p99 bajo 120ms",
    tags: ["#Performance"],
    isPublic: false,
    includeInCv: true,
    sortOrder: 0,
    createdAt: 1700000000000,
    updatedAt: 1700000100000,
  },
  {
    id: "log-2",
    userId: "uid-secret",
    experienceId: "exp-acme",
    date: "2024-08-15",
    client: "Acme Cloud Labs",
    project: "Auth",
    category: "Feature ✨",
    title: "Migración OAuth sin downtime",
    logro: "Migración OAuth sin downtime",
    impact: "100% usuarios migrados",
    tags: ["#Auth"],
    isPublic: true,
    includeInCv: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700000200000,
  },
  {
    id: "log-other",
    userId: "uid-secret",
    experienceId: "exp-other",
    date: "2022-01-01",
    client: "Other Corp",
    project: "Legacy",
    category: "Fix 🐛",
    title: "Otro logro no relacionado",
    impact: "N/A",
    tags: [],
    isPublic: false,
    includeInCv: true,
    createdAt: 1650000000000,
    updatedAt: 1650000000000,
  },
];

describe("experienceJson export & import", () => {
  it("builds sanitized export filename and JSON bundle with ordered child logs and no userId", () => {
    const filename = buildExperienceExportFilename(sampleExp);
    expect(filename.startsWith("experiencia-acme-cloud-labs-")).toBe(true);
    expect(filename.endsWith(".json")).toBe(true);

    const json = buildExperienceExportJson(sampleExp, sampleLogs);
    const parsedRaw = JSON.parse(json) as {
      version: string;
      experience: Record<string, unknown>;
      logs: Array<Record<string, unknown>>;
    };

    expect(parsedRaw.version).toBe(EXPERIENCE_JSON_VERSION);
    expect("userId" in parsedRaw.experience).toBe(false);
    expect(parsedRaw.experience.company).toBe("Acme Cloud Labs");
    expect(parsedRaw.experience.bullets).toEqual(["Reduje latencia p99 en 42%"]);
    expect(parsedRaw.logs.map((l) => l.id)).toEqual(["log-1", "log-2"]);
    expect("userId" in parsedRaw.logs[0]).toBe(false);
  });

  it("parses canonical bundles, flat experience objects, and log arrays while rejecting invalid payloads", () => {
    const canonical = parseExperienceJson(buildExperienceExportJson(sampleExp, sampleLogs));
    expect(canonical.success).toBe(true);
    if (canonical.success) {
      expect(canonical.data.experience?.company).toBe("Acme Cloud Labs");
      expect(canonical.data.logs.length).toBe(2);
    }

    const flat = parseExperienceJson(
      JSON.stringify({
        company: "Beta Co",
        role: "Lead Engineer",
        technologies: ["Go", "K8s"],
        bullets: ["Automated deploys"],
      })
    );
    expect(flat.success).toBe(true);
    if (flat.success) {
      expect(flat.data.experience?.company).toBe("Beta Co");
      expect(flat.data.experience?.bullets).toEqual(["Automated deploys"]);
    }

    const arrayPayload = parseExperienceJson(
      JSON.stringify(["Nuevo logro rápido", { title: "Segundo logro", impact: "+20%" }])
    );
    expect(arrayPayload.success).toBe(true);
    if (arrayPayload.success) {
      expect(arrayPayload.data.logs.map((l) => l.title)).toEqual([
        "Nuevo logro rápido",
        "Segundo logro",
      ]);
    }

    expect(parseExperienceJson("").success).toBe(false);
    expect(parseExperienceJson("{broken").success).toBe(false);
    expect(parseExperienceJson(JSON.stringify({ foo: "bar" })).success).toBe(false);
  });

  it("is lossless on re-import of unchanged JSON and preserves updatedAt on metadata-only edits", () => {
    const exported = buildExperienceExportJson(sampleExp, sampleLogs);
    const parsed = parseExperienceJson(exported);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const roundTrip = reconcileImportedExperienceJson(sampleExp, sampleLogs, parsed.data, 1800000000000);
    expect(roundTrip.hasChanges).toBe(false);
    expect(roundTrip.contentEditedLogs.length).toBe(0);
    expect(roundTrip.metadataOnlyLogs.length).toBe(0);
    expect(roundTrip.logsToCreate.length).toBe(0);
    expect(roundTrip.unchangedCount).toBe(2);

    // Edit content of log-1, metadata-only of log-2, add new log-3 + unlinked bullet
    const editedParsed = parseExperienceJson(
      JSON.stringify({
        experience: {
          ...sampleExp,
          company: "Acme Cloud Global",
          technologies: ["TypeScript", "React", "Firestore", "Go"],
          bullets: ["Bullet nuevo directo desde experience.bullets"],
        },
        logs: [
          {
            id: "log-1",
            title: "Reduje latencia p99 en 48% con cache distribuido",
            impact: "48% menos latencia",
          },
          {
            id: "log-2",
            title: "Migración OAuth sin downtime",
            isPublic: false,
            includeInCv: true,
            sortOrder: 3,
          },
          {
            title: "Nuevo logro añadido desde JSON",
            whatWasSought: "Automatizar CI/CD",
            impact: "Deploy 3x más rápido",
            isPublic: true,
          },
        ],
      })
    );
    expect(editedParsed.success).toBe(true);
    if (!editedParsed.success) return;

    const reconciled = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      editedParsed.data,
      1800000000000
    );

    expect(reconciled.hasChanges).toBe(true);
    expect(reconciled.experienceChanged).toBe(true);
    expect(reconciled.updatedExperience.company).toBe("Acme Cloud Global");
    expect(reconciled.contentEditedLogs.map((l) => l.id)).toEqual(["log-1"]);
    expect(reconciled.contentEditedLogs[0].updatedAt).toBe(1800000000000);

    expect(reconciled.metadataOnlyLogs.map((l) => l.id)).toEqual(["log-2"]);
    // Metadata-only log MUST retain its original updatedAt
    expect(reconciled.metadataOnlyLogs[0].updatedAt).toBe(1700000200000);
    expect(reconciled.metadataOnlyLogs[0].sortOrder).toBe(3);
    expect(reconciled.metadataOnlyLogs[0].includeInCv).toBe(true);
    expect(reconciled.metadataOnlyLogs[0].isPublic).toBe(false);

    expect(reconciled.logsToCreate.map((l) => l.title)).toEqual([
      "Nuevo logro añadido desde JSON",
      "Bullet nuevo directo desde experience.bullets",
    ]);
  });

  it("does not duplicate a log when logs[].title is edited while experience.bullets retains the previous mirrored bullet", () => {
    const exportedRaw = JSON.parse(buildExperienceExportJson(sampleExp, sampleLogs)) as {
      experience: Record<string, unknown>;
      logs: Array<Record<string, unknown>>;
    };

    // Simulate user editing only logs[0].title in the JSON editor without touching experience.bullets
    exportedRaw.logs[0].title = "Reduje latencia p99 en 55% con Edge Cache";
    exportedRaw.logs[0].date = "ab"; // invalid short date must fall back cleanly

    const parsed = parseExperienceJson(JSON.stringify(exportedRaw));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const reconciled = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      parsed.data,
      1800000000000
    );
    expect(reconciled.logsToCreate.length).toBe(0);
    expect(reconciled.contentEditedLogs.map((l) => l.id)).toEqual(["log-1"]);
    expect(reconciled.contentEditedLogs[0].date).toBe("2024-06-10");
    expect(reconciled.updatedExperience.bullets).toContain(
      "Reduje latencia p99 en 55% con Edge Cache"
    );

    const oversized = JSON.stringify({ company: "X", summary: "a".repeat(520 * 1024) });
    expect(parseExperienceJson(oversized).success).toBe(false);
  });
});
