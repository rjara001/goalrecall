/**
 * Auth error classification and user-friendly description utility
 * Mirrors the glimmind pattern for Firebase Auth errors.
 */

export interface AuthErrorInfo {
  code: string;
  message: string;
  translationKey: string;
}

export function isUserCancellation(errorCodeOrMessage?: string): boolean {
  if (!errorCodeOrMessage) return false;
  const lower = errorCodeOrMessage.toLowerCase();
  return (
    lower.includes("auth/popup-closed-by-user") ||
    lower.includes("auth/cancelled-popup-request") ||
    lower.includes("cancelled") ||
    lower.includes("canceled") ||
    lower.includes("user closed the popup")
  );
}

export function isCoopIsolationError(errorCodeOrMessage?: string): boolean {
  if (!errorCodeOrMessage) return false;
  const lower = errorCodeOrMessage.toLowerCase();
  return (
    lower.includes("cross-origin-opener-policy") ||
    lower.includes("coop") ||
    lower.includes("auth/popup-blocked") ||
    lower.includes("auth/unauthorized-domain") ||
    lower.includes("blocked by client")
  );
}

export function shouldUseRedirectFallback(errorCodeOrMessage?: string): boolean {
  if (!errorCodeOrMessage) return false;
  const lower = errorCodeOrMessage.toLowerCase();
  return (
    isCoopIsolationError(lower) ||
    lower.includes("auth/popup-blocked") ||
    lower.includes("auth/operation-not-supported-in-this-environment")
  );
}

export function describeAuthError(error: any): { key: string; fallbackMessage: string } {
  const code = (error?.code || "").toLowerCase();
  const message = (error?.message || "").toLowerCase();

  if (isUserCancellation(code) || isUserCancellation(message)) {
    return {
      key: "popup_closed_by_user",
      fallbackMessage: "Sign in window was closed before completion.",
    };
  }

  if (code.includes("auth/unauthorized-domain")) {
    return {
      key: "firebase_unauthorized_domain",
      fallbackMessage:
        "This domain is not authorized in Firebase Console -> Authentication -> Authorized domains.",
    };
  }

  if (code.includes("auth/network-request-failed") || message.includes("network")) {
    return {
      key: "auth_network_error",
      fallbackMessage: "Network connection error while communicating with Google Auth servers.",
    };
  }

  if (code.includes("auth/configuration-not-found") || code.includes("auth/invalid-api-key")) {
    return {
      key: "firebase_not_configured_correctly",
      fallbackMessage: "Firebase Authentication is not configured correctly in environment variables.",
    };
  }

  return {
    key: "google_login_failed",
    fallbackMessage: error?.message || "Google authentication failed. Please try again.",
  };
}
