import { describe, it, expect } from "bun:test";
import { validateCvFile, normalizeCvText } from "./cvFileParser";
import { MAX_CV_FILE_SIZE_BYTES, MAX_CV_TEXT_CHARS } from "../constants";

describe("cvFileParser", () => {
  it("accepts valid PDF, DOCX, TXT, and MD files within size limit", () => {
    expect(validateCvFile({ name: "cv.pdf", size: 50000, type: "application/pdf" }).valid).toBe(true);
    expect(
      validateCvFile({
        name: "cv.docx",
        size: 50000,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }).valid
    ).toBe(true);
    expect(validateCvFile({ name: "cv.txt", size: 1000, type: "text/plain" }).valid).toBe(true);
    expect(validateCvFile({ name: "cv.md", size: 1000, type: "text/markdown" }).valid).toBe(true);
  });

  it("rejects files exceeding 2 MB with actionable message", () => {
    const res = validateCvFile({
      name: "huge.pdf",
      size: MAX_CV_FILE_SIZE_BYTES + 1,
      type: "application/pdf",
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain("2 MB");
  });

  it("explicitly rejects legacy binary .doc files instead of failing silently", () => {
    const res = validateCvFile({
      name: "legacy_resume.doc",
      size: 25000,
      type: "application/msword",
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain(".doc");
  });

  it("rejects unsupported file extensions", () => {
    const res = validateCvFile({
      name: "photo.png",
      size: 15000,
      type: "image/png",
    });
    expect(res.valid).toBe(false);
  });

  it("truncates extracted text consistently at MAX_CV_TEXT_CHARS", () => {
    const longText = "  " + "a".repeat(MAX_CV_TEXT_CHARS + 500) + "  ";
    const normalized = normalizeCvText(longText);
    expect(normalized.length).toBe(MAX_CV_TEXT_CHARS);
  });
});
