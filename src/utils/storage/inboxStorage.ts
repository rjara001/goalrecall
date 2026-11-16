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
