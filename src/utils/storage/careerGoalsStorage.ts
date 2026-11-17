import {
  CareerGoal,
  CareerGoalStatus,
} from "../../types";
import { STORAGE_KEYS } from "./keys";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const getCareerGoalProgress = (
  goal: Pick<CareerGoal, "actionItems" | "status">
): { done: number; total: number; percent: number } => {
  const items = goal.actionItems || [];
  if (items.length === 0) {
    return {
      done: goal.status === "achieved" ? 1 : 0,
      total: 0,
      percent: goal.status === "achieved" ? 100 : goal.status === "in_progress" ? 25 : 0,
    };
  }
  const done = items.filter((i) => i.done).length;
  return {
    done,
    total: items.length,
    percent: Math.round((done / items.length) * 100),
  };
};

export const getStoredCareerGoals = (): CareerGoal[] => {
  if (workspaceState.careerGoals.length > 0) {
    return workspaceState.careerGoals;
  }
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CAREER_GOALS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          workspaceState.careerGoals = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore invalid storage payload
    }
  }
  return workspaceState.careerGoals;
};

export const saveCareerGoals = (goals: CareerGoal[]): void => {
  workspaceState.careerGoals = goals;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.CAREER_GOALS, JSON.stringify(goals));
    } catch {
      // ignore quota failure
    }
  }
  notifyCloudSync();
};

export const addCareerGoal = (
  goal: Omit<CareerGoal, "id" | "createdAt" | "updatedAt">
): CareerGoal => {
  const now = Date.now();
  const achievedDate =
    goal.status === "achieved"
      ? goal.achievedDate || new Date().toISOString().substring(0, 10)
      : goal.achievedDate;

  const created: CareerGoal = {
    ...goal,
    id: `goal-${now}-${Math.random().toString(36).substring(2, 7)}`,
    actionItems: Array.isArray(goal.actionItems) ? goal.actionItems : [],
    achievedDate,
    createdAt: now,
    updatedAt: now,
  };
  saveCareerGoals([created, ...getStoredCareerGoals()]);
  return created;
};

export const updateCareerGoal = (updated: CareerGoal): void => {
  const achievedDate =
    updated.status === "achieved"
      ? updated.achievedDate || new Date().toISOString().substring(0, 10)
      : updated.status === "backlog"
      ? undefined
      : updated.achievedDate;

  saveCareerGoals(
    getStoredCareerGoals().map((g) =>
      g.id === updated.id
        ? { ...updated, achievedDate, updatedAt: Date.now() }
        : g
    )
  );
};

export const deleteCareerGoal = (id: string): void => {
  saveCareerGoals(getStoredCareerGoals().filter((g) => g.id !== id));
};

export const setCareerGoalStatus = (
  id: string,
  status: CareerGoalStatus
): CareerGoal | null => {
  const current = getStoredCareerGoals();
  const existing = current.find((g) => g.id === id);
  if (!existing) return null;

  const updated: CareerGoal = {
    ...existing,
    status,
    achievedDate:
      status === "achieved"
        ? existing.achievedDate || new Date().toISOString().substring(0, 10)
        : undefined,
    updatedAt: Date.now(),
  };

  saveCareerGoals(current.map((g) => (g.id === id ? updated : g)));
  return updated;
};

export const toggleCareerGoalActionItem = (
  goalId: string,
  itemId: string
): CareerGoal | null => {
  const current = getStoredCareerGoals();
  const existing = current.find((g) => g.id === goalId);
  if (!existing) return null;

  const updatedItems = (existing.actionItems || []).map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item
  );

  const updated: CareerGoal = {
    ...existing,
    actionItems: updatedItems,
    updatedAt: Date.now(),
  };

  saveCareerGoals(current.map((g) => (g.id === goalId ? updated : g)));
  return updated;
};
