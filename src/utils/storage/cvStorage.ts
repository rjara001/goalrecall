import { ExtractedCvData } from "../../types";
import { saveUser } from "./authStorage";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const getStoredCv = (_userId?: string): ExtractedCvData | null => {
  return workspaceState.cv;
};

export const saveStoredCv = (cvData: ExtractedCvData, _userId?: string): void => {
  workspaceState.cv = cvData;
  notifyCloudSync();
};

export const clearStoredCv = (): void => {
  workspaceState.cv = null;
  notifyCloudSync();
};

export const clearSessionData = (): void => {
  saveUser(null);
  clearStoredCv();
};
