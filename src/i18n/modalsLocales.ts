import { SupportedLanguage } from "./types";

export interface ModalsLocales {
  pasteBullets: {
    defaultImpact: string;
    initialCategory: string;
    aiCvPrompt: string;
    pasteBulletsLabel: string;
    bulletsDetected: (n: number) => string;
    previewTitle: (n: number) => string;
    savedInVault: string;
    vaultNote: string;
  };
  experienceModal: {
    bulletsToCreateHeader: string;
    bulletsToCreateDesc: (n: number, comp: string) => string;
    bulletsTip: string;
    selectedCountLabel: (sel: number, tot: number) => string;
    missionHeader: string;
    missionDesc: string;
    cvBulletsHeader: string;
    cvBulletsDesc: string;
    optionalCompanyHeader: string;
    datesHeader: string;
    toolsHeader: string;
    addBtn: string;
  };
  synthesisHub: {
    googleXyzTab: string;
    googleXyzLead: string;
    googleXyzDesc: string;
    starTab: string;
    starLead: string;
    starDesc: string;
    caseStudyTab: string;
    caseStudyDesc: string;
    copyAll: string;
    copied: string;
    copyStarCard: string;
    emptyXyz: string;
    emptyStar: string;
    keyMetric: string;
    starLabels: { s: string; t: string; a: string; r: string };
  };
  inbox: {
    copyEmailTooltip: string;
    markAsRead: string;
    markAsUnread: string;
  };
}

