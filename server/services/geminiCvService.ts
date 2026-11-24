import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedCvData } from "../../src/types";
import { calculateCvAudit, cvToAchievements } from "../../src/utils/localCvExtractor";

export const GEMINI_CV_MODEL = "gemini-4-hydrogen";

const PLACEHOLDER_KEYS = new Set([
  "MY_GEMINI_API_KEY",
  "YOUR_GEMINI_API_KEY",
  "YOUR_API_KEY",
  "GEMINI_API_KEY",
  "UNDEFINED",
  "NULL",
]);

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export function resolveConfiguredGeminiApiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY;
  if (typeof raw !== "string") return null;
  let cleaned = raw.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (!cleaned) return null;
  if (PLACEHOLDER_KEYS.has(cleaned.toUpperCase())) return null;
  return cleaned;
}

export function isGeminiApiKeyConfigured(): boolean {
  return resolveConfiguredGeminiApiKey() !== null;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = resolveConfiguredGeminiApiKey();
  if (!apiKey) return null;
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

export type GeminiErrorCode =
  | "GEMINI_API_KEY_MISSING"
  | "GEMINI_API_KEY_INVALID"
  | "GEMINI_PERMISSION_DENIED"
  | "GEMINI_QUOTA_EXCEEDED"
  | "GEMINI_MODEL_NOT_FOUND"
  | "GEMINI_UPSTREAM_ERROR";

export interface ClassifiedGeminiError {
  httpStatus: number;
  code: GeminiErrorCode;
  userMessage: string;
  logDetail: string;
}

export function classifyGeminiError(err: unknown): ClassifiedGeminiError {
  const rawMsg = err instanceof Error ? err.message : String(err || "Unknown Gemini error");
  const statusProp =
    err && typeof err === "object" && "status" in err
      ? Number((err as { status?: unknown }).status)
      : NaN;
  const upper = rawMsg.toUpperCase();

  if (
    rawMsg.includes("GEMINI_API_KEY is not configured") ||
    upper.includes("API_KEY_MISSING")
  ) {
    return {
      httpStatus: 503,
      code: "GEMINI_API_KEY_MISSING",
      userMessage:
        "El análisis inteligente no tiene una clave válida configurada. Revisa Settings > Secrets o usa el lector local.",
      logDetail: "GEMINI_API_KEY missing or placeholder",
    };
  }

  if (
    statusProp === 401 ||
    upper.includes("UNAUTHENTICATED") ||
    upper.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
    upper.includes("API_KEY_INVALID") ||
    upper.includes("API KEY NOT VALID")
  ) {
    return {
      httpStatus: 401,
      code: "GEMINI_API_KEY_INVALID",
      userMessage:
        "La clave configurada para el análisis inteligente no es válida. Verifícala en Settings > Secrets o usa el lector local.",
      logDetail: rawMsg.slice(0, 240),
    };
  }

  if (statusProp === 403 || upper.includes("PERMISSION_DENIED")) {
    return {
      httpStatus: 403,
      code: "GEMINI_PERMISSION_DENIED",
      userMessage:
        "La clave configurada en Settings > Secrets no tiene permisos para ejecutar el análisis inteligente.",
      logDetail: rawMsg.slice(0, 240),
    };
  }

  if (statusProp === 429 || upper.includes("RESOURCE_EXHAUSTED")) {
    return {
      httpStatus: 429,
      code: "GEMINI_QUOTA_EXCEEDED",
      userMessage:
        "Se alcanzó el límite temporal del análisis inteligente. Intenta más tarde, revisa Settings > Secrets o usa el lector local.",
      logDetail: rawMsg.slice(0, 240),
    };
  }

  if (statusProp === 404 || upper.includes("NOT_FOUND")) {
    return {
      httpStatus: 404,
      code: "GEMINI_MODEL_NOT_FOUND",
      userMessage:
        "El servicio de análisis inteligente no está disponible en este momento. Puedes usar el lector local.",
      logDetail: rawMsg.slice(0, 240),
    };
  }

  return {
    httpStatus: 502,
    code: "GEMINI_UPSTREAM_ERROR",
    userMessage:
      "Error temporal en el servicio de análisis inteligente. Puedes reintentar o usar el lector local.",
    logDetail: rawMsg.slice(0, 240),
  };
}

function isRetryableGeminiError(err: unknown): boolean {
  const rawMsg = err instanceof Error ? err.message : String(err || "");
  const statusProp =
    err && typeof err === "object" && "status" in err
      ? Number((err as { status?: unknown }).status)
      : NaN;

  if ([400, 401, 403, 404].includes(statusProp)) return false;
  const upper = rawMsg.toUpperCase();
  if (
    upper.includes("UNAUTHENTICATED") ||
    upper.includes("API_KEY_INVALID") ||
    upper.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
    upper.includes("API KEY NOT VALID") ||
    upper.includes("PERMISSION_DENIED") ||
    upper.includes("NOT_FOUND")
  ) {
    return false;
  }

  return (
    statusProp === 429 ||
    statusProp === 500 ||
    statusProp === 502 ||
    statusProp === 503 ||
    statusProp === 504 ||
    upper.includes("UNAVAILABLE") ||
    upper.includes("INTERNAL") ||
    upper.includes("ECONNRESET") ||
    upper.includes("ETIMEDOUT")
  );
}

const PROMPT_INSTRUCTIONS = `Eres un **Auditor y Extractor Profesional y Técnico de CVs de Máxima Fidelidad (Strict Truthfulness Engine)** capacitado para perfiles multidisciplinarios (Ingeniería de Software, Product Management, Growth & Marketing, Diseño UX/UI, Ventas B2B, Operaciones y Liderazgo).

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
3. Habilidades: technical, frameworks, toolsCloud, softSkills.
4. Experiencias: company, role, location, startDate, endDate, isCurrent, bullets, technologies, category.
5. Educación: degree, institution, year, status.
6. Certificaciones: name, issuer, year, credentialId.
7. Proyectos: name, role, description, technologies, url.
8. Idiomas: language, level.

Devuelve un JSON estrictamente válido que coincida con el schema.`;

const CV_RESPONSE_SCHEMA = {
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
          category: { type: Type.STRING },
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
};

function sanitizeGeminiCv(
  parsedData: Partial<ExtractedCvData>,
  textContent: string,
  fileName: string
): ExtractedCvData {
  return {
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
        bullets,
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
}

export async function extractFullCvWithGemini(params: {
  textContent: string;
  fileBase64?: string;
  mimeType?: string;
  fileName: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  if (params.fileBase64 && params.mimeType) {
    const cleanBase64 = params.fileBase64.includes(",")
      ? params.fileBase64.split(",")[1]
      : params.fileBase64;
    parts.push({ inlineData: { mimeType: params.mimeType, data: cleanBase64 } });
    parts.push({
      text: `Documento adjunto: "${params.fileName || "CV"}". Extrae la estructura JSON fidedigna y concisa sin inventar ningún dato.`,
    });
  } else {
    parts.push({
      text: `--- CONTENIDO DEL CV ORIGINAL ---\n${params.textContent}\n--- FIN DEL CV ---`,
    });
  }

  let response;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: GEMINI_CV_MODEL,
        contents: { parts },
        config: {
          systemInstruction: PROMPT_INSTRUCTIONS,
          responseMimeType: "application/json",
          responseSchema: CV_RESPONSE_SCHEMA,
        },
      });
      break;
    } catch (err) {
      if (attempt < maxAttempts && isRetryableGeminiError(err)) {
        await new Promise((resolve) => setTimeout(resolve, 400 * Math.pow(2, attempt - 1)));
        continue;
      }
      throw err;
    }
  }

  const parsedData = JSON.parse(response?.text?.trim() || "{}") as Partial<ExtractedCvData>;
  const cleanCvData = sanitizeGeminiCv(parsedData, params.textContent, params.fileName);
  const audit = calculateCvAudit(cleanCvData);
  const achievements = cvToAchievements(cleanCvData, params.fileName);

  return {
    cvData: cleanCvData,
    achievements,
    audit,
  };
}
