import { LogEntry, WorkExperience } from "../../types";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const getStoredExperiences = (_userId?: string): WorkExperience[] => {
  return workspaceState.experiences;
};

export const saveExperiences = (experiences: WorkExperience[]): void => {
  workspaceState.experiences = experiences;
  notifyCloudSync();
};

export const addExperience = (
  exp: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
): WorkExperience => {
  const experiences = getStoredExperiences();
  const newExp: WorkExperience = {
    ...exp,
    id: "exp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveExperiences([newExp, ...experiences]);
  return newExp;
};

export const updateExperience = (updatedExp: WorkExperience): void => {
  const experiences = getStoredExperiences();
  const index = experiences.findIndex((e) => e.id === updatedExp.id);
  if (index !== -1) {
    const oldCompany = experiences[index].company;
    experiences[index] = { ...updatedExp, updatedAt: Date.now() };
    saveExperiences(experiences);

    if (oldCompany !== updatedExp.company) {
      let hasChanges = false;
      const updatedLogs = workspaceState.logs.map((l) => {
        if (l.experienceId === updatedExp.id) {
          hasChanges = true;
          return { ...l, client: updatedExp.company, updatedAt: Date.now() };
        }
        return l;
      });
      if (hasChanges) {
        workspaceState.logs = updatedLogs;
        notifyCloudSync();
      }
    }
  }
};

export const deleteExperience = (id: string): void => {
  const experiences = getStoredExperiences();
  const filtered = experiences.filter((e) => e.id !== id);
  saveExperiences(filtered);

  const personal = experiences.find((e) => e.isPersonalProjects) || experiences[0];
  if (personal) {
    let hasChanges = false;
    const updatedLogs = workspaceState.logs.map((l) => {
      if (l.experienceId === id) {
        hasChanges = true;
        return {
          ...l,
          experienceId: personal.id,
          client: personal.company,
          updatedAt: Date.now(),
        };
      }
      return l;
    });
    if (hasChanges) {
      workspaceState.logs = updatedLogs;
      notifyCloudSync();
    }
  }
};

export const getExperienceById = (id: string): WorkExperience | undefined => {
  return getStoredExperiences().find((e) => e.id === id);
};

export const getLogsForExperience = (experienceId: string): LogEntry[] => {
  return workspaceState.logs.filter((l) => l.experienceId === experienceId);
};
