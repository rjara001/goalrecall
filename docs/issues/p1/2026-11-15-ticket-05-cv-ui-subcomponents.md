# Ticket 1.5: Subcomponentes UI Granulares (< 150 líneas) y Modal Pro Compartido

## Contexto y Objetivo
La vista interna de `CvUploadModal.tsx` contiene ~950 líneas de JSX repartidas en upload, animación de carga, revisión de 3 pestañas complejas (~470 líneas), editor inline y un modal de Plan Pro con ternarios inline en 6 idiomas desconectado del flujo real de Stripe (`AuthContext.upgradeToPro`).

Para cumplir genuinamente la regla de **< 150 líneas por subcomponente** sin prop drilling innecesario:
1. La pantalla de revisión debe dividirse por pestaña en componentes enfocados.
2. El modal de Plan Pro debe extraerse como componente compartido (`src/components/ProUpgradeModal.tsx`) usando `useI18n()` en lugar de ternarios de 6 idiomas inline y conectado a `upgradeToPro` cuando Stripe esté disponible (manteniendo fallback a waitlist).

## Impacto Técnico
- Nuevos componentes en `src/features/cv-upload/components/`:
  - `CvDropzone.tsx` (< 150 líneas) — tabs Archivo/Texto, dropzone, muestra rápida y errores
  - `CvSamplePdfCard.tsx` (< 100 líneas) — tarjeta de PDF de demostración `demo-cv.pdf`
  - `CvQuotaBanner.tsx` (< 100 líneas) — banner cuando se agota la cuota mensual gratuita
  - `CvProcessingState.tsx` (< 60 líneas) — animación y paso actual de procesamiento
  - `CvCompletenessBar.tsx` (< 100 líneas) — barra de completitud y selector de pestañas de revisión
  - `CvPendingTab.tsx` (< 120 líneas) — checklist de campos pendientes por completar
  - `CvRadiographyTab.tsx` (< 150 líneas) — edición de contacto, resumen, skills, experiencias, educación, certificaciones y proyectos
  - `CvBulletsTab.tsx` (< 150 líneas) — lista de logros XYZ seleccionables y editables
  - `CvPendingFieldEditor.tsx` (< 100 líneas) — modal inline de rellenado de campo pendiente
- Nuevo componente compartido: `src/components/ProUpgradeModal.tsx` (< 150 líneas)

## Plan de Pasos Detallado
1. Extraer los subcomponentes de ingestión (`CvDropzone`, `CvSamplePdfCard`, `CvQuotaBanner`) y procesamiento (`CvProcessingState`).
2. Dividir la vista de revisión en `CvCompletenessBar`, `CvPendingTab`, `CvRadiographyTab`, `CvBulletsTab` (eliminando el prop-drilling de props de `CvPendingFieldEditor` que no le correspondían).
3. Extraer `CvPendingFieldEditor.tsx`.
4. Extraer `src/components/ProUpgradeModal.tsx` limpiando los ternarios de 6 idiomas mediante `useI18n()` e integrando `useAuth().upgradeToPro` junto con el fallback de lista de espera (`saveProWaitlistEmail`).

## Criterios de Aceptación
- [ ] Todos los subcomponentes nuevos tienen < 150 líneas
- [ ] Cero ternarios multilenguaje hardcoded en `ProUpgradeModal.tsx` (usa `useI18n()`)
- [ ] Cero prop-drilling de estado de modales hermanos en las pestañas de revisión
- [ ] `npm run lint` y `npm run build` en verde