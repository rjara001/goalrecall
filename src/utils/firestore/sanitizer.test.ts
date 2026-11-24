import { describe, expect, it } from "bun:test";
import { deleteField, serverTimestamp } from "firebase/firestore";
import {
  buildAiQuotaCreatePayload,
  buildCareerGoalCreatePayload,
  buildCareerGoalUpdatePayload,
  buildCertificationCreatePayload,
  buildExperienceRevisionCreatePayload,
  buildInboxMessageCreatePayload,
  buildJobOfferCreatePayload,
  buildLogEntryCreatePayload,
  buildLogEntryUpdatePayload,
  buildLogMetadataUpdatePayload,
  buildLogRevisionCreatePayload,
  buildLogSortOrderUpdatePayload,
  buildProductCreatePayload,
  buildProductUpdatePayload,
  buildPublicShowcaseCreatePayload,
  buildPublicUserProfile,
  buildStoredCvCreatePayload,
  docToExperienceRevision,
  docToLogEntry,
  docToLogRevision,
  buildUserProfileCreatePayload,
  buildWorkExperienceCreatePayload,
  buildWorkExperienceMetadataUpdatePayload,
  docToWorkExperience,
  isValidUsernameHandle,
  sanitizeDocId,
  sanitizeUsernameHandle,
} from "./sanitizer";
import { ExtractedCvData, LogEntry, Product, TechnicalCertification, UserProfile } from "../../types";

