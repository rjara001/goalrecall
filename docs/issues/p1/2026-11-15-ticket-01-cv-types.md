# Ticket 1.1: Contrato Estricto de Tipos para CV Upload

## Contexto y Objetivo
`src/types/cv.ts` fue creado parcialmente en `41db619`, pero presenta deuda que impide seguridad de tipos real:
- `CvExtractionResponse` usa `any` en `cvData`, `achievements` y `pendingFields`.
- `ExtractedBullet.category` está tipado como `string` en lugar de `LogCategory`.
- `CvUploadModal.tsx` sigue definiendo su propia interfaz local `ExtractedBullet` (líneas 70–87) y usando `any` en `pendingPayload`, `payload` y `data`.
- `src/types/index.ts` aún no re-exporta `src/types/cv.ts`.
- `ExtractedAchievementItem` y `LocalExtractionResult` viven en `src/utils/localCvExtractor.ts` (que importa de `../types`), por lo que importarlos desde `src/types/cv.ts` generaría una **dependencia circular**.

## Impacto Técnico
- `src/types/cv.ts`
- `src/types/index.ts`
- `src/utils/localCvExtractor.ts` (mover tipos hacia `src/types/cv.ts` y re-exportarlos por compatibilidad)
- `src/components/CvUploadModal.tsx`

## Plan de Pasos Detallado
1. **Completar `src/types/cv.ts` sin `any` ni ciclos:**
   - Importar `LogCategory`, `ExtractedCvData`, `CvPendingField` desde `./index` (solo tipos, sin depender de `utils/`).
   - Mover `ExtractedAchievementItem` y `LocalExtractionResult` desde `src/utils/localCvExtractor.ts` a `src/types/cv.ts`.
   - Tipar `ExtractedBullet` con `category: LogCategory`.
   - Definir `CvFallbackReason = "unauthenticated" | "network" | "server_error" | "timeout" | "forced_local"`.
   - Tipar `CvExtractionResponse` con `cvData: ExtractedCvData`, `achievements: ExtractedAchievementItem[]`, `pendingFields: CvPendingField[]`, `completenessScore: number`, `engine: string`, `fallbackReason?: CvFallbackReason`.
2. **Actualizar `src/utils/localCvExtractor.ts` y `src/types/index.ts`:**
   - Re-exportar `ExtractedAchievementItem` y `LocalExtractionResult` desde `localCvExtractor.ts` para preservar compatibilidad con tests/consumidores.
   - Re-exportar `export * from "./cv"` desde `src/types/index.ts`.
3. **Limpiar `src/components/CvUploadModal.tsx`:**
   - Eliminar la definición local de `ExtractedBullet`.
   - Importar `ExtractedBullet`, `CvExtractionPayload`, `CvExtractionResponse` desde `../types`.
   - Reemplazar `any` en `pendingPayload`, `payload`, `data` y `rawAchievements.map`.

## Criterios de Aceptación
- [x] `src/types/cv.ts` no contiene ningún `any`
- [x] Cero dependencias circulares (`types/` no importa desde `utils/`)
- [x] `src/types/index.ts` re-exporta todos los tipos de `./cv`
- [x] `CvUploadModal.tsx` usa los tipos importados y compila sin errores en `npm run lint`