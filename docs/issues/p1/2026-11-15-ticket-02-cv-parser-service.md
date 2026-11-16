# Ticket 1.2: Extracción de I/O y Parsers de Ficheros

## Contexto y Objetivo
El componente `CvUploadModal.tsx` contiene toda la lógica de validación de ficheros (tamaño, tipo MIME) y la extracción de texto en bruto (PDF, DOCX, TXT) en sus funciones `processUploadedFile` (líneas 285-380) y `processTextExtraction` (líneas 382-431). El segundo paso de la refactorización es separar esta lógica en un servicio dedicado `src/features/cv-upload/services/cvFileParser.ts`.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, `src/utils/pdfExtractor.ts`, `src/utils/docxExtractor.ts`, `src/utils/localCvExtractor.ts`
- Utilitarios existentes: `extractPdfText` (pdfExtractor.ts), `extractDocxText` (docxExtractor.ts), `fileToBase64` y `fileToText` (definidos localmente en CvUploadModal.tsx líneas 251-267)
- Límites: 2 MB por archivo, 15,000 caracteres máximo

## Plan de pasos detallado

### Paso 1: Crear `src/features/cv-upload/services/cvFileParser.ts`
1. Implementar función `validateFile(file: File): { valid: boolean; error?: string }`:
   - Validar tamaño máximo 2 MB
   - Validar extensiones: .pdf, .docx, .doc, .txt, .md
   - Validar tipo MIME
2. Implementar función `fileToBase64(file: File): Promise<string>` (mover desde CvUploadModal.tsx líneas 251-258)
3. Implementar función `fileToText(file: File): Promise<string>` (mover desde CvUploadModal.tsx líneas 260-267)
4. Implementar función `extractTextFromFile(file: File): Promise<{ textContent?: string; fileBase64?: string; mimeType: string }>`:
   - Detectar tipo de fichero (PDF, DOCX, TXT)
   - Para PDF: intentar `extractPdfText` localmente, si falla usar base64
   - Para DOCX: intentar `extractDocxText` localmente, si fallar usar base64
   - Para TXT: usar `fileToText`
   - Retornar objeto con `textContent`, `fileBase64`, `mimeType`

### Paso 2: Actualizar `src/components/CvUploadModal.tsx`
1. Eliminar funciones locales `fileToBase64` y `fileToText` (líneas 251-267)
2. Reemplazar lógica de `processUploadedFile` (líneas 285-380) por llamada a `validateFile` + `extractTextFromFile`
3. Mantener la lógica de cuota de IA y `sendExtractionRequest` en el componente (o mover a hook en ticket 1.4)

## Criterios de aceptación
- [ ] El parser valida correctamente los formatos permitidos (PDF, DOCX, TXT)
- [ ] La extracción de texto asíncrona retorna el contenido en bruto sin bloquear el hilo principal
- [ ] `npx tsc --noEmit` pasa en verde
- [ ] Los límites de 2 MB y 15,000 caracteres se mantienen