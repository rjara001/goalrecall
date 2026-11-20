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
    expect(roundTrip.logsToDelete.length).toBe(0);
    expect(roundTrip.unchangedCount).toBe(2);

    // Edit content of log-1, metadata-only of log-2, add new log-3
    const editedParsed = parseExperienceJson(
      JSON.stringify({
        experience: {
          ...sampleExp,
          company: "Acme Cloud Global",
          technologies: ["TypeScript", "React", "Firestore", "Go"],
          bullets: ["Stale mirrored bullet should not auto-create extra log"],
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
    ]);
    expect(reconciled.logsToDelete.length).toBe(0);
  });

  it("replaces the entire achievement set when logs are removed, swapped without IDs, or emptied", () => {
    // 1. Remove log-2 from canonical JSON -> log-2 must be scheduled for deletion even if experience.bullets still contains it
    const partialReplace = parseExperienceJson(
      JSON.stringify({
        experience: {
          ...sampleExp,
          bullets: ["Reduje latencia p99 en 42%", "Migración OAuth sin downtime"],
        },
        logs: [
          {
            id: "log-1",
            title: "Reduje latencia p99 en 55% con Edge Cache",
            date: "ab", // invalid short date must fall back cleanly
          },
        ],
      })
    );
    expect(partialReplace.success).toBe(true);
    if (!partialReplace.success) return;

    const reconciledPartial = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      partialReplace.data,
      1800000000000
    );
    expect(reconciledPartial.logsToCreate.length).toBe(0);
    expect(reconciledPartial.contentEditedLogs.map((l) => l.id)).toEqual(["log-1"]);
    expect(reconciledPartial.contentEditedLogs[0].date).toBe("2024-06-10");
    expect(reconciledPartial.logsToDelete.map((l) => l.id)).toEqual(["log-2"]);
    expect(reconciledPartial.updatedExperience.bullets).toEqual([
      "Reduje latencia p99 en 55% con Edge Cache",
    ]);

    // 2. Replace with brand-new logs (no IDs) -> creates new ones and deletes both log-1 and log-2
    const fullSwap = parseExperienceJson(
      JSON.stringify({
        experience: { ...sampleExp },
        logs: [{ title: "Logro completamente nuevo A" }, { title: "Logro completamente nuevo B" }],
      })
    );
    expect(fullSwap.success).toBe(true);
    if (!fullSwap.success) return;

    const reconciledSwap = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      fullSwap.data,
      1800000000000
    );
    expect(reconciledSwap.logsToCreate.map((l) => l.title)).toEqual([
      "Logro completamente nuevo A",
      "Logro completamente nuevo B",
    ]);
    expect(reconciledSwap.logsToDelete.map((l) => l.id)).toEqual(["log-1", "log-2"]);
    expect(reconciledSwap.updatedExperience.bullets).toEqual([
      "Logro completamente nuevo A",
      "Logro completamente nuevo B",
    ]);

    // 3. Explicit empty logs: [] wipes experience achievements cleanly to []
    const emptyLogs = parseExperienceJson(
      JSON.stringify({
        experience: { ...sampleExp },
        logs: [],
      })
    );
    expect(emptyLogs.success).toBe(true);
    if (!emptyLogs.success) return;

    const reconciledEmpty = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      emptyLogs.data,
      1800000000000
    );
    expect(reconciledEmpty.logsToCreate.length).toBe(0);
    expect(reconciledEmpty.logsToDelete.map((l) => l.id)).toEqual(["log-1", "log-2"]);
    expect(reconciledEmpty.updatedExperience.bullets).toEqual([]);

    // 4. Flat experience payload with bullets (no logs field) replaces prior logs cleanly
    const flatReplace = parseExperienceJson(
      JSON.stringify({
        company: "Acme Cloud Labs",
        role: "Principal Engineer",
        bullets: ["Único logro reemplazante desde bullets"],
      })
    );
    expect(flatReplace.success).toBe(true);
    if (!flatReplace.success) return;

    const reconciledFlat = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      flatReplace.data,
      1800000000000
    );
    expect(reconciledFlat.logsToCreate.map((l) => l.title)).toEqual([
      "Único logro reemplazante desde bullets",
    ]);
    expect(reconciledFlat.logsToDelete.map((l) => l.id)).toEqual(["log-1", "log-2"]);
    expect(reconciledFlat.updatedExperience.bullets).toEqual([
      "Único logro reemplazante desde bullets",
    ]);

    const oversized = JSON.stringify({ company: "X", summary: "a".repeat(520 * 1024) });
    expect(parseExperienceJson(oversized).success).toBe(false);
  });

  it("activates hasChanges when editing experience.bullets directly without touching logs[], and preserves legacy unlinked snapshots", () => {
    // 1. Canonical export where user edits experience.bullets[0] directly at the top of the JSON
    const exportedRaw = JSON.parse(buildExperienceExportJson(sampleExp, sampleLogs)) as {
      experience: { bullets: string[] };
      logs: Array<Record<string, unknown>>;
    };
    expect("logro" in exportedRaw.logs[0]).toBe(false); // redundant logro omitted when identical to title

    exportedRaw.experience.bullets = ["Reduje latencia p99 en 60% directo en bullets"];
    const parsedBulletEdit = parseExperienceJson(JSON.stringify(exportedRaw));
    expect(parsedBulletEdit.success).toBe(true);
    if (!parsedBulletEdit.success) return;

    const reconciledBulletEdit = reconcileImportedExperienceJson(
      sampleExp,
      sampleLogs,
      parsedBulletEdit.data,
      1800000000000
    );
    expect(reconciledBulletEdit.hasChanges).toBe(true);
    expect(reconciledBulletEdit.contentEditedLogs.map((l) => l.id)).toEqual(["log-1"]);
    expect(reconciledBulletEdit.contentEditedLogs[0].title).toBe(
      "Reduje latencia p99 en 60% directo en bullets"
    );
    // Hidden Bitácora log (log-2, includeInCv: false) is not wiped just for editing bullets[]
    expect(reconciledBulletEdit.logsToDelete.length).toBe(0);

    // 2. Legacy experience with 0 logs and unlinked bullets must report hasChanges=false on open,
    // and hasChanges=true when a bullet is edited
    const legacyExp: WorkExperience = {
      ...sampleExp,
      id: "exp-legacy",
      bullets: ["Legacy bullet A", "Legacy bullet B"],
    };
    const legacyExport = buildExperienceExportJson(legacyExp, []);
    const parsedLegacyUnchanged = parseExperienceJson(legacyExport);
    expect(parsedLegacyUnchanged.success).toBe(true);
    if (!parsedLegacyUnchanged.success) return;

    const roundTripLegacy = reconcileImportedExperienceJson(
      legacyExp,
      [],
      parsedLegacyUnchanged.data,
      1800000000000
    );
    expect(roundTripLegacy.hasChanges).toBe(false);

    const legacyObj = JSON.parse(legacyExport) as { experience: { bullets: string[] }; logs: unknown[] };
    legacyObj.experience.bullets[0] = "Legacy bullet A editado";
    const parsedLegacyEdited = parseExperienceJson(JSON.stringify(legacyObj));
    expect(parsedLegacyEdited.success).toBe(true);
    if (!parsedLegacyEdited.success) return;

    const reconciledLegacyEdited = reconcileImportedExperienceJson(
      legacyExp,
      [],
      parsedLegacyEdited.data,
      1800000000000
    );
    expect(reconciledLegacyEdited.hasChanges).toBe(true);
    expect(reconciledLegacyEdited.logsToCreate.map((l) => l.title)).toEqual([
      "Legacy bullet A editado",
      "Legacy bullet B",
    ]);
  });
});
