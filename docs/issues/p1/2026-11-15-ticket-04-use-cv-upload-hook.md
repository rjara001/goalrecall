# Ticket 1.4: Custom Hook de Orquestación (`useCvUpload`)

## Contexto y Objetivo
El componente `CvUploadModal.tsx` gestiona todo el estado del flujo de CV (15+ estados `useState`) y la lógica de negocio (procesamiento, extracción, edición, guardado). El cuarto paso de la refactorización es centralizar este estado y lógica en un hook reutilizable `src/features/cv-upload/hooks/useCvUpload.ts`, dejando el componente como contenedor visual puro.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, `src/features/cv-upload/services/cvFileParser.ts`, `src/features/cv-upload/services/cvAiExtractor.ts`, `src/utils/storage.ts`
- Estados en CvUploadModal.tsx (líneas 186-224): `activeTab`, `reviewTab`, `selectedFile`, `pastedCvText`, `isDragging`, `isProcessing`, `processingStep`, `errorMessage`, `extractedCv`, `pendingFields`, `completenessScore`, `extractedBullets`, `extractionEngine`, `activeFieldEditing`, `quickFieldValue`, `aiUsage`, `quotaExhausted`, `pendingPayload`, `showProModal`, `proEmail`, `proEmailSaved`, `isLoadingSamplePdf`

## Plan de pasos detallado

### Paso 1: Crear `src/features/cv-upload/hooks/useCvUpload.ts`
1. Definir interfaz `UseCvUploadReturn` con todos los estados y métodos expuestos
2. Implementar el hook con los siguientes métodos:
   - `handleFileSelect(file: File)` - orchestrar validación + extracción + IA
   - `handlePasteText(text: string, customName?: string)` - mismo flujo para texto pegado
   - `handleRunLocalExtractor()` - forzar extractor local
   - `handleSaveFilledField()` - guardar campo editado
   - `handleUpdateContactField(key, val)` - editar campo de contacto
   - `toggleSelectBullet(id)` - seleccionar viñeta
   - `toggleSelectAll(select)` - seleccionar todas
   - `removeBullet(id)` - eliminar viñeta
   - `handleSaveAndApply()` - guardar CV y aplicar a bitácora/perfil
   - `resetState()` - reiniciar todos los estados
   - `handleOpenFillPending(field)` - abrir editor de campo pendiente
   - `handleLoadSamplePdf()` - cargar PDF de demostración

### Paso 2: Actualizar `src/components/CvUploadModal.tsx`
1. Reemplazar todas las definiciones de `useState` por llamada al hook
2. Reemplazar todos los `const handleX = ...` por destructuring del hook
3. El componente debe ser puramente presentacional (sin lógica de negocio)

## Criterios de aceptación
- [ ] El componente visual ya no gestiona directamente la lógica de negocio ni llamadas asíncronas pesadas
- [ ] Estado totalmente tipado con `CvExtractionStatus`
- [ ] El hook es reutilizable (podría usarse en otros contextos)
- [ ] `npx tsc --noEmit` pasa en verde