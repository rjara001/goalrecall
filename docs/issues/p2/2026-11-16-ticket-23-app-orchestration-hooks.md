# Ticket 2.3: Desacoplamiento de `src/App.tsx` en Hooks de Enrutamiento y Workspace

**Prioridad:** P2 (Fase 2 — Paso 3)  
**Archivo objetivo:** `src/App.tsx` (1,406 líneas -> < 450 líneas)

## Alcance
1. Extraer `useAppRouting.ts`: sincronización de URL/hash, vista activa (`landing`, `quarters`, `public-deck`, `features`, `docs`, `offers`), carga de vitrina pública (`/u/:username`).
2. Extraer `useWorkspaceData.ts`: estado de `logs`, `experiences`, `user`, `inbox`, `jobOffers`, `products`, persistencia coordinada y handlers CRUD.
3. Mantener paridad funcional 100% incluyendo atajos (`⌘K`), toasts y bootstrap desde Cloud Sync.
