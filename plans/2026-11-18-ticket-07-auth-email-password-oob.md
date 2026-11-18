# Ticket 07: Autenticación usuario/contraseña con verificación OOB y login por username

## Contexto y Objetivo

El login por usuario/contraseña existió hasta `3274656` y se eliminó en `7fe523e` ("migrate full app persistence to Cloud Firestore with verified Google Auth") por incompatibilidad con el modelo de seguridad actual:

- `firestore.rules:25-30` exige `request.auth.token.email_verified == true` y `request.auth.uid == userId`.
- `firestore.rules:83` solo admite `authProvider == 'google'` al crear `users/{uid}`.
- `src/hooks/useWorkspaceData.ts:260` desloguea automáticamente a cualquier usuario no verificado.
- `src/components/auth/UnauthenticatedAuthView.tsx` solo ofrece Google; no hay formulario email/password.
- La implementación anterior guardaba cuentas y contraseñas en `localStorage`, lo cual no es aceptable.

Objetivo: permitir registro e inicio de sesión con **username o email + contraseña**, verificación de correo mediante el mecanismo OOB de Firebase y recuperación de contraseña, sin credenciales en `localStorage` ni emails en documentos públicos.

## Impacto Técnico

### Reglas y seguridad

- `firestore.rules`: añadir `isSelf(userId)` (signed-in + uid match, sin `isVerifiedEmail`); `isValidUserProfile`: `data.authProvider in ['google', 'password']`; nueva `match /loginIndex/{handle}`; nueva `match /meta/{docId}` dentro de `match /users/{userId}`.
- `firebase-blueprint.json`: enum de `authProvider` y entidad/colección `loginIndex`.
- `security_spec.md`: documentar loginIndex sin PII, reserva no verificada y action URL.
- `firestore.rules.test.ts`: 13 colecciones top-level, `loginIndex`, `authProvider` password, `isSelf`.

### Tipos y repositorio

- `src/types/index.ts`: `authProvider?: "google" | "password"`.
- `src/utils/firestore/repository.ts`: `buildInitialProfileFromAuth` (derivar provider desde `fbUser.providerData`), `ensureUserProfileDoc` (leer `users/{uid}/meta/login`), `saveUserProfileFirestore` y `saveCvAndApplyBatchFirestore` (preservar `existing.authProvider`), `checkUsernameAvailabilityFirestore` (consultar `loginIndex/{handle}` además de `publicShowcases`), helpers `readLoginHandle(uid)`, `reserveLoginHandle(handle, uid)`, `moveLoginHandle(from, to, uid)`.
- `src/utils/firestore/sanitizer.ts`: verificar que payloads create/update aceptan `authProvider: 'password'`.

### Firebase client

- `src/firebase.ts`: exportar `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendEmailVerification`, `sendPasswordResetEmail`, `applyActionCode`, `verifyPasswordResetCode`, `confirmPasswordReset`, `updateProfile`, `reload`.
- Configurar `auth.languageCode` desde el idioma activo de `useI18n` antes de enviar emails.

### API server

- `server/services/authIdentityToolkit.ts` (nuevo): `normalizeIdentifier`, `resolveEmailByIdentifier`, `verifyPassword`, `sendPasswordReset`; REST `accounts:lookup`, `accounts:signInWithPassword`, `accounts:sendOobCode`; base URLs conmutable emulador/producción; nunca loggear identificadores ni contraseñas.
- `server/routes/auth.ts` (nuevo): `POST /login`, `POST /password-reset`, rate limit y mapeo de errores genéricos.
- `server.ts`: montar `/api/auth` y cargar `.env.local` en desarrollo (`dotenv` con path explícito).
- `server/middleware/rateLimit.ts`: añadir limitador de auth (10/min login, 5/min reset por IP).
- `functions/src/authApi.ts` (nuevo): `apiAuth` con la misma lógica REST (duplicada por `rootDir: "src"` de functions).
- `functions/src/index.ts`: `export { apiAuth } from "./authApi";`.
- `firebase.json`: rewrite `/api/auth/**` -> `apiAuth` antes del catch-all.

