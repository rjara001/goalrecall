# Ticket 2.1: Modularización de `server.ts` por Rutas, Servicios y Middleware

**Prioridad:** P1 (Fase 2 — Paso 1)  
**Archivo objetivo:** `server.ts` (2,092 líneas -> < 90 líneas)

## Diagnóstico
- `server.ts` duplica ~1,000 líneas de `src/types/index.ts` y `src/utils/localCvExtractor.ts` (`extractFullCvLocally`, `calculateCvAudit`, `cvToAchievements`).
- `/api/cv/extract-achievements` muta `req.url` e invoca `app._router.handle`, acoplamiento frágil interno de Express.
- El rate limiter de IA, la extracción binaria PDF/DOCX, el prompt/schema de Gemini y el almacén de archivos `data/cloud_sync` no tienen aislamiento ni unit tests.

## Alcance
1. Crear `server/middleware/rateLimit.ts` (+ `rateLimit.test.ts`).
2. Crear `server/services/cvBufferExtractor.ts` (PDF con `pdf-parse`, DOCX con `mammoth`, fallback texto UTF-8).
3. Crear `server/services/geminiCvService.ts` (cliente perezoso `@google/genai`, schema estricto, sanitización y auditoría reutilizando `calculateCvAudit` / `cvToAchievements`).
4. Crear `server/services/cloudSyncStore.ts` (+ `cloudSyncStore.test.ts`) parametrizable por `baseDir` para tests aislados.
5. Crear routers Express en `server/routes/{cv,public,cloudSync,products}.ts`.
6. Reducir `server.ts` a entrypoint de montaje de middleware, routers y Vite/dist.

## Criterios de Aceptación
- `server.ts` < 90 líneas.
- Cero duplicación de `extractFullCvLocally` / `calculateCvAudit` / `cvToAchievements`.
- `bun test` y `tsc --noEmit` en verde.
- Todos los endpoints `/api/cv/*`, `/api/public/*`, `/api/cloud-sync/*`, `/api/products/*` mantienen contrato exacto.
