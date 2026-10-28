import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Zap, 
  Mic, 
  Layers, 
  FileText, 
  Inbox, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  Database,
  UserCheck,
  Building2,
  Trophy,
  MessageSquare,
  Share2,
  Download,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkle
} from "lucide-react";
import { UserProfile } from "../types";
import { useI18n, LanguageSelector } from "../i18n";

interface DocumentationViewProps {
  onOpenQuickLog: () => void;
  onGoToTimeline: () => void;
  onGoToPublicDeck: () => void;
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onOpenCvUpload?: () => void;
  user: UserProfile | null;
}

type DocSection = 
  | "overview" 
  | "experiences" 
  | "achievements" 
  | "ai-assistant" 
  | "privacy-showcase" 
  | "ssot-export" 
  | "faq";

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onOpenQuickLog,
  onGoToTimeline,
  onGoToPublicDeck,
  onBackToLanding,
  onOpenAuth,
  onOpenCvUpload,
  user,
}) => {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<DocSection>("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedExample, setCopiedExample] = useState(false);

  const sections = [
    { id: "overview" as DocSection, title: "1. ¿Qué es y Por Qué Existe?", icon: Compass },
    { id: "experiences" as DocSection, title: "2. Crear Empresas y Proyectos", icon: Building2 },
    { id: "achievements" as DocSection, title: "3. Registrar un Logro (En 40 seg)", icon: Trophy },
    { id: "ai-assistant" as DocSection, title: "4. Asistente IA: Google XYZ & STAR", icon: Sparkles },
    { id: "privacy-showcase" as DocSection, title: "5. Tu Bóveda Privada vs Vitrina", icon: ShieldCheck },
    { id: "ssot-export" as DocSection, title: "6. Punto Único de Datos & Exportar", icon: Share2 },
    { id: "faq" as DocSection, title: "7. Preguntas Frecuentes (FAQ)", icon: HelpCircle },
  ];

  const handleCopyExample = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              ← {t.common.back}
            </button>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {t.docs.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSelector />
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Probar Atajo (⌘K)</span>
            </button>
            {user ? (
              <button
                onClick={onGoToTimeline}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                <span>Mi Bitácora</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 transition-colors"
              >
                <span>Acceder a Mi Cuenta</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1324] to-slate-900 border border-cyan-900/40 overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guía para Profesionales y Candidatos · Link directo: /docs</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Aprende a dominar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">GoalRecall</span> en 5 minutos.
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              La guía completa y sin rodeos técnicos para registrar tus logros laborales en caliente, estructurarlos con fórmulas de impacto y convertirlos en tu mejor activo para evaluaciones salariales, entrevistas y currículums.
            </p>
          </div>
        </div>

        {/* Main Content Layout with Sidebar Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 space-y-2">
            <div className="sticky top-20 p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Índice de la Guía
              </p>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-cyan-400"}`} />
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
                <button
                  onClick={onGoToPublicDeck}
                  className="w-full flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1.5 rounded-lg hover:bg-emerald-950/30 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Vitrina Demo</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Content Body */}
          <div className="lg:col-span-3 space-y-8">

            {/* SECTION 1: OVERVIEW & PURPOSE */}
            {activeSection === "overview" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">¿Por Qué Existe GoalRecall y Qué Problema Resuelve?</h2>
                    <p className="text-sm text-cyan-400 font-medium mt-1">El fin de la amnesia laboral y los currículums desactualizados.</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                    <p>
                      A todos los profesionales nos pasa lo mismo: a lo largo del año resuelves problemas complejos en tu trabajo, ahorras horas de tiempo a tu equipo, lideras proyectos o mejoras procesos. Pero cuando llega el momento de:
                    </p>
                    <ul className="space-y-2 pl-4 border-l-2 border-cyan-500/40 text-slate-200">
                      <li>• Tu <strong>evaluación anual de desempeño</strong> para solicitar un aumento o ascenso.</li>
                      <li>• Una <strong>entrevista laboral</strong> donde te preguntan: <em>"Cuéntame de una situación difícil que hayas resuelto"</em>.</li>
                      <li>• <strong>Postular a un nuevo trabajo</strong> y tener que actualizar tu currículum.</li>
                    </ul>
                    <p>
                      Te quedas en blanco. No recuerdas las cifras exactas, las fechas ni las decisiones clave que tomaste hace 8 meses. 
                    </p>
                    <p className="p-4 bg-slate-950/80 border border-cyan-900/40 rounded-xl text-slate-200">
                      <strong>GoalRecall</strong> es tu <strong>bóveda personal de carrera</strong>. Te permite registrar en 40 segundos tus victorias del día a día, organizarlas por empresa y tener siempre listas tus mejores historias de impacto sin depender de la memoria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">Captura en Caliente</h4>
                      <p className="text-xs text-slate-400">Registra un logro al terminar una reunión o entrega técnica en menos de 40 segundos.</p>
                    </div>
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white">100% Privado</h4>
                      <p className="text-xs text-slate-400">Tus notas quedan guardadas en tu dispositivo y nadie en internet las ve sin tu permiso.</p>
                    </div>
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">Asistente con IA</h4>
                      <p className="text-xs text-slate-400">Transforma notas sencillas en fórmulas profesionales (Google XYZ y formato STAR).</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: EXPERIENCES & COMPANIES */}
            {activeSection === "experiences" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Paso 1: Crear tus Empresas y Experiencias</h2>
                    <p className="text-sm text-blue-400 font-medium mt-1">La estructura que organiza toda tu trayectoria profesional.</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    En GoalRecall, cada logro cuelga de una <strong>Experiencia o Empresa</strong>. Esto garantiza que nunca tengas notas sueltas ni desordenadas. Tienes dos formas muy sencillas de crearlas:
                  </p>

                  {/* Option A & Option B */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Method 1 */}
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center font-mono">A</span>
                        <h3 className="text-sm font-bold text-white">Subir tu CV existente (Recomendado)</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Si ya tienes un currículum en formato <strong>PDF</strong> o <strong>Word (.docx)</strong>:
                      </p>
                      <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                        <li>Haz clic en el botón <strong>"Cargar CV"</strong> en la barra superior.</li>
                        <li>Arrastra tu archivo o selecciónalo desde tu computadora.</li>
                        <li>El sistema lee automáticamente tus empresas, fechas, cargos y viñetas sin que tengas que escribir nada.</li>
                      </ol>
                      {user ? (
                        onOpenCvUpload && (
                          <button
                            onClick={onOpenCvUpload}
                            className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <span>Abrir importador de CV</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <button
                          onClick={onOpenAuth}
                          className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>Crear cuenta o iniciar sesión para importar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Method 2 */}
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">B</span>
                        <h3 className="text-sm font-bold text-white">Crear manualmente en 1 minuto</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Si prefieres añadir una empresa o proyecto nuevo paso a paso:
                      </p>
                      <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                        <li>Entra a <strong>"Mi Bitácora"</strong>.</li>
                        <li>Pulsa el botón <strong>"+ Nueva Empresa / Proyecto"</strong>.</li>
                        <li>Escribe el nombre de la empresa, tu cargo (ej. <em>Product Designer</em> o <em>Tech Lead</em>) y el período de tiempo (ej. <em>2023 - Presente</em>).</li>
                        <li>¡Listo! Tu contenedor queda creado en el Timeline.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-start gap-3 text-xs text-cyan-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Proyectos Personales:</strong> También cuentas con una sección especial fija para tus proyectos independientes, emprendimientos o investigaciones propias que no pertenecen a un empleador formal.
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: ACHIEVEMENTS IN 40 SECONDS */}
            {activeSection === "achievements" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Paso 2: Registrar un Logro (Tu Victoria Laboral)</h2>
                    <p className="text-sm text-amber-400 font-medium mt-1">Diseñado con la filosofía 80/20: registra en caliente sin burocracia.</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Un <strong>logro</strong> es cualquier hito positivo que hayas completado: resolver una incidencia crítica, mejorar la velocidad de una aplicación, cerrar un cliente importante o lanzar una nueva funcionalidad.
                  </p>

                  {/* Workflow Card */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">¿Cómo registrar un logro en menos de 40 segundos?</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">PASO 1</span>
                        <h4 className="font-bold text-white">Abre el formulario rápido</h4>
                        <p className="text-slate-400 leading-relaxed">
                          Presiona en tu teclado <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-mono text-[10px]">Ctrl + K</kbd> (o <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded font-mono text-[10px]">⌘K</kbd> en Mac) o pulsa el botón <strong>"+ Nuevo Logro"</strong>.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">PASO 2</span>
                        <h4 className="font-bold text-white">Escribe o Dicta con tu Voz</h4>
                        <p className="text-slate-400 leading-relaxed">
                          ¿No quieres escribir? Toca el botón del <strong className="text-cyan-300">Micrófono</strong> y habla de forma natural. Tu navegador escribirá el texto por ti sin enviar audios a terceros.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">PASO 3</span>
                        <h4 className="font-bold text-white">Solo 2 campos obligatorios</h4>
                        <p className="text-slate-400 leading-relaxed">
                          Solo necesitas el <strong>Título</strong> (lo que hiciste) y el <strong>Impacto</strong> (el resultado que lograste). El resto de detalles son opcionales con acordeones (+).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Converting CV Bullets */}
                  <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-800/40 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wide">Truco de Productividad: Convertir Viñetas de tu CV</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Si subiste tu currículum, verás que cada viñeta tiene un botón llamado <strong>"Extraer a Logro"</strong>. Al presionarlo, el sistema toma ese texto automáticamente, lo asocia a la empresa y te permite enriquecerlo con métricas y fórmulas en un solo clic.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: AI ASSISTANT (GOOGLE XYZ & STAR) */}
            {activeSection === "ai-assistant" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Paso 3: Estructurar tus Logros con Inteligencia Artificial</h2>
                    <p className="text-sm text-purple-400 font-medium mt-1">Fórmula Google XYZ para currículums y formato STAR para entrevistas.</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    GoalRecall incluye un motor de IA que te ayuda a transformar notas normales en descripciones de nivel internacional:
                  </p>

                  {/* Dual AI Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    
                    {/* Feature 1: Google XYZ */}
                    <div className="p-5 bg-slate-950/80 border border-purple-900/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 font-mono">
                          Para tu Currículum (CV)
                        </span>
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">La Fórmula Google XYZ</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Es el estándar de oro recomendado por los directores de contratación de Google:
                      </p>
                      <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl text-xs text-purple-200 font-mono">
                        "Logró [X], medido por [Y], haciendo [Z]."
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>• <strong>[X]:</strong> El objetivo o resultado de negocio alcanzado.</li>
                        <li>• <strong>[Y]:</strong> La métrica o forma de medirlo (%, tiempo, dinero).</li>
                        <li>• <strong>[Z]:</strong> La acción concreta o tecnología que utilizaste.</li>
                      </ul>
                      <p className="text-xs text-slate-400 italic">
                        La IA lee tu nota y la reescribe automáticamente en esta fórmula en segundos.
                      </p>
                    </div>

                    {/* Feature 2: STAR Stories */}
                    <div className="p-5 bg-slate-950/80 border border-cyan-900/40 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60 font-mono">
                          Para tus Entrevistas
                        </span>
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">El Formato STAR</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Es la estructura universal para responder a preguntas de entrevista con total confianza:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1.5">
                        <li><strong className="text-cyan-300">S (Situación):</strong> El contexto y problema inicial.</li>
                        <li><strong className="text-cyan-300">T (Tarea):</strong> El desafío o meta que debías cumplir.</li>
                        <li><strong className="text-cyan-300">A (Acción):</strong> Los pasos específicos que tomaste.</li>
                        <li><strong className="text-cyan-300">R (Resultado):</strong> El impacto final cuantificado.</li>
                      </ul>
                      <p className="text-xs text-slate-400 italic">
                        Genera un guión completo para repasar antes de cualquier llamada con reclutadores.
                      </p>
                    </div>
                  </div>

                  {/* Live Example Box */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ejemplo Real: Antes vs. Después</h4>
                      <button
                        onClick={() => handleCopyExample("Logró reducir la latencia en 34% medido con Prometheus mediante un rediseño de caché distribuida.")}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {copiedExample ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedExample ? "Copiado" : "Copiar ejemplo"}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl space-y-1">
                        <span className="text-red-400 font-bold">❌ Nota común y vaga:</span>
                        <p className="text-slate-300">"Mejoré la base de datos y la caché porque el sistema andaba lento."</p>
                      </div>
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                        <span className="text-emerald-400 font-bold">✅ Con Fórmula Google XYZ:</span>
                        <p className="text-slate-200">"Logró una <strong>reducción del 34% en latencia p99</strong>, medido por <strong>tiempos de Prometheus</strong>, mediante el <strong>rediseño de la capa de caché distribuida</strong>."</p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* SECTION 5: PRIVACY & PUBLIC SHOWCASE */}
            {activeSection === "privacy-showcase" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Paso 4: Tu Bóveda Privada vs. Tu Vitrina Pública</h2>
                    <p className="text-sm text-emerald-400 font-medium mt-1">Tú tienes el control absoluto: nada se publica sin tu permiso.</p>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Sabemos que en el trabajo manejas proyectos confidenciales o datos que no deben compartirse abiertamente. Por eso, GoalRecall tiene una política estricta de dos capas:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-950/80 border border-amber-900/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Lock className="w-4 h-4" />
                        <h3 className="text-sm font-bold">1. Modo Privado (Por Defecto)</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Cada vez que anotas un logro o subes una experiencia, nace como <strong>privado</strong>. Solo tú puedes verlo en tu Bitácora. Puedes escribir notas sin preocuparte por miradas externas.
                      </p>
                    </div>

                    <div className="p-5 bg-slate-950/80 border border-emerald-900/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Eye className="w-4 h-4" />
                        <h3 className="text-sm font-bold">2. Vitrina Pública (Public Deck)</h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        En cada tarjeta verás un botón que dice <strong>"Publicar en Vitrina"</strong>. Al activarlo, ese logro pasa a tu página web pública, lista para compartir en LinkedIn o con reclutadores.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-white">
                      <Inbox className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Bandeja de Mensajes (Inbox)</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cuando un reclutador o cliente visita tu Vitrina Pública, puede dejarte un mensaje directo con su correo y su propuesta. Recibirás una notificación y el mensaje se guardará en tu pestaña privada de <strong>Inbox</strong> sin intermediarios.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: SSOT & REPLICATION */}
            {activeSection === "ssot-export" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Paso 5: Único Punto de Acceso y Replicación</h2>
                    <p className="text-sm text-indigo-400 font-medium mt-1">"Capture Once, Replicate Everywhere": Registra una vez, utilízalo en todo.</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                    <p>
                      El mayor error profesional es tener 8 versiones distintas de tu currículum en Word, notas desactualizadas en Notion y un perfil de LinkedIn que no coincide con nada.
                    </p>
                    <p>
                      GoalRecall actúa como tu <strong>Única Fuente de Verdad Profesional (SSOT)</strong>. Registras tus victorias en un solo lugar y desde aquí se replican hacia:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold">
                          <FileText className="w-4 h-4" />
                          <span>1. Currículums Enfocados a la Medida</span>
                        </div>
                        <p className="text-slate-400">
                          Exporta solo los logros relevantes según el rol al que postules (ej. un CV enfocado en liderazgo técnico y otro enfocado en arquitectura en la nube).
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Eye className="w-4 h-4" />
                          <span>2. Vitrina Web Compartible</span>
                        </div>
                        <p className="text-slate-400">
                          Pega el enlace de tu Vitrina Pública en tu firma de correo o en tu bio de LinkedIn para que los reclutadores vean tu trayectoria verificada.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-purple-400 font-bold">
                          <MessageSquare className="w-4 h-4" />
                          <span>3. Evaluaciones de Desempeño</span>
                        </div>
                        <p className="text-slate-400">
                          Llega a la reunión anual con tu jefe con la lista exacta de todos tus logros y cifras del año. Negociar un aumento con datos verificables es 10 veces más fácil.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <Database className="w-4 h-4" />
                          <span>4. Respaldo Total sin Bloqueos</span>
                        </div>
                        <p className="text-slate-400">
                          Descarga en cualquier momento una copia completa en formato JSON. Tus datos son 100% tuyos y nunca dependerás de un proveedor externo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 7: FAQ */}
            {activeSection === "faq" && (
              <section className="space-y-6 animate-in fade-in duration-200">
                <div className="p-6 sm:p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Preguntas Frecuentes (FAQ)</h2>
                    <p className="text-sm text-teal-400 font-medium mt-1">Respuestas directas a las dudas más comunes sobre GoalRecall.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      {
                        q: "¿Mis datos están seguros si uso una computadora corporativa o del trabajo?",
                        a: "Sí. GoalRecall es una Progressive Web App (PWA) con arquitectura Local-First. Todo se almacena localmente en el almacenamiento privado de tu navegador. Si trabajas en un banco o empresa con proxies estrictos, tus notas confidenciales no viajan a servidores públicos salvo que tú actives explícitamente el respaldo o decidas publicar un logro."
                      },
                      {
                        q: "¿Cómo cambio mi foto de perfil?",
                        a: "Haz clic sobre el círculo de tu foto en la barra superior o en tu perfil. Se abrirá el selector de avatar donde puedes subir una imagen desde tu computadora (se comprime automáticamente a menos de 60 KB), pegar un enlace directo o elegir entre avatares predefinidos."
                      },
                      {
                        q: "¿Tengo que pagar para usar GoalRecall?",
                        a: "No. El uso básico de la bitácora, la captura por voz, la vitrina pública y la exportación de datos son completamente gratuitos. Tienes cuotas de cortesía mensuales para el asistente de IA con Google Gemini."
                      },
                      {
                        q: "¿Puedo usarlo sin conexión a internet?",
                        a: "Sí. Puedes instalar GoalRecall como una aplicación en tu computadora o teléfono. Incluso si estás en un vuelo o sin wifi, puedes abrir tu bitácora, dictar y registrar logros; todo se guardará en tu equipo local."
                      },
                      {
                        q: "¿Qué pasa si cambio de navegador o borro las cookies?",
                        a: "Si inicias sesión con tu cuenta, GoalRecall cuenta con Cloud Sync automático que respalda tus datos de forma segura en la nube. Además, en la pestaña de Ajustes (⚙️) puedes descargar en cualquier momento un archivo JSON con toda tu base de datos para restaurarla donde quieras."
                      },
                      {
                        q: "¿Cómo comparto mi Vitrina Pública con reclutadores?",
                        a: "En la barra de navegación haz clic en 'Vitrina Pública'. Esa pantalla tiene un enlace único que puedes copiar y enviar a reclutadores o añadir en tu perfil de LinkedIn. Solo verán los logros que tú hayas marcado como públicos."
                      }
                    ].map((item, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden transition-colors"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                          >
                            <span>{item.q}</span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Quick Action Footer inside Docs */}
            <div className="p-6 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 border border-cyan-800/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">¿Listo para comenzar a registrar tus victorias?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Empieza creando tu primera empresa o prueba el atajo de captura en 40 segundos.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenQuickLog}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Registrar Primer Logro</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
