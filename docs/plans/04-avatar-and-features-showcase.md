# P1: Foto de Perfil Personalizada & Catálogo Interactivo de Características de GoalRecall

**Status:** 🚀 En Implementación  
**Prioridad:** P1 — Alto  
**Subplan de:** Personalización de Usuario, Showcase de Producto & Preparación Etapa 2  
**Módulos impactados:** `src/types/index.ts`, `src/utils/storage.ts`, `src/components/AvatarModal.tsx`, `src/components/FeaturesView.tsx`, `src/components/Navbar.tsx`, `src/components/AuthModal.tsx`, `src/components/SettingsBackupModal.tsx`, `src/components/LandingPage.tsx`, `src/App.tsx`.

---

## 0. Resumen Ejecutivo

Este plan implementa dos capacidades esenciales solicitadas para GoalRecall:
1. **Gestión y Cambio de Foto de Perfil (Avatar Engine):** Permite al usuario personalizar su avatar mediante carga directa de imágenes locales (PNG/JPG/WEBP con compresión client-side en canvas a ~256x256 para evitar sobrecarga en storage), ingreso de URL directa (GitHub, LinkedIn, Gravatar) o selección de avatares predefinidos. Se persiste en el perfil activo, en la cuenta custom correspondiente y se sincroniza automáticamente con Cloud Sync (`/api/cloud-sync/*`).
2. **Página Dedicada de Características de GoalRecall (`FeaturesView.tsx`):** Un catálogo interactivo, exhaustivo y navegable con vista dedicada (`activeView === "features"`), filtros por categoría, demostraciones y micro-simuladores en vivo (Google XYZ, STAR, CV Ingestion, Cloud Sync), comparativa frente a herramientas genéricas (Notion, LinkedIn) y accesos directos desde la Landing Page y la barra de navegación.

---

## 1. Hallazgos del Codebase (verificado)

| Componente / Módulo | Estado Actual | Decisión de Implementación |
|---------------------|---------------|---------------------------|
| **Modelo de Usuario** (`UserProfile`) | Contiene `avatar: string`. | Mantener interfaz limpia. Añadir helper `updateUserAvatar(newAvatarUrl)` y compresión en canvas. |
| **Persistencia de Perfil** (`storage.ts`) | `saveUser` guarda en `captains_user_v1`. Las cuentas custom están en `goal_recall_custom_accounts_v1`. | Al cambiar foto, actualizar tanto `saveUser` como la cuenta en `saveStoredCustomAccounts` para persistencia bidireccional. Disparar `triggerCloudSync()`. |
| **Routing de Vistas** (`App.tsx`) | `activeView: "landing" \| "quarters" \| "public"`. | Ampliar a `"landing" \| "quarters" \| "public" \| "features"`. |
| **Navegación** (`Navbar.tsx`) | Enlaces ancla `#features` en landing; tabs para quarters. | Enlazar botón "Características" directamente a la vista dedicada `features`, y permitir volver con un clic a Landing o a la Bitácora. |
| **Modal de Edición de Perfil** (`AuthModal.tsx`) | Permite editar nombre, título, ubicación y bio, pero **no** la foto. | Añadir botón con icono de cámara sobre el avatar en `AuthModal`, selector de presets y botón para abrir el `AvatarModal`. |
| **Modal de Configuración** (`SettingsBackupModal.tsx`) | Solo contiene redes de empleo y copia de respaldo JSON. | Añadir tab o sección de gestión de foto y perfil para acceso rápido desde la configuración. |
| **Landing Page** (`LandingPage.tsx`) | Sección de características básica con 4 tarjetas estáticas. | Añadir botón de llamado a la acción hacia la página dedicada: "Explorar catálogo completo de características →". |

---

## 2. FASE 1: Motor de Foto de Perfil (Avatar Engine)

### 2.1 Utilidad de Procesamiento y Compresión en Cliente
- Función `compressImageFile(file: File, maxWidth = 300, maxHeight = 300, quality = 0.85): Promise<string>`:
  - Lee el archivo con `FileReader`.
  - Carga la imagen en un elemento `HTMLImageElement`.
  - Dibuja en un `<canvas>` manteniendo relación de aspecto y exporta como `data:image/webp` o `data:image/jpeg`.
  - Previene que archivos de 5-10 MB inflen el `localStorage` o fallen en peticiones de Cloud Sync.

### 2.2 Componente `AvatarModal.tsx`
- Modal intuitivo con 3 métodos de actualización:
  1. **Subir Archivo Local:** Drag & drop o selector de archivo (PNG, JPG, WEBP, SVG) con previsualización en vivo.
  2. **URL Externa:** Input de URL directa con validación y prueba de carga en tiempo real.
  3. **Presets Profesionales:** Selección de 8 avatares vectoriales y fotográficos optimizados.
  4. **Eliminar / Restablecer Foto:** Volver al avatar por defecto.
