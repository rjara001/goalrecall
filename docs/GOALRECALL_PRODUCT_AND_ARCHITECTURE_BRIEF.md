# GoalRecall: Documento de Producto, Visión & Arquitectura Estratégica (SSOT)

**Versión:** 1.0.0  
**Fecha:** 28 de Octubre, 2026  
**Clasificación:** Documento Oficial de Producto & Arquitectura  
**Autor:** Equipo de Ingeniería & Producto GoalRecall  
**Estado:** Vigente / Consolidado (Fase 1 completada + Fases 2 y 3 especificadas)

---

## 1. Resumen Ejecutivo & Propósito del Documento

Este documento consolida el levantamiento integral de **GoalRecall**: define su génesis y razón de existir, el perfil de usuarios a los que sirve, la visión de producto a largo plazo, su arquitectura conceptual como **Única Fuente de Verdad Profesional (Single Source of Truth - SSOT)**, y la matriz de beneficios que le permite agilizar radicalmente la gestión de carrera de profesionales técnicos y de alto impacto.

GoalRecall no es un simple editor de currículums ni una libreta de notas: es el **Ledger / Sistema Operativo de Trayectoria Profesional** que desacopla la captura del logro en caliente de su explotación en múltiples formatos (CVs personalizados para ATS, entrevistas de comportamiento, evaluaciones anuales de desempeño y vitrinas públicas).

---

## 2. Por Qué Existe GoalRecall (El Problema Raíz)

### 2.1. El Síndrome de la "Amnesia de Logros" (Career Amnesia)
En el día a día laboral, los profesionales de ingeniería, consultoría y producto resuelven problemas de alta complejidad técnica: reducen latencias p99, rescatan migraciones caídas, rediseñan arquitecturas de datos y optimizan costos en nubes públicas.

Sin embargo, cuando llega el momento de:
1. Una **evaluación anual de desempeño (Performance Review)**,
2. Una **negociación salarial o ascenso**, o
3. Una **postulación a un nuevo rol ante una reestructuración o búsqueda activa**,

el profesional se enfrenta a la "página en blanco". Los detalles finos de métricas, decisiones arquitectónicas, ahorros porcentuales y trade-offs técnicos implementados 8 meses atrás se han olvidado por completo.

### 2.2. La Trampa del Mantenimiento Manual y los "15 Words Desincronizados"
El enfoque tradicional consiste en crear múltiples archivos: `CV_Backend_2025.docx`, `CV_TechLead_Final.pdf`, `CV_Data_AWS_v2.pdf`, sumados al perfil de LinkedIn y notas dispersas en Google Docs o Notion.
* **Resultado:** Desincronización crónica. Actualizar un logro en un documento implica editar a mano 5 archivos distintos. En la práctica, casi nadie lo hace y los CVs quedan desactualizados por años.

### 2.3. El Desafío de las Laptops Corporativas Ultra Restringidas (Banca / Consultoría)
Muchos consultores, desarrolladores e ingenieros de datos trabajan en computadoras corporativas (laptops de bancos, fintechs o aseguradoras) con:
* Proxies corporativos que inspeccionan todo el tráfico web HTTPS.
* Políticas de seguridad que bloquean Google Drive personal, Notion, extensiones de navegador no autorizadas o apps cloud de terceros.
* Privilegios de administrador denegados (imposible instalar software binario).
* Riesgo de filtrar información confidencial del cliente corporativo.

**Consecuencia:** El profesional pierde el registro de meses o años de trabajo técnico de alto nivel porque no tiene una herramienta segura, local y privada donde documentar su impacto sin exponer datos confidenciales al proxy corporativo.

---

## 3. Quiénes lo Necesitan (User Personas & Target Audience)

