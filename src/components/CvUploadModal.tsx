import React, { useState, useRef } from "react";
import {
  X,
  FileUp,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Building,
  RotateCcw,
  Edit2,
  Trash2,
  ShieldCheck,
  Zap,
  Tag,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  FolderGit2,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Plus,
  Save,
  CheckSquare,
  Square,
  ListTodo,
  ExternalLink,
  ChevronRight,
  Download,
  Crown,
  Clock
} from "lucide-react";
import {
  LogCategory,
  LogEntry,
  UserProfile,
  ExtractedCvData,
  CvPendingField,
  CvExperience,
  CvEducation,
  CvCertification,
  CvProject,
  CvLanguage,
  WorkExperience
} from "../types";
import { 
  saveStoredCv, 
  getStoredExperiences, 
  saveExperiences,
  checkCanUseAi,
  recordAiUsage,
  getAiUsage,
  MAX_FREE_MONTHLY_AI_USES,
  saveProWaitlistEmail
} from "../utils/storage";

interface ExtractedBullet {
  id: string;
  client: string;
  project: string;
  category: LogCategory;
  title: string;
  description: string;
  impact: string;
  tags: string[];
  xyzScore: number;
  metricHighlight?: string;
  originalText?: string;
  selected: boolean;
  isEditing?: boolean;
}

interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLogs: (logs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => void;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
}

