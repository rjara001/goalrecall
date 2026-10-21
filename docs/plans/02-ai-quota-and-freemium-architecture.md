# Plan de Cuotas de IA & Arquitectura Freemium ($0.00 Costo Garantizado)

Documento oficial de control de costos, límites de archivo y arquitectura de monetización futura de **Goal Recall**.

---

## 1. Máxima del Sistema: Costo $0.00 para la Cuenta Gratuita
Para que la plataforma sea sustentable en el tiempo sin generar costos imprevistos de API, la IA de extracción de CV opera bajo la **Alternativa 1 (Protección Estricta)**.

---

## 2. Reglas del Free Tier

### A. Límites Físicos del Archivo
* **Tamaño Máximo:** **2 MB** por archivo (PDF, DOCX o TXT).
* **Validación en Cliente:** Si el archivo supera 2 MB, el navegador lo rechaza inmediatamente antes de enviarlo al backend, protegiendo ancho de banda y memoria.
* **Límite de Longitud:** Máximo **15.000 caracteres**.

### B. Cuota y Rate Limiting
* **Cuota Mensual:** **3 extracciones con IA por mes calendario** para cuentas con `plan: "free"`.
* **Ciclo de Renovación:** Se reinicia automáticamente el día 1 de cada mes.
* **Cooldown Anti-Spam:** Mínimo **2 minutos** entre intentos para evitar llamadas duplicadas accidentales.

### C. Fallback Gratuito al Agotar Cuota
* Si el usuario gasta sus 3 extracciones:
  1. Puede usar el **Extractor Local Estricto** (Node.js a costo $0.00).
  2. Puede usar la herramienta de **Pegar Viñetas Manual**.
  3. No se bloquea la cuenta ni se impone fricción destructiva.

---

## 3. Arquitectura Freemium (Preparación para Plan Pro)

### A. Modelo de Datos
```ts
export interface AiUsageRecord {
  monthKey: string;   // ej. "2026-10"
  count: number;      // 0 a 3 en Free
  lastUsed: number;   // timestamp para cooldown
}

export interface UserProfile {
  // ... campos de perfil
  plan?: "free" | "pro"; // Por defecto "free"
  aiUsage?: AiUsageRecord;
}
```

### B. Validación Temprana (Waitlist Plan Pro)
* Al agotarse la cuota, se habilita el botón: `[⚡ Desbloquear extracciones ilimitadas — Plan Pro]`.
* Abre una ventana informativa con los beneficios futuros (Fase 2) y captura de interés (Waitlist), permitiendo validar disposición de pago antes de implementar pasarelas como Stripe.
