# Ticket 1.3: Servicio de IA y Normalización de Datos

## Contexto y Objetivo
El componente `CvUploadModal.tsx` contiene la lógica de envío de solicitudes de extracción a la API de IA en la función `sendExtractionRequest` (líneas 450-551), incluyendo manejo de autenticación Firebase, fallback local, y registro de uso de IA. El tercer paso de la refactorización es aislar esta lógica en un servicio dedicado `src/features/cv-upload/services/cvAiExtractor.ts`.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, `src/utils/localCvExtractor.ts`, `src/utils/storage.ts`
- Funciones relacionadas: `sendExtractionRequest` (CvUploadModal.tsx líneas 450-551), `checkCanUseAi`, `recordAiUsage`, `getAiUsage` (storage.ts)
- Endpoint: `/api/cv/extract-full-cv` (Cloud Function)
- Fallback: `extractCvDataLocally` (localCvExtractor.ts)

## Plan de pasos detallado

### Paso 1: Crear `src/features/cv-upload/services/cvAiExtractor.ts`
1. Implementar interfaz `ExtractionRequest` (usar `CvExtractionPayload` del ticket 1.1)
2. Implementar función `extractCvWithAi(payload: CvExtractionPayload, idToken?: string): Promise<CvExtractionResponse>`:
   - Construir headers con Bearer token si está disponible
   - Hacer fetch a `/api/cv/extract-full-cv`
   - Manejar respuestas: 200 JSON, 401 (fallback local), error de red (fallback local)
   - Retornar `CvExtractionResponse`
3. Implementar función `extractCvLocally(payload: CvExtractionPayload): CvExtractionResponse`:
   - Llamar a `extractCvDataLocally` de localCvExtractor.ts
   - Retornar respuesta con `engine: "local-strict-parser"`
4. Implementar función `recordAiUsageIfBackend(data: CvExtractionResponse)`:
   - Verificar si `data.engine !== "local-strict-parser"`
   - Si es así, llamar a `recordAiUsage()` y retornar `getAiUsage()`

### Paso 2: Actualizar `src/components/CvUploadModal.tsx`
1. Reemplazar el cuerpo de `sendExtractionRequest` (líneas 450-551) por llamada a `extractCvWithAi` + fallback a `extractCvLocally`
2. Mantener la lógica de estado (`setExtractedCv`, `setPendingFields`, etc.) en el componente

## Criterios de aceptación
- [ ] Interfaz limpia que recibe `CvExtractionPayload` y devuelve `CvExtractionResponse`
- [ ] Manejo robusto de excepciones de red y errores de API (401, timeout, etc.)
- [ ] El fallback local se activa automáticamente si el backend no está disponible
- [ ] `npx tsc --noEmit` pasa en verde