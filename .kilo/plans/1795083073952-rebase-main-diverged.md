# Plan: reconciliar `main` local con `origin/main` vía rebase

## Contexto

`git pull` falla porque `main` divergió:

- `main` local: 1 commit — `f8b60a8` (`chore: bump version to 0.7.6; add P1 auth email/password + OOB plan`). Toca:
  - `package.json` (0.7.5 → 0.7.6)
  - `src/constants/version.ts` (0.7.5 → 0.7.6)
  - `plans/1795031081734-auth-email-password-oob.md` (nuevo)
  - `docs/tickets/2026-11-18-ticket-07-auth-email-password-oob.md` (nuevo)
- `origin/main`: 3 commits — `9f59cb8` (sync bidireccional experiencias/logros), `98fd18b` (fix compositor Chrome macOS), `8332516` (merge).
- Merge base: `521e0e6`. Remoto sigue en versión `0.7.5`.
- Sin archivos solapados entre ambos lados → no se esperan conflictos.

Decisión del usuario: **rebase local únicamente, sin push**. Los dos stashes existentes pertenecen a otras ramas y no se tocan.

## Tareas (ordenadas)

1. **Preflight**
   - `git fetch origin`
   - `git status -sb` → debe mostrar árbol limpio y `main...origin/main [ahead 1, behind 3]`
   - `git stash list` → solo verificar; no aplicar ni borrar stashes

2. **Respaldo de seguridad**
   - `git branch backup/main-pre-rebase main`

3. **Rebase**
   - `git pull --rebase origin main`
   - Si aparecen conflictos (poco probable):
     - `package.json` y `src/constants/version.ts`: conservar `0.7.6`
     - Cualquier otro archivo: conservar la versión remota y reaplicar solo los archivos de planes/docs del commit local
     - Continuar con `git rebase --continue`
   - Si el rebase queda a medias y se decide abortar: `git rebase --abort`

4. **Validación**
   - `git status -sb` → `main` ahead 1, behind 0
   - `git log --oneline -5` → `f8b60a8` (hash nuevo) encima de `9f59cb8`
   - `git show --stat HEAD` → sigue conteniendo versión 0.7.6 + los dos documentos de plan
   - `node -p "require('./package.json').version"` → `0.7.6`
   - `cat src/constants/version.ts` → `APP_VERSION = '0.7.6'`
   - Confirmar que los cambios remotos de sync están presentes (p. ej. `src/hooks/useWorkspaceData.ts` con las modificaciones de `9f59cb8`)
   - `npm run lint` (`tsc --noEmit`) sobre el árbol combinado

5. **Cierre**
   - No ejecutar `git push` (decisión: solo local)
   - Si las validaciones pasan: `git branch -D backup/main-pre-rebase`
   - Si algo falla: `git reset --hard backup/main-pre-rebase`

## Riesgos y mitigación

- **Conflicto inesperado en versión**: resolver a favor de `0.7.6` (es el cambio intencional del commit local).
- **Pérdida de trabajo local**: cubierto por `backup/main-pre-rebase` antes de rebasar.
- **Stashes ajenos**: no se aplican ni eliminan.
- **Historial reescrito**: solo afecta el commit local no publicado; `origin/main` no se modifica.

## Criterios de aceptación

- `git pull` ya no falla por divergencia.
- `main` contiene tanto el commit de versión 0.7.6 como los 3 commits remotos.
- `npm run lint` pasa.
- `origin/main` permanece intacto (sin push).
