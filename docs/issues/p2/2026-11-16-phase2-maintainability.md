# Plan: Phase 2 - Backend Modularization, Domain Storage & App Orchestration

## Contexto y Objetivo
Tras completar la Fase 0 (Quality Gates) y la Fase 1 (`src/features/cv-upload/`), el repositorio cuenta con `tsc --noEmit`, `bun test` y `vite build` en verde como guardrails automáticos. La Fase 2 aplica el mismo principio de cohesión y responsabilidad única sobre los tres mayores focos de deuda estructural restantes:

1. **`server.ts` (2,092 líneas):** Contiene ~1,000 líneas duplicadas del parser/auditor de CV (`src/utils/localCvExtractor.ts`), además de mezclar rate limiting, cliente Gemini, almacenamiento de sincronización en disco y cuatro dominios de rutas Express.
2. **`src/utils/storage.ts` (1,256 líneas):** Concentra en un solo módulo 11 dominios distintos (`experiences`, `logs`, `auth`, `inbox`, `jobOffers`, `products`, `aiQuota`, `backup`, `cloudSync`, `cv`, `keys`).
3. **`src/App.tsx` (1,406 líneas) y vistas > 1,000 líneas:** `App.tsx` gestiona simultáneamente enrutamiento hash/path, carga inicial, keyboard shortcuts, modales y operaciones CRUD de todo el workspace.

---

## Mapa de Tickets (Fase 2)

1. **Ticket 2.1 (`2026-11-16-ticket-21-server-modularization.md`)** — Modularización de `server.ts` (< 90 líneas):
   - Eliminar duplicación en servidor reutilizando `extractCvDataLocally`, `calculateCvAudit` y `cvToAchievements` desde `src/utils/localCvExtractor.ts`.
   - Extraer `server/middleware/rateLimit.ts` y `server/services/{cvBufferExtractor,geminiCvService,cloudSyncStore}.ts`.
   - Extraer routers por dominio en `server/routes/{cv,public,cloudSync,products}.ts`.
   - Cobertura de tests unitarios para `rateLimit` y `cloudSyncStore`.
2. **Ticket 2.2 (`2026-11-16-ticket-22-storage-domain-split.md`)** — División por dominio de `src/utils/storage.ts`:
   - Crear `src/utils/storage/` con submódulos por dominio (`keys`, `experiences`, `logs`, `auth`, `inbox`, `jobOffers`, `products`, `aiQuota`, `backup`, `cloudSync`, `cv`).
   - Mantener `src/utils/storage.ts` como barrel de compatibilidad sin breaking changes en imports existentes.
3. **Ticket 2.3 (`2026-11-16-ticket-23-app-orchestration-hooks.md`)** — Desacoplamiento de `src/App.tsx`:
   - Extraer hooks `useAppRouting`, `useWorkspaceState` y `useCloudBootstrap` dejando `App.tsx` < 450 líneas.
4. **Ticket 2.4 (Post-2.3)** — Descomposición de vistas UI > 1,000 líneas (`TimelineView`, `SettingsBackupModal`, `QuickLogModal`, `AuthModal`).

---

## Criterios de Aceptación Globales de Phase 2
- [x] `npm run lint` (`tsc --noEmit`) pasa con 0 errores
- [x] `npm test` (`bun test`) pasa con 0 errores incluyendo nuevas suites de backend, storage y hooks de `App`
- [x] `npm run build` (`vite build`) pasa con Exit Code 0
- [x] `server.ts` < 90 líneas y cero lógica duplicada de `localCvExtractor.ts`
- [x] `src/utils/storage.ts` dividido por dominio manteniendo compatibilidad total de API pública
- [x] `src/App.tsx` < 450 líneas con enrutamiento, modales y estado de workspace desacoplados en hooks
