# AGENTS.md - goalrecall

Reglas compartidas del ecosistema: `~/dev-personal/.shared-rules/AGENTS.md`

## ❼ REGISTRO ÚNICO DE PUERTOS (local-first)

Fuente de verdad: `~/.ports-registry.json` (fuera de los repos).
Antes de levantar servidores o configurar emuladores, consulta el registro.

Puertos de ESTE proyecto (`offset: 100`):
- app: 3010 (`server.ts`, configurable con `PORT`)
- auth: 9199
- firestore: 8180
- functions: 5101
- ui: 4100
- hub: 4150
- logging: 4160
- storage: 9198 (reservado; no configurado porque el proyecto no usa Firebase Storage)

No inventes puertos: lee el registro y respeta el rango de ESTE proyecto.
Auditoría: `npm run check:ports` valida `firebase.json`, `server.ts`, `.env.local` y `.env.example` contra el registro.
Arranque: `npm run emulators` y `npm run emulators:all` ejecutan un preflight contra el registro antes de levantar.
Si un puerto está ocupado por un emulador stale de otro proyecto: `npm run emulators:all:autoclean`.