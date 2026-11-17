# Ticket 1.3: Servicio HTTP Puro de Extracción IA y Fallback Transparente

## Contexto y Objetivo
Actualmente `sendExtractionRequest` en `CvUploadModal.tsx` mezcla llamadas HTTP a `/api/cv/extract-full-cv`, lectura directa de `firebase.auth`, registro de cuotas en `localStorage` (`recordAiUsage`) y activación silenciosa del fallback local sin `AbortController` ni motivo explícito de fallback.

Este ticket aísla el cliente de extracción en un servicio **100% puro y testeable** (`src/features/cv-upload/services/cvAiExtractor.ts`), sin efectos secundarios sobre `localStorage` ni acoplamiento directo al SDK de Firebase.

## Impacto Técnico
- Nuevo: `src/features/cv-upload/services/cvAiExtractor.ts`
- Nuevo: `src/features/cv-upload/services/cvAiExtractor.test.ts`
- Modificado: `src/components/CvUploadModal.tsx`

## Plan de Pasos Detallado
1. **Crear `src/features/cv-upload/services/cvAiExtractor.ts`:**
   - Definir `ExtractCvOptions`: `{ idToken?: string; timeoutMs?: number; fetcher?: typeof fetch }`.
   - Definir `ExtractCvResult`: `{ response: CvExtractionResponse; usedAi: boolean; fallbackReason?: CvFallbackReason }`.
   - Implementar `extractCvLocally(payload: CvExtractionPayload, fallbackReason?: CvFallbackReason): ExtractCvResult` usando `extractCvDataLocally`.
   - Implementar `extractCvWithAi(payload: CvExtractionPayload, options?: ExtractCvOptions): Promise<ExtractCvResult>`:
     - Si `payload.forceLocal`, retornar inmediatamente `extractCvLocally(payload, "forced_local")`.
     - Configurar `AbortController` con timeout por defecto (`25000` ms) para evitar bloqueos infinitos en UI.
     - Enviar `POST /api/cv/extract-full-cv` con `Authorization: Bearer <idToken>` si `idToken` fue inyectado.
     - Manejar explícitamente:
       - `200` + `application/json`: retornar `{ response: data, usedAi: data.engine !== "local-strict-parser" }`.
       - `401` / `403`: fallback local con `fallbackReason: "unauthenticated"`.
       - `5xx` / respuesta HTML de hosting estático: fallback local con `fallbackReason: "server_error"`.
       - `AbortError`: fallback local con `fallbackReason: "timeout"`.
       - Error de red: fallback local con `fallbackReason: "network"`.
   - **No** llamar a `recordAiUsage()` ni importar `firebase` dentro de este servicio; la orquestación de token y cuotas queda en el hook (`Ticket 1.4`).
2. **Crear unit tests (`cvAiExtractor.test.ts`):**
   - Simular `fetch` con respuestas 200 JSON, 401, HTML estático, error de red, `forceLocal` y timeout (`AbortError`), verificando `usedAi` y `fallbackReason`.
3. **Actualizar `CvUploadModal.tsx`:**
   - Reemplazar `sendExtractionRequest` delegando el transporte a `extractCvWithAi` y conservando el registro de cuota solo cuando `result.usedAi === true`.

## Criterios de Aceptación
- [x] `cvAiExtractor.ts` no importa `firebase` ni `utils/storage` (0 side effects en `localStorage`)
- [x] Timeout implementado con `AbortController`
- [x] `fallbackReason` reportado explícitamente en cada escenario de fallback
- [x] `cvAiExtractor.test.ts` pasa al 100% con `npm test`
- [x] `npm run lint` y `npm run build` en verde