import { describe, it, expect } from "bun:test";
import fs from "fs";
import { extractPdfText } from "./pdfExtractor";
import { extractCvDataLocally } from "./localCvExtractor";

describe("PDF Text Extractor & CV Parsing Pipeline", () => {
  it("extracts text accurately from demo-cv.pdf", async () => {
    const pdfBuffer = fs.readFileSync("public/demo-cv.pdf");
    const extractedText = await extractPdfText(pdfBuffer);

    expect(extractedText).toBeTruthy();
    expect(extractedText.length).toBeGreaterThan(1000);
    expect(extractedText).toContain("ALEX MORGAN");
    expect(extractedText).toContain("CloudScale Systems");
    expect(extractedText).toContain("NovaStream Analytics");
  });

  it("extracts full CV data from extracted PDF text", async () => {
    const pdfBuffer = fs.readFileSync("public/demo-cv.pdf");
    const extractedText = await extractPdfText(pdfBuffer);
    const result = extractCvDataLocally(extractedText, "demo-cv.pdf");

    // Contact assertions
    expect(result.cvData.contact.name).toBe("ALEX MORGAN");
    expect(result.cvData.contact.headline).toContain("Senior Full Stack Developer");
    expect(result.cvData.contact.email).toBe("alex.morgan@ejemplo.com");

    // Experiences assertions
    expect(result.cvData.experiences.length).toBeGreaterThanOrEqual(5);
    const companies = result.cvData.experiences.map((e) => e.company);
    expect(companies.some((c) => c.includes("CloudScale Systems"))).toBe(true);

    // Achievements assertions
    expect(result.achievements.length).toBeGreaterThanOrEqual(10);
    expect(result.completenessScore).toBeGreaterThanOrEqual(70);
  });

  it("handles date ranges on separate lines without mistaking date for company", () => {
    const sampleCv = `
Carlos Gomez
Senior Frontend Engineer
carlos@ejemplo.com · +56 9 1234 5678 · Santiago, Chile
linkedin.com/in/carlosgomez

EXPERIENCIA LABORAL

Tech Solutions S.A.
Lead Frontend Developer
Enero 2021 - Presente
• Lideró la migración a microfrontends con React y TypeScript.
• Optimizó el rendimiento de carga reduciendo latencia en 30%.
Tecnologías: React, TypeScript, Vite

Banco Digital Corp
Software Developer
Marzo 2018 - Diciembre 2020
• Desarrollo de microservicios con Node.js y PostgreSQL.
Tecnologías: Node.js, Express, PostgreSQL
`;

    const result = extractCvDataLocally(sampleCv, "cv.txt");

    expect(result.cvData.contact.name).toBe("Carlos Gomez");
    expect(result.cvData.experiences.length).toBe(2);

    const exp1 = result.cvData.experiences[0];
    expect(exp1.company).toBe("Tech Solutions S.A.");
    expect(exp1.role).toBe("Lead Frontend Developer");
    expect(exp1.startDate).toContain("Enero 2021");
    expect(exp1.bullets.length).toBe(2);

    const exp2 = result.cvData.experiences[1];
    expect(exp2.company).toBe("Banco Digital Corp");
    expect(exp2.role).toBe("Software Developer");
    expect(exp2.startDate).toContain("Marzo 2018");
  });

  it("filters raw PDF binary junk lines gracefully", () => {
    const rawBinaryHeader = `%PDF-1.4
%
1 0 obj
<< /Title (Test) /Producer (Skia/PDF) >>
endobj
`;
    const result = extractCvDataLocally(rawBinaryHeader, "corrupt.pdf");
    expect(result.cvData.contact.name).not.toContain("%PDF");
    expect(result.cvData.contact.location).not.toContain("Skia/PDF");
  });
});
