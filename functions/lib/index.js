"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiPublicShowcase = exports.apiUserData = exports.apiExtractCv = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
if (!admin.apps.length) {
    admin.initializeApp();
}
function calculateCvAudit(cv) {
    const pendingFields = [];
    let checksPassed = 0;
    const totalChecks = 13;
    if (cv.contact?.name && cv.contact.name.trim().length > 1)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-name", section: "contact", fieldName: "name", label: "Nombre Completo", description: "No se identificó el nombre en el documento.", severity: "high", suggestedPrompt: "Ej: Rodrigo Jara" });
    if (cv.contact?.headline && cv.contact.headline.trim().length > 2)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-headline", section: "contact", fieldName: "headline", label: "Titular Profesional / Cargo Principal", description: "No se identificó el titular profesional.", severity: "high", suggestedPrompt: "Ej: Senior Full Stack Developer" });
    if (cv.contact?.email && cv.contact.email.includes("@"))
        checksPassed++;
    else
        pendingFields.push({ id: "pending-email", section: "contact", fieldName: "email", label: "Correo Electrónico de Contacto", description: "No se encontró correo electrónico.", severity: "high", suggestedPrompt: "Ej: usuario@gmail.com" });
    if (cv.contact?.phone && cv.contact.phone.trim().length >= 6)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-phone", section: "contact", fieldName: "phone", label: "Teléfono / WhatsApp", description: "No se detectó número telefónico.", severity: "medium", suggestedPrompt: "Ej: +56 9 1234 5678" });
    if (cv.contact?.location && cv.contact.location.trim().length > 2)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-location", section: "contact", fieldName: "location", label: "Ubicación & Modalidad", description: "Falta ciudad o modalidad de trabajo.", severity: "medium", suggestedPrompt: "Ej: Santiago, Chile / Remoto" });
    if (cv.contact?.linkedin && cv.contact.linkedin.trim().length > 5)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-linkedin", section: "contact", fieldName: "linkedin", label: "Enlace a LinkedIn", description: "No se encontró perfil de LinkedIn.", severity: "medium", suggestedPrompt: "Ej: linkedin.com/in/tu-usuario" });
    if (cv.contact?.github && cv.contact.github.trim().length > 4)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-github", section: "contact", fieldName: "github", label: "Repositorio GitHub", description: "No se detectó enlace a GitHub.", severity: "low", suggestedPrompt: "Ej: github.com/tu-usuario" });
    if (cv.summary && cv.summary.trim().length > 25)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-summary", section: "summary", fieldName: "summary", label: "Resumen Profesional", description: "El CV carece de un párrafo de síntesis.", severity: "medium", suggestedPrompt: "Redacta 2-3 líneas resumiendo tu especialidad." });
    if (cv.experiences && cv.experiences.length > 0)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-experiences", section: "experiences", fieldName: "experiences", label: "Historial de Experiencia Laboral", description: "No se reconocieron puestos de trabajo.", severity: "high", suggestedPrompt: "Agrega al menos una experiencia relevante." });
    const totalSkills = (cv.skills?.technical?.length || 0) + (cv.skills?.frameworks?.length || 0) + (cv.skills?.toolsCloud?.length || 0);
    if (totalSkills >= 3)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-skills", section: "skills", fieldName: "technical", label: "Habilidades Técnicas", description: "Se detectaron muy pocas tecnologías.", severity: "high", suggestedPrompt: "Ej: TypeScript, React, Node.js" });
    if (cv.education && cv.education.length > 0)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-education", section: "education", fieldName: "education", label: "Formación Académica", description: "No se identificaron estudios superiores.", severity: "medium", suggestedPrompt: "Ej: Ingeniería en Computación" });
    if (cv.certifications && cv.certifications.length > 0)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-certifications", section: "certifications", fieldName: "certifications", label: "Certificaciones Técnicas", description: "No se detectaron certificaciones de industria.", severity: "low", suggestedPrompt: "Ej: AWS Certified Developer" });
    if (cv.languages && cv.languages.length > 0)
        checksPassed++;
    else
        pendingFields.push({ id: "pending-languages", section: "languages", fieldName: "languages", label: "Idiomas", description: "No se especificaron idiomas.", severity: "low", suggestedPrompt: "Ej: Español (Nativo), Inglés (C1)" });
    const completenessScore = Math.round((checksPassed / totalChecks) * 100);
    return { pendingFields, completedCount: checksPassed, totalChecks, completenessScore };
}
function cvToAchievements(cv, fileName) {
    const achievements = [];
    if (Array.isArray(cv.experiences)) {
        cv.experiences.forEach((exp, expIdx) => {
            const company = exp.company?.trim() || "Empresa";
            const project = exp.role?.trim() || "Ingeniería";
            if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
                exp.bullets.forEach((bullet, bIdx) => {
                    if (!bullet || bullet.trim().length < 8)
                        return;
                    const cleanBullet = bullet.trim();
                    const metricMatch = cleanBullet.match(/(\d+[%$kMBxsminhrreqGBTrps]+|[0-9]+[.,][0-9]+%|redujo|aumentó|disminuyó|mejoró|saving|saved|reduced|increased)[^,.;]*/i);
                    const tags = [];
                    if (Array.isArray(exp.technologies)) {
                        exp.technologies.slice(0, 4).forEach((tech) => {
                            if (tech && !tags.includes(`#${tech.replace(/[\s.]/g, "")}`)) {
                                tags.push(`#${tech.replace(/[\s.]/g, "")}`);
                            }
                        });
                    }
                    if (tags.length === 0)
                        tags.push("#Logro", "#Trayectoria");
                    let bulletCategory = exp.category || "Feature ✨";
                    const lowerBullet = cleanBullet.toLowerCase();
                    if (/growth|marketing|campaña|cac|ltv|leads|conversion|conversi[oó]n|roas|seo|sem/i.test(lowerBullet)) {
                        bulletCategory = "Growth & Marketing 📈";
                    }
                    else if (/ventas|sales|arr|mrr|deals|pipeline|cuentas enterprise|b2b/i.test(lowerBullet)) {
                        bulletCategory = "Negocios & Ventas 💼";
                    }
                    else if (/diseño|design|ux|ui|figma|prototip|onboarding/i.test(lowerBullet)) {
                        bulletCategory = "Diseño & Producto 🎨";
                    }
                    else if (/liderazgo|management|team lead|contrataci[oó]n|mentoring|cultura|scrum/i.test(lowerBullet)) {
                        bulletCategory = "Liderazgo & Gestión 👥";
                    }
                    else if (/operacion|operaciones|procesos|log[ií]stica|compliance/i.test(lowerBullet)) {
                        bulletCategory = "Operaciones & Procesos ⚙️";
                    }
                    else if (/arquitect|architec|migra|monolit|distribuid|cloud|kafka|microserv|federation|microfrontend/i.test(lowerBullet)) {
                        bulletCategory = "Architecture 🏗️";
                    }
                    else if (/ci\/cd|pipeline|docker|kubernetes|k8s|devops|terraform|aks|aws|azure|gcp/i.test(lowerBullet)) {
                        bulletCategory = "Infra/DevOps 🚀";
                    }
                    else if (/refactor|optimiz|rendimient|latenc|p99|speed|performance/i.test(lowerBullet)) {
                        bulletCategory = "Refactor 🧹";
                    }
                    else if (/bug|fix|error|vulnerab|security|seguridad/i.test(lowerBullet)) {
                        bulletCategory = "Fix 🐛";
                    }
                    else if (/spike|poc|r&d|evalu|investig|prototip/i.test(lowerBullet)) {
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
exports.apiExtractCv = (0, https_1.onRequest)({
    cors: true,
    invoker: "public",
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
}, async (req, res) => {
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
    }
    catch (authErr) {
        res.status(401).json({
            error: "Token de autenticación inválido o expirado.",
        });
        return;
    }
    const textContent = (req.body?.textContent || "").trim();
    const fileName = req.body?.fileName || "cv.txt";
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
    const ai = new genai_1.GoogleGenAI({
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
                    type: genai_1.Type.OBJECT,
                    properties: {
                        contact: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                name: { type: genai_1.Type.STRING },
                                headline: { type: genai_1.Type.STRING },
                                email: { type: genai_1.Type.STRING },
                                phone: { type: genai_1.Type.STRING },
                                location: { type: genai_1.Type.STRING },
                                linkedin: { type: genai_1.Type.STRING },
                                github: { type: genai_1.Type.STRING },
                                portfolio: { type: genai_1.Type.STRING },
                            },
                        },
                        summary: { type: genai_1.Type.STRING },
                        skills: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                technical: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                frameworks: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                toolsCloud: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                softSkills: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                            },
                        },
                        experiences: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    id: { type: genai_1.Type.STRING },
                                    company: { type: genai_1.Type.STRING },
                                    role: { type: genai_1.Type.STRING },
                                    location: { type: genai_1.Type.STRING },
                                    startDate: { type: genai_1.Type.STRING },
                                    endDate: { type: genai_1.Type.STRING },
                                    isCurrent: { type: genai_1.Type.BOOLEAN },
                                    description: { type: genai_1.Type.STRING },
                                    bullets: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                    technologies: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                    category: { type: genai_1.Type.STRING },
                                },
                                required: ["company", "role", "bullets"],
                            },
                        },
                        education: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    id: { type: genai_1.Type.STRING },
                                    degree: { type: genai_1.Type.STRING },
                                    institution: { type: genai_1.Type.STRING },
                                    year: { type: genai_1.Type.STRING },
                                    status: { type: genai_1.Type.STRING },
                                },
                                required: ["degree"],
                            },
                        },
                        certifications: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    id: { type: genai_1.Type.STRING },
                                    name: { type: genai_1.Type.STRING },
                                    issuer: { type: genai_1.Type.STRING },
                                    year: { type: genai_1.Type.STRING },
                                    credentialId: { type: genai_1.Type.STRING },
                                },
                                required: ["name"],
                            },
                        },
                        projects: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    id: { type: genai_1.Type.STRING },
                                    name: { type: genai_1.Type.STRING },
                                    role: { type: genai_1.Type.STRING },
                                    description: { type: genai_1.Type.STRING },
                                    technologies: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                    url: { type: genai_1.Type.STRING },
                                },
                                required: ["name"],
                            },
                        },
                        languages: {
                            type: genai_1.Type.ARRAY,
                            items: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    id: { type: genai_1.Type.STRING },
                                    language: { type: genai_1.Type.STRING },
                                    level: { type: genai_1.Type.STRING },
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
        const parsedData = JSON.parse(outputText);
        const cleanCvData = {
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
    }
    catch (geminiErr) {
        console.error("Error en Gemini AI Cloud Function:", geminiErr);
        res.status(500).json({
            error: "Fallo en el servicio de IA de Gemini. Por favor intenta con el respaldo local.",
            details: geminiErr.message,
        });
    }
});
exports.apiUserData = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
}, async (req, res) => {
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
    }
    catch (authErr) {
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
            const stateToSave = {
                ...payload,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await userDocRef.set(stateToSave, { merge: true });
            // If payload includes user profile with a username, sync publicShowcases collection
            const rawUsername = payload.user?.username?.toString().trim();
            if (rawUsername) {
                const cleanUsername = rawUsername.toLowerCase().replace(/^u\//, "").replace(/[^a-z0-9_-]/g, "");
                if (cleanUsername) {
                    try {
                        const rawUser = payload.user || {};
                        const publicLogs = (payload.logs || []).filter((l) => l.isPublic === true);
                        const publicProducts = (payload.products || []).filter((p) => p.isPublic !== false);
                        const safeUserProfile = {
                            id: rawUser.id || userId,
                            username: cleanUsername,
                            name: rawUser.name || "Profesional Técnico",
                            title: rawUser.title || "",
                            bio: rawUser.bio || "",
                            avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                            location: rawUser.location || "",
                            github: rawUser.socialLinks?.github || rawUser.github || "",
                            linkedin: rawUser.socialLinks?.linkedin || rawUser.linkedin || "",
                            socialLinks: rawUser.socialLinks || {},
                            availabilityStatus: rawUser.availabilityStatus,
                            skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
                            email: rawUser.email || "",
                            authProvider: "custom",
                            isDemoUser: false,
                            isCustom: true,
                            createdAt: rawUser.createdAt || Date.now(),
                        };
                        await db.collection("publicShowcases").doc(cleanUsername).set({
                            userProfile: safeUserProfile,
                            logs: publicLogs,
                            products: publicProducts,
                            userId,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        }, { merge: true });
                    }
                    catch (showcaseErr) {
                        console.warn("Error updating publicShowcases doc:", showcaseErr);
                    }
                }
            }
            res.json({
                success: true,
                message: "Estado de usuario guardado exitosamente en Firestore.",
                updatedAt: new Date().toISOString(),
            });
            return;
        }
        res.status(405).json({ error: `Método ${req.method} no permitido.` });
    }
    catch (dbErr) {
        console.error("Error interactuando con Firestore:", dbErr);
        res.status(500).json({
            error: "Error interno al acceder a la base de datos Firestore.",
            details: dbErr?.message,
        });
    }
});
exports.apiPublicShowcase = (0, https_1.onRequest)({
    cors: true,
    invoker: "public",
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB",
}, 
// @ts-ignore
async (req, res) => {
    try {
        // Robust username extraction from req.params, req.url, req.path, or query params
        let rawUsername = ((req.params && (req.params.username || req.params[0])) ||
            (req.query && req.query.username) ||
            "").toString().trim();
        if (!rawUsername) {
            const rawUrl = req.url || req.path || req.originalUrl || "";
            const cleanUrl = rawUrl.split("?")[0].replace(/\/+$/, "");
            const parts = cleanUrl.split("/").filter(Boolean);
            if (parts.length > 0) {
                rawUsername = parts[parts.length - 1];
            }
        }
        // If still empty or is generic endpoint keyword
        if (!rawUsername || rawUsername === "apiPublicShowcase" || rawUsername === "u") {
            return res.status(400).json({ error: "Username is required." });
        }
        const cleanUsername = rawUsername.toLowerCase().replace(/^u\//, "").replace(/[^a-z0-9_-]/g, "");
        if (!cleanUsername) {
            return res.status(400).json({ error: "Username is required." });
        }
        const db = admin.firestore();
        // 1. Direct check in publicShowcases/{username} collection (Zero-Cost Firestore read: 1 document read)
        try {
            const showcaseDoc = await db.collection("publicShowcases").doc(cleanUsername).get();
            if (showcaseDoc.exists) {
                const data = showcaseDoc.data() || {};
                const rawUser = data.userProfile || {};
                const publicLogs = (data.logs || []).filter((l) => l.isPublic === true);
                const publicProducts = (data.products || []).filter((p) => p.isPublic !== false);
                const safeUserProfile = {
                    id: rawUser.id || `usr-${cleanUsername}`,
                    username: rawUser.username || cleanUsername,
                    name: rawUser.name || "Profesional Técnico",
                    title: rawUser.title || "",
                    bio: rawUser.bio || "",
                    avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    location: rawUser.location || "",
                    github: rawUser.socialLinks?.github || rawUser.github || "",
                    linkedin: rawUser.socialLinks?.linkedin || rawUser.linkedin || "",
                    socialLinks: rawUser.socialLinks || {},
                    availabilityStatus: rawUser.availabilityStatus,
                    skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
                    email: rawUser.email || "",
                    authProvider: "custom",
                    isDemoUser: false,
                    isCustom: true,
                    createdAt: rawUser.createdAt || Date.now(),
                };
                return res.json({
                    success: true,
                    userProfile: safeUserProfile,
                    logs: publicLogs,
                    products: publicProducts,
                });
            }
        }
        catch (firestoreErr) {
            console.warn("Firestore publicShowcases lookup warn:", firestoreErr);
        }
        // 2. Query Firestore collectionGroup for user state where user.username matches
        try {
            const matchingQuery = await db.collectionGroup("state")
                .where("user.username", "==", cleanUsername)
                .limit(1)
                .get();
            if (!matchingQuery.empty) {
                const docData = matchingQuery.docs[0].data();
                const rawUser = docData.user || {};
                const publicLogs = (docData.logs || []).filter((l) => l.isPublic === true);
                const publicProducts = (docData.products || []).filter((p) => p.isPublic !== false);
                const safeUserProfile = {
                    id: rawUser.id || `usr-${cleanUsername}`,
                    username: rawUser.username || cleanUsername,
                    name: rawUser.name || "Profesional Técnico",
                    title: rawUser.title || "",
                    bio: rawUser.bio || "",
                    avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    location: rawUser.location || "",
                    github: rawUser.socialLinks?.github || rawUser.github || "",
                    linkedin: rawUser.socialLinks?.linkedin || rawUser.linkedin || "",
                    socialLinks: rawUser.socialLinks || {},
                    availabilityStatus: rawUser.availabilityStatus,
                    skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
                    email: rawUser.email || "",
                    authProvider: "custom",
                    isDemoUser: false,
                    isCustom: true,
                    createdAt: rawUser.createdAt || Date.now(),
                };
                // Also populate publicShowcases cache document for fast future access
                try {
                    await db.collection("publicShowcases").doc(cleanUsername).set({
                        userProfile: safeUserProfile,
                        logs: publicLogs,
                        products: publicProducts,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    }, { merge: true });
                }
                catch {
                    // non-fatal
                }
                return res.json({
                    success: true,
                    userProfile: safeUserProfile,
                    logs: publicLogs,
                    products: publicProducts,
                });
            }
        }
        catch (queryErr) {
            console.warn("Firestore state query warn:", queryErr);
        }
        // 3. Fallback: local sync files (development & backwards compatibility)
        let userKey;
        try {
            const indexPath = path.resolve("./username_index.json");
            if (fs.existsSync(indexPath)) {
                const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
                userKey = index[cleanUsername];
            }
        }
        catch {
            // ignore
        }
        if (!userKey) {
            try {
                const syncDir = path.resolve("./.firebase/functions/");
                if (fs.existsSync(syncDir)) {
                    const files = fs.readdirSync(syncDir).filter((f) => f.startsWith("user_") && f.endsWith(".json"));
                    for (const file of files) {
                        try {
                            const content = JSON.parse(fs.readFileSync(path.resolve(syncDir, file), "utf-8"));
                            const user = content?.payload?.user;
                            const uUsername = (user?.username || "").toLowerCase();
                            const uEmailPrefix = (user?.email || "").split("@")[0].toLowerCase();
                            const uId = (user?.id || "").toLowerCase();
                            if (uUsername === cleanUsername ||
                                uEmailPrefix === cleanUsername ||
                                uId === cleanUsername ||
                                content?.userKey?.toLowerCase() === cleanUsername) {
                                userKey = content?.userKey;
                                break;
                            }
                        }
                        catch {
                            // ignore
                        }
                    }
                }
            }
            catch {
                // ignore
            }
        }
        if (userKey) {
            const CLOUD_SYNC_DIR = path.resolve("./.firebase/functions");
            const syncFilePath = path.resolve(CLOUD_SYNC_DIR, `user_${userKey.replace(/[^a-zA-Z0-9@._-]/g, "_")}.json`);
            if (fs.existsSync(syncFilePath)) {
                const fileContent = fs.readFileSync(syncFilePath, "utf-8");
                const parsed = JSON.parse(fileContent);
                const publicLogs = (parsed.payload?.logs || []).filter((l) => l.isPublic === true);
                const publicProducts = (parsed.payload?.products || []).filter((p) => p.isPublic !== false);
                const rawUser = parsed.payload?.user || {};
                const safeUserProfile = {
                    id: rawUser.id || `usr-${cleanUsername}`,
                    username: rawUser.username || cleanUsername,
                    name: rawUser.name || "Profesional Técnico",
                    title: rawUser.title || "",
                    bio: rawUser.bio || "",
                    avatar: rawUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    location: rawUser.location || "",
                    github: rawUser.socialLinks?.github || rawUser.github || "",
                    linkedin: rawUser.socialLinks?.linkedin || rawUser.linkedin || "",
                    socialLinks: rawUser.socialLinks || {},
                    availabilityStatus: rawUser.availabilityStatus,
                    skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
                    email: rawUser.email || "",
                    authProvider: "custom",
                    isDemoUser: false,
                    isCustom: true,
                    createdAt: rawUser.createdAt || Date.now(),
                };
                return res.json({
                    success: true,
                    userProfile: safeUserProfile,
                    logs: publicLogs,
                    products: publicProducts,
                });
            }
        }
        return res.status(404).json({ error: "Vitrina pública no encontrada para este usuario." });
    }
    catch (err) {
        console.error("Error en apiPublicShowcase:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
//# sourceMappingURL=index.js.map