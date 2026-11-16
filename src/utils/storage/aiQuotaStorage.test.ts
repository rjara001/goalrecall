import { beforeEach, describe, expect, it } from "bun:test";
import {
  AI_COOLDOWN_MS,
  MAX_FREE_MONTHLY_AI_USES,
  checkCanUseAi,
  getAiUsage,
  getProWaitlistEmails,
  recordAiUsage,
  saveProWaitlistEmail,
} from "./aiQuotaStorage";
import { STORAGE_KEYS } from "./keys";

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => store.set(key, String(val)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
    configurable: true,
  });
}

describe("aiQuotaStorage", () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  it("enforces free monthly AI limit and cooldown window", () => {
    const t0 = 1_750_000_000_000;
    expect(checkCanUseAi("free", t0).canUse).toBe(true);

    recordAiUsage(t0);
    const duringCooldown = checkCanUseAi("free", t0 + 1000);
    expect(duringCooldown.canUse).toBe(false);
    expect(duringCooldown.cooldownRemainingMs).toBeGreaterThan(0);

    recordAiUsage(t0 + AI_COOLDOWN_MS + 10);
    recordAiUsage(t0 + AI_COOLDOWN_MS * 2 + 20);

    const exhausted = checkCanUseAi("free", t0 + AI_COOLDOWN_MS * 3 + 30);
    expect(exhausted.canUse).toBe(false);
    expect(exhausted.remaining).toBe(0);
    expect(getAiUsage(new Date(t0)).count).toBe(MAX_FREE_MONTHLY_AI_USES);
  });

  it("resets usage counter automatically when month changes", () => {
    const jan = new Date("2026-01-15T12:00:00.000Z");
    localStorage.setItem(
      STORAGE_KEYS.AI_USAGE,
      JSON.stringify({ monthKey: "2026-01", count: 3, lastUsed: jan.getTime() })
    );

    const feb = new Date("2026-02-01T12:00:00.000Z");
    const usage = getAiUsage(feb);
    expect(usage.monthKey).toBe("2026-02");
    expect(usage.count).toBe(0);
  });

  it("deduplicates waitlist emails case-insensitively", () => {
    expect(saveProWaitlistEmail("invalid")).toBe(false);
    expect(saveProWaitlistEmail("Dev@Example.com")).toBe(true);
    expect(saveProWaitlistEmail("dev@example.com")).toBe(true);
    expect(getProWaitlistEmails()).toEqual(["dev@example.com"]);
  });
});
