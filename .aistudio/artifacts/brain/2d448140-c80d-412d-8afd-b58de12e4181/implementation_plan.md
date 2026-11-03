# Plan de Despliegue y Matriz de Responsabilidades (GoalRecall)

Guía y arquitectura de despliegue para conectar el dominio adquirido (`GoalRecall`) a Firebase Hosting bajo la **Premisa Máxima de Costo Cero ($0.00 USD/mes)** en el plan Spark, separando explícitamente las tareas automatizadas por la IA de las acciones manuales del usuario en Namecheap/GoDaddy y Firebase Console.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones Confirmadas:**
> - **Registrador de Dominio**: Namecheap o GoDaddy.
> - **Proyecto Firebase**: Ya existente y activo en tu cuenta de Google.
> - **Plan de Firebase**: Plan Spark ($0.00 USD/mes, sin tarjeta de crédito requerida).
> - **Protección contra Fugas de Costos**:
>   - *Gemini AI*: Límite diario híbrido por UID autenticado (5 llamadas/día) con fallback automático al parser local sin IA.
>   - *Firestore Writes*: Dirty checking con hash diff (`computePayloadHash`), evitando escrituras innecesarias (límite Spark: 20,000 escrituras/día).
>   - *Hosting Bandwidth*: Compresión Canvas en cliente a WebP (< 150 KB, max 1200px) y recomendación de URLs de CDN externo para no agotar los 360 MB/día de Hosting.

---

### 1. Overview & Core Concept

- **Qué hace**: Configura y publica la plataforma GoalRecall como una Single Page Application (SPA) optimizada para producción, servida globalmente con CDN y certificado SSL gratuito emitido por Google Cloud / Let's Encrypt, garantizando que el usuario nunca incurra en costos por uso de tokens, base de datos o transferencia.
- **Audiencia Objetivo**: Desarrolladores de software, reclutadores técnicos y profesionales que consultan el portfolio y los productos del usuario.
- **Valor Principal**: Tener GoalRecall online bajo dominio personalizado propio con cero mantenimiento de infraestructura y $0.00 de costo mensual recurrente.

---

### 2. Matriz de Responsabilidades (Quién Hace Qué)

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          MATRIZ DE DIVISIÓN DE RESPONSABILIDADES                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   🤖 RESPONSABILIDAD DE LA IA (Automatizado en el Repositorio)                         │
│   ───────────────────────────────────────────────────────────                          │
│   1. Empaquetado de Producción (`dist/`): Bundle optimizado, minificado y comprimido.  │
│   2. Configuración Firebase (`firebase.json`): Reglas SPA (rewrites) y headers caché.  │
│   3. Blindaje Costo Cero ($0.00):                                                      │
│      - Rate limiter híbrido (UID + IP fallback) en `server.ts`.                        │
│      - Dirty checking con Hash Diff en `src/utils/storage.ts`.                         │
│      - Compresor Canvas WebP (<150KB) en `src/components/ProductModal.tsx`.            │
│   4. Script de despliegue en 1 comando: `"deploy:hosting"` en `package.json`.          │
│   5. Guía de registros DNS exactos para Namecheap y GoDaddy.                           │
│                                                                                        │
│   👤 RESPONSABILIDAD TUYA (Usuario - Consolas Externas y Credenciales Personales)      │
│   ────────────────────────────────────────────────────────────────────────────         │
│   1. En tu Terminal (1 minuto):                                                        │
│      - Vincular tu cuenta: `npx firebase-tools login`                                  │
│      - Vincular tu proyecto: `npx firebase-tools use --add` (selecciona tu proyecto)   │
│      - Desplegar la app: `npm run deploy:hosting`                                      │
│   2. En Firebase Console (2 minutos):                                                  │
│      - Ir a Hosting -> "Agregar dominio personalizado".                                │
│      - Escribir `goalrecall.com` (o el TLD que compraste).                            │
│      - Copiar las 2 direcciones IP de los registros A que te entregará Firebase.       │
│   3. En Namecheap / GoDaddy (3 minutos):                                               │
│      - Abrir la zona DNS de tu dominio.                                                │
│      - Crear 2 registros tipo A (Host: `@`) apuntando a las IPs de Firebase.           │
│      - Crear 1 registro tipo CNAME (Host: `www`) apuntando a `tu-proyecto.web.app`.    │
│   4. Espera de Certificado SSL:                                                        │
│      - Firebase gestiona y renueva automáticamente el SSL gratis en ~15 a 60 minutos.  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Key Product Decisions & Trade-Offs

