# Plan: Phase 1 - Critical Stabilization (Build Green)

## Contexto y Objetivo
Corregir errores OxC/TS que bloquean el build y asegurar que todos los componentes UI están bajo 500 líneas. El proyecto tiene errores de compilación que impiden `npx tsc --noEmit` y `npx vite build` en verde.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx` (1,831 líneas - god component), `src/utils/localCvExtractor.ts` (818 líneas), `src/utils/pdfExtractor.ts`, `src/utils/docxExtractor.ts`
- Errores TS detectados en análisis de código: posibles problemas de tipado en `CvUploadModal.tsx` (uso de `any` en payloads, castings inexistentes)
- UI components: `CvUploadModal.tsx` supera 500 líneas (1,831), `localCvExtractor.ts` es utilitario no-componente (818 líneas es aceptable)
- Validación previa: `docs/issues/done/2026-11-13-refactoring-plan-four-phases.md` ya identificó esta necesidad

## Plan de pasos detallado

### Fase 1A: Verificación inicial de compilación
1. Ejecutar `npx tsc --noEmit` para obtener lista exacta de errores
2. Ejecutar `npx vite build` para verificar errores de build
3. Documentar errors encontrados

### Fase 1B: Fix errores TS en CvUploadModal.tsx
1. Revisar uso de `any` en `payload` (líneas ~316, ~404, ~450)
2. Revisar castings de tipos en `extractedBullets.map` (línea ~522)
3. Revisar `handleUpdateContactField` typing (línea ~641)
4. Verificar imports de `../types` estén completos

### Fase 1C: Fix errores en utilitarios
1. `src/utils/localCvExtractor.ts` - verificar tipos de retorno
2. `src/utils/pdfExtractor.ts` - verificar `pdfjsLib` types
3. `src/utils/docxExtractor.ts` - verificar `mammoth` types

### Fase 1D: Validación final
1. `npx tsc --noEmit` pasa con 0 errores
2. `npx vite build` exitoso (Exit Code 0)
3. Verificar que no se introdujeron regressiones en funcionalidad existente

## Criterios de aceptación
- [ ] `npx tsc --noEmit` pasa con cero errores
- [ ] `npx vite build` completo con éxito
- [ ] No hay regresiones en flujos de CV upload (extraer, editar, guardar)
- [ ] El archivo `CvUploadModal.tsx` sigue siendo funcionalmente idéntico (solo se corrigen errores de tipado)

## Paso 2: Espera de Aprobación Explícita
Mostrar este plan y esperar luz verde antes de tocar código de producción.

## Paso 3: Implementación
Implementar siguiendo reglas técnicas Vite+GCP+Firestore. Al finalizar, mover archivo a `docs/issues/done/`.

## Paso 4: Aprobación final
Presentar resumen y pasos de prueba. Issue cerrado con aprobación del usuario.