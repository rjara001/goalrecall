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

  it("extracts experiences, education and contact details faithfully from real-world multiline CV format", () => {
    const multilineCv = `Rodrigo Jara P.
– Full Stack Software Engineer
Email: rjara001@gmail.com | GitHub: github.com/rjara001 | LinkedIn:
linkedin.com/in/rjara001
Profile Summary
Seasoned Full Stack Software Engineer with 18+ years of experience delivering scalable solutions.
Technical Skills
Languages: TypeScript (5 yrs), JavaScript (12+ yrs), Node.js (7+ yrs)
Cloud & DevOps: Azure, AWS, Docker, Kubernetes
Professional Experience
ParserDigital / Chambers & Partners – Senior Full Stack Developer (Remote) | Oct 2025 –
Present
Tech Stack: Angular 21, Native Federation, .NET 10, Microservices, Azure DevOps, Docker
●
●
Delivered the Digital Submissions platform for Chambers & Partners in 7 months.
Replaced fragmented document-heavy process with structured digital workflows.
ParserDigital / Dunnhumby – Full Stack Developer (Remote) | Oct 2024 – Oct 2025
Tech Stack: React, Next.js, NestJS, .NET 9, PostgreSQL, AKS
●
Built dynamic reporting forms and dashboards using Next.js and NestJS.
Education
2021 – 2022: Master’s in Data Science, Complutense University of Madrid
2005 – 2007: B.Sc. in Computer Science, University Central, Chile`;

    const result = extractCvDataLocally(multilineCv, "cv_test.pdf");

    expect(result.cvData.contact.name).toBe("Rodrigo Jara P.");
    expect(result.cvData.contact.headline).toBe("Full Stack Software Engineer");
    expect(result.cvData.contact.email).toBe("rjara001@gmail.com");
    expect(result.cvData.contact.github).toBe("github.com/rjara001");
    expect(result.cvData.contact.linkedin).toBe("linkedin.com/in/rjara001");
    expect(result.cvData.experiences.length).toBe(2);
    expect(result.cvData.experiences[0].company).toBe("ParserDigital / Chambers & Partners");
    expect(result.cvData.experiences[0].role).toBe("Senior Full Stack Developer (Remote)");
    expect(result.cvData.experiences[0].startDate).toBe("Oct 2025 – Present");
    expect(result.cvData.experiences[0].bullets.length).toBeGreaterThanOrEqual(2);
    expect(result.cvData.education.length).toBe(2);
    expect(result.cvData.education[0].degree).toBe("Master’s in Data Science");
    expect(result.cvData.education[0].institution).toBe("Complutense University of Madrid");
    expect(result.cvData.education[0].year).toBe("2021 – 2022");
  });
