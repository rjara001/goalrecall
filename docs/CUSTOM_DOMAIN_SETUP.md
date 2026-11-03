# 🌐 GUÍA PASO A PASO: VINCULAR DOMINIO PERSONALIZADO (GoalRecall) A FIREBASE HOSTING

Esta guía detalla los pasos exactos para conectar tu dominio recién adquirido de GoalRecall a la aplicación con certificado SSL automático y gratuito.

---

### Paso 1: Preparar la Compilación de Producción
En tu terminal local o entorno de despliegue, genera la versión optimizada de producción:
```bash
npm run build
```
Esto generará la carpeta `dist/` con la aplicación empaquetada y optimizada para servir a alta velocidad en la CDN de Firebase Hosting.

---

### Paso 2: Vincular Proyecto en Firebase CLI
Si es la primera vez que despliegas desde tu terminal:
```bash
# 1. Inicia sesión en Firebase con tu cuenta de Google
npx firebase-tools login

# 2. Inicializa o asocia tu proyecto de Firebase existente
npx firebase-tools use --add
# (Selecciona tu ID de proyecto de Firebase)

# 3. Despliega los archivos estáticos a Firebase Hosting
npx firebase-tools deploy --only hosting
```

Tu app ya estará disponible en el subdominio gratuito: `https://<tu-proyecto-id>.web.app`.

---

### Paso 3: Agregar tu Dominio en la Consola de Firebase
1. Ingresa a la [Consola de Firebase](https://console.firebase.google.com/).
2. Selecciona tu proyecto y ve al menú lateral: **Build (Compilación) -> Hosting**.
3. En la pestaña principal del panel de Hosting, haz clic en el botón:  
   👉 **"Agregar dominio personalizado" (Add custom domain)**.
4. Escribe el dominio que compraste:  
   - Por ejemplo: `goalrecall.com` (o la extensión que adquiriste: `.com`, `.dev`, `.app`, `.io`).
   - *Opcional recomendado*: Marca la casilla para redirigir `www.goalrecall.com` al dominio raíz o viceversa.

---

### Paso 4: Configurar los Registros DNS en tu Registrador de Dominios (Namecheap o GoDaddy)
Firebase te mostrará los registros DNS exactos que debes ingresar.

#### 📍 Si tu dominio está en Namecheap:
1. Inicia sesión en **Namecheap** e ingresa a **Domain List**.
2. Haz clic en **Manage** al lado de tu dominio `GoalRecall`.
3. Ve a la pestaña **Advanced DNS**.
4. En la sección **Host Records**, si existen registros A o CNAME por defecto (como Parking Page), elimínalos o edítalos.
5. Haz clic en **Add New Record** y crea los siguientes:
   - **A Record**: Host `@` | IP: *IP 1 que te dio Firebase* | TTL: `Automatic` (o `30 min`)
   - **A Record**: Host `@` | IP: *IP 2 que te dio Firebase* | TTL: `Automatic` (o `30 min`)
   - **CNAME Record**: Host `www` | Target: `<tu-proyecto-id>.web.app` | TTL: `Automatic`
   - *(Solo si Firebase lo pidió)*: **TXT Record**: Host `@` | Value: *Código de verificación*

#### 📍 Si tu dominio está en GoDaddy:
1. Inicia sesión en **GoDaddy** e ingresa a **Mis Productos (My Products)** o **Domain Portfolio**.
2. Haz clic sobre tu dominio `GoalRecall` y selecciona **Administrar DNS (DNS Records)**.
3. En la tabla de registros DNS, haz clic en **Agregar (Add New Record)**:
   - **Tipo**: `A` | Nombre: `@` | Valor: *IP 1 que te dio Firebase* | TTL: `1/2 hora` (o `Personalizado: 600 segundos`)
   - **Tipo**: `A` | Nombre: `@` | Valor: *IP 2 que te dio Firebase* | TTL: `1/2 hora`
   - **Tipo**: `CNAME` | Nombre: `www` | Valor: `<tu-proyecto-id>.web.app` | TTL: `1/2 hora`
   - *(Solo si Firebase lo pidió)*: **Tipo**: `TXT` | Nombre: `@` | Valor: *Código de verificación*

#### Resumen de Registros DNS:
| Tipo | Host / Nombre | Valor / Destino | TTL Recomendado | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | *IP 1 de Firebase (ej. 199.36.158.100)* | 30 min / Auto | Apunta el dominio raíz al CDN global |
| **A** | `@` | *IP 2 de Firebase (ej. 199.36.158.100)* | 30 min / Auto | Redundancia de alta disponibilidad |
| **CNAME** | `www` | `<tu-proyecto-id>.web.app` | 30 min / Auto | Resuelve `www.goalrecall...` |
| **TXT** *(si aplica)* | `@` | *Token de verificación de Firebase* | 30 min / Auto | Verificación de titularidad |

---

### Paso 5: Aprovisionamiento Automático de SSL
- Una vez guardados los registros DNS, Firebase detectará la propagación automáticamente (suele tardar entre 10 minutos y 24 horas dependiendo del proveedor DNS).
- Firebase provisionará un **certificado SSL de Let's Encrypt de forma 100% automática y gratuita**.
- El estado en la consola cambiará de *"Pendiente de verificación"* a *"Activo con SSL"*.

---

### Paso 6: Verificación de Costo Cero
- Ve a **Configuración del proyecto -> Uso y facturación** en Firebase.
- Confirma que el plan sigue siendo **Spark ($0.00)**.
- Gracias a los guardarraíles implementados en GoalRecall (compresión WebP en cliente, dirty checking por hash diff y First Mate AI local), tu tráfico de visitantes y reclutadores se mantendrá holgadamente dentro de las cuotas gratuitas.
