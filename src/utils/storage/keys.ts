import { LogEntry, UserProfile, VisitorMessage, WorkExperience } from "../../types";

export const STORAGE_KEYS = {
  LOGS: "captains_logs_v1",
  USER: "captains_user_v1",
  CUSTOM_ACCOUNTS: "goal_recall_custom_accounts_v1",
  INBOX: "captains_inbox_v1",
  PIN: "captains_pin_v1",
  CV_DATA: "captains_stored_cv_v1",
  EXPERIENCES: "captains_experiences_v1",
  AI_USAGE: "goal_recall_ai_usage_v1",
  JOB_OFFERS: "goal_recall_job_offers_v1",
  PRODUCTS: "goal_recall_products_v1",
};

export const INITIAL_EXPERIENCES: WorkExperience[] = [];
export const DEFAULT_USERS: UserProfile[] = [];
export const INITIAL_LOGS: LogEntry[] = [];
export const INITIAL_INBOX: VisitorMessage[] = [];

export const RESERVED_USERNAMES = new Set([
  "admin", "root", "api", "docs", "features", "offers", "public", "quarters",
  "login", "register", "auth", "settings", "terms", "privacy", "help",
  "explore", "user", "users", "u", "p", "deck", "demo", "null", "undefined",
  "goalrecall", "support", "billing", "dashboard", "app",
]);

export const INITIAL_USER: UserProfile = {
  id: "usr-guest",
  username: "usuario",
  name: "Usuario",
  email: "",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  title: "",
  bio: "",
  location: "",
  github: "",
  linkedin: "",
  skills: [],
  authProvider: "custom",
  isDemoUser: false,
  isCustom: true,
  createdAt: Date.now(),
};

export const DUMMY_LOG_IDS = new Set([
  "log-001", "log-002", "log-003", "log-004", "log-005", "log-006", "log-007",
]);

export const DUMMY_EXP_IDS = new Set([
  "exp-meli", "exp-stripe", "exp-clientx", "exp-core",
]);
