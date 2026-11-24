import { describe, expect, it } from "bun:test";
import fs from "fs";
import path from "path";

const RULES_PATH = path.resolve(process.cwd(), "firestore.rules");
const BLUEPRINT_PATH = path.resolve(process.cwd(), "firebase-blueprint.json");

describe("Firestore Security Rules & Blueprint Invariants", () => {
  const rulesText = fs.readFileSync(RULES_PATH, "utf-8");
  const blueprint = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, "utf-8"));

  it("enforces rules_version 2 and global deny-all fallback", () => {
    expect(rulesText).toContain("rules_version = '2';");
    expect(rulesText).toContain("match /{document=**} {\n      allow read, write: if false;\n    }");
  });

  it("enforces email verification and ownership gates on writes", () => {
    expect(rulesText).toContain("request.auth.token.email_verified == true");
    expect(rulesText).toContain("request.auth.uid == userId");
  });

  it("enforces all 14 blueprint collections in firestore.rules", () => {
    const requiredMatches = [
      "match /users/{userId}",
      "match /cv/{cvDocId}",
      "match /logs/{logId}",
      "match /experiences/{experienceId}",
      "match /revisions/{revisionId}",
      "match /products/{productId}",
      "match /certifications/{certificationId}",
      "match /careerGoals/{goalId}",
      "match /offers/{offerId}",
      "match /inbox/{messageId}",
      "match /quotas/{quotaId}",
      "match /publicShowcases/{username}",
      "match /proWaitlist/{entryId}",
    ];
    for (const m of requiredMatches) {
      expect(rulesText).toContain(m);
    }
    expect(Object.keys(blueprint.firestore)).toHaveLength(14);
  });

  it("prevents collection listing on users, publicShowcases, and proWaitlist", () => {
    expect(rulesText).not.toMatch(/allow\s+list:\s*if\s+true/);
    expect(rulesText).not.toMatch(/allow\s+read:\s*if\s+isSignedIn\(\)/);
    expect(rulesText).toContain("allow list: if isOwner(userId) && resource.data.userId == request.auth.uid;");
  });

  it("enforces immutability on revision snapshots", () => {
    expect(rulesText).toContain("isValidLogRevision(");
    expect(rulesText).toContain("isValidExperienceRevision(");
    expect(rulesText).toContain("allow update: if false;");
  });

  it("prevents client plan escalation and PII leakage in publicShowcases", () => {
    expect(rulesText).toContain("incoming().plan == 'free'");
    expect(rulesText).toContain("incoming().plan == existing().plan");
    expect(rulesText).toContain("function isValidPublicUserProfile(profile, username)");
    const publicProfileBlock = rulesText.slice(
      rulesText.indexOf("function isValidPublicUserProfile"),
      rulesText.indexOf("function isValidPublicShowcase")
    );
    expect(publicProfileBlock).not.toContain("'email'");
    expect(publicProfileBlock).not.toContain("'phone'");
  });

  it("enforces affectedKeys().hasOnly() and server timestamps on every create/update", () => {
    const validatorCalls = [
      "isValidUserProfile(",
      "isValidStoredCv(",
      "isValidLogEntry(",
      "isValidLogRevision(",
      "isValidWorkExperience(",
      "isValidExperienceRevision(",
      "isValidProduct(",
      "isValidCertification(",
      "isValidCareerGoal(",
      "isValidJobOffer(",
      "isValidInboxMessage(",
      "isValidAiQuota(",
      "isValidPublicShowcase(",
      "isValidProWaitlist(",
    ];
    for (const fn of validatorCalls) {
      expect(rulesText).toContain(fn);
    }
    expect(rulesText).toContain("incoming().createdAt == request.time");
    expect(rulesText).toContain("incoming().updatedAt == request.time");
    expect(rulesText).toContain("affectedKeys().hasOnly(");
  });
});
