# Unificación Conceptual: Logros como Hijos Vivos de cada Experiencia

Este plan resuelve la desincronización actual entre **Experiencias** y **Logros**, estableciendo una única fuente de verdad donde cada logro pertenece como hijo directo de su experiencia laboral, usa su título como resumen de viñeta para CV y se sincroniza de forma bidireccional y atómica en toda la aplicación.

---

## Decisiones Confirmadas y Alcance

> [!IMPORTANT]
> Las siguientes decisiones de producto quedaron confirmadas antes de diseñar esta arquitectura y rigen toda la implementación.

- **Modelo conceptual confirmado**: **Logro hijo único** — los bullets visibles dentro de cada Experiencia nacen directamente de sus logros vinculados, eliminando dos listas inconexas compitiendo entre sí.
- **Texto del bullet y visibilidad en CV**: Se utiliza el **título del logro** como texto resumido de la viñeta en la Experiencia/CV, acompañado de un flag **`Incluir en CV` (`includeInCv`)** para controlar qué logros hijos forman parte del resumen curricular sin perder el historial completo en la Bitácora.
- **Edición bidireccional y migración de viñetas**: Tanto las viñetas existentes como las recién importadas desde CV permiten **edición bidireccional**: editar el logro actualiza su viñeta en la Experiencia y editar o reorganizar las viñetas desde la Experiencia actualiza o crea los logros hijos correspondientes sin perder detalles profundos (STAR, impacto, descripción).

---

## 1. Concepto Central y Evaluación de Alternativas

### ¿Por qué ocurría el desfase actual?
Hasta ahora, la Experiencia guardaba un arreglo de texto plano (`bullets`) copiado al momento de importar el CV o guardar el formulario, mientras los Logros guardaban registros enriquecidos independientes. Al editar el título o detalle de un logro en la Bitácora, la Experiencia seguía leyendo su copia estática de texto plano, ignorando las mejoras posteriores.

### Evaluación de las dos opciones planteadas

| Criterio | Opción A: Logro hijo único + proyección bidireccional *(Elegida)* | Opción B: Listas separadas con botón manual de conversión/sync |
| :--- | :--- | :--- |
| **Fuente de verdad** | Única: el registro del Logro es la entidad viva; la Experiencia proyecta sus logros con `Incluir en CV` activo. | Dual: texto plano en Experiencia + registro aparte en Bitácora. |
| **Riesgo de desfase** | Cero: editar en Bitácora o en Experiencia mantiene ambos lados alineados automáticamente. | Alto: exige recordar pulsar "Actualizar bullet" tras cada edición. |
| **Granularidad en CV vs. Bitácora** | Resuelta limpiamente con el flag `Incluir en CV`: todos tus logros guardan detalle profundo, pero solo los marcados aparecen como viñetas de CV. | Duplica trabajo cuando quieres tener logros técnicos internos fuera del CV. |
| **Compatibilidad con viñetas de CV** | Las viñetas legadas o importadas se vinculan/promocionan a logros hijos con edición en ambos sentidos. | Mantiene texto suelto difícil de cruzar con métricas STAR o portafolio. |

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Clave del Usuario

1. **Edición desde un Logro (Bitácora → Experiencia)**
   - Al crear o editar un logro en el modal rápido:
     - Se selecciona su **Experiencia padre** (o se crea una nueva empresa al vuelo).
     - El campo **Logro / Título** muestra explícitamente la guía: *"Resumen ejecutivo que aparecerá como viñeta en tu Experiencia y CV"*.
     - Un interruptor claro en la barra de estado del modal permite activar o desactivar **"Incluir como bullet en CV"** (junto al interruptor existente de Bóveda Privada / Vitrina Pública, con íconos y etiqueta textual explícita, sin depender solo del color).
     - Los acordeones profundos (*Qué se buscaba*, *Por qué importaba*, *Cómo se aplicó*, *Impacto medible*, *Descripción extensa*) alimentan STAR, casos de estudio y preparación de entrevistas sin ensuciar la concisión del bullet.
   - Al guardar, la tarjeta de la Experiencia padre, el Hub de Síntesis y el CV adaptado para ofertas reflejan inmediatamente el nuevo texto o la inclusión/exclusión del bullet.

