import { LogEntry, UserProfile, Product } from "../types";

export interface FirstMateResponse {
  message: string;
  citedLogs: LogEntry[];
  citedProducts?: Product[];
  suggestedFollowUps: string[];
}

export const SUGGESTED_QUERIES = [
  "¿Qué experiencia tiene con Redis y alta concurrencia?",
  "Muestra proyectos y logros con React y TypeScript",
  "¿Cuáles han sido sus mayores victorias de rendimiento y latencia?",
  "Cuéntame sobre sus proyectos de arquitectura distribuida",
  "¿Tiene experiencia con infraestructura y observabilidad?",
];

export const PRODUCT_SUGGESTED_QUERIES = [
  "¿Qué arquitectura tiene Myfeedin?",
  "¿Qué productos y proyectos propios ha desarrollado?",
  "¿Qué stack tecnológico utiliza en sus aplicaciones SaaS?",
  "¿Cómo implementó el widget multi-tenant?",
  "Muestra logros vinculados al showcase de productos",
];

/**
 * Strict First Mate query handler.
 * GUARANTEE: Never accesses or returns logs or products where isPublic !== true.
 */
export const queryFirstMate = (
  userQuery: string,
  publicLogs: LogEntry[],
  userProfile: UserProfile,
  publicProducts: Product[] = []
): FirstMateResponse => {
  // Ensure strict isolation filter at runtime
  const safeLogs = publicLogs.filter((l) => l.isPublic);
  const safeProducts = publicProducts.filter((p) => p.isPublic !== false);

  const query = userQuery.toLowerCase().trim();

  if (!query) {
    return {
      message: `¡Hola! Soy First Mate, el asistente técnico de ${userProfile.name}. Puedo responder tus preguntas sobre sus proyectos verificados, productos propios en vitrina, tecnologías y métricas de impacto públicas. ¿Qué te gustaría consultar?`,
      citedLogs: safeLogs.slice(0, 2),
      citedProducts: safeProducts.slice(0, 1),
      suggestedFollowUps: [...PRODUCT_SUGGESTED_QUERIES.slice(0, 2), ...SUGGESTED_QUERIES.slice(0, 2)],
    };
  }

  // Check for greetings
  if (/^(hola|buenas|hi|hello|hey|saludos)/i.test(query) && query.length < 15) {
    return {
      message: `¡Saludos! Soy First Mate. Estoy listo para asistirte con la trayectoria técnica de ${userProfile.name}. Cuento con acceso a ${safeLogs.length} logros públicos verificados y ${safeProducts.length} productos en su showcase. Puedes preguntarme sobre tecnologías específicas, arquitectura, SaaS o reducciones de latencia.`,
      citedLogs: safeLogs.slice(0, 2),
      citedProducts: safeProducts.slice(0, 1),
      suggestedFollowUps: [...PRODUCT_SUGGESTED_QUERIES.slice(0, 2), ...SUGGESTED_QUERIES.slice(0, 2)],
    };
  }

  // Check if query is specifically asking about products / showcase / SaaS
  const isProductGeneralQuery = 
    query.includes("producto") || 
    query.includes("showcase") || 
    query.includes("propio") || 
    query.includes("saas") || 
    query.includes("aplicacion") ||
    query.includes("widget");

  // Search matching products
  const matchingProducts = safeProducts.filter((prod) => {
    const prodText = `${prod.title} ${prod.tagline} ${prod.description} ${prod.badge || ""} ${prod.techStack.join(" ")}`.toLowerCase();
    if (query.includes(prod.title.toLowerCase())) return true;
    if (prod.techStack.some((t) => query.includes(t.toLowerCase()))) return true;
    if (isProductGeneralQuery) return true;
    return prodText.includes(query);
  });

  // Tokenize query words for log matching
  const terms = query
    .replace(/[¿?.,!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["con", "los", "las", "del", "que", "para", "por", "sus", "una", "uno", "tiene", "muestra", "cuentame"].includes(w));

  // Score public logs based on matches
  const scoredLogs = safeLogs.map((log) => {
    let score = 0;
    const fullText = `${log.title} ${log.description || ""} ${log.impact} ${log.category} ${log.client} ${log.project} ${log.tags.join(" ")}`.toLowerCase();

    for (const term of terms) {
      if (log.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
      if (log.title.toLowerCase().includes(term)) score += 4;
      if (log.impact.toLowerCase().includes(term)) score += 3;
      if (fullText.includes(term)) score += 2;
    }

    // Technology synonyms
    if (query.includes("redis") && fullText.includes("redis")) score += 6;
    if (query.includes("react") && fullText.includes("react")) score += 6;
    if ((query.includes("latencia") || query.includes("rendimiento") || query.includes("performance")) && (fullText.includes("latency") || fullText.includes("ms") || fullText.includes("rendimiento"))) score += 6;
    if (query.includes("arquitectura") && (log.category.includes("Architecture") || fullText.includes("saga") || fullText.includes("hexagonal"))) score += 6;
    if ((query.includes("devops") || query.includes("infra") || query.includes("observabilidad")) && (log.category.includes("Infra") || fullText.includes("opentelemetry") || fullText.includes("grafana"))) score += 6;

    return { log, score };
  });

  const matchingLogs = scoredLogs
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.log);

  // If a specific product was matched
  if (matchingProducts.length > 0 && (isProductGeneralQuery || matchingProducts.some((p) => query.includes(p.title.toLowerCase())))) {
    const topProd = matchingProducts[0];
    const relatedLogsForProd = safeLogs.filter((l) => topProd.relatedAchievementIds?.includes(l.id));

    let msg = `En su vitrina de productos, ${userProfile.name} ha publicado **${topProd.title}** (${topProd.badge || "SaaS / Propio"}): "${topProd.tagline}".\n\n${topProd.description}\n\n**Stack tecnológico principal:** ${topProd.techStack.join(", ")}.`;

    if (topProd.liveUrl) {
      msg += `\n🔗 Puedes visitarlo directamente en: ${topProd.liveUrl}`;
    }

    if (relatedLogsForProd.length > 0) {
      msg += `\n\n⚡ **Logros de Arquitectura Asociados:**\n` + relatedLogsForProd.map((l) => `• ${l.title} (${l.impact})`).join("\n");
    }

    return {
      message: msg,
      citedLogs: relatedLogsForProd.length > 0 ? relatedLogsForProd : matchingLogs.slice(0, 2),
      citedProducts: matchingProducts.slice(0, 2),
      suggestedFollowUps: [
        `¿Qué otras tecnologías se utilizaron en ${topProd.title}?`,
        "¿Cuáles son sus mayores victorias de rendimiento?",
        "Dejar un recado para el Capitán",
      ],
    };
  }

  // If no product directly matched, evaluate logs
  if (matchingLogs.length === 0) {
    return {
      message: `He revisado la bitácora y showcase público de ${userProfile.name} y no encontré un registro público explícito sobre "${userQuery}".\n\nTen en cuenta que ${userProfile.name} cuenta con registros adicionales protegidos en su Bóveda Privada por confidencialidad.\n\nSi deseas consultar sobre este tema específico, te invito a dejarle un recado en el formulario de abajo y te responderá directamente.`,
      citedLogs: [],
      citedProducts: [],
      suggestedFollowUps: [
        "¿Cuáles son sus mayores victorias de rendimiento?",
        "¿Qué productos propios tiene en el showcase?",
        "Muestra proyectos con React y TypeScript",
      ],
    };
  }

  // Construct helpful answer for achievements
  const topMatch = matchingLogs[0];
  let answer = `Sí, ${userProfile.name} cuenta con sólida experiencia verificada en esa área. `;

  if (matchingLogs.length === 1) {
    answer += `En el proyecto "${topMatch.project}" (${topMatch.client}), lideró: "${topMatch.title}", logrando un impacto comprobado de: **${topMatch.impact}**.`;
  } else {
    answer += `Se identificaron **${matchingLogs.length} logros públicos relacionados**, incluyendo su trabajo en "${topMatch.project}" (${topMatch.client}) donde logró: **${topMatch.impact}**.`;
  }

  // Also check if any products link to these matching logs
  const linkedProds = safeProducts.filter((p) => p.relatedAchievementIds?.includes(topMatch.id));
  if (linkedProds.length > 0) {
    answer += `\n\n🚀 Este logro está vinculado al producto: **${linkedProds[0].title}** (${linkedProds[0].tagline}).`;
  }

  return {
    message: answer,
    citedLogs: matchingLogs.slice(0, 3),
    citedProducts: linkedProds.slice(0, 1),
    suggestedFollowUps: [
      `¿Qué otras tecnologías se utilizaron en ${topMatch.project}?`,
      "Muestra otros logros de arquitectura",
      "¿Qué productos propios tiene en el showcase?",
    ],
  };
};
