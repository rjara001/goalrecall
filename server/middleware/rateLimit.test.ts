import { describe, expect, it } from "bun:test";
import { createAiRateLimiter } from "./rateLimit";

describe("createAiRateLimiter", () => {
  it("allows 2 requests per day for anonymous IPs and blocks the 3rd", () => {
    const check = createAiRateLimiter();
    const t0 = 1_700_000_000_000;

    const first = check(undefined, "10.0.0.1", t0);
    const second = check("usr-guest", "10.0.0.1", t0 + 1000);
    const third = check(undefined, "10.0.0.1", t0 + 2000);

    expect(first).toEqual({ allowed: true, remaining: 1, resetInHours: 24, limitType: "ip" });
    expect(second).toEqual({ allowed: true, remaining: 0, resetInHours: 24, limitType: "ip" });
    expect(third.allowed).toBe(false);
    expect(third.limitType).toBe("ip");
  });

  it("allows 5 requests per day per authenticated UID and resets after 24h", () => {
    const check = createAiRateLimiter();
    const t0 = 1_700_000_000_000;

    for (let i = 0; i < 5; i++) {
      expect(check("uid-123", "10.0.0.1", t0 + i).allowed).toBe(true);
    }
    expect(check("uid-123", "10.0.0.1", t0 + 10).allowed).toBe(false);

    const afterDay = check("uid-123", "10.0.0.1", t0 + 24 * 60 * 60 * 1000 + 1);
    expect(afterDay.allowed).toBe(true);
    expect(afterDay.remaining).toBe(4);
  });
});