2. **Edición desde la Experiencia (Experiencia → Logros)**
   - En la pestaña de **Experiencias**:
     - Cada viñeta visible corresponde a un logro hijo con `Incluir en CV` activo (mostrando en línea un botón discreto para **Editar logro**, alternar **En CV / Solo Bitácora**, o **Promover a logro editable** si aún proviene de una viñeta legada sin vínculo).
     - Un enlace compacto bajo las viñetas permite ver/desplegar también los logros hijos archivados solo en Bitácora (`Incluir en CV = false`) para reactivarlos en el CV con un clic.
     - El contador de viñetas usa figuras tabulares (`tabular-nums`) mostrando claramente cuántos logros hijos están activos en el CV vs. totales registrados en esa empresa.
   - En el modal **Editar Experiencia**:
     - Las viñetas vinculadas se muestran vinculadas a sus logros hijos (permitiendo editar el texto de una viñeta existente actualizando el título del logro sin borrar sus campos STAR/descripción, agregar líneas nuevas que crean nuevos logros hijos, o desmarcar líneas del CV sin eliminar el logro histórico de la Bitácora).
     - Se elimina la fricción engañosa donde editar una viñeta en la Experiencia creaba duplicados o quedaba desconectada del logro ya existente.

3. **Importación de CV y Generación de CV / Ofertas**
   - Al importar un CV (PDF/DOCX/TXT) o pegar viñetas:
     - Cada viñeta seleccionada crea automáticamente un `LogEntry` hijo vinculado por `experienceId` con `includeInCv: true`, conservando `originalBullet` únicamente como referencia histórica de origen.
   - En el **Constructor de CV para Ofertas** y **Síntesis**:
     - El previsualizador agrupa los logros seleccionados por su `WorkExperience` padre usando `log.title` como bullet vivo (con acceso directo al impacto medible), garantizando que una mejora de redacción en la Bitácora se propague a todas las postulaciones activas.

### Criterios Visuales y de Interfaz
- **Superficie limpia de una sola elevación**: Tarjetas planas sobre fondo slate oscuro (`#090D16` / `#0F172A`) con bordes finos de `1px`, sin tarjetas anidadas dentro de tarjetas ni bordes laterales gruesos.
- **Cero ruido de cápsulas (Zero-Pill Discipline)**: Los metadatos de origen, estado en CV y fechas usan tipografía limpia con separadores `·` en lugar de acumulación de píldoras de colores; los botones interactivos usan controles segmentados o acciones de una sola línea (`whitespace-nowrap shrink-0`).
- **Estados completos**: Se contemplan explícitamente estados vacíos accionables (*"Aún no tienes logros marcados para el CV en esta empresa — Añadir logro o reactivar desde Bitácora"*), estados de guardado en curso con feedback inmediato y alertas inline ante errores de persistencia.
- **Estabilidad del compositor**: Sin `backdrop-blur` ni animaciones `animate-pulse` en reposo sobre las tarjetas o modales, preservando la estabilidad visual corregida en Chrome/macOS.

---

## 3. Decisiones Clave y Compromisos Técnicos

1. **Proyección sincronizada en `WorkExperience.bullets` + relación por `experienceId`**
   - *Enfoque elegido*: El `LogEntry` posee `experienceId`, `includeInCv` (booleano) y `title` como fuente de verdad. Cada escritura en Firestore que afecte logros vinculados o experiencias recalcula y persiste de forma atómica (`writeBatch`) la proyección ordenada de títulos en `WorkExperience.bullets`.
   - *Por qué*: Garantiza lectura instantánea y retrocompatibilidad con cualquier vista, exportación JSON o documento de CV almacenado que espere `bullets[]`, mientras asegura que nunca exista divergencia entre lo editado en el logro y lo almacenado en la experiencia.
   - *Alternativa descartada*: Eliminar `WorkExperience.bullets` de inmediato de Firestore rompería exportaciones previas y obligaría a migraciones destructivas en datos antiguos de usuarios ya autenticados.

2. **Desactivar `includeInCv` en lugar de borrar cuando se quita un bullet desde la Experiencia**
   - *Enfoque elegido*: Si el usuario quita un bullet al curar el resumen de una Experiencia (o desmarca el flag en la tarjeta), el `LogEntry` cambia `includeInCv` a `false` y conserva intactos sus campos STAR, impacto, etiquetas y descripción en la Bitácora. La eliminación definitiva permanece reservada al botón explícito de eliminar logro.
   - *Por qué*: El CV suele requerir 3–5 bullets concisos por cargo, mientras la Bitácora acumula decenas de hitos útiles para entrevistas; proteger los datos profundos evita pérdidas accidentales al editar el CV.

