# Plan Maestro: Consolidación del MVP Actual y Roadmap Futuro

Documento oficial de arquitectura y roadmap del proyecto **Goal Recall**.

---

## 1. Separación de Responsabilidades por Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│  FASE 1: EL CORE TÉCNICO (MVP ACTUAL - CONSOLIDADO)                   │
│  Propósito: Ser la fuente de verdad (Vault / Source of Truth) personal.│
│                                                                        │
│  • Carga de CV y extracción fiel de experiencias laborales             │
│  • Jerarquía estricta: Empresa/Experiencia (Padre) ➔ Logros (Hijos)   │
│  • Captura rápida sin fricción (Modal con acordeones colapsados)       │
│  • Vitrina pública para reclutadores (Public Deck)                     │
│  • Bandeja de mensajes entrantes (Inbox)                               │
│  • Tono de lenguaje relajado, amigable y directo de dev a dev          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Alimenta los datos a
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  FASE 2: MOTOR DE OFERTAS & POSTULACIONES (CONSOLIDADO ✅)              │
│  Propósito: Automatizar la postulación laboral basada en la oferta.   │
│                                                                        │
│  • Ficha de Oferta + Propuesta & Condiciones del Candidato (Salario,   │
│    modalidad remoto/híbrido, tipo de contrato B2B/dependencia, extras) │
│  • Diagnóstico ATS Match Score (palabras clave encontradas vs faltantes)│
│  • Generador de CV enfocado con PREVIEW interactivo en vivo            │
│  • Selector de logros prioritarios desde el SSOT central               │
│  • Preparador de Entrevistas como DERIVADA ESTRICTA de la Oferta (80/20)│
│  • Tracker de Aplicaciones (Pipeline: Guardada ➔ Postulada ➔ Entrevista│
│    ➔ Oferta Recibida)                                                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Automatiza con
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  FASE 3: EXTENSIÓN DE CHROME (AUTOMATIZACIÓN EN PORTALES ATS)          │
│  Propósito: Rellenar formularios pesados en segundos.                  │
│                                                                        │
│  • Detección de campos en Greenhouse, Lever, Workday y LinkedIn        │
│  • Inyección automática de respuestas desde el Repositorio de Q&A      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fase 1: Estado del MVP Consolidado

1. **Navegación 100% limpia:**
   - La cabecera cuenta con acceso a: **Mi Bitácora**, **Ofertas & CVs**, **Características**, **Guía (/docs)** y **Vitrina Pública**.
2. **Jerarquía Empresa / Experiencia y Logros:**
   - Cada empresa importada desde el CV retiene íntegramente sus viñetas reales y tecnologías.
   - Cada viñeta permite extracción directa a logros con fórmula Google XYZ en 1 clic.
3. **Modal de Captura Rápida (Fricción Cero):**
   - Título y Pasos Técnicos visibles y cómodos; Impacto y Contexto colapsados por defecto; dictado por voz offline nativo y atajo ⌘K.

---

## 3. Fase 2: Motor de Ofertas & Postulaciones (Implementado)

1. **Ficha de Oferta + Propuesta & Condiciones del Candidato**:
   - Compensación pretendida (rango/tarifa y divisa).
   - Modalidad (100% Remoto, Híbrido, Presencial).
   - Tipo de contrato (B2B / Contractor, Relación de dependencia directa, Freelance).
   - Condiciones extra (vacaciones, equipamiento, bonos, seguro internacional).
2. **Análisis Algorítmico ATS Match Score**:
   - Compatibilidad porcentual (0-100%) entre requisitos de la oferta y logros del SSOT.
   - Diagnóstico de palabras clave encontradas vs. brechas a reforzar.
   - Recomendaciones estratégicas específicas para la vacante.
3. **Generador de CV con Preview Interactivo**:
   - Selección dinámica de qué logros y viñetas incluir en la postulación.
   - Resumen y titular profesional adaptados a la vacante.
   - Exportación directa (Impresión / PDF) y botón de copiar texto plano estructurado.
4. **Preparador de Entrevistas Específico**:
   - Derivada estricta de la oferta cargada.
   - Preguntas técnicas y conductuales más probables con estrategia de respuesta recomendada.
   - Cheat sheet de repaso rápido para consultar 10 minutos antes de la llamada.

---

## 4. Etapa 2: Certificaciones Técnicas & Plan de Carrera (Registrado)

Documento detallado: `docs/plans/03-etapa2-certificaciones-y-plan-de-carrera.md`
- **Pilar A: Certificaciones Oficiales**: Victorias técnicas no laborales (AWS, GCP, CKA, Terraform) con enlace de verificación y badges en la vitrina.
- **Pilar B: Plan de Carrera & Objetivos**: Hoja de ruta aspiracional (Máster, Licenciatura, Estudiar Rust, Trabajar en Google / Tier 1 companies) con tracking de hitos (*Backlog ➔ En progreso ➔ Logrado*).

