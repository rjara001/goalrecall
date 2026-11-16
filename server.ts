import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createCvRouter } from "./server/routes/cv";
import { createPublicRouter } from "./server/routes/public";
import { createCloudSyncRouter } from "./server/routes/cloudSync";
import { createProductsRouter } from "./server/routes/products";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIdx = process.argv.indexOf("--port");
const cliPort = portArgIdx !== -1 ? Number(process.argv[portArgIdx + 1]) : NaN;
const PORT = Number.isFinite(cliPort) ? cliPort : Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/cv", createCvRouter());
app.use("/api/public", createPublicRouter());
app.use("/api/cloud-sync", createCloudSyncRouter());
app.use("/api/products", createProductsRouter());

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Captain's Log Server listening on port ${PORT}`);
  });
}

startServer();
