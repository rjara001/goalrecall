# Plan Maestro: Foto de Perfil Personalizada & Catálogo Interactivo de Características

**Proyecto:** GoalRecall  
**Prioridad:** P1 — Alto  
**Estado:** En Implementación  

---

## 0. Resumen Ejecutivo

Este plan adapta y ejecuta los requerimientos solicitados para **GoalRecall**:
1. **Poder cambiar tu foto (Avatar Engine):**
   - Selector y compresor en cliente (Canvas) para fotos locales (PNG, JPG, WEBP).
   - Inserción de URL directa (GitHub, Gravatar, LinkedIn) y galería de avatares predefinidos.
   - Persistencia completa en `UserProfile`, cuentas registradas (`CustomAccount`) y sincronización automática vía Cloud Sync.
   - Accesible desde Navbar, Modal de Perfil (`AuthModal`), Configuración (`SettingsBackupModal`) y Vitrina Pública.
2. **Página Dedicada de Características de GoalRecall (`FeaturesView`):**
   - Vista autónoma y navegable con selector de categorías (Captura Rápida, IA & Síntesis XYZ/STAR, CV & Experiencias, Cloud Sync, Vitrina Pública y Roadmap Etapa 2).
   - Micro-simuladores interactivos en tiempo real (Fórmula Google XYZ, Historias STAR, Parser de CV y JSON Cloud Sync).
   - Tabla comparativa técnica GoalRecall vs Herramientas Genéricas (Notion/Obsidian/LinkedIn).
   - Integración fluida en `Navbar`, `LandingPage` y `App.tsx`.

---

## 1. Módulos y Cambios de Código

| Módulo | Acción | Detalle |
|--------|--------|---------|
| `src/utils/imageCompressor.ts` | **Crear** | Utilidad para comprimir y recortar imágenes en cliente mediante Canvas a ~256x256 WebP/JPEG `< 100 KB`. |
| `src/components/AvatarModal.tsx` | **Crear** | Modal interactivo para cambiar foto con dropzone, presets, URL directa y preview instantáneo. |
| `src/components/FeaturesView.tsx` | **Crear** | Vista dedicada con catálogo exhaustivo de características, micro-simuladores y comparativa. |
| `src/utils/storage.ts` | **Modificar** | Añadir función `updateUserAvatar` con persistencia en `localStorage` y `CustomAccount`, disparando `triggerCloudSync()`. |
| `src/components/Navbar.tsx` | **Modificar** | Soporte de navegación para la vista `features`, enlace a Características y trigger de cambio de avatar al pulsar sobre la foto. |
| `src/components/LandingPage.tsx` | **Modificar** | Enlace prominente a la página dedicada de características en el Hero, sección de features y footer. |
| `src/components/AuthModal.tsx` | **Modificar** | Botón de cámara / cambio de foto en el perfil y formulario de edición. |
| `src/components/SettingsBackupModal.tsx` | **Modificar** | Acceso a cambio de foto en la pestaña de redes y perfil. |
| `src/App.tsx` | **Modificar** | Incorporar `activeView === "features"` y estado/modal de `AvatarModal`. |

---

## 2. Checklist de Verificación (DoD)

- [ ] Compresión de imágenes locales en cliente probada y funcional.
- [ ] Cambio de foto reflejado en Navbar, Bitácora, Vitrina Pública y Perfil de Usuario.
- [ ] Persistencia de la foto en `localStorage` y cuentas custom tras recargar.
- [ ] Vista dedicada de características con filtros y micro-simuladores funcionales.
- [ ] Navegación bidireccional limpia entre Inicio, Características, Bitácora y Vitrina.
- [ ] Compilación TypeScript limpia (`compile_applet` exitoso).
