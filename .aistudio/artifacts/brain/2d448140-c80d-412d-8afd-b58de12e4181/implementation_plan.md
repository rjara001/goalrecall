# Plan de Persistencia Unificada en Firestore y Corrección Integral de Guardado

Plan arquitectónico para migrar toda la lectura y escritura de datos de negocio hacia **Firebase Firestore** como única fuente de verdad remota, exigir **Google Auth verificado** en todas las operaciones privadas, eliminar la dependencia de memoria volátil y almacenamiento local del navegador, y transformar la experiencia de guardado en flujos confirmados con reporte explícito de errores en la interfaz.

---

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Preferencias arquitectónicas confirmadas para ejecutar este plan:
> - **Motor de Persistencia Único**: **Solo Firestore** mediante el SDK de Firebase en cliente y **Cloud Functions** en servidor para operaciones públicas o privilegiadas; se eliminará la escritura paralela en archivos locales de desarrollo y endpoints huérfanos.
> - **Identidad y Seguridad**: **Exigir Google Auth** para toda lectura y escritura de datos privados en base de datos, desactivando el acceso anónimo silencioso, las cuentas locales sin verificación y el botón de acceso rápido de desarrollo para escrituras reales.
> - **Confirmación Real al Guardar**: Todos los flujos (iniciando por la carga de CV) **esperarán la confirmación efectiva (`await`) de Firestore** antes de cerrar modales o mostrar notificaciones de éxito, exhibiendo errores detallados e inline si algo falla.
> - **Cero Espejo en `localStorage`**: **Leer y escribir exclusivamente en la base remota** para todos los dominios de usuario (bitácora, experiencias, CV, perfil, productos, certificaciones, plan de carrera, ofertas e inbox), eliminando estados duplicados y desincronizaciones al recargar.

> [!WARNING]
> **Requisito previo de aprovisionamiento**: Dado que actualmente el proyecto no cuenta con la configuración activa de cliente Firebase ni con reglas de seguridad desplegadas en este entorno, el primer paso de ejecución consistirá en aprovisionar la instancia de Firestore y habilitar la configuración oficial mediante el flujo interactivo de Firebase antes de escribir las reglas y servicios.

---

## 1. Visión General y Levantamiento Completo de Funcionalidades

### Diagnóstico Raíz del Fallo Actual

La auditoría reveló cuatro rupturas estructurales encadenadas que provocaban que botones como **"Guardar CV y Aplicar a mi Bitácora"** simularan éxito sin escribir un solo byte en base de datos:

1. **Almacenamiento en Memoria Volátil sin Respaldo Real**: La mayoría de los módulos de dominio solo mutan objetos en memoria RAM del navegador, perdiéndose por completo al recargar la página.
2. **Desconexión de Identidad y Credenciales**: El cliente Firebase carece de credenciales activas en este entorno y, además, intentaba iniciar sesión anónima silenciosa cuando el usuario entraba con cuenta local, generando identificadores desconectados de la cuenta real.
3. **Rutas de Sincronización Partidas**: La sincronización en segundo plano invocaba rutas HTTP exclusivas de Cloud Functions que devuelven error 404 en el servidor Express local, mientras que los errores de red y respuestas no exitosas se capturaban en silencio sin notificar a la interfaz.
4. **Cierre Prematuro y Datos Truncados**: Los modales disparaban la actualización del perfil antes de consolidar logros, cerraban la ventana de inmediato y lanzaban toasts de confirmación verde sin esperar ni verificar la respuesta de la base de datos.

### Inventario Completo de Módulos Afectados (Lectura y Escritura)

