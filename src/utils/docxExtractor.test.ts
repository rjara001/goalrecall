import { describe, it, expect } from "bun:test";
import { extractDocxText } from "./docxExtractor";
import { extractCvDataLocally } from "./localCvExtractor";
import * as fs from "fs";
import * as path from "path";

describe("DOCX Text Extractor", () => {
  it("extracts raw text accurately from a valid DOCX file", async () => {
    const docxPath = path.resolve(process.cwd(), "Career_OS_Plan_Maestro.docx");
    const buffer = fs.readFileSync(docxPath);

    const extractedText = await extractDocxText(buffer);

    expect(extractedText).toBeDefined();
    expect(typeof extractedText).toBe("string");
    expect(extractedText.length).toBeGreaterThan(100);
    expect(extractedText).toContain("CAREER OS");
  });

  it("handles Uint8Array input gracefully", async () => {
    const docxPath = path.resolve(process.cwd(), "Career_OS_Plan_Maestro.docx");
    const buffer = fs.readFileSync(docxPath);
    const uint8 = new Uint8Array(buffer);

    const extractedText = await extractDocxText(uint8);

    expect(extractedText).toBeDefined();
    expect(extractedText.length).toBeGreaterThan(100);
  });

  it("can pass extracted DOCX text into localCvExtractor without errors", async () => {
    const docxPath = path.resolve(process.cwd(), "Career_OS_Plan_Maestro.docx");
    const buffer = fs.readFileSync(docxPath);
    const extractedText = await extractDocxText(buffer);

    const cvResult = extractCvDataLocally(extractedText, "Career_OS_Plan_Maestro.docx");

    expect(cvResult).toBeDefined();
    expect(cvResult.engine).toBe("local-strict-parser");
    expect(typeof cvResult.completenessScore).toBe("number");
    expect(Array.isArray(cvResult.achievements)).toBe(true);
  });
});
