# Ticket 1.2: Extracción de I/O, Validación y Parsers de Ficheros

## Contexto y Objetivo
`CvUploadModal.tsx` mezcla la validación de archivos, lectura binaria (`FileReader`), extracción local PDF/DOCX y manejo de errores dentro de `processUploadedFile` y `processTextExtraction`. Adicionalmente presenta tres bugs/ineficiencias latentes:
1. Acepta `.doc` binario antiguo (`accept=".pdf,.docx,.doc,.txt,.md"`), pero no existe parser para `.doc` y termina produciendo un CV vacío silenciosamente en fallback local.
2. Envía `fileBase64` completo al backend **incluso cuando `extractPdfText` o `extractDocxText` ya extrajeron texto limpio en el navegador**, inflando payloads hasta ~2.7 MB.
3. El límite de `15,000` caracteres solo se aplica al texto pegado, no al texto extraído de archivos.

## Impacto Técnico
- Nuevo: `src/features/cv-upload/constants.ts`
- Nuevo: `src/features/cv-upload/services/cvFileParser.ts`
- Nuevo: `src/features/cv-upload/services/cvFileParser.test.ts`
- Modificado: `src/components/CvUploadModal.tsx`

## Plan de Pasos Detallado
1. **Crear `src/features/cv-upload/constants.ts`:**
   - `MAX_CV_FILE_SIZE_BYTES = 2 * 1024 * 1024`
   - `MAX_CV_TEXT_CHARS = 15000`
   - `MIN_EXTRACTED_TEXT_CHARS = 50`
   - `ALLOWED_CV_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"]`
2. **Crear `src/features/cv-upload/services/cvFileParser.ts`:**
   - `validateCvFile(file: File): { valid: boolean; error?: string }`: validar tamaño (`<= 2 MB`), rechazar explícitamente `.doc` binario antiguo con mensaje claro indicando guardar como `.docx` o `.pdf`, y validar extensiones/MIME permitidos.
   - `normalizeCvText(text: string): string`: `trim()` + truncado consistente a `MAX_CV_TEXT_CHARS`.
   - `fileToBase64(file: File)` y `fileToText(file: File)`.
   - `parseCvFile(file: File, onStep?: (msg: string) => void): Promise<CvExtractionPayload>`:
     - Para PDF/DOCX: extraer texto localmente primero. Si el texto supera `MIN_EXTRACTED_TEXT_CHARS`, devolver `textContent` normalizado **sin adjuntar `fileBase64`** (ahorro de ancho de banda y límites HTTP). Solo adjuntar `fileBase64` si el documento parece escaneado/vacío o falló la extracción local.
     - Para TXT/MD: usar `fileToText` + `normalizeCvText`.
3. **Crear unit tests (`cvFileParser.test.ts`):**
   - Cubrir validación > 2 MB, rechazo explícito de `.doc`, aceptación de `.pdf`/`.docx`/`.txt`/`.md`, y truncado consistente a 15,000 caracteres.
4. **Actualizar `CvUploadModal.tsx`:**
   - Eliminar `fileToBase64` y `fileToText` locales y delegar validación/lectura a `cvFileParser.ts`.

## Criterios de Aceptación
- [ ] `.doc` binario se rechaza con mensaje accionable en lugar de fallar silenciosamente
- [ ] Si hay texto extraído válido (`>= 50` chars), no se envía `fileBase64` redundante
- [ ] El truncado a 15,000 caracteres se aplica tanto a archivos como a texto pegado
- [ ] `cvFileParser.test.ts` pasa al 100% con `npm test`
- [ ] `npm run lint` y `npm run build` en verde