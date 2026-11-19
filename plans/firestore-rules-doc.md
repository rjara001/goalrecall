# Plan: Documentación de Firestore Rules

## Objetivo
Documentar las reglas de seguridad en `firestore.rules` para que el equipo entienda permisos, validaciones y flujos de guardado.

## Alcance
- Reglas por colección/subcolección (users, logs, experiences, products, certifications, careerGoals, offers, inbox, etc.)
- Funciones auxiliares: `isSelf`, `isOwner`, `hasParentUser`, `isValid*`.
- Matriz de operaciones permitidas (create/read/update/delete) por rol/estado de verificación.
- Casos de error comunes (PERMISSION_DENIED, hasParentUser, affectedKeys).

## Entregables
1. `docs/firestore-rules.md` con resumen y ejemplos.
2. Sección en `README` enlazando la documentación.
3. Notas de cambios recientes (relajación de `hasParentUser` en update de logs/experiences).

## Estado actual
- Funcionando: `isSelf` en logs/experiences (create/update/delete) permite guardar sin email verificado.
- Quitado: `hasParentUser` de `update` en logs y experiences para evitar bloqueos cuando falta el doc padre.
- Pendiente: documentar reglas por colección, matriz de permisos, ejemplos y referencias en README.
2. Documentar funciones y validaciones clave.
3. Añadir ejemplos de payloads válidos/ inválidos.
4. Revisar con el equipo y ajustar.
5. Publicar y referenciar en README.