const SAMPLE_CV_TEXT = `Experiencia Laboral

Senior Full Stack Developer
@ ParserDigital / Chambers & Partners
Oct 2025 — Present
• Delivered the Digital Submissions platform for Chambers & Partners in 7 months, on time and on budget, now rolling out to 10,000+ law firms worldwide for rankings and legal awards submissions.
• Replaced a fragmented, document-heavy process with structured digital workflows, converting Word/Excel submissions into live collaboration, secure sharing, guided editing, and contributor tracking, unlocking structured data for new commercial products.
• Owned the end-to-end development of the History Navigation component, a version-tracking and audit feature showing who changed what and when, with visual highlighting of additions, removals, and modifications across document versions.
• Built the section sharing feature from scratch, enabling submission sections to be distributed to contributors with per-user permissions, plus secure public URL access with configurable expiration for external collaborators.
• Developed frontend applications within a Microfrontend architecture using Angular 21 and Native Federation, building modular components and feature flows with Signals, OnPush change detection, and Standalone Components.
• Developed backend services with .NET 10 Minimal APIs and MediatR, applying Vertical Slice Architecture to keep domain logic decoupled, modular, and easy to maintain.
• Engineered a Notion-style dynamic navigation drawer with section-level completion tracking, and a structured multi-section editor with draft persistence and real-time validation (errors and warnings).
• Integrated with the Chambers Central API (CcApi) to keep law firm, contact, and ranking data synchronized across systems.
• Contributed to CI/CD pipelines with Azure DevOps and Docker, with automated test suites using xUnit (backend) and Karma/Jasmine (frontend).
• Used AI-assisted development tools (GitHub Copilot) to speed up prototyping and routine tasks, keeping the focus on architecture, performance, and code quality.
Tecnologías: Angular 21, Native Federation, .NET 10, Minimal APIs, MediatR, Vertical Slice Architecture, Microservices, Bootstrap 5, Azure DevOps, Docker, Vitest, xUnit, Karma, Jasmine, GitHub Copilot, CcApi

Full Stack Developer
@ ParserDigital / Dunnhumby
Oct 2024 — Oct 2025
• Built and maintained dynamic reporting forms and dashboards using Next.js and NestJS, integrating with Databricks APIs to present curated data provided by the data engineering team.
• Designed and implemented PostgreSQL relational models and stored procedures to support reporting interfaces and ensure reliable data delivery.
• Integrated Azure Service Principals for secure execution of Databricks queries, implementing serverless access and token management via NestJS.
• Deployed the platform on Azure Kubernetes Service (AKS) with CI/CD pipelines, enabling scalable, reliable, and reproducible production environments.
• Developed reusable web components and microfrontend modules using React, Next.js, and Webpack, improving frontend modularity, code reuse, and maintainability across reporting dashboards.
• Enhanced CI/CD pipelines in GitLab, optimizing deployments and automating environment provisioning, reducing production errors and manual tasks.
• Implemented observability and monitoring with New Relic and OpenTelemetry, improving real-time performance tracking and accelerating issue resolution.
• Applied unit and integration testing with Jest and enforced semantic versioning, ensuring high-quality releases and consistent component management.
Tecnologías: React, Next.js, NestJS, .NET 9, GraphQL, REST APIs, Node.js, PostgreSQL, CI/CD, Azure, Webpack, AKS, Databricks APIs, GitLab, New Relic, OpenTelemetry, Jest

Backend Developer
@ Raisin
Sep 2023 — Oct 2024
• Developed new features for the SaaS platform, maintaining back-office systems, APIs, and batch processes using .NET Core.
• Designed and optimized SQL Server stored procedures to improve database efficiency and ensure reliable data processing.
• Contributed to GraphQL, Java and Go middleware development, enhancing API performance and scalability.
• Led deployment of services to AWS, automating release processes and improving system reliability.
• Collaborated in an Agile team of 15, delivering features for US-based clients within Scrum cycles, improving sprint delivery efficiency.
• Implemented unit and integration testing to ensure code quality and system stability across backend services.
Tecnologías: .NET Core, GraphQL, Go, Java, Node.js, AWS, SQL Server, Git

Full Stack Developer
@ AndBank.com
Aug 2022 — Sep 2023
• Developed and enhanced mobile applications using React and Xamarin, improving user engagement across Android and iOS platforms.
• Implemented multithreading in C# to optimize background data loading, significantly improving app performance.
• Led deployment and troubleshooting via App Center, modernizing legacy Xamarin code and streamlining mobile release processes.
• Developed new features in React and TypeScript, enhancing app functionality and user experience.
• Collaborated closely with cross-functional teams, including designers, UX specialists, and backend engineers, to deliver seamless mobile experiences.
Tecnologías: React, TypeScript, .NET Core, Xamarin, Android, iOS, Git, App Center, C#

Full Stack Developer
@ Taller Technologies / Paypal.com
Mar 2021 — Jun 2022
• Developed new features for PayPal’s investment mobile app using React Native, enhancing user experience and functionality.
• Implemented GraphQL APIs and serverless AWS Lambda functions, improving performance and scalability of backend services.
• Gained experience in Docker, Kubernetes, and microservices architecture, contributing to reliable and scalable deployments.
• Troubleshoot core repositories, particularly the checkout experience, resolving critical issues and improving system stability.
• Participated in Agile development cycles using Jira, collaborating with cross-functional teams to deliver features on time.
Tecnologías: Node.js, Angular, React, React Native, GraphQL, NestJS, TypeScript, AWS, Docker, Kubernetes, AWS Lambda, Jira

Full Stack Developer
@ Falabella Bank, Santiago
Jan 2020 — Mar 2021
• Developed omnichannel digital experiences, implementing frontend and backend features for Falabella Bank’s platforms.
• Designed and maintained REST APIs and microservices, ensuring scalable and reliable integration between systems.
• Implemented CI/CD pipelines and automated testing using Jenkins and Jest, improving deployment efficiency and code quality.
• Collaborated with cross-functional teams, including strategists, designers, UX specialists, and developers, to deliver cohesive digital solutions.
• Contributed to debugging and troubleshooting across platforms, resolving production issues and enhancing system stability.
Tecnologías: Node.js, NestJS, CI/CD, Jenkins, REST APIs, WebServices, Docker Compose, Docker Swarm, Jest, Portainer, Apigee

Technical Lead
@ Falabella Retail, Santiago
Apr 2019 — Jan 2020
• Led and mentored an Agile development team, building AI-driven virtual assistants using Azure Cognitive Services.
• Fostered a collaborative environment, conducting regular code reviews, providing technical guidance, and promoting best practices.
• Managed team workflows and implemented continuous improvement initiatives, enhancing delivery efficiency and code quality.
• Delivered business process automation solutions leveraging Azure RPA, GCP serverless, and web scraping tools, reducing manual workload.
• Oversaw deployment and maintenance of applications using Docker, Kubernetes, and CI/CD pipelines, ensuring scalable and reliable production environments.
Tecnologías: Node.js, Azure, PostgreSQL, MongoDB, Docker`;

