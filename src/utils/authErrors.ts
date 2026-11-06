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

  if (code.includes("auth/email-already-in-use")) {
    return {
      key: "email_already_in_use",
      fallbackMessage: "This email address is already registered. Please sign in instead.",
    };
  }

  if (code.includes("auth/wrong-password") || code.includes("auth/invalid-credential")) {
    return {
      key: "wrong_password",
      fallbackMessage: "Incorrect password or credentials. Please check and try again.",
    };
  }

  if (code.includes("auth/user-not-found")) {
    return {
      key: "user_not_found",
      fallbackMessage: "No account found with this email. Please register first.",
    };
  }

  if (code.includes("auth/weak-password")) {
    return {
      key: "weak_password",
      fallbackMessage: "Password is too weak. Please use at least 6 characters.",
    };
  }

  if (code.includes("auth/invalid-email")) {
    return {
      key: "invalid_email",
      fallbackMessage: "Invalid email address format.",
    };
  }

  if (code.includes("auth/network-request-failed") || message.includes("network")) {
    return {
      key: "auth_network_error",
      fallbackMessage: "Network connection error while communicating with authentication servers.",
    };
  }

  if (code.includes("auth/configuration-not-found") || code.includes("auth/invalid-api-key")) {
    return {
      key: "firebase_not_configured_correctly",
      fallbackMessage: "Firebase Authentication is not configured correctly in environment variables.",
    };
  }

  return {
    key: "auth_failed",
    fallbackMessage: error?.message || "Authentication failed. Please try again.",
  };
}