3. **Emparejamiento inteligente en edición bidireccional desde el modal de Experiencia**
   - *Enfoque elegido*: Mantener el vínculo estable entre cada línea editable de la Experiencia y el `id` de su logro hijo cuando el usuario edita el modal de Experiencia, diferenciando entre *editar texto existente* (actualiza `title` del mismo logro), *agregar nueva línea* (crea logro hijo con `includeInCv: true`) y *quitar de la lista* (pasa `includeInCv` a `false`).
   - *Por qué*: Sin trazabilidad por ID al editar texto, cambiar 2 palabras de un bullet en el formulario de Experiencia parecería una línea nueva y duplicaría logros en la Bitácora.

---

## 4. Arquitectura Técnica y Estrategia de Datos

### Diagrama de Relación y Flujo Bidireccional

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         FUENTE ÚNICA EN FIRESTORE                         │
│                                                                           │
│   WorkExperience (Padre)                   LogEntry (Hijo / Logro)        │
│   ├─ id, company, role, dates       ◄───── ├─ experienceId (FK padre)     │
│   └─ bullets[] (proyección sync            ├─ title  ──► Texto del Bullet │
│      de title donde includeInCv)           ├─ includeInCv (boolean)       │
│                                            ├─ impact, STAR, description   │
│                                            └─ originalBullet (referencia) │
└───────────────────────────┬──────────────────────────┬────────────────────┘
                            │                          │
        Edición en Experiencia                         Edición en Logro
        (Modal / Tarjeta Exp.)                         (QuickLog / Bitácora)
                            │                          │
                            ▼                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 MOTOR DE RECONCILIACIÓN Y BATCH ATÓMICO                   │
│                                                                           │
│  • Editar título de logro    ──► Actualiza Log + recalcula exp.bullets    │
│  • Cambiar experienceId      ──► Recalcula exp anterior + exp nueva       │
│  • Toggle "Incluir en CV"    ──► Actualiza includeInCv + exp.bullets      │
│  • Editar bullet en Exp      ──► Actualiza title del Log hijo (por ID)    │
│  • Reconciliar bullet legado ──► Crea Log hijo vinculado + marca vínculo  │
│  • Persistencia atómica      ──► writeBatch + sync PublicShowcase si pub. │
└───────────────────────────┬──────────────────────────┬────────────────────┘
                            │                          │
                            ▼                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    VISTAS CONSUMIDORAS SINCRONIZADAS                      │
│  • Pestaña Experiencias  • Bitácora  • Síntesis XYZ/STAR  • CV p/ Ofertas │
└───────────────────────────────────────────────────────────────────────────┘
```

### Modelo de Datos y Reglas de Seguridad

- **Entidad `LogEntry` (Bitácora e hijos de Experiencia)**:
  - Se añade el campo opcional booleano **`includeInCv?: boolean`** (tratado con compatibilidad hacia atrás como `true` cuando un logro vinculado aún no tiene el campo explícito, o fijado explícitamente en creación/edición).
  - `title` se consolida como la representación oficial del bullet en Experiencias y CV; `originalBullet` queda solo como rastro de auditoría de importación inicial (no sobreescribe futuras ediciones de `title`).
- **Sincronización con Esquema y Reglas de Firestore**:
  - Actualizar la definición de `LogEntryDoc` en el blueprint de esquema de datos para declarar `includeInCv` (booleano).
  - Actualizar las reglas de validación y lista de campos permitidos en actualización (`affectedKeys().hasOnly(...)`) para documentos de logros en `firestore.rules`, validando reglas con ESLint de seguridad y desplegando las reglas actualizadas antes de probar en vivo.
- **Operaciones Atómicas y Estado en UI**:
  - Todas las mutaciones que afecten la relación Experiencia ↔ Logro ejecutan `writeBatch` en Firestore: si falla la red o las reglas rechazan la escritura, el estado local no queda desincronizado y la UI muestra el mensaje de error accionable en el formulario o barra superior correspondiente.
  - Al reconciliar cuentas existentes con bullets de CV sin logros hijos creados, la vista de Experiencias ofrece conversión directa al editar o mediante la acción de extracción/vinculación, unificando definitivamente ambos modelos.

### Secuencia de Validación Prevista
1. Validar pruebas unitarias de mapeo bidireccional, reconciliación de bullets legados, cálculo de proyección `bullets[]` con `includeInCv` y sanitización de payloads Firestore.
2. Validar reglas de seguridad de Firestore con linter de seguridad y desplegar reglas actualizadas.
3. Verificar compilación completa (`npm run build`), chequeo de tipos (`tsc --noEmit`) y flujo interactivo completo entre Bitácora ↔ Experiencia ↔ Ofertas CV.
