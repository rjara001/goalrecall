# 🛡️ MANIFIESTO DE COSTO CERO: GUARDARRAÍLES PARA CAPA GRATUITA DE FIREBASE (SPARK PLAN)

> **PREMISA MÁXIMA DEL PROYECTO GOALRECALL:**  
> **Costo de infraestructura y consumo de APIs: $0.00 USD / mes permanente.**  
> Ninguna nueva funcionalidad, endpoint o componente debe exigir la migración al plan de pago Blaze ni exceder las cuotas de la capa gratuita (Spark).

---

## 1. Matriz de Cuotas Gratuitas de Firebase (Plan Spark)

| Servicio Firebase | Cuota Gratuita (Spark) | Política de Blindaje en GoalRecall |
| :--- | :--- | :--- |
| **Cloud Firestore** | **20,000 escrituras / día**<br>**50,000 lecturas / día**<br>**1 GiB almacenamiento total** | **Local-First Estricto**: `localStorage` responde en 0ms. La sincronización a la nube (`/api/cloud-sync/save`) utiliza **Dirty Checking con Hash Diff**; si el hash del estado no ha cambiado, se aborta la petición de red (0 escrituras consumidas). |
| **Firebase Hosting** | **360 MB / día de transferencia**<br>(~10 GB / mes)<br>**10 GB almacenamiento** | **Cero Binarios Pesados**: Las capturas de productos y avatares se almacenan como URLs directas a repositorios externos (GitHub Raw, Imgur, Cloudinary) o se comprimen en el cliente en Canvas a WebP (&lt; 150 KB). |
| **Firebase Auth** | **50,000 MAU (Usuarios activos/mes)** | Autenticación con Google y correo/contraseña 100% gratuita dentro del rango. |
| **Cloud Storage** | **5 GB total**<br>**1 GB / día de descarga** | Se desaconseja subir archivos sin procesar. Preferir siempre enlaces externos. |
| **Certificado SSL & Dominio** | **100% Gratuito e Ilimitado** | Renovación y aprovisionamiento automático de Let's Encrypt provisto por Firebase Hosting. |

---

## 2. Guardarraíles Anti-Fuga de Costos en Gemini API

### A. Rate Limiter Híbrido Anti-CGNAT
- **Usuarios Autenticados (UID)**: Máximo **5 análisis de CV por día**. El contador se almacena en memoria indexado por `uid:{userId}` para evitar que redes compartidas bloqueen a usuarios legítimos.
- **Visitantes Anónimos**: Máximo **2 análisis de prueba por día** por IP (`ip:{clientIp}`).
- **Conmutación Transparente a Motor Local ($0)**: Cuando un usuario supera su cuota diaria, el servidor **NO bloquea ni lanza errores**: conmuta de inmediato al motor heurístico `extractFullCvLocally`, extrayendo las viñetas y datos con 0 tokens y $0.00 de costo.

### B. Longitud de Entrada y Salida
- **Entrada**: Texto truncado a máximo **25,000 caracteres**. Archivos físicos limitados a 2 MB.
- **Salida**: Parámetro `maxOutputTokens: 2048` configurado en el SDK de Google GenAI para evitar desbordamiento de tokens de salida.
- **Modelo Oficial**: Se utiliza `gemini-2.5-flash` como motor multimodal de alta eficiencia.

### C. First Mate AI (Asistente de Vitrina)
- El asistente conversacional `FirstMateChat` en la vitrina pública opera **100% en el cliente** mediante el algoritmo semántico y puntuación de relevancia de `src/utils/firstMateAi.ts`.
- **Resultado:** Millones de reclutadores pueden consultar proyectos, métricas y logros sin consumir una sola llamada a Gemini API.

---

## 3. Directiva para Futuros Desarrollos y Agentes de IA

Si un desarrollador o agente de IA recibe la tarea de expandir GoalRecall:
1. **NO agregar endpoints que llamen a Gemini sin pasar por el Rate Limiter híbrido**.
2. **NO implementar polling automático a la base de datos** (utilizar eventos del usuario o Dirty Checking).
3. **NO almacenar imágenes en base64 de más de 150 KB** dentro de los payloads de backup o en Firestore.
4. **Respetar la arquitectura Local-First**: La aplicación debe ser perfectamente funcional sin conexión o ante fallos de red.