| Perfil de Usuario | Dolores Principales | Solución GoalRecall |
|---|---|---|
| **1. Consultores & Contratistas Bancarios / Fintech** | Equipos ultra controlados, proxies estrictos, no pueden instalar apps ni usar extensiones en la nube personal. | **PWA 100% Local-First** con almacenamiento local en navegador, dictado por voz nativo offline, sin envío de datos al exterior salvo sincronización explícita y cifrada. |
| **2. Ingenieros de Software, DevOps & Tech Leads** | Dificultad para traducir tareas técnicas complejas en impacto de negocio y métricas cuantificables para recruiters y directores. | **Síntesis con Fórmula Google XYZ** (`Logró [X], medido por [Y], haciendo [Z]`) y generación automática de historias conductuales **STAR**. |
| **3. Profesionales en Búsqueda Activa & Transición** | Cada vacante exige un enfoque distinto. Adaptar el CV a mano para 20 empresas toma semanas y produce inconsistencias. | **SSOT (Single Source of Truth):** El vault central alimenta un generador de CVs personalizados por vacante y ATS en segundos. |
| **4. Engineering Managers & Líderes de Producto** | Llegar a las revisiones de desempeño anuales con argumentos vagos o basados únicamente en memoria reciente. | **Timeline cronológico verificable** por empresa y rol, con métricas duras, viñetas de impacto y trazabilidad 1:1. |

---

## 4. La Visión de Producto: El SSOT de la Carrera Profesional

### 4.1. Principio Fundamental: "Capture Once, Replicate Everywhere"
GoalRecall redefine la relación con la trayectoria profesional bajo el paradigma de una **Única Fuente de Verdad (Single Source of Truth - SSOT)**:

```
                          ┌────────────────────────┐
                          │   ENTRADA RÁPIDA       │
                          │ • Dictado por voz (PWA)│
                          │ • Atajo ⌘K / 40 seg    │
                          │ • Extracción de CV     │
                          └───────────┬────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │       GOALRECALL CORE VAULT (SSOT)               │
             │   Jerarquía: Empresa ➔ Rol ➔ Logro ➔ Métricas    │
             │   • Datos cuantificados (Impacto, KPIs)          │
             │   • Decisiones de arquitectura y stack           │
             │   • Sandbox privado (seguridad local)            │
             └──────┬─────────────┬─────────────┬─────────────┬─┘
                    │             │             │             │
                    ▼             ▼             ▼             ▼
             ┌────────────┐┌────────────┐┌────────────┐┌────────────┐
             │CV ENFOCADO ││ ENTREVISTAS││  VITRINA   ││PERFORMANCE │
             │POR VACANTE ││  TECNICAS  ││  PUBLICA   ││  REVIEWS   │
             │Tailored CV ││Historias   ││Public Deck ││Rendición   │
             │(ATS/PDF)   ││STAR & Q&A  ││Recruiters  ││de Cuentas  │
             └────────────┘└────────────┘└────────────┘└────────────┘
```

El usuario registra sus empresas, proyectos y logros **una sola vez**. A partir de este repositorio centralizado y validado, los datos se ramifican automáticamente para resolver cualquier necesidad profesional futura sin duplicación de esfuerzo.

---

## 5. Cómo Permite Agilizar: Mecanismos Técnicos & Funcionales

### 5.1. Captura en Caliente en 40 Segundos
* **Atajo Global ⌘K / Ctrl+K:** Abre el modal de captura instantánea desde cualquier pantalla.
* **Diseño 80/20 con Acordeones Independientes (+):** Solo se solicitan inicialmente el título y el impacto clave. Los detalles de contexto ("¿Qué se buscaba?", "¿Por qué era importante?", "¿Cómo se aplicó?") están colapsados para documentar en caliente sin fatiga mental.
* **Dictado por Voz Offline / Local (Web Speech API):** Permite narrar el logro al terminar una reunión o entrega técnica, procesando el audio directamente en el dispositivo sin enviar grabaciones a servidores externos.

### 5.2. Ingesta Inteligente de CV Existente
* Carga de CV en PDF nativo, Word (.docx) o texto plano.
* Parser estructurado que segmenta automáticamente:
  * Empresa y fechas de permanencia.
  * Cargo y nivel de seniority.
  * Viñetas originales y stack tecnológico.
* **Conversión 1-Clic de Viñeta a Logro XYZ:** Cada viñeta del CV importado puede elevarse a hito cuantificado manteniendo el vínculo de trazabilidad (`originalBullet`).

### 5.3. Transformación con Inteligencia Artificial (Google XYZ & STAR)
* **Google XYZ Formula Builder:** Traduce anécdotas técnicas informales a la fórmula estándar de contratación de Google:  
  $$\text{Logró } [X] \text{ medido a través de } [Y] \text{ mediante } [Z]$$
  Esto incrementa drásticamente la tasa de pase en filtros ATS y la retención de Hiring Managers.
