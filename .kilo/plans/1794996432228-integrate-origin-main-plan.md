# Plan: Integrar `origin/main` en `main` (Opción B — reset + cherry-pick)

## Contexto

`main` local y `origin/main` divergieron desde el ancestro común `41db619`:

- **Local (2 commits):** `8e07de0` (cv-upload vertical slice + phase1), `60a1c83` (ports registry).
- **Remoto (2 commits):** `a654a05` (P1/Phase2 + Etapa2 + React hooks), `7fe523e` (migración a Firestore + Google Auth).

Hallazgos clave:
- `8e07de0` ya está contenido en `origin/refactor/phase1-cv-upload` y `origin/refactor/phase2-server-storage`; `origin/main` trae una versión **más evolucionada** del mismo refactor (CvUploadModal 278 vs 190 líneas; useCvUpload 528 vs 459; + server modularizado, Firestore, storage por dominios, hooks).
- El único delta **realmente local-only** (no upstream) es `60a1c83` + los cambios staged en `.env.example`/`functions/.env.example`.

**Decisión:** Opción B. Descartar del `main` los commits locales duplicados (cv-upload ya está upstream) y recuperar solo el delta local-only. Historia lineal, conflictos mínimos.

## Archivos / áreas afectadas

- `src/features/cv-upload/*`, `src/components/CvUploadModal.tsx`, `src/components/ProUpgradeModal.tsx`, `server.ts`, `tsconfig.json`, `vite.config.ts`, `src/types/*`: se resuelven tomando la versión de `origin/main` (reset).
- Delta a reaplicar (`60a1c83`): `.env.example`, `AGENTS.md`, `docs/issues/p2/2026-11-16-ports-registry-alignment.md`, `package.json`, `scripts/check-ports.mjs` (nuevo), `scripts/preflight-ports.mjs` (nuevo), `server.ts` (PORT, 2 líneas).
- Staged a preservar: `.env.example`, `functions/.env.example`.

## Tareas (ordenadas)

1. **Preservar lo staged.** Guardar los cambios staged de `.env.example` y `functions/.env.example`:
   - `git stash push -m "env example wip" -- .env.example functions/.env.example`
   - Alternativa: `git commit -m "chore(env): add server/stripe env examples"` (recuperable por reflog).
2. **Reset a remoto.** `git reset --hard origin/main` → `main` = `7fe523e`.
3. **Recuperar puertos.** `git cherry-pick 60a1c83`.
   - Conflictos esperados solo en `package.json` (unir scripts, no sobrescribir los del remoto) y `server.ts` (tras la modularización el `PORT`/default puede vivir en otro módulo; verificar el archivo real y descartar el cambio de 2 líneas si quedó obsoleto).
   - `.env.example`, `AGENTS.md`, `docs/issues/p2/...ports-registry-alignment.md`, `scripts/*` aplican limpio.
4. **Reaplicar env staged.** `git stash pop` → reconciliar `.env.example` (Stripe / NODE_ENV / PORT / VITE_GEMINI_API_KEY / DISABLE_HMR) con lo aplicado en el paso 3. Resolver solapamientos manualmente.
5. **Validar.**
   - `npm install` (package.json cambió dependencias/scripts).
   - `npm run build` / typecheck.
   - `npm test`.
   - `npm run check:ports` (valida `firebase.json`, `server.ts`, `.env.local`, `.env.example` contra `~/.ports-registry.json`).
6. **Push.** `git push` (main ahead 1 por el cherry-pick, fast-forward sobre `origin/main`).

## Riesgos y mitigaciones

- **`server.ts` obsoleto:** el remoto redujo `server.ts` de ~2057 a modular. El cambio de `PORT` de `60a1c83` puede ser redundante o estar en otro archivo (`server/` nuevo). Mitigación: inspeccionar `server.ts` post-reset y ubicar dónde se lee `PORT`.
- **Conflicto en `package.json`:** ambos ramas añadieron scripts. Mitigación: resolver por unión (conservar scripts del remoto + `check:ports`, `preflight-ports`, `emulators:*`).
- **`.env.example` doble edición:** el cherry-pick y el stash tocan el mismo archivo. Mitigación: aplicar cherry-pick primero, luego `stash pop` y fusionar a mano.
- **No perder commits:** `8e07de0` sobrevive en `origin/refactor/phase1-cv-upload` y `origin/refactor/phase2-server-storage`; `60a1c83` se recupera vía cherry-pick y reflog. Antes del reset, confirmar con `git branch -r --contains 8e07de0` y guardar `git rev-parse HEAD` por si acaso.

## Validación / Definition of Done

- `git log --oneline -3` muestra `origin/main` + el cherry-pick de puertos.
- `git status` limpio (sin stash pendiente).
- `npm run build`, typecheck y `npm test` en verde.
- `npm run check:ports` en verde.
- `main` pusheado y en fast-forward con `origin/main`.

## Fuera de alcance

- Resolver la duplicación del refactor cv-upload (se resuelve tomando `origin/main` íntegro).
- Cualquier cambio funcional nuevo más allá del delta local-only.