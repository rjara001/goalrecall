import { ExtractedCvData, CvExperience, CvEducation, CvCertification, CvProject, CvLanguage, CvPendingField, LogCategory } from "../types";

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

export interface LocalExtractionResult {
  cvData: ExtractedCvData;
  achievements: ExtractedAchievementItem[];
  pendingFields: CvPendingField[];
  completedCount: number;
  totalChecks: number;
  completenessScore: number;
  engine: string;
  fileName: string;
}

export function extractCvDataLocally(rawText: string, fileName?: string): LocalExtractionResult {
  const safeFileName = fileName || "Documento";

  if (!rawText || rawText.trim().length === 0) {
    const emptyCv: ExtractedCvData = {
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
    const emptyAudit = calculateCvAudit(emptyCv);
    return {
      cvData: emptyCv,
      achievements: [],
      pendingFields: emptyAudit.pendingFields,
      completedCount: emptyAudit.completedCount,
      totalChecks: emptyAudit.totalChecks,
      completenessScore: emptyAudit.completenessScore,
      engine: "local-strict-parser",
      fileName: safeFileName,
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
  let name = "";
  let headline = "";

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const l = lines[i];
    const isHeaderOrSection = /^(?:experiencia|historial|resumen|perfil|summary|skills|habilidades|educaci[oó]n|certificac|curriculum|cv|resume|hoja de vida)/i.test(l);
    const isContactLine = l.includes("@") || l.includes("http") || l.includes("github.com") || l.includes("linkedin.com") || /^\+?\d[\d\s-]{6,}/.test(l);

    if (!name && !isHeaderOrSection && !isContactLine && l.length > 2 && l.length < 50) {
      name = l;
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
      if (currentExp.bullets.length > 0 && !currentExp.description) {
        currentExp.description = currentExp.bullets.join(". ");
      }
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

      currentExp.bullets = Array.from(
        new Set(currentExp.bullets.map((b) => b.trim()))
      ).filter((b) => b.length > 8);

      if (currentExp.technologies.length === 0) {
        const textToScan = `${currentExp.role} ${currentExp.company} ${currentExp.bullets.join(" ")} ${currentExp.description || ""}`;
        const commonTech = [
          "TypeScript", "JavaScript", "Python", "Go", "Java", "C#", ".NET", ".NET 10", ".NET 9", ".NET Core",
          "React", "Next.js", "Angular", "Angular 21", "Vue", "NestJS", "Node.js", "Express", "GraphQL", "REST APIs",
          "PostgreSQL", "SQL Server", "MongoDB", "Redis", "Databricks", "Kafka", "SQL",
          "AWS", "Azure", "GCP", "Docker", "Kubernetes", "AKS", "CI/CD", "Azure DevOps", "GitLab", "Jenkins",
          "Tailwind CSS", "Bootstrap 5", "Microservices", "Microfrontends", "Copilot", "LLMs", "AI",
          "Google Ads", "Meta Ads", "SEO", "SEM", "HubSpot", "Google Analytics", "GA4", "Mixpanel", "Salesforce",
          "Figma", "Notion", "Jira", "Miro", "UX/UI"
        ];
        commonTech.forEach((tech) => {
          const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          if (regex.test(textToScan) && !currentExp!.technologies.includes(tech)) {
            currentExp!.technologies.push(tech);
            if (!technicalSkills.includes(tech)) technicalSkills.push(tech);
          }
        });
      }

      const fullExpText = `${currentExp.role} ${currentExp.company} ${currentExp.bullets.join(" ")} ${currentExp.technologies.join(" ")}`.toLowerCase();
      if (/growth|marketing|campaña|cac|ltv|leads|conversion|conversi[oó]n|roas|seo|sem/i.test(fullExpText)) {
        currentExp.category = "Growth & Marketing 📈" as LogCategory;
      } else if (/ventas|sales|arr|mrr|deals|pipeline|cuentas enterprise|b2b/i.test(fullExpText)) {
        currentExp.category = "Negocios & Ventas 💼" as LogCategory;
      } else if (/diseño|design|ux|ui|figma|prototip|onboarding/i.test(fullExpText)) {
        currentExp.category = "Diseño & Producto 🎨" as LogCategory;
      } else if (/liderazgo|management|team lead|contrataci[oó]n|mentoring|cultura|scrum/i.test(fullExpText)) {
        currentExp.category = "Liderazgo & Gestión 👥" as LogCategory;
      } else if (/operacion|operaciones|procesos|log[ií]stica|compliance/i.test(fullExpText)) {
        currentExp.category = "Operaciones & Procesos ⚙️" as LogCategory;
      } else if (/arquitect|architec|migra|monolit|distribuid|cloud|kafka|microserv|federation|microfrontend/i.test(fullExpText)) {
        currentExp.category = "Architecture 🏗️" as LogCategory;
      } else if (/ci\/cd|pipeline|docker|kubernetes|k8s|devops|terraform|aks|aws|azure|gcp/i.test(fullExpText)) {
        currentExp.category = "Infra/DevOps 🚀" as LogCategory;
      } else if (/refactor|optimiz|rendimient|latenc|p99|speed|performance/i.test(fullExpText)) {
        currentExp.category = "Refactor 🧹" as LogCategory;
      } else if (/bug|fix|error|vulnerab|security|seguridad/i.test(fullExpText)) {
        currentExp.category = "Fix 🐛" as LogCategory;
      } else if (/spike|poc|r&d|evalu|investig|prototip/i.test(fullExpText)) {
        currentExp.category = "Spike/R&D 🔬" as LogCategory;
      } else {
        currentExp.category = "Feature ✨" as LogCategory;
      }

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

      if (lines[i + 1] && lines[i + 1].startsWith("@")) {
        pushCurrentExp();
        continue;
      }

      if (line.startsWith("@")) {
        pushCurrentExp();
        currentSection = "experience";
        const company = line.replace(/^@\s*/, "").trim();
        const prevLine = lines[i - 1];
        let role = prevLine && !prevLine.startsWith("@") && !prevLine.startsWith("•") && !/^(?:Experiencia|Historial|Experience|Work)/i.test(prevLine) ? prevLine : (headline || "Ingeniero");
        let dateRange = "";

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
          category: "Feature ✨" as LogCategory,
        };
        continue;
      }

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
          category: "Feature ✨" as LogCategory,
        };
        continue;
      }

      if (/\b\d+\s+of\s+\d+\b/i.test(line) || /of\s+\d+\s*--/i.test(line) || /^page\s+\d+/i.test(line) || /^--\s*\d+/i.test(line) || /--$/.test(line.trim())) {
        continue;
      }

      const cleanLine = line.replace(/^[•●○▪■◆\-*–—›\d\.\)\>\s]+/g, "").trim();

      if (!cleanLine || /^\d+\s*(?:of|\/)\s*\d+/i.test(cleanLine) || /^page\s+\d+/i.test(cleanLine)) {
        continue;
      }

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

      if (currentExp) {
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

  if (!headline && experiences.length > 0 && experiences[0].role) {
    headline = experiences[0].role;
  }

  const cvData: ExtractedCvData = {
    contact: {
      name: name || "Profesional Senior",
      headline: headline || "Ingeniero de Software / Full Stack Developer",
      email: email,
      phone: phone,
      location: location,
      linkedin: linkedin,
      github: github,
      portfolio: portfolio,
    },
    summary: summary,
    skills: {
      technical: technicalSkills,
      frameworks: frameworks,
      toolsCloud: toolsCloud,
      softSkills: softSkills,
    },
    experiences: experiences,
    education: education,
    certifications: certifications,
    projects: projects,
    languages: languages,
    rawTextPreview: rawText.substring(0, 400),
  };

  const audit = calculateCvAudit(cvData);
  const achievements = cvToAchievements(cvData, safeFileName);

  return {
    cvData,
    achievements,
    pendingFields: audit.pendingFields,
    completedCount: audit.completedCount,
    totalChecks: audit.totalChecks,
    completenessScore: audit.completenessScore,
    engine: "local-strict-parser",
    fileName: safeFileName,
  };
}

export function calculateCvAudit(cv: ExtractedCvData) {
  const pendingFields: CvPendingField[] = [];
  let checksPassed = 0;
  const totalChecks = 13;

  if (cv.contact.name && cv.contact.name.length > 2) checksPassed++;
  else pendingFields.push({
    id: "pending-name", section: "contact", fieldName: "name", label: "Nombre Completo",
    description: "No se identificó el nombre de la persona en el encabezado.", severity: "high", suggestedPrompt: "Ej: Juan Pérez"
  });

  if (cv.contact.headline && cv.contact.headline.length > 2) checksPassed++;
  else pendingFields.push({
    id: "pending-headline", section: "contact", fieldName: "headline", label: "Titular Profesional / Cargo",
    description: "Falta el rol o especialidad principal (ej. Senior Frontend Engineer).", severity: "high", suggestedPrompt: "Ej: Senior Full Stack Developer"
  });

  if (cv.contact.email && cv.contact.email.includes("@")) checksPassed++;
  else pendingFields.push({
    id: "pending-email", section: "contact", fieldName: "email", label: "Correo Electrónico de Contacto",
    description: "No se detectó un correo electrónico válido.", severity: "high", suggestedPrompt: "Ej: profesional@correo.com"
  });

  if (cv.contact.phone && cv.contact.phone.length > 6) checksPassed++;
  else pendingFields.push({
    id: "pending-phone", section: "contact", fieldName: "phone", label: "Teléfono / WhatsApp",
    description: "No se encontró un número telefónico de contacto.", severity: "medium", suggestedPrompt: "Ej: +56 9 1234 5678"
  });

  if (cv.contact.location && cv.contact.location.length > 2) checksPassed++;
  else pendingFields.push({
    id: "pending-location", section: "contact", fieldName: "location", label: "Ubicación Geográfica",
    description: "No se detectó la ciudad o país de residencia.", severity: "medium", suggestedPrompt: "Ej: Santiago, Chile (Disponible para Remoto)"
  });

  if (cv.contact.linkedin && cv.contact.linkedin.length > 5) checksPassed++;
  else pendingFields.push({
    id: "pending-linkedin", section: "contact", fieldName: "linkedin", label: "Perfil de LinkedIn",
    description: "No se detectó el enlace al perfil de LinkedIn.", severity: "medium", suggestedPrompt: "Ej: linkedin.com/in/tu-perfil"
  });

  if (cv.contact.github && cv.contact.github.length > 5) checksPassed++;
  else pendingFields.push({
    id: "pending-github", section: "contact", fieldName: "github", label: "Repositorio GitHub / GitLab",
    description: "No se detectó un perfil de código abierto.", severity: "low", suggestedPrompt: "Ej: github.com/tu-usuario"
  });

  if (cv.summary && cv.summary.length > 20) checksPassed++;
  else pendingFields.push({
    id: "pending-summary", section: "summary", fieldName: "summary", label: "Resumen / Extracto Profesional",
    description: "El CV no contiene un párrafo de resumen o perfil profesional.", severity: "medium", suggestedPrompt: "Escribe 2-3 líneas resumiendo tus años de experiencia y especialidad."
  });

  if (cv.skills && (cv.skills.technical.length > 0 || cv.skills.frameworks.length > 0)) checksPassed++;
  else pendingFields.push({
    id: "pending-skills", section: "skills", fieldName: "skills", label: "Habilidades Técnicas & Stack",
    description: "No se identificó una sección explícita de tecnologías o habilidades.", severity: "high", suggestedPrompt: "Ej: TypeScript, React, Node.js, PostgreSQL"
  });

  if (cv.experiences && cv.experiences.length > 0) checksPassed++;
  else pendingFields.push({
    id: "pending-experiences", section: "experiences", fieldName: "experiences", label: "Historial de Experiencia Laboral",
    description: "No se reconocieron puestos de trabajo o empresas previas.", severity: "high", suggestedPrompt: "Agrega al menos una experiencia laboral relevante."
  });

  if (cv.education && cv.education.length > 0) checksPassed++;
  else pendingFields.push({
    id: "pending-education", section: "education", fieldName: "education", label: "Formación Académica / Universidad",
    description: "No se identificaron títulos de grado, diplomados o estudios superiores.", severity: "medium", suggestedPrompt: "Ej: Licenciatura o Ingeniería en Computación / Software"
  });

  if (cv.certifications && cv.certifications.length > 0) checksPassed++;
  else pendingFields.push({
    id: "pending-certifications", section: "certifications", fieldName: "certifications", label: "Certificaciones Técnicas",
    description: "No se detectaron certificaciones de industria (AWS, GCP, Scrum, etc.).", severity: "low", suggestedPrompt: "Ej: AWS Certified Developer, Certified Kubernetes Administrator"
  });

  if (cv.languages && cv.languages.length > 0) checksPassed++;
  else pendingFields.push({
    id: "pending-languages", section: "languages", fieldName: "languages", label: "Idiomas & Nivel de Dominio",
    description: "No se especificaron idiomas (ej: Español Nativo, Inglés C1).", severity: "low", suggestedPrompt: "Ej: Español (Nativo), Inglés (Avanzado C1 / Profesional)"
  });

  const completenessScore = Math.round((checksPassed / totalChecks) * 100);

  return {
    pendingFields,
    completedCount: checksPassed,
    totalChecks,
    completenessScore,
  };
}

export function cvToAchievements(cv: ExtractedCvData, fileName?: string): ExtractedAchievementItem[] {
  const achievements: ExtractedAchievementItem[] = [];

  if (Array.isArray(cv.experiences)) {
    cv.experiences.forEach((exp, expIdx) => {
      const company = exp.company?.trim() || "Empresa";
      const project = exp.role?.trim() || "Ingeniería";

      if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
        exp.bullets.forEach((bullet, bIdx) => {
          if (!bullet || bullet.trim().length < 8) return;
          const cleanBullet = bullet.trim();

          const metricMatch = cleanBullet.match(
            /(\d+[\%|\$|k|M|B|ms|s|x|min|hr|req|GB|TB|rps]+|[0-9]+[.,][0-9]+\%|redujo|aumentó|disminuyó|mejoró|saving|saved|reduced|increased)[^\,\.\;]*/i
          );

          let metricHighlight: string | undefined = undefined;
          if (metricMatch) {
            metricHighlight = metricMatch[0].trim().substring(0, 24);
          }

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

          let bulletCategory: string = exp.category || "Feature ✨";
          const lowerBullet = cleanBullet.toLowerCase();
          if (/growth|marketing|campaña|cac|ltv|leads|conversion|conversi[oó]n|roas|seo|sem/i.test(lowerBullet)) {
            bulletCategory = "Growth & Marketing 📈";
          } else if (/ventas|sales|arr|mrr|deals|pipeline|cuentas enterprise|b2b/i.test(lowerBullet)) {
            bulletCategory = "Negocios & Ventas 💼";
          } else if (/diseño|design|ux|ui|figma|prototip|onboarding/i.test(lowerBullet)) {
            bulletCategory = "Diseño & Producto 🎨";
          } else if (/liderazgo|management|team lead|contrataci[oó]n|mentoring|cultura|scrum/i.test(lowerBullet)) {
            bulletCategory = "Liderazgo & Gestión 👥";
          } else if (/operacion|operaciones|procesos|log[ií]stica|compliance/i.test(lowerBullet)) {
            bulletCategory = "Operaciones & Procesos ⚙️";
          } else if (/arquitect|architec|migra|monolit|distribuid|cloud|kafka|microserv|federation|microfrontend/i.test(lowerBullet)) {
            bulletCategory = "Architecture 🏗️";
          } else if (/ci\/cd|pipeline|docker|kubernetes|k8s|devops|terraform|aks|aws|azure|gcp/i.test(lowerBullet)) {
            bulletCategory = "Infra/DevOps 🚀";
          } else if (/refactor|optimiz|rendimient|latenc|p99|speed|performance/i.test(lowerBullet)) {
            bulletCategory = "Refactor 🧹";
          } else if (/bug|fix|error|vulnerab|security|seguridad/i.test(lowerBullet)) {
            bulletCategory = "Fix 🐛";
          } else if (/spike|poc|r&d|evalu|investig|prototip/i.test(lowerBullet)) {
            bulletCategory = "Spike/R&D 🔬";
          }

          achievements.push({
            id: `ach-${Date.now()}-${expIdx}-${bIdx}`,
            client: company,
            project: project,
            title: cleanBullet,
            description: `Documento fuente: ${fileName || "CV"}. Rol: ${exp.role || "Profesional"}.`,
            impact: cleanBullet,
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
          title: exp.description,
          description: `Documento: ${fileName || "CV"}. Rol: ${exp.role || "Profesional"}.`,
          impact: exp.description,
          category: exp.category || "Feature ✨",
          tags: exp.technologies?.map((t) => `#${t.replace(/[\s\.]/g, "")}`) || ["#Trayectoria"],
          xyzScore: 80,
        });
      }
    });
  }

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