export const CvUploadModal: React.FC<CvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportLogs,
  currentUser,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [reviewTab, setReviewTab] = useState<"radiography" | "pending" | "bullets">("pending");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [pastedCvText, setPastedCvText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted Data State
  const [extractedCv, setExtractedCv] = useState<ExtractedCvData | null>(null);
  const [pendingFields, setPendingFields] = useState<CvPendingField[]>([]);
  const [completenessScore, setCompletenessScore] = useState<number>(0);
  const [extractedBullets, setExtractedBullets] = useState<ExtractedBullet[]>([]);
  const [extractionEngine, setExtractionEngine] = useState<string>("");

  // In-line editing modal / quick prompt state for filling pending items
  const [activeFieldEditing, setActiveFieldEditing] = useState<{
    fieldId: string;
    label: string;
    section: string;
    fieldName: string;
    currentValue: string;
    suggestedPrompt: string;
  } | null>(null);
  const [quickFieldValue, setQuickFieldValue] = useState("");

  // AI Usage Quota & Freemium Tier State
  const [aiUsage, setAiUsage] = useState(() => getAiUsage());
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proEmail, setProEmail] = useState("");
  const [proEmailSaved, setProEmailSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    // 1. Strict Physical Size Restriction (2 MB max for Free Tier sustainability)
    if (file.size > 2 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `El archivo "${file.name}" pesa ${sizeMb} MB y supera el límite de 2 MB permitido para cuentas gratuitas. Sube una versión optimizada en PDF o pega el texto directamente.`
      );
      setIsProcessing(false);
      return;
    }

    setSelectedFile({
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type || "application/octet-stream",
    });
    setErrorMessage(null);
    setQuotaExhausted(false);
    setIsProcessing(true);
    setProcessingStep("Leyendo documento binario...");

    try {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isText =
        file.type.startsWith("text/") ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md");

      let payload: any = {
        fileName: file.name,
      };

      if (isPdf) {
        setProcessingStep("Analizando documento con Gemini 3.8 Flash (Modo Estricto Verídico)...");
        const base64Data = await fileToBase64(file);
        payload.fileBase64 = base64Data;
        payload.mimeType = "application/pdf";
      } else if (isText) {
        setProcessingStep("Parseando texto y extrayendo elementos del CV...");
        const text = await fileToText(file);
        payload.textContent = text;
        payload.mimeType = "text/plain";
      } else {
        setProcessingStep("Procesando formato con extractor...");
        const base64Data = await fileToBase64(file);
        payload.fileBase64 = base64Data;
        payload.mimeType = file.type || "application/octet-stream";
      }

      // 2. Check AI Quota before calling Gemini API
      const quota = checkCanUseAi(currentUser?.plan || "free");
      if (!quota.canUse) {
        setIsProcessing(false);
        if (quota.cooldownRemainingMs > 0) {
          const sec = Math.ceil(quota.cooldownRemainingMs / 1000);
          setErrorMessage(`Por favor espera ${sec} segundos antes de realizar otra extracción con IA para prevenir saturar el servicio.`);
          return;
        }
        setQuotaExhausted(true);
        setPendingPayload(payload);
        return;
      }

      await sendExtractionRequest(payload);
    } catch (err: any) {
      console.error("Error al procesar archivo:", err);
      setErrorMessage("No se pudo leer el archivo. Puedes probar pegando el texto directamente.");
      setIsProcessing(false);
    }
  };

  const processTextExtraction = async (textToProcess: string, customName?: string) => {
    if (!textToProcess.trim()) {
      setErrorMessage("Por favor pega o ingresa el texto de tu CV.");
      return;
    }

    // 15,000 max characters limit
    let cleanText = textToProcess.trim();
    if (cleanText.length > 15000) {
      cleanText = cleanText.substring(0, 15000);
    }

    setErrorMessage(null);
    setQuotaExhausted(false);
    setIsProcessing(true);
    setProcessingStep("Extrayendo estructura fidedigna con IA...");
    setSelectedFile({
      name: customName || "Texto_CV_Pegado.txt",
      size: `${Math.round(cleanText.length / 1024)} KB`,
      type: "text/plain",
    });

    const payload = {
      textContent: cleanText,
      fileName: customName || "Texto_CV_Pegado.txt",
      mimeType: "text/plain",
    };

    // Check AI Quota
    const quota = checkCanUseAi(currentUser?.plan || "free");
    if (!quota.canUse) {
      setIsProcessing(false);
      if (quota.cooldownRemainingMs > 0) {
        const sec = Math.ceil(quota.cooldownRemainingMs / 1000);
        setErrorMessage(`Por favor espera ${sec} segundos antes de realizar otra extracción con IA.`);
        return;
      }
      setQuotaExhausted(true);
      setPendingPayload(payload);
      return;
    }

    try {
      await sendExtractionRequest(payload);
    } catch (err: any) {
      console.error("Error en extracción:", err);
      setErrorMessage("Ocurrió un error en la extracción. Revisa tu conexión.");
      setIsProcessing(false);
    }
  };

  const handleRunLocalExtractor = async () => {
    if (!pendingPayload) return;
    setQuotaExhausted(false);
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStep("Ejecutando extractor local verídico (sin IA, 100% gratuito)...");
    try {
      await sendExtractionRequest({
        ...pendingPayload,
        forceLocal: true,
      });
    } catch (err: any) {
      setErrorMessage("No se pudo procesar con el extractor local. Prueba pegando el texto directamente.");
      setIsProcessing(false);
    }
  };

  const sendExtractionRequest = async (payload: any) => {
    setProcessingStep("Auditando completitud e identificando campos pendientes...");

    const response = await fetch("/api/cv/extract-full-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      throw new Error(errorJson?.error || `Servidor respondió con código ${response.status}`);
    }

    const data = await response.json();

    // If successfully extracted via Gemini AI, record usage count
    if (!payload.forceLocal && data.engine !== "local-strict-parser") {
      recordAiUsage();
      setAiUsage(getAiUsage());
    }

    setExtractionEngine(data.engine || "Gemini 3.8 Flash");
    setExtractedCv(data.cvData || null);
    setPendingFields(data.pendingFields || []);
    setCompletenessScore(data.completenessScore || 0);

    // Format achievements for the bitácora
    const rawAchievements = data.achievements || [];
    const formatted: ExtractedBullet[] = rawAchievements.map((item: any, idx: number) => ({
      id: item.id || `bullet-${Date.now()}-${idx}`,
      client: item.client || "Empresa",
      project: item.project || "Ingeniería",
      category: (item.category as LogCategory) || "Feature ✨",
      title: item.title || "Logro técnico verídico",
      description: item.description || item.title || "",
      impact: item.impact || item.title || "",
      tags: Array.isArray(item.tags) ? item.tags : ["#Ingeniería"],
      xyzScore: item.xyzScore || 80,
      metricHighlight: item.metricHighlight,
      selected: true,
      isEditing: false,
    }));

    setExtractedBullets(formatted);
    setIsProcessing(false);

    // If there are pending fields, default to the "pending" tab so user immediately sees what's missing!
    if (data.pendingFields && data.pendingFields.length > 0) {
      setReviewTab("pending");
    } else {
      setReviewTab("radiography");
    }
  };

  // Open the quick in-place editor for a pending field
  const handleOpenFillPending = (field: CvPendingField) => {
    let currVal = "";
    if (extractedCv) {
      if (field.section === "contact") {
        currVal = (extractedCv.contact as any)?.[field.fieldName] || "";
      } else if (field.section === "summary") {
        currVal = extractedCv.summary || "";
      }
    }
    setActiveFieldEditing({
      fieldId: field.id,
      label: field.label,
      section: field.section,
      fieldName: field.fieldName,
      currentValue: currVal,
      suggestedPrompt: field.suggestedPrompt,
    });
    setQuickFieldValue(currVal);
  };

  // Save the in-place edited field and update completeness score
  const handleSaveFilledField = () => {
    if (!activeFieldEditing || !extractedCv) return;

    const value = quickFieldValue.trim();
    if (!value) return;

    const updatedCv = { ...extractedCv };

    if (activeFieldEditing.section === "contact") {
      updatedCv.contact = {
        ...updatedCv.contact,
        [activeFieldEditing.fieldName]: value,
      };
    } else if (activeFieldEditing.section === "summary") {
      updatedCv.summary = value;
    } else if (activeFieldEditing.section === "skills") {
      const skillsArray = value.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      updatedCv.skills = {
        ...updatedCv.skills,
        technical: Array.from(new Set([...updatedCv.skills.technical, ...skillsArray])),
      };
    } else if (activeFieldEditing.section === "experiences") {
      updatedCv.experiences.push({
        id: `exp-manual-${Date.now()}`,
        company: value.split("-")[0]?.trim() || value,
        role: value.split("-")[1]?.trim() || "Ingeniero",
        bullets: [value],
        technologies: [],
        category: "Feature ✨",
      });
    } else if (activeFieldEditing.section === "education") {
      updatedCv.education.push({
        id: `edu-manual-${Date.now()}`,
        degree: value,
        institution: "",
      });
    } else if (activeFieldEditing.section === "certifications") {
      updatedCv.certifications.push({
        id: `cert-manual-${Date.now()}`,
        name: value,
        issuer: "",
      });
    } else if (activeFieldEditing.section === "languages") {
      updatedCv.languages.push({
        id: `lang-manual-${Date.now()}`,
        language: value,
        level: "Competencia profesional",
      });
    }

    setExtractedCv(updatedCv);

    // Remove from pending fields list
    const newPending = pendingFields.filter((p) => p.id !== activeFieldEditing.fieldId);
    setPendingFields(newPending);

    // Recalculate completeness
    const totalChecks = 13;
    const completed = totalChecks - newPending.length;
    setCompletenessScore(Math.round((completed / totalChecks) * 100));

    setActiveFieldEditing(null);
    setQuickFieldValue("");
  };

  // Direct edit of contact fields
  const handleUpdateContactField = (key: keyof ExtractedCvData["contact"], val: string) => {
    if (!extractedCv) return;
    setExtractedCv({
      ...extractedCv,
      contact: {
        ...extractedCv.contact,
        [key]: val,
      },
    });
  };

  // Direct edit of bullet in list
  const toggleSelectBullet = (id: string) => {
    setExtractedBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setExtractedBullets((prev) => prev.map((b) => ({ ...b, selected: select })));
  };

  const removeBullet = (id: string) => {
    setExtractedBullets((prev) => prev.filter((b) => b.id !== id));
  };

  // Final Action: Save to Platform storage, update profile and import logs
  const handleSaveAndApply = () => {
    if (!extractedCv) return;

    // 1. Save Full Structured CV to Platform Local Storage
    saveStoredCv(extractedCv, currentUser?.id);

    // 2. Synchronize with Active User Profile if available
    if (currentUser && onUpdateProfile) {
      const updatedUser: UserProfile = {
        ...currentUser,
        name: extractedCv.contact.name || currentUser.name,
        title: extractedCv.contact.headline || currentUser.title,
        email: extractedCv.contact.email || currentUser.email,
        bio: extractedCv.summary || currentUser.bio,
        location: extractedCv.contact.location || currentUser.location,
        linkedin: extractedCv.contact.linkedin || currentUser.linkedin,
        github: extractedCv.contact.github || currentUser.github,
        skills: [
          ...extractedCv.skills.technical.map((s) => ({
            name: s,
            category: "Languages" as const,
          })),
          ...extractedCv.skills.frameworks.map((s) => ({
            name: s,
            category: "Frameworks" as const,
          })),
          ...extractedCv.skills.toolsCloud.map((s) => ({
            name: s,
            category: "Cloud/DevOps" as const,
          })),
        ].slice(0, 15),
      };
      onUpdateProfile(updatedUser);
    }

    // 3. Register Work Experiences (Containers) in Platform Storage
    const currentExperiences = getStoredExperiences();
    const updatedExperiences = [...currentExperiences];
    const expIdMap = new Map<string, string>(); // company -> experienceId

    if (Array.isArray(extractedCv.experiences)) {
      extractedCv.experiences.forEach((exp) => {
        const companyKey = (exp.company || "").trim().toLowerCase();
        if (!companyKey) return;

        const existing = updatedExperiences.find(
          (e) => e.company.toLowerCase() === companyKey
        );

        if (existing) {
          expIdMap.set(companyKey, existing.id);
          // Preserve bullets if existing doesn't have them or new are extracted
          if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
            existing.bullets = exp.bullets;
          }
          if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
            existing.technologies = Array.from(new Set([...(existing.technologies || []), ...exp.technologies]));
          }
        } else {
          const newWorkExp: WorkExperience = {
            id: exp.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            company: exp.company.trim(),
            role: exp.role?.trim() || "Ingeniero",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            isCurrent: exp.isCurrent || false,
            location: exp.location || "",
            summary: exp.description || `Experiencia profesional extraída de CV.`,
            bullets: Array.isArray(exp.bullets) ? [...exp.bullets] : [],
            technologies: exp.technologies || [],
            isPersonalProjects: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          updatedExperiences.push(newWorkExp);
          expIdMap.set(companyKey, newWorkExp.id);
        }
      });

      saveExperiences(updatedExperiences);
    }

    // 4. Import Selected Bullets to Bitácora (LogEntry) linked to Experience Container
    const toImport = extractedBullets.filter((b) => b.selected);
    if (toImport.length > 0) {
      const defaultExpId = updatedExperiences[0]?.id || "exp-personal";

      const formattedLogs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[] = toImport.map(
        (b) => {
          const matchedExpId = expIdMap.get(b.client.trim().toLowerCase()) || defaultExpId;
          return {
            experienceId: matchedExpId,
            originalBullet: b.originalText || b.impact || b.title,
            date: new Date().toISOString().substring(0, 10),
            client: b.client.trim() || "Empresa",
            project: b.project.trim() || "Ingeniería",
            category: b.category,
            title: b.title.trim(),
            description: b.description || `Extraído de CV verídico (${selectedFile?.name || "Documento"}).`,
            impact: b.impact.trim(),
            tags: b.tags.length > 0 ? b.tags : ["#CVVerídico", "#Producción"],
            isPublic: false, // In private sandbox by default
          };
        }
      );
      onImportLogs(formattedLogs);
    }

    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFile(null);
    setExtractedCv(null);
    setPendingFields([]);
    setCompletenessScore(0);
    setExtractedBullets([]);
    setIsProcessing(false);
    setErrorMessage(null);
    setPastedCvText("");
    setActiveFieldEditing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl bg-[#0B0F19] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-md shadow-purple-900/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Extractor de CV de Alta Fidelidad & Auditoría
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  100% Datos Reales · Cero Invención
                </span>
                <button
                  type="button"
                  onClick={() => setShowProModal(true)}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Detalles de cuota y plan"
                >
                  <Zap className={`w-3 h-3 ${aiUsage.count >= MAX_FREE_MONTHLY_AI_USES ? "text-amber-400" : "text-purple-400"}`} />
                  <span>{aiUsage.count} de {MAX_FREE_MONTHLY_AI_USES} usos IA este mes</span>
                  <span className="text-purple-400 font-semibold underline ml-0.5">Plan Pro</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Extrae toda la información de tu CV, detecta campos faltantes y te ayuda a completarlos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {extractedCv && (
              <button
                onClick={resetState}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cargar otro documento"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo Archivo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: UPLOAD / INGESTION SCREEN */}
          {!extractedCv && !isProcessing && (
            <div className="space-y-6">
              {/* Tabs for Ingestion Method */}
              <div className="flex border-b border-slate-800">
                <button
                  onClick={() => setActiveTab("file")}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === "file"
                      ? "border-purple-500 text-purple-400 bg-purple-500/10"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  Subir Archivo (PDF, DOCX, TXT)
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === "text"
                      ? "border-purple-500 text-purple-400 bg-purple-500/10"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Pegar Texto del CV
                </button>
              </div>

              {/* Strict Truthfulness Banner */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Garantía de Fidelidad de Datos:</p>
                  <p className="text-slate-400">
                    A diferencia de otros sistemas que inventan porcentajes y métricas inexistentes, nuestro motor
                    extrae exclusivamente los datos reales de tu documento. Lo que falte o no se mencione quedará
                    catalogado como <strong>Pendiente de rellenar</strong> en tu auditoría para que lo completes a tu ritmo.
                  </p>
                </div>
              </div>

              {/* Tab 1: File Dropzone */}
              {activeTab === "file" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-purple-400 bg-purple-500/10 scale-[1.01]"
                      : "border-slate-700/80 hover:border-purple-500/60 bg-slate-900/40 hover:bg-slate-900/70"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.md"
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Arrastra tu CV aquí o haz clic para seleccionarlo
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                    Soporta PDFs nativos, documentos Word (.docx) o texto plano (máx. 2 MB). Extrae automáticamente
                    contacto, resumen, experiencias, viñetas, educación y habilidades.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                    <span>PDF</span>
                    <span>•</span>
                    <span>DOCX</span>
                    <span>•</span>
                    <span>TXT / Markdown</span>
                    <span>•</span>
                    <span className="text-purple-300 font-medium">Hasta 2 MB</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Paste Text */}
              {activeTab === "text" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Contenido textual de tu CV
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {pastedCvText.length} / 15.000 caracteres máx.
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedCvText}
                    onChange={(e) => setPastedCvText(e.target.value)}
                    placeholder="Pega aquí el contenido completo de tu CV: experiencia, educación, habilidades, contacto..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => processTextExtraction(pastedCvText)}
                      disabled={!pastedCvText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                    >
                      <Sparkles className="w-4 h-4" />
                      Extraer Información Verídica
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Sample Demo Button */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  ¿Quieres ver cómo funciona de inmediato sin subir un archivo?
                </div>
                <button
                  onClick={() => processTextExtraction(SAMPLE_CV_TEXT, "CV_Rodrigo_Jara_Sample.txt")}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-purple-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Probar con CV de Muestra (Rodrigo Jara)
                </button>
              </div>

              {quotaExhausted && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-purple-950/30 border border-amber-500/50 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-300">
                      <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Límite mensual de extracciones con IA alcanzado ({aiUsage.count}/{MAX_FREE_MONTHLY_AI_USES})
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold">
                          Cuenta Gratuita
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Para asegurar que tu cuenta permanezca <strong>siempre 100% gratuita y sin costo ($0.00)</strong>, las extracciones con IA tienen un límite de 3 usos al mes (se renueva automáticamente el primer día de cada mes).
                      </p>
                      <p className="text-xs text-slate-400">
                        ¡No te preocupes! Puedes procesar tu documento inmediatamente con nuestro motor local sin IA a costo cero, o unirte a la lista del Plan Pro.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={handleRunLocalExtractor}
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Procesar con Extractor Local ($0.00)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowProModal(true)}
                      className="px-4 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-purple-400/30 shadow-lg shadow-purple-950/40 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>Desbloquear Ilimitado (Plan Pro)</span>
                    </button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {isProcessing && (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Auditando y Extrayendo Contenido Fidedigno
                </h4>
                <p className="text-xs text-purple-400 font-mono animate-pulse">
                  {processingStep}
                </p>
                <p className="text-[11px] text-slate-500 mt-2 max-w-sm mx-auto">
                  Extrayendo roles, empresas, viñetas, educación y computando la lista de campos pendientes...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW, AUDIT CHECKLIST & IN-PLACE FILLING */}
          {extractedCv && !isProcessing && (
            <div className="space-y-6">
              {/* Top Completeness & Audit Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                        Completitud del CV Extraído
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300">
                        {completenessScore}% Identificado
                      </span>
                    </div>
                    <div className="w-full sm:w-72 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${completenessScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {pendingFields.length > 0 ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
                        <ListTodo className="w-4 h-4 text-amber-400" />
                        <span>
                          <strong>{pendingFields.length} campos</strong> pendientes por rellenar
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>¡CV Completo al 100%!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-tabs for Review */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setReviewTab("pending")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      reviewTab === "pending"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    Lista de Pendientes ({pendingFields.length})
                  </button>
                  <button
                    onClick={() => setReviewTab("radiography")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      reviewTab === "radiography"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Radiografía Completa del CV
                  </button>
                  <button
                    onClick={() => setReviewTab("bullets")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      reviewTab === "bullets"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Viñetas para la Bitácora ({extractedBullets.length})
                  </button>
                </div>
              </div>

              {/* TAB A: CHECKLIST DE PENDIENTES */}
              {reviewTab === "pending" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-amber-400" />
                        Campos que no fue posible identificar en tu CV
                      </h4>
                      <p className="text-xs text-slate-400">
                        La herramienta identificó todo lo posible de forma verídica. Aquí tienes la lista de lo que
                        falta rellenar: puedes completarlo ahora mismo con un clic o dejarlo para después.
                      </p>
                    </div>
                  </div>

                  {pendingFields.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                      <h5 className="text-sm font-bold text-white">¡No hay campos pendientes!</h5>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Tu CV contenía toda la información estándar requerida (contacto, titular, experiencias,
                        habilidades, educación, certificaciones e idiomas).
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pendingFields.map((field) => (
                        <div
                          key={field.id}
                          className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                {field.label}
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                                  field.severity === "high"
                                    ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {field.severity === "high" ? "Recomendado" : "Opcional"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{field.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {field.suggestedPrompt}
                            </span>
                            <button
                              onClick={() => handleOpenFillPending(field)}
                              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Rellenar ahora
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB B: RADIOGRAFÍA COMPLETA DEL CV */}
              {reviewTab === "radiography" && (
                <div className="space-y-6">
                  {/* Section 1: Contact & Identity */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Identidad & Contacto
                        </h5>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Datos Reales
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={extractedCv.contact.name}
                          onChange={(e) => handleUpdateContactField("name", e.target.value)}
                          placeholder="Nombre del candidato"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Titular Profesional</label>
                        <input
                          type="text"
                          value={extractedCv.contact.headline}
                          onChange={(e) => handleUpdateContactField("headline", e.target.value)}
                          placeholder="ej: Senior Systems Architect"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Correo Electrónico</label>
                        <input
                          type="email"
                          value={extractedCv.contact.email}
                          onChange={(e) => handleUpdateContactField("email", e.target.value)}
                          placeholder="correo@ejemplo.com"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                        <input
                          type="text"
                          value={extractedCv.contact.phone}
                          onChange={(e) => handleUpdateContactField("phone", e.target.value)}
                          placeholder="ej: +56 9 1234 5678"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Ubicación / Modalidad</label>
                        <input
                          type="text"
                          value={extractedCv.contact.location}
                          onChange={(e) => handleUpdateContactField("location", e.target.value)}
                          placeholder="ej: Santiago, Chile / Remoto"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={extractedCv.contact.linkedin}
                          onChange={(e) => handleUpdateContactField("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/usuario"
                          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Summary / About */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Resumen Profesional (Sobre Mí)
                        </h5>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={extractedCv.summary}
                      onChange={(e) => setExtractedCv({ ...extractedCv, summary: e.target.value })}
                      placeholder="Resumen del candidato no detectado en el documento..."
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Section 3: Work Experience with real textual bullets */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Experiencia Laboral ({extractedCv.experiences.length})
                        </h5>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {extractedCv.experiences.reduce((acc, e) => acc + (e.bullets?.length || 0), 0)} viñetas reales
                      </span>
                    </div>

                    <div className="space-y-4">
                      {extractedCv.experiences.map((exp, idx) => (
                        <div key={exp.id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{exp.role}</span>
                              <span className="text-xs text-purple-400">@ {exp.company}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-400">
                              {exp.startDate || ""} {exp.endDate ? `— ${exp.endDate}` : ""}
                            </span>
                          </div>

                          {/* Real textual bullets */}
                          <ul className="space-y-1.5 mt-2">
                            {exp.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Technologies */}
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {exp.technologies.map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Skills Breakdown */}
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Habilidades Técnicas & Stack
                        </h5>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        ...extractedCv.skills.technical,
                        ...extractedCv.skills.frameworks,
                        ...extractedCv.skills.toolsCloud,
                      ].map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-xs font-mono text-purple-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: Education & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Educación ({extractedCv.education.length})
                        </h5>
                      </div>
                      {extractedCv.education.length === 0 ? (
                        <p className="text-xs text-amber-400/80 italic">No especificada en el CV.</p>
                      ) : (
                        extractedCv.education.map((edu, idx) => (
                          <div key={idx} className="text-xs">
                            <p className="font-semibold text-white">{edu.degree}</p>
                            <p className="text-slate-400">{edu.institution} {edu.year ? `(${edu.year})` : ""}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Certificaciones ({extractedCv.certifications.length})
                        </h5>
                      </div>
                      {extractedCv.certifications.length === 0 ? (
                        <p className="text-xs text-amber-400/80 italic">No detectadas en el documento.</p>
                      ) : (
                        extractedCv.certifications.map((c, idx) => (
                          <div key={idx} className="text-xs">
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-slate-400">{c.issuer} {c.year ? `(${c.year})` : ""}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB C: VIÑETAS PARA LA BITÁCORA */}
              {reviewTab === "bullets" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Logros extraídos listos para importar a tu Bitácora
                      </h4>
                      <p className="text-xs text-slate-400">
                        Selecciona los logros que deseas agregar a tu Sandbox Privado (podrás publicarlos en el
                        Public Deck o dejarlos confidenciales).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelectAll(true)}
                        className="px-2.5 py-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Marcar Todos
                      </button>
                      <button
                        onClick={() => toggleSelectAll(false)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-300 font-medium"
                      >
                        Desmarcar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {extractedBullets.map((bullet) => (
                      <div
                        key={bullet.id}
                        className={`p-4 rounded-xl border transition-all ${
                          bullet.selected
                            ? "bg-slate-900/90 border-purple-500/50 shadow-md shadow-purple-950/20"
                            : "bg-slate-950/40 border-slate-800 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleSelectBullet(bullet.id)}
                            className="mt-0.5 text-purple-400 hover:text-purple-300"
                          >
                            {bullet.selected ? (
                              <CheckSquare className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-600" />
                            )}
                          </button>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {bullet.client}
                                </span>
                                <span className="text-[11px] text-purple-400">
                                  / {bullet.project}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {bullet.category}
                              </span>
                            </div>

                            <p className="text-xs text-slate-200">{bullet.title}</p>

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {bullet.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => removeBullet(bullet.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {extractedCv && (
              <span>
                Auditoría: <strong>{completenessScore}%</strong> · {pendingFields.length} pendientes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cerrar
            </button>

            {extractedCv && (
              <button
                onClick={handleSaveAndApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar CV y Aplicar a mi Bitácora / Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK IN-LINE FILLING MODAL */}
      {activeFieldEditing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-slate-900 border border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ListTodo className="w-4 h-4 text-amber-400" />
                Rellenar: {activeFieldEditing.label}
              </div>
              <button
                onClick={() => setActiveFieldEditing(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {activeFieldEditing.suggestedPrompt}
            </p>

            <div>
              {activeFieldEditing.section === "summary" ? (
                <textarea
                  rows={4}
                  value={quickFieldValue}
                  onChange={(e) => setQuickFieldValue(e.target.value)}
                  placeholder="Escribe el contenido aquí..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              ) : (
                <input
                  type="text"
                  value={quickFieldValue}
                  onChange={(e) => setQuickFieldValue(e.target.value)}
                  placeholder="Escribe el valor aquí..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveFieldEditing(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFilledField}
                disabled={!quickFieldValue.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Campo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRO PLAN / WAITLIST MODAL */}
      {showProModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-[#0B0F19] border border-purple-500/50 rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Plan Pro · Acceso Ilimitado & Suite de Carrera
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Para desarrolladores en búsqueda activa o en fase de optimización de perfil.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProModal(false);
                  setProEmailSaved(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Features list */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  ¿Qué incluye el Plan Pro?
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Extracciones de CV ilimitadas</strong> con Gemini 3.8 Flash (sin límites mensuales ni tiempos de espera).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Generación de CV personalizado</strong> ajustado al 80/20 de cada oferta de empleo (Fase 2).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Preparador de entrevistas STAR</strong> enfocado en las preguntas clave de la vacante (Fase 2).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Historial de preguntas y respuestas</strong> para postulaciones repetidas (Fase 2).</span>
                  </li>
                </ul>
              </div>

              {/* Waitlist signup */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="text-xs text-purple-200">
                  <p className="font-semibold text-white mb-0.5">Únete a la lista de espera con 50% de descuento:</p>
                  <p className="text-[11px] text-slate-300">
                    Déjanos tu correo para notificarte el lanzamiento y recibir tu descuento preferencial.
                  </p>
                </div>

                {proEmailSaved ? (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>¡Listo! Registramos tu correo con prioridad de acceso.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (proEmail && proEmail.includes("@")) {
                        saveProWaitlistEmail(proEmail);
                        setProEmailSaved(true);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={proEmail}
                      onChange={(e) => setProEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-900/30"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      Anotarme
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Tu cuenta actual sigue funcionando al 100% sin costo alguno.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowProModal(false);
                  setProEmailSaved(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
