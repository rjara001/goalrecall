import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";
// @ts-ignore
import { PDFParse } from "pdf-parse";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static assets from public/ (including sample PDF CVs)
app.use(express.static(path.resolve(__dirname, "public")));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface CvContact {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface CvExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  bullets: string[];
  technologies: string[];
  category: string;
}

export interface CvEducation {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  status?: string;
}

export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
  credentialId?: string;
}

export interface CvProject {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface CvLanguage {
  id: string;
  language: string;
  level: string;
}

export interface ExtractedCvData {
  contact: CvContact;
  summary: string;
  skills: {
    technical: string[];
    frameworks: string[];
    toolsCloud: string[];
    softSkills: string[];
  };
  experiences: CvExperience[];
  education: CvEducation[];
  certifications: CvCertification[];
  projects: CvProject[];
  languages: CvLanguage[];
  rawTextPreview?: string;
}

export interface CvPendingField {
  id: string;
  section: "contact" | "summary" | "skills" | "experiences" | "education" | "certifications" | "projects" | "languages";
  fieldName: string;
  label: string;
  description: string;
  severity: "high" | "medium" | "low";
  suggestedPrompt: string;
}

export interface ExtractedAchievementItem {
  id: string;
  client: string;
  project: string;
  title: string;
  description: string;
  impact: string;
  whatWasSought?: string;
  whyImportant?: string;
  howApplied?: string;
  category: string;
  tags: string[];
  xyzScore: number;
  metricHighlight?: string;
}

// Compute the checklist of pending / unfulfilled fields
function calculateCvAudit(cv: ExtractedCvData): {
  pendingFields: CvPendingField[];
  completedCount: number;
  totalChecks: number;
  completenessScore: number;
} {
  const pendingFields: CvPendingField[] = [];
  let checksPassed = 0;
  const totalChecks = 13;

  // 1. Name
  if (cv.contact?.name && cv.contact.name.trim().length > 1) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-name",
      section: "contact",
      fieldName: "name",
      label: "Nombre Completo",
      description: "No se identificó el nombre del titular en el documento.",
      severity: "high",
      suggestedPrompt: "Ej: Alex Morgan",
    });
  }

  // 2. Headline
  if (cv.contact?.headline && cv.contact.headline.trim().length > 2) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-headline",
      section: "contact",
      fieldName: "headline",
      label: "Titular Profesional / Cargo Principal",
      description: "No se identificó el titular profesional (ej: Senior Software Engineer).",
      severity: "high",
      suggestedPrompt: "Ej: Senior Full-Stack & Systems Architect",
    });
  }

  // 3. Email
  if (cv.contact?.email && cv.contact.email.includes("@")) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-email",
      section: "contact",
      fieldName: "email",
      label: "Correo Electrónico de Contacto",
      description: "No se encontró dirección de correo electrónico en el documento.",
      severity: "high",
      suggestedPrompt: "Ej: usuario@gmail.com",
    });
  }

  // 4. Phone
  if (cv.contact?.phone && cv.contact.phone.trim().length >= 6) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-phone",
      section: "contact",
      fieldName: "phone",
      label: "Teléfono / WhatsApp",
      description: "No se detectó número telefónico o WhatsApp de contacto.",
      severity: "medium",
      suggestedPrompt: "Ej: +56 9 1234 5678",
    });
  }

  // 5. Location
  if (cv.contact?.location && cv.contact.location.trim().length > 2) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-location",
      section: "contact",
      fieldName: "location",
      label: "Ubicación & Modalidad",
      description: "Falta ciudad, país o modalidad de trabajo (Remoto/Híbrido).",
      severity: "medium",
      suggestedPrompt: "Ej: Santiago, Chile / Remoto",
    });
  }

  // 6. LinkedIn
  if (cv.contact?.linkedin && cv.contact.linkedin.trim().length > 5) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-linkedin",
      section: "contact",
      fieldName: "linkedin",
      label: "Enlace a Perfil de LinkedIn",
      description: "No se encontró enlace o identificador de LinkedIn.",
      severity: "medium",
      suggestedPrompt: "Ej: https://linkedin.com/in/tu-usuario",
    });
  }

  // 7. GitHub / Portfolio Code
  if (cv.contact?.github && cv.contact.github.trim().length > 4) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-github",
      section: "contact",
      fieldName: "github",
      label: "Enlace a GitHub o Repositorios",
      description: "No se detectó enlace a GitHub para validar código y contribuciones.",
      severity: "low",
      suggestedPrompt: "Ej: https://github.com/tu-usuario",
    });
  }

  // 8. Summary / About
  if (cv.summary && cv.summary.trim().length > 25) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-summary",
      section: "summary",
      fieldName: "summary",
      label: "Resumen Profesional / Sobre Mí",
      description: "El CV carece de un párrafo de síntesis de carrera o perfil ejecutivo.",
      severity: "medium",
      suggestedPrompt: "Redacta 2-3 líneas resumiendo tus años de experiencia y foco.",
    });
  }

  // 9. Work Experiences
  if (cv.experiences && cv.experiences.length > 0) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-experiences",
      section: "experiences",
      fieldName: "experiences",
      label: "Historial de Experiencia Laboral",
      description: "No se pudieron identificar empresas o roles laborales previos.",
      severity: "high",
      suggestedPrompt: "Agrega al menos una experiencia laboral previa.",
    });
  }

  // 10. Technical Skills
  const totalSkills =
    (cv.skills?.technical?.length || 0) +
    (cv.skills?.frameworks?.length || 0) +
    (cv.skills?.toolsCloud?.length || 0);

  if (totalSkills >= 3) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-skills",
      section: "skills",
      fieldName: "technical",
      label: "Habilidades Técnicas & Stack",
      description: "Se detectaron muy pocas tecnologías o ninguna lista clara de skills.",
      severity: "high",
      suggestedPrompt: "Ej: TypeScript, React, Node.js, PostgreSQL, Docker, AWS",
    });
  }

  // 11. Education
  if (cv.education && cv.education.length > 0) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-education",
      section: "education",
      fieldName: "education",
      label: "Formación Académica / Universidad",
      description: "No se identificaron títulos de grado, diplomados o estudios superiores.",
      severity: "medium",
      suggestedPrompt: "Ej: Licenciatura o Ingeniería en Computación / Software",
    });
  }

  // 12. Certifications
  if (cv.certifications && cv.certifications.length > 0) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-certifications",
      section: "certifications",
      fieldName: "certifications",
      label: "Certificaciones Técnicas",
      description: "No se detectaron certificaciones de industria (AWS, GCP, Scrum, etc.).",
      severity: "low",
      suggestedPrompt: "Ej: AWS Certified Developer, Certified Kubernetes Administrator",
    });
  }

  // 13. Languages
  if (cv.languages && cv.languages.length > 0) {
    checksPassed++;
  } else {
    pendingFields.push({
      id: "pending-languages",
      section: "languages",
      fieldName: "languages",
      label: "Idiomas & Nivel de Dominio",
      description: "No se especificaron idiomas (ej: Español Nativo, Inglés C1).",
      severity: "low",
      suggestedPrompt: "Ej: Español (Nativo), Inglés (Avanzado C1 / Profesional)",
    });
  }

  const completenessScore = Math.round((checksPassed / totalChecks) * 100);

  return {
    pendingFields,
    completedCount: checksPassed,
    totalChecks,
    completenessScore,
  };
}

