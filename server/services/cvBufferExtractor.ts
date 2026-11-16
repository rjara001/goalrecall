import mammoth from "mammoth";
// @ts-ignore pdf-parse ships untyped class export in v2
import { PDFParse } from "pdf-parse";

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType?: string,
  fileName?: string
): Promise<string> {
  const lowerName = (fileName || "").toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
    try {
      const parser = new PDFParse({ data: buffer });
      const res = await parser.getText();
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
      if (res && typeof res.text === "string" && res.text.trim().length > 0) {
        return res.text;
      }
    } catch (pdfErr) {
      console.warn("PDF extraction warning:", pdfErr);
    }
  }

  if (
    lowerMime.includes("word") ||
    lowerMime.includes("docx") ||
    lowerMime.includes("officedocument") ||
    lowerName.endsWith(".docx")
  ) {
    try {
      const docxRes = await mammoth.extractRawText({ buffer });
      if (docxRes && docxRes.value && docxRes.value.trim().length > 0) {
        return docxRes.value;
      }
    } catch (docxErr) {
      console.warn("DOCX extraction warning:", docxErr);
    }
  }

  try {
    const raw = buffer.toString("utf-8");
    if (raw && !/[\x00-\x08\x0E-\x1F]/.test(raw.slice(0, 100))) {
      return raw;
    }
  } catch {
    // ignore invalid utf-8 buffer
  }

  return "";
}
