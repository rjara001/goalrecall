import {
  CvExtractionPayload,
  CvExtractionResponse,
  CvFallbackReason,
} from "../../../types";
import { extractCvDataLocally } from "../../../utils/localCvExtractor";
import { CV_AI_REQUEST_TIMEOUT_MS } from "../constants";

export interface ExtractCvOptions {
  idToken?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export interface ExtractCvResult {
  response: CvExtractionResponse;
  usedAi: boolean;
  fallbackReason?: CvFallbackReason;
}

export function extractCvLocally(
  payload: CvExtractionPayload,
  fallbackReason?: CvFallbackReason
): ExtractCvResult {
  const local = extractCvDataLocally(
    payload.textContent || "",
    payload.fileName || "CV_Documento.txt"
  );

  return {
    response: {
      cvData: local.cvData,
      achievements: local.achievements,
      pendingFields: local.pendingFields,
      completenessScore: local.completenessScore,
      engine: local.engine,
      fallbackReason,
    },
    usedAi: false,
    fallbackReason,
  };
}

export async function extractCvWithAi(
  payload: CvExtractionPayload,
  options: ExtractCvOptions = {}
): Promise<ExtractCvResult> {
  if (payload.forceLocal) {
    return extractCvLocally(payload, "forced_local");
  }

  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? CV_AI_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let fallbackReason: CvFallbackReason = "network";

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.idToken) {
      headers["Authorization"] = `Bearer ${options.idToken}`;
    }

    const response = await fetcher("/api/cv/extract-full-cv", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    if (response.ok && contentType.includes("application/json")) {
      const data = (await response.json()) as CvExtractionResponse;
      const usedAi = Boolean(data.engine && data.engine !== "local-strict-parser");
      return {
        response: data,
        usedAi,
      };
    }

    if (response.status === 401 || response.status === 403) {
      fallbackReason = "unauthenticated";
      console.warn(
        "Cloud Function requiere autenticación. Activando extractor local verídico."
      );
    } else {
      fallbackReason = "server_error";
      console.warn(
        "Backend API no disponible o estático. Activando extractor local verídico automático."
      );
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: string }).name === "AbortError"
    ) {
      fallbackReason = "timeout";
      console.warn("Tiempo de espera agotado en /api/cv/extract-full-cv. Usando extractor local.");
    } else {
      fallbackReason = "network";
      console.warn(
        "Error de conexión con /api/cv/extract-full-cv. Ejecutando extractor local verídico:",
        err
      );
    }
  } finally {
    clearTimeout(timeoutId);
  }

  return extractCvLocally(payload, fallbackReason);
}
