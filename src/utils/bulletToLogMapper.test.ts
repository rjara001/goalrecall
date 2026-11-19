import { describe, expect, test } from "bun:test";
import {
  buildLogFromExtractedBullet,
  buildLogFromSavedExperienceBullet,
  deriveExperienceBulletsFromLogs,
  findLegacyUnlinkedBullets,
  getExperienceBulletItems,
  healExperiencesFromLogs,
  inferCategoryForExtractedBullet,
  inferCategoryForSavedExperienceBullet,
  isLogIncludedInCv,
} from "./bulletToLogMapper";
import { LogEntry, WorkExperience } from "../types";

describe("bulletToLogMapper", () => {
  test("healExperiencesFromLogs populates empty bullets from matching logs", () => {
    const exps: WorkExperience[] = [
      {
        id: "exp-1",
        company: "Acme Corp",
        role: "Staff Engineer",
        startDate: "2023",
        bullets: [],
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "exp-2",
        company: "Beta Labs",
        role: "Senior Dev",
        startDate: "2021",
        bullets: ["Existing bullet"],
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const logs: LogEntry[] = [
      {
        id: "log-1",
        experienceId: "exp-1",
        originalBullet: "Reduced latency by 45%",
        date: "2023-05-01",
        client: "Acme Corp",
        project: "API",
        category: "Feature ✨",
        title: "Latency work",
        impact: "45% faster",
        tags: [],
        isPublic: false,
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const result = healExperiencesFromLogs(exps, logs);
    expect(result.changed).toBe(true);
    expect(result.experiences[0].bullets).toEqual(["Reduced latency by 45%"]);
    expect(result.experiences[1].bullets).toEqual(["Existing bullet"]);
  });

  test("inferCategoryForSavedExperienceBullet detects domain categories", () => {
    expect(inferCategoryForSavedExperienceBullet("Campaña de adquisición redujo CAC")).toBe(
      "Campaña / Growth 📈"
    );
    expect(inferCategoryForSavedExperienceBullet("Migración de pipelines CI/CD en AWS")).toBe(
      "Refactor 🧹"
    );
    expect(inferCategoryForSavedExperienceBullet("Infraestructura automatizada con Docker")).toBe(
      "Infra/DevOps 🚀"
    );
  });

  test("inferCategoryForExtractedBullet classifies engineering signals", () => {
    expect(inferCategoryForExtractedBullet("Fixed critical production memory bug")).toBe("Fix 🐛");
    expect(inferCategoryForExtractedBullet("Designed microservices architecture")).toBe(
      "Architecture 🏗️"
    );
    expect(inferCategoryForExtractedBullet("AI Copilot PoC investigation")).toBe("Spike/R&D 🔬");
  });

  test("buildLogFromExtractedBullet truncates titles cleanly and formats tech tags", () => {
    const longBullet =
      "Led migration of core billing engine to distributed event workers across regions. Additional secondary notes that should not bloat the title.";
    const log = buildLogFromExtractedBullet({
      experienceId: "exp-1",
      company: "CloudTech",
      role: "Architect",
      bulletText: longBullet,
      technologies: ["Node.js", "Type Script", "AWS", "Kafka", "Redis"],
      date: "2025-01-15",
    });

    expect(log).not.toBeNull();
    expect(log?.title).toBe("Led migration of core billing engine to distributed event workers across regions");
    expect(log?.tags).toEqual(["#Nodejs", "#TypeScript", "#AWS", "#Kafka"]);
    expect(log?.isPublic).toBe(false);
    expect(log?.includeInCv).toBe(true);
    expect(log?.date).toBe("2025-01-15");
  });

  test("buildLogFromSavedExperienceBullet normalizes 4-digit startDate to ISO date", () => {
    const entry = buildLogFromSavedExperienceBullet(
      {
        company: "FinPay",
        role: "Lead",
        startDate: "2024",
        technologies: ["Go"],
      },
      "exp-9",
      "Built settlement engine"
    );
    expect(entry.date).toBe("2024-01-01");
    expect(entry.experienceId).toBe("exp-9");
    expect(entry.isPublic).toBe(false);
    expect(entry.includeInCv).toBe(true);
  });

  test("deriveExperienceBulletsFromLogs uses live log.title, honors includeInCv, and prevents hidden logs from resurfacing as legacy strings", () => {
    const exp: WorkExperience = {
      id: "exp-1",
      company: "Acme Corp",
      role: "Staff Engineer",
      startDate: "2023",
      bullets: [
        "Old bullet text before edit",
        "Hidden bullet kept in logbook only",
        "Legacy unlinked production migration",
      ],
      createdAt: 1,
      updatedAt: 1,
    };

    const logs: LogEntry[] = [
      {
        id: "log-1",
        experienceId: "exp-1",
        originalBullet: "Old bullet text before edit",
        title: "New edited achievement bullet in Bitacora",
        date: "2024-02-01",
        client: "Acme Corp",
        project: "Core",
        category: "Architecture 🏗️",
        impact: "-40% latency",
        tags: [],
        isPublic: false,
        includeInCv: true,
        createdAt: 1,
        updatedAt: 2,
      },
      {
        id: "log-2",
        experienceId: "exp-1",
        originalBullet: "Hidden bullet kept in logbook only",
        title: "Hidden bullet kept in logbook only",
        date: "2024-03-01",
        client: "Acme Corp",
        project: "Core",
        category: "Fix 🐛",
        impact: "Fixed memory leak",
        tags: [],
        isPublic: false,
        includeInCv: false,
        createdAt: 1,
        updatedAt: 2,
      },
    ];

    expect(isLogIncludedInCv(logs[0])).toBe(true);
    expect(isLogIncludedInCv(logs[1])).toBe(false);
    expect(isLogIncludedInCv({ ...logs[1], includeInCv: undefined })).toBe(true);

    expect(findLegacyUnlinkedBullets(exp, logs)).toEqual([
      "Legacy unlinked production migration",
    ]);

    const items = getExperienceBulletItems(exp, logs);
    expect(items).toHaveLength(2);
    expect(items[0].text).toBe("New edited achievement bullet in Bitacora");
    expect(items[0].log?.id).toBe("log-1");
    expect(items[0].isLegacyUnlinked).toBe(false);
    expect(items[1].text).toBe("Legacy unlinked production migration");
    expect(items[1].isLegacyUnlinked).toBe(true);

    expect(deriveExperienceBulletsFromLogs(exp, logs)).toEqual([
      "New edited achievement bullet in Bitacora",
      "Legacy unlinked production migration",
    ]);
  });
});
