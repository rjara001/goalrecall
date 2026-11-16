# Ticket 1.5: Subcomponentes de Interfaz de Usuario

## Contexto y Objetivo
El componente `CvUploadModal.tsx` contiene toda la lógica de renderizado en un único archivo de 1,831 líneas, incluyendo tres vistas principales (upload, processing, review) y un modal secundario de edición de campos pendientes. El quinto paso de la refactorización es dividir las vistas internas del modal en componentes pequeños y enfocados (menos de 150 líneas cada uno).

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, nuevos componentes en `src/features/cv-upload/components/`
- Vistas identificadas en CvUploadModal.tsx:
  - Upload/Ingestion screen (líneas 873-1115)
  - Processing animation (líneas 1117-1138)
  - Review/Audit checklist (líneas 1140-1608)
  - Quick in-line filling modal (líneas 1642-1705)
  - Pro Plan/Waitlist modal (líneas 1707-1828)

## Plan de pasos detallado

### Paso 1: Crear `src/features/cv-upload/components/CvDropzone.tsx`
1. Extraer la vista de subida de archivos (líneas 873-1115):
   - Tabs de método (archivo / texto)
   - Dropzone de arrastre
   - Card de PDF de demostración
   - Banner de cuota agotada
   - Mensajes de error
2. Props: `onFileSelect`, `onPasteText`, `onLoadSamplePdf`, `activeTab`, `onTabChange`, `pastedCvText`, `onPastedTextChange`, `quotaExhausted`, `errorMessage`, `onRunLocalExtractor`, `onShowProModal`, `aiUsage`, `isLoadingSamplePdf`

### Paso 2: Crear `src/features/cv-upload/components/CvProcessingState.tsx`
1. Extraer la animación de procesamiento (líneas 1117-1138)
2. Props: `processingStep`, `isProcessing`

### Paso 3: Crear `src/features/cv-upload/components/CvReviewForm.tsx`
1. Extraer la vista de revisión (líneas 1140-1608):
   - Barra de completitud y auditoría
   - Sub-tabs (pendientes, radiografía, viñetas)
   - Checklist de campos pendientes
   - Radiografía completa del CV
   - Lista de viñetas para importar
2. Props: `extractedCv`, `pendingFields`, `completenessScore`, `extractedBullets`, `reviewTab`, `onReviewTabChange`, `onUpdateContactField`, `onToggleSelectBullet`, `onToggleSelectAll`, `onRemoveBullet`, `onOpenFillPending`, `onSaveFilledField`, `activeFieldEditing`, `quickFieldValue`, `onQuickFieldValueChange`

### Paso 4: Crear `src/features/cv-upload/components/CvPendingFieldEditor.tsx`
1. Extraer el modal de edición de campos pendientes (líneas 1642-1705)
2. Props: `activeFieldEditing`, `quickFieldValue`, `onQuickFieldValueChange`, `onSave`, `onClose`

### Paso 5: Crear `src/features/cv-upload/components/CvProPlanModal.tsx`
1. Extraer el modal de Plan Pro (líneas 1707-1828)
2. Props: `showProModal`, `onClose`, `proEmail`, `onProEmailChange`, `proEmailSaved`, `onSaveProEmail`, `language`

## Criterios de aceptación
- [ ] Cada subcomponente recibe props tipadas estrictamente
- [ ] Cada subcomponente tiene menos de 150 líneas
- [ ] Diseño responsivo y consistente con la UI existente
- [ ] `npx tsc --noEmit` pasa en verde