// Convert extracted experiences into LogEntry-compatible achievements faithfully
function cvToAchievements(cv: ExtractedCvData, fileName?: string): ExtractedAchievementItem[] {
  const achievements: ExtractedAchievementItem[] = [];

  if (Array.isArray(cv.experiences)) {
    cv.experiences.forEach((exp, expIdx) => {
      const company = exp.company?.trim() || "Empresa";
      const project = exp.role?.trim() || "Ingeniería";

      if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet, bIdx) => {
          if (!bullet || bullet.trim().length < 8) return;
          const cleanBullet = bullet.trim();

          // Extract real metric if present in the text, otherwise keep textual outcome
          const metricMatch = cleanBullet.match(
            /(\d+[\%|\$|k|M|B|ms|s|x|min|hr|req|GB|TB|rps]+|[0-9]+[.,][0-9]+\%|redujo|aumentó|disminuyó|mejoró|saving|saved|reduced|increased)[^\,\.\;]*/i
          );

          let metricHighlight: string | undefined = undefined;
          if (metricMatch) {
            metricHighlight = metricMatch[0].trim().substring(0, 24);
          }

          // Generate tags from technologies or text
          const tags: string[] = [];
          if (Array.isArray(exp.technologies)) {
            exp.technologies.slice(0, 4).forEach((tech) => {
              if (tech && !tags.includes(`#${tech.replace(/[\s\.]/g, "")}`)) {
                tags.push(`#${tech.replace(/[\s\.]/g, "")}`);
              }
            });
          }
          if (tags.length === 0) {
            tags.push("#Logro", "#Trayectoria");
          }

          // Determine accurate category for this specific achievement
          let bulletCategory: string = exp.category || "Feature ✨";
          const lowerBullet = cleanBullet.toLowerCase();
          if (/growth|marketing|campaña|cac|ltv|leads|conversion|conversi[oó]n|roas|seo|sem|funnel|adwords|meta ads/i.test(lowerBullet)) {
            bulletCategory = "Growth & Marketing 📈";
          } else if (/ventas|sales|arr|mrr|deals|pipeline|cuentas enterprise|b2b|quota/i.test(lowerBullet)) {
            bulletCategory = "Negocios & Ventas 💼";
          } else if (/diseño|design|ux|ui|figma|prototip|investigaci[oó]n de usuarios|onboarding/i.test(lowerBullet)) {
            bulletCategory = "Diseño & Producto 🎨";
          } else if (/liderazgo|management|team lead|contrataci[oó]n|mentoring|cultura|scrum/i.test(lowerBullet)) {
            bulletCategory = "Liderazgo & Gestión 👥";
          } else if (/operacion|operaciones|procesos|log[ií]stica|supply|compliance|soporte/i.test(lowerBullet)) {
            bulletCategory = "Operaciones & Procesos ⚙️";
          } else if (/arquitect|architec|migra|monolit|distribuid|cloud|event|kafka|microserv|federation|microfrontend/i.test(lowerBullet)) {
            bulletCategory = "Architecture 🏗️";
          } else if (/ci\/cd|pipeline|docker|kubernetes|k8s|devops|terraform|aks|aws|azure|gcp|despliegue/i.test(lowerBullet)) {
            bulletCategory = "Infra/DevOps 🚀";
          } else if (/refactor|optimiz|rendimient|latenc|p99|speed|vitals|performance/i.test(lowerBullet)) {
            bulletCategory = "Refactor 🧹";
          } else if (/bug|fix|error|vulnerab|security|seguridad|pci/i.test(lowerBullet)) {
            bulletCategory = "Fix 🐛";
          } else if (/spike|poc|r&d|evalu|investig|prototip|laboratorio/i.test(lowerBullet)) {
            bulletCategory = "Spike/R&D 🔬";
          }

          achievements.push({
            id: `ach-${Date.now()}-${expIdx}-${bIdx}`,
            client: company,
            project: project,
            title: cleanBullet, // Logro multilínea completo (viñeta de CV sin truncar)
            description: `Documento fuente: ${fileName || "CV"}. Rol: ${exp.role || "Profesional"}.`,
            impact: cleanBullet, // Strictly truthful: texto de la viñeta
            whatWasSought: `Entrega de capacidades vinculadas a: ${cleanBullet.slice(0, 100)}`,
            whyImportant: `Alineado con los objetivos del rol en ${company}.`,
            howApplied: exp.technologies?.length ? `Implementado con ${exp.technologies.slice(0, 6).join(", ")}.` : undefined,
            category: bulletCategory,
            tags: tags,
            xyzScore: metricMatch ? 92 : 82,
            metricHighlight: metricHighlight,
          });
        });
      } else if (exp.description && exp.description.trim().length > 15) {
        achievements.push({
          id: `ach-${Date.now()}-${expIdx}-0`,
          client: company,
          project: project,
          title: exp.description, // Logro completo sin truncar
          description: `Documento: ${fileName || "CV"}. Rol: ${exp.role || "Profesional"}.`,
          impact: exp.description,
          category: exp.category || "Feature ✨",
          tags: exp.technologies?.map((t) => `#${t.replace(/[\s\.]/g, "")}`) || ["#Trayectoria"],
          xyzScore: 80,
        });
      }
    });
  }

  // If projects are present and experiences had few bullets, add projects as achievements
  if (achievements.length < 3 && Array.isArray(cv.projects)) {
    cv.projects.forEach((proj, pIdx) => {
      achievements.push({
        id: `ach-proj-${Date.now()}-${pIdx}`,
        client: "Proyecto Independiente",
        project: proj.name || "Proyecto",
        title: proj.description || proj.name || "Proyecto técnico",
        description: `Proyecto: ${proj.name}. Rol: ${proj.role || "Autor"}.`,
        impact: proj.description || "Desarrollo técnico e implementación.",
        category: "Spike/R&D 🔬",
        tags: proj.technologies?.map((t) => `#${t.replace(/[\s\.]/g, "")}`) || ["#Proyecto"],
        xyzScore: 82,
      });
    });
  }

  return achievements;
}

