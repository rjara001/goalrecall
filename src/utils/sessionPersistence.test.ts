// Mock localStorage for test environment if running under bun test / Node
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
}

if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = globalThis;
}

import { describe, it, expect, beforeEach } from "bun:test";
import {
  saveUser,
  getStoredUser,
  clearSessionData,
  registerCustomAccount,
  authenticateCustomAccount,
  STORAGE_KEYS,
  INITIAL_USER,
} from "./storage";
import { UserProfile } from "../types";

describe("Session persistence across refresh", () => {
  beforeEach(() => {
    clearSessionData();
    localStorage.clear();
  });

  it("persists user session in storage on saveUser and recovers it", () => {
    const testUser: UserProfile = {
      ...INITIAL_USER,
      id: "usr-session-123",
      email: "test@goalrecall.com",
      name: "Rodrigo Jara",
      username: "rjara001",
      authProvider: "custom",
    };

    saveUser(testUser);

    // Verify localStorage has persisted user data
    const rawStored = localStorage.getItem(STORAGE_KEYS.USER);
    expect(rawStored).not.toBeNull();
    const parsed = JSON.parse(rawStored!);
    expect(parsed.email).toBe("test@goalrecall.com");
    expect(parsed.username).toBe("rjara001");

    // Recover user
    const recovered = getStoredUser();
    expect(recovered).not.toBeNull();
    expect(recovered?.id).toBe("usr-session-123");
    expect(recovered?.email).toBe("test@goalrecall.com");
    expect(recovered?.username).toBe("rjara001");
  });

  it("clears persisted session on clearSessionData", () => {
    const testUser: UserProfile = {
      ...INITIAL_USER,
      id: "usr-to-logout",
      email: "logout@goalrecall.com",
      name: "Logout User",
    };

    saveUser(testUser);
    expect(getStoredUser()).not.toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).not.toBeNull();

    clearSessionData();
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it("persists custom registered accounts across reloads", () => {
    const regResult = registerCustomAccount({
      name: "Rodrigo Jara",
      email: "rjara@example.com",
      password: "secretpassword123",
      username: "rjara001",
    });

    expect(regResult.success).toBe(true);
    expect(regResult.user?.username).toBe("rjara001");

    // Check account persisted in storage
    const authResult = authenticateCustomAccount("rjara@example.com", "secretpassword123");
    expect(authResult.success).toBe(true);
    expect(authResult.user?.username).toBe("rjara001");
  });
});
