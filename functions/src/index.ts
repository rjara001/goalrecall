import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp();
}

interface CvContact {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface CvExperience {
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

interface CvEducation {
  id: string;
  degree: string;
  institution: string;
  year?: string;
  status?: string;
}

interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
  credentialId?: string;
}

interface CvProject {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface CvLanguage {
  id: string;
  language: string;
  level: string;
}

interface ExtractedCvData {
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

interface CvPendingField {
  id: string;
  section: "contact" | "summary" | "skills" | "experiences" | "education" | "certifications" | "projects" | "languages";
  fieldName: string;
  label: string;
  description: string;
  severity: "high" | "medium" | "low";
  suggestedPrompt: string;
}

interface ExtractedAchievementItem {
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

function calculateCvAudit(cv: ExtractedCvData): {
  pendingFields: CvPendingField[];
  completedCount: number;
  totalChecks: number;
  completenessScore: number;
} {
  const pendingFields: CvPendingField[] = [];
  let checksPassed = 0;
  const totalChecks = 13;

  if (cv.contact?.name && cv.contact.name.trim().length > 1) checksPassed++;
  else pendingFields.push({ id: "pending-name", section: "contact", fieldName: "name", label: "Nombre Completo", description: "No se identificó el nombre en el documento.", severity: "high", suggestedPrompt: "Ej: Rodrigo Jara" });

  if (cv.contact?.headline && cv.contact.headline.trim().length > 2) checksPassed++;
  else pendingFields.push({ id: "pending-headline", section: "contact", fieldName: "headline", label: "Titular Profesional / Cargo Principal", description: "No se identificó el titular profesional.", severity: "high", suggestedPrompt: "Ej: Senior Full Stack Developer" });

  if (cv.contact?.email && cv.contact.email.includes("@")) checksPassed++;
  else pendingFields.push({ id: "pending-email", section: "contact", fieldName: "email", label: "Correo Electrónico de Contacto", description: "No se encontró correo electrónico.", severity: "high", suggestedPrompt: "Ej: usuario@gmail.com" });

  if (cv.contact?.phone && cv.contact.phone.trim().length >= 6) checksPassed++;
  else pendingFields.push({ id: "pending-phone", section: "contact", fieldName: "phone", label: "Teléfono / WhatsApp", description: "No se detectó número telefónico.", severity: "medium", suggestedPrompt: "Ej: +56 9 1234 5678" });

  if (cv.contact?.location && cv.contact.location.trim().length > 2) checksPassed++;
  else pendingFields.push({ id: "pending-location", section: "contact", fieldName: "location", label: "Ubicación & Modalidad", description: "Falta ciudad o modalidad de trabajo.", severity: "medium", suggestedPrompt: "Ej: Santiago, Chile / Remoto" });

  if (cv.contact?.linkedin && cv.contact.linkedin.trim().length > 5) checksPassed++;
  else pendingFields.push({ id: "pending-linkedin", section: "contact", fieldName: "linkedin", label: "Enlace a LinkedIn", description: "No se encontró perfil de LinkedIn.", severity: "medium", suggestedPrompt: "Ej: linkedin.com/in/tu-usuario" });

  if (cv.contact?.github && cv.contact.github.trim().length > 4) checksPassed++;
  else pendingFields.push({ id: "pending-github", section: "contact", fieldName: "github", label: "Repositorio GitHub", description: "No se detectó enlace a GitHub.", severity: "low", suggestedPrompt: "Ej: github.com/tu-usuario" });

  if (cv.summary && cv.summary.trim().length > 25) checksPassed++;
  else pendingFields.push({ id: "pending-summary", section: "summary", fieldName: "summary", label: "Resumen Profesional", description: "El CV carece de un párrafo de síntesis.", severity: "medium", suggestedPrompt: "Redacta 2-3 líneas resumiendo tu especialidad." });

  if (cv.experiences && cv.experiences.length > 0) checksPassed++;
  else pendingFields.push({ id: "pending-experiences", section: "experiences", fieldName: "experiences", label: "Historial de Experiencia Laboral", description: "No se reconocieron puestos de trabajo.", severity: "high", suggestedPrompt: "Agrega al menos una experiencia relevante." });

  const totalSkills = (cv.skills?.technical?.length || 0) + (cv.skills?.frameworks?.length || 0) + (cv.skills?.toolsCloud?.length || 0);
  if (totalSkills >= 3) checksPassed++;
  else pendingFields.push({ id: "pending-skills", section: "skills", fieldName: "technical", label: "Habilidades Técnicas", description: "Se detectaron muy pocas tecnologías.", severity: "high", suggestedPrompt: "Ej: TypeScript, React, Node.js" });

  if (cv.education && cv.education.length > 0) checksPassed++;
  else pendingFields.push({ id: "pending-education", section: "education", fieldName: "education", label: "Formación Académica", description: "No se identificaron estudios superiores.", severity: "medium", suggestedPrompt: "Ej: Ingeniería en Computación" });

  if (cv.certifications && cv.certifications.length > 0) checksPassed++;
  else pendingFields.push({ id: "pending-certifications", section: "certifications", fieldName: "certifications", label: "Certificaciones Técnicas", description: "No se detectaron certificaciones de industria.", severity: "low", suggestedPrompt: "Ej: AWS Certified Developer" });

  if (cv.languages && cv.languages.length > 0) checksPassed++;
  else pendingFields.push({ id: "pending-languages", section: "languages", fieldName: "languages", label: "Idiomas", description: "No se especificaron idiomas.", severity: "low", suggestedPrompt: "Ej: Español (Nativo), Inglés (C1)" });

  const completenessScore = Math.round((checksPassed / totalChecks) * 100);
  return { pendingFields, completedCount: checksPassed, totalChecks, completenessScore };
}

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
          const metricMatch = cleanBullet.match(/(\d+[%$kMBxsminhrreqGBTrps]+|[0-9]+[.,][0-9]+%|redujo|aumentó|disminuyó|mejoró|saving|saved|reduced|increased)[^,.;]*/i);

