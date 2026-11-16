# Ticket 1.6: Re-cableado en `src/features/cv-upload/` y Reducción del Contenedor

## Contexto y Objetivo
Re-ensamblar `CvUploadModal` como un contenedor visual delgado (< 200 líneas) dentro del vertical slice `src/features/cv-upload/`, exponiendo una API pública limpia a través de `src/features/cv-upload/index.ts` y manteniendo compatibilidad en `src/components/CvUploadModal.tsx`.

## Impacto Técnico
- Nuevo: `src/features/cv-upload/components/CvUploadModal.tsx` (< 200 líneas)
- Nuevo: `src/features/cv-upload/index.ts` (barrel export del feature slice)
- Modificado: `src/components/CvUploadModal.tsx` (re-export limpio desde `../features/cv-upload` para compatibilidad con imports existentes)

## Plan de Pasos Detallado
1. Mover el contenedor final a `src/features/cv-upload/components/CvUploadModal.tsx`:
   - Consumir únicamente `useCvUpload(...)`.
   - Renderizar según `phase` (`CvDropzone`, `CvProcessingState`, `CvCompletenessBar` + tab activa), `CvPendingFieldEditor` y `ProUpgradeModal`.
   - Mantener solo header, modal shell y footer.
2. Crear `src/features/cv-upload/index.ts` exportando `CvUploadModal` y tipos públicos del feature.
3. Dejar `src/components/CvUploadModal.tsx` como re-export (`export { CvUploadModal } from "../features/cv-upload";`).
4. Validación integral:
   - `npm run lint` (`tsc --noEmit`) — 0 errores
   - `npm test` (`bun test`) — 100% verde
   - `npm run build` (`vite build`) — Exit Code 0
   - Verificación en navegador del flujo completo (PDF de muestra `demo-cv.pdf`, texto pegado, edición de campo pendiente, selección de viñetas y guardado en bitácora/perfil).

## Criterios de Aceptación
- [ ] `src/features/cv-upload/components/CvUploadModal.tsx` tiene < 200 líneas
- [ ] `npm run lint`, `npm test` y `npm run build` pasan con Exit Code 0
- [ ] Cero regresiones funcionales en el flujo de carga de CV y actualización de bitácora/perfil