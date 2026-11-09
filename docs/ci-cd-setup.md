# Guía de Configuración CI/CD: GitHub Actions & Firebase

Esta guía explica cómo configurar los secretos y variables de entorno en GitHub para que el despliegue automático hacia Firebase funcione de manera continua y segura.

---

## 1. Dónde configurar los Secrets en GitHub

1. Entra a tu repositorio en GitHub: `https://github.com/<tu-usuario-o-org>/<tu-repo>`
2. Ve a la pestaña **Settings** (Configuración del repositorio).
3. En la barra lateral izquierda, dirígete a **Secrets and variables** > **Actions**.
4. Usa el botón verde **New repository secret** para agregar cada una de las claves secretas descritas a continuación.

---

## 2. Secrets Requeridos (Repository Secrets)

| Nombre del Secret | Descripción | Dónde obtenerlo |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_GOALRECALL_BB4D0` | **Requerido para el deploy**. Contenido completo en JSON de la cuenta de servicio de Google Cloud / Firebase. | Google Cloud Console o Firebase Console (ver Paso 3). |
| `VITE_FIREBASE_API_KEY` | API Key pública del SDK web de Firebase para autenticación en producción. | Firebase Console > Project Settings > General > Tus apps (Web app). |
| `VITE_FIREBASE_APP_ID` | App ID de la aplicación web en Firebase. | Firebase Console > Project Settings > General > Tus apps (Web app). |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID para notificaciones / Firebase Cloud Messaging (opcional según uso). | Firebase Console > Project Settings > Cloud Messaging. |
| `GEMINI_API_KEY` | API Key de Google Gemini AI para la extracción de CVs con IA en Cloud Functions. | [Google AI Studio](https://aistudio.google.com/) > Get API Key. |

*(Nota: Las variables `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_AUTH_DOMAIN` y `VITE_FIREBASE_STORAGE_BUCKET` tienen valores por defecto apuntando a `goalrecall-bb4d0`, pero puedes sobreescribirlas si lo deseas).*

---

## 3. Cómo generar la Cuenta de Servicio (`FIREBASE_SERVICE_ACCOUNT_GOALRECALL_BB4D0`)

Para que GitHub Actions pueda desplegar tanto **Hosting** como **Cloud Functions** en Firebase sin requerir intervención manual:

### Opción Rápida con Firebase CLI (Recomendada):
En tu terminal local con la CLI de Firebase instalada y logueada:
```bash
firebase init hosting:github
```
* Te preguntará por el repositorio GitHub (`usuario/repo`).
* Creará automáticamente la cuenta de servicio con los roles necesarios y la guardará como secret en tu repositorio GitHub con el nombre `FIREBASE_SERVICE_ACCOUNT_GOALRECALL_BB4D0`.

### Opción Manual desde Google Cloud Console:
1. Ingresa a la consola de Google Cloud: [https://console.cloud.google.com/iam-admin/serviceaccounts?project=goalrecall-bb4d0](https://console.cloud.google.com/iam-admin/serviceaccounts?project=goalrecall-bb4d0)
2. Haz clic en **+ Crear cuenta de servicio** (ej. nombre: `github-actions-deployer`).
3. Asigna los siguientes roles:
   - **Administrador de Firebase** (`roles/firebase.admin`) o **Firebase Hosting Admin** + **Cloud Functions Admin**.
   - **Usuario de cuenta de servicio** (`roles/iam.serviceAccountUser`).
   - **Visor de Service Usage** (`roles/serviceusage.serviceUsageConsumer`).
4. Haz clic en la cuenta de servicio recién creada > pestaña **Claves** (Keys) > **Agregar clave** > **Crear nueva clave** > seleccionar formato **JSON**.
5. Se descargará un archivo `.json`. Abre ese archivo con un editor de texto, copia todo su contenido (incluyendo las llaves `{...}`) y pégalo como el valor del secret `FIREBASE_SERVICE_ACCOUNT_GOALRECALL_BB4D0` en GitHub.

---

## 4. Configurar el Secret `GEMINI_API_KEY` en Firebase Cloud Functions

La Cloud Function `apiExtractCv` lee la clave de Gemini AI. Para desplegarla de manera segura en el entorno de Firebase Functions:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```
O bien desde Google Cloud Console en **Secret Manager** (`projects/goalrecall-bb4d0/secrets/GEMINI_API_KEY`).

---

## 5. Flujo de Trabajo (Workflow)

- **Push a `main`:**
  1. Instala dependencias con Bun y Node.js.
  2. Ejecuta todos los tests unitarios (`bun test`). Si falla, cancela el despliegue para proteger producción.
  3. Construye el frontend con Vite (`bun run build`).
  4. Compila la Cloud Function (`cd functions && npm run build`).
  5. Despliega Firebase Hosting a producción (canal en vivo `live`).
  6. Despliega Firebase Cloud Functions (`apiExtractCv`).

- **Pull Requests hacia `main`:**
  1. Corre tests y construye la app.
  2. Crea un **Preview Channel** temporal con una URL única de vista previa para probar los cambios antes de mezclar.