| Módulo / Funcionalidad | Problema Actual de Lectura / Escritura | Corrección Planificada en Firestore |
| :--- | :--- | :--- |
| **Carga y Auditoría de CV** | Guarda en memoria RAM, aplica perfil antes que logros, cierra modal sin esperar red y omite errores de guardado. | Bloqueo visual de guardado con `await` atómico sobre documento de CV, perfil, experiencias y logros en lote; retiene modal abierto ante error. |
| **Bitácora de Logros (Timeline / QuickLog / Pegar Bullets)** | Mutaciones en RAM; alternar público/privado, duplicar o borrar no persiste tras recargar. | Escritura directa por documento en subcolección de logros del usuario con espera de confirmación y sincronización automática con la vitrina pública. |
| **Experiencias Laborales** | Creación, edición, eliminación y extracción de logros viven solo en RAM. | Subcolección dedicada por usuario para experiencias; extracción de bullets opera de forma transaccional y confirmada. |
| **Vitrina de Productos** | Guardado en RAM sin usar rutas reales ni confirmar persistencia remota. | Subcolección de productos del usuario con reflejo filtrado de ítems públicos hacia la vitrina compartida. |
| **Certificaciones Técnicas** | Dependía de `localStorage` + sync roto; además las Cloud Functions omiten certificaciones al publicar vitrinas. | Subcolección en Firestore e inclusión explícita de certificaciones públicas dentro del documento de vitrina compartida. |
| **Plan de Carrera (Career Goals)** | Dependía de `localStorage` + sync en segundo plano fallido; se pierde al cambiar de navegador. | Subcolección privada en Firestore para metas, estados e ítems de acción; nunca expuesta en vistas públicas. |
| **Ofertas Laborales y Match ATS** | Vive únicamente en RAM; ofertas analizadas desaparecen al refrescar. | Subcolección dedicada de ofertas laborales con validación estricta de esquema y espera de guardado. |
| **Buzón (Inbox) e Ingesta Git/Jira** | Vive solo en RAM; el esquema de estado en nube ni siquiera incluye `inbox` y los recados de visitantes no llegan al dueño desde otro navegador. | Subcolección privada de inbox para dueño + envío seguro de mensajes de reclutadores vía Cloud Function autenticada por App/Admin SDK hacia el buzón destino. |
| **Perfil, Username Handle y Avatar** | Cuentas locales volátiles, comprobación de usuario contra disco local en Express y riesgo de campos `undefined` rechazados por Firestore. | Registro atómico de perfil privado, reserva de alias únicos en colección de vitrinas públicas e índice de handles verificado en Firestore. |
| **Vitrina Pública (`/u/:handle`), Badge SVG y Widget** | Lectura fragmentada entre disco local y Cloud Functions desactualizadas. | Lectura unificada desde Firestore (colección de vitrinas públicas) servida de forma consistente por Cloud Functions. |
| **Cuotas IA, Lista Pro y Pagos Stripe** | Contadores mensuales de IA y correos waitlist en `localStorage`; llamada a Stripe sin ruta conectada en hosting. | Registro de consumo IA por usuario autenticado y documento de waitlist en Firestore; alineación del endpoint de sesión de pago. |
| **Respaldo JSON en Ajustes y Enrutamiento** | Importar backup escribía localmente y el enrutador inicial comprobaba `localStorage` antes de hidratar sesión real. | Enrutamiento reactivo guiado por el observador real de Firebase Auth y carga inicial directa desde Firestore; importación JSON ejecuta escritura en lote confirmada. |

---

## 2. Experiencia de Usuario y Diseño Visual

En consonancia con una arquitectura de consola ejecutiva SaaS de superficie única, alto contraste y cero ruido visual, el flujo de persistencia introducirá estados explícitos y honestos:

### A. Flujos Clave de Interacción

1. **Inicio de Sesión y Enrutamiento Reactivo (Zero-State -> Espacio Privado)**:
   - Al cargar la aplicación, la verificación inicial de conectividad contra Firestore y el estado de Firebase Auth muestran un estado de carga esqueleto limpio sin saltos entre la landing y el espacio de trabajo.
   - Si el usuario no está autenticado con Google, las vistas protegidas y botones de acción ("Subir CV", "Nuevo Logro", "Guardar Experiencia", etc.) muestran una puerta de acceso clara exigiendo **"Continuar con Google"** para habilitar la bóveda remota.
   - Las pestañas obsoletas de registro local con contraseña en memoria y acceso Dev sin cuenta Google desaparecen de la interfaz principal para garantizar que ningún usuario invierta tiempo creando datos que no puedan escribirse en Firestore.

2. **Flujo de Guardado Confirmado (CV Upload y Todos los Modales)**:
   - Al presionar **"Guardar"**, el botón entra en estado activo de sincronización (`Guardando en la nube...` con spinner sutil), deshabilitando doble envío y cierre accidental.
   - Si ocurre un fallo (permisos denegados, cuota diaria excedida, pérdida de red o tamaño máximo superado), el modal **permanece abierto** conservando todo lo editado por el usuario y renderiza una alerta inline de error legible (color carmesí `#DC2626` acompañado siempre de icono y texto descriptivo, nunca solo color) con botón directo de **"Reintentar guardado"**.
   - Solo tras la resolución exitosa de las promesas de escritura en Firestore se cierra el modal y se emite la notificación de confirmación (`Guardado verificado en la nube`).

