import { describe, it, expect } from "bun:test";
import {
  buildWorkspaceImportFromCv,
  computeUpdatedCvField,
  mapRawAchievementsToBullets,
} from "./cvImportMapper";
import { ExtractedCvData, UserProfile, WorkExperience } from "../../../types";

const baseCv: ExtractedCvData = {
  contact: {
    name: "Jane Doe",
    headline: "Staff Engineer",
    email: "jane@example.com",
    phone: "",
    location: "Remote",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
    portfolio: "",
  },
  summary: "Distributed systems specialist",
  skills: {
    technical: ["TypeScript", "Go"],
    frameworks: ["React"],
    toolsCloud: ["Docker"],
    softSkills: [],
  },
  experiences: [
    {
      id: "exp-cv-1",
      company: "Acme Cloud",
      role: "Staff Engineer",
      startDate: "2023",
      endDate: "Present",
      isCurrent: true,
      bullets: ["Reduced p99 latency by 45%"],
      technologies: ["Go", "Docker"],
      category: "Architecture 🏗️",
    },
  ],
  education: [],
  certifications: [],
  projects: [],
  languages: [],
};

describe("cvImportMapper", () => {
  it("links extracted bullets to matching existing experiences without mutating input", () => {
    const existingExp: WorkExperience = {
      id: "exp-existing-1",
      company: "Acme Cloud",
      role: "Ingeniero",
      startDate: "",
      bullets: [],
      technologies: ["Kubernetes"],
      createdAt: 1,
      updatedAt: 1,
    };

    const existingList = [existingExp];
    const bullets = mapRawAchievementsToBullets([
      {
        id: "ach-1",
        client: "Acme Cloud",
        project: "Core API",
        title: "Reduced p99 latency by 45%",
        description: "Optimized worker pool",
        impact: "45% latency reduction",
        category: "Architecture 🏗️",
        tags: ["#Go"],
        xyzScore: 95,
      },
    ]);

    const currentUser: UserProfile = {
      id: "usr-1",
      name: "Old Name",
      email: "old@example.com",
      avatar: "",
      title: "",
      bio: "",
      location: "",
      skills: [],
    };

    const result = buildWorkspaceImportFromCv({
      extractedCv: baseCv,
      selectedBullets: bullets,
      existingExperiences: existingList,
      currentUser,
      sourceFileName: "jane.pdf",
    });

    // Input array element remains unmutated
    expect(existingExp.bullets).toEqual([]);
    expect(result.updatedExperiences).toHaveLength(1);
    expect(result.updatedExperiences[0].id).toBe("exp-existing-1");
    expect(result.updatedExperiences[0].role).toBe("Staff Engineer");
    expect(result.updatedExperiences[0].technologies).toContain("Kubernetes");
    expect(result.updatedExperiences[0].technologies).toContain("Go");

    expect(result.newLogs).toHaveLength(1);
    expect(result.newLogs[0].experienceId).toBe("exp-existing-1");
    expect(result.newLogs[0].isPublic).toBe(false);
    expect(result.updatedUser?.name).toBe("Jane Doe");
  });

  it("immutably updates pending fields and recalculates completeness score", () => {
    const result = computeUpdatedCvField(
      baseCv,
      [
        {
          id: "pf-phone",
          section: "contact",
          fieldName: "phone",
          label: "Teléfono",
          description: "",
          severity: "low",
          suggestedPrompt: "",
        },
      ],
      {
        fieldId: "pf-phone",
        label: "Teléfono",
        section: "contact",
        fieldName: "phone",
        currentValue: "",
        suggestedPrompt: "",
      },
      " +56 9 1234 5678 "
    );

    expect(baseCv.contact.phone).toBe("");
    expect(result.updatedCv.contact.phone).toBe("+56 9 1234 5678");
    expect(result.newPendingFields).toHaveLength(0);
    expect(result.completenessScore).toBe(100);
  });
});
