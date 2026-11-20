import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  WriteBatch,
} from "firebase/firestore";
import { User as FirebaseAuthUser } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  AiUsageRecord,
  CareerGoal,
  CareerGoalStatus,
  ExtractedCvData,
  JobOffer,
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
  VisitorMessage,
  WorkExperience,
} from "../../types";
import { handleFirestoreError, OperationType } from "./errors";
import {
  buildAiQuotaCreatePayload,
  buildAiQuotaUpdatePayload,
  buildCareerGoalCreatePayload,
  buildCareerGoalUpdatePayload,
  buildCertificationCreatePayload,
  buildCertificationUpdatePayload,
  buildInboxMessageCreatePayload,
  buildInboxMessageUpdatePayload,
  buildJobOfferCreatePayload,
  buildJobOfferUpdatePayload,
  buildLogEntryCreatePayload,
  buildLogEntryUpdatePayload,
  buildLogMetadataUpdatePayload,
  buildLogSortOrderUpdatePayload,
  buildProductCreatePayload,
  buildProductUpdatePayload,
  buildProWaitlistPayload,
  buildPublicShowcaseCreatePayload,
  buildPublicShowcaseUpdatePayload,
  buildStoredCvCreatePayload,
  buildStoredCvUpdatePayload,
  buildUserProfileCreatePayload,
  buildUserProfileUpdatePayload,
  buildWorkExperienceCreatePayload,
  buildWorkExperienceUpdatePayload,
  docToAiQuota,
  docToCareerGoal,
  docToCertification,
  docToInboxMessage,
  docToJobOffer,
  docToLogEntry,
  docToProduct,
  docToStoredCv,
  docToUserProfile,
  docToWorkExperience,
  generateDefaultUsernameHandle,
  isValidUsernameHandle,
  RESERVED_USERNAMES,
  sanitizeDocId,
  sanitizeUsernameHandle,
} from "./sanitizer";
import {
  compareLogEntriesByOrder,
  inferCategoryForSavedExperienceBullet,
} from "../bulletToLogMapper";

export interface ExperienceProjectionSync {
  experience: WorkExperience;
  bullets: string[];
}

export interface FirestoreWorkspaceData {
  user: UserProfile;
  cv: ExtractedCvData | null;
  experiences: WorkExperience[];
  logs: LogEntry[];
  inbox: VisitorMessage[];
  jobOffers: JobOffer[];
  products: Product[];
  certifications: TechnicalCertification[];
  careerGoals: CareerGoal[];
  aiQuota: AiUsageRecord | null;
}

export interface PublicShowcaseData {
  username: string;
  ownerId: string;
  userProfile: UserProfile;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
}

function getDbOrThrow() {
  if (!db) {
    throw new Error("Firestore no está inicializado en este entorno.");
  }
  return db;
}

export function requireVerifiedUid(expectedUid?: string): string {
  const current = auth?.currentUser;
  if (!current) {
    throw new Error("auth_required: Debes iniciar sesión con Google para continuar.");
  }
  if (!current.emailVerified) {
    throw new Error("email_not_verified: Tu cuenta de Google debe tener el correo verificado.");
  }
  if (expectedUid && expectedUid !== current.uid) {
    throw new Error("auth_mismatch: La sesión activa no coincide con el propietario del recurso.");
  }
  return current.uid;
}

