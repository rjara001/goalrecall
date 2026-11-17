# Ticket 1.4: Mapper Puro de Dominio (`cvImportMapper`) y Hook `useCvUpload`

## Contexto y Objetivo
`CvUploadModal.tsx` gestiona ~20 `useState` independientes (permitiendo estados imposibles entre carga, error, cuota y revisión) y mezcla dentro de `handleSaveAndApply` (líneas 668–799) lógica de negocio pesada que escribe directamente a `localStorage` (`saveStoredCv`, `saveExperiences`) por fuera de `App.tsx`.

Para mejorar la mantenibilidad real:
1. La transformación de un CV extraído a `{ updatedUser, updatedExperiences, newLogs }` debe ser una **función pura de dominio** (`cvImportMapper.ts`), fácil de testear sin DOM ni `localStorage`.
2. El estado del flujo en `useCvUpload.ts` debe modelarse con una **fase explícita** (`phase: "upload" | "processing" | "quota_exceeded" | "review"`).
3. `SAMPLE_CV_TEXT` (78 líneas hardcoded) debe salir del componente UI hacia `data/sampleCv.ts`.

## Impacto Técnico
- Nuevo: `src/features/cv-upload/data/sampleCv.ts`
- Nuevo: `src/features/cv-upload/services/cvImportMapper.ts`
- Nuevo: `src/features/cv-upload/services/cvImportMapper.test.ts`
- Nuevo: `src/features/cv-upload/hooks/useCvUpload.ts`
- Modificado: `src/components/CvUploadModal.tsx`

## Plan de Pasos Detallado
1. **Mover `SAMPLE_CV_TEXT` a `src/features/cv-upload/data/sampleCv.ts`.**
2. **Crear `src/features/cv-upload/services/cvImportMapper.ts`:**
   - `mapRawAchievementsToBullets(achievements: ExtractedAchievementItem[]): ExtractedBullet[]`
   - `computeUpdatedCvField(cv, pendingFields, editing, value)` (actualización inmutable + recálculo de `completenessScore` sin mutar objetos existentes)
   - `buildWorkspaceImportFromCv({ extractedCv, selectedBullets, existingExperiences, currentUser, sourceFileName })`:
     - Devuelve `{ updatedUser, updatedExperiences, newLogs }` sin mutar arrays de entrada ni invocar `localStorage`.
   - Cubrir con unit tests en `cvImportMapper.test.ts` (matching de empresas existentes, creación de nuevas experiencias, vinculación `experienceId` en logs, privacidad `isPublic: false` por defecto).
3. **Crear `src/features/cv-upload/hooks/useCvUpload.ts`:**
   - Reemplazar booleanos sueltos por `phase: "upload" | "processing" | "quota_exceeded" | "review"` junto con el estado de edición/revisión.
   - Orquestar `cvFileParser`, verificación de cuota (`checkCanUseAi`), token de `auth`, `cvAiExtractor` y registro de cuota (`recordAiUsage` solo cuando `usedAi === true`).
   - Exponer aviso no bloqueante (`fallbackNotice`) cuando aplique `fallbackReason`.
   - En `handleSaveAndApply`: delegar a `buildWorkspaceImportFromCv`, guardar CV estructurado (`saveStoredCv`), sincronizar experiencias/perfil/logs mediante los callbacks de `App.tsx` y cerrar.
   - Resincronizar `aiUsage` cuando `isOpen` pase a `true`.

## Criterios de Aceptación
- [x] `cvImportMapper.ts` es 100% puro e inmutable y pasa sus unit tests en `npm test`
- [x] `useCvUpload` elimina estados imposibles mediante `phase` explícito
- [x] `SAMPLE_CV_TEXT` ya no reside en `CvUploadModal.tsx`
- [x] `npm run lint` y `npm run build` en verde