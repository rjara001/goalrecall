import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, "../public/demo-cv.pdf");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Palette
const primaryColor = "#0f172a"; // Slate 900
const accentColor = "#0284c7"; // Cyan 600
const textColor = "#334155"; // Slate 700
const subtleColor = "#64748b"; // Slate 500

// Header: Name & Headline
doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor).text("ALEX MORGAN", { characterSpacing: 1 });
doc.moveDown(0.2);
doc.font("Helvetica-Bold").fontSize(12).fillColor(accentColor).text("Senior Full Stack Developer & Systems Architect");
doc.moveDown(0.3);

// Contact Info Line
doc.font("Helvetica").fontSize(9).fillColor(subtleColor)
  .text("Santiago, Chile · Remote · alex.morgan@ejemplo.com · +56 9 8765 4321 · linkedin.com/in/alexmorgan · github.com/alexmorgan", {
    lineGap: 2,
  });

doc.moveDown(0.6);
doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(45, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.8);

// Section: Summary
doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text("RESUMEN PROFESIONAL");
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(9.5).fillColor(textColor).text(
  "Seasoned Full Stack Software Engineer con más de 12 años de experiencia diseñando y entregando soluciones escalables de alto rendimiento para plataformas globales y fintechs (PayPal, Chambers & Partners, Dunnhumby, Falabella, Raisin). Especializado en arquitecturas distribuidas, microfrontends, optimización de latencia y desarrollo full-stack con TypeScript, React, Next.js, Angular 21, Node.js, .NET 10 y cloud en AWS y Azure.",
  { align: "justify", lineGap: 3 }
);
doc.moveDown(0.8);

// Section: Technical Skills
doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text("HABILIDADES TÉCNICAS & STACK");
doc.moveDown(0.3);
doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor).text("• Lenguajes & Core: ", { continued: true });
doc.font("Helvetica").fillColor(textColor).text("TypeScript, JavaScript, C#, .NET 10, Go, Python, SQL, HTML5, CSS3");
doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor).text("• Frameworks & Frontend: ", { continued: true });
doc.font("Helvetica").fillColor(textColor).text("Angular 21, Native Federation, React, Next.js, NestJS, Node.js, Tailwind CSS, MediatR");
doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor).text("• Cloud, Datos & DevOps: ", { continued: true });
doc.font("Helvetica").fillColor(textColor).text("AWS, Azure, Docker, Kubernetes, AKS, PostgreSQL, SQL Server, Databricks, CI/CD, GitLab, OpenTelemetry");
doc.moveDown(0.8);

// Section: Work Experience
doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text("EXPERIENCIA LABORAL");
doc.moveDown(0.5);

function addExperience(role, company, period, bullets, technologies) {
  // Check if page break is needed
  if (doc.y > 700) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(primaryColor).text(role);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(accentColor).text(`@ ${company}`, { continued: true });
  doc.font("Helvetica").fontSize(8.5).fillColor(subtleColor).text(`   ·   ${period}`);
  doc.moveDown(0.3);

  bullets.forEach((bullet) => {
    doc.font("Helvetica").fontSize(9).fillColor(textColor).text(`•  ${bullet}`, {
      indent: 8,
      lineGap: 2.5,
      paragraphGap: 2,
    });
  });

  if (technologies && technologies.length > 0) {
    doc.moveDown(0.2);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(subtleColor).text("Tecnologías: ", { continued: true, indent: 8 });
    doc.font("Helvetica").fillColor(textColor).text(technologies.join(", "));
  }

  doc.moveDown(0.7);
}

// 1. ParserDigital / Chambers & Partners
addExperience(
  "Senior Full Stack Developer",
  "ParserDigital / Chambers & Partners",
  "Oct 2025 — Present · Remote",
  [
    "Delivered the Digital Submissions platform for Chambers & Partners in 7 months, on time and on budget, rolling out to 10,000+ law firms worldwide for legal rankings.",
    "Replaced fragmented manual submissions with live digital workflows, converting Word/Excel documents into structured collaboration and contributor tracking.",
    "Owned the end-to-end development of the History Navigation audit component, visual diffing additions, removals and modifications across document versions.",
    "Developed frontend microfrontends using Angular 21 and Native Federation, implementing modular reactive state flows with Signals and OnPush detection.",
    "Architected backend microservices with .NET 10 Minimal APIs and MediatR applying Vertical Slice Architecture to decouple domain logic.",
    "Integrated with Chambers Central API (CcApi) and configured CI/CD pipelines with Azure DevOps and Docker with automated xUnit test suites."
  ],
  ["Angular 21", "Native Federation", ".NET 10", "Minimal APIs", "MediatR", "Azure DevOps", "Docker", "xUnit", "CcApi"]
);

// 2. ParserDigital / Dunnhumby
addExperience(
  "Full Stack Developer",
  "ParserDigital / Dunnhumby",
  "Oct 2024 — Oct 2025 · Remote",
  [
    "Built and maintained dynamic enterprise reporting dashboards using Next.js and NestJS, integrating Databricks APIs for large-scale curated datasets.",
    "Designed and implemented PostgreSQL relational models and stored procedures, improving report query throughput by 35%.",
    "Integrated Azure Service Principals for secure token management and serverless query execution via NestJS.",
    "Deployed scalable applications on Azure Kubernetes Service (AKS) with automated CI/CD pipelines in GitLab and observability via OpenTelemetry."
  ],
  ["React", "Next.js", "NestJS", ".NET 9", "PostgreSQL", "Azure", "AKS", "Databricks", "GitLab", "OpenTelemetry"]
);

