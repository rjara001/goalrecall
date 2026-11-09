import mammoth from "mammoth";

/**
 * Extracts clean plain text from a DOCX file or ArrayBuffer in the browser or Node/Bun runtime.
 * Operates 100% locally with zero server costs ($0.00 / free tier compliant).
 */
export async function extractDocxText(
  fileOrBuffer: File | ArrayBuffer | Uint8Array | Buffer
): Promise<string> {
  let arrayBuffer: ArrayBuffer;
  let nodeBuffer: Buffer | null = null;

  if (typeof File !== "undefined" && fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(fileOrBuffer)) {
    nodeBuffer = fileOrBuffer;
    const sliced = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength
    );
    arrayBuffer = sliced instanceof ArrayBuffer ? sliced : (new Uint8Array(fileOrBuffer).buffer as ArrayBuffer);
  } else if (fileOrBuffer instanceof Uint8Array) {
    const sliced = fileOrBuffer.buffer.slice(
      fileOrBuffer.byteOffset,
      fileOrBuffer.byteOffset + fileOrBuffer.byteLength
    );
    arrayBuffer = sliced instanceof ArrayBuffer ? sliced : (new Uint8Array(fileOrBuffer).buffer as ArrayBuffer);
    if (typeof Buffer !== "undefined") {
      nodeBuffer = Buffer.from(fileOrBuffer);
    }
  } else if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
    if (typeof Buffer !== "undefined") {
      nodeBuffer = Buffer.from(fileOrBuffer);
    }
  } else {
    throw new Error("Formato de buffer no compatible para extracción de DOCX.");
  }

  // Support both browser environment (arrayBuffer) and Node/Bun environment (buffer)
  try {
    const result = await mammoth.extractRawText(
      nodeBuffer ? { buffer: nodeBuffer, arrayBuffer } : { arrayBuffer }
    );
    return (result?.value || "").trim();
  } catch (err) {
    if (nodeBuffer) {
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      return (result?.value || "").trim();
    }
    throw err;
  }
}
