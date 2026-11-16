import { useCallback, useEffect, useState } from "react";
import { LogEntry, Product, UserProfile } from "../types";
import { getStoredLogs, getStoredProducts, getStoredUser, STORAGE_KEYS } from "../utils/storage";
import { parseSharedDeckFromUrl } from "../utils/publicDeckShare";

export type ActiveView = "landing" | "quarters" | "public" | "features" | "docs" | "offers";
export type QuartersTab = "timeline" | "synthesis" | "inbox" | "docs" | "offers";

export interface SharedDeckState {
  userProfile: UserProfile;
  logs: LogEntry[];
  products: Product[];
}

export const resolvePathForView = (view: ActiveView): string => {
  switch (view) {
    case "docs":
      return "/docs";
    case "features":
      return "/features";
    case "offers":
      return "/offers";
    case "public":
      return "/public";
    case "quarters":
      return "/quarters";
    default:
      return "/";
  }
};

export const extractPublicUsernameFromLocation = (pathname: string, hash: string): string | null => {
  const p = pathname.toLowerCase();
  const h = hash.toLowerCase();
  if (p.startsWith("/u/")) {
    const raw = pathname.slice(3).split("/")[0]?.trim();
    return raw || null;
  }
  if (h.startsWith("#/u/")) {
    const raw = hash.slice(4).split("/")[0]?.trim();
    return raw || null;
  }
  return null;
};

export const resolveInitialActiveView = (
  pathname: string,
  hash: string,
  hasStoredUser: boolean
): ActiveView => {
  const p = pathname.toLowerCase();
  const h = hash.toLowerCase();

  if (p.startsWith("/u/") || h.startsWith("#/u/")) return "public";
  if (p === "/docs" || h === "#docs" || p.startsWith("/docs")) return "docs";
  if (p === "/features" || h === "#features") return "features";
  if (p === "/offers" || h === "#offers") return "offers";
  if (p === "/public" || h === "#public" || h.includes("#deck=")) return "public";
  if (p === "/quarters" || h === "#quarters") return "quarters";

  return hasStoredUser ? "quarters" : "landing";
};

const hasPersistedUserSync = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return false;
    const u = JSON.parse(stored);
    return Boolean(u && (u.id || u.email || u.name));
  } catch {
    return false;
  }
};

export const useAppRouting = () => {
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window === "undefined") return "landing";
    return resolveInitialActiveView(
      window.location.pathname,
      window.location.hash,
      hasPersistedUserSync()
    );
  });

  const [activeQuartersTab, setActiveQuartersTab] = useState<QuartersTab>("timeline");
  const [sharedDeck, setSharedDeck] = useState<SharedDeckState | null>(null);
  const [usernameLookupError, setUsernameLookupError] = useState<string | null>(null);
  const [isLoadingPublicUser, setIsLoadingPublicUser] = useState<boolean>(false);

  const handleNavigateView = useCallback((view: ActiveView) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      const targetPath = resolvePathForView(view);
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  }, []);

  const loadPublicShowcaseByUsername = useCallback(async (targetUsername: string) => {
    const clean = targetUsername.toLowerCase().trim();
    if (!clean) return;

    const localUser = getStoredUser();
    if (
      localUser &&
      ((localUser.username && localUser.username.toLowerCase() === clean) ||
        (localUser.email && localUser.email.split("@")[0].toLowerCase() === clean))
    ) {
      const localLogs = getStoredLogs();
      const localProducts = getStoredProducts();
      setSharedDeck({
        userProfile: localUser,
        logs: localLogs.filter((l) => l.isPublic),
        products: localProducts.filter((p) => p.isPublic !== false),
      });
      setUsernameLookupError(null);
      setIsLoadingPublicUser(false);
      setActiveView("public");
      return;
    }

    setIsLoadingPublicUser(true);
    setUsernameLookupError(null);

    try {
      const res = await fetch(`/api/public/u/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.userProfile) {
          setSharedDeck({
            userProfile: data.userProfile,
            logs: data.logs || [],
            products: data.products || [],
          });
          setUsernameLookupError(null);
          setActiveView("public");
          return;
        }
      }
      setUsernameLookupError(`No se encontró la vitrina pública para el usuario "@${clean}".`);
      setSharedDeck(null);
      setActiveView("public");
    } catch (err) {
      console.error("Error loading public showcase by username:", err);
      setUsernameLookupError(`No fue posible cargar la vitrina para el usuario "@${clean}".`);
      setSharedDeck(null);
      setActiveView("public");
    } finally {
      setIsLoadingPublicUser(false);
    }
  }, []);

  const clearSharedDeckAndGoHome = useCallback(() => {
    if (sharedDeck) {
      if (typeof window !== "undefined") {
        window.location.hash = "";
      }
      setSharedDeck(null);
    }
    setUsernameLookupError(null);
    handleNavigateView("landing");
  }, [handleNavigateView, sharedDeck]);

  // Check for shared recruiter deck or /u/:username on mount & hash changes
  useEffect(() => {
    const checkRouteOrDeck = () => {
      const p = window.location.pathname;
      const h = window.location.hash;

      const username = extractPublicUsernameFromLocation(p, h);
      if (username) {
        loadPublicShowcaseByUsername(username);
        return;
      }

      const deckMatch = h.includes("deck=") || window.location.search.includes("deck=");
      if (deckMatch) {
        parseSharedDeckFromUrl().then((deck) => {
          if (deck) {
            setSharedDeck(deck);
            setUsernameLookupError(null);
            setActiveView("public");
          }
        });
      }
    };

    checkRouteOrDeck();
    window.addEventListener("hashchange", checkRouteOrDeck);
    return () => window.removeEventListener("hashchange", checkRouteOrDeck);
  }, [loadPublicShowcaseByUsername]);

  // Browser navigation & history handling
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();

      const username = extractPublicUsernameFromLocation(
        window.location.pathname,
        window.location.hash
      );
      if (username) {
        loadPublicShowcaseByUsername(username);
        return;
      }

      if (h.includes("deck=") || window.location.search.includes("deck=")) {
        parseSharedDeckFromUrl().then((deck) => {
          if (deck) {
            setSharedDeck(deck);
            setUsernameLookupError(null);
            setActiveView("public");
          }
        });
        return;
      }

      setUsernameLookupError(null);

      if (p === "/docs" || h === "#docs" || p.startsWith("/docs")) {
        setActiveView("docs");
      } else if (p === "/features" || h === "#features") {
        setActiveView("features");
      } else if (p === "/offers" || h === "#offers") {
        setActiveView("offers");
      } else if (p === "/public" || h === "#public") {
        setActiveView("public");
      } else if (p === "/quarters" || h === "#quarters") {
        setActiveView("quarters");
      } else {
        setActiveView(getStoredUser() ? "quarters" : "landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [loadPublicShowcaseByUsername]);

  return {
    activeView,
    setActiveView,
    activeQuartersTab,
    setActiveQuartersTab,
    sharedDeck,
    setSharedDeck,
    usernameLookupError,
    setUsernameLookupError,
    isLoadingPublicUser,
    handleNavigateView,
    clearSharedDeckAndGoHome,
  };
};