// Binary text extraction for PDF, DOCX, and plain text
async function extractTextFromBuffer(buffer: Buffer, mimeType?: string, fileName?: string): Promise<string> {
  const lowerName = (fileName || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  // 1. PDF extraction
  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    try {
      // @ts-ignore
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      try {
        await parser.destroy();
      } catch (_) {}
      if (res && typeof res.text === "string" && res.text.trim().length > 0) {
        return res.text;
      }
    } catch (pdfErr) {
      console.warn("PDF extraction warning:", pdfErr);
    }
  }

  // 2. Word (.docx) extraction
  if (
    lowerMime.includes("word") ||
    lowerMime.includes("docx") ||
    lowerMime.includes("officedocument") ||
    lowerName.endsWith(".docx")
  ) {
    try {
      const docxRes = await mammoth.extractRawText({ buffer });
      if (docxRes && docxRes.value && docxRes.value.trim().length > 0) {
        return docxRes.value;
      }
    } catch (docxErr) {
      console.warn("DOCX extraction warning:", docxErr);
    }
  }

  // 3. Plain text UTF-8 fallback
  try {
    const raw = buffer.toString("utf-8");
    if (raw && !/[\x00-\x08\x0E-\x1F]/.test(raw.slice(0, 100))) {
      return raw;
    }
  } catch (_) {}

  return "";
}

