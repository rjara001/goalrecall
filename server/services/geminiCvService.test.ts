import { afterEach, describe, expect, it } from "bun:test";
import {
  classifyGeminiError,
  GEMINI_CV_MODEL,
  isGeminiApiKeyConfigured,
  resolveConfiguredGeminiApiKey,
} from "./geminiCvService";

const originalKey = process.env.GEMINI_API_KEY;

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

describe("geminiCvService configuration & error classification", () => {
  it("uses active gemini-4-hydrogen model", () => {
    expect(GEMINI_CV_MODEL).toBe("gemini-4-hydrogen");
  });

  it("rejects empty or placeholder GEMINI_API_KEY values and trims/unquotes valid ones", () => {
    delete process.env.GEMINI_API_KEY;
    expect(resolveConfiguredGeminiApiKey()).toBeNull();
    expect(isGeminiApiKeyConfigured()).toBe(false);

    process.env.GEMINI_API_KEY = "MY_GEMINI_API_KEY";
    expect(resolveConfiguredGeminiApiKey()).toBeNull();

    process.env.GEMINI_API_KEY = '  "AIzaTestKey123"  ';
    expect(resolveConfiguredGeminiApiKey()).toBe("AIzaTestKey123");
    expect(isGeminiApiKeyConfigured()).toBe(true);
  });

  it("classifies 401 ACCESS_TOKEN_TYPE_UNSUPPORTED / API_KEY_INVALID cleanly", () => {
    const err = new Error(
      'ApiError: {"error":{"code":401,"message":"API key not valid. Please pass a valid API key.","status":"UNAUTHENTICATED","details":[{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"ACCESS_TOKEN_TYPE_UNSUPPORTED"}]}}'
    );
    const classified = classifyGeminiError(err);
    expect(classified.httpStatus).toBe(401);
    expect(classified.code).toBe("GEMINI_API_KEY_INVALID");
    expect(classified.userMessage).toContain("Settings > Secrets");
  });

  it("classifies 403 PERMISSION_DENIED, 429 RESOURCE_EXHAUSTED, and 404 NOT_FOUND", () => {
    expect(classifyGeminiError({ status: 403, message: "PERMISSION_DENIED" }).httpStatus).toBe(403);
    expect(classifyGeminiError({ status: 429, message: "RESOURCE_EXHAUSTED" }).httpStatus).toBe(429);
    expect(classifyGeminiError({ status: 404, message: "NOT_FOUND" }).httpStatus).toBe(404);
  });
});
