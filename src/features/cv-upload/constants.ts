export const MAX_CV_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_CV_TEXT_CHARS = 15000;
export const MIN_EXTRACTED_TEXT_CHARS = 50;
export const CV_AI_REQUEST_TIMEOUT_MS = 25000;

export const ALLOWED_CV_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"] as const;
export const ALLOWED_CV_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;
