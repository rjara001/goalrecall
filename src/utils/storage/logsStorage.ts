import { LogEntry } from "../../types";
import { getStoredExperiences } from "./experiencesStorage";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const getStoredLogs = (): LogEntry[] => {
  return workspaceState.logs;
};

export const saveLogs = (logs: LogEntry[]): void => {
  workspaceState.logs = logs;
  notifyCloudSync();
};

export const addLog = (
  entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">
): LogEntry => {
  const logs = getStoredLogs();
  const experiences = getStoredExperiences();

  let expId = entry.experienceId;
  if (!expId) {
    const matched = experiences.find(
      (e) =>
        e.company.toLowerCase() === entry.client.toLowerCase() ||
        entry.client.toLowerCase().includes(e.company.toLowerCase())
    );
    expId = matched
      ? matched.id
      : experiences.find((e) => e.isPersonalProjects)?.id || experiences[0]?.id || "exp-personal";
  }

  const newLog: LogEntry = {
    ...entry,
    experienceId: expId,
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    isPublic: entry.isPublic ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveLogs([newLog, ...logs]);
  return newLog;
};

export const updateLog = (updatedEntry: LogEntry): void => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === updatedEntry.id);
  if (index !== -1) {
    logs[index] = { ...updatedEntry, updatedAt: Date.now() };
    saveLogs(logs);
  }
};

export const toggleLogPublic = (id: string): LogEntry | null => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === id);
  if (index !== -1) {
    logs[index] = {
      ...logs[index],
      isPublic: !logs[index].isPublic,
      updatedAt: Date.now(),
    };
    saveLogs(logs);
    return logs[index];
  }
  return null;
};

export const deleteLog = (id: string): void => {
  saveLogs(getStoredLogs().filter((l) => l.id !== id));
};
