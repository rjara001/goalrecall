# Etapa 2: Certificaciones Técnicas & Plan de Carrera / Objetivos

Documento oficial de especificación y arquitectura para la **Etapa 2** de **Goal Recall**.

---

## 1. Visión General de la Etapa 2

La Etapa 1 consolidó el **Vault del Pasado y Presente**: registrar empresas, proyectos personales, logros cuantificados y presencia pública para reclutadores.

La **Etapa 2** expande la plataforma hacia el **Crecimiento Técnico y el Futuro Profesional** a través de dos pilares clave:
1. **Certificaciones Técnicas (Logros No Laborales / Credencialización Oficial)**: Victorias de validación de conocimientos avaladas por terceros oficiales.
2. **Plan de Carrera & Objetivos (Career Roadmap & Milestones)**: Un gestor de metas aspiracionales y académicas estructuradas con seguimiento de progreso.

---

## 2. Pilar A: Certificaciones Técnicas (Logros No Laborales)

### A. Concepto y Filosofía
En el mercado técnico, una certificación no pertenece a un empleador específico; es un **logro personal de credencialización técnica** que viaja con el profesional. Debe tratarse con el mismo rigor que un logro de ingeniería:
* Avala conocimientos especializados (Cloud, Seguridad, Arquitectura, DevOps, Gestión).
* Aporta prueba social mediante enlaces de verificación oficiales (Credly, Certiverse, Google Cloud, AWS).
* Se publica en la vitrina pública (Public Deck) como insignias de verificación técnica.

### B. Modelo de Datos Propuesto (`src/types/index.ts`)
```typescript
export interface TechnicalCertification {
  id: string;
  userId?: string;
  name: string; // ej. "AWS Certified Solutions Architect - Professional"
  issuer: string; // ej. "Amazon Web Services (AWS)", "CNCF / Linux Foundation", "Google Cloud"
  issueDate: string; // ej. "2025-04"
  expirationDate?: string; // ej. "2028-04" o vació si no vence
  credentialId?: string; // ej. "AWS-PSA-94812"
  credentialUrl?: string; // URL pública en Credly o portal oficial del emisor
  skills: string[]; // ej. ["AWS", "High Availability", "Distributed Systems", "Cloud Security"]
  badgeImage?: string; // URL opcional de la insignia digital
  summary?: string; // Breve contexto de qué áreas de dominio valida
  isPublic: boolean; // Si es true, se muestra en la Vitrina Pública (Public Deck)
  createdAt: number;
  updatedAt: number;
}
```

### C. Experiencia de Usuario (UX)
1. **En Captain's Quarters (Área Privada)**:
   - Tarjetas elegantes con badge del emisor, fecha de expedición, estado de vigencia (Vigente / Por renovar) y botón para editar o probar el enlace de verificación.
2. **En Public Deck (Vitrina Ejecutiva)**:
   - Sección destacada *"Certificaciones & Credenciales Técnicas"* con badges verificados y acceso directo al validador oficial de Credly / emisor.

---

## 3. Pilar B: Plan de Carrera & Objetivos (Career Roadmap)

### A. Concepto y Filosofía
Todo ingeniero de alto rendimiento tiene metas activas: certificarse, profundizar en un stack emergente, cursar un posgrado, postular a una empresa específica o ascender de rol.
El **Plan de Carrera** permite plasmar estas aspiraciones en una hoja de ruta estructurada y cuantificable.

### B. Categorías de Objetivos
* 📜 **Certificaciones**: *"Certificarme en CKA (Certified Kubernetes Administrator) en Q3"*
* 📚 **Estudio & Deep Dives**: *"Estudiar Rust a fondo: concurrencia, Tokio y memory safety"*
* 🎓 **Académico & Posgrados**: *"Obtener un Máster en Ciencias de la Computación / Inteligencia Artificial"*, *"Terminar mi licenciatura"*
* 🏢 **Empresas Objetivo & Roles**: *"Trabajar en Google, Stripe o Mercado Libre"*, *"Alcanzar nivel Staff / Principal Software Engineer"*
* 🚀 **Proyectos & Open Source**: *"Lanzar mi primer SaaS técnico con 100 usuarios activos"*, *"Contribuir con un PR aceptado a un proyecto CNCF"*

