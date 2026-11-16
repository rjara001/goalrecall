# Ticket 1.6: Re-cableado y Reducción del God Component

## Contexto y Objetivo
El componente `CvUploadModal.tsx` es actualmente un "god component" de 1,831 líneas que mezca UI, lógica de negocio, gestión de estado, y servicios. El sexto y último paso de la refactorización es reescribir `CvUploadModal.tsx` para que actúe exclusivamente como contenedor visual y orquestador liviano, reduciéndolo a menos de 300 líneas.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, `src/features/cv-upload/hooks/useCvUpload.ts`, `src/features/cv-upload/components/*.tsx`
- Componentes creados en ticket 1.5: `CvDropzone.tsx`, `CvProcessingState.tsx`, `CvReviewForm.tsx`, `CvPendingFieldEditor.tsx`, `CvProPlanModal.tsx`
- Hook creado en ticket 1.4: `useCvUpload`

## Plan de pasos detallado

### Paso 1: Reescribir `src/components/CvUploadModal.tsx`
1. Eliminar todas las definiciones de estado y funciones locales
2. Consumir el hook `useCvUpload` para obtener estados y métodos
3. Renderizar los subcomponentes de la carpeta `src/features/cv-upload/components/`:
   - `CvDropzone` para la vista de upload
   - `CvProcessingState` para la vista de procesamiento
   - `CvReviewForm` para la vista de revisión
   - `CvPendingFieldEditor` para el modal de edición
   - `CvProPlanModal` para el modal de Plan Pro
4. Mantener solo el contenedor principal (header, body, footer) y la lógica de apertura/cierre

### Paso 2: Verificar compilación y build
1. Ejecutar `npx tsc --noEmit` - debe pasar con 0 errores
2. Ejecutar `npx vite build` - debe completar con éxito (Exit Code 0)

### Paso 3: Verificar funcionalidad
1. Flujo de subida de archivo (PDF, DOCX, TXT) funciona igual que antes
2. Flujo de pegado de texto funciona igual que antes
3. Flujo de edición de campos pendientes funciona igual que antes
4. Flujo de guardado y aplicación a bitácora funciona igual que antes
5. Modal de Plan Pro funciona igual que antes

## Criterios de aceptación
- [ ] `CvUploadModal.tsx` tiene menos de 300 líneas
- [ ] `npx tsc --noEmit` pasa con cero errores
- [ ] `npx vite build` completo con éxito (Exit Code 0)
- [ ] El flujo completo de subida de CV funciona exactamente igual que antes de la refactorización
- [ ] No se introdujeron anti-patrones de la sección ➍ de AGENTS.md