// Local strict parser for offline/fallback scenarios (NEVER invents data)
function extractFullCvLocally(rawText: string, fileName: string): ExtractedCvData {
  if (!rawText || rawText.trim().length === 0) {
    return {
      contact: {
        name: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      summary: "",
      skills: {
        technical: [],
        frameworks: [],
        toolsCloud: [],
        softSkills: [],
      },
      experiences: [],
      education: [],
      certifications: [],
      projects: [],
      languages: [],
      rawTextPreview: "",
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Email regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone regex
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{1,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,5}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // LinkedIn regex
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // GitHub regex
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  // Portfolio regex
  const portfolioMatch = rawText.match(/(?:https?:\/\/)(?!linkedin|github|twitter|facebook|instagram)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  const portfolio = portfolioMatch ? portfolioMatch[0] : "";

  // Location detection
  const locationMatch = rawText.match(
    /(?:[A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)\s*[,|\/]\s*([A-ZÁÉÍÓÚ][a-záéíóú]+|\bChile\b|\bMéxico\b|\bArgentina\b|\bEspaña\b|\bColombia\b|\bPerú\b|\bUSA\b|\bRemoto\b|\bRemote\b)/i
  );
  const location = locationMatch ? locationMatch[0] : "";

  // Name & headline detection:
  // Usually in top 8 non-empty lines, avoiding headers or contact info
  let name = "";
  let headline = "";

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const l = lines[i];
    const isHeaderOrSection = /^(?:experiencia|historial|resumen|perfil|summary|skills|habilidades|educaci[oó]n|certificac|curriculum|cv|resume|hoja de vida)/i.test(l);
    const isContactLine = l.includes("@") || l.includes("http") || l.includes("github.com") || l.includes("linkedin.com") || /^\+?\d[\d\s-]{6,}/.test(l);

    if (!name && !isHeaderOrSection && !isContactLine && l.length > 2 && l.length < 50) {
      name = l;
      // Check next line for potential headline
      const next = lines[i + 1];
      if (next && !next.includes("@") && !next.includes("http") && !/^(?:experiencia|resumen|habilidades|skills)/i.test(next) && next.length < 80) {
        headline = next;
      }
      break;
    }
  }

  // Section parsing
  const experiences: CvExperience[] = [];
  const education: CvEducation[] = [];
  const certifications: CvCertification[] = [];
  const projects: CvProject[] = [];
  const languages: CvLanguage[] = [];
  const technicalSkills: string[] = [];
  const frameworks: string[] = [];
  const toolsCloud: string[] = [];
  const softSkills: string[] = [];
  let summary = "";

  let currentSection = "header";
  let currentExp: CvExperience | null = null;

  const pushCurrentExp = () => {
    if (currentExp) {
      // If bullets exist but description is missing, synthesize summary
      if (currentExp.bullets.length > 0 && !currentExp.description) {
        currentExp.description = currentExp.bullets.join(". ");
      }
      // If description exists but 0 bullets, split description into bullets!
      if (currentExp.bullets.length === 0 && currentExp.description) {
        const sentences = currentExp.description
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 8);
        if (sentences.length > 0) {
          currentExp.bullets = sentences;
        } else {
          currentExp.bullets = [currentExp.description];
        }
      }

      // Deduplicate bullets and strip stray empty items
      currentExp.bullets = Array.from(
        new Set(currentExp.bullets.map((b) => b.trim()))
      ).filter((b) => b.length > 8);

      // Infer technologies from bullets, role, or description if technologies is empty
      if (currentExp.technologies.length === 0) {
        const textToScan = `${currentExp.role} ${currentExp.company} ${currentExp.bullets.join(" ")} ${currentExp.description || ""}`;
        const commonTech = [
          // Engineering & Cloud
          "TypeScript", "JavaScript", "Python", "Go", "Java", "C#", ".NET", ".NET 10", ".NET 9", ".NET Core",
          "React", "Next.js", "Angular", "Angular 21", "Vue", "NestJS", "Node.js", "Express", "GraphQL", "REST APIs",
          "PostgreSQL", "SQL Server", "MongoDB", "Redis", "Databricks", "Kafka", "SQL",
          "AWS", "Azure", "GCP", "Docker", "Kubernetes", "AKS", "CI/CD", "Azure DevOps", "GitLab", "Jenkins",
          "Tailwind CSS", "Bootstrap 5", "Microservices", "Microfrontends", "Copilot", "LLMs", "AI",
          // Marketing, Growth & Sales
          "Google Ads", "Meta Ads", "SEO", "SEM", "HubSpot", "Google Analytics", "GA4", "Mixpanel", "Mailchimp",
          "Klaviyo", "Semrush", "Ahrefs", "Salesforce", "Pipedrive", "Tableau", "Power BI", "Excel", "Stripe",
          // Product, Design & Operations
          "Figma", "Notion", "Jira", "Miro", "Sketch", "Adobe XD", "UX/UI", "Design System"
        ];
        commonTech.forEach((tech) => {
          const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          if (regex.test(textToScan) && !currentExp!.technologies.includes(tech)) {
            currentExp!.technologies.push(tech);
            if (!technicalSkills.includes(tech)) technicalSkills.push(tech);
          }
        });
      }

      // Categorize based on content
      const fullExpText = `${currentExp.role} ${currentExp.company} ${currentExp.bullets.join(" ")} ${currentExp.technologies.join(" ")}`.toLowerCase();
      if (/growth|marketing|campaña|cac|ltv|leads|conversion|conversi[oó]n|roas|seo|sem|funnel|adwords|meta ads/i.test(fullExpText)) {
        currentExp.category = "Growth & Marketing 📈";
      } else if (/ventas|sales|arr|mrr|deals|pipeline|cuentas enterprise|b2b|quota/i.test(fullExpText)) {
        currentExp.category = "Negocios & Ventas 💼";
      } else if (/diseño|design|ux|ui|figma|prototip|investigaci[oó]n de usuarios|onboarding/i.test(fullExpText)) {
        currentExp.category = "Diseño & Producto 🎨";
      } else if (/liderazgo|management|team lead|contrataci[oó]n|mentoring|cultura|scrum/i.test(fullExpText)) {
        currentExp.category = "Liderazgo & Gestión 👥";
      } else if (/operacion|operaciones|procesos|log[ií]stica|supply|compliance|soporte/i.test(fullExpText)) {
        currentExp.category = "Operaciones & Procesos ⚙️";
      } else if (/arquitect|architec|migra|monolit|distribuid|cloud|event|kafka|microserv|federation|microfrontend/i.test(fullExpText)) {
        currentExp.category = "Architecture 🏗️";
      } else if (/ci\/cd|pipeline|docker|kubernetes|k8s|devops|terraform|aks|aws|azure|gcp|despliegue/i.test(fullExpText)) {
        currentExp.category = "Infra/DevOps 🚀";
      } else if (/refactor|optimiz|rendimient|latenc|p99|speed|vitals|performance/i.test(fullExpText)) {
        currentExp.category = "Refactor 🧹";
      } else if (/bug|fix|error|vulnerab|security|seguridad|pci/i.test(fullExpText)) {
        currentExp.category = "Fix 🐛";
      } else if (/spike|poc|r&d|evalu|investig|prototip|laboratorio/i.test(fullExpText)) {
        currentExp.category = "Spike/R&D 🔬";
      } else {
        currentExp.category = "Feature ✨";
      }

      // Check current status
      if (/(?:presente|present|actualidad)/i.test(currentExp.startDate || "") || /(?:presente|present|actualidad)/i.test(currentExp.endDate || "")) {
        currentExp.isCurrent = true;
      }

      experiences.push(currentExp);
      currentExp = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // 0. If currently in an experience and line starts with Tecnologías/Tech Stack, don't confuse with skills header!
    if (currentSection === "experience" && /^(?:Tecnolog[ií]as|Tech Stack|Stack|Tools):/i.test(line)) {
      if (currentExp) {
        const techStr = line.replace(/^(?:Tecnolog[ií]as|Tech Stack|Stack|Tools):\s*/i, "");
        const techs = techStr.split(/[,|•·;]/).map((t) => t.trim()).filter((t) => t.length > 0);
        currentExp.technologies.push(...techs);
        techs.forEach((t) => {
          if (!technicalSkills.includes(t)) technicalSkills.push(t);
        });
      }
      continue;
    }

    // Section detection
    if (/^(?:EXPERIENCIA|EXPERIENCE|HISTORIAL LABORAL|TRAYECTORIA|WORK EXPERIENCE|EXPERIENCIA LABORAL)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "experience";
      continue;
    } else if (/^(?:EDUCACI[OÓ]N|EDUCATION|FORMACI[OÓ]N ACAD[EÉ]MICA|ACADEMIC|ESTUDIOS)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "education";
      continue;
    } else if (/^(?:HABILIDADES|SKILLS|COMPETENCIAS|TECNOLOG[IÍ]AS|TECH STACK|TECHNICAL SKILLS)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "skills";
      continue;
    } else if (/^(?:CERTIFICACI[OÓ]N|CERTIFICACIONES|CERTIFICATES|CREDENTIALS)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "certifications";
      continue;
    } else if (/^(?:PROYECTOS|PROJECTS|PORTAFOLIO)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "projects";
      continue;
    } else if (/^(?:IDIOMAS|LANGUAGES)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "languages";
      continue;
    } else if (/^(?:RESUMEN|PERFIL|SOBRE M[IÍ]|SUMMARY|ABOUT|PROFILE)/i.test(upper)) {
      pushCurrentExp();
      currentSection = "summary";
      continue;
    }

    // Section Handlers
    if (currentSection === "summary") {
      if (!summary && line.length > 20) {
        summary = line;
      } else if (summary && summary.length < 500) {
        summary += " " + line;
      }
    } else if (currentSection === "skills") {
      const cleanTokens = line
        .replace(/^(?:lenguajes|frameworks|librerías|herramientas|cloud & devops|metodologías|técnicas|skills):/i, "")
        .split(/[,|•·;]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length < 35);

      cleanTokens.forEach((tok) => {
        const tokLower = tok.toLowerCase();
        if (/react|next|vue|angular|svelte|express|nest|django|flask|spring|laravel/i.test(tokLower)) {
          if (!frameworks.includes(tok)) frameworks.push(tok);
        } else if (/aws|azure|gcp|docker|kubernetes|k8s|terraform|git|linux|ci\/cd|kafka|redis|jenkins/i.test(tokLower)) {
          if (!toolsCloud.includes(tok)) toolsCloud.push(tok);
        } else if (/scrum|kanban|agile|leadership|liderazgo|comunicación/i.test(tokLower)) {
          if (!softSkills.includes(tok)) softSkills.push(tok);
        } else {
          if (!technicalSkills.includes(tok)) technicalSkills.push(tok);
        }
      });
    } else if (currentSection === "experience" || currentExp !== null || line.startsWith("@") || (lines[i + 1] && lines[i + 1].startsWith("@"))) {
      currentSection = "experience";

      // 1. Technologies line within experience
      if (/^(?:Tecnolog[ií]as|Tech Stack|Stack|Tools):/i.test(line)) {
        if (currentExp) {
          const techStr = line.replace(/^(?:Tecnolog[ií]as|Tech Stack|Stack|Tools):\s*/i, "");
          const techs = techStr.split(/[,|•·;]/).map((t) => t.trim()).filter((t) => t.length > 0);
          currentExp.technologies.push(...techs);
          techs.forEach((t) => {
            if (!technicalSkills.includes(t)) technicalSkills.push(t);
          });
        }
        continue;
      }

      // 2. Lookahead: Check if this line is a job role preceding an upcoming "@ Company" line
      if (lines[i + 1] && lines[i + 1].startsWith("@")) {
        pushCurrentExp();
        // The next iteration will parse "@ Company" and take this line as its role
        continue;
      }

      // 3. Pattern: @ Company
      if (line.startsWith("@")) {
        pushCurrentExp();
        currentSection = "experience";
        const company = line.replace(/^@\s*/, "").trim();
        const prevLine = lines[i - 1];
        let role = prevLine && !prevLine.startsWith("@") && !prevLine.startsWith("•") && !/^(?:Experiencia|Historial|Experience|Work)/i.test(prevLine) ? prevLine : (headline || "Ingeniero");
        let dateRange = "";

        // Consume following date, location, or metadata lines
        let j = i + 1;
        while (j < lines.length && (
          lines[j].toLowerCase().includes("actualidad") ||
          lines[j].toLowerCase().includes("present") ||
          /(?:19|20)\d\d/.test(lines[j]) ||
          lines[j].toLowerCase().includes("remote") ||
          lines[j].toLowerCase().includes("remoto") ||
          lines[j].toLowerCase().includes("laboratorio") ||
          lines[j].toLowerCase().includes("chile") ||
          lines[j].toLowerCase().includes("santiago")
        )) {
          if (!dateRange) {
            dateRange = lines[j];
          } else {
            dateRange += " · " + lines[j];
          }
          j++;
        }
        i = j - 1;

        currentExp = {
          id: `exp-${Date.now()}-${experiences.length}`,
          company: company,
          role: role,
          startDate: dateRange,
          description: "",
          bullets: [],
          technologies: [],
          category: "Feature ✨",
        };
        continue;
      }

      // 4. Pattern: Role | Company | Date OR Company | Role | Date
      if ((line.includes("|") || line.includes(" — ") || line.includes(" - ")) && /(?:19|20)\d\d|presente|present|actualidad/i.test(line) && line.length < 130) {
        const parts = line.split(/[|—–-]/).map((p) => p.trim());
        pushCurrentExp();
        currentExp = {
          id: `exp-${Date.now()}-${experiences.length}`,
          company: parts[0] || "Empresa",
          role: parts[1] || headline || "Ingeniero",
          startDate: parts[2] || "",
          description: "",
          bullets: [],
          technologies: [],
          category: "Feature ✨",
        };
        continue;
      }

      // Filter page footers or page numbering (e.g. "4 of 6 --", "Page 4 of 6", "of 6 --") before stripping
      if (/\b\d+\s+of\s+\d+\b/i.test(line) || /of\s+\d+\s*--/i.test(line) || /^page\s+\d+/i.test(line) || /^--\s*\d+/i.test(line) || /--$/.test(line.trim())) {
        continue;
      }

      // 5. Clean line and strip any combination of bullet markers (•, ●, ○, ▪, ■, ◆, -, *, etc.)
      const cleanLine = line.replace(/^[•●○▪■◆\-*–—›\d\.\)\>\s]+/g, "").trim();

      if (!cleanLine || /^\d+\s*(?:of|\/)\s*\d+/i.test(cleanLine) || /^page\s+\d+/i.test(cleanLine)) {
        continue;
      }

      // Check if it's a technology list line (e.g. "Jest, GCP (serverless), JWT, REST APIs, Linux")
      if (cleanLine.includes(",")) {
        const tokens = cleanLine.split(/[,|•·;]/).map((t) => t.trim()).filter(Boolean);
        const isTechList = tokens.length >= 3 && tokens.every((p) => p.length < 30 && !/\b(?:developed|led|managed|delivered|oversaw|built|fostered|implemented|cre[oó]|desarroll[oó]|lider[oó])\b/i.test(p));
        if (isTechList) {
          if (currentExp) {
            currentExp.technologies.push(...tokens);
            tokens.forEach((t) => {
              if (!technicalSkills.includes(t)) technicalSkills.push(t);
            });
          }
          continue;
        }
      }

      // Check if single technology word line under dates (e.g. "Kubernetes")
      const words = cleanLine.split(/\s+/);
      if (words.length <= 2 && cleanLine.length < 25 && !/\b(?:developed|led|built)\b/i.test(cleanLine)) {
        if (currentExp && !currentExp.technologies.includes(cleanLine)) {
          currentExp.technologies.push(cleanLine);
          if (!technicalSkills.includes(cleanLine)) technicalSkills.push(cleanLine);
        }
        continue;
      }

      // 6. Substantive job responsibility or accomplishment bullet
      if (currentExp) {
        // Multi-line continuation: check if previous bullet ended with dangling word (using, and, with, for, etc.)
        const lastBullet = currentExp.bullets.length > 0 ? currentExp.bullets[currentExp.bullets.length - 1] : "";
        const danglingPrev = /(?:using|and|with|for|in|to|of|the|a|an|across|between|including|throughout)\s*$/i.test(lastBullet);
        const isLowercaseContinuation = /^[a-z,;]/.test(cleanLine);

        if (currentExp.bullets.length > 0 && (danglingPrev || isLowercaseContinuation)) {
          const lastIdx = currentExp.bullets.length - 1;
          currentExp.bullets[lastIdx] += " " + cleanLine;
          if (currentExp.description) currentExp.description += " " + cleanLine;
          continue;
        }

        if (cleanLine.length > 10) {
          currentExp.bullets.push(cleanLine);
          if (!currentExp.description) {
            currentExp.description = cleanLine;
          } else {
            currentExp.description += " " + cleanLine;
          }
        }
        continue;
      }
    } else if (currentSection === "education") {
      if (line.length > 5 && line.length < 120 && !line.startsWith("•")) {
        const parts = line.split(/[|—–,-]/).map((p) => p.trim());
        education.push({
          id: `edu-${Date.now()}-${education.length}`,
          degree: parts[0] || line,
          institution: parts[1] || "",
          year: parts[2] || "",
        });
      }
    } else if (currentSection === "certifications") {
      if (line.length > 5 && line.length < 120 && !line.startsWith("•")) {
        const parts = line.split(/[|—–,-]/).map((p) => p.trim());
        certifications.push({
          id: `cert-${Date.now()}-${certifications.length}`,
          name: parts[0] || line,
          issuer: parts[1] || "",
          year: parts[2] || "",
        });
      }
    } else if (currentSection === "languages") {
      if (line.length > 3 && line.length < 70) {
        const parts = line.split(/[:\-\(]/).map((p) => p.trim());
        languages.push({
          id: `lang-${Date.now()}-${languages.length}`,
          language: parts[0] || line,
          level: parts[1]?.replace(/[\)]/g, "").trim() || "Competencia profesional",
        });
      }
    }
  }

  pushCurrentExp();

  // If headline wasn't found at top, infer from first experience role
  if (!headline && experiences.length > 0 && experiences[0].role) {
    headline = experiences[0].role;
  }

  return {
    contact: {
      name: name || "",
      headline: headline || "",
      email: email || "",
      phone: phone || "",
      location: location || "",
      linkedin: linkedin || "",
      github: github || "",
      portfolio: portfolio || "",
    },
    summary: summary || "",
    skills: {
      technical: technicalSkills.slice(0, 15),
      frameworks: frameworks.slice(0, 10),
      toolsCloud: toolsCloud.slice(0, 10),
      softSkills: softSkills.slice(0, 6),
    },
    experiences: experiences,
    education: education,
    certifications: certifications,
    projects: projects,
    languages: languages,
    rawTextPreview: rawText.substring(0, 400),
  };
}

// Master Extraction Endpoint supporting both full CV & achievements
app.post("/api/cv/extract-full-cv", async (req, res) => {
  let textContent: string = req.body?.textContent || "";
  let fileBase64: string = req.body?.fileBase64 || "";
  let mimeType: string = req.body?.mimeType || "";
  let fileName: string = req.body?.fileName || "cv.txt";

  try {

    if (!textContent && !fileBase64) {
      return res.status(400).json({
        error: "Se requiere el contenido del CV en texto o archivo en base64.",
      });
    }

    // 1. Strict Physical Size Restriction (2 MB max payload for Free Tier sustainability)
    if (fileBase64 && fileBase64.length > 2.9 * 1024 * 1024) {
      return res.status(400).json({
        error: "El archivo excede el límite de 2 MB permitido para cuentas gratuitas. Por favor sube un archivo optimizado.",
      });
    }

    // 2. Decode binary file to text upfront so both Gemini & local fallback have real text
    if (fileBase64) {
      const cleanBase64 = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
      try {
        const fileBuffer = Buffer.from(cleanBase64, "base64");
        const extracted = await extractTextFromBuffer(fileBuffer, mimeType, fileName);
        if (extracted && extracted.trim().length > 0) {
          textContent = extracted;
        }
      } catch (bufErr) {
        console.warn("No se pudo extraer texto del buffer binario:", bufErr);
      }
    }

    // 3. Strict Text Length Restriction (15,000 chars max)
    if (textContent && textContent.length > 15000) {
      textContent = textContent.substring(0, 15000);
    }

    // If Gemini key is missing OR user explicitly requested local extraction
    if (!process.env.GEMINI_API_KEY || req.body.forceLocal) {
      console.warn("Usando extractor estricto verídico local.");
      const cvData = extractFullCvLocally(textContent || "", fileName || "documento");
      const audit = calculateCvAudit(cvData);
      const achievements = cvToAchievements(cvData, fileName);

      return res.json({
        cvData,
        achievements,
        pendingFields: audit.pendingFields,
        completedCount: audit.completedCount,
        totalChecks: audit.totalChecks,
        completenessScore: audit.completenessScore,
        engine: "local-strict-parser",
        fileName: fileName || "Documento",
      });
    }

    // Strict prompt to Gemini 3.8 Flash: 100% truthful, zero hallucinations across all disciplines
    const promptInstructions = `Eres un **Auditor y Extractor Profesional y Técnico de CVs de Máxima Fidelidad (Strict Truthfulness Engine)** capacitado para perfiles multidisciplinarios (Ingeniería de Software, Product Management, Growth & Marketing, Diseño UX/UI, Ventas B2B, Operaciones y Liderazgo).

DIRECTIVA SUPREMA: FIDELIDAD ESTRICTA Y VERACIDAD ABSOLUTA (CERO INVENCIÓN):
1. Lee minuciosamente el documento de CV adjunto (o texto proporcionado).
2. Extrae ÚNICAMENTE información real, verídica y explícitamente presente en el documento.
3. ESTRICTAMENTE PROHIBIDO INVENTAR:
   - NO inventes nombres de empresas, instituciones o clientes que no aparezcan.
   - NO inventes cargos o puestos.
   - NO inventes números, métricas cuantitativas, porcentajes o cantidades (ej. NO inventes 'redujo CAC 40%', 'aumentó ARR en $1M', 'redujo latencia 88%' si el texto no lo dice explícitamente).
   - NO inventes fechas o años.
   - Si una viñeta del documento no tiene una métrica numérica, transcríbela con fidelidad tal como la redactó el candidato, sin números ficticios.
4. MANEJO DE CAMPOS FALTANTES / PENDIENTES:
   - Si un campo típico de un CV no está presente en el documento (ejemplo: no hay teléfono, no hay enlace a LinkedIn, no hay enlace a GitHub/Behance, no hay sección de certificaciones, o falta la fecha de finalización de un rol), deja el campo como null o cadena vacía "".
   - NO intentes rellenar con datos genéricos o de ejemplo. El sistema etiquetará los campos vacíos como 'Pendiente de rellenar' para que el usuario los complete de forma guiada.

ESTRUCTURA COMPLETA A EXTRAER:
1. Contacto: name, headline, email, phone, location, linkedin, github, portfolio.
2. Resumen: summary (perfil / sobre mí, tal como está).
3. Habilidades:
   - technical: lenguajes de programación, bases de datos o herramientas técnicas/analíticas reales (ej. Python, SQL, GA4, PowerBI).
   - frameworks: librerías, frameworks o metodologías reales (ej. React, Scrum, OKRs, Inbound).
   - toolsCloud: herramientas clave, canales o suites (ej. HubSpot, Figma, AWS, Meta Ads, Jira, Salesforce, Docker).
   - softSkills: habilidades de liderazgo, comunicación o negociación explícitas.
4. Experiencias: lista de experiencias laborales con:
   - company: nombre exacto de la empresa u organización.
   - role: cargo o rol profesional exacto.
   - location: ubicación si está indicada.
   - startDate: fecha o año inicio.
   - endDate: fecha fin o "Presente" / "Actualidad".
   - isCurrent: true si sigue trabajando allí.
   - bullets: lista de viñetas reales y textuales de logros/responsabilidades.
   - technologies: herramientas, plataformas o canales mencionados en ese rol.
   - category: categoría más adecuada para el rol o logro:
     * Para Ingeniería: Feature ✨, Fix 🐛, Refactor 🧹, Architecture 🏗️, Infra/DevOps 🚀, Spike/R&D 🔬
     * Para Marketing: Growth & Marketing 📈, SEO & Contenidos, Paid Media & Ads
     * Para Ventas/Negocio: Negocios & Ventas 💼, Cuentas Enterprise, Alianzas
     * Para Diseño/Producto: Diseño & Producto 🎨, UX/UI, Discovery
     * Para Gestión: Liderazgo & Gestión 👥, Operaciones & Procesos ⚙️
5. Educación: degree (título), institution (universidad/instituto), year (periodo), status ("Graduado", "En curso").
6. Certificaciones: name, issuer, year, credentialId.
7. Proyectos: name, role, description, technologies, url.
8. Idiomas: language, level.

Devuelve un JSON estrictamente válido que coincida con el schema.`;

    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      const cleanBase64 = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `${promptInstructions}\n\nDocumento adjunto: "${fileName || "CV"}". Extrae la estructura fidedigna sin inventar ningún dato.`,
      });
    } else {
      parts.push({
        text: `${promptInstructions}\n\n--- CONTENIDO DEL CV ORIGINAL ---\n${textContent}\n--- FIN DEL CV ---`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contact: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                headline: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                portfolio: { type: Type.STRING },
              },
            },
            summary: { type: Type.STRING },
            skills: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
                toolsCloud: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  isCurrent: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                  technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  category: {
                    type: Type.STRING,
                    description: "Categoría del logro (ej. Feature ✨, Growth & Marketing 📈, Negocios & Ventas 💼, Diseño & Producto 🎨, Architecture 🏗️, Infra/DevOps 🚀, Liderazgo & Gestión 👥, Operaciones & Procesos ⚙️)",
                  },
                },
                required: ["company", "role", "bullets"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ["degree"],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  year: { type: Type.STRING },
                  credentialId: { type: Type.STRING },
                },
                required: ["name"],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  url: { type: Type.STRING },
                },
                required: ["name"],
              },
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  language: { type: Type.STRING },
                  level: { type: Type.STRING },
                },
                required: ["language"],
              },
            },
          },
          required: ["contact", "experiences"],
        },
      },
    });

    const outputText = response.text?.trim() || "{}";
    const parsedData: ExtractedCvData = JSON.parse(outputText);

    // Sanitize and ensure array structures
    const cleanCvData: ExtractedCvData = {
      contact: {
        name: parsedData.contact?.name || "",
        headline: parsedData.contact?.headline || "",
        email: parsedData.contact?.email || "",
        phone: parsedData.contact?.phone || "",
        location: parsedData.contact?.location || "",
        linkedin: parsedData.contact?.linkedin || "",
        github: parsedData.contact?.github || "",
        portfolio: parsedData.contact?.portfolio || "",
      },
      summary: parsedData.summary || "",
      skills: {
        technical: parsedData.skills?.technical || [],
        frameworks: parsedData.skills?.frameworks || [],
        toolsCloud: parsedData.skills?.toolsCloud || [],
        softSkills: parsedData.skills?.softSkills || [],
      },
      experiences: (parsedData.experiences || []).map((exp, idx) => {
        let bullets = Array.isArray(exp.bullets)
          ? exp.bullets.filter((b) => b && b.trim().length > 6)
          : [];
        if (bullets.length === 0 && exp.description) {
          const splitSentences = exp.description
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 8);
          bullets = splitSentences.length > 0 ? splitSentences : [exp.description];
        }
        return {
          ...exp,
          id: exp.id || `exp-${Date.now()}-${idx}`,
          category: exp.category || "Feature ✨",
          bullets: bullets,
          description: exp.description || (bullets.length > 0 ? bullets.join(". ") : ""),
          technologies: exp.technologies || [],
        };
      }),
      education: (parsedData.education || []).map((edu, idx) => ({
        ...edu,
        id: edu.id || `edu-${Date.now()}-${idx}`,
      })),
      certifications: (parsedData.certifications || []).map((cert, idx) => ({
        ...cert,
        id: cert.id || `cert-${Date.now()}-${idx}`,
      })),
      projects: (parsedData.projects || []).map((proj, idx) => ({
        ...proj,
        id: proj.id || `proj-${Date.now()}-${idx}`,
        technologies: proj.technologies || [],
      })),
      languages: (parsedData.languages || []).map((lang, idx) => ({
        ...lang,
        id: lang.id || `lang-${Date.now()}-${idx}`,
      })),
      rawTextPreview: textContent ? textContent.substring(0, 300) : fileName,
    };

    const audit = calculateCvAudit(cleanCvData);
    const achievements = cvToAchievements(cleanCvData, fileName);

    return res.json({
      cvData: cleanCvData,
      achievements,
      candidate: {
        name: cleanCvData.contact.name,
        title: cleanCvData.contact.headline,
        email: cleanCvData.contact.email,
        topSkills: [
          ...cleanCvData.skills.technical.slice(0, 3),
          ...cleanCvData.skills.frameworks.slice(0, 2),
        ],
      },
      pendingFields: audit.pendingFields,
      completedCount: audit.completedCount,
      totalChecks: audit.totalChecks,
      completenessScore: audit.completenessScore,
      engine: "gemini-3.8-flash",
      fileName: fileName || "Documento",
    });
  } catch (err: any) {
    console.error("Error en extracción completa con Gemini:", err);

    // Fallback to strict local parser with the decoded textContent
    const fallbackText = textContent || req.body?.textContent || "";
    const effectiveFileName = fileName || req.body?.fileName || "cv.txt";
    const cvData = extractFullCvLocally(fallbackText, effectiveFileName);
    const audit = calculateCvAudit(cvData);
    const achievements = cvToAchievements(cvData, effectiveFileName);

    return res.json({
      cvData,
      achievements,
      pendingFields: audit.pendingFields,
      completedCount: audit.completedCount,
      totalChecks: audit.totalChecks,
      completenessScore: audit.completenessScore,
      engine: "local-strict-parser",
      warning: "Extracción procesada mediante motor de fidelidad local.",
      fileName: effectiveFileName,
    });
  }
});

