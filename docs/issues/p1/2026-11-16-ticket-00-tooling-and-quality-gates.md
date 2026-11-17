# Ticket 1.0: Higiene de Tooling, TypeScript, Tests y CI (Prerrequisito Fase 0)

## Contexto y Objetivo
Antes de refactorizar código de producción, es indispensable contar con **guardrails automatizados confiables**. Hoy:
1. `npm run lint` (`tsc --noEmit`) falla al intentar compilar `functions/src/index.ts` y `functions/src/stripe.ts` desde la raíz (sin los `node_modules` propios de `functions/`).
2. Existen tests unitarios en `src/utils/*.test.ts` (`bun:test`), pero no hay script `"test"` en `package.json` ni ejecución en CI (`.github/workflows/preview.yml` solo ejecuta `bun run build`).
3. `vite.config.ts` hardcodea `APP_VERSION` como `'0.7.1'` mientras `package.json` está en `0.7.5`.

## Impacto Técnico
- `tsconfig.json`
- `package.json`
- `vite.config.ts`
- `.github/workflows/preview.yml`

## Plan de Pasos Detallado
1. **Aislar `functions/` en `tsconfig.json`:**
   - Añadir `"exclude": ["node_modules", "dist", "functions"]` (e incluir `"src"`, `"server.ts"`, `"vite.config.ts"` si aplica) para que `tsc --noEmit` valide estrictamente la app web y `server.ts`.
   - Verificar que `tsc --noEmit` pasa con **0 errores**.
2. **Habilitar scripts de calidad en `package.json`:**
   - Añadir `"test": "bun test"`.
   - Añadir `"lint:functions": "tsc --noEmit -p functions/tsconfig.json"`.
3. **Sincronizar `APP_VERSION` en `vite.config.ts`:**
   - Leer `version` directamente desde `package.json` en lugar de mantener `'0.7.1'` hardcodeado.
4. **Activar Quality Gates en `.github/workflows/preview.yml`:**
   - Ejecutar `bun run lint` y `bun test` antes de `bun run build`.

## Criterios de Aceptación
- [x] `npm run lint` (`tsc --noEmit`) termina con Exit Code 0
- [x] `npm test` (`bun test`) ejecuta todas las suites `*.test.ts` y pasa al 100%
- [x] `npm run build` termina con Exit Code 0 e inyecta la versión real de `package.json`
- [x] `.github/workflows/preview.yml` bloquea PRs si falla `lint`, `test` o `build`
