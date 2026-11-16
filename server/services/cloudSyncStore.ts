import fs from "fs";
import path from "path";

export const RESERVED_USERNAMES = new Set([
  "admin", "root", "api", "docs", "features", "offers", "public", "quarters",
  "login", "register", "auth", "settings", "terms", "privacy", "help",
  "explore", "user", "users", "u", "p", "deck", "demo", "null", "undefined",
  "goalrecall", "support", "billing", "dashboard", "app",
]);

export interface CloudSyncRecord {
  userKey: string;
  updatedAt: number;
  payload: Record<string, any>;
}

export function createCloudSyncStore(
  baseDir: string = path.resolve(process.cwd(), "data", "cloud_sync")
) {
  const ensureDir = () => {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  };

  const usernameIndexFile = path.resolve(baseDir, "username_index.json");

  const getSyncFilePath = (userKey: string): string => {
    const safeKey = userKey.replace(/[^a-zA-Z0-9@._-]/g, "_");
    return path.resolve(baseDir, `user_${safeKey}.json`);
  };

  const getUsernameIndex = (): Record<string, string> => {
    try {
      if (fs.existsSync(usernameIndexFile)) {
        return JSON.parse(fs.readFileSync(usernameIndexFile, "utf-8"));
      }
    } catch (err) {
      console.warn("Could not read username_index.json:", err);
    }
    return {};
  };

  const setUsernameIndex = (username: string, userKey: string): void => {
    try {
      ensureDir();
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) return;
      const index = getUsernameIndex();
      index[cleanUsername] = userKey;
      fs.writeFileSync(usernameIndexFile, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write username_index.json:", err);
    }
  };

  const removeUsernameFromIndex = (username: string): void => {
    try {
      ensureDir();
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) return;
      const index = getUsernameIndex();
      delete index[cleanUsername];
      fs.writeFileSync(usernameIndexFile, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not update username_index.json:", err);
    }
  };

  const generateUsernameSuggestions = (
    username: string,
    existingIndex: Record<string, string>
  ): string[] => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const base = clean || "user";
    const candidates = [
      `${base}001`,
      `${base}01`,
      `${base}1`,
      `${base}_dev`,
      `${base}_pro`,
      `${base}_tech`,
      `${base}${new Date().getFullYear()}`,
    ];
    return candidates
      .filter((c) => !RESERVED_USERNAMES.has(c) && !existingIndex[c])
      .slice(0, 3);
  };

  const readRecord = (userKey: string): CloudSyncRecord | null => {
    const filePath = getSyncFilePath(userKey);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as CloudSyncRecord;
  };

  const writeRecord = (record: CloudSyncRecord): void => {
    ensureDir();
    const filePath = getSyncFilePath(record.userKey);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
  };

  const listSyncFiles = (): string[] => {
    if (!fs.existsSync(baseDir)) return [];
    return fs.readdirSync(baseDir).filter((f) => f.startsWith("user_") && f.endsWith(".json"));
  };

  const findUserKeyByIdentifier = (cleanIdentifier: string): string | undefined => {
    const index = getUsernameIndex();
    if (index[cleanIdentifier]) return index[cleanIdentifier];

    for (const file of listSyncFiles()) {
      try {
        const content = JSON.parse(
          fs.readFileSync(path.resolve(baseDir, file), "utf-8")
        ) as CloudSyncRecord;
        const user = content?.payload?.user;
        const uUsername = (user?.username || "").toLowerCase();
        const uEmailPrefix = (user?.email || "").split("@")[0].toLowerCase();
        const uId = (user?.id || "").toLowerCase();

        if (
          uUsername === cleanIdentifier ||
          uEmailPrefix === cleanIdentifier ||
          uId === cleanIdentifier ||
          (content.userKey || "").toLowerCase() === cleanIdentifier
        ) {
          if (user?.username) {
            setUsernameIndex(user.username, content.userKey);
          }
          return content.userKey;
        }
      } catch {
        // ignore single corrupt sync file
      }
    }
    return undefined;
  };

  const deleteShowcaseByUsername = (cleanUsername: string): void => {
    removeUsernameFromIndex(cleanUsername);
    for (const file of listSyncFiles()) {
      try {
        const fullPath = path.resolve(baseDir, file);
        const content = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as CloudSyncRecord;
        const uUsername = (content?.payload?.user?.username || "").toLowerCase();
        if (uUsername === cleanUsername) {
          fs.unlinkSync(fullPath);
          break;
        }
      } catch {
        // ignore
      }
    }
  };

  return {
    baseDir,
    getSyncFilePath,
    getUsernameIndex,
    setUsernameIndex,
    removeUsernameFromIndex,
    generateUsernameSuggestions,
    readRecord,
    writeRecord,
    listSyncFiles,
    findUserKeyByIdentifier,
    deleteShowcaseByUsername,
  };
}

export type CloudSyncStore = ReturnType<typeof createCloudSyncStore>;
export const defaultCloudSyncStore = createCloudSyncStore();
