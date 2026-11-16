import { Router, Request, Response } from "express";
import path from "path";
import { extractCvDataLocally } from "../../src/utils/localCvExtractor";
import { checkAiRateLimit } from "../middleware/rateLimit";
import { extractTextFromBuffer } from "../services/cvBufferExtractor";
import { extractFullCvWithGemini } from "../services/geminiCvService";

export function createCvRouter(): Router {
  const router = Router();

  const handleExtractFullCv = async (req: Request, res: Response) => {
    let textContent: string = req.body?.textContent || "";
    const fileBase64: string = req.body?.fileBase64 || "";
    const mimeType: string = req.body?.mimeType || "";
    const fileName: string = req.body?.fileName || "cv.txt";

    try {
      if (!textContent && !fileBase64) {
        return res.status(400).json({
          error: "Se requiere el contenido del CV en texto o archivo en base64.",
        });
      }

      if (fileBase64 && fileBase64.length > 2.9 * 1024 * 1024) {
        return res.status(400).json({
          error:
            "El archivo excede el límite de 2 MB permitido para cuentas gratuitas. Por favor sube un archivo optimizado.",
        });
      }

      if (fileBase64) {
        const cleanBase64 = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
        try {
          const fileBuffer = Buffer.from(cleanBase64, "base64");
          const extracted = await extractTextFromBuffer(fileBuffer, mimeType, fileName);
          if (extracted && extracted.trim().length > 0) {
            textContent = extracted;
          }
        } catch (bufErr) {
          console.warn("No se pudo extraer texto del buffer binario:", bufErr);
        }
      }

      if (textContent && textContent.length > 15000) {
        textContent = textContent.substring(0, 15000);
      }

      const userUid = req.body?.userId || req.body?.user?.id || req.body?.userKey;
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress;
      const rateCheck = checkAiRateLimit(userUid, clientIp);

      if (!process.env.GEMINI_API_KEY || req.body?.forceLocal || !rateCheck.allowed) {
        const local = extractCvDataLocally(textContent || "", fileName || "Documento");
        return res.json({
          ...local,
          quota: {
            limitReached: !rateCheck.allowed,
            remaining: rateCheck.remaining,
            resetInHours: rateCheck.resetInHours,
            limitType: rateCheck.limitType,
          },
          warning: !rateCheck.allowed
            ? "Has alcanzado la cuota diaria de análisis con IA. Tu CV se extrajo mediante nuestro motor local de alta fidelidad a costo $0.00."
            : undefined,
        });
      }

      const { cvData, achievements, audit } = await extractFullCvWithGemini({
        textContent,
        fileBase64,
        mimeType,
        fileName,
      });

      return res.json({
        cvData,
        achievements,
        candidate: {
          name: cvData.contact.name,
          title: cvData.contact.headline,
          email: cvData.contact.email,
          topSkills: [
            ...cvData.skills.technical.slice(0, 3),
            ...cvData.skills.frameworks.slice(0, 2),
          ],
        },
        pendingFields: audit.pendingFields,
        completedCount: audit.completedCount,
        totalChecks: audit.totalChecks,
        completenessScore: audit.completenessScore,
        engine: "gemini-2.5-flash",
        fileName: fileName || "Documento",
        quota: {
          limitReached: false,
          remaining: rateCheck.remaining,
          resetInHours: rateCheck.resetInHours,
          limitType: rateCheck.limitType,
        },
      });
    } catch (err) {
      console.error("Error en extracción completa con Gemini:", err);
      const fallbackText = textContent || req.body?.textContent || "";
      const effectiveFileName = fileName || req.body?.fileName || "cv.txt";
      const local = extractCvDataLocally(fallbackText, effectiveFileName);
      return res.json({
        ...local,
        warning: "Extracción procesada mediante motor de fidelidad local.",
      });
    }
  };

  router.post("/extract-full-cv", handleExtractFullCv);
  router.post("/extract-achievements", handleExtractFullCv);

  router.get("/download-sample-pdf", (_req, res) => {
    const filePath = path.resolve(process.cwd(), "public", "demo-cv.pdf");
    res.download(filePath, "CV_Profesional_Demo.pdf", (err) => {
      if (err) {
        console.error("Error sending sample PDF:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "No se pudo descargar el archivo PDF de prueba." });
        }
      }
    });
  });

  return router;
}
