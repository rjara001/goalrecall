# Plan: Sistema de Cuota de IA ($0.00 Free Tier Garantizado) y Arquitectura Freemium

Este plan define la implementación de las restricciones de uso de IA para la carga y extracción de CVs, asegurando que la cuenta de IA permanezca **100% libre de costo ($0.00)** para el desarrollador, implementando la **Alternativa 1** validada y preparando la estructura para el futuro **Plan Pro**.

---

## 1. Reglas y Restricciones del Free Tier

### A. Límites Físicos del Archivo
1. **Tamaño Máximo:** **2 MB** por archivo (PDF, DOCX o TXT).
   - Validación inmediata en el cliente (`CvUploadModal.tsx`) antes de enviar bytes al servidor o consumir memoria.
   - Si supera los 2 MB, alerta amigable: *"El archivo pesa más de 2 MB. Por favor sube una versión optimizada o en texto plano."*
2. **Longitud Máxima de Texto:** **15.000 caracteres**.
   - Si el usuario sube un archivo con más de 15.000 caracteres o pega texto excesivo, se trunca o se solicita recortar anexos irrelevantes.

### B. Límites de Frecuencia y Cuota Mensual
1. **3 extracciones de CV con IA por mes calendario** para cuentas con `plan: "free"`:
   - Persistido por usuario con clave de mes (ej. `2026-10`).
   - El contador se resetea automáticamente el día 1 de cada mes.
2. **Cooldown Anti-Spam:** Mínimo **2 minutos** entre extracciones consecutivas de IA para evitar clics dobles accidentales o scripts automatizados.

### C. Fallback sin Costo al Agotar el Cupo
- Si el usuario alcanza 3/3 extracciones:
  1. **Opción Local Gratuita:** Puede procesar el CV con el extractor local sin IA (`extractFullCvLocally` a costo $0.00).
  2. **Opción Manual:** Puede usar el modal de *Pegar Viñetas*.
  3. **No hay bloqueo destructivo:** El usuario nunca pierde acceso a su cuenta ni a su historial.

---

## 2. Preparación para el Plan Pro (Validación Temprana)

### A. Modelo de Datos (`UserProfile` y `storage.ts`)
- Añadir campo:
  ```ts
  plan?: "free" | "pro"; // Por defecto "free"
  aiUsage?: {
    monthKey: string; // ej. "2026-10"
    count: number;    // usos en el mes
    lastUsed: number; // timestamp para cooldown
  };
  ```

### B. Elementos Visuales en la UI
1. **Contador en `CvUploadModal.tsx`**:
   - Píldora discreta en la cabecera del modal:
     `⚡ 1 de 3 extracciones con IA utilizadas este mes (Plan Gratuito)`
2. **Modal / Alerta informativa de "Plan Pro (Próximamente)"**:
   - Al alcanzar 3/3 usos, aparece el botón: `[⚡ Desbloquear extracciones ilimitadas — Plan Pro]`.
   - Muestra un modal sutil con los beneficios futuros (Fase 2: CVs personalizados por oferta, preparación STAR y tracker de postulaciones) y un botón para anotarse en la lista de espera, permitiendo medir intención real de compra sin implementar pasarelas de pago antes de tiempo.

---

## 3. Preservación y Documentación en el Repositorio (`/docs/plans/`)

Para que todos los planes y decisiones de arquitectura no se pierdan al cerrar sesiones o compactar el historial, se registrarán formalmente en el repositorio:
* `/docs/plans/01-mvp-consolidation-and-future-roadmap.md` (El plan maestro de Fase 1, Fase 2 y Fase 3).
* `/docs/plans/02-ai-quota-and-freemium-architecture.md` (Este plan de cuotas y costos).

---

## 4. Archivos a Modificar
1. `src/types/index.ts`: Añadir `plan` y estructura `AiUsageRecord`.
2. `src/utils/storage.ts`: Métodos de registro y validación de cuota mensual y cooldown.
3. `server.ts`: Validación de tamaño máximo de 2 MB y truncado de texto a 15k caracteres en `/api/cv/extract-full-cv`.
4. `src/components/CvUploadModal.tsx`: Validación de 2 MB en el input de archivo, píldora con contador de cuota y fallback amigable cuando se agota el cupo con tarjeta informativa de Plan Pro.
5. `/docs/plans/*`: Documentación de planes guardada en el repo.
