import { AiUsageRecord } from "../../types";

export const MAX_FREE_MONTHLY_AI_USES = 3;
export const AI_COOLDOWN_MS = 10_000;

let inMemoryAiUsage: AiUsageRecord | null = null;
let inMemoryWaitlist: string[] = [];

export const resetInMemoryAiQuotaForTests = (): void => {
  inMemoryAiUsage = null;
  inMemoryWaitlist = [];
};

export const getAiUsage = (
  now: Date = new Date(),
  overrideRecord?: AiUsageRecord | null
): AiUsageRecord => {
  const currentMonthKey = now.toISOString().substring(0, 7);
  const source = overrideRecord ?? inMemoryAiUsage;
  if (!source) {
    return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
  }
  if (source.monthKey !== currentMonthKey) {
    return {
      monthKey: currentMonthKey,
      count: 0,
      lastUsed: source.lastUsed || 0,
    };
  }
  return source;
};

export const checkCanUseAi = (
  plan: "free" | "pro" = "free",
  nowMs: number = Date.now(),
  usageRecord?: AiUsageRecord | null
): {
  canUse: boolean;
  reason?: string;
  remaining: number;
  cooldownRemainingMs: number;
  usage: AiUsageRecord;
} => {
  const usage = getAiUsage(new Date(nowMs), usageRecord);
  const cooldownRemainingMs = Math.max(0, usage.lastUsed + AI_COOLDOWN_MS - nowMs);

  if (plan === "pro") {
    return {
      canUse: cooldownRemainingMs === 0,
      reason:
        cooldownRemainingMs > 0
          ? "Por favor espera a que termine el tiempo de enfriamiento entre llamadas."
          : undefined,
      remaining: 999,
      cooldownRemainingMs,
      usage,
    };
  }

  const remaining = Math.max(0, MAX_FREE_MONTHLY_AI_USES - usage.count);
  if (remaining <= 0) {
    return {
      canUse: false,
      reason: `Has utilizado las ${MAX_FREE_MONTHLY_AI_USES} extracciones con IA incluidas en tu cuenta gratuita este mes.`,
      remaining: 0,
      cooldownRemainingMs,
      usage,
    };
  }

  if (cooldownRemainingMs > 0) {
    const secondsLeft = Math.ceil(cooldownRemainingMs / 1000);
    return {
      canUse: false,
      reason: `Por favor espera ${secondsLeft} segundos antes de realizar otra extracción con IA.`,
      remaining,
      cooldownRemainingMs,
      usage,
    };
  }

  return { canUse: true, remaining, cooldownRemainingMs: 0, usage };
};

export const recordAiUsage = (nowMs: number = Date.now()): AiUsageRecord => {
  const currentMonthKey = new Date(nowMs).toISOString().substring(0, 7);
  const current = getAiUsage(new Date(nowMs));
  const updated: AiUsageRecord = {
    monthKey: currentMonthKey,
    count: (current.monthKey === currentMonthKey ? current.count : 0) + 1,
    lastUsed: nowMs,
  };
  inMemoryAiUsage = updated;
  return updated;
};

export const saveProWaitlistEmail = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) return false;
  if (!inMemoryWaitlist.includes(clean)) {
    inMemoryWaitlist.push(clean);
  }
  return true;
};

export const getProWaitlistEmails = (): string[] => {
  return [...inMemoryWaitlist];
};
