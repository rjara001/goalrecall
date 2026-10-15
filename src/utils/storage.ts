import { LogEntry, UserProfile, VisitorMessage } from "../types";

const STORAGE_KEYS = {
  LOGS: "captains_logs_v1",
  USER: "captains_user_v1",
  INBOX: "captains_inbox_v1",
  PIN: "captains_pin_v1",
};

export const INITIAL_USER: UserProfile = {
  id: "captain-001",
  name: "Alex Rivera",
  email: "alex.rivera.dev@gmail.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  title: "Senior Full-Stack & Systems Architect",
  bio: "10+ years architecting high-throughput distributed systems, real-time web applications, and resilient cloud infrastructure. Passionate about zero-downtime migrations, developer velocity, and measurable business outcomes.",
  location: "Madrid, Spain / Remote",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  skills: [
    { name: "TypeScript / Node.js", category: "Languages" },
    { name: "Go & Rust", category: "Languages" },
    { name: "React 19 & Next.js", category: "Frameworks" },
    { name: "Tailwind CSS", category: "Frameworks" },
    { name: "PostgreSQL & Redis", category: "Cloud/DevOps" },
    { name: "Docker & Kubernetes", category: "Cloud/DevOps" },
    { name: "AWS & GCP Cloud", category: "Cloud/DevOps" },
    { name: "Event-Driven & Microservices", category: "Architecture" },
    { name: "High-Availability Systems", category: "Architecture" },
  ],
  isDemoUser: true,
};

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-001",
    date: "2026-10-12",
    client: "ClientX",
    project: "Checkout Revamp",
    category: "Architecture 🏗️",
    title: "Migrated checkout payment flow from synchronous REST to asynchronous saga",
    description: "Designed distributed saga orchestrator using Redis Streams and Postgres idempotency keys. Replaced blocking 3rd-party gateway roundtrips with optimistic reservation and background reconciliation.",
    impact: "Cut checkout p99 latency from 3.2s to 240ms (-92%) and reduced cart abandonment by 14.8%",
    tags: ["#Architecture", "#Redis", "#PostgreSQL", "#PaymentGateway"],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "log-002",
    date: "2026-10-10",
    client: "ClientX",
    project: "Checkout Revamp",
    category: "Fix 🐛",
    title: "Resolved distributed race condition in inventory decrement during flash sales",
    description: "Identified phantom stock oversell bug occurring under 15,000 req/sec spikes. Replaced naive row-level locks with Redis atomic Lua scripts and optimistic ledger verification.",
    impact: "Eliminated 100% of overselling incidents ($42k saved in manual refund overhead during Black Friday)",
    tags: ["#BugFix", "#Concurrency", "#Lua", "#HighThroughput"],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: "log-003",
    date: "2026-10-06",
    client: "Internal Core",
    project: "Platform Observability",
    category: "Infra/DevOps 🚀",
    title: "Implemented OpenTelemetry distributed tracing and unified Grafana dashboard",
    description: "Instrumented Node.js microservices with OpenTelemetry SDK and collector. Configured automated alert thresholds for p95 latency anomalies and error rate degradation.",
    impact: "Reduced Mean Time To Detection (MTTD) from 45 min to under 3 min across 18 microservices",
    tags: ["#DevOps", "#OpenTelemetry", "#Grafana", "#Kubernetes"],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 8,
  },
  {
    id: "log-004",
    date: "2026-09-28",
    client: "Internal Core",
    project: "Platform Security",
    category: "Fix 🐛",
    title: "Patched critical session token replay vulnerability in internal admin proxy",
    description: "CONFIDENTIAL / INTERNAL SANDBOX: Found non-expiring JWT refresh token edge-case when users revoked 2FA devices. Implemented distributed Redis token revocation blacklist with immediate SSE revocation broadcast.",
    impact: "Closed P0 security loophole prior to external SOC2 audit compliance inspection",
    tags: ["#Security", "#JWT", "#Confidential", "#OAuth"],
    isPublic: false, // In private sandbox by default!
    createdAt: Date.now() - 86400000 * 16,
    updatedAt: Date.now() - 86400000 * 16,
  },
  {
    id: "log-005",
    date: "2026-09-18",
    client: "ClientX",
    project: "Catalog Search",
    category: "Feature ✨",
    title: "Shipped hybrid semantic & full-text search with instant autocomplete",
    description: "Built vector embedding indexing pipeline alongside Postgres pgvector and trigram search. Implemented debounced client-side cached query layer with React 19 optimistic UI.",
    impact: "Increased search-to-cart conversion rate by 22.4% and accelerated mobile search response times to 45ms",
    tags: ["#React", "#TypeScript", "#pgvector", "#SearchOptimization"],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 26,
    updatedAt: Date.now() - 86400000 * 26,
  },
  {
    id: "log-006",
    date: "2026-09-04",
    client: "ClientX",
    project: "Legacy Modernization",
    category: "Refactor 🧹",
    title: "Decomposed 14,000-line monolithic controller into clean domain modules",
    description: "Refactored legacy invoice generator using Hexagonal Architecture (Ports and Adapters). Implemented automated unit test suite increasing coverage from 28% to 94%.",
    impact: "Cut onboarding time for junior engineers on billing module from 3 weeks to 2 days; zero regression defects",
    tags: ["#CleanArchitecture", "#Refactoring", "#UnitTesting", "#DomainDrivenDesign"],
    isPublic: true,
    createdAt: Date.now() - 86400000 * 40,
    updatedAt: Date.now() - 86400000 * 40,
  },
  {
    id: "log-007",
    date: "2026-08-20",
    client: "Internal Core",
    project: "R&D AI Lab",
    category: "Spike/R&D 🔬",
    title: "Benchmarked edge-computed local LLMs for automated PR code reviews",
    description: "Evaluated latency, token costs, and accuracy of quantized models on worker nodes. Validated that local inference met strict data sovereignty requirements for private client codebases.",
    impact: "Delivered comprehensive executive spike report recommending hybrid on-prem strategy, saving projected $35k/year cloud API fees",
    tags: ["#AI", "#Research", "#CostOptimization", "#EdgeComputing"],
    isPublic: false, // Private sandbox
    createdAt: Date.now() - 86400000 * 55,
    updatedAt: Date.now() - 86400000 * 55,
  },
];

