import { auth } from "../../firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  const serialized = JSON.stringify(errInfo);
  console.error("Firestore Error: ", serialized);
  throw new Error(serialized);
}

export function parseFirestoreErrorInfo(error: unknown): FirestoreErrorInfo | null {
  if (!(error instanceof Error)) return null;
  try {
    const parsed = JSON.parse(error.message) as Partial<FirestoreErrorInfo>;
    if (parsed && typeof parsed.error === "string" && typeof parsed.operationType === "string") {
      return parsed as FirestoreErrorInfo;
    }
    return null;
  } catch {
    return null;
  }
}

export function formatFirestoreUiError(
  error: unknown,
  fallbackMessage = "No se pudo guardar en Firestore. Intenta nuevamente."
): string {
  const info = parseFirestoreErrorInfo(error);
  const rawMessage = info ? info.error : error instanceof Error ? error.message : String(error || "");
  const lower = rawMessage.toLowerCase();

  if (lower.includes("quota exceeded")) {
    return "Se alcanzó la cuota diaria de escritura/lectura de Firestore. Intenta nuevamente más tarde.";
  }
  if (lower.includes("permission-denied") || lower.includes("missing or insufficient permissions")) {
    return "Permiso denegado por Firestore. Verifica que tu sesión de Google esté activa y con correo verificado.";
  }
  if (lower.includes("the client is offline") || lower.includes("unavailable") || lower.includes("network")) {
    return "Sin conexión con Firestore. Revisa tu conexión a internet e intenta de nuevo.";
  }
  if (lower.includes("unauthenticated")) {
    return "Debes iniciar sesión con Google para guardar cambios en la base de datos.";
  }
  if (lower.includes("username_taken")) {
    return "Ese identificador público (/u/handle) ya está en uso por otra cuenta.";
  }
  if (lower.includes("auth_required")) {
    return "Debes iniciar sesión con tu cuenta de Google verificada para continuar.";
  }
  if (rawMessage && !info) {
    return rawMessage;
  }
  if (info?.error) {
    return `${fallbackMessage} (${info.error})`;
  }
  return fallbackMessage;
}