### Estado y UI

- `src/hooks/useWorkspaceData.ts`: quitar auto-signOut de no verificados; añadir estado y handlers de verificación; exponerlos.
- `src/App.tsx`: early return de `<AuthActionView />` cuando `pathname.startsWith('/auth/action')`; abrir auth modal si `?auth=login`.
- `src/components/AppModals.tsx`: pasar `pendingVerification`, `onResendVerification`, `onRefreshVerification` al `AuthModal`.
- `src/components/AuthModal.tsx`: modos `login | register | forgot`; vista de verificación pendiente.
- `src/components/auth/UnauthenticatedAuthView.tsx`: formularios login/registro/forgot con username o email, password, confirmación y errores.
- `src/components/auth/PendingVerificationView.tsx` (nuevo).
- `src/components/auth/AuthActionView.tsx` (nuevo): forward verify/recover, reset in-app, estados de éxito/error.
- `src/utils/auth/authApi.ts` (nuevo): fetch tipado a `/api/auth/*`.
- `src/utils/authIdentifier.ts` (nuevo): normalización y detección email/handle.
- i18n: `src/i18n/types.ts` + 6 traducciones (`es`, `en`, `pt`, `fr`, `de`, `ja`) con: identificador, forgot, reset, nueva contraseña, verificación, reenvío, errores OOB, rate limit y mensajes genéricos.
- `src/components/auth/authLocales.ts`: retirar textos obsoletos o mover los nuevos aquí.

## Plan de Pasos Detallado

1. **Firebase Console (manual, prerrequisito)**:
   - Authentication > Sign-in method: habilitar Email/Password.
   - Authentication > Settings: habilitar "One account per email address"; revisar Authorized domains (`goalrecall.com`, `www.goalrecall.com`, `localhost`, dominios de hosting).
   - Authentication > Templates: "Customize action URL" a `https://goalrecall.com/auth/action`; revisar plantillas de verificación y reset.
2. **Reglas y contratos**: `firestore.rules`, `firebase-blueprint.json`, `security_spec.md`, `firestore.rules.test.ts`.
3. **Tipos y repositorio**: provider password, meta handle, disponibilidad y helpers de loginIndex.
4. **Cliente Firebase**: exports y utilidades de identificador.
5. **API server**: servicio REST, rutas Express, rate limit, env, `apiAuth` y rewrite.
6. **Estado de auth**: `useWorkspaceData`, props y gating de verificación.
7. **Ruta `/auth/action`**: forward hosted, reset in-app y estados.
8. **UI**: formularios, pending verification, forgot y i18n.
9. **Tests y validación**: unit tests + build + manual emulador.

## Modelo de datos y contratos

### `loginIndex/{handle}` (nueva colección top-level)

```ts
{
  uid: string;          // request.auth.uid
  createdAt: Timestamp; // serverTimestamp()
}
```

Reglas:
- `get`: público si `isValidUsernameHandle(handle)`.
- `list`: denegado.
- `create`: `isSelf(request.auth.uid)`, `incoming().uid == request.auth.uid`, `createdAt == request.time`, claves solo `uid`/`createdAt`.
- `update`: solo el dueño, sin cambiar `uid`/`createdAt`.
- `delete`: solo el dueño.

No se exige `email_verified` para reservar; se acepta el riesgo de squatting de handles no verificados.

### `users/{uid}/meta/login` (subcolección privada)

```ts
{
  handle: string;
  updatedAt: Timestamp;
}
```

Reglas: `get/create/update/delete` solo con `isSelf(userId)` y `docId == 'login'`. No contiene PII.

### API server

