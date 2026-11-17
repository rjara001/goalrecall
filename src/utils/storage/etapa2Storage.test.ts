import { beforeEach, describe, expect, it } from "bun:test";
import { exportBackupJson, importBackupJson } from "./backupStorage";
import {
  addCareerGoal,
  deleteCareerGoal,
  getCareerGoalProgress,
  getStoredCareerGoals,
  setCareerGoalStatus,
  toggleCareerGoalActionItem,
  updateCareerGoal,
} from "./careerGoalsStorage";
import {
  addCertification,
  deleteCertification,
  getCertificationValidityStatus,
  getStoredCertifications,
  toggleCertificationPublic,
  updateCertification,
} from "./certificationsStorage";
import { workspaceState } from "./workspaceState";
import { buildSharedDeckPayload } from "../publicDeckShare";
import { INITIAL_USER } from "../storage";

describe("Etapa 2 certifications & career goals domain", () => {
  beforeEach(() => {
    workspaceState.experiences = [];
    workspaceState.logs = [];
    workspaceState.user = null;
    workspaceState.cv = null;
    workspaceState.inbox = [];
    workspaceState.jobOffers = [];
    workspaceState.products = [];
    workspaceState.certifications = [];
    workspaceState.careerGoals = [];
    workspaceState.customAccounts = [];
  });

  it("evaluates certification validity statuses accurately", () => {
    const ref = new Date("2026-06-01T00:00:00Z");
    expect(getCertificationValidityStatus(undefined, ref)).toBe("no_expiration");
    expect(getCertificationValidityStatus("", ref)).toBe("no_expiration");
    expect(getCertificationValidityStatus("2028-04", ref)).toBe("active");
    expect(getCertificationValidityStatus("2026-07", ref)).toBe("expiring_soon");
    expect(getCertificationValidityStatus("2025-12", ref)).toBe("expired");
  });

  it("supports full certifications CRUD and public visibility toggle", () => {
    const created = addCertification({
      name: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services (AWS)",
      issueDate: "2025-04",
      expirationDate: "2028-04",
      credentialId: "AWS-PSA-94812",
      credentialUrl: "https://credly.com/badges/aws-psa",
      skills: ["AWS", "Distributed Systems"],
      isPublic: true,
    });

    expect(getStoredCertifications()).toHaveLength(1);
    expect(created.isPublic).toBe(true);

    updateCertification({ ...created, credentialId: "AWS-PSA-99999" });
    expect(getStoredCertifications()[0].credentialId).toBe("AWS-PSA-99999");

    const toggled = toggleCertificationPublic(created.id);
    expect(toggled?.isPublic).toBe(false);
    expect(getStoredCertifications()[0].isPublic).toBe(false);

    deleteCertification(created.id);
    expect(getStoredCertifications()).toHaveLength(0);
  });

  it("supports career goals CRUD, checklist progress, and achievedDate transitions", () => {
    const goal = addCareerGoal({
      title: "Certificarme en CKA",
      category: "certification",
      status: "in_progress",
      targetDate: "2026-Q3",
      actionItems: [
        { id: "i1", text: "Completar módulos de networking", done: true },
        { id: "i2", text: "Simulacro Killer.sh", done: false },
      ],
    });

    expect(getStoredCareerGoals()).toHaveLength(1);
    expect(getCareerGoalProgress(goal)).toEqual({ done: 1, total: 2, percent: 50 });

    const toggledGoal = toggleCareerGoalActionItem(goal.id, "i2");
    expect(toggledGoal?.actionItems?.[1].done).toBe(true);
    expect(getCareerGoalProgress(toggledGoal!)).toEqual({ done: 2, total: 2, percent: 100 });

    const achieved = setCareerGoalStatus(goal.id, "achieved");
    expect(achieved?.status).toBe("achieved");
    expect(achieved?.achievedDate).toBeDefined();

    updateCareerGoal({ ...achieved!, linkedCertificationId: "cert-123" });
    expect(getStoredCareerGoals()[0].linkedCertificationId).toBe("cert-123");

    const backToBacklog = setCareerGoalStatus(goal.id, "backlog");
    expect(backToBacklog?.achievedDate).toBeUndefined();

    deleteCareerGoal(goal.id);
    expect(getStoredCareerGoals()).toHaveLength(0);
  });

  it("round-trips certifications and careerGoals via backup JSON and isolates private items in SharedDeck", () => {
    addCertification({
      name: "CKA",
      issuer: "CNCF",
      issueDate: "2026-01",
      skills: ["Kubernetes"],
      isPublic: true,
    });
    addCertification({
      name: "Internal Compliance",
      issuer: "Org",
      issueDate: "2026-01",
      skills: ["Audit"],
      isPublic: false,
    });
    addCareerGoal({
      title: "Máster en Sistemas Distribuidos",
      category: "academic",
      status: "backlog",
      actionItems: [],
    });

    const payload = buildSharedDeckPayload(
      INITIAL_USER,
      [],
      [],
      getStoredCertifications()
    );
    expect(payload.c).toHaveLength(1);
    expect(payload.c?.[0].n).toBe("CKA");

    const exported = exportBackupJson();
    workspaceState.certifications = [];
    workspaceState.careerGoals = [];

    const imported = importBackupJson(exported);
    expect(imported.success).toBe(true);
    expect(getStoredCertifications()).toHaveLength(2);
    expect(getStoredCareerGoals()).toHaveLength(1);
  });
});
