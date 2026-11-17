import { beforeEach, describe, expect, it } from "bun:test";
import {
  checkLocalUsernameAvailability,
  sanitizeUsername,
} from "./authStorage";
import { exportBackupJson, importBackupJson } from "./backupStorage";
import { computePayloadHash } from "./cloudSyncClient";
import { addExperience } from "./experiencesStorage";
import { addLog, getStoredLogs } from "./logsStorage";
import { workspaceState } from "./workspaceState";

describe("storage domain modules", () => {
  beforeEach(() => {
    workspaceState.experiences = [];
    workspaceState.logs = [];
    workspaceState.user = null;
    workspaceState.cv = null;
    workspaceState.inbox = [];
    workspaceState.jobOffers = [];
    workspaceState.products = [];
    workspaceState.customAccounts = [];
  });

  it("sanitizes usernames and rejects reserved handles", () => {
    expect(sanitizeUsername("  Alex.Dev!  ")).toBe("alexdev");
    const reserved = checkLocalUsernameAvailability("admin");
    expect(reserved.available).toBe(false);
    expect(reserved.suggestions?.length).toBeGreaterThan(0);

    expect(checkLocalUsernameAvailability("valid_user_99").available).toBe(true);
  });

  it("links new logs to matching existing experience and round-trips backup JSON", () => {
    const exp = addExperience({
      company: "Acme Corp",
      role: "Staff Engineer",
      startDate: "2024",
    });

    const log = addLog({
      client: "Acme Corp",
      project: "Core API",
      category: "Architecture 🏗️",
      title: "Cut p99 latency by 40%",
      description: "Redesigned cache layer",
      impact: "40% faster checkout",
      date: "2026-01-10",
      tags: ["#Redis"],
      isPublic: false,
    });

    expect(log.experienceId).toBe(exp.id);
    expect(log.isPublic).toBe(false);

    const exported = exportBackupJson();
    workspaceState.logs = [];
    const imported = importBackupJson(exported);

    expect(imported.success).toBe(true);
    expect(imported.count).toBe(1);
    expect(getStoredLogs()).toHaveLength(1);
  });

  it("computes deterministic hashes for identical payloads", () => {
    const h1 = computePayloadHash({ a: 1, b: ["x", "y"] });
    const h2 = computePayloadHash({ a: 1, b: ["x", "y"] });
    const h3 = computePayloadHash({ a: 2, b: ["x", "y"] });

    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
  });
});
