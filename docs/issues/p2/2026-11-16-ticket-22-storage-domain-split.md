# Ticket 2.2: División por Dominio de `src/utils/storage.ts`

**Prioridad:** P1 (Fase 2 — Paso 2)  
**Archivo objetivo:** `src/utils/storage.ts` (1,256 líneas) -> módulos en `src/utils/storage/` + barrel re-export.

## Alcance
1. Extraer submódulos cohesivos:
   - `src/utils/storage/keys.ts` (`STORAGE_KEYS` y helpers seguros de lectura/escritura JSON)
   - `src/utils/storage/experiencesStorage.ts`
   - `src/utils/storage/logsStorage.ts`
   - `src/utils/storage/authStorage.ts`
   - `src/utils/storage/inboxStorage.ts`
   - `src/utils/storage/jobOffersStorage.ts`
   - `src/utils/storage/productsStorage.ts`
   - `src/utils/storage/aiQuotaStorage.ts`
   - `src/utils/storage/cvStorage.ts`
   - `src/utils/storage/backupStorage.ts`
   - `src/utils/storage/cloudSyncClient.ts`
2. Mantener `src/utils/storage.ts` re-exportando todas las firmas actuales para evitar romper imports en 20+ componentes.
3. Añadir unit tests para cuotas de IA (`aiQuotaStorage.test.ts`) y sanitización/cálculo de hash en sync/backup.
