import { Router } from "express";
import { CloudSyncRecord, CloudSyncStore, defaultCloudSyncStore } from "../services/cloudSyncStore";

export function createProductsRouter(store: CloudSyncStore = defaultCloudSyncStore): Router {
  const router = Router();

  router.get("/public/:userKey", (req, res) => {
    try {
      const { userKey } = req.params;
      if (!userKey) {
        return res.status(400).json({ error: "userKey is required." });
      }
      const record = store.readRecord(userKey);
      if (!record) {
        return res.json({ success: true, products: [] });
      }
      const allProducts = Array.isArray(record.payload?.products) ? record.payload.products : [];
      const publicProducts = allProducts.filter((p: { isPublic?: boolean }) => p.isPublic !== false);
      return res.json({ success: true, products: publicProducts });
    } catch (err) {
      console.error("Error loading public products:", err);
      return res.status(500).json({ error: "Failed to load public products." });
    }
  });

  router.get("/", (req, res) => {
    try {
      const userKey = (req.query.userKey as string) || "usr-guest";
      const record = store.readRecord(userKey);
      const products = Array.isArray(record?.payload?.products) ? record.payload.products : [];
      return res.json({ success: true, products });
    } catch (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Failed to fetch products." });
    }
  });

  router.post("/", (req, res) => {
    try {
      const userKey = (req.body.userKey as string) || "usr-guest";
      const productData = req.body.product;
      if (!productData || !productData.title) {
        return res.status(400).json({ error: "Product title and data are required." });
      }
      const existing = store.readRecord(userKey);
      const record: CloudSyncRecord = existing || {
        userKey,
        updatedAt: Date.now(),
        payload: { products: [] },
      };
      if (!record.payload) record.payload = {};
      if (!Array.isArray(record.payload.products)) record.payload.products = [];

      const newProduct = {
        ...productData,
        id: productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: productData.createdAt || new Date().toISOString(),
        isPublic: productData.isPublic ?? true,
      };
      record.payload.products.unshift(newProduct);
      record.updatedAt = Date.now();
      store.writeRecord(record);
      return res.json({ success: true, product: newProduct });
    } catch (err) {
      console.error("Error creating product:", err);
      return res.status(500).json({ error: "Failed to create product." });
    }
  });

  router.put("/:id", (req, res) => {
    try {
      const { id } = req.params;
      const userKey = (req.body.userKey as string) || "usr-guest";
      const updates = req.body.product || {};
      const record = store.readRecord(userKey);
      if (!record) {
        return res.status(404).json({ error: "User backup not found." });
      }
      const products: Array<Record<string, any>> = record.payload?.products || [];
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Product not found." });
      }
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      record.updatedAt = Date.now();
      store.writeRecord(record);
      return res.json({ success: true, product: products[index] });
    } catch (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ error: "Failed to update product." });
    }
  });

  router.delete("/:id", (req, res) => {
    try {
      const { id } = req.params;
      const userKey = (req.query.userKey as string) || (req.body?.userKey as string) || "usr-guest";
      const record = store.readRecord(userKey);
      if (!record) {
        return res.status(404).json({ error: "User backup not found." });
      }
      const products: Array<{ id?: string }> = record.payload?.products || [];
      record.payload.products = products.filter((p) => p.id !== id);
      record.updatedAt = Date.now();
      store.writeRecord(record);
      return res.json({ success: true, deletedId: id });
    } catch (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ error: "Failed to delete product." });
    }
  });

  return router;
}
