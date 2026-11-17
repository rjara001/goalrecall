import { useState, useEffect } from "react";
import {
  UsernameCheckStatus,
  sanitizeUsernameHandle,
} from "../components/auth/authLocales";

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

    setStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const query = userKey ? `?userKey=${encodeURIComponent(userKey)}` : "";
        const res = await fetch(
          `/api/public/check-username/${encodeURIComponent(clean)}${query}`
        );
        if (res.ok) {
          const data = await res.json();
          setStatus({
            checking: false,
            available: data.available,
            reason: data.reason,
            suggestions: data.suggestions,
          });
        }
      } catch {
        setStatus({ checking: false, available: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [enabled, username, currentUsername, userKey]);

  return status;
}
