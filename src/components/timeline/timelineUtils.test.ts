import { describe, expect, test } from "bun:test";
import {
  cleanExperienceBullets,
  computeTotalBulletsCount,
  filterTimelineLogs,
  groupLogsByExperience,
} from "./timelineUtils";
import { LogEntry, WorkExperience } from "../../types";

const makeExp = (overrides: Partial<WorkExperience> = {}): WorkExperience => ({
  id: "exp-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  startDate: "2023",
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

const makeLog = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: "log-1",
  date: "2026-11-10",
  client: "Acme Corp",
  project: "Core API",
  category: "Feature ✨",
  title: "Reduced P95 latency by 60%",
  impact: "60% faster checkout",
  tags: ["#Node", "#Redis"],
  isPublic: false,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

describe("timelineUtils", () => {
  test("cleanExperienceBullets strips bullet markers and drops page numbers", () => {
    const exp = makeExp({
      bullets: [
        "• Built distributed cache layer serving 20k RPS",
        "1 of 2",
        "short",
        "- Automated CI/CD pipelines across 12 services",
      ],
    });
    expect(cleanExperienceBullets(exp, [])).toEqual([
      "Built distributed cache layer serving 20k RPS",
      "Automated CI/CD pipelines across 12 services",
    ]);
  });

  test("computeTotalBulletsCount falls back to linked logs count when bullets array is empty", () => {
    const exp = makeExp({ id: "exp-1", bullets: [] });
    const logs = [makeLog({ experienceId: "exp-1" }), makeLog({ id: "log-2", experienceId: "exp-1" })];
    expect(computeTotalBulletsCount([exp], logs)).toBe(2);
  });

  test("filterTimelineLogs applies visibility, tag, search and date range filters", () => {
    const nowMs = new Date("2026-11-16T12:00:00Z").getTime();
    const logs = [
      makeLog({ id: "recent-pub", date: "2026-11-12", isPublic: true, tags: ["#AWS"] }),
      makeLog({ id: "old-priv", date: "2026-06-01", isPublic: false, tags: ["#AWS"] }),
    ];
    const filtered = filterTimelineLogs(logs, {
      search: "latency",
      selectedClient: "all",
      selectedCategory: "Todas",
      selectedTag: "#AWS",
      selectedVisibility: "public_only",
      dateRange: "7d",
      nowMs,
    });
    expect(filtered.map((l) => l.id)).toEqual(["recent-pub"]);
  });

  test("groupLogsByExperience matches by experienceId or company name and isolates unassigned", () => {
    const exps = [makeExp({ id: "exp-1", company: "Acme Corp" })];
    const logs = [
      makeLog({ id: "l1", experienceId: "exp-1" }),
      makeLog({ id: "l2", experienceId: undefined, client: "acme corp" }),
      makeLog({ id: "l3", experienceId: undefined, client: "Other Inc" }),
    ];
    const grouped = groupLogsByExperience(exps, logs);
    expect(grouped.result[0].logs.map((l) => l.id)).toEqual(["l1", "l2"]);
    expect(grouped.unassigned.map((l) => l.id)).toEqual(["l3"]);
  });
});
