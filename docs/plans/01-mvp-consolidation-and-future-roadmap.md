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
│  FASE 2: MOTOR DE OFERTAS & POSTULACIONES (MÓDULO FUTURO)              │
│  Propósito: Automatizar la postulación laboral basada en la oferta.   │
│                                                                        │
│  • Ficha de Oferta + Propuesta & Condiciones del Candidato (Salario,   │
│    modalidad remoto/híbrido, tipo de contrato B2B/dependencia, extras) │
│  • Generador de CV enfocado con PREVIEW previo y exportación PDF/DOCX │
│  • Preparador de Entrevistas como DERIVADA ESTRICTA de la Oferta (80/20)│
│  • Tracker de Aplicaciones (Pipeline: Postulado ➔ Entrevista ➔ Oferta) │
│  • Historial / Repositorio de Preguntas y Respuestas frecuentes        │
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
   - La cabecera privada cuenta únicamente con: **Mi Bitácora**, **Inbox** y **Guía de Uso**.
   - Se removió la pestaña prematura de síntesis para evitar saturación y mantener foco 80/20.
2. **Jerarquía Empresa / Experiencia y Logros:**
   - Cada empresa importada desde el CV retiene íntegramente sus viñetas reales y tecnologías.
   - Cada viñeta permite extracción directa a logros con fórmula Google XYZ en 1 clic.
3. **Modal de Captura Rápida (Fricción Cero):**
   - Título y Pasos Técnicos visibles y cómodos; Impacto y Contexto colapsados por defecto en enlaces discretos; toggle superior sutil de Sandbox Privado.

---

## 3. Fase 2: Especificaciones del Motor de Ofertas & Postulaciones

1. **Ficha de Oferta + Propuesta & Condiciones del Candidato**:
   - Compensación pretendida (rango/tarifa y divisa).
   - Modalidad (100% Remoto, Híbrido, Zona horaria).
   - Tipo de contrato (B2B / Contractor, Relación de dependencia directa).
   - Condiciones extra (vacaciones, equipamiento, bonos, guardias).
2. **Generador de CV con Preview Interactivo**:
   - Preview previo completo editable antes de cualquier exportación.
   - Selector de formato: **PDF** (estilizado de 1 página) o **DOCX** (formato ATS editable).
3. **Preparador de Entrevistas**:
   - Derivada estricta de la oferta cargada.
   - Fichas STAR enfocadas en las 3-5 preguntas técnicas más probables para ese rol.
   - Cheat sheet de repaso rápido para la llamada.
4. **Knowledge Base de Preguntas y Respuestas**:
   - Repositorio persistente de preguntas repetitivas para reutilizar en 1 clic.

---

## 4. Etapa 2: Certificaciones Técnicas & Plan de Carrera (Registrado)

Documento detallado: `docs/plans/03-etapa2-certificaciones-y-plan-de-carrera.md`
- **Pilar A: Certificaciones Oficiales**: Victorias técnicas no laborales (AWS, GCP, CKA, Terraform) con enlace de verificación y badges en la vitrina.
- **Pilar B: Plan de Carrera & Objetivos**: Hoja de ruta aspiracional (Máster, Licenciatura, Estudiar Rust, Trabajar en Google / Tier 1 companies) con tracking de hitos (*Backlog ➔ En progreso ➔ Logrado*).

