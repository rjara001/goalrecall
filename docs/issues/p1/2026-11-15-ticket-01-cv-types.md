# Ticket 1.1: Contrato de Tipos para CV Upload

## Contexto y Objetivo
El componente `CvUploadModal.tsx` (1,831 líneas) define internamente la interfaz `ExtractedBullet` (líneas 70-87) y maneja múltiples tipos de datos del flujo de CV. El primer paso de la refactorización es aislar todas las interfaces, estados del modal y estructuras de datos en un archivo dedicado `src/types/cv.ts` para establecer el contrato de tipos.

## Impacto técnico
- Archivos afectados: `src/components/CvUploadModal.tsx`, `src/types/index.ts`
- Tipos existentes en `src/types/index.ts`: `ExtractedCvData`, `CvPendingField`, `CvExperience`, `CvEducation`, `CvCertification`, `CvProject`, `CvLanguage`, `CvContact`
- Tipo interno en `CvUploadModal.tsx`: `ExtractedBullet` (líneas 70-87)
- Tipo en `src/utils/localCvExtractor.ts`: `ExtractedAchievementItem`, `LocalExtractionResult`

## Plan de pasos detallado

### Paso 1: Crear `src/types/cv.ts`
1. Definir interfaz `ExtractedBullet` (mover desde `CvUploadModal.tsx` líneas 70-87):
   - Campos: `id`, `client`, `project`, `category`, `title`, `description`, `impact`, `whatWasSought?`, `whyImportant?`, `howApplied?`, `tags`, `xyzScore`, `metricHighlight?`, `originalText?`, `selected`, `isEditing?`
2. Definir interfaz `CvExtractionPayload`:
   - Campos: `fileName`, `textContent?`, `fileBase64?`, `mimeType?`, `forceLocal?`
3. Definir interfaz `CvExtractionResponse`:
   - Campos: `cvData: ExtractedCvData`, `achievements: ExtractedAchievementItem[]`, `pendingFields: CvPendingField[]`, `completenessScore: number`, `engine: string`
4. Definir tipo `CvExtractionStatus`:
   - Valores: `"idle" | "loading" | "success" | "error"`
5. Exportar todos los tipos desde `src/types/index.ts` para mantener backward compatibility

### Paso 2: Actualizar `src/types/index.ts`
1. Re-exportar todos los tipos desde `src/types/cv.ts`
2. Verificar que no hay dependencias circulares

### Paso 3: Actualizar `src/components/CvUploadModal.tsx`
1. Reemplazar la definición local de `ExtractedBullet` por import desde `../types`
2. Reemplazar `any` en payloads por `CvExtractionPayload`

## Criterios de aceptación
- [ ] El archivo `src/types/cv.ts` compila sin errores con `npx tsc --noEmit`
- [ ] No existen dependencias circulares con otros módulos
- [ ] `src/types/index.ts` re-exporta todos los nuevos tipos correctamente
- [ ] `CvUploadModal.tsx` usa los tipos importados en lugar de definiciones locales