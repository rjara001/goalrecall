import { describe, it, expect } from "bun:test";
import { CvAiExtractionError, extractCvWithAi } from "./cvAiExtractor";
import { CvExtractionPayload } from "../../../types";

const samplePayload: CvExtractionPayload = {
  fileName: "cv.txt",
  textContent: `Jane Doe\njane@example.com\nSenior Engineer\n@ Acme Corp\n2022 - Present\n• Built scalable microservices reducing latency by 40%.`,
  mimeType: "text/plain",
};

describe("cvAiExtractor", () => {
  it("bypasses network and reports forced_local when forceLocal is true", async () => {
    let called = false;
    const result = await extractCvWithAi(
      { ...samplePayload, forceLocal: true },
      {
        fetcher: (async () => {
          called = true;
          throw new Error("should not call fetch");
        }) as unknown as typeof fetch,
      }
    );

    expect(called).toBe(false);
    expect(result.usedAi).toBe(false);
    expect(result.fallbackReason).toBe("forced_local");
    expect(result.response.engine).toBe("local-strict-parser");
  });

  it("returns AI response and sends Bearer token on 200 JSON", async () => {
    let authHeader = "";
    const result = await extractCvWithAi(samplePayload, {
      idToken: "token-123",
      fetcher: (async (_url: string, init?: RequestInit) => {
        authHeader = (init?.headers as Record<string, string>)?.Authorization || "";
        return new Response(
          JSON.stringify({
            cvData: {
              contact: { name: "Jane Doe", headline: "Senior", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
              summary: "",
              skills: { technical: ["TS"], frameworks: [], toolsCloud: [], softSkills: [] },
              experiences: [],
              education: [],
              certifications: [],
              projects: [],
              languages: [],
            },
            achievements: [],
            pendingFields: [],
            completenessScore: 90,
            engine: "gemini-4-hydrogen",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch,
    });

    expect(authHeader).toBe("Bearer token-123");
    expect(result.usedAi).toBe(true);
    expect(result.fallbackReason).toBeUndefined();
    expect(result.response.engine).toBe("gemini-4-hydrogen");
  });

  it("throws CvAiExtractionError instead of silently masking GEMINI_* server errors", async () => {
    let caught: unknown = null;
    try {
      await extractCvWithAi(samplePayload, {
        fetcher: (async () =>
          new Response(
            JSON.stringify({
              code: "GEMINI_API_KEY_INVALID",
              error: "La clave de Gemini API no es válida.",
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          )) as unknown as typeof fetch,
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(CvAiExtractionError);
    expect((caught as CvAiExtractionError).code).toBe("GEMINI_API_KEY_INVALID");
    expect((caught as CvAiExtractionError).status).toBe(401);
  });

  it("falls back locally with fallbackReason='unauthenticated' on plain 401", async () => {
    const result = await extractCvWithAi(samplePayload, {
      fetcher: (async () => new Response("Unauthorized", { status: 401 })) as unknown as typeof fetch,
    });

    expect(result.usedAi).toBe(false);
    expect(result.fallbackReason).toBe("unauthenticated");
    expect(result.response.engine).toBe("local-strict-parser");
  });

  it("falls back locally with fallbackReason='timeout' on AbortError", async () => {
    const result = await extractCvWithAi(samplePayload, {
      fetcher: (async () => {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }) as unknown as typeof fetch,
    });

    expect(result.usedAi).toBe(false);
    expect(result.fallbackReason).toBe("timeout");
  });

  it("falls back locally with fallbackReason='network' on fetch failure", async () => {
    const result = await extractCvWithAi(samplePayload, {
      fetcher: (async () => {
        throw new Error("ECONNREFUSED");
      }) as unknown as typeof fetch,
    });

    expect(result.usedAi).toBe(false);
    expect(result.fallbackReason).toBe("network");
  });
});
