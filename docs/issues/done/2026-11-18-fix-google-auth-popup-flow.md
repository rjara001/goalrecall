# Plan: Corrección del Flujo de Google Auth Popup y Sincronización

## Contexto y Diagnóstico del Problema

### 1. Síntomas Reportados por el Usuario
- El inicio de sesión con Google estaba fallando en el entorno local.
- Una IA previa intentó solucionarlo realizando modificaciones.
- **Nuevo comportamiento anómalo**: Al hacer clic en "Iniciar sesión con Google", en lugar de abrir el modal popup (`signInWithPopup`) como ocurre en producción, se abre una ventana paralela/redirección (`signInWithRedirect`). Tras completar el proceso, el usuario vuelve a la landing page y el sistema no inicia sesión ni cambia de vista ("no hizo nada").

---

### 2. Diagnóstico de Causa Raíz

#### A. Por qué falló el popup originalmente en local
1. En `.env`, está configurado `VITE_EMULATOR="true"`, por lo que la aplicación conecta al emulador local de Firebase Auth (puerto 9199).
2. En `src/firebase.ts`, se conectaba el emulador apuntando rígidamente a:
   `connectAuthEmulator(auth, "http://127.0.0.1:9199")` (tomado de `VITE_FIREBASE_EMULATOR_AUTH_HOST="127.0.0.1"`).
3. Sin embargo, en el navegador el usuario abre la aplicación en `http://localhost:3010`.
4. Para los navegadores modernos (Chrome/Safari), `localhost` y `127.0.0.1` son **orígenes distintos** (Cross-Origin).
5. Cuando `signInWithPopup` abre el widget del emulador, el script interno del emulador (`sendAuthEventViaIframeRelay` en `firebase-tools/.../widget_ui.js`) intenta comunicarse con la ventana padre mediante `window.opener.frames[i]`.
6. Al existir un mismatch de origen (`localhost:3010` vs `127.0.0.1:9199`), el navegador bloquea la lectura de los frames por seguridad y el emulador lanza la aserción interna:
   `Auth Emulator Internal Error: No matching frame`.

#### B. La mala solución aplicada por la IA previa
1. La IA previa vio el error `Auth Emulator Internal Error: No matching frame` y asumió incorrectamente que el relay de popup del emulador estaba roto sin remedio.
2. Añadió una condición destructiva en `src/components/AuthModal.tsx`:
   ```tsx
   if (isEmulator) {
     try {
       await signInWithRedirect(auth, googleProvider);
     } ...
     return;
   }
   ```
3. Esto forzó el uso de `signInWithRedirect` en lugar de `signInWithPopup`, rompiendo la paridad con producción y cambiando la experiencia de usuario a una navegación completa/ventana paralela.

#### C. Por qué tras el redirect vuelve a la landing y no hace nada
1. Al usar `signInWithRedirect`, la página se recarga por completo perdiendo el estado en memoria de React y el callback `onLogin` del modal nunca se ejecuta.
2. Al recargar en `/`, `activeView` inicializa en `"landing"`.
3. Cuando el emulador crea un usuario mock, si este no tiene la marca de correo verificado (`emailVerified: true`), `src/hooks/useWorkspaceData.ts` ejecuta de inmediato:
   ```ts
   if (!fbUser.emailVerified) {
     await signOut(firebaseAuth);
     resetLocalState();
     ...
   }
   ```
   provocando que el usuario sea desconectado automáticamente en milisegundos y quede en la landing page sin sesión.
4. Además, la IA previa añadió un listener redundante de `onAuthStateChanged` en `useAppRouting.ts` que entra en conflicto con la hidratación principal de `useWorkspaceData.ts`.

---

## Objetivo

