import { afterEach, describe, expect, it } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";
import { createCloudSyncStore, RESERVED_USERNAMES } from "./cloudSyncStore";

const tempDirs: string[] = [];

function createTempStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "goalrecall-sync-"));
  tempDirs.push(dir);
  return createCloudSyncStore(dir);
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("cloudSyncStore", () => {
  it("persists and loads user backup records and updates username index", () => {
    const store = createTempStore();
    store.writeRecord({
      userKey: "usr-123",
      updatedAt: 1000,
      payload: {
        user: { id: "usr-123", username: "dev_alex", email: "alex@example.com" },
        logs: [{ id: "log-1", isPublic: true }],
      },
    });
    store.setUsernameIndex("dev_alex", "usr-123");

    expect(store.readRecord("usr-123")?.payload.logs).toHaveLength(1);
    expect(store.findUserKeyByIdentifier("dev_alex")).toBe("usr-123");
    expect(store.findUserKeyByIdentifier("alex")).toBe("usr-123");
  });

  it("removes username from index and deletes showcase file cleanly", () => {
    const store = createTempStore();
    store.writeRecord({
      userKey: "usr-456",
      updatedAt: 2000,
      payload: { user: { id: "usr-456", username: "maria_dev" } },
    });
    store.setUsernameIndex("maria_dev", "usr-456");

    store.deleteShowcaseByUsername("maria_dev");

    expect(store.getUsernameIndex()["maria_dev"]).toBeUndefined();
    expect(store.readRecord("usr-456")).toBeNull();
  });

  it("generates available username suggestions avoiding reserved and taken names", () => {
    const store = createTempStore();
    const suggestions = store.generateUsernameSuggestions("admin", { admin001: "usr-other" });

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions).not.toContain("admin001");
    for (const s of suggestions) {
      expect(RESERVED_USERNAMES.has(s)).toBe(false);
    }
  });
});
