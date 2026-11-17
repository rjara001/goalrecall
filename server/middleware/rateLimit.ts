export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInHours: number;
  limitType: "uid" | "ip";
}

const DAY_MS = 24 * 60 * 60 * 1000;
const AUTHENTICATED_DAILY_LIMIT = 5;
const GUEST_DAILY_LIMIT = 2;

export function createAiRateLimiter(store = new Map<string, RateLimitEntry>()) {
  return function checkAiRateLimit(
    userId?: string,
    ip?: string,
    now: number = Date.now()
  ): RateLimitResult {
    if (store.size > 2000) {
      for (const [k, v] of store.entries()) {
        if (v.resetAt <= now) store.delete(k);
      }
    }

    const isAuthUser = Boolean(userId && userId !== "usr-guest" && userId.trim().length > 0);
    const key = isAuthUser && userId ? `uid:${userId.trim()}` : `ip:${ip || "unknown"}`;
    const maxLimit = isAuthUser ? AUTHENTICATED_DAILY_LIMIT : GUEST_DAILY_LIMIT;
    const limitType: "uid" | "ip" = isAuthUser ? "uid" : "ip";

    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + DAY_MS };
      store.set(key, entry);
    }

    const remainingBefore = Math.max(0, maxLimit - entry.count);
    const resetInHours = Math.max(1, Math.ceil((entry.resetAt - now) / (60 * 60 * 1000)));

    if (entry.count >= maxLimit) {
      return { allowed: false, remaining: 0, resetInHours, limitType };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: Math.max(0, remainingBefore - 1),
      resetInHours,
      limitType,
    };
  };
}

export const checkAiRateLimit = createAiRateLimiter();