          const tags: string[] = [];
          if (Array.isArray(exp.technologies)) {
            exp.technologies.slice(0, 4).forEach((tech) => {
              if (tech && !tags.includes(`#${tech.replace(/[\s.]/g, "")}`)) {
                tags.push(`#${tech.replace(/[\s.]/g, "")}`);
              }
            });
          }
          if (tags.length === 0) tags.push("#Logro", "#Trayectoria");

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
            metricHighlight: metricMatch ? metricMatch[0].trim().substring(0, 24) : undefined,
          });
        });
      }
    });
  }

  return achievements;
}

export const apiExtractCv = onRequest(
  {
    cors: true,
    invoker: "public",
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (req, res) => {
    // 1. Mandatory Firebase Auth verification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Acceso no autorizado. Se requiere inicio de sesión con Firebase Auth.",
      });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1].trim();
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (authErr) {
      res.status(401).json({
        error: "Token de autenticación inválido o expirado.",
      });
      return;
    }

    const textContent: string = (req.body?.textContent || "").trim();
    const fileName: string = req.body?.fileName || "cv.txt";

    if (!textContent) {
      res.status(400).json({
        error: "Se requiere el contenido del CV en texto plano extraído previamente por el cliente.",
      });
      return;
    }

    const cleanText = textContent.length > 15000 ? textContent.substring(0, 15000) : textContent;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        error: "GEMINI_API_KEY no configurada en las variables seguras de entorno.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: { "User-Agent": "goalrecall-build" },
      },
    });

    const promptInstructions = `Eres un Auditor y Extractor Profesional y Técnico de CVs de Máxima Fidelidad (Strict Truthfulness Engine) capacitado para perfiles multidisciplinarios.

DIRECTIVA SUPREMA: FIDELIDAD ESTRICTA Y VERACIDAD ABSOLUTA (CERO INVENCIÓN):
1. Lee minuciosamente el texto proporcionado.
2. Extrae ÚNICAMENTE información real, verídica y explícitamente presente en el documento.
3. ESTRICTAMENTE PROHIBIDO INVENTAR empresas, cargos, fechas o métricas no presentes.
4. MANEJO DE CAMPOS FALTANTES: Si falta un campo, déjalo como null o cadena vacía "".

ESTRUCTURA A EXTRAER:
- contact: name, headline, email, phone, location, linkedin, github, portfolio.
- summary: perfil o resumen profesional.
- skills: technical, frameworks, toolsCloud, softSkills.
- experiences: company, role, location, startDate, endDate, isCurrent, bullets, technologies, category.
- education: degree, institution, year, status.
- certifications: name, issuer, year, credentialId.
- projects: name, role, description, technologies, url.
- languages: language, level.

Devuelve estrictamente un JSON válido conforme al schema.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              text: `${promptInstructions}\n\n--- CONTENIDO DEL CV ORIGINAL ---\n${cleanText}\n--- FIN DEL CV ---`,
            },
          ],
        },
        config: {
          maxOutputTokens: 2048,
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
          },
        },
      });

      const outputText = response.text?.trim() || "{}";
      const parsedData: ExtractedCvData = JSON.parse(outputText);

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
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
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
        rawTextPreview: cleanText.substring(0, 300),
      };

      const audit = calculateCvAudit(cleanCvData);
      const achievements = cvToAchievements(cleanCvData, fileName);

      res.json({
        cvData: cleanCvData,
        achievements,
        pendingFields: audit.pendingFields,
        completedCount: audit.completedCount,
        totalChecks: audit.totalChecks,
        completenessScore: audit.completenessScore,
        engine: "gemini-2.5-flash-function",
        fileName: fileName,
      });
    } catch (geminiErr: any) {
      console.error("Error en Gemini AI Cloud Function:", geminiErr);
      res.status(500).json({
        error: "Fallo en el servicio de IA de Gemini. Por favor intenta con el respaldo local.",
        details: geminiErr.message,
      });
    }
  }
);

export const apiUserData = onRequest(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    // 1. Validate Firebase Auth
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Acceso no autorizado. Se requiere inicio de sesión con Firebase Auth.",
      });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1].trim();
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (authErr) {
      res.status(401).json({
        error: "Token de autenticación inválido o expirado.",
      });
      return;
    }

    const userId = decodedToken.uid;
    const db = admin.firestore();
    const userDocRef = db.collection("users").doc(userId).collection("state").doc("main");

    try {
      if (req.method === "GET") {
        const snap = await userDocRef.get();
        if (!snap.exists) {
          res.json({
            success: true,
            exists: false,
            data: null,
          });
          return;
        }

        res.json({
          success: true,
          exists: true,
          data: snap.data(),
        });
        return;
      }

      if (req.method === "POST") {
        const payload = req.body || {};

        // Fetch existing snapshot to prevent overwriting user if missing in payload
        const existingSnap = await userDocRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() || {} : {};

        let userToSave = payload.user || existingData.user || null;

        // If user is null or missing, initialize clean base user from auth token
        if (!userToSave) {
          userToSave = {
            id: userId,
            username: `user_${userId.substring(0, 6)}`,
            name: decodedToken.name || "Usuario",
            email: decodedToken.email || "",
            createdAt: Date.now(),
          };
        } else if (!userToSave.username || typeof userToSave.username !== "string" || userToSave.username.trim().length === 0) {
          // If username is missing, fallback to existing username or handle based on userId
          const existingUsername = existingData.user?.username;
          userToSave.username = existingUsername || `user_${userId.substring(0, 6)}`;
        }

        // Clean handle
        const cleanUsername = (userToSave.username || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
        userToSave.username = cleanUsername;

        const stateToSave = {
          ...payload,
          user: userToSave,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Write to state/main
        await userDocRef.set(stateToSave, { merge: true });

        // Atomic/immediate sync to publicShowcases collection in Firestore
        if (cleanUsername) {
          const publicShowcaseRef = db.collection("publicShowcases").doc(cleanUsername);

          const allLogs = Array.isArray(payload.logs)
            ? payload.logs
            : (Array.isArray(existingData.logs) ? existingData.logs : []);
          const allProducts = Array.isArray(payload.products)
            ? payload.products
            : (Array.isArray(existingData.products) ? existingData.products : []);

          const publicLogs = allLogs.filter((l: any) => l.isPublic === true);
          const publicProducts = allProducts.filter((p: any) => p.isPublic !== false);

          const safeUserProfile = {
            id: userToSave.id || userId,
            username: cleanUsername,
            name: userToSave.name || "Profesional Técnico",
            title: userToSave.title || "",
            bio: userToSave.bio || "",
            avatar: userToSave.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            location: userToSave.location || "",
            github: userToSave.github || userToSave.socialLinks?.github || "",
            linkedin: userToSave.linkedin || userToSave.socialLinks?.linkedin || "",
            socialLinks: userToSave.socialLinks || {},
            availabilityStatus: userToSave.availabilityStatus,
            skills: Array.isArray(userToSave.skills) ? userToSave.skills : [],
            email: userToSave.email || "",
            authProvider: userToSave.authProvider || "custom",
            createdAt: userToSave.createdAt || Date.now(),
          };

          await publicShowcaseRef.set(
            {
              userId: userId,
              username: cleanUsername,
              userProfile: safeUserProfile,
              logs: publicLogs,
              products: publicProducts,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        res.json({
          success: true,
          message: "Estado de usuario y vitrina pública guardados exitosamente en Firestore.",
          username: cleanUsername,
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      res.status(405).json({ error: `Método ${req.method} no permitido.` });
    } catch (dbErr: any) {
      console.error("Error interactuando con Firestore:", dbErr);
      res.status(500).json({
        error: "Error interno al acceder a la base de datos Firestore.",
        details: dbErr?.message,
      });
    }
  }
);

export const apiPublicShowcase = onRequest(
  {
    cors: true,
    invoker: "public",
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    try {
      const db = admin.firestore();

      // Handle delete-showcase route
      if (req.path.includes("delete-showcase") && (req.method === "POST" || req.method === "DELETE")) {
        const { username, userKey } = req.body || {};
        if (!username) {
          res.status(400).json({ error: "username es requerido." });
          return;
        }
        const clean = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const showcaseRef = db.collection("publicShowcases").doc(clean);
        await showcaseRef.delete();

        // Also update state/main if userKey is provided to mark showcaseInactive or update user
        if (userKey) {
          const userDocRef = db.collection("users").doc(userKey).collection("state").doc("main");
          await userDocRef.set({ isShowcaseActive: false }, { merge: true });
        }

        res.json({ success: true, message: "Vitrina pública eliminada correctamente." });
        return;
      }

      // Handle claim-username / create-showcase route
      if (req.path.includes("claim-username") && req.method === "POST") {
        const { username, userKey, userProfile, logs, products } = req.body || {};
        if (!username || !userKey) {
          res.status(400).json({ error: "username y userKey son requeridos." });
          return;
        }

        const clean = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        const publicShowcaseRef = db.collection("publicShowcases").doc(clean);

        const allLogs = Array.isArray(logs) ? logs : [];
        const allProducts = Array.isArray(products) ? products : [];
        const publicLogs = allLogs.filter((l: any) => l.isPublic === true);
        const publicProducts = allProducts.filter((p: any) => p.isPublic !== false);

        const rawUser = userProfile || {};
        const safeUserProfile = {
          id: rawUser.id || userKey,
          username: clean,
          name: rawUser.name || "Profesional Técnico",
          title: rawUser.title || "",
          bio: rawUser.bio || "",
          avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          location: rawUser.location || "",
          github: rawUser.github || rawUser.socialLinks?.github || "",
          linkedin: rawUser.linkedin || rawUser.socialLinks?.linkedin || "",
          socialLinks: rawUser.socialLinks || {},
          availabilityStatus: rawUser.availabilityStatus,
          skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
          email: rawUser.email || "",
          authProvider: rawUser.authProvider || "custom",
          createdAt: rawUser.createdAt || Date.now(),
        };

        await publicShowcaseRef.set(
          {
            userId: userKey,
            username: clean,
            userProfile: safeUserProfile,
            logs: publicLogs,
            products: publicProducts,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Also ensure users/{userId}/state/main has this user object persisted
        if (userKey) {
          const userDocRef = db.collection("users").doc(userKey).collection("state").doc("main");
          await userDocRef.set(
            {
              user: safeUserProfile,
              isShowcaseActive: true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        res.json({ success: true, username: clean, userKey });
        return;
      }

      // Handle both express path params, query params, or URL subpath
      let rawUsername = (req.params.username || req.query.username || "").toString().trim();
      if (!rawUsername) {
        const urlParts = req.path.split("/").filter(Boolean);
        rawUsername = urlParts[urlParts.length - 1] || "";
      }

      if (!rawUsername || rawUsername === "claim-username") {
        res.status(400).json({ error: "El nombre de usuario es requerido." });
        return;
      }

      const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_-]/g, "");

      // Query Firestore publicShowcases collection directly
      const showcaseDoc = await db.collection("publicShowcases").doc(cleanUsername).get();

      if (showcaseDoc.exists) {
        const data = showcaseDoc.data() || {};
        res.json({
          success: true,
          userProfile: data.userProfile || { username: cleanUsername, name: cleanUsername },
          logs: Array.isArray(data.logs) ? data.logs : [],
          products: Array.isArray(data.products) ? data.products : [],
        });
        return;
      }

      // Fallback: Query by user.username across all users/{userId}/state/main if not yet synced in publicShowcases
      const userQuerySnap = await db
        .collectionGroup("state")
        .where("user.username", "==", cleanUsername)
        .limit(1)
        .get();

      if (!userQuerySnap.empty) {
        const docData = userQuerySnap.docs[0].data() || {};
        const rawUser = docData.user || {};
        const allLogs = Array.isArray(docData.logs) ? docData.logs : [];
        const allProducts = Array.isArray(docData.products) ? docData.products : [];

        const publicLogs = allLogs.filter((l: any) => l.isPublic === true);
        const publicProducts = allProducts.filter((p: any) => p.isPublic !== false);

        const safeUserProfile = {
          id: rawUser.id || userQuerySnap.docs[0].ref.parent.parent?.id || `usr-${cleanUsername}`,
          username: cleanUsername,
          name: rawUser.name || "Profesional Técnico",
          title: rawUser.title || "",
          bio: rawUser.bio || "",
          avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          location: rawUser.location || "",
          github: rawUser.github || rawUser.socialLinks?.github || "",
          linkedin: rawUser.linkedin || rawUser.socialLinks?.linkedin || "",
          socialLinks: rawUser.socialLinks || {},
          availabilityStatus: rawUser.availabilityStatus,
          skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
          email: rawUser.email || "",
          authProvider: rawUser.authProvider || "custom",
          createdAt: rawUser.createdAt || Date.now(),
        };

        // Cache into publicShowcases for fast future lookups
        await db.collection("publicShowcases").doc(cleanUsername).set({
          userId: safeUserProfile.id,
          username: cleanUsername,
          userProfile: safeUserProfile,
          logs: publicLogs,
          products: publicProducts,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        res.json({
          success: true,
          userProfile: safeUserProfile,
          logs: publicLogs,
          products: publicProducts,
        });
        return;
      }

      res.status(404).json({ error: "Vitrina pública no encontrada para este usuario." });
    } catch (err: any) {
      console.error("Error en apiPublicShowcase:", err);
      res.status(500).json({ error: "Error interno del servidor.", details: err?.message });
    }
  }
);
