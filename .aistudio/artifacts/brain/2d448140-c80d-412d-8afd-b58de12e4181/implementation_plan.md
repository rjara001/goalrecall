# Captain's Log (Bitácora del Capitán) & Public Deck — Implementation Plan

A private, local-first brag document tracker, career synthesis suite, interactive executive portfolio ("Public Deck"), and integrated Documentation Hub ("Manual de Vuelo / User Guide") empowering software engineers to capture daily achievements friction-free outside corporate environments, automatically transforming raw engineering logs into Google XYZ CV bullets, STAR behavioral interview sheets, and an interactive recruiter-facing portfolio with an AI profile assistant ("First Mate") and visitor message inbox.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions and new Documentation Hub specifications are confirmed:

- **Página de Documentación y Guía de Uso ("Manual de Vuelo / Guía del Capitán")**:
  - Incorporada como pestaña principal en la barra superior (`Guía / Docs`) y accesible desde el banner de bienvenida y pie de página.
  - Explica de forma visual e interactiva qué puede hacer el usuario paso a paso:
    1. **Captura Rápida Sin Fricción**: Uso del atajo de teclado (`⌘K` / `Ctrl+K`), dictado por voz mediante Web Speech API, autocompletado inteligente de proyectos y plantillas predefinidas (Incidentes P0, Refactor, Arquitectura).
    2. **Modelo de Sandbox Privado vs. Vitrina Pública**: Por qué las notas se guardan primero como privadas (`isPublic: false`), cómo proteger la propiedad intelectual de la empresa y cómo publicar selectivamente con un clic (`[ Publicar en Public Deck ]`).
    3. **Motor de Síntesis de Carrera**: Cómo funciona la fórmula Google XYZ (*"Accomplished [X] as measured by [Y] by doing [Z]"*), el generador de historias STAR para entrevistas y el exportador de casos de estudio en Markdown.
    4. **Public Deck y el Agente "First Mate"**: Cómo los reclutadores exploran el portafolio, cómo el agente de IA responde preguntas basándose exclusivamente en logros públicos y cómo funciona el buzón de recados ("Inbox").
  - Incluye botones de acción interactiva directa dentro de la guía (ej. *"Probar Captura Rápida (⌘K)"*, *"Ver Síntesis de Demostración"*, *"Explorar Public Deck"*).
- **Autenticación & Onboarding**:
  - Acceso con un clic mediante Google Auth simulado o Email/Password.
  - Onboarding express que precarga registros técnicos enriquecidos (`ClientX` e `Internal Core`) para comenzar a usar la app de inmediato.
- **Sandbox Privado y Publicación Selectiva**:
  - Todas las entradas nacen en el Sandbox Privado (`isPublic: false`).
  - Toggle directo en cada tarjeta: `[ Publicar en Public Deck ]` / `[ Despublicar ]`.
- **Aislamiento Estricto de "First Mate"**:
  - El agente solo accede al array `logs.filter(entry => entry.isPublic)`.
- **Bandeja de Entrada ("Captain's Inbox")**:
  - Recados de visitantes y reclutadores guardados en el inbox privado del usuario con contador de no leídos.

---

## 1. Overview & Core Concept

- **What It Does**: Una suite 360° para la carrera técnica que combina:
  1. *Manual de Vuelo*: Guía completa y visual de capacidades y mejores prácticas de documentación de logros.
  2. *Captain's Quarters*: Registro diario privado, generador de CV XYZ y STAR, y bandeja de mensajes de contacto.
  3. *Public Deck*: Vitrina ejecutiva para reclutadores con agente de IA que responde preguntas sobre tu trayectoria.
- **Target Audience / Persona**: Ingenieros de software, Tech Leads y Arquitectos que desean llevar un registro privado de sus victorias técnicas y proyectar su carrera sin exponer secretos comerciales.
- **Key Value**: Resuelve la amnesia anual de evaluaciones de desempeño y transforma notas cotidianas en oportunidades laborales concretas.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Exploración de la Documentación ("Manual de Vuelo")**:
   - Pestaña accesible desde el menú principal (`Guía`) o desde el enlace del onboarding.
   - Presenta tarjetas explicativas con diagramas de flujo, ejemplos de fórmulas (XYZ y STAR) y botones de acción rápida para probar cada funcionalidad.
2. **Navegación Táctica ("Captain's Deck")**:
   - Selector en la barra superior:
     - `Captain's Quarters (Privado)`: Sub-pestañas: `Timeline (Sandbox)`, `Sintetizador (CV/STAR)`, `Inbox (Recados)`, `Guía / Docs`, `Ajustes`.
     - `Public Deck (Vitrina Pública)`: Perfil ejecutivo, logros públicos verificados, chat con First Mate y formulario de recados.
3. **Registro Rápido & Dictado por Voz**:
   - Atajo `⌘K` o botón flotante. Formulario con autocompletado y botón de micrófono para dictar notas técnicas con la voz.
