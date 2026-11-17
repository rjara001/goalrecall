import { AiUsageRecord } from "../../types";
import { STORAGE_KEYS } from "./keys";

export const MAX_FREE_MONTHLY_AI_USES = 3;
export const AI_COOLDOWN_MS = 10_000;
const PRO_WAITLIST_KEY = "goal_recall_pro_waitlist_v1";

export const getAiUsage = (now: Date = new Date()): AiUsageRecord => {
  const currentMonthKey = now.toISOString().substring(0, 7);
  if (typeof localStorage === "undefined") {
    return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_USAGE);
    if (!raw) {
      return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
    }
    const parsed: AiUsageRecord = JSON.parse(raw);
    if (parsed.monthKey !== currentMonthKey) {
      const resetRecord: AiUsageRecord = {
        monthKey: currentMonthKey,
        count: 0,
        lastUsed: parsed.lastUsed || 0,
      };
      localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(resetRecord));
      return resetRecord;
    }
    return parsed;
  } catch {
    return { monthKey: currentMonthKey, count: 0, lastUsed: 0 };
  }
};

export const checkCanUseAi = (
  plan: "free" | "pro" = "free",
  nowMs: number = Date.now()
): {
  canUse: boolean;
  reason?: string;
  remaining: number;
  cooldownRemainingMs: number;
  usage: AiUsageRecord;
} => {
  const usage = getAiUsage(new Date(nowMs));
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
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_USAGE, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving AI usage", e);
    }
  }
  return updated;
};

export const saveProWaitlistEmail = (email: string): boolean => {
  if (typeof localStorage === "undefined") return false;
  try {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) return false;
    const raw = localStorage.getItem(PRO_WAITLIST_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(PRO_WAITLIST_KEY, JSON.stringify(list));
    }
    return true;
  } catch (e) {
    console.error("Error saving waitlist email", e);
    return false;
  }
};

export const getProWaitlistEmails = (): string[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRO_WAITLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
