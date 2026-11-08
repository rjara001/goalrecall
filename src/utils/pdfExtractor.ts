import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extracts clean, line-structured text from a PDF file or ArrayBuffer in the browser.
 * Groups text fragments that share the same vertical Y coordinate into single lines
 * to preserve bullet structure, section headers, and multi-column alignment.
 */
export async function extractPdfText(
  fileOrBuffer: File | ArrayBuffer | Uint8Array
): Promise<string> {
  let data: Uint8Array;
  if (typeof File !== "undefined" && fileOrBuffer instanceof File) {
    const arrayBuffer = await fileOrBuffer.arrayBuffer();
    data = new Uint8Array(arrayBuffer);
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(fileOrBuffer)) {
    data = new Uint8Array(fileOrBuffer.buffer, fileOrBuffer.byteOffset, fileOrBuffer.byteLength);
  } else if (fileOrBuffer instanceof Uint8Array) {
    data = new Uint8Array(fileOrBuffer.buffer, fileOrBuffer.byteOffset, fileOrBuffer.byteLength);
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    data = new Uint8Array(fileOrBuffer);
  } else {
    data = new Uint8Array(fileOrBuffer as any);
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    const pageLines: string[] = [];
    let currentLine = "";

    for (const item of textContent.items as any[]) {
      const str = item.str;
      if (str === undefined || str === null) continue;

      const currentY = item.transform ? item.transform[5] : null;

      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) {
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = str;
      } else {
        currentLine = currentLine ? `${currentLine} ${str}` : str;
      }
      lastY = currentY;
    }

    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    pageTexts.push(pageLines.join("\n"));
  }

  return pageTexts.join("\n\n");
}
