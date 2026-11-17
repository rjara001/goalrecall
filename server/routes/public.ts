import { Router } from "express";
import fs from "fs";
import path from "path";
import {
  CloudSyncRecord,
  CloudSyncStore,
  RESERVED_USERNAMES,
  defaultCloudSyncStore,
} from "../services/cloudSyncStore";
import {
  renderEmbedWidgetHtml,
  renderSummaryBadgeSvg,
} from "../services/publicBadgeRenderer";

export function createPublicRouter(store: CloudSyncStore = defaultCloudSyncStore): Router {
  const router = Router();

  router.post("/claim-username", (req, res) => {
    try {
      const { username, userKey, userProfile, logs, products, certifications } = req.body;
      if (!username || !userKey) {
        return res.status(400).json({ error: "username and userKey are required." });
      }
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (RESERVED_USERNAMES.has(cleanUsername)) {
        return res.status(400).json({ error: "Palabra reservada del sistema." });
      }

      const index = store.getUsernameIndex();
      const existingOwner = index[cleanUsername];
      if (existingOwner && existingOwner.toLowerCase() !== userKey.trim().toLowerCase()) {
        return res.status(409).json({ error: "Username already taken." });
      }

      store.setUsernameIndex(cleanUsername, userKey);

      let record: CloudSyncRecord = { userKey, updatedAt: Date.now(), payload: {} };
      try {
        const existing = store.readRecord(userKey);
        if (existing) record = existing;
      } catch {
        // start fresh record on corrupt JSON
      }
      if (!record.payload) record.payload = {};
      if (userProfile) {
        record.payload.user = {
          ...(record.payload.user || {}),
          ...userProfile,
          username: cleanUsername,
        };
      }
      if (Array.isArray(logs)) record.payload.logs = logs;
      if (Array.isArray(products)) record.payload.products = products;
      if (Array.isArray(certifications)) record.payload.certifications = certifications;
      record.updatedAt = Date.now();
      store.writeRecord(record);

      return res.json({ success: true, username: cleanUsername, userKey });
    } catch (err) {
      console.error("Error claiming username:", err);
      return res.status(500).json({ error: "Failed to claim username." });
    }
  });

  router.post("/delete-showcase", (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required." });
      }
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      store.deleteShowcaseByUsername(cleanUsername);
      return res.json({ success: true, message: "Vitrina pública eliminada exitosamente." });
    } catch (err) {
      console.error("Error deleting showcase:", err);
      return res.status(500).json({ error: "Error al eliminar la vitrina pública." });
    }
  });

  router.get("/check-username/:username", (req, res) => {
    try {
      const rawUsername = req.params.username?.trim();
      const currentUserKey = (req.query.userKey as string)?.trim().toLowerCase();

      if (!rawUsername) {
        return res.status(400).json({ available: false, reason: "Nombre de usuario requerido." });
      }

      const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (cleanUsername.length < 3) {
        return res.json({ available: false, reason: "El nombre de usuario debe tener al menos 3 caracteres." });
      }
      if (cleanUsername.length > 30) {
        return res.json({ available: false, reason: "El nombre de usuario no puede exceder 30 caracteres." });
      }

      if (RESERVED_USERNAMES.has(cleanUsername)) {
        const suggestions = store.generateUsernameSuggestions(cleanUsername, store.getUsernameIndex());
        return res.json({
          available: false,
          reason: "Este nombre de usuario es una palabra reservada del sistema.",
          suggestions,
        });
      }

      const index = store.getUsernameIndex();
      const existingOwner = index[cleanUsername];

      if (existingOwner && (!currentUserKey || existingOwner.toLowerCase() !== currentUserKey)) {
        const suggestions = store.generateUsernameSuggestions(cleanUsername, index);
        return res.json({
          available: false,
          reason: "Esta URL ya está tomada por otro usuario.",
          suggestions,
        });
      }

      if (!existingOwner) {
        for (const file of store.listSyncFiles()) {
          try {
            const content = JSON.parse(
              fs.readFileSync(path.resolve(store.baseDir, file), "utf-8")
            ) as CloudSyncRecord;
            const uUsername = (content?.payload?.user?.username || "").toLowerCase();
            const uKey = (content.userKey || "").toLowerCase();

            if (uUsername === cleanUsername && (!currentUserKey || uKey !== currentUserKey)) {
              store.setUsernameIndex(cleanUsername, content.userKey);
              const suggestions = store.generateUsernameSuggestions(cleanUsername, store.getUsernameIndex());
              return res.json({
                available: false,
                reason: "Esta URL ya está tomada por otro usuario.",
                suggestions,
              });
            }
          } catch {
            // ignore corrupt file
          }
        }
      }

      return res.json({ available: true, username: cleanUsername });
    } catch (err) {
      console.error("Error checking username availability:", err);
      return res.status(500).json({ error: "Error al verificar disponibilidad." });
    }
  });

  router.get("/u/:username/badge.svg", (req, res) => {
    try {
      const cleanUsername = (req.params.username || "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      if (!cleanUsername) {
        return res.status(400).send("Username is required");
      }

      const targetUserKey = store.findUserKeyByIdentifier(cleanUsername);
      if (!targetUserKey) {
        const fallbackSvg = renderSummaryBadgeSvg({
          name: cleanUsername,
          handle: cleanUsername,
          publicLogsCount: 0,
          publicCertsCount: 0,
          publicProductsCount: 0,
          topImpact: "Publica tu vitrina en GoalRecall",
          variant: req.query.variant === "compact" ? "compact" : "card",
        });
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, max-age=60");
        return res.send(fallbackSvg);
      }

      const record = store.readRecord(targetUserKey);
      const payload = record?.payload || {};
      const rawUser = payload.user || {};
      const publicLogs = (Array.isArray(payload.logs) ? payload.logs : []).filter(
        (l: { isPublic?: boolean }) => l.isPublic === true
      );
      const publicProducts = (Array.isArray(payload.products) ? payload.products : []).filter(
        (p: { isPublic?: boolean }) => p.isPublic !== false
      );
      const publicCerts = (
        Array.isArray(payload.certifications) ? payload.certifications : []
      ).filter((c: { isPublic?: boolean }) => c.isPublic !== false);

      const topImpact =
        publicLogs.find((l: { impact?: string }) => /\d|%/.test(l.impact || ""))?.impact ||
        publicLogs[0]?.impact ||
        "";

      const svg = renderSummaryBadgeSvg({
        name: rawUser.name || cleanUsername,
        title: rawUser.title || "",
        handle: rawUser.username || cleanUsername,
        publicLogsCount: publicLogs.length,
        publicCertsCount: publicCerts.length,
        publicProductsCount: publicProducts.length,
        topImpact,
        variant: req.query.variant === "compact" ? "compact" : "card",
      });

      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, max-age=60");
      return res.send(svg);
    } catch (err) {
      console.error("Error rendering public badge SVG:", err);
      return res.status(500).send("SVG generation error");
    }
  });

  router.get("/u/:username/widget", (req, res) => {
    try {
      const cleanUsername = (req.params.username || "")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      if (!cleanUsername) {
        return res.status(400).send("Username is required");
      }

      const targetUserKey = store.findUserKeyByIdentifier(cleanUsername);
      if (!targetUserKey) {
        return res.status(404).send("Vitrina pública no encontrada.");
      }

      const record = store.readRecord(targetUserKey);
      const payload = record?.payload || {};
      const rawUser = payload.user || {};
      const publicLogs = (Array.isArray(payload.logs) ? payload.logs : []).filter(
        (l: { isPublic?: boolean }) => l.isPublic === true
      );
      const publicProducts = (Array.isArray(payload.products) ? payload.products : []).filter(
        (p: { isPublic?: boolean }) => p.isPublic !== false
      );
      const publicCerts = (
        Array.isArray(payload.certifications) ? payload.certifications : []
      ).filter((c: { isPublic?: boolean }) => c.isPublic !== false);

      const protocol = req.protocol || "https";
      const host = req.get("host") || "goalrecall.com";
      const deckUrl = `${protocol}://${host}/u/${encodeURIComponent(cleanUsername)}`;

      const html = renderEmbedWidgetHtml({
        name: rawUser.name || cleanUsername,
        title: rawUser.title || "",
        handle: rawUser.username || cleanUsername,
        deckUrl,
        publicLogs: publicLogs.map(
          (l: { title?: string; impact?: string; client?: string; date?: string }) => ({
            title: l.title || "",
            impact: l.impact || "",
            client: l.client,
            date: l.date,
          })
        ),
        publicCerts: publicCerts.map(
          (c: { name?: string; issuer?: string; credentialUrl?: string }) => ({
            name: c.name || "",
            issuer: c.issuer || "",
            credentialUrl: c.credentialUrl,
          })
        ),
        publicProductsCount: publicProducts.length,
      });

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, max-age=60");
      return res.send(html);
    } catch (err) {
      console.error("Error rendering embed widget:", err);
      return res.status(500).send("Widget generation error");
    }
  });

  router.get(["/u/:username", "/u/*"], (req, res) => {
    try {
      let rawUsername = (
        req.params.username ||
        (req.params as Record<string, string>)[0] ||
        (req.query.username as string) ||
        ""
      )
        .toString()
        .trim();

      if (!rawUsername) {
        const cleanUrl = (req.url || req.path || "").split("?")[0].replace(/\/+$/, "");
        const parts = cleanUrl.split("/").filter(Boolean);
        if (parts.length > 0) rawUsername = parts[parts.length - 1];
      }

      if (!rawUsername || rawUsername === "u") {
        return res.status(400).json({ error: "Username is required." });
      }

      const cleanUsername = rawUsername
        .toLowerCase()
        .replace(/^u\//, "")
        .replace(/[^a-z0-9_-]/g, "");

      const targetUserKey = store.findUserKeyByIdentifier(cleanUsername);
      if (!targetUserKey) {
        return res.status(404).json({ error: "Vitrina pública no encontrada para este usuario." });
      }

      const record = store.readRecord(targetUserKey);
      if (!record) {
        return res.status(404).json({ error: "Vitrina pública no encontrada." });
      }

      const payload = record.payload || {};
      const rawUser = payload.user || {};
      const allLogs = Array.isArray(payload.logs) ? payload.logs : [];
      const allProducts = Array.isArray(payload.products) ? payload.products : [];
      const allCertifications = Array.isArray(payload.certifications)
        ? payload.certifications
        : [];

      const publicLogs = allLogs.filter((l: { isPublic?: boolean }) => l.isPublic === true);
      const publicProducts = allProducts.filter((p: { isPublic?: boolean }) => p.isPublic !== false);
      const publicCertifications = allCertifications.filter(
        (c: { isPublic?: boolean }) => c.isPublic !== false
      );

      const safeUserProfile = {
        id: rawUser.id || `usr-public-${cleanUsername}`,
        username: rawUser.username || cleanUsername,
        name: rawUser.name || "Profesional Técnico",
        title: rawUser.title || "",
        bio: rawUser.bio || "",
        avatar:
          rawUser.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        location: rawUser.location || "",
        github: rawUser.socialLinks?.github || rawUser.github,
        linkedin: rawUser.socialLinks?.linkedin || rawUser.linkedin,
        socialLinks: rawUser.socialLinks || {},
        availabilityStatus: rawUser.availabilityStatus,
        skills: Array.isArray(rawUser.skills) ? rawUser.skills : [],
        email: rawUser.email || "",
        authProvider: "custom",
        isDemoUser: false,
        isCustom: true,
        createdAt: rawUser.createdAt || Date.now(),
      };

      return res.json({
        success: true,
        userProfile: safeUserProfile,
        logs: publicLogs,
        products: publicProducts,
        certifications: publicCertifications,
      });
    } catch (err) {
      console.error("Error retrieving public showcase by username:", err);
      return res.status(500).json({ error: "Error al cargar la vitrina pública." });
    }
  });

  return router;
}