- Acciones:
  - Guardar y propagar a `App.tsx` vía `onUpdateAvatar(url)`.
  - Toast de confirmación inmediata.

### 2.3 Sincronización en Almacenamiento y Cuentas Custom
- Actualizar `src/utils/storage.ts`:
  - `updateUserAvatar(newAvatarUrl: string)` actualiza `currentUser`.
  - Si el usuario logueado corresponde a una cuenta custom en `goal_recall_custom_accounts_v1`, actualiza el avatar de dicha cuenta para mantener la foto en futuros logins.
  - Ejecuta `triggerCloudSync()` para respaldar en el servidor `/api/cloud-sync/push`.

---

## 3. FASE 2: Página Dedicada de Características (`FeaturesView.tsx`)

### 3.1 Arquitectura del Componente `FeaturesView.tsx`
- **Ubicación:** `src/components/FeaturesView.tsx`.
- **Estructura Visual:**
  - **Hero Header:** Título de alto impacto, propuesta de valor, badges técnicos (Google XYZ, STAR, Zero Slop, Cloud Sync) y breadcrumb para volver a Inicio o Bitácora.
  - **Filtros por Categoría:**
    - Todas (Overview integral)
    - ⚡ Captura Rápida & Fricción Cero
    - 🧠 Motor de IA (Google XYZ & STAR)
    - 📄 Extracción de CV & Experiencias
    - 💼 Vitrina Pública & Modo Entrevista
    - ☁️ Cloud Sync, Respaldo & Privacidad
    - 🚀 Roadmap Etapa 2 (ATS & Tracker de Ofertas)
  - **Grid de Características en Detalle:**
    - Cada tarjeta cuenta con icono temático, etiquetas técnicas, descripción orientada a resultados, métrica o impacto cuantificable y código de ejemplo o vista previa interactiva.
  - **Playground Interactivo (Live Micro-Simulators):**
    - Pestaña 1: **Simulador de Fórmula Google XYZ** (Transforma un logro común en viñeta ejecutiva).
    - Pestaña 2: **Simulador de Historias STAR** (Situación, Tarea, Acción, Resultado medible).
    - Pestaña 3: **Extractor de CV** (Muestra cómo parsea un bloque de texto o PDF a entidades estructuradas).
    - Pestaña 4: **Inspector de Cloud Sync & JSON** (Muestra el esquema portable sin vendor lock-in).
  - **Tabla Comparativa Exhaustiva:**
    - GoalRecall vs Notion/Obsidian vs Documento Word/PDF vs LinkedIn.
  - **Llamado a la Acción (CTA) Final:**
    - "Iniciar Mi Bitácora en 30 Segundos" y "Explorar Vitrina Demo".

---

## 4. FASE 3: Integración en Navegación y Vistas

### 4.1 Navbar (`Navbar.tsx`)
- Soporte para `activeView === "features"`.
- Botón "Características" en la barra de navegación abre la vista dedicada.
- El avatar del usuario en el navbar muestra indicador de clic para editar foto directamente.

### 4.2 Landing Page (`LandingPage.tsx`)
- Añadir botón destacado en la sección de características: "Explorar catálogo completo con demostraciones en vivo →".
- Enlace en el footer "Catálogo de Características".

### 4.3 Integración en Modales Existentes
- `AuthModal.tsx`: Botón de edición de foto en el perfil activo y en el formulario de edición.
- `SettingsBackupModal.tsx`: Selector de foto en la pestaña de redes de empleo y perfil.

---

## 5. Testing & Validación

- Validar compilación con `compile_applet` (`tsc --noEmit`).
- Verificar que la compresión de imagen reduce fotos pesadas a strings `< 100 KB`.
- Comprobar que cambiar la foto actualiza el avatar en:
  - Navbar
  - Header de Bitácora privada
  - Vitrina Pública (Public Deck)
  - Modal de Auth
  - Cuentas persistidas en `localStorage` y en la nube vía Cloud Sync.
- Verificar navegación fluida entre Inicio, Características, Bitácora y Vitrina Pública.

---

## 6. DoD / Checklist de Aceptación

- [x] Motor de compresión y subida de fotos locales implementado.
- [x] Soporte para URL personalizada de imagen y presets.
- [x] Modal `AvatarModal` con interfaz moderna y rápida.
- [x] Persistencia en `UserProfile`, `CustomAccount` y Cloud Sync.
- [x] Vista dedicada `FeaturesView.tsx` creada con filtros por categoría y micro-simuladores.
- [x] Integración en `Navbar`, `LandingPage`, `AuthModal` y `SettingsBackupModal`.
- [x] `compile_applet` exitoso sin errores de TypeScript.
