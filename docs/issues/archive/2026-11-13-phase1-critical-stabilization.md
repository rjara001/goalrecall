> **[ARCHIVADO — OBSOLETO]** Este documento referenciaba archivos inexistentes en la rama `main` (`use-features-view.ts`, `storage-experiences.ts`, `storage-logs.ts`, `use-cv-modal.ts`) y métricas desactualizadas. Reemplazado por `docs/issues/p1/2026-11-15-phase1-stabilization.md` y los Tickets `1.0` a `1.6`.

# Plan: Phase 1 - Critical Stabilization

## Contexto y Objetivo
Corregir errores OxC/TS que bloquean el build y asegurar que todos los componentes UI están bajo 500 líneas. El proyecto tiene 5 errores OxC remaining y varios errores TS en hooks/utils.

## Impacto técnico
- Archivos afectados: PublicDeck.tsx, QuickLogModal.tsx, TimelineView.tsx, use-features-view.ts, storage-experiences.ts, storage-logs.ts
- Errores OxC: 5 remaining (lines 53/15, 171/1, 118/35, etc.)
- Errores TS: use-cv-modal.ts (~90 errors), storage files (3 each)
- UI components: 7/7 under 500 lines ✅

## Plan de pasos detallado

### Fase 1A: Fix OxC errors (componentes)
1. PublicDeck.tsx:53:15 - Ternary operator restructuring
2. QuickLogModal.tsx:171:1 - Function closing syntax fix  
3. TimelineView.tsx:118:35 - FEATURE_ICONS inline comment removal
4. use-features-view.ts:21:53 - Inline comments in functions

### Fase 1B: Fix TS errors (hooks/utils)
5. storage-experiences.ts:2:40 - Import type syntax
6. storage-logs.ts:7:2 - Import type syntax  
7. use-cv-modal.ts:98-216 - 90+ TS errors (regex/closure issues)

### Validación
- `npx vite build` debe pasar (0 errores OxC o conocidos)
- `npx tsc --noEmit` debe pasar (0 errores TS en archivos objetivo)
- 7 UI components < 500 lines (verificado ✅)
- 3 e2e flows funcionales (verificado ✅)

### Criterios de aceptación
- Build pasa limpio localmente
- No hay regresiones en flujos e2e
- Types compile sin errores en archivos objetivo

## Paso 2: Espera de Aprobación Explícita
Mostrar este plan y esperar luz verde antes de tocar código de producción.

## Paso 3: Implementación
Implementar siguiendo reglas técnicas Vite+GCP+Firestore. Al finalizar, mover archivo a `docs/issues/done/`.

## Paso 4: Aprobación final
Presentar resumen y pasos de prueba. Issue cerrado con aprobación del usuario.