- **Despliegue Estático en Firebase Hosting vs. Cloud Run / Functions**:
  - *Decisión*: Servir la aplicación como SPA estática servida por CDN en Firebase Hosting, con motor Local-First en el navegador del usuario y respaldo opcional en la nube.
  - *Por qué*: El plan Spark de Firebase otorga 10 GB de almacenamiento y 360 MB/día de transferencia sin costo alguno para Hosting estático. Las Cloud Functions de 1ª generación en Spark no permiten llamadas HTTP salientes a internet (bloquearían llamadas externas a menos que se use el plan Blaze).
  - *Alternativas Descartadas*: Cloud Functions con facturación Blaze (descartado para cumplir estrictamente con la Premisa Máxima de $0.00).

- **Gestión de Credenciales y Seguridad de Acceso**:
  - *Decisión*: La IA nunca solicita ni almacena contraseñas, claves secretas ni accesos personales de tu registrador o cuenta de Google. Todo se orquesta mediante el CLI oficial de Firebase (`firebase-tools`) que corre bajo tu propia sesión local segura.

---

### 4. Technical Architecture & DNS Mapping Reference

#### Arquitectura de Red y Entrega de Contenido:

```plaintext
   Usuario / Reclutador
         │
         ▼ (HTTPS / DNS: goalrecall.com)
┌──────────────────────────────────────────────────────────┐
│  Registrador DNS (Namecheap / GoDaddy)                   │
│  - Registro A (@)    ──► 199.36.158.100 (IP de Firebase) │
│  - Registro A (@)    ──► 199.36.158.100 (IP 2 de Firebase│
│  - CNAME (www)       ──► tu-proyecto.web.app             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Firebase Hosting Global CDN (Costo $0.00 / Spark)       │
│  - SSL Let's Encrypt Automático                          │
│  - SPA Rewrite (** -> /index.html)                       │
│  - Cache inmutable (JS/CSS: max-age=31536000)            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│  Cliente Local-First (Navegador)                         │
│  - Base de Datos: localStorage + IndexedDB               │
│  - First Mate AI: 100% heurístico en cliente ($0 tokens) │
│  - Capturas de Pantalla: WebP comprimido (<150 KB)       │
│  - Dirty Checking: Hash Diff antes de enviar a Firestore │
└──────────────────────────────────────────────────────────┘
```

#### Tabla de Registros DNS para Namecheap y GoDaddy:

| Tipo de Registro | Host / Nombre | Valor / Destino | TTL | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | *IP 1 provista por Firebase* (ej. `199.36.158.100`) | Automático / 30 min | Apunta el dominio raíz a Firebase |
| **A** | `@` | *IP 2 provista por Firebase* (ej. `199.36.158.100`) | Automático / 30 min | Redundancia de alta disponibilidad |
| **CNAME** | `www` | `<tu-proyecto>.web.app` | Automático / 30 min | Redirige `www.goalrecall.com` al dominio raíz |
| **TXT** *(solo si Firebase lo pide)* | `@` | *Código de verificación de Firebase* | Automático | Valida la propiedad del dominio |

---

### 5. Próximos Pasos tras tu Aprobación

1. Incorporar el script de despliegue rápido `"deploy:hosting": "npm run build && firebase deploy --only hosting"` en `package.json`.
2. Verificar que la compilación de producción esté 100% limpia (`compile_applet`).
3. Entregarte los comandos exactos paso a paso listos para ejecutar en tu consola.