`POST /api/auth/login`
- request: `{ identifier: string; password: string }`
- 200: `{ email: string }`
- 401 (genérico): `{ error: "INVALID_CREDENTIALS" }`
- 429: `{ error: "TOO_MANY_REQUESTS" }`

`POST /api/auth/password-reset`
- request: `{ identifier: string }`
- 200 siempre: `{ ok: true }`

### Variables de entorno

- `FIREBASE_WEB_API_KEY` (fallback `VITE_FIREBASE_API_KEY`).
- `FIREBASE_PROJECT_ID`, `FIREBASE_FIRESTORE_DATABASE_ID`.
- `APP_URL` para `continueUrl` (fallback al origin del request).
- Emulador: `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST` o las variables `VITE_FIREBASE_EMULATOR_*` existentes.
- Añadir a `.env.example`, `.env` y `functions/.env.example`.

## Criterios de Aceptación

- [ ] Se puede registrar con nombre, username, email y contraseña.
- [ ] El handle queda reservado en `loginIndex` aun antes de verificar.
- [ ] El correo de verificación se envía con OOB y `/auth/action` reenvía correctamente al widget hospedado en producción.
- [ ] Un usuario no verificado puede reenviar el correo y comprobar el estado sin cerrar sesión.
- [ ] Un usuario no verificado no puede leer ni escribir datos privados en Firestore.
- [ ] Login funciona con email y con username.
- [ ] Reset de contraseña funciona con email y con username, sin revelar si la cuenta existe.
- [ ] `authProvider` se guarda como `'password'` para cuentas nuevas y se preserva `'google'` para las existentes.
- [ ] Ningún email aparece en `loginIndex`, `publicShowcases` ni documentos públicos.
- [ ] Ninguna contraseña ni cuenta se guarda en `localStorage`.
- [ ] `npm run lint`, `npm test`, `npm run build` y `npm run lint:functions` pasan.

## Validación manual (emulador)

1. `VITE_EMULATOR=true`, `npm run emulators:all` y `npm run dev`.
2. Registro con username/email/password.
3. En Auth Emulator UI (puerto 4100), abrir el email de verificación y usar el `oobCode` en `/auth/action?mode=verifyEmail&oobCode=...`.
4. Comprobar que la sesión pasa a verificada y que se hidrata Firestore.
5. Cerrar sesión y entrar con username; repetir con email.
6. Solicitar reset con username; abrir el enlace OOB en `/auth/action`, definir nueva contraseña y entrar.
7. Verificar en Firestore que `loginIndex` solo contiene `uid`/`createdAt` y que un usuario no verificado recibe `permission-denied`.

## Riesgos y mitigaciones

- **Action URL global**: la personalización en Console afecta verificación, reset y recover. El forward a hosted se implementa en `/auth/action` para respetar el híbrido.
- **Squatting de handles**: `loginIndex` permite reservar sin verificar. Mitigación futura: job de limpieza de reservas no verificadas > 7 días o rate limit por IP.
- **Doble verificación de contraseña** en login por username: el server valida y el cliente vuelve a autenticar con Firebase. Se acepta para evitar Admin SDK/custom tokens; no se loggea la contraseña.
- **Rate limit en Cloud Functions**: el limitador en memoria es por instancia; es best-effort. Considerar App Check o contadores en Firestore en un P2.
- **Emulador**: el link OOB del emulador puede no respetar la action URL custom; para pruebas se usa `applyActionCode` in-app y el `oobCode` de la UI.
- **Cuentas Google existentes**: no tienen password; no podrán usar login por username hasta un P2 que permita vincular `EmailAuthProvider`.

## Fuera de alcance

- Vincular email/password a cuentas Google existentes (`linkWithCredential`).
- MFA, cambio de email, magic link, borrado de cuenta y recuperación de cuenta.
- Endpoint server-side para cambio de username (se hará con batch cliente + reglas).
- App Check y limpieza automática de reservas no verificadas.
