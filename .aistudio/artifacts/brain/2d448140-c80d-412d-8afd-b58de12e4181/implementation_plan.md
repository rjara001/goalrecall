# Reestructuración de Bitácora: Empresa / Experiencia & Extracción de Logros

Reorganiza la vista principal de la bitácora técnica (**Goal Recall**) sustituyendo el selector anterior por dos pestañas principales: **Empresa / Experiencia** (fiel al diseño de salida del extractor de CV) y **Logros** (catálogo de victorias técnicas estructuradas con métricas XYZ), donde absolutamente todo cuelga de la experiencia laboral.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas para esta sección**:
> 1. **Navegación Principal de Bitácora**:
>    - Pestaña 1: **Empresa / Experiencia** (Vista por defecto, salida visual idéntica a la radiografía del CV).
>    - Pestaña 2: **Logros** (Logros estructurados con métricas de impacto, visibilidad Sandbox Privado vs. Vitrina Pública).
> 2. **Extracción In-Situ desde la Viñeta**: Cada viñeta de la experiencia contará con un botón interactivo **"Extraer a Logro"** que pre-carga el texto y permite enriquecerlo con métrica e impacto Google XYZ.
> 3. **Fuente Única de Verdad (`WorkExperience`)**: Al cargar o pegar el CV, se preservan íntegramente las viñetas textuales (`bullets`) y las tecnologías por cada empresa, sirviendo de base para la extracción.

---

### 1. Vista Previa del Diseño & Mockup de Interfaz

#### A. Selector de Modos Superior
```
┌────────────────────────────────────────────────────────┐
│  [ 🏢 Empresa / Experiencia (7) ]   [ ⚡ Logros (44) ] │
└────────────────────────────────────────────────────────┘
```

#### B. Pestaña 1: Empresa / Experiencia (Salida Fiel del CV)
Cada experiencia replica exactamente el formato de salida del extractor de CV:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Senior Full Stack Developer                                    Oct 2025 — Presente     │
│ @ ParserDigital / Chambers & Partners                                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Delivered the Digital Submissions platform for Chambers & Partners in 7 months...    │
│   [ ⚡ Extraer a Logro ]                                                               │
│                                                                                        │
│ • Replaced a fragmented, document-heavy process with structured digital workflows...   │
│   [ ⚡ Extraer a Logro ]                                                               │
│                                                                                        │
│ • Owned the end-to-end development of the History Navigation component...             │
│   [ ✓ Enlazado como Logro ]                                                            │
│                                                                                        │
│ • Developed frontend applications within a Microfrontend architecture with Angular 21 │
│   [ ⚡ Extraer a Logro ]                                                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Tecnologías:                                                                           │
│ [Angular 21] [.NET 10] [Minimal APIs] [MediatR] [Vertical Slice] [Azure DevOps] [Docker]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### C. Flujo de Extracción: Diálogo Rápido "Extraer Logro"
Al hacer clic en `[⚡ Extraer a Logro]` en cualquier viñeta:
1. Se abre un drawer o modal enfocado que muestra:
   - **Empresa & Rol vinculados**: *ParserDigital / Chambers & Partners* (fijo).
   - **Viñeta original**: Texto íntegro del CV.
   - **Título del Logro**: Resumen de alto impacto.
   - **Métrica / Impacto (Fórmula Google XYZ)**: Cuantificación del resultado (ej. *Despliegue a 10,000+ firmas sin retrasos*).
   - **Categoría**: *Architecture, Performance, Feature, Fix, Spike/R&D*.
   - **Visibilidad**: *Sandbox Privado* o *Public Deck*.
2. Al guardar, la viñeta cambia su estado visual a `[✓ Enlazado como Logro]` y el registro aparece inmediatamente en la pestaña **Logros**.

#### D. Pestaña 2: Logros (Vitrina de Logros Extraídos)
- Filtros por: Empresa contenedora, Categoría y Visibilidad.
- Tarjetas de logros atómicos con su métrica destacada, tags y acceso a edición o duplicado.

---

### 2. Arquitectura de Datos y Componentes

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           ARQUITECTURA DE DATOS                          │
│                                                                          │
│   [ Extractor CV (PDF/DOCX/Texto) ]                                      │
│                  │                                                       │
│                  ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │ WorkExperience                                                   │   │
│   │ - id: string                                                     │   │
│   │ - company: string ("ParserDigital / Chambers & Partners")        │   │
│   │ - role: string ("Senior Full Stack Developer")                   │   │
│   │ - startDate / endDate: string ("Oct 2025" — "Present")           │   │
│   │ - bullets: string[] (todas las viñetas reales extraídas)         │   │
│   │ - technologies: string[] ("Angular 21", ".NET 10"...)            │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │ Contiene viñetas y 1:N logs         │
│                                    ▼                                     │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │ LogEntry (Logros Atómicos Extraídos)                             │   │
│   │ - id: string                                                     │   │
│   │ - experienceId: string (Clave foránea obligatoria)               │   │
│   │ - originalBullet?: string (Referencia a la viñeta de origen)     │   │
│   │ - title: string                                                  │   │
│   │ - impact: string (Métrica cuantificable Google XYZ)              │   │
│   │ - category: LogCategory                                          │   │
│   │ - isPublic: boolean                                              │   │
│   └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Plan de Cambios en Código

1. **`src/types/index.ts`**:
   - Agregar a `WorkExperience` el campo `bullets?: string[]` para conservar el texto real de cada viñeta del CV.
   - Agregar en `LogEntry` la referencia opcional `originalBullet?: string`.
2. **`src/components/TimelineView.tsx`**:
   - Cambiar los modos a `viewMode: "experiences" | "logs"`.
   - Implementar el diseño visual exacto de salida del CV para la pestaña **Empresa / Experiencia** con viñetas reales, viñeta morada (`•`) y chips de tecnologías.
   - Añadir el botón `Extraer a Logro` en cada viñeta y el estado `Enlazado`.
   - Ajustar la pestaña **Logros** para visualizar todos los logros vinculados a las experiencias.
3. **`src/components/CvUploadModal.tsx`**:
   - Sincronizar el guardado de experiencias para que persista `bullets: exp.bullets` en `captains_experiences_v1`.
4. **`src/utils/storage.ts`**:
   - Asegurar que `getStoredExperiences` y `saveExperiences` retengan las viñetas reales (`bullets`).