3. **Indicadores de Estado en Vistas de Datos**:
   - Cada vista (Bitácora, Experiencias, Productos, Certificaciones, Metas, Ofertas, Inbox) implementa los cuatro estados completos: **Poblado**, **Vacío** (con llamada directa a crear el primer registro), **Cargando** (esqueletos geométricos estables) y **Error recuperable** (con límite de error global `ErrorBoundary` ante fallos de permisos).
   - Tipografía legible con numerales tabulares (`tabular-nums`) para contadores de logros, porcentajes de completitud de CV, cuotas de IA y fechas, eliminando cápsulas decorativas estáticas alrededor de etiquetas de estado.

---

## 3. Decisiones Clave de Producto y Compensaciones

1. **Modelo de Subcolecciones Granulares vs. Documento Único Monolítico**:
   - *Enfoque elegido*: Dividir el almacenamiento del usuario en un documento raíz de perfil privado más **subcolecciones tipadas por entidad** (logros, experiencias, CV, productos, certificaciones, metas, ofertas e inbox) en lugar de un único documento `state/main`.
   - *Por qué*: Un solo documento corre riesgo real de superar el **límite estricto de 1 MiB de Firestore** cuando un usuario sube CVs extensos, avatares y decenas de logros; además permite actualizaciones puntuales sin reescribir todo el workspace y evita colisiones al modificar un logro mientras se edita una experiencia.
   - *Alternativa descartada*: Seguir usando `users/{uid}/state/main` con `merge: true`, descartado por límite de tamaño, sobrescritura de arreglos completos y dificultad para validar esquema granular por entidad en `firestore.rules`.

2. **Lectura y Escritura Directa con SDK de Firestore vs. Proxy HTTP Completo**:
   - *Enfoque elegido*: Operaciones privadas CRUD e hidratación mediante **Firebase Firestore SDK** en cliente (aseguradas por `firestore.rules` y verificando conectividad al inicio), reservando **Cloud Functions** para operaciones que requieren secretos de servidor o acceso cruzado sin sesión del dueño: extracción IA de CV con Gemini, lectura pública optimizada `/u/:username`, recepción de mensajes de visitantes reclutadores y sesión de pago Stripe.
   - *Por qué*: Aprovecha las garantías offline temporales del SDK oficial, latencia mínima, suscripciones en tiempo real (`onSnapshot`) autenticadas y eliminación total de rutas rotas entre entorno local y producción.
   - *Alternativa descartada*: Enrutar cada clic de formulario a través de un endpoint Express/HTTP intermedio, lo cual añadiría latencia innecesaria y duplicación de mantenimiento.

3. **Google Auth Estricto sin `localStorage` de Negocio**:
   - *Enfoque elegido*: Autenticación exclusiva vía Google Auth (`signInWithPopup`) con verificación de correo (`email_verified == true`), sin respaldos en `localStorage`.
   - *Por qué*: Garantiza integridad absoluta de identidad (`request.auth.uid`), evita pérdida silenciosa de cuentas locales al limpiar caché y cumple de raíz con el requisito de persistencia remota verificada.
   - *Trade-off asumido*: Un usuario sin conexión total a internet o sin sesión Google no podrá guardar borradores en el navegador hasta autenticarse; la interfaz mitigará esto solicitando el login antes de iniciar flujos largos como la carga de CV.

4. **Buzón de Reclutadores Seguro vía Cloud Function**:
   - *Enfoque elegido*: Cuando un visitante anónimo consulta `/u/:username` y envía un mensaje desde el perfil público, la solicitud pasa por una Cloud Function que valida el formato, limita el tamaño del mensaje e inserta el registro en la subcolección `inbox` del propietario mediante Firebase Admin SDK.
   - *Por qué*: Mantiene cerradas a cero escrituras anónimas todas las colecciones cliente en `firestore.rules` mientras preserva el caso de uso comercial de contacto por reclutadores.

---

## 4. Arquitectura Técnica y Estrategia de Datos *(Referencia Técnica)*

### Diagrama de Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        APLICACIÓN WEB (React SPA)                          │
│                                                                            │
│  ┌──────────────────────┐    ┌─────────────────────┐    ┌───────────────┐  │
│  │  Proveedor Firebase  │───►│ Gestor de Workspace │───►│ Vistas / UX   │  │
│  │  - Google Auth Popup │    │ - Hidratación Nube  │    │ - CV Upload   │  │
│  │  - testConnection()  │    │ - Mutaciones Await  │    │ - Timeline    │  │
│  │  - ErrorBoundary     │    │ - Cero localStorage │    │ - Public Deck │  │
│  └──────────┬───────────┘    └──────────┬──────────┘    └───────┬───────┘  │
└─────────────┼───────────────────────────┼───────────────────────┼──────────┘
              │                           │                       │
              │ Auth Token (Google)       │ SDK Firestore         │ HTTPS +
              ▼                           │ (Validado por Reglas) │ Bearer/Public
