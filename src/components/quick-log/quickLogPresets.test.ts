import { describe, it, expect } from "bun:test";
import { buildBulletPrefill } from "./quickLogPresets";
import { sanitizeUsernameHandle } from "../auth/authLocales";

describe("quickLogPresets helpers", () => {
  it("builds bullet prefill preserving full text and deriving hashtags from technologies", () => {
    const result = buildBulletPrefill(
      "Migrated payment workers to idempotent queues",
      "Acme FinTech",
      ["TypeScript", "Redis Streams", "#Kafka"]
    );
    expect(result.title).toBe("Migrated payment workers to idempotent queues");
    expect(result.description).toBe("Migrated payment workers to idempotent queues");
    expect(result.whyImportant).toContain("Acme FinTech");
    expect(result.howApplied).toContain("TypeScript, Redis Streams, #Kafka");
    expect(result.tags).toEqual(["#TypeScript", "#RedisStreams", "#Kafka"]);
  });

  it("falls back to default tags when technologies are absent", () => {
    const result = buildBulletPrefill("  Launched v2 onboarding flow  ", "Beta Corp");
    expect(result.title).toBe("Launched v2 onboarding flow");
    expect(result.howApplied).toBe("");
    expect(result.tags).toEqual(["#Producción", "#Arquitectura"]);
  });
});

describe("sanitizeUsernameHandle", () => {
  it("lowercases and strips invalid handle characters while allowing hyphens and underscores", () => {
    expect(sanitizeUsernameHandle("R.Jara_001!@")).toBe("rjara_001");
    expect(sanitizeUsernameHandle("Alex-Morgan 99")).toBe("alex-morgan99");
  });
});