// 3. Raisin
addExperience(
  "Backend Developer",
  "Raisin",
  "Sep 2023 — Oct 2024 · Remote",
  [
    "Developed core SaaS platform features, maintainable back-office REST APIs and batch transaction processors using .NET Core and Go.",
    "Optimized SQL Server stored procedures and database indexes, reducing batch execution windows by 40%.",
    "Led automated deployment of microservices to AWS, improving release stability and zero-downtime rolling updates."
  ],
  [".NET Core", "GraphQL", "Go", "Node.js", "AWS", "SQL Server", "Docker"]
);

// 4. AndBank
addExperience(
  "Full Stack Developer",
  "AndBank.com",
  "Aug 2022 — Sep 2023 · On-Site",
  [
    "Enhanced digital banking mobile and web interfaces with React, TypeScript and C# .NET Core.",
    "Implemented multithreading background data loading in C#, reducing mobile cold-start loading times by 50%.",
    "Streamlined release pipelines and crash diagnostics via App Center and automated integration tests."
  ],
  ["React", "TypeScript", ".NET Core", "Xamarin", "C#", "App Center"]
);

// 5. PayPal
addExperience(
  "Full Stack Developer (Remote)",
  "Taller Technologies / Paypal.com",
  "Mar 2021 — Jun 2022 · Remote",
  [
    "Developed features for PayPal investment mobile app using React Native, improving onboarding flow conversion by 22%.",
    "Implemented GraphQL APIs and serverless AWS Lambda functions, reducing backend latency to sub-80ms p99.",
    "Hardened checkout core repositories, eliminating critical concurrency bottlenecks during high-traffic promotional events.",
    "Participated in Agile Scrum sprints using Jira, collaborating with cross-functional global teams across US time zones."
  ],
  ["React Native", "TypeScript", "Node.js", "GraphQL", "AWS Lambda", "Docker", "Kubernetes"]
);

// 6. Falabella Bank
addExperience(
  "Full Stack Developer",
  "Falabella Bank, Santiago",
  "Jan 2020 — Mar 2021 · Santiago, Chile",
  [
    "Developed omnichannel banking digital experiences, implementing secure customer onboarding flows and account management microservices.",
    "Implemented CI/CD pipelines and automated integration testing with Jenkins, Docker and Jest, accelerating sprint release cycles.",
    "Maintained and optimized REST APIs and Apigee gateways handling high-volume transaction loads."
  ],
  ["Node.js", "NestJS", "REST APIs", "Docker", "Jenkins", "Apigee", "Jest"]
);

// 7. Falabella Retail
addExperience(
  "Technical Lead",
  "Falabella Retail, Santiago",
  "Apr 2019 — Jan 2020 · Santiago, Chile",
  [
    "Led and mentored an engineering team building enterprise AI-driven virtual assistants using Azure Cognitive Services.",
    "Delivered process automation solutions leveraging Azure RPA and GCP serverless, saving 300+ hours of monthly manual operational workload.",
    "Oversaw containerized deployments on Kubernetes with strict code reviews and testing standards."
  ],
  ["Node.js", "Azure Cognitive Services", "GCP", "Kubernetes", "PostgreSQL", "Docker"]
);

// 8. Proyectos Personales
addExperience(
  "Ingeniero & Arquitecto Creador",
  "Proyectos Personales & Consultoría Independiente",
  "2023 — Present · Laboratorio Personal",
  [
    "Desarrollo de herramientas de software libre, prototipos de IA, experimentos de arquitectura distribuida e investigación técnica.",
    "Implementación de arquitectura local-first con cifrado en cliente y sincronización asíncrona."
  ],
  ["TypeScript", "Next.js", "AI/LLMs", "Tailwind CSS", "Go"]
);

// Section: Education & Certifications
if (doc.y > 680) {
  doc.addPage();
}
doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text("EDUCACIÓN & CERTIFICACIONES");
doc.moveDown(0.3);
doc.font("Helvetica-Bold").fontSize(9.5).fillColor(primaryColor).text("Ingeniería en Computación e Informática");
doc.font("Helvetica").fontSize(8.5).fillColor(subtleColor).text("Universidad de Chile · Titulado con Distinción");
doc.moveDown(0.4);
doc.font("Helvetica-Bold").fontSize(9.5).fillColor(primaryColor).text("Certificaciones:");
doc.font("Helvetica").fontSize(9).fillColor(textColor).text("• AWS Certified Solutions Architect - Associate");
doc.font("Helvetica").fontSize(9).fillColor(textColor).text("• Certified Kubernetes Administrator (CKA)");
doc.moveDown(0.6);

// Section: Languages
doc.font("Helvetica-Bold").fontSize(11).fillColor(primaryColor).text("IDIOMAS");
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(9).fillColor(textColor).text("• Español: Nativo");
doc.font("Helvetica").fontSize(9).fillColor(textColor).text("• Inglés: C1 Profesional / Avanzado (Flujo técnico y conversación de negocios diaria)");

doc.end();

writeStream.on("finish", () => {
  console.log("PDF generated successfully at:", outputPath);
});
