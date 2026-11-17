import { CvExtractionPayload } from "../../../types";
import { extractPdfText } from "../../../utils/pdfExtractor";
import { extractDocxText } from "../../../utils/docxExtractor";
import {
  ALLOWED_CV_EXTENSIONS,
  ALLOWED_CV_MIME_TYPES,
  MAX_CV_FILE_SIZE_BYTES,
  MAX_CV_TEXT_CHARS,
  MIN_EXTRACTED_TEXT_CHARS,
} from "../constants";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function normalizeCvText(rawText: string): string {
  const trimmed = rawText.trim();
  if (trimmed.length <= MAX_CV_TEXT_CHARS) {
    return trimmed;
  }
  return trimmed.substring(0, MAX_CV_TEXT_CHARS);
}

export function validateCvFile(
  file: Pick<File, "name" | "size" | "type">
): FileValidationResult {
  const lowerName = file.name.toLowerCase();

  if (file.size > MAX_CV_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `El archivo "${file.name}" pesa ${sizeMb} MB y supera el límite de 2 MB permitido para cuentas gratuitas. Sube una versión optimizada en PDF o pega el texto directamente.`,
    };
  }

  // Explicitly reject legacy binary Word (.doc) because no client parser supports it
  if (lowerName.endsWith(".doc") && !lowerName.endsWith(".docx")) {
    return {
      valid: false,
      error: `El formato Word clásico (.doc) no es compatible directamente. Guarda el documento como .docx o .pdf, o pega el texto en la pestaña "Pegar Texto".`,
    };
  }

  const hasAllowedExtension = ALLOWED_CV_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );
  const hasAllowedMime =
    Boolean(file.type) &&
    (file.type.startsWith("text/") ||
      (ALLOWED_CV_MIME_TYPES as readonly string[]).includes(file.type));

  if (!hasAllowedExtension && !hasAllowedMime) {
    return {
      valid: false,
      error: `Formato no compatible (${file.name}). Usa PDF, DOCX, TXT o Markdown (.md).`,
    };
  }

  return { valid: true };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function parseCvFile(
  file: File,
  onStep?: (stepMessage: string) => void
): Promise<CvExtractionPayload> {
  const lowerName = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    lowerName.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isText =
    file.type.startsWith("text/") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md");

  const payload: CvExtractionPayload = {
    fileName: file.name,
  };

  if (isPdf) {
    onStep?.("Extrayendo texto del documento PDF en el navegador...");
    try {
      const pdfText = await extractPdfText(file);
      const normalized = normalizeCvText(pdfText || "");
      if (normalized.length >= MIN_EXTRACTED_TEXT_CHARS) {
        payload.textContent = normalized;
        payload.mimeType = "application/pdf";
        return payload;
      }
      if (normalized.length > 0) {
        payload.textContent = normalized;
      }
    } catch (pdfErr) {
      console.warn(
        "Extracción de PDF en cliente falló, continuando con base64:",
        pdfErr
      );
    }
    onStep?.("Analizando documento PDF...");
    payload.fileBase64 = await fileToBase64(file);
    payload.mimeType = "application/pdf";
    return payload;
  }

  if (isDocx) {
    onStep?.("Extrayendo texto de Word (.docx) localmente...");
    try {
      const docxText = await extractDocxText(file);
      const normalized = normalizeCvText(docxText || "");
      if (normalized.length >= MIN_EXTRACTED_TEXT_CHARS) {
        payload.textContent = normalized;
        payload.mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return payload;
      }
      if (normalized.length > 0) {
        payload.textContent = normalized;
      }
    } catch (docxErr) {
      console.warn(
        "Extracción de DOCX en cliente falló, continuando con base64:",
        docxErr
      );
    }
    onStep?.("Analizando documento Word...");
    payload.fileBase64 = await fileToBase64(file);
    payload.mimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return payload;
  }

  if (isText) {
    onStep?.("Parseando texto y extrayendo elementos del CV...");
    const text = await fileToText(file);
    payload.textContent = normalizeCvText(text);
    payload.mimeType = "text/plain";
    return payload;
  }

  onStep?.("Procesando formato con extractor...");
  payload.fileBase64 = await fileToBase64(file);
  payload.mimeType = file.type || "application/octet-stream";
  return payload;
}