1. **Restaurar el comportamiento idéntico a producción**: El botón de Google siempre debe utilizar un **popup (`signInWithPopup`)**, nunca un redirect forzado.
2. **Resolver el error "No matching frame" en el emulador**: Alinear dinámicamente el host del emulador (`window.location.hostname`) para que si el usuario visita `http://localhost:3010`, el SDK conecte a `http://localhost:9199` (y si visita `127.0.0.1`, conecte a `http://127.0.0.1:9199`), suprimiendo advertencias con `{ disableWarnings: true }`.
3. **Limpiar parches defectuosos**: Eliminar el redirect forzado en `AuthModal.tsx`, remover la exportación innecesaria en `firebase.ts` y eliminar el `useEffect` redundante introducido en `useAppRouting.ts`.
4. **Verificar soporte para desarrollo con Firebase Real vs Emulador**: Si el usuario desea probar con cuentas Google reales (como en producción), basta con `VITE_EMULATOR="false"`; si desea emulador, el popup funcionará localmente sin errores de frame.

---

## Impacto Técnico

- **Archivos a modificar**:
  - `src/components/AuthModal.tsx`: Revertir el bloque `if (isEmulator) await signInWithRedirect...`. Mantener el flujo nativo de `signInWithPopup`.
  - `src/firebase.ts`: Resolver el host del emulador usando `window.location.hostname` (garantizando paridad `localhost` o `127.0.0.1`), pasar `{ disableWarnings: true }` a `connectAuthEmulator`, y limpiar la exportación de `isEmulator`.
  - `src/hooks/useAppRouting.ts`: Revertir el `useEffect` redundante con `onAuthStateChanged` que duplicaba la lógica de enrutamiento.
  - Limpieza de archivos temporales/huérfanos si aplica.

---

## Plan de Pasos Detallado

### Paso 1: Creación del Plan
- Documentar el diagnóstico exhaustivo y las acciones en este archivo (`docs/issues/p1/2026-11-18-fix-google-auth-popup-flow.md`).

### Paso 2: Espera de Aprobación Explícita
- **DETENCIÓN INMEDIATA**: Presentar el diagnóstico y el plan al usuario.
- Esperar confirmación antes de modificar código de producción.

### Paso 3: Implementación Controlada
1. **Actualizar `src/firebase.ts`**:
   - Conectar `connectAuthEmulator` usando dinámicamente `window.location.hostname` (o fallback a `authHost`) junto con `{ disableWarnings: true }`.
   - Conectar `connectFirestoreEmulator` alineando el mismo host.
   - Eliminar exportación de `isEmulator`.
2. **Revertir cambios en `src/components/AuthModal.tsx`**:
   - Quitar el condicional `if (isEmulator) { await signInWithRedirect... }`.
   - Asegurar que `handleGoogleLogin` use `signInWithPopup(auth, googleProvider)` de manera uniforme.
3. **Revertir cambios en `src/hooks/useAppRouting.ts`**:
   - Eliminar el `useEffect` con `onAuthStateChanged` redundante.
4. **Validación técnica**:
   - Ejecutar `npm run build` o `npx tsc --noEmit` para garantizar compilación limpia con 0 errores.
   - Validar que las pruebas (`npm test`) sigan pasando.
   - Mover el plan a `docs/issues/done/`.

### Paso 4: Aprobación Final
- Informar al usuario para que verifique el login con popup en su navegador (`localhost:3010`), probando tanto en modo emulador como en modo real.

---

## Criterios de Aceptación y Validación

- [x] Al hacer clic en "Iniciar sesión con Google", se abre un modal emergente (popup) en lugar de recargar la página o abrir pestañas paralelas.
- [x] Host del emulador alineado dinámicamente con `window.location.hostname` para eliminar el error `Auth Emulator Internal Error: No matching frame` en `localhost`.
- [x] Eliminada la redirección forzada destructiva en `src/components/AuthModal.tsx`.
- [x] Eliminado el listener redundante `onAuthStateChanged` en `src/hooks/useAppRouting.ts`.
- [x] Compilación TypeScript (`npx tsc --noEmit`) pasa limpia con 0 errores.
- [x] Build de producción (`npm run build`) exitoso (bundle generado en ~938ms).
- [ ] Validación interactiva en navegador y aprobación final de cierre por parte del usuario (Paso 4).
