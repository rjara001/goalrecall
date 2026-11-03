import { SupportedLanguage } from "./types";

export interface DocSectionNav {
  id: string;
  title: string;
}

export interface DocsViewLocale {
  badge: string;
  heroGuideDirect: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroDescription: string;
  navTitle: string;
  demoDeckBtn: string;
  shortcutBtn: string;
  accessAccount: string;
  sections: DocSectionNav[];
  overview: {
    title: string;
    subtitle: string;
    p1: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    p2: string;
    vaultBox: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
  };
  experiences: {
    title: string;
    subtitle: string;
    p1: string;
    methodATitle: string;
    methodADesc: string;
    methodAStep1User: string;
    methodAStep1Guest: string;
    methodAStep2: string;
    methodAStep3: string;
    openCvBtn: string;
    guestPrivacy: string;
    createAccountBtn: string;
    methodBTitle: string;
    methodBDesc: string;
    methodBStep1: string;
    methodBStep2: string;
    methodBStep3: string;
    methodBStep4: string;
    personalProjectsNote: string;
  };
  achievements: {
    title: string;
    subtitle: string;
    p1: string;
    howToTitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    cvTrickTitle: string;
    cvTrickDesc: string;
  };
  aiAssistant: {
    title: string;
    subtitle: string;
    p1: string;
    xyzBadge: string;
    xyzTitle: string;
    xyzLead: string;
    xyzFormula: string;
    xyzX: string;
    xyzY: string;
    xyzZ: string;
    xyzFooter: string;
    starBadge: string;
    starTitle: string;
    starLead: string;
    starS: string;
    starT: string;
    starA: string;
    starR: string;
    starFooter: string;
    exampleTitle: string;
    copyExample: string;
    copied: string;
    beforeLabel: string;
    beforeText: string;
    afterLabel: string;
    afterText: string;
  };
  privacy: {
    title: string;
    subtitle: string;
    p1: string;
    privateTitle: string;
    privateDesc: string;
    publicTitle: string;
    publicDesc: string;
    inboxTitle: string;
    inboxDesc: string;
  };
  ssot: {
    title: string;
    subtitle: string;
    p1: string;
    p2: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  faq: {
    title: string;
    subtitle: string;
    items: { q: string; a: string }[];
  };
  footerReady: {
    title: string;
    subtitle: string;
    btn: string;
  };
}

export const DOCS_LOCALES: Record<SupportedLanguage, DocsViewLocale> = {
  es: {
    badge: "Documentación & Guía",
    heroGuideDirect: "Guía para Profesionales y Candidatos · Link directo: /docs",
    heroTitlePrefix: "Aprende a dominar ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: " en 5 minutos.",
    heroDescription:
      "La guía completa y sin rodeos técnicos para registrar tus logros laborales en caliente, estructurarlos con fórmulas de impacto y convertirlos en tu mejor activo para evaluaciones salariales, entrevistas y currículums.",
    navTitle: "Índice de la Guía",
    demoDeckBtn: "Ver Vitrina Demo",
    shortcutBtn: "Probar Atajo (⌘K)",
    accessAccount: "Acceder a Mi Cuenta",
    sections: [
      { id: "overview", title: "1. ¿Qué es y Por Qué Existe?" },
      { id: "experiences", title: "2. Crear Empresas y Proyectos" },
      { id: "achievements", title: "3. Registrar un Logro (En 40 seg)" },
      { id: "ai-assistant", title: "4. Asistente IA: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. Tu Bóveda Privada vs Vitrina" },
      { id: "ssot-export", title: "6. Punto Único de Datos & Exportar" },
      { id: "faq", title: "7. Preguntas Frecuentes (FAQ)" },
    ],
    overview: {
      title: "¿Por Qué Existe GoalRecall y Qué Problema Resuelve?",
      subtitle: "El fin de la amnesia laboral y los currículums desactualizados.",
      p1: "A todos los profesionales nos pasa lo mismo: a lo largo del año resuelves problemas complejos en tu trabajo, ahorras horas de tiempo a tu equipo, lideras proyectos o mejoras procesos. Pero cuando llega el momento de:",
      bullet1: "Tu evaluación anual de desempeño para solicitar un aumento o ascenso.",
      bullet2: 'Una entrevista laboral donde te preguntan: "Cuéntame de una situación difícil que hayas resuelto".',
      bullet3: "Postular a un nuevo trabajo y tener que actualizar tu currículum.",
      p2: "Te quedas en blanco. No recuerdas las cifras exactas, las fechas ni las decisiones clave que tomaste hace 8 meses.",
      vaultBox:
        "GoalRecall es tu bóveda personal de carrera. Te permite registrar en 40 segundos tus victorias del día a día, organizarlas por empresa y tener siempre listas tus mejores historias de impacto sin depender de la memoria.",
      card1Title: "Captura en Caliente",
      card1Desc: "Registra un logro al terminar una reunión o entrega técnica en menos de 40 segundos.",
      card2Title: "100% Privado",
      card2Desc: "Tus notas quedan guardadas en tu dispositivo y nadie en internet las ve sin tu permiso.",
      card3Title: "Asistente con IA",
      card3Desc: "Transforma notas sencillas en fórmulas profesionales (Google XYZ y formato STAR).",
    },
    experiences: {
      title: "Paso 1: Crear tus Empresas y Experiencias",
      subtitle: "La estructura que organiza toda tu trayectoria profesional.",
      p1: "En GoalRecall, cada logro cuelga de una Experiencia o Empresa. Esto garantiza que nunca tengas notas sueltas ni desordenadas. Tienes dos formas muy sencillas de crearlas:",
      methodATitle: "Subir tu CV existente (Recomendado)",
      methodADesc: "Si ya tienes un currículum en formato PDF o Word (.docx):",
      methodAStep1User: 'Abre el importador desde el menú de tu perfil o el botón "Importar CV".',
      methodAStep1Guest: "Crea tu cuenta gratuita para acceder a tu bóveda privada segura.",
      methodAStep2: "Arrastra tu archivo o selecciónalo desde tu computadora.",
      methodAStep3: "El sistema lee automáticamente tus empresas, fechas, cargos y viñetas sin que tengas que escribir nada.",
      openCvBtn: "Abrir importador de CV",
      guestPrivacy: "Privacidad absoluta: Tu currículum y logros se procesan de forma privada y quedan almacenados exclusivamente en tu cuenta protegida.",
      createAccountBtn: "Crear cuenta gratis para subir CV",
      methodBTitle: "Crear manualmente en 1 minuto",
      methodBDesc: "Si prefieres añadir una empresa o proyecto nuevo paso a paso:",
      methodBStep1: 'Entra a "Mi Bitácora".',
      methodBStep2: 'Pulsa el botón "+ Nueva Empresa / Proyecto".',
      methodBStep3: "Escribe el nombre de la empresa, tu cargo (ej. Tech Lead) y el período (ej. 2023 - Presente).",
      methodBStep4: "¡Listo! Tu contenedor queda creado en el Timeline.",
      personalProjectsNote: "Proyectos Personales: También cuentas con una sección especial fija para tus proyectos independientes o investigaciones propias.",
    },
    achievements: {
      title: "Paso 2: Registrar un Logro (Tu Victoria Laboral)",
      subtitle: "Diseñado con la filosofía 80/20: registra en caliente sin burocracia.",
      p1: "Un logro es cualquier hito positivo que hayas completado: resolver una incidencia crítica, mejorar la velocidad de una aplicación o lanzar una funcionalidad.",
      howToTitle: "¿Cómo registrar un logro en menos de 40 segundos?",
      step1Title: "Abre el formulario rápido",
      step1Desc: "Presiona en tu teclado Ctrl + K (o ⌘K en Mac) o pulsa el botón + Nuevo Logro.",
      step2Title: "Escribe o Dicta con tu Voz",
      step2Desc: "¿No quieres escribir? Toca el botón del Micrófono y habla con naturalidad; tu navegador escribirá por ti.",
      step3Title: "Solo 2 campos obligatorios",
      step3Desc: "Solo necesitas el Título (lo que hiciste) y el Impacto (el resultado). El resto de detalles son opcionales con acordeones (+).",
      cvTrickTitle: "Truco de Productividad: Convertir Viñetas de tu CV",
      cvTrickDesc: 'Si subiste tu currículum, cada viñeta tiene un botón llamado "Extraer a Logro". Al presionarlo, el sistema toma ese texto automáticamente.',
    },
    aiAssistant: {
      title: "Paso 3: Estructurar tus Logros con Inteligencia Artificial",
      subtitle: "Fórmula Google XYZ para currículums y formato STAR para entrevistas.",
      p1: "GoalRecall incluye un motor de IA que te ayuda a transformar notas normales en descripciones de nivel internacional:",
      xyzBadge: "Para tu Currículum (CV)",
      xyzTitle: "La Fórmula Google XYZ",
      xyzLead: "Es el estándar de oro recomendado por los directores de contratación de Google:",
      xyzFormula: '"Logró [X], medido por [Y], haciendo [Z]."',
      xyzX: "[X]: El objetivo o resultado de negocio alcanzado.",
      xyzY: "[Y]: La métrica o forma de medirlo (%, tiempo, dinero).",
      xyzZ: "[Z]: La acción concreta o tecnología que utilizaste.",
      xyzFooter: "La IA lee tu nota y la reescribe automáticamente en esta fórmula en segundos.",
      starBadge: "Para tus Entrevistas",
      starTitle: "El Formato STAR",
      starLead: "Es la estructura universal para responder a preguntas de entrevista con total confianza:",
      starS: "S (Situación): El contexto y problema inicial.",
      starT: "T (Tarea): El desafío o meta que debías cumplir.",
      starA: "A (Acción): Los pasos específicos que tomaste.",
      starR: "R (Resultado): El impacto final cuantificado.",
      starFooter: "Genera un guión completo para repasar antes de cualquier llamada con reclutadores.",
      exampleTitle: "Ejemplo Real: Antes vs. Después",
      copyExample: "Copiar ejemplo",
      copied: "Copiado",
      beforeLabel: "❌ Nota común y vaga:",
      beforeText: '"Mejoré la base de datos y la caché porque el sistema andaba lento."',
      afterLabel: "✅ Con Fórmula Google XYZ:",
      afterText: '"Logró una reducción del 34% en latencia p99, medido por tiempos de Prometheus, mediante el rediseño de la capa de caché distribuida."',
    },
    privacy: {
      title: "Paso 4: Tu Bóveda Privada vs. Tu Vitrina Pública",
      subtitle: "Tú tienes el control absoluto: nada se publica sin tu permiso.",
      p1: "Sabemos que en el trabajo manejas proyectos confidenciales. Por eso GoalRecall tiene una política estricta de dos capas:",
      privateTitle: "1. Modo Privado (Por Defecto)",
      privateDesc: "Cada vez que anotas un logro, nace como privado. Solo tú puedes verlo en tu Bitácora sin preocuparte por miradas externas.",
      publicTitle: "2. Vitrina Pública (Public Deck)",
      publicDesc: 'En cada tarjeta verás un botón que dice "Publicar en Vitrina". Al activarlo, pasa a tu página web pública para reclutadores.',
      inboxTitle: "Bandeja de Mensajes (Inbox)",
      inboxDesc: "Cuando un reclutador visita tu Vitrina Pública, puede dejarte una propuesta directa con su correo. El mensaje se guardará en tu pestaña privada de Inbox.",
    },
    ssot: {
      title: "Paso 5: Único Punto de Acceso y Replicación",
      subtitle: '"Capture Once, Replicate Everywhere": Registra una vez, utilízalo en todo.',
      p1: "El mayor error profesional es tener 8 versiones distintas de tu currículum en Word y notas desactualizadas en Notion.",
      p2: "GoalRecall actúa como tu Única Fuente de Verdad Profesional (SSOT). Registras tus victorias en un solo lugar y desde aquí se replican hacia:",
      card1Title: "1. Currículums Enfocados a la Medida",
      card1Desc: "Exporta solo los logros relevantes según el rol al que postules.",
      card2Title: "2. Vitrina Web Compartible",
      card2Desc: "Pega el enlace de tu Vitrina Pública en tu bio de LinkedIn para mostrar evidencia verificada.",
      card3Title: "3. Evaluaciones de Desempeño",
      card3Desc: "Llega a tu reunión anual con la lista exacta de todos tus logros y cifras del año.",
      card4Title: "4. Respaldo Total sin Bloqueos",
      card4Desc: "Descarga en cualquier momento una copia completa en formato JSON sin depender de proveedores.",
    },
    faq: {
      title: "Preguntas Frecuentes (FAQ)",
      subtitle: "Respuestas directas a las dudas más comunes sobre GoalRecall.",
      items: [
        {
          q: "¿Mis datos están seguros si uso una computadora corporativa o del trabajo?",
          a: "Sí. GoalRecall es una Progressive Web App (PWA) con arquitectura Local-First. Todo se almacena localmente en el almacenamiento privado de tu navegador. Si trabajas en un banco o empresa con proxies estrictos, tus notas confidenciales no viajan a servidores públicos salvo que tú actives explícitamente el respaldo o decidas publicar un logro.",
        },
        {
          q: "¿Cómo cambio mi foto de perfil?",
          a: "Haz clic sobre el círculo de tu foto en la barra superior o en tu perfil. Se abrirá el selector de avatar donde puedes subir una imagen desde tu computadora (se comprime automáticamente a menos de 60 KB), pegar un enlace directo o elegir entre avatares predefinidos.",
        },
        {
          q: "¿Tengo que pagar para usar GoalRecall?",
          a: "No. El uso básico de la bitácora, la captura por voz, la vitrina pública y la exportación de datos son completamente gratuitos. Tienes cuotas de cortesía mensuales para el asistente de IA con Google Gemini.",
        },
        {
          q: "¿Puedo usarlo sin conexión a internet?",
          a: "Sí. Puedes instalar GoalRecall como una aplicación en tu computadora o teléfono. Incluso si estás en un vuelo o sin wifi, puedes abrir tu bitácora, dictar y registrar logros; todo se guardará en tu equipo local.",
        },
        {
          q: "¿Qué pasa si cambio de navegador o borro las cookies?",
          a: "Si inicias sesión con tu cuenta, GoalRecall cuenta con Cloud Sync automático que respalda tus datos de forma segura en la nube. Además, en la pestaña de Ajustes (⚙️) puedes descargar en cualquier momento un archivo JSON con toda tu base de datos para restaurarla donde quieras.",
        },
        {
          q: "¿Cómo comparto mi Vitrina Pública con reclutadores?",
          a: "En la barra de navegación haz clic en 'Vitrina Pública'. Esa pantalla tiene un enlace único que puedes copiar y enviar a reclutadores o añadir en tu perfil de LinkedIn. Solo verán los logros que tú hayas marcado como públicos.",
        },
      ],
    },
    footerReady: {
      title: "¿Listo para comenzar a registrar tus victorias?",
      subtitle: "Empieza creando tu primera empresa o prueba el atajo de captura en 40 segundos.",
      btn: "Registrar Primer Logro",
    },
  },
  en: {
    badge: "Documentation & User Guide",
    heroGuideDirect: "Guide for Professionals & Candidates · Direct link: /docs",
    heroTitlePrefix: "Master ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: " in 5 minutes.",
    heroDescription:
      "The complete, no-fluff guide to capturing your work achievements on the fly, formatting them into high-impact formulas, and turning them into your biggest asset for performance reviews, interviews, and resumes.",
    navTitle: "Guide Contents",
    demoDeckBtn: "View Public Showcase",
    shortcutBtn: "Try Shortcut (⌘K)",
    accessAccount: "Access My Account",
    sections: [
      { id: "overview", title: "1. What is it & Why Does It Exist?" },
      { id: "experiences", title: "2. Adding Companies & Projects" },
      { id: "achievements", title: "3. Log an Achievement (In 40 Sec)" },
      { id: "ai-assistant", title: "4. AI Assistant: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. Private Vault vs Public Showcase" },
      { id: "ssot-export", title: "6. Single Source of Truth & Export" },
      { id: "faq", title: "7. Frequently Asked Questions (FAQ)" },
    ],
    overview: {
      title: "Why Does GoalRecall Exist and What Problem Does It Solve?",
      subtitle: "The end of workplace amnesia and outdated resumes.",
      p1: "Every professional experiences the same issue: throughout the year you solve tough technical challenges, save your team hours of work, lead initiatives, or streamline workflows. But when it's time for:",
      bullet1: "Your annual performance review to request a promotion or salary raise.",
      bullet2: 'A job interview where they ask: "Tell me about a difficult challenge you solved".',
      bullet3: "Applying to a new role and having to rebuild your resume from scratch.",
      p2: "Your mind goes blank. You can't remember the exact numbers, dates, or architecture choices you made 8 months ago.",
      vaultBox:
        "GoalRecall is your personal career vault. It lets you capture daily technical wins in 40 seconds, organize them by employer, and keep your best impact stories interview-ready at all times without relying on memory.",
      card1Title: "Real-Time Capture",
      card1Desc: "Log an achievement right after a deployment, sprint demo, or incident post-mortem in under 40 seconds.",
      card2Title: "100% Private",
      card2Desc: "Your entries stay strictly on your device and are never shared publicly without your explicit consent.",
      card3Title: "AI Copilot",
      card3Desc: "Instantly elevates raw notes into executive-grade formulas (Google XYZ and behavioral STAR formats).",
    },
    experiences: {
      title: "Step 1: Set Up Companies & Experiences",
      subtitle: "The structured hierarchy organizing your entire career trajectory.",
      p1: "In GoalRecall, every achievement belongs to an Experience or Company. This ensures you never have fragmented or uncontextualized notes. You have two simple ways to set them up:",
      methodATitle: "Upload Your Existing Resume (Recommended)",
      methodADesc: "If you already have a resume in PDF or Word (.docx) format:",
      methodAStep1User: 'Open the importer from your profile menu or the "Import CV" button.',
      methodAStep1Guest: "Create a free account to access your secure private vault.",
      methodAStep2: "Drag and drop your file or select it from your computer.",
      methodAStep3: "The system automatically parses companies, dates, titles, and bullet points without requiring manual typing.",
      openCvBtn: "Open Resume Importer",
      guestPrivacy: "Absolute Privacy: Your resume and achievements are processed securely and stored exclusively inside your protected account.",
      createAccountBtn: "Create Free Account to Upload CV",
      methodBTitle: "Create Manually in 1 Minute",
      methodBDesc: "If you prefer adding a company or project step-by-step:",
      methodBStep1: 'Go to "Achievements Logbook".',
      methodBStep2: 'Click the "+ New Company / Project" button.',
      methodBStep3: "Enter the company name, your role (e.g., Tech Lead), and the timeframe (e.g., 2023 - Present).",
      methodBStep4: "All set! Your container is ready on your Timeline.",
      personalProjectsNote: "Personal Projects: You also get a dedicated section for independent endeavors, open-source projects, and research.",
    },
    achievements: {
      title: "Step 2: Log an Achievement (Your Career Win)",
      subtitle: "Engineered with 80/20 discipline: log on the fly without friction or bureaucracy.",
      p1: "An achievement is any milestone you completed: fixing a production outage, boosting application latency, closing an enterprise deal, or shipping a feature.",
      howToTitle: "How to log an achievement in under 40 seconds?",
      step1Title: "Open the Quick Capture Modal",
      step1Desc: "Press Ctrl + K (or ⌘K on macOS) anywhere or click the + New Achievement button.",
      step2Title: "Type or Dictate with Voice",
      step2Desc: "Don't feel like typing? Tap the Microphone icon and speak naturally; your browser transcribes your speech locally in real-time.",
      step3Title: "Only 2 Required Fields",
      step3Desc: "Only Title (what you did) and Impact (the business outcome) are mandatory. The rest can be added later via (+) accordions.",
      cvTrickTitle: "Productivity Tip: Convert Imported CV Bullets",
      cvTrickDesc: 'If you imported a resume, every extracted bullet point has an "Extract to Achievement" action that transforms it into a full record with 1 click.',
    },
    aiAssistant: {
      title: "Step 3: Structure Achievements with AI Intelligence",
      subtitle: "Google XYZ formula for resumes and STAR format for technical interviews.",
      p1: "GoalRecall includes a built-in AI engine to transform unstructured drafts into top-tier executive bullet points:",
      xyzBadge: "For Your Resume (CV)",
      xyzTitle: "The Google XYZ Formula",
      xyzLead: "The golden standard recommended by Google executive hiring committees:",
      xyzFormula: '"Accomplished [X], as measured by [Y], by doing [Z]."',
      xyzX: "[X]: The primary objective or business outcome delivered.",
      xyzY: "[Y]: The quantifiable metric (%, milliseconds, revenue saved).",
      xyzZ: "[Z]: The concrete technical action, architecture, or tools applied.",
      xyzFooter: "The AI reads your draft and automatically formulates it into this strict pattern in seconds.",
      starBadge: "For Your Interviews",
      starTitle: "The STAR Framework",
      starLead: "The universal framework to answer behavioral and System Design interview questions with total clarity:",
      starS: "S (Situation): The context, scale, and initial obstacle.",
      starT: "T (Task): The specific mandate or target you had to achieve.",
      starA: "A (Action): The engineering decisions and implementation steps you took.",
      starR: "R (Result): The quantified final business impact.",
      starFooter: "Generates an interview-ready script to review before speaking with hiring managers.",
      exampleTitle: "Real-World Comparison: Before vs. After",
      copyExample: "Copy example",
      copied: "Copied",
      beforeLabel: "❌ Vague typical draft:",
      beforeText: '"Improved the database and cache because the application was running slow."',
      afterLabel: "✅ With Google XYZ Formula:",
      afterText: '"Accomplished a 34% reduction in p99 latency, as measured by Prometheus response times, by redesigning the distributed cache layer with Redis Cluster."',
    },
    privacy: {
      title: "Step 4: Your Private Vault vs. Public Showcase",
      subtitle: "You retain full control: nothing is published without your explicit consent.",
      p1: "We understand that your day-to-day work often involves confidential codebases and proprietary metrics. GoalRecall enforces a strict dual-layer isolation:",
      privateTitle: "1. Private Vault (Default)",
      privateDesc: "Every achievement or experience starts as private. Only you can view it inside your authenticated logbook without fear of leaks.",
      publicTitle: "2. Public Showcase (Public Deck)",
      publicDesc: 'Each card has a "Publish to Showcase" toggle. Enabling it exposes only that approved project to your public portfolio link.',
      inboxTitle: "Private Recruiter Inbox",
      inboxDesc: "When recruiters browse your Public Deck, they can leave direct notes and interview inquiries. You receive them in your private Inbox tab.",
    },
    ssot: {
      title: "Step 5: Single Source of Truth & Universal Replication",
      subtitle: '"Capture Once, Replicate Everywhere": Log once, use across your entire career.',
      p1: "The biggest career mistake is maintaining 8 conflicting versions of your resume, scattered Notion notes, and an outdated LinkedIn profile.",
      p2: "GoalRecall acts as your Single Source of Truth (SSOT). You capture achievements in one place, and they seamlessly replicate into:",
      card1Title: "1. Tailored Resumes",
      card1Desc: "Export targeted resumes emphasizing only the achievements matching the specific role requirements.",
      card2Title: "2. Shareable Portfolio Deck",
      card2Desc: "Link your verified Public Deck in your email signature or LinkedIn profile for instant credibility.",
      card3Title: "3. Annual Performance Reviews",
      card3Desc: "Walk into your compensation review with an indisputable record of every contribution and dollar saved.",
      card4Title: "4. Zero Lock-In Backup",
      card4Desc: "Download a full, unencrypted JSON export anytime. You own your data completely.",
    },
    faq: {
      title: "Frequently Asked Questions (FAQ)",
      subtitle: "Direct answers to common questions about GoalRecall.",
      items: [
        {
          q: "Are my confidential company projects safe on a work computer?",
          a: "Yes. GoalRecall is a Local-First Progressive Web App (PWA). All data is stored locally in your browser's private storage. If you work in a bank or regulated enterprise, confidential records never touch public servers unless you explicitly configure cloud sync or publish a project.",
        },
        {
          q: "How do I update my profile picture or avatar?",
          a: "Click your avatar circle in the top navigation bar or inside your profile settings. You can upload an image from your device (automatically compressed to under 60 KB), paste a direct image URL, or pick from our illustrated tech presets.",
        },
        {
          q: "Do I have to pay to use GoalRecall?",
          a: "No. Core logbook tracking, voice dictation, the public recruiter deck, and data exports are completely free. Generous monthly quotas are included for Google Gemini AI synthesis.",
        },
        {
          q: "Can I use GoalRecall offline without an internet connection?",
          a: "Yes. You can install GoalRecall as a PWA desktop or mobile app. Even on an airplane without Wi-Fi, you can open your logbook, dictate notes, and log achievements locally.",
        },
        {
          q: "What happens if I change browsers or clear my cache?",
          a: "If you log into your free account, GoalRecall provides automatic Cloud Sync to back up your records securely. You can also download a JSON backup from Settings (⚙️) anytime to restore on any machine.",
        },
        {
          q: "How do I share my Public Showcase with recruiters?",
          a: "Click 'Public Deck' in the navigation bar. You will find a unique link to copy and send to recruiters or attach to your LinkedIn headline. Visitors only see achievements you marked as public.",
        },
      ],
    },
    footerReady: {
      title: "Ready to start logging your technical wins?",
      subtitle: "Create your first company experience or test our 40-second quick capture modal now.",
      btn: "Log Your First Achievement",
    },
  },
  pt: {
    badge: "Documentação & Guia",
    heroGuideDirect: "Guia para Profissionais e Candidatos · Link direto: /docs",
    heroTitlePrefix: "Aprenda a dominar o ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: " em 5 minutos.",
    heroDescription:
      "O guia completo e direto para registrar suas conquistas profissionais em tempo real, estruturá-las com fórmulas de impacto e transformá-las em seu maior ativo para avaliações, entrevistas e currículos.",
    navTitle: "Índice do Guia",
    demoDeckBtn: "Ver Vitrine Demo",
    shortcutBtn: "Testar Atalho (⌘K)",
    accessAccount: "Acessar Minha Conta",
    sections: [
      { id: "overview", title: "1. O Que É e Por Que Existe?" },
      { id: "experiences", title: "2. Criar Empresas e Projetos" },
      { id: "achievements", title: "3. Registrar Conquista (40 seg)" },
      { id: "ai-assistant", title: "4. Assistente IA: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. Cofre Privado vs Vitrine Pública" },
      { id: "ssot-export", title: "6. Fonte Única da Verdade & Exportar" },
      { id: "faq", title: "7. Perguntas Frequentes (FAQ)" },
    ],
    overview: {
      title: "Por Que o GoalRecall Existe e Qual Problema Ele Resolve?",
      subtitle: "O fim da amnésia profissional e dos currículos desatualizados.",
      p1: "Todos os profissionais passam pelo mesmo problema: ao longo do ano você resolve desafios complexos, economiza horas da sua equipe e melhora processos. Mas na hora de:",
      bullet1: "Sua avaliação anual de desempenho para pedir aumento ou promoção.",
      bullet2: 'Uma entrevista onde perguntam: "Conte sobre um desafio difícil que você resolveu".',
      bullet3: "Candidatar-se a uma nova vaga e ter que reescrever seu currículo do zero.",
      p2: "Sua mente fica em branco. Você não se lembra dos números exatos nem das decisões técnicas de 8 meses atrás.",
      vaultBox:
        "O GoalRecall é seu cofre de carreira. Permite registrar em 40 segundos suas vitórias diárias, organizá-las por empresa e ter sempre prontas suas melhores histórias de impacto.",
      card1Title: "Captura Imediata",
      card1Desc: "Registre uma conquista logo após uma reunião ou entrega técnica em menos de 40 segundos.",
      card2Title: "100% Privado",
      card2Desc: "Suas notas ficam armazenadas no seu dispositivo e ninguém na internet tem acesso sem sua autorização.",
      card3Title: "Assistente com IA",
      card3Desc: "Transforma anotações simples em fórmulas profissionais (Google XYZ e formato STAR).",
    },
    experiences: {
      title: "Passo 1: Criar suas Empresas e Experiências",
      subtitle: "A estrutura que organiza toda a sua trajetória profissional.",
      p1: "No GoalRecall, cada conquista pertence a uma Empresa ou Experiência. Isso evita notas soltas ou desorganizadas. Há duas formas simples de criá-las:",
      methodATitle: "Enviar seu CV existente (Recomendado)",
      methodADesc: "Se você já tem um currículo em formato PDF ou Word (.docx):",
      methodAStep1User: 'Abra o importador pelo menu do perfil ou no botão "Importar CV".',
      methodAStep1Guest: "Crie sua conta gratuita para acessar seu cofre privado protegido.",
      methodAStep2: "Arraste o arquivo ou selecione do computador.",
      methodAStep3: "O sistema lê automaticamente empresas, datas, cargos e tópicos sem digitação manual.",
      openCvBtn: "Abrir importador de CV",
      guestPrivacy: "Privacidade absoluta: Seu currículo e conquistas são processados de forma privada e ficam armazenados na sua conta.",
      createAccountBtn: "Criar conta grátis para enviar CV",
      methodBTitle: "Criar manualmente em 1 minuto",
      methodBDesc: "Se preferir adicionar uma empresa ou projeto passo a passo:",
      methodBStep1: 'Acesse "Meu Registro".',
      methodBStep2: 'Clique no botão "+ Nova Empresa / Projeto".',
      methodBStep3: "Preencha o nome da empresa, seu cargo (ex: Tech Lead) e o período.",
      methodBStep4: "Pronto! Seu container foi criado no Timeline.",
      personalProjectsNote: "Projetos Pessoais: Você também conta com uma área exclusiva para iniciativas independentes e pesquisas.",
    },
    achievements: {
      title: "Passo 2: Registrar uma Conquista (Sua Vitória Profissional)",
      subtitle: "Projetado com a filosofia 80/20: registro ágil sem burocracia.",
      p1: "Uma conquista é qualquer marco positivo concluído: mitigar um incidente crítico, otimizar a velocidade de uma aplicação ou lançar uma funcionalidade.",
      howToTitle: "Como registrar uma conquista em menos de 40 segundos?",
      step1Title: "Abra o formulário rápido",
      step1Desc: "Pressione Ctrl + K (ou ⌘K no Mac) ou clique no botão + Nova Conquista.",
      step2Title: "Escreva ou Ditado por Voz",
      step2Desc: "Não quer digitar? Toque no microfone e fale naturalmente; seu navegador transcreve com precisão.",
      step3Title: "Apenas 2 campos obrigatórios",
      step3Desc: "Apenas Título (o que você fez) e Impacto (o resultado alcançado) são obrigatórios.",
      cvTrickTitle: "Dica de Produtividade: Converter Tópicos do CV",
      cvTrickDesc: 'Ao importar o CV, cada tópico tem o botão "Extrair para Conquista", convertendo o texto com 1 clique.',
    },
    aiAssistant: {
      title: "Passo 3: Estruturar Conquistas com Inteligência Artificial",
      subtitle: "Fórmula Google XYZ para currículos e formato STAR para entrevistas.",
      p1: "O GoalRecall inclui um motor de IA para transformar rascunhos em tópicos de impacto internacional:",
      xyzBadge: "Para o Currículo (CV)",
      xyzTitle: "A Fórmula Google XYZ",
      xyzLead: "O padrão ouro recomendado pelos comitês de contratação do Google:",
      xyzFormula: '"Alcançou [X], medido por [Y], realizando [Z]."',
      xyzX: "[X]: O objetivo ou resultado de negócio alcançado.",
      xyzY: "[Y]: A métrica quantificável (%, tempo, custos).",
      xyzZ: "[Z]: A ação técnica ou tecnologias aplicadas.",
      xyzFooter: "A IA lê sua anotação e a reescreve automaticamente nesta fórmula em segundos.",
      starBadge: "Para Entrevistas",
      starTitle: "O Formato STAR",
      starLead: "A estrutura universal para responder perguntas de entrevista com total confiança:",
      starS: "S (Situação): O contexto e desafio inicial.",
      starT: "T (Tarefa): O objetivo direto que você precisava atingir.",
      starA: "A (Ação): As etapas práticas e decisões que você tomou.",
      starR: "R (Resultado): O impacto final quantificado.",
      starFooter: "Gera um roteiro completo para revisar antes de falar com recrutadores.",
      exampleTitle: "Exemplo Real: Antes vs. Depois",
      copyExample: "Copiar exemplo",
      copied: "Copiado",
      beforeLabel: "❌ Nota comum e vaga:",
      beforeText: '"Melhorei o banco de dados e o cache porque o sistema estava lento."',
      afterLabel: "✅ Com Fórmula Google XYZ:",
      afterText: '"Alcançou redução de 34% na latência p99, medido por métricas do Prometheus, através do redesign da camada de cache distribuído com Redis Cluster."',
    },
    privacy: {
      title: "Passo 4: Seu Cofre Privado vs. Sua Vitrine Pública",
      subtitle: "Controle absoluto: nada é publicado sem a sua autorização.",
      p1: "Sabemos que no trabalho você lida com projetos confidenciais. Por isso o GoalRecall possui isolamento em duas camadas:",
      privateTitle: "1. Modo Privado (Padrão)",
      privateDesc: "Cada conquista registrada nasce como privada. Apenas você tem acesso em seu registro pessoal.",
      publicTitle: "2. Vitrine Pública (Public Deck)",
      publicDesc: 'Cada cartão possui um botão "Publicar na Vitrine". Ao ativar, o projeto aparece no seu link profissional público.',
      inboxTitle: "Caixa de Entrada Privada (Inbox)",
      inboxDesc: "Quando um recrutador acessa sua Vitrine, ele pode enviar uma proposta direta que fica salva na sua aba privada de Inbox.",
    },
    ssot: {
      title: "Passo 5: Fonte Única da Verdade & Replicação Universal",
      subtitle: '"Capture Once, Replicate Everywhere": Registre uma vez, use em tudo.',
      p1: "O maior erro na carreira é manter 8 versões diferentes do currículo no Word e notas desatualizadas no Notion.",
      p2: "O GoalRecall atua como sua Fonte Única da Verdade (SSOT). Você registra em um só lugar e replica para:",
      card1Title: "1. Currículos Sob Medida",
      card1Desc: "Exporte apenas as conquistas alinhadas à vaga pretendida.",
      card2Title: "2. Vitrine Web Compartilhável",
      card2Desc: "Adicione o link da Vitrine no seu LinkedIn para demonstrar evidências verificadas.",
      card3Title: "3. Avaliações de Desempenho",
      card3Desc: "Chegue à sua reunião anual com a lista exata de conquistas e números do ano.",
      card4Title: "4. Backup Sem Bloqueios",
      card4Desc: "Baixe a qualquer momento um arquivo JSON completo com todos os seus dados.",
    },
    faq: {
      title: "Perguntas Frequentes (FAQ)",
      subtitle: "Respostas diretas às principais dúvidas sobre o GoalRecall.",
      items: [
        {
          q: "Meus dados estão seguros usando um computador corporativo?",
          a: "Sim. O GoalRecall é um PWA com arquitetura Local-First. Todos os registros ficam guardados no armazenamento local do navegador e nunca são transmitidos sem autorização.",
        },
        {
          q: "Como altero minha foto de perfil?",
          a: "Clique no círculo da sua foto no menu superior ou nas configurações de perfil. É possível carregar imagem do computador, usar link URL ou escolher avatares prontos.",
        },
        {
          q: "É preciso pagar para usar o GoalRecall?",
          a: "Não. As funções principais de registro, ditado por voz, vitrine pública e exportação de dados são totalmente gratuitas.",
        },
        {
          q: "Posso utilizar sem conexão com a internet?",
          a: "Sim. O GoalRecall pode ser instalado como aplicativo. Mesmo em modo avião ou sem sinal, você pode registrar conquistas offline.",
        },
        {
          q: "O que acontece se eu limpar o cache do navegador?",
          a: "Com login em conta gratuita, o Cloud Sync mantém cópia segura na nuvem. Você também pode baixar backup JSON nas configurações a qualquer momento.",
        },
        {
          q: "Como compartilho minha Vitrine Pública com recrutadores?",
          a: "Clique em 'Vitrina Pública' no menu superior e copie o link personalizado para anexar ao seu currículo ou perfil profissional.",
        },
      ],
    },
    footerReady: {
      title: "Pronto para começar a registrar suas conquistas?",
      subtitle: "Crie sua primeira empresa ou teste o atalho de captura em 40 segundos.",
      btn: "Registrar Primeira Conquista",
    },
  },
  fr: {
    badge: "Documentation & Guide",
    heroGuideDirect: "Guide pour Professionnels & Candidats · Lien direct: /docs",
    heroTitlePrefix: "Maîtrisez ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: " en 5 minutes.",
    heroDescription:
      "Le guide complet et sans détour pour consigner vos réussites professionnelles en temps réel, les structurer avec des formules d'impact et les transformer en atout majeur pour vos entretiens et évaluations.",
    navTitle: "Sommaire du Guide",
    demoDeckBtn: "Voir la Vitrine Démo",
    shortcutBtn: "Essayer le Raccourci (⌘K)",
    accessAccount: "Accéder à Mon Compte",
    sections: [
      { id: "overview", title: "1. Qu'est-ce que c'est et Pourquoi ?" },
      { id: "experiences", title: "2. Créer Entreprises & Projets" },
      { id: "achievements", title: "3. Enregistrer un Succès (40s)" },
      { id: "ai-assistant", title: "4. Assistant IA: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. Coffre Privé vs Vitrine Publique" },
      { id: "ssot-export", title: "6. Source Unique de Vérité & Export" },
      { id: "faq", title: "7. Questions Fréquentes (FAQ)" },
    ],
    overview: {
      title: "Pourquoi GoalRecall existe et quel problème résout-il ?",
      subtitle: "La fin de l'amnésie professionnelle et des CV périmés.",
      p1: "Tous les professionnels rencontrent le même problème : au fil des mois, vous résolvez des défis techniques majeurs et optimisez des processus. Mais au moment de :",
      bullet1: "Votre entretien annuel d'évaluation pour solliciter une augmentation.",
      bullet2: 'Un entretien de recrutement avec la question : "Parlez-moi d\'un défi complexe relevé".',
      bullet3: "Postuler à une nouvelle offre et devoir reconstruire votre CV de zéro.",
      p2: "Vous avez un trou de mémoire. Vous ne vous souvenez plus des chiffres précis ni des décisions prises il y a 8 mois.",
      vaultBox:
        "GoalRecall est votre coffre-fort de carrière personnel. Il vous permet de consigner vos succès quotidiens en 40 secondes, de les classer par entreprise et d'avoir vos meilleures histoires prêtes à tout moment.",
      card1Title: "Capture Immédiate",
      card1Desc: "Enregistrez un accomplissement dès la fin d'une réunion ou livraison en moins de 40 secondes.",
      card2Title: "100% Confidentiel",
      card2Desc: "Vos notes restent stockées sur votre appareil et ne sont jamais visibles sans votre accord explicite.",
      card3Title: "Copilote IA",
      card3Desc: "Transforme des notes brutes en formules percutantes (Google XYZ et format comportemental STAR).",
    },
    experiences: {
      title: "Étape 1 : Créer vos Entreprises et Expériences",
      subtitle: "La structure qui organise l'ensemble de votre parcours.",
      p1: "Dans GoalRecall, chaque réalisation est rattachée à une Entreprise ou Expérience. Cela garantit un historique clair et structuré. Vous avez deux méthodes simples :",
      methodATitle: "Téléverser votre CV existant (Recommandé)",
      methodADesc: "Si vous disposez déjà d'un CV en PDF ou Word (.docx) :",
      methodAStep1User: 'Ouvrez l\'importateur depuis le menu de profil ou le bouton "Importer CV".',
      methodAStep1Guest: "Créez votre compte gratuit pour accéder à votre coffre sécurisé.",
      methodAStep2: "Glissez-déposez votre document.",
      methodAStep3: "Le système extrait automatiquement les entreprises, postes, dates et puces sans saisie manuelle.",
      openCvBtn: "Ouvrir l'importateur de CV",
      guestPrivacy: "Confidentialité totale : Vos documents sont traités localement et restent sécurisés sur votre compte.",
      createAccountBtn: "Créer un compte gratuit pour importer un CV",
      methodBTitle: "Créer manuellement en 1 minute",
      methodBDesc: "Si vous souhaitez ajouter une entreprise étape par étape :",
      methodBStep1: 'Allez dans "Mon Journal".',
      methodBStep2: 'Cliquez sur "+ Nouvelle Entreprise / Projet".',
      methodBStep3: "Saisissez le nom de l'entreprise, votre rôle (ex: Lead Dev) et la période.",
      methodBStep4: "Terminé ! Le conteneur s'affiche sur votre Timeline.",
      personalProjectsNote: "Projets Personnels : Une section dédiée est prévue pour vos projets indépendants et recherches personnelles.",
    },
    achievements: {
      title: "Étape 2 : Consigner un Succès (Votre Victoire)",
      subtitle: "Conçu avec la discipline 80/20 : capture à chaud sans paperasse.",
      p1: "Un accomplissement est tout résultat positif : résolution d'un incident critique, amélioration des temps de réponse ou lancement d'une fonctionnalité.",
      howToTitle: "Comment enregistrer un succès en moins de 40 secondes ?",
      step1Title: "Ouvrez le formulaire rapide",
      step1Desc: "Appuyez sur Ctrl + K (ou ⌘K sur Mac) ou cliquez sur + Nouveau Succès.",
      step2Title: "Rédigez ou Dictez à la Voix",
      step2Desc: "Pas envie d'écrire ? Cliquez sur le micro et dictez naturellement, votre navigateur transcrit en direct.",
      step3Title: "Seulement 2 champs obligatoires",
      step3Desc: "Seuls le Titre (ce que vous avez fait) et l'Impact (le résultat) sont requis.",
      cvTrickTitle: "Astuce Productivité : Convertir les Puces du CV",
      cvTrickDesc: 'Chaque puce de votre CV extrait possède une action "Extraire en Réalisation" pour la convertir en 1 clic.',
    },
    aiAssistant: {
      title: "Étape 3 : Structurer vos Réalisations avec l'IA",
      subtitle: "Formule Google XYZ pour CV et méthodologie STAR pour entretiens.",
      p1: "GoalRecall intègre un moteur IA pour métamorphoser vos notes en accomplissements de standard international :",
      xyzBadge: "Pour votre CV",
      xyzTitle: "La Formule Google XYZ",
      xyzLead: "Le standard préconisé par les recruteurs de la Silicon Valley :",
      xyzFormula: '"A accompli [X], mesuré par [Y], en réalisant [Z]."',
      xyzX: "[X] : L'objectif ou résultat d'impact obtenu.",
      xyzY: "[Y] : L'indicateur de mesure (%, temps, coûts).",
      xyzZ: "[Z] : L'action technique concrète ou la technologie appliquée.",
      xyzFooter: "L'IA analyse votre note et génère automatiquement cette structure en quelques secondes.",
      starBadge: "Pour vos Entretiens",
      starTitle: "La Méthode STAR",
      starLead: "La structure idéale pour répondre avec assurance aux questions comportementales :",
      starS: "S (Situation) : Le contexte et le défi de départ.",
      starT: "T (Tâche) : L'objectif précis qui vous incombait.",
      starA: "A (Action) : Les démarches et choix d'architecture mis en œuvre.",
      starR: "R (Résultat) : L'impact chiffré final.",
      starFooter: "Prépare une trame claire à relire avant tout entretien d'embauche.",
      exampleTitle: "Exemple Concret : Avant vs Après",
      copyExample: "Copier l'exemple",
      copied: "Copié",
      beforeLabel: "❌ Note vague courante :",
      beforeText: '"Amélioration de la base de données et du cache car l\'application ramait."',
      afterLabel: "✅ Avec la Formule Google XYZ :",
      afterText: '"A obtenu une réduction de 34% de la latence p99, mesurée par Prometheus, grâce à la refonte de la couche de cache distribué Redis Cluster."',
    },
    privacy: {
      title: "Étape 4 : Coffre Privé vs Vitrine Publique",
      subtitle: "Maîtrise totale : rien n'est exposé sans votre accord.",
      p1: "Vos missions impliquent des technologies et des chiffres confidentiels. GoalRecall assure une stricte séparation à deux niveaux :",
      privateTitle: "1. Mode Privé (Par Défaut)",
      privateDesc: "Chaque projet saisi démarre en mode privé. Vous seul pouvez y accéder dans votre carnet.",
      publicTitle: "2. Vitrine Publique (Public Deck)",
      publicDesc: 'Un bouton "Publier sur la Vitrine" permet de choisir les projets à rendre visibles publiquement.',
      inboxTitle: "Messagerie Privée (Inbox)",
      inboxDesc: "Les recruteurs visitant votre Vitrine peuvent vous adresser un message privé transmis directement dans votre Inbox.",
    },
    ssot: {
      title: "Étape 5 : Source Unique de Vérité & Réplication",
      subtitle: '"Capture Once, Replicate Everywhere" : Saisissez une fois, utilisez partout.',
      p1: "Le risque classique est d'empiler plusieurs versions de CV non synchronisées dans Word et Notion.",
      p2: "GoalRecall constitue votre Source Unique de Vérité (SSOT) professionnelle, répliquée vers :",
      card1Title: "1. CV Ciblés sur Mesure",
      card1Desc: "Exportez uniquement les réalisations pertinentes pour chaque poste visé.",
      card2Title: "2. Vitrine Web Partageable",
      card2Desc: "Partagez votre lien de Vitrine sur LinkedIn pour démontrer vos preuves concrètes.",
      card3Title: "3. Entretiens Annuels",
      card3Desc: "Présentez-vous avec le bilan chiffré irréfutable de toutes vos réussites de l'année.",
      card4Title: "4. Sauvegarde JSON Complète",
      card4Desc: "Téléchargez à tout moment l'intégralité de vos données au format JSON ouvert.",
    },
    faq: {
      title: "Questions Fréquentes (FAQ)",
      subtitle: "Réponses directes à vos interrogations sur GoalRecall.",
      items: [
        {
          q: "Mes données sont-elles protégées sur mon poste d'entreprise ?",
          a: "Oui. GoalRecall fonctionne en architecture Local-First. Toutes les données sont enregistrées localement dans votre navigateur et ne circulent pas sur des serveurs publics à votre insu.",
        },
        {
          q: "Comment changer ma photo de profil ?",
          a: "Cliquez sur l'avatar dans la barre supérieure ou dans vos réglages. Vous pouvez importer une image, renseigner une URL ou choisir un avatar illustré.",
        },
        {
          q: "L'application est-elle payante ?",
          a: "Non. Le carnet de bord, la dictée vocale, la vitrine publique et l'exportation sont entièrement gratuits.",
        },
        {
          q: "Puis-je l'utiliser hors connexion ?",
          a: "Oui. Installable en PWA, GoalRecall fonctionne en mode avion sans connexion Internet.",
        },
        {
          q: "Que se passe-t-il si je vide mon cache navigateur ?",
          a: "En créant un compte gratuit, la synchronisation Cloud Sync sauvegarde vos données en toute sécurité. Vous pouvez aussi télécharger une sauvegarde JSON.",
        },
        {
          q: "Comment partager ma Vitrine Publique aux recruteurs ?",
          a: "Rendez-vous sur 'Vitrine Publique' dans la barre de menu et copiez votre lien unique pour l'ajouter à votre CV ou profil LinkedIn.",
        },
      ],
    },
    footerReady: {
      title: "Prêt à valoriser vos victoires professionnelles ?",
      subtitle: "Créez votre première entreprise ou testez la capture rapide en 40 secondes.",
      btn: "Enregistrer mon Premier Succès",
    },
  },
  de: {
    badge: "Dokumentation & Leitfaden",
    heroGuideDirect: "Leitfaden für Fachkräfte & Kandidaten · Direktlink: /docs",
    heroTitlePrefix: "Meistern Sie ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: " in 5 Minuten.",
    heroDescription:
      "Der präzise Leitfaden zur Erfassung beruflicher Meilensteine in Echtzeit, strukturiert mit wirkungsvollen Formeln für Gehaltsverhandlungen, Vorstellungsgespräche und Lebensläufe.",
    navTitle: "Inhaltsverzeichnis",
    demoDeckBtn: "Showcase-Demo ansehen",
    shortcutBtn: "Tastaturkürzel testen (⌘K)",
    accessAccount: "Zu meinem Konto",
    sections: [
      { id: "overview", title: "1. Was ist das und warum existiert es?" },
      { id: "experiences", title: "2. Unternehmen & Stationen anlegen" },
      { id: "achievements", title: "3. Erfolg erfassen (in 40 Sek)" },
      { id: "ai-assistant", title: "4. KI-Assistent: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. Privater Tresor vs. Öffentliches Deck" },
      { id: "ssot-export", title: "6. Single Source of Truth & Export" },
      { id: "faq", title: "7. Häufig gestellte Fragen (FAQ)" },
    ],
    overview: {
      title: "Warum existiert GoalRecall und welches Problem löst es?",
      subtitle: "Das Ende von beruflicher Gedächtnislücke und veralteten Lebensläufen.",
      p1: "Jeder Berufstätige kennt das: Im Laufe des Jahres lösen Sie komplexe Probleme und optimieren Prozesse. Doch wenn es an der Zeit ist für:",
      bullet1: "Ihr jährliches Mitarbeitergespräch zur Gehaltsverhandlung.",
      bullet2: 'Ein Vorstellungsgespräch mit der Frage: "Erzählen Sie von einer schwierigen Herausforderung".',
      bullet3: "Die Bewerbung auf eine neue Stelle und die mühsame Überarbeitung des Lebenslaufs.",
      p2: "Man hat ein Blackout. Genaue Zahlen, Termine und technische Architekturentscheidungen von vor 8 Monaten sind vergessen.",
      vaultBox:
        "GoalRecall ist Ihr persönlicher Karrieretresor. Halten Sie tägliche Erfolge in 40 Sekunden fest, ordnen Sie sie Unternehmen zu und haben Sie Ihre überzeugendsten Geschichten immer griffbereit.",
      card1Title: "Echtzeit-Erfassung",
      card1Desc: "Erfassen Sie Meilensteine direkt nach einem Sprint-Review oder Release in unter 40 Sekunden.",
      card2Title: "100% Privat",
      card2Desc: "Ihre Einträge bleiben lokal auf Ihrem Gerät und werden niemals ohne Erlaubnis veröffentlicht.",
      card3Title: "KI-Copilot",
      card3Desc: "Wandelt Notizen in professionelle Standardformeln um (Google XYZ und STAR-Methode).",
    },
    experiences: {
      title: "Schritt 1: Unternehmen und Stationen anlegen",
      subtitle: "Die Struktur, die Ihren gesamten Karriereweg ordnet.",
      p1: "In GoalRecall gehört jeder Erfolg zu einem Unternehmen oder einer Station. So bleiben alle Notizen stets im richtigen Kontext. Zwei einfache Wege stehen bereit:",
      methodATitle: "Bestehenden Lebenslauf hochladen (Empfohlen)",
      methodADesc: "Wenn Sie bereits einen Lebenslauf als PDF oder Word (.docx) besitzen:",
      methodAStep1User: 'Öffnen Sie den Importer im Profilmenü oder über "Lebenslauf importieren".',
      methodAStep1Guest: "Erstellen Sie ein kostenloses Konto für Ihren privaten Tresor.",
      methodAStep2: "Datei per Drag-and-Drop ablegen.",
      methodAStep3: "Das System erkennt Unternehmen, Daten, Positionen und Aufzählungspunkte automatisch.",
      openCvBtn: "CV-Importer öffnen",
      guestPrivacy: "Absolute Vertraulichkeit: Dokumente werden privat verarbeitet und in Ihrem geschützten Konto gespeichert.",
      createAccountBtn: "Kostenloses Konto für CV-Upload erstellen",
      methodBTitle: "Manuell in 1 Minute anlegen",
      methodBDesc: "Falls Sie Stationen Schritt für Schritt manuell hinzufügen möchten:",
      methodBStep1: 'Gehen Sie auf "Mein Logbuch".',
      methodBStep2: 'Klicken Sie auf "+ Neues Unternehmen / Projekt".',
      methodBStep3: "Geben Sie Firmennamen, Position und Zeitraum ein.",
      methodBStep4: "Fertig! Die Station ist in Ihrer Timeline angelegt.",
      personalProjectsNote: "Eigene Projekte: Ein eigener Bereich steht für Nebenprojekte und Forschungsarbeiten bereit.",
    },
    achievements: {
      title: "Schritt 2: Einen Erfolg erfassen (Ihr beruflicher Sieg)",
      subtitle: "Mit 80/20-Disziplin: Reibungslose Erfassung ohne Bürokratie.",
      p1: "Ein Erfolg ist jeder positive Meilenstein: Behebung eines Ausfalls, Performancesteigerung oder erfolgreicher Rollout.",
      howToTitle: "Wie erfasst man einen Erfolg in unter 40 Sekunden?",
      step1Title: "Schnellformular öffnen",
      step1Desc: "Drücken Sie Strg + K (bzw. ⌘K auf Mac) oder klicken Sie auf + Neuer Erfolg.",
      step2Title: "Tippen oder Spracheingabe nutzen",
      step2Desc: "Keine Lust zu tippen? Mikrofon anklicken und sprechen – Ihr Browser wandelt Sprache direkt in Text um.",
      step3Title: "Nur 2 Pflichtfelder",
      step3Desc: "Nur Titel (was getan wurde) und Wirkung (das messbare Ergebnis) sind erforderlich.",
      cvTrickTitle: "Produktivitäts-Tipp: CV-Punkte umwandeln",
      cvTrickDesc: 'Jeder extrahierte Lebenslauf-Punkt verfügt über einen Button "In Erfolg umwandeln", der ihn sofort übernimmt.',
    },
    aiAssistant: {
      title: "Schritt 3: Erfolge mit KI strukturieren",
      subtitle: "Google XYZ-Formel für Lebensläufe und STAR-Format für Vorstellungsgespräche.",
      p1: "GoalRecall enthält eine integrierte KI, die Notizen in überzeugende Erfolgsbelege verwandelt:",
      xyzBadge: "Für den Lebenslauf (CV)",
      xyzTitle: "Die Google XYZ-Formel",
      xyzLead: "Der Goldstandard von Einstellungsverantwortlichen bei führenden Tech-Unternehmen:",
      xyzFormula: '"Erreichte [X], gemessen an [Y], durch [Z]."',
      xyzX: "[X]: Das erzielte geschäftliche oder technische Ziel.",
      xyzY: "[Y]: Die Messgröße (%, Latenz, Ersparnis).",
      xyzZ: "[Z]: Die konkrete Maßnahme oder Technologie.",
      xyzFooter: "Die KI formuliert Ihre Stichpunkte in Sekundenschnelle in dieses Schema um.",
      starBadge: "Für Vorstellungsgespräche",
      starTitle: "Die STAR-Methode",
      starLead: "Die bewährte Struktur für souveräne Antworten in Interviews:",
      starS: "S (Situation): Ausgangslage und Herausforderung.",
      starT: "T (Task / Aufgabe): Die Ihnen gestellte Zielvorgabe.",
      starA: "A (Action / Handlung): Konkrete Umsetzungsschritte und Architektur.",
      starR: "R (Result / Ergebnis): Das messbare Endresultat.",
      starFooter: "Liefert einen strukturierten Leitfaden für Ihr nächstes Vorstellungsgespräch.",
      exampleTitle: "Praxisbeispiel: Vorher vs. Nachher",
      copyExample: "Beispiel kopieren",
      copied: "Kopiert",
      beforeLabel: "❌ Typische unpräzise Notiz:",
      beforeText: '"Datenbank und Cache optimiert, weil die Anwendung zu langsam war."',
      afterLabel: "✅ Mit Google XYZ-Formel:",
      afterText: '"Erreichte eine Reduzierung der p99-Latenz um 34 %, gemessen über Prometheus-Reaktionszeiten, durch Neugestaltung des verteilten Cache-Layers mit Redis Cluster."',
    },
    privacy: {
      title: "Schritt 4: Privater Tresor vs. Öffentlicher Showcase",
      subtitle: "Volle Kontrolle: Nichts wird ohne Ihre Zustimmung veröffentlicht.",
      p1: "Berufliche Projekte beinhalten vertrauliche Zahlen. GoalRecall trennt private Daten strikt von öffentlichen Nachweisen:",
      privateTitle: "1. Privater Modus (Standard)",
      privateDesc: "Jeder Erfolg ist standardmäßig privat und nur in Ihrem persönlichen Logbuch sichtbar.",
      publicTitle: "2. Öffentliches Showcase (Public Deck)",
      publicDesc: 'Mit dem Schalter "Im Showcase veröffentlichen" machen Sie ausgewählte Projekte auf Ihrer öffentlichen Profilseite sichtbar.',
      inboxTitle: "Privater Posteingang (Inbox)",
      inboxDesc: "Recruiter können Ihnen über Ihr öffentliches Deck direkt Anfragen schicken, die in Ihrer privaten Inbox landen.",
    },
    ssot: {
      title: "Schritt 5: Single Source of Truth & Universeller Export",
      subtitle: '"Capture Once, Replicate Everywhere": Einmal erfassen, überall nutzen.',
      p1: "Der häufigste Karrierefehler sind verstreute Lebenslaufversionen in Word und unvollständige Notion-Dateien.",
      p2: "GoalRecall fungiert als zentrale Single Source of Truth (SSOT), aus der sich alles ableitet:",
      card1Title: "1. Maßgeschneiderte Lebensläufe",
      card1Desc: "Exportieren Sie gezielt nur die Meilensteine, die zur Zielposition passen.",
      card2Title: "2. Teilbarer Web-Showcase",
      card2Desc: "Verlinken Sie Ihr Deck im LinkedIn-Profil als verifizierten Kompetenznachweis.",
      card3Title: "3. Jahresgespräche & Gehalt",
      card3Desc: "Treten Sie mit einer lückenlosen Liste messbarer Erfolge in Verhandlungen ein.",
      card4Title: "4. Volle Datenhoheit als JSON",
      card4Desc: "Laden Sie jederzeit ein unverschlüsseltes JSON-Backup ohne Bindung an Plattformen herunter.",
    },
    faq: {
      title: "Häufig gestellte Fragen (FAQ)",
      subtitle: "Direkte Antworten auf zentrale Fragen zu GoalRecall.",
      items: [
        {
          q: "Sind meine Daten auf Firmenrechnern geschützt?",
          a: "Ja. GoalRecall nutzt eine Local-First-Architektur. Alle Einträge verbleiben im lokalen Speicher Ihres Browsers und gelangen nicht ohne Freigabe auf externe Server.",
        },
        {
          q: "Wie ändere ich mein Profilbild?",
          a: "Klicken Sie auf Ihren Avatar in der oberen Leiste oder in den Einstellungen. Sie können Bilder hochladen, URLs verlinken oder Tech-Avatare wählen.",
        },
        {
          q: "Ist GoalRecall kostenpflichtig?",
          a: "Nein. Die Basisfunktionen wie Logbuch, Spracheingabe, Showcase und Export sind vollständig kostenfrei.",
        },
        {
          q: "Funktioniert die App auch offline?",
          a: "Ja. Als PWA installiert, können Sie Notizen auch im Flugzeug ohne Internetverbindung erfassen.",
        },
        {
          q: "Was geschieht beim Leeren des Browser-Caches?",
          a: "Mit einem kostenlosen Konto sorgt Cloud Sync für eine sichere Sicherung in der Cloud. Zudem können Sie jederzeit ein JSON-Backup exportieren.",
        },
        {
          q: "Wie teile ich mein Showcase mit Recruitern?",
          a: "Öffnen Sie 'Öffentliches Deck' in der Menüleiste und kopieren Sie den Link für Ihren Lebenslauf oder Ihr LinkedIn-Profil.",
        },
      ],
    },
    footerReady: {
      title: "Bereit, Ihre Erfolge festzuhalten?",
      subtitle: "Legen Sie Ihre erste Station an oder testen Sie die 40-Sekunden-Schnellerfassung.",
      btn: "Ersten Erfolg erfassen",
    },
  },
  ja: {
    badge: "ドキュメント＆操作ガイド",
    heroGuideDirect: "プロフェッショナル＆転職活動者向けガイド · 直リンク: /docs",
    heroTitlePrefix: "5分でマスターする ",
    heroTitleHighlight: "GoalRecall",
    heroTitleSuffix: "",
    heroDescription:
      "日々の実績をリアルタイムで記録し、インパクトのあるフォーミュラに体系化して、昇給査定・面接・職務経歴書の最強の武器にするための完全ガイドです。",
    navTitle: "ガイド目次",
    demoDeckBtn: "公開ショーケースを見る",
    shortcutBtn: "ショートカットを試す (⌘K)",
    accessAccount: "マイアカウントへ",
    sections: [
      { id: "overview", title: "1. 概要と開発された理由" },
      { id: "experiences", title: "2. 企業・プロジェクトの追加" },
      { id: "achievements", title: "3. 40秒で実績を記録" },
      { id: "ai-assistant", title: "4. AIアシスタント: Google XYZ & STAR" },
      { id: "privacy-showcase", title: "5. 非公開金庫 vs 公開ショーケース" },
      { id: "ssot-export", title: "6. 単一の情報源(SSOT)とエクスポート" },
      { id: "faq", title: "7. よくある質問 (FAQ)" },
    ],
    overview: {
      title: "GoalRecallが存在する理由と解決する課題",
      subtitle: "職歴の物忘れと更新されない職務経歴書に終止符を。",
      p1: "どんなビジネスパーソンも同じ悩みを抱えています。1年間で多くの課題を解決し、チームに貢献しているにもかかわらず、いざ次のような場面になると：",
      bullet1: "昇給や昇進を交渉するための人事評価・面談。",
      bullet2: '採用面接で「これまでに直面した困難な課題と解決策を教えてください」と質問された時。',
      bullet3: "転職活動を始め、数年分の職務経歴書をゼロから書き直さなければならない時。",
      p2: "頭が真っ白になります。8か月前に下した技術的な意思決定や、具体的な改善数値を正確に思い出すことはできません。",
      vaultBox:
        "GoalRecallはあなたの個人的なキャリア金庫です。日々の実績をわずか40秒で記録し、企業ごとに整理して、いつでも最高のエピソードを引き出せる状態に保ちます。",
      card1Title: "その場で即時記録",
      card1Desc: "デプロイや会議、インシデント解決の直後に40秒以内でサッと記録できます。",
      card2Title: "100%プライベート保護",
      card2Desc: "記録はお使いの端末内に安全に保持され、許可なく公開されることはありません。",
      card3Title: "AIコパイロット",
      card3Desc: "簡潔なメモを世界基準の定量的フォーミュラ（Google XYZ・STAR形式）へ即座に昇華させます。",
    },
    experiences: {
      title: "ステップ 1: 企業と所属プロジェクトの登録",
      subtitle: "あなたのキャリア全体を整然と整理する土台構造。",
      p1: "GoalRecallでは、すべての実績が企業または経験に紐づきます。これによりメモが散らかる心配がありません。登録方法は2通りあります：",
      methodATitle: "既存の職務経歴書をインポート（推奨）",
      methodADesc: "すでにPDFまたはWord形式の職務経歴書をお持ちの場合：",
      methodAStep1User: 'メニューまたは「職務経歴書インポート」ボタンをクリックします。',
      methodAStep1Guest: "無料アカウントを作成し、安全な非公開金庫にアクセスします。",
      methodAStep2: "ファイルをドラッグ＆ドロップして選択します。",
      methodAStep3: "企業名、在籍期間、役職、箇条書きの実績を自動解析して取り込みます。",
      openCvBtn: "経歴書インポーターを開く",
      guestPrivacy: "完全なプライバシー保護: 取り込まれた経歴情報はプライベートに処理され、保護されたアカウント内にのみ保存されます。",
      createAccountBtn: "無料アカウントを作成してCVをインポート",
      methodBTitle: "1分で手動追加",
      methodBDesc: "ステップごとに企業を手動で追加したい場合：",
      methodBStep1: '「マイ日誌」を開きます。',
      methodBStep2: '「+ 新しい企業/プロジェクト」をクリックします。',
      methodBStep3: "企業名、役職（例: テックリード）、在籍期間を入力します。",
      methodBStep4: "完了です！タイムライン上に所属カードが作成されます。",
      personalProjectsNote: "個人プロジェクト: 副業やオープンソース活動、独自の研究を記録するための専用セクションも用意されています。",
    },
    achievements: {
      title: "ステップ 2: 実績（成果）の記録",
      subtitle: "80/20の原則設計: 面倒な手続きなしで素早く記録。",
      p1: "実績とは、完了した肯定的な成果すべてです。本番障害の解決、レスポンス速度の向上、重要顧客の獲得などを含みます。",
      howToTitle: "40秒以内で実績を記録する方法",
      step1Title: "クイックモーダルを開く",
      step1Desc: "Ctrl + K（Macは ⌘K）を押すか、「+ 新しい実績」ボタンをクリックします。",
      step2Title: "テキスト入力または音声入力",
      step2Desc: "キーボード入力が面倒な時はマイクボタンを押して話しかけるだけ。ブラウザが正確に文字起こしします。",
      step3Title: "必須項目はわずか2つ",
      step3Desc: "必要なのは「タイトル（何をしたか）」と「インパクト（成果）」だけです。詳細は後からアコーディオン(+)で追加できます。",
      cvTrickTitle: "効率化の裏技: インポートしたCV箇条書きの変換",
      cvTrickDesc: '取り込んだ経歴書の箇条書きにある「実績へ昇格」ボタンを押すと、ワンクリックで正式な実績データに変換されます。',
    },
    aiAssistant: {
      title: "ステップ 3: AIによる実績の構造化",
      subtitle: "経歴書向けのGoogle XYZ公式と、面接向けのSTARストーリー。",
      p1: "GoalRecallのAIエンジンが、日常の簡潔なメモを世界基準のエグゼクティブ表現へ整えます：",
      xyzBadge: "職務経歴書用",
      xyzTitle: "Google XYZフォーミュラ",
      xyzLead: "Googleの採用担当者が推奨する最高水準の記述方式：",
      xyzFormula: '「[Z]を行うことで、[Y]で測定される[X]を達成した。」',
      xyzX: "[X]: 達成されたビジネス成果や定量ゴール。",
      xyzY: "[Y]: 測定基準・指標（パーセンテージ、時間短縮、コスト削減）。",
      xyzZ: "[Z]: 採用した具体的な技術やアーキテクチャの施策。",
      xyzFooter: "AIがあなたのメモを瞬時にこの標準フォーミュラへ書き直します。",
      starBadge: "採用面接用",
      starTitle: "STARメソッド",
      starLead: "行動面接やシステムデザイン面接で説得力を持って回答するための世界標準フレームワーク：",
      starS: "S（状況）: 初期課題とビジネス背景。",
      starT: "T（課題/役割）: あなたに課された具体的ミッション。",
      starA: "A（行動）: 実施した技術施策と設計判断。",
      starR: "R（結果）: 定量化された最終成果。",
      starFooter: "面接直前に見返すだけで万全な受け答えのカンペが完成します。",
      exampleTitle: "実例: 改善前 vs 改善後",
      copyExample: "例文をコピー",
      copied: "コピー完了",
      beforeLabel: "❌ ありきたりで曖昧なメモ：",
      beforeText: '「アプリが重かったのでデータベースとキャッシュを改善した」',
      afterLabel: "✅ Google XYZ公式適用後：",
      afterText: '「Redis Clusterを用いた分散キャッシュ層の再設計[Z]により、Prometheus応答時間で測定[Y]されるp99レイテンシの34%削減[X]を達成」',
    },
    privacy: {
      title: "ステップ 4: 非公開金庫 vs 公開ショーケース",
      subtitle: "完全な主権: あなたの許可なしに公開されるデータは一切ありません。",
      p1: "業務上の数値や機密プロジェクトを保護するため、GoalRecallは2層のアクセス分離を採用しています：",
      privateTitle: "1. 非公開金庫モード（デフォルト）",
      privateDesc: "すべての実績は非公開で作成されます。あなた自身のアカウント内でのみ閲覧可能です。",
      publicTitle: "2. 公開ショーケース（Public Deck）",
      publicDesc: 'カードの「ショーケースに公開」をオンにすることで、承認した実績のみを外部向けポートフォリオに掲載できます。',
      inboxTitle: "プライベート受信トレイ（Inbox）",
      inboxDesc: "公開ショーケースを見た採用担当者からのオファーや連絡は、あなたのプライベートな受信トレイに直接届きます。",
    },
    ssot: {
      title: "ステップ 5: 単一の情報源(SSOT)とキャリア資産の展開",
      subtitle: "「一度記録して、すべてに展開」: 1か所の記録でキャリアを網羅。",
      p1: "最も危険なのは、WordファイルやNotionに異なるバージョンの経歴書が分散してしまうことです。",
      p2: "GoalRecallを「信頼できる唯一の情報源（SSOT）」とすることで、以下へ自在に展開できます：",
      card1Title: "1. ターゲット企業向け特化CV",
      card1Desc: "応募するポジションの要件に合致する実績だけを抽出して出力。",
      card2Title: "2. 共有可能なWebショーケース",
      card2Desc: "LinkedInやメール署名にリンクを添えて、裏付けのある実績をアピール。",
      card3Title: "3. 年次評価・昇給交渉",
      card3Desc: "1年間の成果と数値を整理した完全なレポートとして持参可能。",
      card4Title: "4. JSON形式による完全なデータ保全",
      card4Desc: "いつでもデータをJSON形式でエクスポートでき、ベンダーロックインの心配はありません。",
    },
    faq: {
      title: "よくある質問 (FAQ)",
      subtitle: "GoalRecallに関する疑問に直接お答えします。",
      items: [
        {
          q: "会社のPCで使用しても機密情報は安全ですか？",
          a: "はい。GoalRecallはローカルファーストのPWAです。すべてのデータはブラウザのローカルストレージに保管され、自ら公開設定をしない限り外部サーバーへ送信されることはありません。",
        },
        {
          q: "プロフィール画像はどのように変更できますか？",
          a: "ヘッダーのアイコンまたは設定から変更できます。端末から画像アップロード（自動で60KB以下に圧縮）、画像URLの指定、プリセットイラストから選択可能です。",
        },
        {
          q: "利用料金はかかりますか？",
          a: "いいえ。日誌の記録、音声入力、公開ショーケース、データエクスポートはすべて無料でご利用いただけます。",
        },
        {
          q: "オフラインでも利用できますか？",
          a: "はい。PWAアプリとしてインストールすることで、飛行機の中や電波のない環境でもオフラインで記録できます。",
        },
        {
          q: "ブラウザのキャッシュを削除した場合はどうなりますか？",
          a: "無料アカウントにログインしていれば、Cloud Syncによりクラウドに安全に同期されます。また、設定からいつでもJSONバックアップをダウンロードできます。",
        },
        {
          q: "採用担当者に公開ショーケースを共有するには？",
          a: "ヘッダーの「公開ショーケース」をクリックし、専用リンクをコピーして職務経歴書やLinkedInのプロフィールに貼り付けるだけです。",
        },
      ],
    },
    footerReady: {
      title: "キャリアの勝利を記録し始める準備はできましたか？",
      subtitle: "最初の企業を登録するか、40秒のクイックキャプチャをお試しください。",
      btn: "最初のエピソードを記録する",
    },
  },
};