export const MODALS_LOCALES: Record<SupportedLanguage, ModalsLocales> = {
  es: {
    pasteBullets: {
      defaultImpact: "Impacto técnico relevante en el entregable",
      initialCategory: "Categoría Inicial",
      aiCvPrompt: "¿Tienes un CV o quieres que la IA detecte empresas, proyectos y métricas Google XYZ automáticamente?",
      pasteBulletsLabel: "Pega las viñetas aquí (1 por línea o con guiones/viñetas):",
      bulletsDetected: (n) => `${n} ${n === 1 ? "viñeta detectada" : "viñetas detectadas"}`,
      previewTitle: (n) => `Vista Previa de Extracción (${n})`,
      savedInVault: "Se guardarán en tu Bóveda Privada",
      vaultNote: "Todos los logros importados entran por defecto en tu Bóveda Privada (Confidencial). Podrás editarlos o publicarlos en tu Vitrina Pública cuando quieras.",
    },
    experienceModal: {
      bulletsToCreateHeader: "Se registrarán automáticamente los siguientes logros",
      bulletsToCreateDesc: (n, comp) => `Detectamos ${n} viñetas en tu experiencia. Para ahorrarte trabajo, se autocrearán en tu Bóveda Privada (Confidencial) 🔒 vinculados a ${comp}.`,
      bulletsTip: "Podrás completarlos y enriquecerlos luego con sus acordeones (+ ¿Qué se buscaba?, + Impacto, + Solución) para darle máxima consistencia a tu perfil.",
      selectedCountLabel: (sel, tot) => `Viñetas seleccionadas para autocrear (${sel} de ${tot})`,
      missionHeader: "Misión & Contexto General del Rol",
      missionDesc: "Describe qué hacía el equipo, el problema que resolvías y el alcance de tu responsabilidad.",
      cvBulletsHeader: "Viñetas & Logros del CV (una por línea)",
      cvBulletsDesc: "Escribe o pega las viñetas de tu CV. Cada línea se convertirá automáticamente en un logro editable en tu bitácora.",
      optionalCompanyHeader: "Empresa / Organización & Rol Profesional",
      datesHeader: "Fechas & Período (Inicio / Fin / Actualidad)",
      toolsHeader: "Ubicación, Herramientas & Canales Clave",
      addBtn: "Añadir",
    },
    synthesisHub: {
      googleXyzTab: "Fórmula Google XYZ (CV)",
      googleXyzLead: 'Estructura estándar de Google: "Accomplished [X] as measured by [Y], by doing [Z]"',
      googleXyzDesc: "Bullets de alto impacto calibrados para captar la atención de reclutadores y Hiring Managers.",
      starTab: "Narrativas STAR (Entrevistas)",
      starLead: "Framework STAR: Situación, Tarea, Acción y Resultado.",
      starDesc: 'Utiliza estas fichas para responder preguntas de conducta: "¿Cuéntame sobre un fallo crítico que resolviste?" o "¿Cómo lideras decisiones de arquitectura?"',
      caseStudyTab: "Caso de Estudio (.MD)",
      caseStudyDesc: "Caso de estudio técnico estructurado en Markdown (.md)",
      copyAll: "Copiar Todos",
      copied: "¡Copiado!",
      copyStarCard: "Copiar Ficha STAR",
      emptyXyz: "Registra tus primeras victorias técnicas en la Bitácora o sube tu CV para autogenerar bullets de alto impacto con métricas comprobables.",
      emptyStar: "Añade tus logros técnicos en la Bitácora para autogenerar historias STAR estructuradas (Situación, Tarea, Acción, Resultado) para entrevistas.",
      keyMetric: "Métrica clave:",
      starLabels: {
        s: "[S] Situación (Contexto)",
        t: "[T] Tarea (Responsabilidad)",
        a: "[A] Acción (Implementación Técnica)",
        r: "[R] Resultado (Impacto Cuantificado)",
      },
    },
    inbox: {
      copyEmailTooltip: "Copiar dirección de email",
      markAsRead: "Marcar como leído",
      markAsUnread: "Marcar como no leído",
    },
  },
  en: {
    pasteBullets: {
      defaultImpact: "Verified technical outcome delivered",
      initialCategory: "Initial Category",
      aiCvPrompt: "Have a resume or want AI to parse companies, projects, and Google XYZ metrics automatically?",
      pasteBulletsLabel: "Paste your bullet points here (1 per line or with hyphens/bullets):",
      bulletsDetected: (n) => `${n} ${n === 1 ? "bullet detected" : "bullets detected"}`,
      previewTitle: (n) => `Extraction Preview (${n})`,
      savedInVault: "Saved securely to your Private Vault",
      vaultNote: "All imported achievements enter your Private Vault (Confidential) by default. You can edit or publish them to your Public Showcase anytime.",
    },
    experienceModal: {
      bulletsToCreateHeader: "The following achievements will be created automatically",
      bulletsToCreateDesc: (n, comp) => `Detected ${n} bullets in your experience. To save you time, they will be initialized in your Private Vault 🔒 linked to ${comp}.`,
      bulletsTip: "You can enrich them anytime with (+) accordions (+ Goal, + Impact, + Solution) to give your professional profile maximum depth.",
      selectedCountLabel: (sel, tot) => `Bullets selected for auto-creation (${sel} of ${tot})`,
      missionHeader: "Role Scope & Team Context",
      missionDesc: "Describe what the team built, the core challenges, and your area of ownership.",
      cvBulletsHeader: "CV Bullets & Achievements (one per line)",
      cvBulletsDesc: "Type or paste bullets from your resume. Each line automatically becomes an editable achievement in your logbook.",
      optionalCompanyHeader: "Company / Organization & Professional Title",
      datesHeader: "Dates & Timeframe (Start / End / Present)",
      toolsHeader: "Location, Key Tools & Methodologies",
      addBtn: "Add",
    },
    synthesisHub: {
      googleXyzTab: "Google XYZ Formula (CV)",
      googleXyzLead: 'Google standard formula: "Accomplished [X] as measured by [Y], by doing [Z]"',
      googleXyzDesc: "High-impact bullet points calibrated to capture hiring managers and technical recruiters.",
      starTab: "STAR Narratives (Interviews)",
      starLead: "STAR Framework: Situation, Task, Action, and Result.",
      starDesc: 'Use these behavioral cards to answer: "Tell me about a critical production failure you resolved" or "How do you drive architecture decisions?"',
      caseStudyTab: "Case Study (.MD)",
      caseStudyDesc: "Structured technical case study formatted in Markdown (.md)",
      copyAll: "Copy All",
      copied: "Copied!",
      copyStarCard: "Copy STAR Card",
      emptyXyz: "Log your first technical wins in your Logbook or upload your CV to auto-generate high-impact bullet points with verified metrics.",
      emptyStar: "Log your technical achievements in your Logbook to auto-generate structured STAR narratives for upcoming interviews.",
      keyMetric: "Key metric:",
      starLabels: {
        s: "[S] Situation (Context)",
        t: "[T] Task (Mandate)",
        a: "[A] Action (Engineering Implementation)",
        r: "[R] Result (Quantified Outcome)",
      },
    },
    inbox: {
      copyEmailTooltip: "Copy email address",
      markAsRead: "Mark as read",
      markAsUnread: "Mark as unread",
    },
  },
  pt: {
    pasteBullets: {
      defaultImpact: "Impacto técnico relevante entregue",
      initialCategory: "Categoria Inicial",
      aiCvPrompt: "Tem um currículo ou quer que a IA detecte empresas, projetos e métricas Google XYZ automaticamente?",
      pasteBulletsLabel: "Cole os tópicos aqui (1 por linha ou com hífens/marcadores):",
      bulletsDetected: (n) => `${n} ${n === 1 ? "tópico detectado" : "tópicos detectados"}`,
      previewTitle: (n) => `Prévia de Extração (${n})`,
      savedInVault: "Salvo no seu Cofre Privado",
      vaultNote: "Todas as conquistas importadas entram por padrão no seu Cofre Privado (Confidencial). Você pode editá-las ou publicá-las quando quiser.",
    },
    experienceModal: {
      bulletsToCreateHeader: "As seguintes conquistas serão criadas automaticamente",
      bulletsToCreateDesc: (n, comp) => `Detectamos ${n} tópicos na sua experiência. Eles serão criados no seu Cofre Privado 🔒 vinculados a ${comp}.`,
      bulletsTip: "Você pode enriquecê-los depois com acordeões (+ Objetivo, + Impacto, + Solução) para dar consistência máxima ao seu perfil.",
      selectedCountLabel: (sel, tot) => `Tópicos selecionados para criação (${sel} de ${tot})`,
      missionHeader: "Missão & Contexto Geral do Cargo",
      missionDesc: "Descreva o propósito da equipe, os desafios resolvidos e o escopo da sua responsabilidade.",
      cvBulletsHeader: "Tópicos & Conquistas do CV (um por linha)",
      cvBulletsDesc: "Digite ou cole os tópicos do seu currículo. Cada linha vira uma conquista editável no seu registro.",
      optionalCompanyHeader: "Empresa / Organização & Cargo Profissional",
      datesHeader: "Datas & Período (Início / Fim / Atualidade)",
      toolsHeader: "Localização, Ferramentas & Canais Principais",
      addBtn: "Adicionar",
    },
    synthesisHub: {
      googleXyzTab: "Fórmula Google XYZ (CV)",
      googleXyzLead: 'Padrão do Google: "Alcançou [X], medido por [Y], realizando [Z]"',
      googleXyzDesc: "Tópicos de alto impacto calibrados para chamar a atenção de recrutadores e líderes técnicos.",
      starTab: "Narrativas STAR (Entrevistas)",
      starLead: "Estrutura STAR: Situação, Tarefa, Ação e Resultado.",
      starDesc: 'Utilize estes roteiros para responder: "Conte sobre uma falha crítica que você resolveu" ou "Como lidera decisões de arquitetura?"',
      caseStudyTab: "Estudo de Caso (.MD)",
      caseStudyDesc: "Estudo de caso técnico estruturado em Markdown (.md)",
      copyAll: "Copiar Todos",
      copied: "Copiado!",
      copyStarCard: "Copiar Ficha STAR",
      emptyXyz: "Registre suas primeiras conquistas no Registro ou envie seu CV para gerar tópicos de alto impacto com métricas comprovadas.",
      emptyStar: "Adicione conquistas técnicas no Registro para autogerar histórias STAR estruturadas para entrevistas.",
      keyMetric: "Métrica principal:",
      starLabels: {
        s: "[S] Situação (Contexto)",
        t: "[T] Tarefa (Responsabilidade)",
        a: "[A] Ação (Implementação Técnica)",
        r: "[R] Resultado (Impacto Quantificado)",
      },
    },
    inbox: {
      copyEmailTooltip: "Copiar endereço de e-mail",
      markAsRead: "Marcar como lida",
      markAsUnread: "Marcar como não lida",
    },
  },
  fr: {
    pasteBullets: {
      defaultImpact: "Impact technique concret livré",
      initialCategory: "Catégorie Initiale",
      aiCvPrompt: "Vous avez un CV ou souhaitez que l'IA détecte entreprises, projets et formules Google XYZ automatiquement ?",
      pasteBulletsLabel: "Collez vos puces ici (1 par ligne ou avec tirets) :",
      bulletsDetected: (n) => `${n} ${n === 1 ? "puce détectée" : "puces détectées"}`,
      previewTitle: (n) => `Aperçu de l'Extraction (${n})`,
      savedInVault: "Enregistré dans votre Coffre Privé",
      vaultNote: "Toutes les réalisations importées rejoignent par défaut votre Coffre Privé (Confidentiel). Vous pouvez les publier ou les modifier à tout moment.",
    },
    experienceModal: {
      bulletsToCreateHeader: "Les réalisations suivantes seront créées automatiquement",
      bulletsToCreateDesc: (n, comp) => `Nous avons détecté ${n} puces dans votre expérience. Elles seront créées dans votre Coffre Privé 🔒 liées à ${comp}.`,
      bulletsTip: "Vous pourrez les enrichir avec les accordéons (+ Objectif, + Impact, + Solution) pour perfectionner votre profil.",
      selectedCountLabel: (sel, tot) => `Puces sélectionnées pour création (${sel} sur ${tot})`,
      missionHeader: "Mission & Contexte Global du Rôle",
      missionDesc: "Décrivez la mission de l'équipe, les défis relevés et votre périmètre de responsabilité.",
      cvBulletsHeader: "Puces & Réalisations du CV (une par ligne)",
      cvBulletsDesc: "Saisissez ou collez les puces de votre CV. Chaque ligne devient une réalisation modifiable dans votre journal.",
      optionalCompanyHeader: "Entreprise / Organisation & Titre Professionnel",
      datesHeader: "Dates & Période (Début / Fin / Actuel)",
      toolsHeader: "Localisation, Outils & Technologies Clés",
      addBtn: "Ajouter",
    },
    synthesisHub: {
      googleXyzTab: "Formule Google XYZ (CV)",
      googleXyzLead: 'Format standard Google : "A accompli [X], mesuré par [Y], en réalisant [Z]"',
      googleXyzDesc: "Puces percutantes calibrées pour capter l'intérêt des recruteurs et responsables techniques.",
      starTab: "Récits STAR (Entretiens)",
      starLead: "Méthodologie STAR : Situation, Tâche, Action et Résultat.",
      starDesc: 'Utilisez ces fiches pour répondre : "Parlez-moi d\'un incident critique résolu" ou "Comment tranchez-vous les choix d\'architecture ?"',
      caseStudyTab: "Étude de Cas (.MD)",
      caseStudyDesc: "Étude de cas technique structurée au format Markdown (.md)",
      copyAll: "Tout Copier",
      copied: "Copié !",
      copyStarCard: "Copier la Fiche STAR",
      emptyXyz: "Consignez vos premiers succès dans votre Journal ou importez votre CV pour générer des puces chiffrées.",
      emptyStar: "Ajoutez vos réussites dans votre Journal pour générer automatiquement des récits STAR structurés.",
      keyMetric: "Métrique clé :",
      starLabels: {
        s: "[S] Situation (Contexte)",
        t: "[T] Tâche (Mission)",
        a: "[A] Action (Mise en œuvre technique)",
        r: "[R] Résultat (Impact chiffré)",
      },
    },
    inbox: {
      copyEmailTooltip: "Copier l'adresse email",
      markAsRead: "Marquer comme lu",
      markAsUnread: "Marquer comme non lu",
    },
  },
  de: {
    pasteBullets: {
      defaultImpact: "Relevanter technischer Mehrwert geliefert",
      initialCategory: "Startkategorie",
      aiCvPrompt: "Haben Sie einen Lebenslauf oder soll die KI Unternehmen, Projekte und Kennzahlen automatisch erkennen?",
      pasteBulletsLabel: "Fügen Sie Ihre Stichpunkte hier ein (1 pro Zeile):",
      bulletsDetected: (n) => `${n} ${n === 1 ? "Punkt erkannt" : "Punkte erkannt"}`,
      previewTitle: (n) => `Vorschau der Extraktion (${n})`,
      savedInVault: "Wird im Privaten Tresor gespeichert",
      vaultNote: "Alle importierten Erfolge landen standardmäßig in Ihrem Privaten Tresor (Vertraulich). Sie können sie jederzeit bearbeiten oder veröffentlichen.",
    },
    experienceModal: {
      bulletsToCreateHeader: "Folgende Erfolge werden automatisch angelegt",
      bulletsToCreateDesc: (n, comp) => `${n} Stichpunkte in Ihrer Station erkannt. Sie werden im Privaten Tresor 🔒 verknüpft mit ${comp} erstellt.`,
      bulletsTip: "Sie können diese später über die Akkordeons (+ Ziel, + Wirkung, + Lösung) detaillieren.",
      selectedCountLabel: (sel, tot) => `Ausgewählte Punkte (${sel} von ${tot})`,
      missionHeader: "Rollenkontext & Teamverantwortung",
      missionDesc: "Beschreiben Sie den Aufgabenbereich des Teams und Ihren Verantwortungsrahmen.",
      cvBulletsHeader: "CV-Stichpunkte & Erfolge (einer pro Zeile)",
      cvBulletsDesc: "Fügen Sie die Punkte aus Ihrem Lebenslauf ein. Jede Zeile wird zu einem editierbaren Erfolg.",
      optionalCompanyHeader: "Unternehmen & Berufsbezeichnung",
      datesHeader: "Zeitraum (Beginn / Ende / Aktuell)",
      toolsHeader: "Standort, Tools & Schlüsseltechnologien",
      addBtn: "Hinzufügen",
    },
    synthesisHub: {
      googleXyzTab: "Google XYZ-Formel (CV)",
      googleXyzLead: 'Google-Standard: "Erreichte [X], gemessen an [Y], durch [Z]"',
      googleXyzDesc: "Prägnante Stichpunkte für Recruiter und Hiring Manager.",
      starTab: "STAR-Geschichten (Interviews)",
      starLead: "STAR-Framework: Situation, Task, Action und Result.",
      starDesc: 'Ideal für Fragen wie: "Erzählen Sie von einem kritischen Ausfall" oder "Wie treffen Sie Architekturentscheidungen?"',
      caseStudyTab: "Fallstudie (.MD)",
      caseStudyDesc: "Strukturierte technische Fallstudie in Markdown (.md)",
      copyAll: "Alle kopieren",
      copied: "Kopiert!",
      copyStarCard: "STAR-Karte kopieren",
      emptyXyz: "Erfassen Sie Ihre ersten Erfolge im Logbuch oder laden Sie Ihren Lebenslauf hoch, um quantifizierte Punkte zu generieren.",
      emptyStar: "Erfassen Sie technische Erfolge im Logbuch, um strukturierte STAR-Geschichten für Interviews zu generieren.",
      keyMetric: "Schlüsselkennzahl:",
      starLabels: {
        s: "[S] Situation (Ausgangslage)",
        t: "[T] Aufgabe (Ziel)",
        a: "[A] Handlung (Umsetzung)",
        r: "[R] Ergebnis (Messbare Wirkung)",
      },
    },
    inbox: {
      copyEmailTooltip: "E-Mail-Adresse kopieren",
      markAsRead: "Als gelesen markieren",
      markAsUnread: "Als ungelesen markieren",
    },
  },
  ja: {
    pasteBullets: {
      defaultImpact: "実証された技術的インパクトの提供",
      initialCategory: "初期カテゴリー",
      aiCvPrompt: "職務経歴書をお持ちですか？AIが企業、プロジェクト、Google XYZ指標を自動検出します。",
      pasteBulletsLabel: "箇条書きをここに貼り付けてください（1行に1項目）:",
      bulletsDetected: (n) => `${n}件の箇条書きを検出`,
      previewTitle: (n) => `抽出プレビュー (${n})`,
      savedInVault: "非公開金庫に安全に保存されます",
      vaultNote: "取り込まれたすべての実績は、デフォルトで非公開金庫に保存されます。いつでも編集や公開が可能です。",
    },
    experienceModal: {
      bulletsToCreateHeader: "以下の実績が自動登録されます",
      bulletsToCreateDesc: (n, comp) => `${comp} に紐づく ${n}件の箇条書きを検出しました。手間を省くため、非公開金庫 🔒 内に初期生成されます。`,
      bulletsTip: "後からアコーディオン（+ 目的、+ インパクト、+ 解決策）で詳細を追記できます。",
      selectedCountLabel: (sel, tot) => `自動作成対象の箇条書き (${tot}件中 ${sel}件)`,
      missionHeader: "役割のミッションとチーム背景",
      missionDesc: "チームのミッション、解決した課題、担当領域の規模を記述してください。",
      cvBulletsHeader: "職務経歴書の箇条書き（1行に1項目）",
      cvBulletsDesc: "経歴書の箇条書きを入力または貼り付けます。各行が日誌の実績に変換されます。",
      optionalCompanyHeader: "企業 / 組織名 & 役職",
      datesHeader: "在籍期間（開始 / 終了 / 現在）",
      toolsHeader: "勤務地、使用ツール & 主要技術",
      addBtn: "追加",
    },
    synthesisHub: {
      googleXyzTab: "Google XYZ公式 (CV)",
      googleXyzLead: 'Google標準公式: 「[Z]により、[Y]で測定される[X]を達成した」',
      googleXyzDesc: "採用担当者や技術責任者の目を引く高インパクトな箇条書き。",
      starTab: "STARストーリー (面接対策)",
      starLead: "STARフレームワーク: 状況(S)、課題(T)、行動(A)、結果(R)",
      starDesc: '「本番障害の対応経験」「アーキテクチャの意思決定」などの行動面接にそのまま使えます。',
      caseStudyTab: "技術ケーススタディ (.MD)",
      caseStudyDesc: "Markdown形式で構造化された技術ケーススタディ (.md)",
      copyAll: "すべてコピー",
      copied: "コピー完了！",
      copyStarCard: "STARシートをコピー",
      emptyXyz: "日誌に技術的実績を記録するかCVをインポートすると、検証済みの指標付きXYZ箇条書きが自動生成されます。",
      emptyStar: "日誌に実績を記録すると、面接用の構造化されたSTARストーリーが自動生成されます。",
      keyMetric: "主要指標:",
      starLabels: {
        s: "[S] 状況 (ビジネス背景)",
        t: "[T] 課題 (ミッション)",
        a: "[A] 行動 (技術的実装)",
        r: "[R] 結果 (定量的インパクト)",
      },
    },
    inbox: {
      copyEmailTooltip: "メールアドレスをコピー",
      markAsRead: "既読にする",
      markAsUnread: "未読にする",
    },
  },
};