┌──────────────────────────┐              ▼                       ▼
│     Firebase Auth        │  ┌─────────────────────────┐  ┌─────────────────┐
│  (Google Sign-In Único)  │  │    Cloud Firestore      │  │ Cloud Functions │
│  email_verified == true  │  │  - /users/{uid}/...     │◄─┤ - CV Gemini IA  │
└──────────────────────────┘  │  - /publicShowcases/... │  │ - Vitrina /u/   │
                              │  - /proWaitlist/...     │  │ - Msg Visitante │
                              └────────────┬────────────┘  │ - Stripe Pay    │
                                           ▲               └─────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Gobierno de Esquema    │
                              │  - Blueprint de Datos   │
                              │  - Reglas 8 Pilares     │
                              │  - Auditoría ESLint     │
                              └─────────────────────────┘
```

### Modelo de Datos y Estrategia en Firestore (`firebase-blueprint.json`)

Todas las colecciones privadas quedan ancladas bajo la ruta del usuario autenticado (`userId == request.auth.uid`), separando explícitamente los datos personales (PII) de la proyección pública:

1. **Perfil Privado del Usuario** (`/users/{userId}`):
   - Contiene `userId` (inmutable), nombre, titular profesional, biografía, ubicación, enlaces sociales, habilidades, avatar, estado de disponibilidad, plan (`free` | `pro`), nombre de usuario (`username`), correo electrónico (PII protegida solo para el dueño) y marcas temporales de servidor (`createdAt`, `updatedAt`).
2. **CV Extraído Vigente** (`/users/{userId}/cv/current`):
   - Almacena la radiografía del último CV estructurado (contacto, resumen, habilidades, educación, idiomas, proyectos y metadatos de completitud), garantizando un tamaño muy inferior a 1 MiB.
3. **Colecciones Modulares de Trayectoria** (documentos individuales por ID bajo `/users/{userId}/...`):
   - **Logros** (`/users/{userId}/logs/{logId}`): Fecha, cliente, proyecto, categoría, título, metodología STAR/XYZ, impacto, tags acotados (`<= 15`), visibilidad `isPublic` y vínculo opcional `experienceId`.
   - **Experiencias** (`/users/{userId}/experiences/{expId}`): Empresa, cargo, periodo, resumen, bullets acotados y tecnologías.
   - **Productos** (`/users/{userId}/products/{productId}`): Nombre, descripción, rol, enlace, métricas e indicador `isPublic`.
   - **Certificaciones** (`/users/{userId}/certifications/{certId}`): Nombre, entidad emisora, fecha, credencial e indicador `isPublic`.
   - **Plan de Carrera** (`/users/{userId}/careerGoals/{goalId}`): Objetivo, estado (`planned` | `in_progress` | `achieved`), checklist de acciones acotado y certificación vinculada.
   - **Ofertas Laborales** (`/users/{userId}/offers/{offerId}`): Empresa, cargo, texto de vacante, puntaje de compatibilidad y análisis de brechas.
   - **Buzón Privado / Sugerencias** (`/users/{userId}/inbox/{messageId}`): Mensajes de reclutadores y borradores importados desde GitHub/GitLab/Jira con estado leído/convertido.
   - **Cuota Mensual de IA** (`/users/{userId}/quotas/ai`): Contador de extracciones por mes (`monthKey`, `count`, `lastUsed`).
4. **Vitrinas Públicas Compartidas** (`/publicShowcases/{username}`):
   - Documento público de lectura abierta (exclusivo para renderizado de `/u/:username`, badge SVG y widget embebido) **sin PII sensible privado**, que almacena `ownerId`, perfil público sanitizado, listado de logros públicos, productos públicos y certificaciones públicas.
   - Al reclamar un `username` o publicar contenido, se actualiza en un **lote atómico (`writeBatch`)** junto al perfil privado; si el documento `/publicShowcases/{username}` ya existe, las reglas verifican que `existing().ownerId == request.auth.uid` antes de permitir cualquier actualización o eliminación, impidiendo robo de handles.
5. **Lista de Espera Pro** (`/proWaitlist/{entryId}`):
   - Creación permitida a usuarios autenticados con validación estricta de correo y límites de longitud; lectura y modificación bloqueadas en cliente.

### Seguridad Endurecida (Las 8 Columnas en `firestore.rules`)

- **Default-Deny Global**: Bloqueo total por defecto al inicio de las reglas para cualquier ruta no declarada.
- **Identidad Verificada Real**: Todas las lecturas/escrituras privadas exigen usuario autenticado con correo verificado (`request.auth != null && request.auth.token.email_verified == true`), pertenencia directa (`userId == request.auth.uid`) e inmutabilidad de `ownerId` / `createdAt`.
- **Funciones de Validación Tipada (`isValid[Entity]`)**: Requeridas tanto en `create` como en `update`, validando presencia exacta de campos (`hasAll` + `hasOnly` contra campos fantasma), regex estrictos en identificadores (`^[a-zA-Z0-9_-]+$`), límites de tamaño en cada cadena y arreglo, y marcas de tiempo de servidor (`request.time`).
- **Sanitización Previa de Payloads**: Helper centralizado que elimina recursivamente toda propiedad `undefined`, recorta cadenas a sus máximos definidos en el blueprint y limita arreglos antes de invocar `setDoc` / `updateDoc` / `writeBatch`.
- **Manejo Estructurado de Errores (`handleFirestoreError`)**: Toda operación y listener `onSnapshot` atrapa excepciones, serializa el `FirestoreErrorInfo` diagnóstico (`operationType`, `path`, `authInfo`) para depuración y propaga mensajes comprensibles a la interfaz + `ErrorBoundary`.
- **Validación Automatizada**: Reglas validadas con `@firebase/eslint-plugin-security-rules` y suite de pruebas TDD adversariales (`Dirty Dozen` intentando suplantación, campos fantasma, cadenas >1 MiB y cruce de handles) antes de desplegar con `DeployRules`.

### Mapeo Interactivo de Flujos hacia la Capa de Datos

```
[Acción de Usuario en UI]
   │
   ├─► "¿Sesión Google activa?" ── NO ──► Abre flujo Google Auth (no ejecuta escritura)
   │
   └─► SÍ (uid verificado)
         │
         ├─► Deshabilita botón + muestra indicador "Guardando..."
         ├─► Sanitiza payload (cero undefined + límites blueprint)
         ├─► Ejecuta await writeBatch / setDoc / deleteDoc en Firestore
         │      │
         │      ├── ERROR ──► handleFirestoreError() -> Mantiene modal abierto +
         │      │             Banner de error legible + botón "Reintentar"
         │      │
         │      └── OK ─────► Si afecta visibilidad o perfil público: actualiza
         │                    atómico /publicShowcases/{username} en mismo batch ->
         │                    Actualiza estado React -> Cierra modal -> Toast éxito
