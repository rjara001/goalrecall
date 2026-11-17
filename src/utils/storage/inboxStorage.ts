import { VisitorMessage } from "../../types";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const getStoredInbox = (): VisitorMessage[] => {
  return workspaceState.inbox;
};

export const saveInbox = (messages: VisitorMessage[]): void => {
  workspaceState.inbox = messages;
  notifyCloudSync();
};

export const addVisitorMessage = (
  msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">
): VisitorMessage => {
  const current = getStoredInbox();
  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  const newMsg: VisitorMessage = {
    ...msg,
    id: "msg-" + Date.now(),
    date: dateStr,
    read: false,
    replied: false,
  };
  saveInbox([newMsg, ...current]);
  return newMsg;
};

export const markMessageRead = (id: string): void => {
  saveInbox(getStoredInbox().map((m) => (m.id === id ? { ...m, read: true } : m)));
};

export const deleteMessage = (id: string): void => {
  saveInbox(getStoredInbox().filter((m) => m.id !== id));
};

export const ingestIntegrationSuggestions = (
  suggestions: VisitorMessage[]
): { addedCount: number; skippedCount: number; inbox: VisitorMessage[] } => {
  const current = getStoredInbox();
  const existingKeys = new Set(
    current.map((m) => (m.sourceRef ? `ref:${m.sourceRef}` : `id:${m.id}`))
  );

  const toAdd: VisitorMessage[] = [];
  let skippedCount = 0;

  for (const item of suggestions) {
    const key = item.sourceRef ? `ref:${item.sourceRef}` : `id:${item.id}`;
    if (existingKeys.has(key)) {
      skippedCount += 1;
      continue;
    }
    existingKeys.add(key);
    toAdd.push(item);
  }

  if (toAdd.length === 0) {
    return { addedCount: 0, skippedCount, inbox: current };
  }

  const next = [...toAdd, ...current];
  saveInbox(next);
  return { addedCount: toAdd.length, skippedCount, inbox: next };
};

export const markInboxSuggestionConverted = (
  messageId: string,
  logId: string
): VisitorMessage[] => {
  const next = getStoredInbox().map((m) =>
    m.id === messageId ? { ...m, convertedLogId: logId, read: true } : m
  );
  saveInbox(next);
  return next;
};

