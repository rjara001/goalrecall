import { LogEntry, UserProfile } from "../types";

export interface FirstMateResponse {
  message: string;
  citedLogs: LogEntry[];
  suggestedFollowUps: string[];
}

export const SUGGESTED_QUERIES = [
  "¿Qué experiencia tiene con Redis y alta concurrencia?",
  "Muestra proyectos y logros con React y TypeScript",
  "¿Cuáles han sido sus mayores victorias de rendimiento y latencia?",
  "Cuéntame sobre sus proyectos de arquitectura distribuida",
  "¿Tiene experiencia con infraestructura y observabilidad?",
];

/**
 * Strict First Mate query handler.
 * GUARANTEE: Never accesses or returns logs where isPublic !== true.
 */
export const queryFirstMate = (
  userQuery: string,
  publicLogs: LogEntry[],
  userProfile: UserProfile
): FirstMateResponse => {
  // Ensure strict isolation filter at runtime
  const safeLogs = publicLogs.filter((l) => l.isPublic);

  const query = userQuery.toLowerCase().trim();

  if (!query) {
    return {
      message: `¡Hola! Soy First Mate, el asistente técnico de ${userProfile.name}. Puedo responder tus preguntas sobre sus proyectos verificados, tecnologías y métricas de impacto públicas. ¿Qué te gustaría consultar?`,
      citedLogs: safeLogs.slice(0, 2),
      suggestedFollowUps: SUGGESTED_QUERIES.slice(0, 3),
    };
  }

  // Check for greetings
  if (/^(hola|buenas|hi|hello|hey|saludos)/i.test(query) && query.length < 15) {
    return {
      message: `¡Saludos! Soy First Mate. Estoy listo para asistirte con la trayectoria técnica de ${userProfile.name}. Cuento con acceso a ${safeLogs.length} logros públicos verificados. Puedes preguntarme sobre tecnologías específicas, arquitectura o reducciones de latencia.`,
      citedLogs: safeLogs.slice(0, 2),
      suggestedFollowUps: SUGGESTED_QUERIES.slice(0, 3),
    };
  }

  // Tokenize query words
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

  const matchingResults = scoredLogs
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.log);

  if (matchingResults.length === 0) {
    return {
      message: `He revisado la bitácora pública de ${userProfile.name} y no encontré un registro público explícito sobre "${userQuery}".\n\nTen en cuenta que ${userProfile.name} cuenta con registros adicionales protegidos en su Sandbox Privado por motivos de confidencialidad de clientes.\n\nSi deseas consultar sobre este tema específico, te invito a dejarle un recado en el formulario de abajo y te responderá directamente.`,
      citedLogs: [],
      suggestedFollowUps: [
        "¿Cuáles son sus mayores victorias de rendimiento?",
        "Muestra proyectos con React y TypeScript",
        "Dejar un recado para el Capitán",
      ],
    };
  }

  // Construct helpful answer
  const topMatch = matchingResults[0];
  let answer = `Sí, ${userProfile.name} cuenta con sólida experiencia verificada en esa área. `;

  if (matchingResults.length === 1) {
    answer += `En el proyecto "${topMatch.project}" (${topMatch.client}), lideró: "${topMatch.title}", logrando un impacto comprobado de: **${topMatch.impact}**.`;
  } else {
    answer += `Se identificaron **${matchingResults.length} logros públicos relacionados**, incluyendo su trabajo en "${topMatch.project}" (${topMatch.client}) donde logró: **${topMatch.impact}**.`;
  }

  return {
    message: answer,
    citedLogs: matchingResults.slice(0, 3),
    suggestedFollowUps: [
      `¿Qué otras tecnologías se utilizaron en ${topMatch.project}?`,
      "Muestra otros logros de arquitectura",
      "Dejar un mensaje de contacto",
    ],
  };
};
