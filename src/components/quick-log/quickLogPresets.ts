import { LogCategory, PresetTemplate } from "../../types";

export const DEFAULT_TECH_CATEGORIES: LogCategory[] = [
  "Feature ✨",
  "Fix 🐛",
  "Refactor 🧹",
  "Architecture 🏗️",
  "Infra/DevOps 🚀",
  "Spike/R&D 🔬",
];

export const DEFAULT_MARKETING_CATEGORIES: LogCategory[] = [
  "Campaña / Growth 📈",
  "Conversión & Funnel 🎯",
  "Contenido & SEO ✍️",
  "Branding & Eventos 🎨",
  "Lanzamiento 🚀",
];

export const DEFAULT_BUSINESS_CATEGORIES: LogCategory[] = [
  "Diseño & UX 🖌️",
  "Estrategia & Liderazgo 👥",
  "Ventas & Revenue 💰",
  "Operaciones & Proceso ⚙️",
  "Alianzas & Partners 🤝",
];

export const QUICK_LOG_PRESETS: PresetTemplate[] = [
  // --- INGENIERÍA & DESARROLLO ---
  {
    name: "Incidente P0 / Bug Crítico (Tech)",
    category: "Fix 🐛",
    title: "Resolución de fallo crítico de concurrencia en producción",
    whatWasSought:
      "Garantizar consistencia transaccional y eliminar la degradación del servicio bajo alta concurrencia.",
    whyImportant:
      "El error provocaba bloqueos en pasarela transaccional con riesgo inminente de penalización económica y fuga de usuarios.",
    howApplied:
      "Implementación de cerrojo distribuido en Redis, reconciliación asíncrona de estado y validación con pruebas de carga k6.",
    description:
      "Identificación de condición de carrera bajo alta carga. Implementación de cerrojo distribuido y reconciliación de estado.",
    impact: "Recuperación de servicio en <15 min; cero pérdida de datos transaccionales",
    tags: ["#BugFix", "#P0", "#Concurrencia", "#HighAvailability"],
  },
  {
    name: "Decisión de Arquitectura (Tech)",
    category: "Architecture 🏗️",
    title: "Transición a arquitectura orientada a eventos desacoplada",
    whatWasSought:
      "Desacoplar servicios centrales para permitir despliegues independientes y escalar el procesamiento sin bloqueos.",
    whyImportant:
      "Las llamadas síncronas bloqueantes generaban cascadas de fallos en servicios aguas abajo en horas de alto tráfico.",
    howApplied:
      "Diseño de patrón orquestador / saga con garantías de idempotencia y particionado de tópicos en bus de eventos.",
    description:
      "Diseño de patrón orquestador / saga con garantías de idempotencia para sustituir llamadas síncronas bloqueantes.",
    impact: "Reducción de latencia p99 en 80% y desacoplamiento de 4 microservicios",
    tags: ["#Architecture", "#EventDriven", "#Microservices", "#Escalabilidad"],
  },
  {
    name: "Optimización de Rendimiento (Tech)",
    category: "Refactor 🧹",
    title: "Optimización de consultas de base de datos y estrategia de caché multinivel",
    whatWasSought:
      "Acelerar los tiempos de respuesta del dashboard para soportar analítica interactiva sin sobrecargar el cluster relacional.",
    whyImportant:
      "Los usuarios experimentaban timeouts de más de 5 segundos, degradando la adopción de la herramienta de reporte.",
    howApplied:
      "Reestructuración de consultas complejas, índices compuestos y caché reactiva L1/L2 con invalidación granular.",
    description:
      "Creación de índices compuestos, optimización de queries complejas y cacheo en Redis con invalidación reactiva.",
    impact: "Disminución del tiempo de respuesta de 2.4s a 110ms y -40% de carga en CPU",
    tags: ["#Performance", "#Redis", "#Database", "#Latency"],
  },
  // --- MARKETING & GROWTH ---
  {
    name: "Campaña de Growth / Adquisición (Marketing)",
    category: "Campaña / Growth 📈",
    title: "Lanzamiento de campaña multicanal reduciendo el CAC en un 32%",
    whatWasSought:
      "Aumentar el volumen de leads calificados para el lanzamiento del nuevo producto sin exceder el presupuesto publicitario.",
    whyImportant:
      "El costo de adquisición previo de $180 USD limitaba la rentabilidad y el crecimiento del negocio en nuevos mercados.",
    howApplied:
      "Estrategia de segmentación en Google y LinkedIn Ads, optimización de landing pages de conversión y automatización de nutrición por email.",
    description:
      "Diseño de funnel de conversión, segmentación de audiencias B2B y pruebas A/B en llamadas a la acción.",
    impact: "+1,400 leads calificados en 60 días y reducción del CAC de $180 a $122 USD (-32%)",
    tags: ["#Growth", "#PaidMedia", "#CAC", "#LeadGen", "#Marketing"],
  },
  {
    name: "Estrategia de Contenido & SEO (Marketing)",
    category: "Contenido & SEO ✍️",
    title: "Estrategia de marketing de contenidos triplicando el tráfico orgánico",
    whatWasSought:
      "Posicionar la marca en los primeros lugares de búsqueda para palabras clave de alta intención de compra.",
    whyImportant:
      "La dependencia casi total de anuncios de pago aumentaba el costo por adquisición mes a mes.",
    howApplied:
      "Investigación de palabras clave con Semrush, producción de 24 artículos técnicos en profundidad y link building estratégico.",
    description:
      "Auditoría SEO on-page, optimización de arquitectura de información y creación de guías de referencia de la industria.",
    impact: "+210% de tráfico orgánico en 6 meses y 380 demos agendadas atribuidas a SEO",
    tags: ["#SEO", "#ContentMarketing", "#Inbound", "#OrganicTraffic"],
  },
  // --- PRODUCTO & DISEÑO ---
  {
    name: "Rediseño de Experiencia / UX (Producto)",
    category: "Diseño & UX 🖌️",
    title: "Rediseño integral del flujo de onboarding elevando la tasa de activación al 68%",
    whatWasSought:
      "Eliminar puntos de fricción y abandono de usuarios en los primeros 5 minutos de uso de la plataforma.",
    whyImportant:
      "Más del 55% de los usuarios registrados abandonaban la plataforma antes de completar su primera acción clave.",
    howApplied:
      "Mapeo de mapas de calor, entrevistas de usuario y prototipado rápido en Figma con validación iterativa de usabilidad.",
    description:
      "Investigación cualitativa, simplificación de 7 a 3 pasos en el wizard de bienvenida y microinteracciones de guía.",
    impact:
      "Aumento de la tasa de activación del 45% al 68% y reducción de tickets de soporte en un 40%",
    tags: ["#ProductDesign", "#UXUI", "#Figma", "#Onboarding", "#Retention"],
  },
  // --- VENTAS & NEGOCIO ---
  {
    name: "Estrategia Comercial / Ventas (Negocio)",
    category: "Ventas & Revenue 💰",
    title: "Negociación y cierre de acuerdos corporativos incrementando el ARR en $450K",
    whatWasSought:
      "Expandir la penetración en cuentas empresariales del sector financiero y salud.",
    whyImportant:
      "Las ventas previas dependían de contratos pequeños con alto costo operativo y ciclo de vida corto.",
    howApplied:
      "Diseño de propuesta de valor institucional, demostraciones personalizadas y negociación de contratos plurianuales.",
    description:
      "Prospección outbound B2B, pitch decks a directores ejecutivos y cierre legal de contratos marco.",
    impact: "Firma de 5 cuentas enterprise sumando $450K USD de nuevo ARR en 2 trimestres",
    tags: ["#Sales", "#Enterprise", "#ARR", "#B2B", "#Negotiation"],
  },
];

export function buildBulletPrefill(
  bulletText: string,
  expCompany: string,
  technologies?: string[]
) {
  const cleanText = bulletText.trim();
  const hasTechs = Array.isArray(technologies) && technologies.length > 0;
  return {
    title: cleanText,
    description: cleanText,
    whatWasSought: `Entrega y despliegue de capacidades vinculadas a: ${cleanText.slice(0, 100)}`,
    whyImportant: `Alineado con los objetivos de ${expCompany}.`,
    howApplied: hasTechs ? `Implementado con ${technologies!.slice(0, 5).join(", ")}.` : "",
    impact: "Entregado con éxito y métricas verificables en producción",
    tags: hasTechs
      ? technologies!.slice(0, 4).map((t) => (t.startsWith("#") ? t : `#${t.replace(/\s+/g, "")}`))
      : ["#Producción", "#Arquitectura"],
  };
}