// Backward-compatible alias for existing calls
app.post("/api/cv/extract-achievements", async (req, res) => {
  // Delegate directly to the full extractor
  req.url = "/api/cv/extract-full-cv";
  return app._router.handle(req, res, () => {});
});

// Explicit endpoint to download the test PDF CV
app.get("/api/cv/download-sample-pdf", (_req, res) => {
  const filePath = path.resolve(__dirname, "public", "demo-cv.pdf");
  res.download(filePath, "CV_Profesional_Demo.pdf", (err) => {
    if (err) {
      console.error("Error sending sample PDF:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "No se pudo descargar el archivo PDF de prueba." });
      }
    }
  });
});

// Cloud Sync Endpoints: Multi-Device Persistence & Cache-Wipe Protection
const CLOUD_SYNC_DIR = path.resolve(__dirname, "data", "cloud_sync");
if (!fs.existsSync(CLOUD_SYNC_DIR)) {
  fs.mkdirSync(CLOUD_SYNC_DIR, { recursive: true });
}

function getSyncFilePath(userKey: string): string {
  const safeKey = userKey.replace(/[^a-zA-Z0-9@._-]/g, "_");
  return path.resolve(CLOUD_SYNC_DIR, `user_${safeKey}.json`);
}

app.post("/api/cloud-sync/save", (req, res) => {
  try {
    const { userKey, payload } = req.body;
    if (!userKey || !payload) {
      return res.status(400).json({ error: "userKey and payload are required." });
    }
    const filePath = getSyncFilePath(userKey);
    const backupRecord = {
      userKey,
      updatedAt: Date.now(),
      payload,
    };
    fs.writeFileSync(filePath, JSON.stringify(backupRecord, null, 2), "utf-8");
    return res.json({ success: true, savedAt: backupRecord.updatedAt });
  } catch (err: any) {
    console.error("Error saving cloud sync backup:", err);
    return res.status(500).json({ error: "Failed to persist cloud backup." });
  }
});

app.get("/api/cloud-sync/load/:userKey", (req, res) => {
  try {
    const { userKey } = req.params;
    if (!userKey) {
      return res.status(400).json({ error: "userKey is required." });
    }
    const filePath = getSyncFilePath(userKey);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "No cloud backup found for this user key." });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return res.json({ success: true, backup: parsed });
  } catch (err: any) {
    console.error("Error loading cloud sync backup:", err);
    return res.status(500).json({ error: "Failed to load cloud backup." });
  }
});

// App Startup with Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Captain's Log Server listening on port ${PORT}`);
  });
}

startServer();