```

### Limpieza y Alineación de Endpoints Complementarios

- Se actualizará el servidor de desarrollo y las Cloud Functions para que las consultas públicas (`/u/:username`, badge SVG, widget) y la verificación de disponibilidad de handles lean exclusivamente de Firestore, incluyendo **certificaciones públicas** además de logros y productos.
- Las integraciones externas (extracción de CV con Gemini e ingesta desde GitHub/GitLab/Jira hacia sugerencias) mantendrán sus endpoints en servidor para proteger secretos y evitar CORS, pero el guardado de los borradores generados pasará íntegramente a la capa confirmada de Firestore.
- Se conectará la ruta de checkout Stripe con token de Firebase Auth y soporte completo en el enrutamiento del proyecto.

---

## 5. Plan de Verificación End-to-End

1. **Aprovisionamiento y Reglas**: Provisionar Firestore en el entorno, validar las reglas con `@firebase/eslint-plugin-security-rules` (0 errores) y ejecutar el conjunto de pruebas adversariales contra los payloads maliciosos.
2. **Compilación y Calidad Estática**: Ejecutar `compile_applet`, `lint_applet` y compilación de Cloud Functions sin errores ni advertencias.
3. **Pruebas Funcionales de Persistencia Real (con Recarga F5)**:
   - **Gate Auth**: Intentar subir CV o crear logro sin sesión Google -> exige autenticación y bloquea escritura huérfana.
   - **CV Upload**: Subir CV con sesión Google, esperar spinner de guardado -> verificar escritura real en Firestore (CV + perfil + experiencias + logros) y confirmar que tras recargar (`F5`) todo reaparece intacto sin `localStorage`.
   - **Simulación de Fallo en UI**: Simular rechazo o error de red durante guardado -> verificar que el modal **no** se cierra ni muestra éxito falso, sino alerta inline recuperable.
   - **Cobertura Total de Dominios**: Crear/editar/borrar registros en Logros, Experiencias, Productos, Certificaciones, Plan de Carrera, Ofertas e Inbox; recargar página y comprobar persistencia 100% remota.
   - **Vitrina Pública y Recados**: Publicar enlace `/u/:username`, abrir en sesión separada o incógnito verificando logros + productos + certificaciones públicas, enviar un mensaje de visitante y confirmar su recepción en el Inbox del propietario.
