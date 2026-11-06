import { describe, it, expect } from "bun:test";
import {
  isUserCancellation,
  isCoopIsolationError,
  shouldUseRedirectFallback,
  describeAuthError,
} from "./authErrors";
import { isFirebaseConfigured, firebaseConfig } from "../firebase";

describe("authErrors utility", () => {
  it("detects user popup cancellation", () => {
    expect(isUserCancellation("auth/popup-closed-by-user")).toBe(true);
    expect(isUserCancellation("User closed the popup")).toBe(true);
    expect(isUserCancellation("auth/other-error")).toBe(false);
  });

  it("detects COOP isolation error", () => {
    expect(isCoopIsolationError("Cross-Origin-Opener-Policy blocked")).toBe(true);
    expect(isCoopIsolationError("auth/popup-blocked")).toBe(true);
    expect(isCoopIsolationError("auth/unauthorized-domain")).toBe(true);
  });

  it("identifies redirect fallback candidates", () => {
    expect(shouldUseRedirectFallback("auth/popup-blocked")).toBe(true);
    expect(shouldUseRedirectFallback("auth/operation-not-supported-in-this-environment")).toBe(true);
    expect(shouldUseRedirectFallback("random error")).toBe(false);
  });

  it("maps error codes to localization keys", () => {
    expect(describeAuthError({ code: "auth/popup-closed-by-user" }).key).toBe("popup_closed_by_user");
    expect(describeAuthError({ code: "auth/unauthorized-domain" }).key).toBe("firebase_unauthorized_domain");
    expect(describeAuthError({ code: "auth/email-already-in-use" }).key).toBe("email_already_in_use");
    expect(describeAuthError({ code: "auth/wrong-password" }).key).toBe("wrong_password");
    expect(describeAuthError({ code: "auth/user-not-found" }).key).toBe("user_not_found");
    expect(describeAuthError({ code: "auth/network-request-failed" }).key).toBe("auth_network_error");
    expect(describeAuthError({ code: "auth/invalid-api-key" }).key).toBe("firebase_not_configured_correctly");
  });
});

describe("firebase configuration module", () => {
  it("exports configuration object and validation function", () => {
    expect(firebaseConfig).toBeDefined();
    expect(typeof isFirebaseConfigured).toBe("function");
  });
});