export const INITIAL_INBOX: VisitorMessage[] = [
  {
    id: "msg-001",
    name: "Elena Rostova",
    email: "elena.rostova@techfin-ventures.io",
    organization: "TechFin Ventures (London)",
    message: "Hi Alex, saw your work on the distributed checkout saga and Redis concurrency fixes. We are building a high-volume trading settlement engine and need a Staff Architect. Are you open to a 20-min intro chat?",
    date: "2026-10-13 14:20",
    read: false,
    replied: false,
  },
  {
    id: "msg-002",
    name: "Marcus Thorne",
    email: "mthorne@scalepeak.cloud",
    organization: "ScalePeak Systems",
    message: "Impressive metrics on the MTTD observability reduction. We would love to discuss a consulting advisory engagement for our Q1 Kubernetes migration.",
    date: "2026-10-09 10:15",
    read: true,
    replied: true,
  },
];

// --- Storage Utilities ---

export const getStoredLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading logs from localStorage", e);
    return INITIAL_LOGS;
  }
};

export const saveLogs = (logs: LogEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Error saving logs to localStorage", e);
  }
};

export const addLog = (
  entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">
): LogEntry => {
  const logs = getStoredLogs();
  const newLog: LogEntry = {
    ...entry,
    id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    isPublic: entry.isPublic ?? false, // Defaults to Sandbox Privado
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const updated = [newLog, ...logs];
  saveLogs(updated);
  return newLog;
};

export const updateLog = (updatedEntry: LogEntry): void => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === updatedEntry.id);
  if (index !== -1) {
    logs[index] = { ...updatedEntry, updatedAt: Date.now() };
    saveLogs(logs);
  }
};

export const toggleLogPublic = (id: string): LogEntry | null => {
  const logs = getStoredLogs();
  const index = logs.findIndex((l) => l.id === id);
  if (index !== -1) {
    logs[index] = {
      ...logs[index],
      isPublic: !logs[index].isPublic,
      updatedAt: Date.now(),
    };
    saveLogs(logs);
    return logs[index];
  }
  return null;
};

export const deleteLog = (id: string): void => {
  const logs = getStoredLogs();
  const filtered = logs.filter((l) => l.id !== id);
  saveLogs(filtered);
};

// --- User Profile Utilities ---

export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USER;
  }
};

export const saveUser = (user: UserProfile | null): void => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
};

// --- Inbox Utilities ---

export const getStoredInbox = (): VisitorMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INBOX);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(INITIAL_INBOX));
      return INITIAL_INBOX;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INBOX;
  }
};

export const saveInbox = (messages: VisitorMessage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(messages));
  } catch (e) {
    console.error("Error saving inbox messages", e);
  }
};

export const addVisitorMessage = (
  msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied">
): VisitorMessage => {
  const current = getStoredInbox();
  const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  const newMsg: VisitorMessage = {
    ...msg,
    id: "msg-" + Date.now(),
    date: dateStr,
    read: false,
    replied: false,
  };
  saveInbox([newMsg, ...current]);
  return newMsg;
};

export const markMessageRead = (id: string): void => {
  const current = getStoredInbox();
  const updated = current.map((m) => (m.id === id ? { ...m, read: true } : m));
  saveInbox(updated);
};

export const deleteMessage = (id: string): void => {
  const current = getStoredInbox();
  saveInbox(current.filter((m) => m.id !== id));
};

// --- Backup & Restore ---

export const exportBackupJson = (): string => {
  const payload = {
    version: "captains_log_v1",
    exportedAt: new Date().toISOString(),
    user: getStoredUser(),
    logs: getStoredLogs(),
    inbox: getStoredInbox(),
  };
  return JSON.stringify(payload, null, 2);
};

export const importBackupJson = (
  jsonString: string
): { success: boolean; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.logs)) {
      return {
        success: false,
        count: 0,
        error: "Formato de archivo no válido: no se encontró la lista de logs.",
      };
    }

    saveLogs(parsed.logs);
    if (parsed.user) saveUser(parsed.user);
    if (Array.isArray(parsed.inbox)) saveInbox(parsed.inbox);

    return { success: true, count: parsed.logs.length };
  } catch (e: any) {
    return {
      success: false,
      count: 0,
      error: e.message || "Error al analizar el archivo JSON.",
    };
  }
};

export const resetToDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
  localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(INITIAL_INBOX));
};