* **Desglose STAR para Entrevistas Conductuales:** Estructura automáticamente la Situación, Tarea, Acción y Resultado para superar preguntas de entrevista como *"Cuéntame sobre una ocasión donde lideraste una resolución de incidente crítico"*.

### 5.4. Un Solo Punto de Datos, Múltiples Destinos de Réplica
1. **Exportación de CVs Específicos & Enfocados:** Capacidad de seleccionar qué logros y viñetas incluir según el perfil solicitado (ej. versión enfocada en Cloud Architecture vs. versión enfocada en Data Engineering).
2. **Vitrina Pública Ejecutiva (Public Deck):** Portal web profesional con URL compartible que expone selectivamente los logros que el usuario decida hacer públicos, con perfil, disponibilidad laboral, links a GitHub/LinkedIn y formulario de contacto.
3. **Bandeja de Entrada (Inbox) Centralizada:** Los reclutadores que visitan la vitrina pública envían oportunidades directamente al inbox del usuario dentro de GoalRecall, sin spam ni intermediarios.
4. **Soberanía Total & Portabilidad de Datos (Zero Lock-In):** Exportación e importación completa en formato JSON estándar en 1 clic. Respaldos locales y cloud sync automático con debounce para sincronización entre dispositivos.

---

## 6. Arquitectura de Fases & Roadmap Estratégico

### Fase 1: El Core Técnico & Bóveda de Trayectoria (COMPLETADA)
* ✅ Bóveda jerárquica: Empresa (Padre) ➔ Logros (Hijos).
* ✅ Captura rápida con modales desacoplados y atajo ⌘K.
* ✅ Ingesta y parseo de CVs en PDF / DOCX / Texto.
* ✅ Síntesis con IA: Google XYZ & Historias STAR.
* ✅ Avatar Engine con compresión en Canvas (< 60 KB WebP).
* ✅ Vitrina Pública Ejecutiva + Bandeja de Contacto (Inbox).
* ✅ Catálogo de Características (`FeaturesView`) con simuladores interactivos.
* ✅ Respaldo en JSON y Cloud Sync continuo (`/api/cloud-sync/*`).

### Fase 2: Motor de Ofertas, CV Enfocado & Preparador de Entrevistas (EN CURSO)
* ⏳ **Ficha de Oferta Laboral:** Ingesta de la descripción de la vacante, con registro de condiciones del candidato (rango salarial aspirado, divisa, modalidad remoto/híbrido, tipo de contrato B2B/dependencia, beneficios).
* ⏳ **Generador de CV Enfocado con Preview Interactivo:** Cruce automático entre requisitos de la oferta y logros del SSOT, sugiriendo las viñetas con mayor afinidad ATS antes de exportar en PDF/DOCX.
* ⏳ **Preparador de Entrevistas Específico:** Generación de hojas de repaso rápido (cheat sheets) y preguntas técnicas derivadas directamente de la oferta y de los logros del candidato.
* ⏳ **Tracker de Postulaciones (Application Pipeline):** Tablero visual de estados (*Postulado ➔ Primer Filtro ➔ Entrevista Técnica ➔ Oferta*).

### Fase 3: Automatización en Portales ATS (FUTURO)
* ⏳ Extensión para auto-rellenar formularios de postulación en Greenhouse, Lever, Workday y LinkedIn a partir del repositorio central de Preguntas & Respuestas de GoalRecall.

---

## 7. Criterios de Calidad, Privacidad & No Negociables Técnicos

1. **Local-First & Cero Telemetría Corporativa:** Ningún dato personal o nota de trabajo se transmite sin autorización explícita. El almacenamiento primario opera en el cliente.
2. **Compatibilidad PWA:** Funcionalidad completa sin necesidad de permisos de administrador en laptops corporativas bloqueadas.
3. **Tolerancia a Desconexión & Rendimiento:** Carga instantánea de cientos de registros con latencias inferiores a 100 ms.
4. **Respaldo Abierto:** El usuario es el único dueño de su historial; sus datos nunca quedan cautivos dentro de la plataforma.
