# AGENTS.md - goalrecall

Reglas compartidas del ecosistema: `~/dev-personal/.shared-rules/AGENTS.md`

## ❼ REGISTRO ÚNICO DE PUERTOS (local-first)

Antes de levantar servidores o configurar emuladores, consulta `~/.ports-registry.json`.
Este proyecto tiene `offset: 100` (app 3010, auth 9199, firestore 8180, functions 5101, storage 9198, ui 4100).
No inventes puertos: lee el registro y respeta el rango de ESTE proyecto.
Auditoría rápida: `ports` (tabla + puertos escuchando) y `ports-audit` (colisiones).