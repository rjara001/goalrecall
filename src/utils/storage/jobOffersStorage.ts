import { JobOffer } from "../../types";
import { notifyCloudSync, workspaceState } from "./workspaceState";

export const INITIAL_JOB_OFFERS: JobOffer[] = [
  {
    id: "offer-sample-stripe",
    company: "Stripe",
    role: "Staff Backend / Infrastructure Engineer",
    location: "Remoto (Global / LatAm & US)",
    modality: "100% Remoto",
    contractType: "B2B / Contractor",
    salaryExpectation: {
      min: 8000,
      max: 11000,
      currency: "USD",
      period: "mensual",
    },
    extraConditions:
      "MacBook Pro M3 Max, $2,000 USD estipendio anual para home-office, 25 días hábiles libres y seguro internacional.",
    status: "saved",
    description: `Buscamos un Ingeniero Backend Senior o Staff para liderar la arquitectura de procesamiento de pagos de alta concurrencia.
Requisitos:
- Experiencia sólida en sistemas distribuidos de alto volumen (Redis, Kafka, colas RabbitMQ/SQS).
- Optimización de latencias p99 y tolerancia a fallos en producción.
- Experiencia con microservicios en Node.js, Go o Rust, con bases de datos PostgreSQL o DynamoDB.
- Habilidad comprobada para formular soluciones técnicas con impacto medible en el negocio (Google XYZ).
- Capacidad para liderar revisiones de diseño arquitectónico y mentorear ingenieros.`,
    atsAnalysis: {
      score: 92,
      matchedKeywords: [
        "Sistemas distribuidos",
        "Redis",
        "Latencia p99",
        "Microservicios",
        "PostgreSQL",
        "RabbitMQ",
        "Tolerancia a fallos",
      ],
      missingKeywords: ["Go / Golang", "Kafka", "DynamoDB"],
      recommendations: [
        "Prioriza logros relacionados con reducción de latencias y escalamiento en microservicios.",
        "Destaca la fórmula Google XYZ en viñetas de pagos y arquitectura distribuida.",
        "Menciona tu experiencia resolviendo incidentes críticos bajo presión en el bloque STAR.",
      ],
      keyRequirements: [
        "Arquitectura de pagos de alta concurrencia",
        "Monitoreo con Datadog / Prometheus",
        "Diseño de sagas asíncronas sin transacciones duplicadas",
      ],
    },
    tailoredCv: {
      headline: "Staff Distributed Systems & Infrastructure Engineer",
      targetSummary:
        "Ingeniero de infraestructura y sistemas distribuidos con comprobada experiencia liderando arquitecturas críticas de pagos y microservicios. Especialista en reducción de latencia p99, caching distribuido de alta disponibilidad y optimización de costos en cloud.",
      selectedLogIds: [],
      selectedExperienceIds: [],
      highlightedSkills: [
        "Redis Cluster",
        "PostgreSQL",
        "RabbitMQ",
        "Microservicios",
        "Prometheus",
        "Node.js",
      ],
    },
    interviewPrep: {
      cheatSheet: [
        "Punto clave: Enfatizar reducción de latencias p99 de 3.2s a 240ms en Black Friday.",
        "Arquitectura: Detallar el patrón de saga asíncrona implementado sobre Redis para evitar pagos duplicados.",
        "Trade-offs: Discutir consistencia eventual vs. consistencia estricta en el decremento de inventario.",
        "Liderazgo: Mencionar cómo se documentaron los ADRs (Architecture Decision Records) para alinear al equipo.",
      ],
      frequentQuestions: [
        {
          question:
            "¿Cómo manejas la idempotencia y las transacciones duplicadas en un sistema de pagos bajo picos de tráfico?",
          focus: "Arquitectura & Resiliencia",
          suggestedStrategy:
            "Explicar el uso de tokens únicos de idempotencia cacheados en Redis con TTL estricto y bloqueos distribuidos (Redlock) antes de procesar el pago.",
        },
        {
          question:
            "Cuéntame de una ocasión en que tuviste que diagnosticar una degradación de latencia p99 en producción.",
          focus: "Resolución de Incidentes (STAR)",
          suggestedStrategy:
            "Usar la estructura STAR: Situación con degradación en horas punta, Tarea de no afectar la tasa de conversión, Acción con flamegraphs y perfilado de queries lentas, y Resultado con mejora porcentual verificada.",
        },
        {
          question: "¿Cómo justificas los trade-offs económicos al escalar infraestructura en la nube?",
          focus: "Visión de Negocio & Costos",
          suggestedStrategy:
            "Explicar cómo optimizar queries y consolidar instancias redujo el costo mensual antes de solicitar más computación a ciegas.",
        },
      ],
    },
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

export const getStoredJobOffers = (): JobOffer[] => {
  return workspaceState.jobOffers;
};

export const saveJobOffers = (offers: JobOffer[]): void => {
  workspaceState.jobOffers = offers;
  notifyCloudSync();
};

export const addJobOffer = (
  offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">
): JobOffer => {
  const current = getStoredJobOffers();
  const newOffer: JobOffer = {
    ...offer,
    id: `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveJobOffers([newOffer, ...current]);
  return newOffer;
};

export const updateJobOffer = (updated: JobOffer): void => {
  saveJobOffers(
    getStoredJobOffers().map((o) =>
      o.id === updated.id ? { ...updated, updatedAt: Date.now() } : o
    )
  );
};

export const deleteJobOffer = (id: string): void => {
  saveJobOffers(getStoredJobOffers().filter((o) => o.id !== id));
};
