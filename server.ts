import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
  category: "Feature ✨" | "Fix 🐛" | "Refactor 🧹" | "Architecture 🏗️" | "Infra/DevOps 🚀" | "Spike/R&D 🔬";
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
  category: "Feature ✨" | "Fix 🐛" | "Refactor 🧹" | "Architecture 🏗️" | "Infra/DevOps 🚀" | "Spike/R&D 🔬";
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
      suggestedPrompt: "Ej: Rodrigo Jara",
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
            tags.push("#Ingeniería", "#Producción");
          }

          achievements.push({
            id: `ach-${Date.now()}-${expIdx}-${bIdx}`,
            client: company,
            project: project,
            title: cleanBullet.length > 120 ? cleanBullet.substring(0, 117) + "..." : cleanBullet,
            description: `Documento fuente: ${fileName || "CV"}. Rol: ${exp.role || "Ingeniero"}.`,
            impact: cleanBullet, // Strictly truthful: text from the document!
            category: exp.category || "Feature ✨",
            tags: tags,
            xyzScore: metricMatch ? 90 : 80,
            metricHighlight: metricHighlight,
          });
        });
      } else if (exp.description && exp.description.trim().length > 15) {
        achievements.push({
          id: `ach-${Date.now()}-${expIdx}-0`,
          client: company,
          project: project,
          title: exp.description.substring(0, 120),
          description: `Documento: ${fileName || "CV"}. Rol: ${exp.role || "Ingeniero"}.`,
          impact: exp.description,
          category: exp.category || "Feature ✨",
          tags: exp.technologies?.map((t) => `#${t.replace(/[\s\.]/g, "")}`) || ["#Ingeniería"],
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

// Local strict parser for offline/fallback scenarios (NEVER invents data)
function extractFullCvLocally(rawText: string, fileName: string): ExtractedCvData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Email regex
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone regex
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // LinkedIn regex
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // GitHub regex
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const github = githubMatch ? githubMatch[0] : "";

  // Location detection
  const locationMatch = rawText.match(
    /([A-ZÁÉÍÓÚ][a-záéíóú]+(?:[\s,]+[A-ZÁÉÍÓÚ][a-záéíóú]+)*)\s*[,|\/]\s*([A-ZÁÉÍÓÚ][a-záéíóú]+|\bChile\b|\bMéxico\b|\bArgentina\b|\bEspaña\b|\bColombia\b|\bPerú\b|\bUSA\b|\bRemoto\b|\bRemote\b)/i
  );
  const location = locationMatch ? locationMatch[0] : "";

  // Name: first short non-header line that has 2-4 capitalized words
  let name = "";
  let headline = "";
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const l = lines[i];
    if (
      !name &&
      l.length > 3 &&
      l.length < 50 &&
      !l.includes("@") &&
      !l.includes("http") &&
      !/curriculum|cv|resume|hoja de vida/i.test(l)
    ) {
      name = l;
      // The next line might be the headline
      if (lines[i + 1] && lines[i + 1].length < 80 && !lines[i + 1].includes("@")) {
        headline = lines[i + 1];
      }
      break;
    }
  }

  // Parse sections
  const experiences: CvExperience[] = [];
  const education: CvEducation[] = [];
  const certifications: CvCertification[] = [];
  const projects: CvProject[] = [];
  const languages: CvLanguage[] = [];
  const technicalSkills: string[] = [];
  let summary = "";

  let currentSection = "header";
  let currentExp: CvExperience | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Section detection
    if (/^(EXPERIENCIA|EXPERIENCE|HISTORIAL LABORAL|TRAYECTORIA)/i.test(upper)) {
      currentSection = "experience";
      continue;
    } else if (/^(EDUCACI[OÓ]N|EDUCATION|FORMACI[OÓ]N ACAD[EÉ]MICA)/i.test(upper)) {
      if (currentExp) experiences.push(currentExp);
      currentExp = null;
      currentSection = "education";
      continue;
    } else if (/^(HABILIDADES|SKILLS|COMPETENCIAS|TECNOLOG[IÍ]AS)/i.test(upper)) {
      if (currentExp) experiences.push(currentExp);
      currentExp = null;
      currentSection = "skills";
      continue;
    } else if (/^(CERTIFICACI[OÓ]N|CERTIFICACIONES|CERTIFICATES)/i.test(upper)) {
      if (currentExp) experiences.push(currentExp);
      currentExp = null;
      currentSection = "certifications";
      continue;
    } else if (/^(PROYECTOS|PROJECTS)/i.test(upper)) {
      if (currentExp) experiences.push(currentExp);
      currentExp = null;
      currentSection = "projects";
      continue;
    } else if (/^(IDIOMAS|LANGUAGES)/i.test(upper)) {
      if (currentExp) experiences.push(currentExp);
      currentExp = null;
      currentSection = "languages";
      continue;
    } else if (/^(RESUMEN|PERFIL|SOBRE M[IÍ]|SUMMARY|ABOUT)/i.test(upper)) {
      currentSection = "summary";
      continue;
    }

    if (currentSection === "summary") {
      if (line.length > 20 && !summary) {
        summary = line;
      } else if (summary && summary.length < 300) {
        summary += " " + line;
      }
    } else if (currentSection === "experience") {
      // Is it a job header? (contains company or date)
      const hasDate = /20\d\d|19\d\d|presente|present|actualidad/i.test(line);
      const isBullet = /^[•\-*–—\d\.]+|[A-Z][a-z]+ed|[L|D|I|M|O|R|C|A][a-z]+ó/.test(line);

      if (hasDate && !isBullet && line.length < 90) {
        if (currentExp) experiences.push(currentExp);
        const parts = line.split(/[-–|·•]/).map((p) => p.trim());
        currentExp = {
          id: `exp-${Date.now()}-${experiences.length}`,
          company: parts[0] || "Empresa",
          role: parts[1] || headline || "Ingeniero",
          startDate: parts[2] || "",
          bullets: [],
          technologies: [],
          category: "Feature ✨",
        };
      } else if (isBullet && currentExp) {
        const cleanBullet = line.replace(/^[•\-*–—\d\.\)\s]+/, "").trim();
        if (cleanBullet.length > 15) {
          currentExp.bullets.push(cleanBullet);
        }
      }
    } else if (currentSection === "skills") {
      const tokens = line.split(/[,|•·;]/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 28);
      tokens.forEach((tok) => {
        if (!technicalSkills.includes(tok)) technicalSkills.push(tok);
      });
    } else if (currentSection === "education") {
      if (line.length > 8 && line.length < 100) {
        education.push({
          id: `edu-${Date.now()}-${education.length}`,
          degree: line,
          institution: "",
        });
      }
    } else if (currentSection === "certifications") {
      if (line.length > 8 && line.length < 100) {
        certifications.push({
          id: `cert-${Date.now()}-${certifications.length}`,
          name: line,
          issuer: "",
        });
      }
    } else if (currentSection === "languages") {
      if (line.length > 3 && line.length < 60) {
        const parts = line.split(/[:\-\(]/).map((p) => p.trim());
        languages.push({
          id: `lang-${Date.now()}-${languages.length}`,
          language: parts[0] || line,
          level: parts[1]?.replace(/[\)]/g, "").trim() || "Competencia profesional",
        });
      }
    }
  }

  if (currentExp) experiences.push(currentExp);

  return {
    contact: {
      name: name || "",
      headline: headline || "",
      email: email || "",
      phone: phone || "",
      location: location || "",
      linkedin: linkedin || "",
      github: github || "",
      portfolio: "",
    },
    summary: summary || "",
    skills: {
      technical: technicalSkills.slice(0, 8),
      frameworks: [],
      toolsCloud: [],
      softSkills: [],
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
  try {
    let { textContent, fileBase64, mimeType, fileName } = req.body;

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

    // 2. Strict Text Length Restriction (15,000 chars max)
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

    // Strict prompt to Gemini 3.8 Flash: 100% truthful, zero hallucinations
    const promptInstructions = `Eres un **Auditor y Extractor Técnico de CVs de Máxima Fidelidad (Strict Truthfulness Engine)**.

DIRECTIVA SUPREMA: FIDELIDAD ESTRICTA Y VERACIDAD ABSOLUTA (CERO INVENCIÓN):
1. Lee minuciosamente el documento de CV adjunto (o texto proporcionado).
2. Extrae ÚNICAMENTE información real, verídica y explícitamente presente en el documento.
3. ESTRICTAMENTE PROHIBIDO INVENTAR:
   - NO inventes nombres de empresas, instituciones o clientes que no aparezcan.
   - NO inventes cargos o puestos.
   - NO inventes números, métricas cuantitativas, porcentajes o cantidades (ej. NO inventes 'redujo latencia 88%', 'ahorro $320,000 USD' si el texto no lo dice explícitamente).
   - NO inventes fechas o años.
   - Si una viñeta del documento no tiene una métrica numérica, transcríbela con fidelidad tal como la redactó el candidato, sin números ficticios.
4. MANEJO DE CAMPOS FALTANTES / PENDIENTES:
   - Si un campo típico de un CV no está presente en el documento (ejemplo: no hay teléfono, no hay enlace a LinkedIn, no hay enlace a GitHub, no hay sección de certificaciones, o falta la fecha de finalización de un rol), deja el campo como null o cadena vacía "".
   - NO intentes rellenar con datos genéricos o de ejemplo. El sistema etiquetará los campos vacíos como 'Pendiente de rellenar' para que el usuario los complete de forma guiada.

ESTRUCTURA COMPLETA A EXTRAER:
1. Contacto: name, headline, email, phone, location, linkedin, github, portfolio.
2. Resumen: summary (perfil / sobre mí, tal como está).
3. Habilidades:
   - technical: lenguajes y bases de datos reales mencionados.
   - frameworks: librerías y frameworks reales.
   - toolsCloud: cloud, devops, herramientas reales.
   - softSkills: habilidades de liderazgo o comunicación explícitas.
4. Experiencias: lista de experiencias laborales con:
   - company: nombre exacto de la empresa.
   - role: cargo exacto.
   - location: ubicación si está indicada.
   - startDate: fecha o año inicio.
   - endDate: fecha fin o "Presente" / "Actualidad".
   - isCurrent: true si sigue trabajando allí.
   - bullets: lista de viñetas reales y textuales de logros/responsabilidades.
   - technologies: tecnologías mencionadas en ese rol.
   - category: una de "Feature ✨", "Fix 🐛", "Refactor 🧹", "Architecture 🏗️", "Infra/DevOps 🚀", "Spike/R&D 🔬".
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
                    description: "Feature ✨, Fix 🐛, Refactor 🧹, Architecture 🏗️, Infra/DevOps 🚀, Spike/R&D 🔬",
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
      experiences: (parsedData.experiences || []).map((exp, idx) => ({
        ...exp,
        id: exp.id || `exp-${Date.now()}-${idx}`,
        category: exp.category || "Feature ✨",
        bullets: exp.bullets || [],
        technologies: exp.technologies || [],
      })),
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

    // Fallback to strict local parser so user is never stranded
    const fallbackText = req.body?.textContent || "";
    const fileName = req.body?.fileName || "cv.txt";
    const cvData = extractFullCvLocally(fallbackText, fileName);
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
      warning: "Extracción procesada mediante motor de fidelidad local.",
      fileName,
    });
  }
});

// Backward-compatible alias for existing calls
app.post("/api/cv/extract-achievements", async (req, res) => {
  // Delegate directly to the full extractor
  req.url = "/api/cv/extract-full-cv";
  return app._router.handle(req, res, () => {});
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