function assertNoUndefinedDeep(value: unknown, path = "root"): void {
  expect(value).not.toBeUndefined();
  if (Array.isArray(value)) {
    value.forEach((item, idx) => assertNoUndefinedDeep(item, `${path}[${idx}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) {
        throw new Error(`Found undefined at ${path}.${k}`);
      }
      assertNoUndefinedDeep(v, `${path}.${k}`);
    }
  }
}

describe("Firestore sanitizer payloads", () => {
  it("sanitizes doc IDs safely for Firestore document paths", () => {
    expect(sanitizeDocId("exp/with spaces:123")).toBe("exp_with_spaces_123");
    expect(sanitizeDocId("___abc___")).toBe("abc");
    expect(sanitizeDocId("", "log").startsWith("log-")).toBe(true);
    expect(sanitizeDocId("a".repeat(200)).length).toBeLessThanOrEqual(128);
  });

  it("normalizes and validates public username handles", () => {
    expect(sanitizeUsernameHandle("u/Rodrigo_Jara! ")).toBe("rodrigo_jara");
    expect(isValidUsernameHandle("rodrigo_jara")).toBe(true);
    expect(isValidUsernameHandle("ab")).toBe(false);
    expect(isValidUsernameHandle("admin")).toBe(false);
    expect(isValidUsernameHandle("quarters")).toBe(false);
  });

  it("builds CV payload with zero undefined values and bounded strings", () => {
    const cv: ExtractedCvData = {
      contact: {
        name: "A".repeat(300),
        headline: "Staff Engineer",
        email: "dev@example.com",
        phone: "",
        location: "Santiago",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      summary: "Summary",
      skills: {
        technical: ["TypeScript", "  ", "Go"],
        frameworks: ["React"],
        toolsCloud: ["Firestore"],
        softSkills: [],
      },
      experiences: [
        {
          id: "exp/1",
          company: "Acme Corp",
          role: "Architect",
          location: undefined,
          startDate: "2023-01",
          endDate: undefined,
          isCurrent: true,
          description: undefined,
          bullets: ["Reduced p99 by 40%"],
          technologies: ["React"],
          category: "Architecture 🏗️",
        },
      ],
      education: [{ id: "edu/1", degree: "CS", institution: "UTFSM", year: undefined }],
      certifications: [{ id: "cert/1", name: "AWS SA", issuer: "AWS", credentialId: undefined }],
      projects: [{ id: "proj/1", name: "GoalRecall", role: undefined, description: "App", technologies: [], url: undefined }],
      languages: [{ id: "lang/1", language: "Spanish", level: "Native" }],
      rawTextPreview: "raw",
    };

    const payload = buildStoredCvCreatePayload(cv, "uid-123") as Record<string, unknown>;
    assertNoUndefinedDeep(payload);
    expect((payload.contact as { name: string }).name.length).toBe(160);
    expect((payload.experiences as { id: string }[])[0].id).toBe("exp_1");
    expect(payload.createdAt).toEqual(serverTimestamp());
    expect(payload.updatedAt).toEqual(serverTimestamp());
  });

  it("strips undefined optional fields across logs, experiences, products, certs, offers, inbox, and user", () => {
    const userPayload = buildUserProfileCreatePayload(
      {
        name: "Rodrigo",
        email: "rodrigo@example.com",
        github: undefined,
        linkedin: undefined,
        availabilityStatus: undefined,
        skills: [{ name: "TS", category: "Languages" }],
      },
      "uid-1"
    );
    assertNoUndefinedDeep(userPayload);
    expect(userPayload.authProvider).toBe("google");

    const logPayload = buildLogEntryCreatePayload(
      {
        title: "Launched auth",
        impact: "",
        experienceId: undefined,
        whatWasSought: undefined,
        tags: ["#Auth", ""],
        isPublic: true,
        includeInCv: false,
      },
      "uid-1",
      "log-1"
    ) as Record<string, unknown>;
    assertNoUndefinedDeep(logPayload);
    expect(logPayload.impact).toBe("Launched auth");
    expect(logPayload.includeInCv).toBe(false);

    const logUpdatePayload = buildLogEntryUpdatePayload({
      title: "Updated CV bullet",
      includeInCv: true,
    }) as Record<string, unknown>;
    assertNoUndefinedDeep(logUpdatePayload);
    expect(logUpdatePayload.includeInCv).toBe(true);

    const parsedWithFalse = docToLogEntry(
      { title: "Hidden from CV", impact: "x", includeInCv: false },
      "log-1"
    );
    expect(parsedWithFalse.includeInCv).toBe(false);

    const parsedWithoutFlag = docToLogEntry({ title: "Legacy log", impact: "x" }, "log-2");
    expect(parsedWithoutFlag.includeInCv).toBeUndefined();
    expect(parsedWithoutFlag.sortOrder).toBeUndefined();

    const orderedCreate = buildLogEntryCreatePayload(
      {
        title: "Ordered achievement",
        impact: "High",
        sortOrder: 3.9,
      },
      "uid-1",
      "log-ordered"
    ) as Record<string, unknown>;
    assertNoUndefinedDeep(orderedCreate);
    expect(orderedCreate.sortOrder).toBe(3);

    const clampedNegative = buildLogEntryUpdatePayload({
      title: "Clamped low",
      sortOrder: -5,
    }) as Record<string, unknown>;
    assertNoUndefinedDeep(clampedNegative);
    expect(clampedNegative.sortOrder).toBe(0);

    const clampedHigh = buildLogEntryUpdatePayload({
      title: "Clamped high",
      sortOrder: 999999,
    }) as Record<string, unknown>;
    expect(clampedHigh.sortOrder).toBe(100000);

    const parsedOrdered = docToLogEntry({ title: "Ordered", impact: "x", sortOrder: 4.7 }, "log-3");
    expect(parsedOrdered.sortOrder).toBe(4);

    const expPayload = buildWorkExperienceCreatePayload(
      {
        company: "Acme",
        role: "Lead",
        startDate: "2022-01",
        endDate: undefined,
        summary: undefined,
      },
      "uid-1",
      "exp-1"
    );
    assertNoUndefinedDeep(expPayload);

    const certPayload = buildCertificationCreatePayload(
      {
        name: "GCP Architect",
        issuer: "Google",
        issueDate: "2024-02",
        expirationDate: undefined,
        credentialId: undefined,
      },
      "uid-1",
      "cert-1"
    );
    assertNoUndefinedDeep(certPayload);

    const offerPayload = buildJobOfferCreatePayload(
      {
        company: "Vercel",
        role: "Staff DX",
        description: "DX work",
        url: undefined,
        notes: undefined,
      },
      "uid-1",
      "offer-1"
    );
    assertNoUndefinedDeep(offerPayload);

    const inboxPayload = buildInboxMessageCreatePayload(
      {
        name: "Recruiter",
        email: "rec@co.com",
        message: "Hola",
        organization: undefined,
        achievementDraft: undefined,
      },
      "uid-1",
      "msg-1"
    );
    assertNoUndefinedDeep(inboxPayload);

    const quotaPayload = buildAiQuotaCreatePayload({ monthKey: "2026-11", count: 2, lastUsed: 1234 }, "uid-1");
    assertNoUndefinedDeep(quotaPayload);
  });

  it("handles CareerGoal achievedDate deletion with deleteField() when reverted to backlog", () => {
    const createPayload = buildCareerGoalCreatePayload(
      {
        title: "Pass AWS SA",
        category: "certification",
        status: "backlog",
        actionItems: [{ id: "s/1", text: "Study", done: false }],
      },
      "uid-1",
      "goal-1"
    );
    assertNoUndefinedDeep(createPayload);
    expect("achievedDate" in createPayload).toBe(false);

    const achievedUpdate = buildCareerGoalUpdatePayload({
      title: "Pass AWS SA",
      category: "certification",
      status: "achieved",
      achievedDate: "2026-11-18",
    }) as Record<string, unknown>;
    expect(achievedUpdate.achievedDate).toBe("2026-11-18");

    const revertedUpdate = buildCareerGoalUpdatePayload({
      title: "Pass AWS SA",
      category: "certification",
      status: "backlog",
      achievedDate: "2026-11-18",
    }) as Record<string, unknown>;
    expect(revertedUpdate.achievedDate).toEqual(deleteField());
  });

  it("omits createdAtIso from buildProductUpdatePayload to satisfy Firestore update rules", () => {
    const createPayload = buildProductCreatePayload(
      {
        title: "GoalRecall",
        tagline: "Track wins",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      "uid-1",
      "prod-1"
    );
    expect(createPayload.createdAtIso).toBe("2026-01-01T00:00:00.000Z");

    const updatePayload = buildProductUpdatePayload({
      title: "GoalRecall v2",
      tagline: "Track wins",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    assertNoUndefinedDeep(updatePayload);
    expect("createdAtIso" in updatePayload).toBe(false);
    expect("id" in updatePayload).toBe(false);
  });

  it("builds strictly PII-free PublicShowcase and PublicUserProfile payloads", () => {
    const profile: UserProfile = {
      id: "uid-secret",
      username: "rodrigo",
      name: "Rodrigo Jara",
      email: "private-email@gmail.com",
      avatar: "https://example.com/avatar.png",
      title: "Staff Engineer",
      bio: "Bio",
      location: "Remote",
      skills: [{ name: "React", category: "Frontend" }],
      authProvider: "google",
      plan: "pro",
      createdAt: 1700000000000,
    };

    const publicProfile = buildPublicUserProfile(profile, "rodrigo");
    assertNoUndefinedDeep(publicProfile);
    expect("email" in publicProfile).toBe(false);
    expect("plan" in publicProfile).toBe(false);
    expect("authProvider" in publicProfile).toBe(false);
    expect("createdAt" in publicProfile).toBe(false);

    const logs: LogEntry[] = [
      {
        id: "l1",
        date: "2026-11-01",
        client: "Acme",
        project: "Core",
        category: "Feature ✨",
        title: "Public win",
        impact: "+30%",
        tags: [],
        isPublic: true,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "l2",
        date: "2026-11-02",
        client: "Acme",
        project: "Secret",
        category: "Fix 🐛",
        title: "Private bug",
        impact: "Secret",
        tags: [],
        isPublic: false,
        createdAt: 2,
        updatedAt: 2,
      },
    ];
    const products: Product[] = [
      {
        id: "p1",
        userId: "uid-secret",
        title: "Public App",
        tagline: "Open",
        description: "",
        imageUrl: "",
        techStack: [],
        isPublic: true,
        createdAt: "2026-01-01",
      },
      {
        id: "p2",
        userId: "uid-secret",
        title: "Stealth App",
        tagline: "Closed",
        description: "",
        imageUrl: "",
        techStack: [],
        isPublic: false,
        createdAt: "2026-01-01",
      },
    ];
    const certifications: TechnicalCertification[] = [
      {
        id: "c1",
        name: "Public Cert",
        issuer: "AWS",
        issueDate: "2026-01",
        skills: [],
        isPublic: true,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        id: "c2",
        name: "Hidden Cert",
        issuer: "AWS",
        issueDate: "2026-01",
        skills: [],
        isPublic: false,
        createdAt: 1,
        updatedAt: 1,
      },
    ];

    const showcase = buildPublicShowcaseCreatePayload({
      username: "rodrigo",
      ownerId: "uid-secret",
      userProfile: profile,
      logs,
      products,
      certifications,
    });
    assertNoUndefinedDeep(showcase);
    expect((showcase.logs as LogEntry[]).map((l) => l.id)).toEqual(["l1"]);
    expect((showcase.products as Product[]).map((p) => p.id)).toEqual(["p1"]);
    expect((showcase.certifications as TechnicalCertification[]).map((c) => c.id)).toEqual(["c1"]);
  });

  it("never falls back updatedAt to Date.now() on read and preserves updatedAt on sortOrder/metadata updates", () => {
    const withCreatedOnly = docToLogEntry(
      { title: "Legacy log", impact: "x", createdAt: 1700000000000 },
      "log-legacy-created"
    );
    expect(withCreatedOnly.createdAt).toBe(1700000000000);
    expect(withCreatedOnly.updatedAt).toBe(1700000000000);

    const withNeitherTimestamp = docToLogEntry(
      { title: "Bare legacy log", impact: "x", updatedAt: null },
      "log-legacy-none"
    );
    expect(withNeitherTimestamp.createdAt).toBe(0);
    expect(withNeitherTimestamp.updatedAt).toBe(0);

    const sortOrderPayload = buildLogSortOrderUpdatePayload(2.8) as Record<string, unknown>;
    expect(sortOrderPayload).toEqual({ sortOrder: 2 });
    expect("updatedAt" in sortOrderPayload).toBe(false);
    expect("title" in sortOrderPayload).toBe(false);
    expect("includeInCv" in sortOrderPayload).toBe(false);

    const metadataPayload = buildLogMetadataUpdatePayload({
      isPublic: true,
      includeInCv: false,
      experienceId: "exp-1",
      client: "Acme Corp",
      sortOrder: 4.9,
    }) as Record<string, unknown>;
    assertNoUndefinedDeep(metadataPayload);
    expect(metadataPayload).toEqual({
      isPublic: true,
      includeInCv: false,
      experienceId: "exp-1",
      client: "Acme Corp",
      sortOrder: 4,
    });
    expect("updatedAt" in metadataPayload).toBe(false);

    const partialMetadata = buildLogMetadataUpdatePayload({ isPublic: false }) as Record<string, unknown>;
    expect(partialMetadata).toEqual({ isPublic: false });
    expect("updatedAt" in partialMetadata).toBe(false);

    const explicitSavePayload = buildLogEntryUpdatePayload({ title: "Edited title" }) as Record<string, unknown>;
    expect(explicitSavePayload.updatedAt).toEqual(serverTimestamp());

    const noTouchSavePayload = buildLogEntryUpdatePayload(
      { title: "Unmodified timestamp" },
      { touchUpdatedAt: false }
    ) as Record<string, unknown>;
    expect("updatedAt" in noTouchSavePayload).toBe(false);
  });

  it("builds strict schema-compliant LogRevision and ExperienceRevision payloads with zero undefined values", () => {
    const logRev = buildLogRevisionCreatePayload({
      revisionId: "rev/1",
      uid: "uid-1",
      logId: "log/1",
      versionNumber: 2,
      source: "manual_form",
      changedFields: ["title", "impact"],
      snapshot: {
        title: "Reduced P99 latency",
        whatWasSought: undefined,
        tags: ["#Perf"],
      },
    });
    assertNoUndefinedDeep(logRev);
    expect(logRev.id).toBe("rev_1");
    expect(logRev.parentId).toBe("log_1");
    expect(logRev.entityType).toBe("log");
    expect(Object.keys(logRev).sort()).toEqual([
      "changedFields",
      "createdAt",
      "entityType",
      "id",
      "parentId",
      "snapshot",
      "source",
      "userId",
      "versionNumber",
    ]);
    expect(Object.keys(logRev.snapshot).sort()).toEqual([
      "category",
      "client",
      "date",
      "description",
      "experienceId",
      "howApplied",
      "impact",
      "project",
      "tags",
      "title",
      "whatWasSought",
      "whyImportant",
    ]);

    const parsedLogRev = docToLogRevision(
      { ...logRev, createdAt: 1700000100000 },
      logRev.id
    );
    expect(parsedLogRev.versionNumber).toBe(2);
    expect(parsedLogRev.snapshot.title).toBe("Reduced P99 latency");
    expect(parsedLogRev.snapshot.impact).toBe("Reduced P99 latency");

    const expRev = buildExperienceRevisionCreatePayload({
      revisionId: "rev-e1",
      uid: "uid-1",
      experienceId: "exp-1",
      versionNumber: 1,
      source: "json_editor",
      changedFields: ["bullets", "endDate"],
      snapshot: {
        company: "Acme",
        role: "Staff Engineer",
        startDate: "2023-01",
        endDate: "2024-01",
        isCurrent: true,
        bullets: ["Built pipeline"],
        technologies: ["TypeScript"],
      },
    });
    assertNoUndefinedDeep(expRev);
    expect(expRev.entityType).toBe("experience");
    expect(expRev.snapshot.endDate).toBe("");
    expect(Object.keys(expRev.snapshot).sort()).toEqual([
      "bullets",
      "company",
      "endDate",
      "isCurrent",
      "isPersonalProjects",
      "location",
      "role",
      "startDate",
      "summary",
      "technologies",
    ]);

    const parsedExpRev = docToExperienceRevision(
      { ...expRev, createdAt: 1700000200000 },
      expRev.id
    );
    expect(parsedExpRev.source).toBe("json_editor");
    expect(parsedExpRev.snapshot.bullets).toEqual(["Built pipeline"]);

    const logWithCount = buildLogEntryCreatePayload(
      { title: "Log con ediciones", impact: "x", updatesCount: 4.8 },
      "uid-1",
      "log-cnt"
    ) as Record<string, unknown>;
    expect(logWithCount.updatesCount).toBe(4);
    expect(docToLogEntry(logWithCount, "log-cnt").updatesCount).toBe(4);

    const logCountMeta = buildLogMetadataUpdatePayload({ updatesCount: 4 }) as Record<
      string,
      unknown
    >;
    expect(logCountMeta).toEqual({ updatesCount: 4 });
    expect("updatedAt" in logCountMeta).toBe(false);

    const expWithCount = buildWorkExperienceCreatePayload(
      { company: "Acme", role: "Lead", startDate: "2024", updatesCount: 7 },
      "uid-1",
      "exp-cnt"
    ) as Record<string, unknown>;
    expect(expWithCount.updatesCount).toBe(7);
    expect(docToWorkExperience(expWithCount, "exp-cnt").updatesCount).toBe(7);

    const expCountMeta = buildWorkExperienceMetadataUpdatePayload({
      updatesCount: -10,
    }) as Record<string, unknown>;
    expect(expCountMeta).toEqual({ updatesCount: 0 });
    expect("updatedAt" in expCountMeta).toBe(false);

    const logSoftDeleteMeta = buildLogMetadataUpdatePayload({
      deletedAt: 1732400000123.9,
      isPublic: false,
    }) as Record<string, unknown>;
    expect(logSoftDeleteMeta).toEqual({
      deletedAt: 1732400000123,
      isPublic: false,
    });
    expect(docToLogEntry({ ...logWithCount, deletedAt: 1732400000123 }, "log-del").deletedAt).toBe(
      1732400000123
    );

    const logRestoreMeta = buildLogMetadataUpdatePayload({
      deletedAt: null,
    }) as Record<string, unknown>;
    expect(logRestoreMeta.deletedAt).toEqual(deleteField());

    const expSoftDeleteMeta = buildWorkExperienceMetadataUpdatePayload({
      deletedAt: 1732400000555,
    }) as Record<string, unknown>;
    expect(expSoftDeleteMeta).toEqual({ deletedAt: 1732400000555 });
    expect(
      docToWorkExperience({ ...expWithCount, deletedAt: 1732400000555 }, "exp-del").deletedAt
    ).toBe(1732400000555);

    const expRestoreMeta = buildWorkExperienceMetadataUpdatePayload({
      deletedAt: null,
    }) as Record<string, unknown>;
    expect(expRestoreMeta.deletedAt).toEqual(deleteField());
    expect(
      docToWorkExperience({ ...expWithCount, deletedAt: -50 }, "exp-invalid-del").deletedAt
    ).toBeUndefined();
  });
});
