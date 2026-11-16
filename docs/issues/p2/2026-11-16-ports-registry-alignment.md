# Ticket: Alinear goalrecall con ~/.ports-registry.json y prevenir drift de puertos

## Contexto y Objetivo
goalrecall ya tiene los puertos correctos tras el commit `41db619`, pero los valores están duplicados manualmente en `firebase.json`, `.env.local`/`.env.example`, `server.ts` y `AGENTS.md`. No existe un mecanismo que lea `~/.ports-registry.json` ni que detecte desalineaciones. Además `PORT` está hardcodeado en `server.ts` y el script `emulators` no cubre todos los emuladores configurados.

Objetivo:
- Hacer `PORT` configurable sin cambiar el default `3010`.
- Agregar `npm run check:ports` que compare los archivos del repo contra `~/.ports-registry.json` y falle si hay drift.
- Documentar `storage` (`9198`) como reservado, no configurado (el proyecto no usa Firebase Storage).
- Agregar `npm run emulators:all` para levantar `auth`, `firestore`, `functions` y `ui`.
- Agregar un **preflight runtime** (`scripts/preflight-ports.mjs`) que verifique los puertos del registro antes de arrancar emuladores y detecte procesos stale de otros proyectos.
- Actualizar `AGENTS.md` con la tabla completa y los comandos de auditoría/arranque.

## Impacto Técnico
- `server.ts` (constante `PORT`)
- `package.json` (scripts `check:ports`, `emulators`, `emulators:all`, `emulators:autoclean`)
- `scripts/check-ports.mjs` (nuevo)
- `scripts/preflight-ports.mjs` (nuevo)
- `.env.example` (documentar `PORT`)
- `AGENTS.md` (tabla de puertos y auditoría)
- `docs/issues/p2/2026-11-16-ports-registry-alignment.md` (este plan)

## Plan de Pasos Detallado
1. Parametrizar `PORT` en `server.ts`: `const PORT = Number(process.env.PORT) || 3010;`.
2. Crear `scripts/check-ports.mjs`: leer `~/.ports-registry.json`, extraer `goalrecall` y validar:
   - `firebase.json` → `emulators.{auth,firestore,functions,ui,hub,logging}.port`
   - `server.ts` → `PORT`
   - `.env.example` → `VITE_FIREBASE_EMULATOR_AUTH_PORT` (obligatorio)
   - `.env.local` → `VITE_FIREBASE_EMULATOR_AUTH_PORT` (si existe; es local y no versionado)
   - `storage` se reporta como reservado si no está configurado.
   - Exit code 1 si hay discrepancias.
3. Agregar scripts en `package.json`:
   - `"check:ports": "node scripts/check-ports.mjs"`
   - `"emulators": "node scripts/preflight-ports.mjs auth firestore hub logging && firebase emulators:start --only auth,firestore"`
   - `"emulators:all": "node scripts/preflight-ports.mjs auth firestore functions ui hub logging && firebase emulators:start --only auth,firestore,functions,ui"`
   - `"emulators:autoclean"`: igual que `emulators` pero con `--auto-clean` para terminar procesos stale.
4. Crear `scripts/preflight-ports.mjs`: para cada puerto del registro, detectar listeners con `lsof`; si el proceso pertenece a otro proyecto y el puerto no está en su configuración actual, se considera stale. Con `--auto-clean` termina el árbol del proceso y vuelve a verificar.
5. Documentar `PORT` opcional en `.env.example`.
6. Actualizar `AGENTS.md` con los puertos completos, el estado de `storage` y los comandos `npm run check:ports`, `npm run emulators` y `npm run emulators:all:autoclean`.

## Criterios de Aceptación
- [ ] `npm run check:ports` termina con exit code 0 y muestra todos los puertos alineados.
- [ ] `npm run lint` (`tsc --noEmit`) pasa.
- [ ] `server.ts` respeta `PORT` del entorno y mantiene `3010` por defecto.
- [ ] `AGENTS.md` no afirma que el emulador de Storage esté activo.
- [ ] No se modifica lógica de negocio ni se agregan dependencias.
- [ ] `check:ports` es una herramienta local: requiere `~/.ports-registry.json`, no se ejecuta en CI.
- [ ] `preflight-ports.mjs` detecta el proceso stale de burnball en `9199` y lo identifica por PID/comando.
- [ ] `npm run emulators:all:autoclean` libera `9199` y levanta auth/firestore/functions/ui.