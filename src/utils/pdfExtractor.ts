import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure pdfjs worker for browser/vite bundler
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Extracts plain text from a PDF File or ArrayBuffer directly in the browser.
 */
export async function extractTextFromPdf(input: File | ArrayBuffer | Uint8Array): Promise<string> {
  let uint8Array: Uint8Array;

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    uint8Array = new Uint8Array(arrayBuffer);
  } else if (input instanceof ArrayBuffer) {
    uint8Array = new Uint8Array(input);
  } else {
    uint8Array = input;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => (item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}
