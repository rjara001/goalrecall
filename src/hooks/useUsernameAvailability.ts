import { useState, useEffect } from "react";
import {
  UsernameCheckStatus,
  sanitizeUsernameHandle,
} from "../components/auth/authLocales";
import { checkUsernameAvailabilityFirestore } from "../utils/firestore/repository";

interface UseUsernameAvailabilityOptions {
  enabled: boolean;
  username: string;
  currentUsername?: string;
  userKey?: string;
}

export function useUsernameAvailability({
  enabled,
  username,
  currentUsername,
  userKey,
}: UseUsernameAvailabilityOptions): UsernameCheckStatus {
  const [status, setStatus] = useState<UsernameCheckStatus>({ checking: false });

  useEffect(() => {
    if (!enabled || !username) {
      setStatus({ checking: false });
      return;
    }

    const clean = sanitizeUsernameHandle(username.trim());
    if (currentUsername && currentUsername.toLowerCase() === clean) {
      setStatus({ checking: false, available: true });
      return;
    }

    if (clean.length < 3) {
      setStatus({
        checking: false,
        available: false,
        reason: "Mínimo 3 caracteres.",
      });
      return;
    }

    let cancelled = false;
    setStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailabilityFirestore(clean, userKey);
        if (!cancelled) {
          setStatus({
            checking: false,
            available: res.available,
            reason: res.reason,
            suggestions: res.suggestions,
          });
        }
      } catch {
        if (!cancelled) {
          setStatus({
            checking: false,
            available: undefined,
            reason: "No se pudo verificar disponibilidad en Firestore.",
          });
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, username, currentUsername, userKey]);

  return status;
}
