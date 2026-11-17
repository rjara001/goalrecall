# Plan: Phase 1 - Stabilization, Tooling & Maintainability Architecture

## Contexto y Diagnóstico Real del Repositorio
Este documento consolida la revisión de arquitectura sobre el estado real del código (`main` @ `41db619+`) con el objetivo central de **mejorar la mantenibilidad de la aplicación**:

- **Estado real de compilación y quality gates:**
  - `vite build` compila en verde (`Exit Code 0`), pero `vite.config.ts` hardcodea `'0.7.1'` mientras `package.json` está en `0.7.5`.
  - `npx tsc --noEmit` falla actualmente **únicamente en `functions/src/*.ts`** porque el `tsconfig.json` raíz no excluye `functions/` (que tiene su propio `tsconfig.json` y `node_modules`).
  - Existen suites de tests (`src/utils/*.test.ts`) usando `bun:test`, pero no existe script `"test"` en `package.json` ni verificación automatizada de `lint` + `test` en `.github/workflows/preview.yml`.
- **Deuda estructural real (archivos > 500 líneas):**
  - `server.ts` (2,092 líneas), `src/components/CvUploadModal.tsx` (1,831), `src/App.tsx` (1,406), `TimelineView.tsx` (1,323), `SettingsBackupModal.tsx` (1,270), `src/utils/storage.ts` (1,256), `LandingPage.tsx` (1,252), `QuickLogModal.tsx` (1,153), `AuthModal.tsx` (1,116), entre otros (16 componentes UI superan las 500 líneas).
- **Punto de partida de Fase 1:**
  - Se sanea primero la base de tooling/CI (**Ticket 1.0**) para tener `tsc --noEmit`, `bun test` y `vite build` en verde como guardrails reales.
  - Se ejecuta la refactorización vertical del módulo piloto más complejo (`cv-upload`, **Tickets 1.1 – 1.6**) estableciendo el patrón arquitectónico reproducible para Fase 2 (`server.ts`, `App.tsx`, `TimelineView.tsx`, `storage.ts`).

---

## Mapa de Tickets y Orden de Ejecución

### Fase 0 (Prerrequisito — Quality Gates)
- **Ticket 1.0 (`2026-11-16-ticket-00-tooling-and-quality-gates.md`):** Excluir `functions` de root `tsconfig.json`, añadir `"lint:functions"` y `"test": "bun test"` en `package.json`, sincronizar versión en `vite.config.ts`, y habilitar `lint` + `test` en `.github/workflows/preview.yml`.

### Fase 1 (Vertical Slice Piloto: `src/features/cv-upload/`)
1. **Ticket 1.1 (`2026-11-15-ticket-01-cv-types.md`):** Contrato estricto en `src/types/cv.ts` (eliminar `any`, usar `LogCategory`, mover `ExtractedAchievementItem` y `LocalExtractionResult` desde `localCvExtractor.ts` sin ciclos, añadir `CvFallbackReason`, re-exportar en `src/types/index.ts`).
2. **Ticket 1.2 (`2026-11-15-ticket-02-cv-parser-service.md`):** Servicio puro `cvFileParser.ts` + `constants.ts` (límite consistente de 2 MB y 15,000 chars en archivo y texto, evitar enviar `fileBase64` redundante cuando ya hay texto válido, rechazar `.doc` binario con mensaje claro, y unit tests).
3. **Ticket 1.3 (`2026-11-15-ticket-03-cv-ai-service.md`):** Servicio HTTP puro `cvAiExtractor.ts` (sin dependencias directas a `firebase` ni `storage.ts`, con `AbortController` timeout, `fallbackReason` explícito, y unit tests con `fetch` mockeado).
4. **Ticket 1.4 (`2026-11-15-ticket-04-use-cv-upload-hook.md`):** Mapper puro de dominio `cvImportMapper.ts` (con unit tests) + máquina de estados explícita en `useCvUpload.ts` + extracción de `SAMPLE_CV_TEXT` a `data/sampleCv.ts`, manteniendo `App.tsx` como única fuente de verdad de persistencia/sync.
5. **Ticket 1.5 (`2026-11-15-ticket-05-cv-ui-subcomponents.md`):** Subcomponentes realmente < 150 líneas dividiendo `CvReviewForm` por pestaña (`CvCompletenessBar`, `CvPendingTab`, `CvRadiographyTab`, `CvBulletsTab`), eliminando prop drilling innecesario y extrayendo `ProUpgradeModal` compartido conectado a `useI18n()` y `AuthContext.upgradeToPro`.
6. **Ticket 1.6 (`2026-11-15-ticket-06-cv-modal-rewire.md`):** Mover `CvUploadModal.tsx` dentro de `src/features/cv-upload/components/` (< 200 líneas) con barrel `src/features/cv-upload/index.ts` (y re-export compatible en `src/components/CvUploadModal.tsx`), validado con `lint`, `test` y `build`.

### Fase 2 (Roadmap de Mantenibilidad Post-P1)
- Modularización de `server.ts` (2,092 líneas) por rutas y servicios (`routes/cv`, `routes/public`, `routes/sync`, `routes/products`, `services/gemini`).
- Desacoplamiento de `src/App.tsx` (1,406 líneas) en hooks de enrutamiento y estado de workspace.
- División por dominio de `src/utils/storage.ts` (1,256 líneas) y componentes UI grandes (`TimelineView`, `SettingsBackupModal`, `QuickLogModal`, `AuthModal`).

---

## Criterios de Aceptación Globales de Phase 1
- [x] `npm run lint` (`tsc --noEmit`) pasa con 0 errores
- [x] `npm test` (`bun test`) pasa con 0 errores incluyendo los nuevos tests de `cvFileParser`, `cvAiExtractor` y `cvImportMapper`
- [x] `npm run build` (`vite build`) pasa con Exit Code 0
- [x] `CvUploadModal.tsx` < 200 líneas y todos los subcomponentes < 150 líneas
- [x] Cero regresiones funcionales en carga PDF/DOCX/TXT, texto pegado, auditoría de campos pendientes, extracción local/IA y guardado en bitácora/perfil