async function listUserSubcollection<T>(
  uid: string,
  subcollectionName: string,
  mapper: (raw: Record<string, unknown>, id: string) => T
): Promise<T[]> {
  const firestore = getDbOrThrow();
  const path = `users/${uid}/${subcollectionName}`;
  try {
    const q = query(
      collection(firestore, "users", uid, subcollectionName),
      where("userId", "==", uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapper(d.data() as Record<string, unknown>, d.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

function buildInitialProfileFromAuth(fbUser: FirebaseAuthUser): UserProfile {
  const name = fbUser.displayName?.trim() || "Profesional Técnico";
  const email = fbUser.email?.trim() || "usuario@goalrecall.app";
  return {
    id: fbUser.uid,
    username: generateDefaultUsernameHandle(name, email),
    name,
    email,
    avatar:
      fbUser.photoURL ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "",
    bio: "",
    location: "",
    skills: [],
    authProvider: "google",
    plan: "free",
    createdAt: Date.now(),
  };
}

export async function ensureUserProfileDoc(
  fbUser: FirebaseAuthUser
): Promise<UserProfile> {
  const firestore = getDbOrThrow();
  const uid = fbUser.uid;
  const path = `users/${uid}`;
  const userRef = doc(firestore, "users", uid);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    return docToUserProfile(snap.data() as Record<string, unknown>, uid);
  }

  const initial = buildInitialProfileFromAuth(fbUser);
  const createPayload = buildUserProfileCreatePayload(initial, uid);
  try {
    await setDoc(userRef, createPayload);
    return initial;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveUserProfileFirestore(
  profile: UserProfile
): Promise<UserProfile> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid(profile.id);
  const path = `users/${uid}`;
  const userRef = doc(firestore, "users", uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  try {
    if (existingSnap.exists()) {
      await updateDoc(userRef, buildUserProfileUpdatePayload(profile, uid));
      const existingData = docToUserProfile(
        existingSnap.data() as Record<string, unknown>,
        uid
      );
      return {
        ...existingData,
        ...profile,
        id: uid,
        authProvider: "google",
        plan: existingData.plan || "free",
      };
    } else {
      await setDoc(userRef, buildUserProfileCreatePayload(profile, uid));
      return {
        ...profile,
        id: uid,
        authProvider: "google",
        plan: "free",
      };
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existingSnap.exists() ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function loadWorkspaceFromFirestore(
  fbUser: FirebaseAuthUser
): Promise<FirestoreWorkspaceData> {
  const firestore = getDbOrThrow();
  const uid = fbUser.uid;

  const user = await ensureUserProfileDoc(fbUser);

  const cvPath = `users/${uid}/cv/current`;
  const quotaPath = `users/${uid}/quotas/ai`;

  const [
    cvSnap,
    quotaSnap,
    experiences,
    logs,
    inbox,
    jobOffers,
    products,
    certifications,
    careerGoals,
  ] = await Promise.all([
    getDoc(doc(firestore, "users", uid, "cv", "current")).catch((err) =>
      handleFirestoreError(err, OperationType.GET, cvPath)
    ),
    getDoc(doc(firestore, "users", uid, "quotas", "ai")).catch((err) =>
      handleFirestoreError(err, OperationType.GET, quotaPath)
    ),
    listUserSubcollection(uid, "experiences", docToWorkExperience),
    listUserSubcollection(uid, "logs", docToLogEntry),
    listUserSubcollection(uid, "inbox", docToInboxMessage),
    listUserSubcollection(uid, "offers", docToJobOffer),
    listUserSubcollection(uid, "products", docToProduct),
    listUserSubcollection(uid, "certifications", docToCertification),
    listUserSubcollection(uid, "careerGoals", docToCareerGoal),
  ]);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  logs.sort(compareLogEntriesByOrder);
  experiences.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  certifications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  careerGoals.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  jobOffers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  products.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  inbox.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  return {
    user,
    cv: cvSnap.exists()
      ? docToStoredCv(cvSnap.data() as Record<string, unknown>)
      : null,
    experiences,
    logs,
    inbox,
    jobOffers,
    products,
    certifications,
    careerGoals,
    aiQuota: quotaSnap.exists()
      ? docToAiQuota(quotaSnap.data() as Record<string, unknown>, monthKey)
      : null,
  };
}

// ---------------------------------------------------------------------------
// Atomic CV + Profile + Experiences + Logs Save Batch
// ---------------------------------------------------------------------------
export async function saveCvAndApplyBatchFirestore(params: {
  cvData: ExtractedCvData;
  currentUser?: UserProfile | null;
  updatedUser: UserProfile | null;
  updatedExperiences: WorkExperience[];
  newLogs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[];
}): Promise<{
  savedUser: UserProfile | null;
  savedExperiences: WorkExperience[];
  savedLogs: LogEntry[];
}> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const userPath = `users/${uid}`;
  const cvPath = `users/${uid}/cv/current`;

  const userRef = doc(firestore, "users", uid);
  const cvRef = doc(firestore, "users", uid, "cv", "current");

  let userSnap;
  let cvSnap;
  let existingExpsSnap;
  try {
    [userSnap, cvSnap, existingExpsSnap] = await Promise.all([
      getDoc(userRef),
      getDoc(cvRef),
      getDocs(query(collection(firestore, "users", uid, "experiences"), where("userId", "==", uid))),
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, cvPath);
  }

  const existingExpIds = new Set(existingExpsSnap.docs.map((d) => d.id));
  const batch: WriteBatch = writeBatch(firestore);
  const now = Date.now();

  let savedUser: UserProfile | null = params.updatedUser || params.currentUser || null;
  if (!userSnap.exists()) {
    const fbUser = auth?.currentUser;
    const baseUser =
      params.updatedUser ||
      params.currentUser ||
      (fbUser ? buildInitialProfileFromAuth(fbUser) : undefined);
    if (!baseUser) {
      throw new Error("auth_required: Perfil de usuario no disponible.");
    }
    savedUser = { ...baseUser, id: uid, authProvider: "google", plan: "free" };
    batch.set(userRef, buildUserProfileCreatePayload(savedUser, uid));
  } else if (params.updatedUser) {
    const existing = docToUserProfile(userSnap.data() as Record<string, unknown>, uid);
    savedUser = {
      ...existing,
      ...params.updatedUser,
      id: uid,
      authProvider: "google",
      plan: existing.plan || "free",
    };
    batch.update(userRef, buildUserProfileUpdatePayload(savedUser, uid));
  }

  if (cvSnap.exists()) {
    batch.update(cvRef, buildStoredCvUpdatePayload(params.cvData));
  } else {
    batch.set(cvRef, buildStoredCvCreatePayload(params.cvData, uid, "current"));
  }

  const savedExperiences: WorkExperience[] = params.updatedExperiences.map((exp, idx) => {
    const safeId = sanitizeDocId(exp.id, `exp_${now}_${idx}`);
    const normalizedExp: WorkExperience = {
      ...exp,
      id: safeId,
      userId: uid,
      createdAt: exp.createdAt || now,
      updatedAt: now,
    };
    const expRef = doc(firestore, "users", uid, "experiences", safeId);
    if (existingExpIds.has(safeId)) {
      batch.update(expRef, buildWorkExperienceUpdatePayload(normalizedExp));
    } else {
      batch.set(expRef, buildWorkExperienceCreatePayload(normalizedExp, uid, safeId));
    }
    return normalizedExp;
  });

  const savedLogs: LogEntry[] = params.newLogs.map((entry, idx) => {
    const logId = sanitizeDocId(`log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`, "log");
    const logRef = doc(firestore, "users", uid, "logs", logId);
    const materialized: LogEntry = {
      ...entry,
      id: logId,
      userId: uid,
      isPublic: Boolean(entry.isPublic),
      createdAt: now,
      updatedAt: now,
    };
    batch.set(logRef, buildLogEntryCreatePayload(materialized, uid, logId));
    return materialized;
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  return {
    savedUser,
    savedExperiences,
    savedLogs,
  };
}

// ---------------------------------------------------------------------------
// Logs CRUD (atomic bidirectional parent WorkExperience projection sync)
// ---------------------------------------------------------------------------
function appendParentSyncsToBatch(
  batch: WriteBatch,
  firestore: ReturnType<typeof getDbOrThrow>,
  uid: string,
  parentExpsToSync: ExperienceProjectionSync[] | undefined,
  now: number
) {
  if (!parentExpsToSync || parentExpsToSync.length === 0) return;
  for (const sync of parentExpsToSync) {
    const expId = sanitizeDocId(sync.experience.id, "exp");
    const nextExp: WorkExperience = {
      ...sync.experience,
      id: expId,
      userId: uid,
      bullets: sync.bullets,
      updatedAt: now,
    };
    batch.update(
      doc(firestore, "users", uid, "experiences", expId),
      buildWorkExperienceUpdatePayload(nextExp)
    );
  }
}

export async function createLogFirestore(
  entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">,
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<LogEntry> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const logId = sanitizeDocId(`log-${now}-${Math.random().toString(36).slice(2, 7)}`, "log");
  const path = `users/${uid}/logs/${logId}`;
  const fullEntry: LogEntry = {
    ...entry,
    id: logId,
    userId: uid,
    isPublic: Boolean(entry.isPublic),
    includeInCv: entry.includeInCv !== false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    if (parentExpsToSync && parentExpsToSync.length > 0) {
      const batch = writeBatch(firestore);
      batch.set(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryCreatePayload(fullEntry, uid, logId)
      );
      appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);
      await batch.commit();
    } else {
      await setDoc(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryCreatePayload(fullEntry, uid, logId)
      );
    }
    return fullEntry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLogFirestore(
  entry: LogEntry,
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<LogEntry> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const logId = sanitizeDocId(entry.id, "log");
  const path = `users/${uid}/logs/${logId}`;
  const updated: LogEntry = {
    ...entry,
    id: logId,
    userId: uid,
    includeInCv: entry.includeInCv !== false,
    updatedAt: now,
  };
  try {
    if (parentExpsToSync && parentExpsToSync.length > 0) {
      const batch = writeBatch(firestore);
      batch.update(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryUpdatePayload(updated)
      );
      appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);
      await batch.commit();
    } else {
      await updateDoc(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryUpdatePayload(updated)
      );
    }
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateLogMetadataFirestore(
  entry: LogEntry,
  updates: {
    isPublic?: boolean;
    includeInCv?: boolean;
    experienceId?: string;
    client?: string;
  },
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<LogEntry> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const logId = sanitizeDocId(entry.id, "log");
  const path = `users/${uid}/logs/${logId}`;
  const metadataPayload = buildLogMetadataUpdatePayload(updates);
  const updated: LogEntry = {
    ...entry,
    ...updates,
    id: logId,
    userId: uid,
    includeInCv:
      typeof updates.includeInCv === "boolean"
        ? updates.includeInCv
        : entry.includeInCv,
  };

  try {
    if (parentExpsToSync && parentExpsToSync.length > 0) {
      const batch = writeBatch(firestore);
      if (Object.keys(metadataPayload).length > 0) {
        batch.update(doc(firestore, "users", uid, "logs", logId), metadataPayload);
      }
      appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);
      await batch.commit();
    } else if (Object.keys(metadataPayload).length > 0) {
      await updateDoc(doc(firestore, "users", uid, "logs", logId), metadataPayload);
    }
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLogFirestore(
  logId: string,
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const safeId = sanitizeDocId(logId, "log");
  const path = `users/${uid}/logs/${safeId}`;
  try {
    if (parentExpsToSync && parentExpsToSync.length > 0) {
      const batch = writeBatch(firestore);
      batch.delete(doc(firestore, "users", uid, "logs", safeId));
      appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);
      await batch.commit();
    } else {
      await deleteDoc(doc(firestore, "users", uid, "logs", safeId));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createLogsBatchFirestore(
  entries: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[],
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<LogEntry[]> {
  if (entries.length === 0) return [];
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const batch = writeBatch(firestore);
  const created: LogEntry[] = [];

  entries.forEach((entry, idx) => {
    const logId = sanitizeDocId(`log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`, "log");
    const fullEntry: LogEntry = {
      ...entry,
      id: logId,
      userId: uid,
      isPublic: Boolean(entry.isPublic),
      includeInCv: entry.includeInCv !== false,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(
      doc(firestore, "users", uid, "logs", logId),
      buildLogEntryCreatePayload(fullEntry, uid, logId)
    );
    created.push(fullEntry);
  });

  appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);

  try {
    await batch.commit();
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/logs`);
  }
}

export async function reorderLogsBatchFirestore(
  logsToUpdate: LogEntry[],
  parentExpsToSync?: ExperienceProjectionSync[]
): Promise<LogEntry[]> {
  if (logsToUpdate.length === 0) return [];
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const batch = writeBatch(firestore);
  const persisted: LogEntry[] = [];

  logsToUpdate.forEach((entry, index) => {
    const safeId = sanitizeDocId(entry.id, "log");
    const nextSortOrder =
      typeof entry.sortOrder === "number" && Number.isFinite(entry.sortOrder)
        ? Math.max(0, Math.min(100000, Math.trunc(entry.sortOrder)))
        : index;
    const nextEntry: LogEntry = {
      ...entry,
      id: safeId,
      userId: uid,
      sortOrder: nextSortOrder,
    };
    batch.update(
      doc(firestore, "users", uid, "logs", safeId),
      buildLogSortOrderUpdatePayload(nextSortOrder)
    );
    persisted.push(nextEntry);
  });

  appendParentSyncsToBatch(batch, firestore, uid, parentExpsToSync, now);

  try {
    await batch.commit();
    return persisted;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/logs`);
  }
}

// ---------------------------------------------------------------------------
// Work Experiences CRUD (plus linked logs bidirectional update)
// ---------------------------------------------------------------------------
export async function createExperienceFirestore(
  exp: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">,
  newLogBulletsToCreate?: string[]
): Promise<{ experience: WorkExperience; createdLogs: LogEntry[] }> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const expId = sanitizeDocId(`exp-${now}-${Math.random().toString(36).slice(2, 6)}`, "exp");
  const path = `users/${uid}/experiences/${expId}`;

  const createdExp: WorkExperience = {
    ...exp,
    id: expId,
    userId: uid,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(firestore);
  batch.set(
    doc(firestore, "users", uid, "experiences", expId),
    buildWorkExperienceCreatePayload(createdExp, uid, expId)
  );

  const createdLogs: LogEntry[] = [];
  if (newLogBulletsToCreate && newLogBulletsToCreate.length > 0) {
    newLogBulletsToCreate.forEach((bullet, idx) => {
      const clean = bullet.trim();
      if (!clean) return;
      const logId = sanitizeDocId(`log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`, "log");
      const entry: LogEntry = {
        id: logId,
        userId: uid,
        experienceId: expId,
        originalBullet: clean,
        logro: clean,
        date: new Date().toISOString().substring(0, 10),
        client: createdExp.company,
        project: createdExp.role,
        category: inferCategoryForSavedExperienceBullet(clean),
        title: clean,
        impact: clean,
        description: `Registrado desde trayectoria en ${createdExp.company} (${createdExp.role}).`,
        tags: (createdExp.technologies || []).slice(0, 4).map((t) => `#${t.replace(/\s+/g, "")}`),
        isPublic: false,
        includeInCv: true,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryCreatePayload(entry, uid, logId)
      );
      createdLogs.push(entry);
    });
  }

  try {
    await batch.commit();
    return { experience: createdExp, createdLogs };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateExperienceFirestore(
  updatedExp: WorkExperience,
  logsToUpdate: LogEntry[],
  newLogBulletsToCreate?: string[],
  metadataOnlyLogs: LogEntry[] = []
): Promise<{
  experience: WorkExperience;
  updatedLogs: LogEntry[];
  createdLogs: LogEntry[];
}> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const expId = sanitizeDocId(updatedExp.id, "exp");
  const path = `users/${uid}/experiences/${expId}`;
  const now = Date.now();

  const savedExp: WorkExperience = {
    ...updatedExp,
    id: expId,
    userId: uid,
    updatedAt: now,
  };

  const batch = writeBatch(firestore);
  batch.update(
    doc(firestore, "users", uid, "experiences", expId),
    buildWorkExperienceUpdatePayload(savedExp)
  );

  const updatedLogs: LogEntry[] = [];
  for (const log of logsToUpdate) {
    const nextLog: LogEntry = {
      ...log,
      experienceId: log.experienceId || expId,
      client: savedExp.company,
      updatedAt: now,
    };
    batch.update(
      doc(firestore, "users", uid, "logs", sanitizeDocId(log.id, "log")),
      buildLogEntryUpdatePayload(nextLog)
    );
    updatedLogs.push(nextLog);
  }

  for (const log of metadataOnlyLogs) {
    const nextLog: LogEntry = {
      ...log,
      experienceId: log.experienceId || expId,
      client: savedExp.company,
    };
    const metadataPayload = buildLogMetadataUpdatePayload({
      experienceId: nextLog.experienceId,
      client: nextLog.client,
      ...(typeof nextLog.includeInCv === "boolean"
        ? { includeInCv: nextLog.includeInCv }
        : {}),
    });
    if (Object.keys(metadataPayload).length > 0) {
      batch.update(
        doc(firestore, "users", uid, "logs", sanitizeDocId(log.id, "log")),
        metadataPayload
      );
    }
    updatedLogs.push(nextLog);
  }

  const createdLogs: LogEntry[] = [];
  if (newLogBulletsToCreate && newLogBulletsToCreate.length > 0) {
    newLogBulletsToCreate.forEach((bullet, idx) => {
      const clean = bullet.trim();
      if (!clean) return;
      const logId = sanitizeDocId(`log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`, "log");
      const entry: LogEntry = {
        id: logId,
        userId: uid,
        experienceId: expId,
        originalBullet: clean,
        logro: clean,
        date: new Date().toISOString().substring(0, 10),
        client: savedExp.company,
        project: savedExp.role,
        category: inferCategoryForSavedExperienceBullet(clean),
        title: clean,
        impact: clean,
        description: `Registrado desde trayectoria en ${savedExp.company} (${savedExp.role}).`,
        tags: (savedExp.technologies || []).slice(0, 4).map((t) => `#${t.replace(/\s+/g, "")}`),
        isPublic: false,
        includeInCv: true,
        createdAt: now,
        updatedAt: now,
      };
      batch.set(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryCreatePayload(entry, uid, logId)
      );
      createdLogs.push(entry);
    });
  }

  try {
    await batch.commit();
    return { experience: savedExp, updatedLogs, createdLogs };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function importExperienceJsonFirestore(params: {
  updatedExperience: WorkExperience;
  contentEditedLogs: LogEntry[];
  metadataOnlyLogs: LogEntry[];
  logsToCreate: Array<Omit<LogEntry, "id" | "createdAt" | "updatedAt">>;
}): Promise<{
  experience: WorkExperience;
  updatedLogs: LogEntry[];
  createdLogs: LogEntry[];
}> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const expId = sanitizeDocId(params.updatedExperience.id, "exp");
  const path = `users/${uid}/experiences/${expId}`;
  const now = Date.now();

  const savedExp: WorkExperience = {
    ...params.updatedExperience,
    id: expId,
    userId: uid,
    updatedAt: now,
  };

  const ops: Array<(batch: WriteBatch) => void> = [];
  ops.push((b) =>
    b.update(
      doc(firestore, "users", uid, "experiences", expId),
      buildWorkExperienceUpdatePayload(savedExp)
    )
  );

  const updatedLogs: LogEntry[] = [];
  for (const log of params.contentEditedLogs) {
    const safeId = sanitizeDocId(log.id, "log");
    const nextLog: LogEntry = {
      ...log,
      id: safeId,
      userId: uid,
      experienceId: log.experienceId || expId,
      client: savedExp.company,
      updatedAt: now,
    };
    ops.push((b) =>
      b.update(
        doc(firestore, "users", uid, "logs", safeId),
        buildLogEntryUpdatePayload(nextLog)
      )
    );
    updatedLogs.push(nextLog);
  }

  for (const log of params.metadataOnlyLogs) {
    const safeId = sanitizeDocId(log.id, "log");
    const nextLog: LogEntry = {
      ...log,
      id: safeId,
      userId: uid,
      experienceId: log.experienceId || expId,
      client: savedExp.company,
    };
    const metadataPayload = buildLogMetadataUpdatePayload({
      experienceId: nextLog.experienceId,
      client: nextLog.client,
      isPublic: Boolean(nextLog.isPublic),
      ...(typeof nextLog.includeInCv === "boolean"
        ? { includeInCv: nextLog.includeInCv }
        : {}),
      ...(typeof nextLog.sortOrder === "number"
        ? { sortOrder: nextLog.sortOrder }
        : {}),
    });
    if (Object.keys(metadataPayload).length > 0) {
      ops.push((b) =>
        b.update(doc(firestore, "users", uid, "logs", safeId), metadataPayload)
      );
    }
    updatedLogs.push(nextLog);
  }

  const createdLogs: LogEntry[] = [];
  params.logsToCreate.forEach((draft, idx) => {
    const cleanTitle = draft.title.trim();
    if (!cleanTitle) return;
    const logId = sanitizeDocId(
      `log-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      "log"
    );
    const entry: LogEntry = {
      ...draft,
      id: logId,
      userId: uid,
      experienceId: expId,
      client: savedExp.company,
      title: cleanTitle,
      logro: draft.logro || cleanTitle,
      impact: draft.impact || cleanTitle,
      isPublic: Boolean(draft.isPublic),
      includeInCv: draft.includeInCv !== false,
      createdAt: now,
      updatedAt: now,
    };
    ops.push((b) =>
      b.set(
        doc(firestore, "users", uid, "logs", logId),
        buildLogEntryCreatePayload(entry, uid, logId)
      )
    );
    createdLogs.push(entry);
  });

  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(firestore);
    for (const applyOp of ops.slice(i, i + 400)) {
      applyOp(batch);
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return { experience: savedExp, updatedLogs, createdLogs };
}

export async function deleteExperienceFirestore(
  expId: string,
  reassignedLogs: LogEntry[]
): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(expId, "exp");
  const path = `users/${uid}/experiences/${safeId}`;
  const batch = writeBatch(firestore);

  batch.delete(doc(firestore, "users", uid, "experiences", safeId));
  for (const log of reassignedLogs) {
    const metadataPayload = buildLogMetadataUpdatePayload({
      experienceId: log.experienceId,
      client: log.client,
    });
    if (Object.keys(metadataPayload).length > 0) {
      batch.update(
        doc(firestore, "users", uid, "logs", sanitizeDocId(log.id, "log")),
        metadataPayload
      );
    }
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Products CRUD
// ---------------------------------------------------------------------------
export async function createProductFirestore(
  product: Omit<Product, "id" | "createdAt">
): Promise<Product> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const prodId = sanitizeDocId(
    `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    "prod"
  );
  const path = `users/${uid}/products/${prodId}`;
  const created: Product = {
    ...product,
    id: prodId,
    userId: uid,
    tagline: product.tagline?.trim() ? product.tagline : product.title,
    isPublic: product.isPublic ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(
      doc(firestore, "users", uid, "products", prodId),
      buildProductCreatePayload(created, uid, prodId)
    );
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProductFirestore(product: Product): Promise<Product> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const prodId = sanitizeDocId(product.id, "prod");
  const path = `users/${uid}/products/${prodId}`;
  const updated: Product = {
    ...product,
    id: prodId,
    userId: uid,
    tagline: product.tagline?.trim() ? product.tagline : product.title,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(
      doc(firestore, "users", uid, "products", prodId),
      buildProductUpdatePayload(updated)
    );
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(productId, "prod");
  const path = `users/${uid}/products/${safeId}`;
  try {
    await deleteDoc(doc(firestore, "users", uid, "products", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Certifications CRUD
// ---------------------------------------------------------------------------
export async function createCertificationFirestore(
  cert: Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt">,
  linkedGoalToAchieve?: CareerGoal
): Promise<TechnicalCertification> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const certId = sanitizeDocId(
    `cert-${now}-${Math.random().toString(36).slice(2, 7)}`,
    "cert"
  );
  const path = `users/${uid}/certifications/${certId}`;
  const created: TechnicalCertification = {
    ...cert,
    id: certId,
    userId: uid,
    isPublic: cert.isPublic ?? true,
    skills: Array.isArray(cert.skills) ? cert.skills : [],
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(firestore);
  batch.set(
    doc(firestore, "users", uid, "certifications", certId),
    buildCertificationCreatePayload(created, uid, certId)
  );

  if (linkedGoalToAchieve) {
    const updatedGoal: CareerGoal = {
      ...linkedGoalToAchieve,
      status: "achieved",
      achievedDate:
        linkedGoalToAchieve.achievedDate || new Date().toISOString().substring(0, 10),
      linkedCertificationId: certId,
      updatedAt: now,
    };
    batch.update(
      doc(firestore, "users", uid, "careerGoals", sanitizeDocId(linkedGoalToAchieve.id, "goal")),
      buildCareerGoalUpdatePayload(updatedGoal)
    );
  }

  try {
    await batch.commit();
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCertificationFirestore(
  cert: TechnicalCertification
): Promise<TechnicalCertification> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const certId = sanitizeDocId(cert.id, "cert");
  const path = `users/${uid}/certifications/${certId}`;
  const updated: TechnicalCertification = {
    ...cert,
    id: certId,
    userId: uid,
    updatedAt: Date.now(),
  };

  try {
    await updateDoc(
      doc(firestore, "users", uid, "certifications", certId),
      buildCertificationUpdatePayload(updated)
    );
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCertificationFirestore(certId: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(certId, "cert");
  const path = `users/${uid}/certifications/${safeId}`;
  try {
    await deleteDoc(doc(firestore, "users", uid, "certifications", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Career Goals CRUD
// ---------------------------------------------------------------------------
export async function createCareerGoalFirestore(
  goal: Omit<CareerGoal, "id" | "createdAt" | "updatedAt">
): Promise<CareerGoal> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const goalId = sanitizeDocId(
    `goal-${now}-${Math.random().toString(36).slice(2, 7)}`,
    "goal"
  );
  const path = `users/${uid}/careerGoals/${goalId}`;
  const created: CareerGoal = {
    ...goal,
    id: goalId,
    userId: uid,
    actionItems: Array.isArray(goal.actionItems) ? goal.actionItems : [],
    achievedDate:
      goal.status === "achieved"
        ? goal.achievedDate || new Date().toISOString().substring(0, 10)
        : goal.achievedDate,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(
      doc(firestore, "users", uid, "careerGoals", goalId),
      buildCareerGoalCreatePayload(created, uid, goalId)
    );
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCareerGoalFirestore(goal: CareerGoal): Promise<CareerGoal> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const goalId = sanitizeDocId(goal.id, "goal");
  const path = `users/${uid}/careerGoals/${goalId}`;
  const updated: CareerGoal = {
    ...goal,
    id: goalId,
    userId: uid,
    achievedDate:
      goal.status === "achieved"
        ? goal.achievedDate || new Date().toISOString().substring(0, 10)
        : undefined,
    updatedAt: Date.now(),
  };

  try {
    await updateDoc(
      doc(firestore, "users", uid, "careerGoals", goalId),
      buildCareerGoalUpdatePayload(updated)
    );
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCareerGoalFirestore(goalId: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(goalId, "goal");
  const path = `users/${uid}/careerGoals/${safeId}`;
  try {
    await deleteDoc(doc(firestore, "users", uid, "careerGoals", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Job Offers CRUD
// ---------------------------------------------------------------------------
export async function createJobOfferFirestore(
  offer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">
): Promise<JobOffer> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const offerId = sanitizeDocId(
    `offer-${now}-${Math.random().toString(36).slice(2, 7)}`,
    "offer"
  );
  const path = `users/${uid}/offers/${offerId}`;
  const created: JobOffer = {
    ...offer,
    id: offerId,
    userId: uid,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(
      doc(firestore, "users", uid, "offers", offerId),
      buildJobOfferCreatePayload(created, uid, offerId)
    );
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateJobOfferFirestore(offer: JobOffer): Promise<JobOffer> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const offerId = sanitizeDocId(offer.id, "offer");
  const path = `users/${uid}/offers/${offerId}`;
  const updated: JobOffer = {
    ...offer,
    id: offerId,
    userId: uid,
    updatedAt: Date.now(),
  };

  try {
    await updateDoc(
      doc(firestore, "users", uid, "offers", offerId),
      buildJobOfferUpdatePayload(updated)
    );
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteJobOfferFirestore(offerId: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(offerId, "offer");
  const path = `users/${uid}/offers/${safeId}`;
  try {
    await deleteDoc(doc(firestore, "users", uid, "offers", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// Inbox CRUD
// ---------------------------------------------------------------------------
export async function createInboxMessageFirestore(
  msg: Omit<VisitorMessage, "id" | "date" | "read" | "replied"> & {
    id?: string;
    date?: string;
    read?: boolean;
    replied?: boolean;
  }
): Promise<VisitorMessage> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const messageId = sanitizeDocId(
    msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    "msg"
  );
  const path = `users/${uid}/inbox/${messageId}`;
  const created: VisitorMessage = {
    ...msg,
    id: messageId,
    date: msg.date || new Date().toISOString().replace("T", " ").substring(0, 16),
    read: Boolean(msg.read),
    replied: Boolean(msg.replied),
  };

  try {
    await setDoc(
      doc(firestore, "users", uid, "inbox", messageId),
      buildInboxMessageCreatePayload(created, uid, messageId)
    );
    return created;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createInboxBatchFirestore(
  messages: VisitorMessage[]
): Promise<VisitorMessage[]> {
  if (messages.length === 0) return [];
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const batch = writeBatch(firestore);
  const saved: VisitorMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const messageId = sanitizeDocId(
      msg.id || `msg-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      "msg"
    );
    const materialized: VisitorMessage = { ...msg, id: messageId };
    batch.set(
      doc(firestore, "users", uid, "inbox", messageId),
      buildInboxMessageCreatePayload(materialized, uid, messageId)
    );
    saved.push(materialized);
  }

  try {
    await batch.commit();
    return saved;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/inbox`);
  }
}

export async function updateInboxMessageStatusFirestore(
  messageId: string,
  updates: { read?: boolean; replied?: boolean; convertedLogId?: string }
): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(messageId, "msg");
  const path = `users/${uid}/inbox/${safeId}`;

  try {
    await updateDoc(
      doc(firestore, "users", uid, "inbox", safeId),
      buildInboxMessageUpdatePayload(updates)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInboxMessageFirestore(messageId: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const safeId = sanitizeDocId(messageId, "msg");
  const path = `users/${uid}/inbox/${safeId}`;
  try {
    await deleteDoc(doc(firestore, "users", uid, "inbox", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// AI Quota (/users/{uid}/quotas/ai) & Pro Waitlist (/proWaitlist/{entryId})
// ---------------------------------------------------------------------------
export async function getAiQuotaFirestore(): Promise<AiUsageRecord> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const current = auth?.currentUser;
  if (!db || !current || !current.emailVerified) {
    return { monthKey, count: 0, lastUsed: 0 };
  }

  const uid = current.uid;
  const path = `users/${uid}/quotas/ai`;
  try {
    const snap = await getDoc(doc(db, "users", uid, "quotas", "ai"));
    if (!snap.exists()) return { monthKey, count: 0, lastUsed: 0 };
    const parsed = docToAiQuota(snap.data() as Record<string, unknown>, monthKey);
    if (parsed.monthKey !== monthKey) {
      return { monthKey, count: 0, lastUsed: parsed.lastUsed };
    }
    return parsed;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function recordAiUsageFirestore(): Promise<AiUsageRecord> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const now = Date.now();
  const dateObj = new Date(now);
  const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
  const quotaRef = doc(firestore, "users", uid, "quotas", "ai");
  const path = `users/${uid}/quotas/ai`;

  let snap;
  try {
    snap = await getDoc(quotaRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  let nextRecord: AiUsageRecord;
  if (snap.exists()) {
    const existing = docToAiQuota(snap.data() as Record<string, unknown>, monthKey);
    const nextCount = existing.monthKey === monthKey ? existing.count + 1 : 1;
    nextRecord = { monthKey, count: nextCount, lastUsed: now };
    try {
      await updateDoc(quotaRef, buildAiQuotaUpdatePayload(nextRecord));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    nextRecord = { monthKey, count: 1, lastUsed: now };
    try {
      await setDoc(quotaRef, buildAiQuotaCreatePayload(nextRecord, uid, "ai"));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return nextRecord;
}

export async function saveProWaitlistEmailFirestore(email: string): Promise<void> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();
  const entryId = sanitizeDocId(`wait-${uid}-${Date.now()}`, "wait");
  const path = `proWaitlist/${entryId}`;
  try {
    await setDoc(
      doc(firestore, "proWaitlist", entryId),
      buildProWaitlistPayload(entryId, uid, email)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ---------------------------------------------------------------------------
// Public Showcase (/publicShowcases/{username}) — Strictly PII-Free
// ---------------------------------------------------------------------------
export async function getPublicShowcaseFirestore(
  rawUsername: string
): Promise<PublicShowcaseData | null> {
  const firestore = getDbOrThrow();
  const username = sanitizeUsernameHandle(rawUsername);
  if (!isValidUsernameHandle(username)) return null;

  const path = `publicShowcases/${username}`;
  try {
    const snap = await getDoc(doc(firestore, "publicShowcases", username));
    if (!snap.exists()) return null;
    const raw = snap.data() as Record<string, unknown>;
    const rawProfile = (raw.userProfile || {}) as Record<string, unknown>;
    const ownerId = typeof raw.ownerId === "string" ? raw.ownerId : String(rawProfile.id || "");
    const userProfile: UserProfile = {
      id: ownerId,
      username,
      name: String(rawProfile.name || "Profesional Técnico"),
      email: "",
      avatar: String(rawProfile.avatar || ""),
      title: String(rawProfile.title || ""),
      bio: String(rawProfile.bio || ""),
      location: String(rawProfile.location || ""),
      github: typeof rawProfile.github === "string" ? rawProfile.github : undefined,
      linkedin: typeof rawProfile.linkedin === "string" ? rawProfile.linkedin : undefined,
      socialLinks:
        rawProfile.socialLinks && typeof rawProfile.socialLinks === "object"
          ? (rawProfile.socialLinks as UserProfile["socialLinks"])
          : undefined,
      availabilityStatus:
        typeof rawProfile.availabilityStatus === "string"
          ? rawProfile.availabilityStatus
          : undefined,
      skills: Array.isArray(rawProfile.skills)
        ? (rawProfile.skills as UserProfile["skills"])
        : [],
      authProvider: "google",
    };

    return {
      username,
      ownerId,
      userProfile,
      logs: Array.isArray(raw.logs) ? (raw.logs as LogEntry[]) : [],
      products: Array.isArray(raw.products) ? (raw.products as Product[]) : [],
      certifications: Array.isArray(raw.certifications)
        ? (raw.certifications as TechnicalCertification[])
        : [],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function checkUsernameAvailabilityFirestore(
  rawUsername: string,
  currentUid?: string
): Promise<{ available: boolean; reason?: string; suggestions?: string[] }> {
  const clean = sanitizeUsernameHandle(rawUsername);
  if (!clean || clean.length < 3) {
    return { available: false, reason: "Mínimo 3 caracteres alfanuméricos." };
  }
  if (clean.length > 30) {
    return { available: false, reason: "Máximo 30 caracteres permitidos." };
  }
  if (RESERVED_USERNAMES.has(clean)) {
    return {
      available: false,
      reason: "Palabra reservada del sistema.",
      suggestions: [`${clean}001`, `${clean}_pro`, `${clean}_dev`].map((s) => s.slice(0, 30)),
    };
  }

  const firestore = getDbOrThrow();
  const path = `publicShowcases/${clean}`;
  try {
    const snap = await getDoc(doc(firestore, "publicShowcases", clean));
    if (!snap.exists()) {
      return { available: true };
    }
    const ownerId = snap.data()?.ownerId;
    if (currentUid && ownerId === currentUid) {
      return { available: true };
    }
    return {
      available: false,
      reason: "Esta URL ya está tomada por otro usuario.",
      suggestions: [`${clean}001`, `${clean}01`, `${clean}_pro`].map((s) => s.slice(0, 30)),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncPublicShowcaseFirestore(params: {
  username?: string;
  userProfile: UserProfile;
  logs: LogEntry[];
  products: Product[];
  certifications: TechnicalCertification[];
  createIfMissing?: boolean;
}): Promise<boolean> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid(params.userProfile.id);
  const username = sanitizeUsernameHandle(
    params.username || params.userProfile.username || generateDefaultUsernameHandle(params.userProfile.name, params.userProfile.email)
  );
  if (!isValidUsernameHandle(username)) {
    throw new Error("El identificador público (/u/handle) debe tener entre 3 y 30 caracteres válidos.");
  }

  const path = `publicShowcases/${username}`;
  const showcaseRef = doc(firestore, "publicShowcases", username);

  let snap;
  try {
    snap = await getDoc(showcaseRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap.exists()) {
    if (!params.createIfMissing) return false;
    try {
      await setDoc(
        showcaseRef,
        buildPublicShowcaseCreatePayload({
          username,
          ownerId: uid,
          userProfile: params.userProfile,
          logs: params.logs,
          products: params.products,
          certifications: params.certifications,
        })
      );
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  const existingOwner = snap.data()?.ownerId;
  if (existingOwner !== uid) {
    if (params.createIfMissing) {
      throw new Error("username_taken: Este enlace /u/" + username + " pertenece a otro usuario.");
    }
    return false;
  }

  try {
    await updateDoc(
      showcaseRef,
      buildPublicShowcaseUpdatePayload({
        username,
        userProfile: params.userProfile,
        logs: params.logs,
        products: params.products,
        certifications: params.certifications,
      })
    );
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePublicShowcaseFirestore(rawUsername: string): Promise<void> {
  const firestore = getDbOrThrow();
  requireVerifiedUid();
  const username = sanitizeUsernameHandle(rawUsername);
  if (!isValidUsernameHandle(username)) return;
  const path = `publicShowcases/${username}`;
  try {
    await deleteDoc(doc(firestore, "publicShowcases", username));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------------------------------------------------------------------------
// JSON Backup Import (Chunked Batch Writes into Firestore)
// ---------------------------------------------------------------------------
export async function importBackupBundleToFirestore(bundle: {
  logs?: LogEntry[];
  experiences?: WorkExperience[];
  inbox?: VisitorMessage[];
  jobOffers?: JobOffer[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  careerGoals?: CareerGoal[];
}): Promise<number> {
  const firestore = getDbOrThrow();
  const uid = requireVerifiedUid();

  const existingIdsByCol = async (subcol: string) => {
    const q = query(collection(firestore, "users", uid, subcol), where("userId", "==", uid));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.id));
  };

  let existingExpIds: Set<string>;
  let existingLogIds: Set<string>;
  let existingProdIds: Set<string>;
  let existingCertIds: Set<string>;
  let existingGoalIds: Set<string>;
  let existingOfferIds: Set<string>;
  let existingInboxIds: Set<string>;

  try {
    [
      existingExpIds,
      existingLogIds,
      existingProdIds,
      existingCertIds,
      existingGoalIds,
      existingOfferIds,
      existingInboxIds,
    ] = await Promise.all([
      existingIdsByCol("experiences"),
      existingIdsByCol("logs"),
      existingIdsByCol("products"),
      existingIdsByCol("certifications"),
      existingIdsByCol("careerGoals"),
      existingIdsByCol("offers"),
      existingIdsByCol("inbox"),
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}`);
  }

  const ops: Array<(batch: WriteBatch) => void> = [];

  for (const exp of bundle.experiences || []) {
    const id = sanitizeDocId(exp.id, "exp");
    const ref = doc(firestore, "users", uid, "experiences", id);
    if (existingExpIds.has(id)) {
      ops.push((b) => b.update(ref, buildWorkExperienceUpdatePayload({ ...exp, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildWorkExperienceCreatePayload({ ...exp, id, userId: uid }, uid, id)));
    }
  }
  for (const log of bundle.logs || []) {
    const id = sanitizeDocId(log.id, "log");
    const ref = doc(firestore, "users", uid, "logs", id);
    if (existingLogIds.has(id)) {
      ops.push((b) => b.update(ref, buildLogEntryUpdatePayload({ ...log, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildLogEntryCreatePayload({ ...log, id, userId: uid }, uid, id)));
    }
  }
  for (const prod of bundle.products || []) {
    const id = sanitizeDocId(prod.id, "prod");
    const ref = doc(firestore, "users", uid, "products", id);
    if (existingProdIds.has(id)) {
      ops.push((b) => b.update(ref, buildProductUpdatePayload({ ...prod, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildProductCreatePayload({ ...prod, id, userId: uid }, uid, id)));
    }
  }
  for (const cert of bundle.certifications || []) {
    const id = sanitizeDocId(cert.id, "cert");
    const ref = doc(firestore, "users", uid, "certifications", id);
    if (existingCertIds.has(id)) {
      ops.push((b) => b.update(ref, buildCertificationUpdatePayload({ ...cert, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildCertificationCreatePayload({ ...cert, id, userId: uid }, uid, id)));
    }
  }
  for (const goal of bundle.careerGoals || []) {
    const id = sanitizeDocId(goal.id, "goal");
    const ref = doc(firestore, "users", uid, "careerGoals", id);
    if (existingGoalIds.has(id)) {
      ops.push((b) => b.update(ref, buildCareerGoalUpdatePayload({ ...goal, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildCareerGoalCreatePayload({ ...goal, id, userId: uid }, uid, id)));
    }
  }
  for (const offer of bundle.jobOffers || []) {
    const id = sanitizeDocId(offer.id, "offer");
    const ref = doc(firestore, "users", uid, "offers", id);
    if (existingOfferIds.has(id)) {
      ops.push((b) => b.update(ref, buildJobOfferUpdatePayload({ ...offer, id, userId: uid })));
    } else {
      ops.push((b) => b.set(ref, buildJobOfferCreatePayload({ ...offer, id, userId: uid }, uid, id)));
    }
  }
  for (const msg of bundle.inbox || []) {
    const id = sanitizeDocId(msg.id, "msg");
    if (!existingInboxIds.has(id)) {
      const ref = doc(firestore, "users", uid, "inbox", id);
      ops.push((b) => b.set(ref, buildInboxMessageCreatePayload({ ...msg, id }, uid, id)));
    }
  }

  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(firestore);
    for (const applyOp of ops.slice(i, i + 400)) {
      applyOp(batch);
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  }

  return ops.length;
}