4. **Publicación Selectiva al Public Deck**:
   - Las tarjetas en el Timeline muestran su estado (`Sandbox Privado` en gris o `Público en Vitrina` en esmeralda) con botón para alternar con un solo clic.
5. **Interacción de Reclutadores con First Mate**:
   - En el Public Deck, los visitantes pueden consultar la experiencia del candidato y el agente responde fundamentado en los registros públicos.
6. **Buzón de Recados en Quarters**:
   - Notificaciones y conteo de mensajes entrantes dejados por reclutadores en el Public Deck.

### Visual Identity & Theme

- **Aesthetic Direction**: Interfaz táctica de puente de mando con modo oscuro nativo (`#080C14` / `#0D111A`), acentos en cian neón (`#06B6D4` / `#22D3EE`) y esmeralda (`#10B981`).
- **Tipografía**: Jerarquía limpia, números mono tabulares (`font-mono tabular-nums`), y ausencia de píldoras saturadas según las directrices de diseño.

---

## 3. Key Product Decisions & Trade-Offs

- **Página de Documentación Integrada**:
  - *Chosen Approach*: Módulo nativo con contenido claro, scannable y botones interactivos para activar funciones al instante.
  - *Why*: Ofrece orientación inmediata a usuarios novatos sin depender de manuales externos ni salir de la app.
- **Local-First con Simulación de Auth y Sincronización**:
  - *Chosen Approach*: Persistencia en `localStorage` con aislamiento por cuenta y exportación/importación JSON completa.
  - *Why*: Funciona en cualquier dispositivo de forma inmediata sin configuración en la nube, garantizando privacidad total.
- **Aislamiento Cero-Riesgo del Agente**:
  - *Chosen Approach*: Filtro matemático estricto en cliente antes de alimentar al agente.
  - *Why*: Garantiza que las notas confidenciales de la empresa del usuario nunca sean visibles para reclutadores.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Captain's Log — System Architecture                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Navigation Bar                                                         │
│  [Captain's Log Brand]  [Quarters (Privado) ⇄ Public Deck]  [User Profile]  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  Captain's Quarters (Privado)        │  Public Deck (Vitrina Pública)       │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ Manual de Vuelo / Guía (Docs)  │  │  │ Perfil Ejecutivo y Bio        │  │
│  ├────────────────────────────────┤  │  ├────────────────────────────────┤  │
│  │ Timeline / Sandbox Privado     │  │  │ Vitrina de Logros Públicos     │  │
│  │ · Toggle [Publicar/Despublicar]│  │  │ (Solo isPublic === true)       │  │
│  ├────────────────────────────────┤  │  ├────────────────────────────────┤  │
│  │ Career Hub (XYZ / STAR)        │  │  │ Agente de IA "First Mate"      │  │
│  ├────────────────────────────────┤  │  │ (Alimentado solo de logs pub.) │  │
│  │ Captain's Inbox (Recados)      │  │  ├────────────────────────────────┤  │
│  │ · Badge mensajes sin leer      │  │  │ Dejar un Recado (Leave a Note) │  │
│  └────────────────────────────────┘  │  └────────────────────────────────┘  │
├──────────────────────────────────────┴──────────────────────────────────────┤
│  Capa de Datos y Almacenamiento:                                            │
│  • Auth Store: `captains_auth_v1` (Usuario activo y sesión)                 │
│  • Logs Store: `captains_logs_v1` (Con soporte de sandbox y publicación)    │
│  • Inbox Store: `captains_inbox_v1` (Mensajes de visitantes)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Structure

1. **`App.tsx`**: Enrutador central, gestión de autenticación, control de vistas principales (`quarters` vs `public`), notificaciones toast y atajos de teclado (`⌘K`).
2. **`DocumentationView.tsx`**: Página completa de documentación ("Manual de Vuelo") con explicación de flujos, diagramas explicativos, guía de fórmulas de CV/STAR y botones interactivos de acción.
3. **`AuthModal.tsx`**: Login y bienvenida rápida (Google / Email) con precarga de datos de demostración.
4. **`PublicDeck.tsx`**: Vitrina ejecutiva con biografía, logros públicos, chat First Mate y formulario de recados.
5. **`FirstMateChat.tsx`**: Asistente interactivo con búsqueda contextual restringida a logs públicos.
6. **`TimelineView.tsx`**: Bitácora cronológica con filtros avanzados y botón directo `[ Publicar / Despublicar ]` por tarjeta.
7. **`QuickLogModal.tsx`**: Formulario de captura rápida con dictado por voz y estado sandbox por defecto.
8. **`InboxView.tsx`**: Bandeja privada de mensajes dejados por visitantes.
9. **`SynthesisHub.tsx`**: Estudio de síntesis con generador de bullets Google XYZ, STAR stories y exportación Markdown/PDF.
10. **`SettingsBackupModal.tsx`**: Exportación e importación de JSON completo y configuración de PIN.
