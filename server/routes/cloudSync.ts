import { Router } from "express";
import {
  CloudSyncStore,
  RESERVED_USERNAMES,
  defaultCloudSyncStore,
} from "../services/cloudSyncStore";

export function createCloudSyncRouter(store: CloudSyncStore = defaultCloudSyncStore): Router {
  const router = Router();

  router.post("/save", (req, res) => {
    try {
      const { userKey, payload } = req.body;
      if (!userKey || !payload) {
        return res.status(400).json({ error: "userKey and payload are required." });
      }

      const payloadStr = JSON.stringify(payload);
      if (payloadStr.length > 500 * 1024) {
        return res.status(413).json({
          error:
            "El respaldo excede el límite de 500 KB de la capa gratuita. Por favor utiliza enlaces externos para imágenes pesadas.",
        });
      }

      const requestedUsername = payload.user?.username?.trim().toLowerCase();
      if (requestedUsername) {
        if (RESERVED_USERNAMES.has(requestedUsername)) {
          return res.status(409).json({
            error: `El nombre de usuario "${requestedUsername}" es una palabra reservada.`,
          });
        }

        const index = store.getUsernameIndex();
        const existingOwner = index[requestedUsername];
        if (existingOwner && existingOwner.toLowerCase() !== userKey.trim().toLowerCase()) {
          return res.status(409).json({
            error: `El nombre de usuario "${requestedUsername}" ya está tomado por otro usuario.`,
            conflict: true,
          });
        }
      }

      const backupRecord = {
        userKey,
        updatedAt: Date.now(),
        payload,
      };
      store.writeRecord(backupRecord);

      if (requestedUsername) {
        store.setUsernameIndex(requestedUsername, userKey);
      }

      return res.json({
        success: true,
        savedAt: backupRecord.updatedAt,
        sizeBytes: payloadStr.length,
      });
    } catch (err) {
      console.error("Error saving cloud sync backup:", err);
      return res.status(500).json({ error: "Failed to persist cloud backup." });
    }
  });

  router.get("/load/:userKey", (req, res) => {
    try {
      const { userKey } = req.params;
      if (!userKey) {
        return res.status(400).json({ error: "userKey is required." });
      }
      const record = store.readRecord(userKey);
      if (!record) {
        return res.status(404).json({ error: "No cloud backup found for this user key." });
      }
      return res.json({ success: true, backup: record });
    } catch (err) {
      console.error("Error loading cloud sync backup:", err);
      return res.status(500).json({ error: "Failed to load cloud backup." });
    }
  });

  return router;
}