### C. Modelo de Datos Propuesto (`src/types/index.ts`)
```typescript
export type CareerGoalCategory = 
  | "certification" 
  | "study" 
  | "academic" 
  | "target_company" 
  | "role_elevation" 
  | "open_source";

export type CareerGoalStatus = "backlog" | "in_progress" | "achieved";

export interface CareerGoal {
  id: string;
  userId?: string;
  title: string; // ej. "Obtener Máster en Ingeniería de Software"
  category: CareerGoalCategory;
  targetDate?: string; // ej. "2026-Q4" o "2027"
  status: CareerGoalStatus; // "backlog" | "in_progress" | "achieved"
  whyImportant?: string; // ¿Por qué este hito es clave para mi proyección profesional?
  actionItems?: { id: string; text: string; done: boolean }[]; // Checklist de hitos intermedios
  notes?: string; // Recursos, enlaces a temarios, libros recomendados
  achievedDate?: string; // Fecha en que se completó
  linkedCertificationId?: string; // Si fue una certificación, link a su credencial
  createdAt: number;
  updatedAt: number;
}
```

### D. Experiencia de Usuario (UX)
1. **Tablero Visual de Metas**:
   - Vistas por columnas o tarjetas categorizadas:
     - 📌 **Planificadas (Backlog)**: Metas futuras priorizadas.
     - ⏳ **En Curso (In Progress)**: Lo que se está estudiando o preparando activamente.
     - 🎉 **Logradas (Achieved)**: Historial de hitos conquistados.
2. **Conexión Automática con el Sistema de Logros**:
   - Cuando un objetivo de certificación o estudio se marca como *"Logrado 🎉"*, el sistema ofrece la opción en 1 clic de convertirlo en una Certificación Oficial o añadirlo a la bitácora de logros.

---

## 4. Pilar C: Integración & Inyección con Ecosistemas de Desarrollo (GitHub / GitLab / Jira)

### A. Concepto y Filosofía
Permite que el perfil y los logros de **Goal Recall** trasciendan la aplicación para **inyectarse en los sitios donde los desarrolladores y reclutadores interactúan a diario**, y a su vez **auto-poblar la bitácora** a partir del trabajo real completado en repositorios y herramientas de gestión.

### B. Módulo 1: Inyección hacia Afuera (Goal Recall ➔ Git / Portafolios Externos)
1. **Generador de GitHub Profile README (Markdown + Badges)**:
   - Botón *"Exportar para GitHub Profile"* en el Public Deck o Settings.
   - Genera un bloque de Markdown optimizado y estilizado listo para pegar en el repositorio especial `github.com/{username}/{username}/README.md` o GitLab Profile:
     - 🎯 Top 3 Victorias Técnicas cuantificadas (Google XYZ).
     - 🚀 Insignias de métricas (ej. `Latencia -92%`, `Auditoría SOC2 0 Hallazgos`).
     - 🤖 Enlace interactivo a tu Public Deck con el Asistente First Mate.
2. **Badges SVG Dinámicos & Widget Embebible**:
   - Tarjetas SVG generadas para incrustar en cualquier README, blog personal o página de Notion.
   - Iframe / Web Component interactivo con el avatar de First Mate para responder preguntas de reclutadores desde tu propio dominio personal.

### C. Módulo 2: Ingesta Automática hacia Adentro (Git / Jira ➔ Goal Recall Inbox)
1. **GitHub / GitLab API (Commits, Pull Requests & Releases)**:
   - Conexión vía Personal Access Token o OAuth con GitHub API (`/repos/{owner}/{repo}/pulls?state=closed` o `/users/{username}/events`).
   - El sistema detecta automáticamente Pull Requests mergeados y los envía al **Inbox Privado** como sugerencias:
     > *"Detectamos el PR #142: 'Optimizada query de liquidaciones con índice compuesto'. ¿Convertir en logro Google XYZ?"*
2. **Jira Cloud API (Tickets y Epics Resueltos)**:
   - Conexión con Jira Cloud REST API para leer tickets con estado `Done` o cerrados en el sprint.
   - Traduce los criterios de aceptación y resolución técnica en borradores de historias **STAR** para entrevistas conductuales.

---

## 5. Estado de Ejecución & Hoja de Ruta

* [x] **Fase 1 (MVP)**: Bitácora jerárquica (Empresas ➔ Logros), Redes de Empleo con jerarquía (LinkedIn/GitHub prioritarios y acordeón secundario), modal de experiencia enfocado en Misión y Logros, Landing Page con Hero interactivo (Playground Google XYZ), Public Deck y exportación/importación JSON.
* [ ] **Etapa 2 (Planificada - Registrada)**:
  - **Paso 1 (Certificaciones)**: Tipos y almacenamiento de `TechnicalCertification`, gestión en Quarters y renderizado de badges en Public Deck.
  - **Paso 2 (Plan de Carrera & Objetivos)**: Tablero visual de metas (Backlog, In Progress, Achieved) con checklist de hitos y conexión a logros.
  - **Paso 3 (Inyección GitHub / GitLab)**: Generador de bloque Markdown y badges SVG para GitHub Profile README (`username/username`).
  - **Paso 4 (Ingesta Automática Git / Jira)**: Sincronización de Pull Requests cerrados e issues de Jira al Inbox para formulación asistida con Google XYZ.
