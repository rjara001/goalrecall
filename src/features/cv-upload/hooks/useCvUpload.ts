import { useState, useEffect, useCallback } from "react";
import {
  CvExtractionPayload,
  CvFallbackReason,
  CvPendingField,
  CvUploadPhase,
  ExtractedBullet,
  ExtractedCvData,
  LogEntry,
  PendingFieldEditingState,
  UserProfile,
  WorkExperience,
} from "../../../types";
import {
  checkCanUseAi,
  getAiUsage,
  getStoredExperiences,
  recordAiUsage,
  saveExperiences,
  saveProWaitlistEmail,
  saveStoredCv,
} from "../../../utils/storage";
import { auth } from "../../../firebase";
import { SAMPLE_CV_TEXT } from "../data/sampleCv";
import {
  normalizeCvText,
  parseCvFile,
  validateCvFile,
} from "../services/cvFileParser";
import { extractCvWithAi } from "../services/cvAiExtractor";
import {
  buildWorkspaceImportFromCv,
  computeUpdatedCvField,
  mapRawAchievementsToBullets,
} from "../services/cvImportMapper";

export interface UseCvUploadParams {
  isOpen: boolean;
  onClose: () => void;
  onImportLogs: (logs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[]) => void;
  onExperiencesUpdated?: (updated: WorkExperience[]) => void;
  currentUser?: UserProfile | null;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export function useCvUpload({
  isOpen,
  onClose,
  onImportLogs,
  onExperiencesUpdated,
  currentUser,
  onUpdateProfile,
}: UseCvUploadParams) {
  const [phase, setPhase] = useState<CvUploadPhase>("upload");
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [reviewTab, setReviewTab] = useState<"radiography" | "pending" | "bullets">("pending");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [pastedCvText, setPastedCvText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<CvFallbackReason | null>(null);

  // Extracted Data State
  const [extractedCv, setExtractedCv] = useState<ExtractedCvData | null>(null);
  const [pendingFields, setPendingFields] = useState<CvPendingField[]>([]);
  const [completenessScore, setCompletenessScore] = useState(0);
  const [extractedBullets, setExtractedBullets] = useState<ExtractedBullet[]>([]);
  const [extractionEngine, setExtractionEngine] = useState("");

  // Quick In-line Field Editing
  const [activeFieldEditing, setActiveFieldEditing] =
    useState<PendingFieldEditingState | null>(null);
  const [quickFieldValue, setQuickFieldValue] = useState("");

  // AI Quota & Pro Plan State
  const [aiUsage, setAiUsage] = useState(() => getAiUsage());
  const [pendingPayload, setPendingPayload] = useState<CvExtractionPayload | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proEmail, setProEmail] = useState("");
  const [proEmailSaved, setProEmailSaved] = useState(false);
  const [isLoadingSamplePdf, setIsLoadingSamplePdf] = useState(false);

  // Resync AI usage counter when modal opens or active user changes
  useEffect(() => {
    if (isOpen) {
      setAiUsage(getAiUsage());
    }
  }, [isOpen, currentUser?.id]);

  const resetState = useCallback(() => {
    setPhase("upload");
    setSelectedFile(null);
    setExtractedCv(null);
    setPendingFields([]);
    setCompletenessScore(0);
    setExtractedBullets([]);
    setExtractionEngine("");
    setErrorMessage(null);
    setFallbackNotice(null);
    setPastedCvText("");
    setActiveFieldEditing(null);
    setQuickFieldValue("");
    setPendingPayload(null);
  }, []);

  const executeExtraction = useCallback(async (payload: CvExtractionPayload) => {
    setProcessingStep("Auditando completitud e identificando campos pendientes...");

    let idToken: string | undefined;
    if (!payload.forceLocal && auth && auth.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken();
      } catch (tokenErr) {
        console.warn("No se pudo obtener el token de autenticación:", tokenErr);
      }
    }

    const result = await extractCvWithAi(payload, { idToken });

    if (result.usedAi) {
      recordAiUsage();
      setAiUsage(getAiUsage());
    }

    setFallbackNotice(result.fallbackReason || null);
    setExtractionEngine(result.response.engine || "local-strict-parser");
    setExtractedCv(result.response.cvData || null);
    setPendingFields(result.response.pendingFields || []);
    setCompletenessScore(result.response.completenessScore || 0);
    setExtractedBullets(mapRawAchievementsToBullets(result.response.achievements || []));
    setPhase("review");

    if (result.response.cvData?.experiences?.length > 0) {
      setReviewTab("radiography");
    } else if (result.response.pendingFields?.length > 0) {
      setReviewTab("pending");
    } else {
      setReviewTab("radiography");
    }
  }, []);

  const checkQuotaOrRun = useCallback(
    async (payload: CvExtractionPayload) => {
      const quota = checkCanUseAi(currentUser?.plan || "free");
      if (!quota.canUse) {
        if (quota.cooldownRemainingMs > 0) {
          const sec = Math.ceil(quota.cooldownRemainingMs / 1000);
          setErrorMessage(
            `Por favor espera ${sec} segundos antes de realizar otra extracción con IA para prevenir saturar el servicio.`
          );
          setPhase("upload");
          return;
        }
        setPendingPayload(payload);
        setPhase("quota_exceeded");
        return;
      }

      await executeExtraction(payload);
    },
    [currentUser?.plan, executeExtraction]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validation = validateCvFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Archivo inválido.");
        setPhase("upload");
        return;
      }

      setSelectedFile({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type: file.type || "application/octet-stream",
      });
      setErrorMessage(null);
      setFallbackNotice(null);
      setPhase("processing");
      setProcessingStep("Leyendo documento binario...");

      try {
        const payload = await parseCvFile(file, setProcessingStep);
        await checkQuotaOrRun(payload);
      } catch (err) {
        console.error("Error al procesar archivo:", err);
        setErrorMessage(
          "No se pudo leer el archivo. Puedes probar pegando el texto directamente."
        );
        setPhase("upload");
      }
    },
    [checkQuotaOrRun]
  );

  const handlePasteText = useCallback(
    async (textToProcess: string, customName?: string) => {
      if (!textToProcess.trim()) {
        setErrorMessage("Por favor pega o ingresa el texto de tu CV.");
        return;
      }

      const cleanText = normalizeCvText(textToProcess);
      setErrorMessage(null);
      setFallbackNotice(null);
      setPhase("processing");
      setProcessingStep("Extrayendo estructura fidedigna con IA...");
      setSelectedFile({
        name: customName || "Texto_CV_Pegado.txt",
        size: `${Math.round(cleanText.length / 1024)} KB`,
        type: "text/plain",
      });

      const payload: CvExtractionPayload = {
        textContent: cleanText,
        fileName: customName || "Texto_CV_Pegado.txt",
        mimeType: "text/plain",
      };

      try {
        await checkQuotaOrRun(payload);
      } catch (err) {
        console.error("Error en extracción:", err);
        setErrorMessage("Ocurrió un error en la extracción. Revisa tu conexión.");
        setPhase("upload");
      }
    },
    [checkQuotaOrRun]
  );

  const handleLoadSampleText = useCallback(async () => {
    await handlePasteText(SAMPLE_CV_TEXT, "CV_Profesional_Sample.txt");
  }, [handlePasteText]);

  const handleLoadSamplePdf = useCallback(async () => {
    try {
      setIsLoadingSamplePdf(true);
      setErrorMessage(null);
      const response = await fetch("/demo-cv.pdf");
      if (!response.ok) {
        throw new Error("No se pudo obtener el PDF de pruebas");
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], "CV_Profesional_Demo.pdf", {
        type: "application/pdf",
      });
      await handleFileSelect(sampleFile);
    } catch (err: unknown) {
      console.error("Error al cargar PDF de pruebas:", err);
      const msg =
        err instanceof Error ? err.message : "Error al cargar el PDF de muestra";
      setErrorMessage(msg);
    } finally {
      setIsLoadingSamplePdf(false);
    }
  }, [handleFileSelect]);

  const handleRunLocalExtractor = useCallback(async () => {
    if (!pendingPayload) return;
    setErrorMessage(null);
    setPhase("processing");
    setProcessingStep(
      "Ejecutando extractor local verídico (sin IA, 100% gratuito)..."
    );
    try {
      await executeExtraction({
        ...pendingPayload,
        forceLocal: true,
      });
    } catch {
      setErrorMessage(
        "No se pudo procesar con el extractor local. Prueba pegando el texto directamente."
      );
      setPhase("quota_exceeded");
    }
  }, [executeExtraction, pendingPayload]);

  const handleOpenFillPending = useCallback(
    (field: CvPendingField) => {
      let currVal = "";
      if (extractedCv) {
        if (field.section === "contact") {
          currVal =
            extractedCv.contact[
              field.fieldName as keyof ExtractedCvData["contact"]
            ] || "";
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
    },
    [extractedCv]
  );

  const handleSaveFilledField = useCallback(() => {
    if (!activeFieldEditing || !extractedCv || !quickFieldValue.trim()) return;

    const { updatedCv, newPendingFields, completenessScore: nextScore } =
      computeUpdatedCvField(
        extractedCv,
        pendingFields,
        activeFieldEditing,
        quickFieldValue
      );

    setExtractedCv(updatedCv);
    setPendingFields(newPendingFields);
    setCompletenessScore(nextScore);
    setActiveFieldEditing(null);
    setQuickFieldValue("");
  }, [activeFieldEditing, extractedCv, pendingFields, quickFieldValue]);

  const handleUpdateContactField = useCallback(
    (key: keyof ExtractedCvData["contact"], val: string) => {
      setExtractedCv((prev) =>
        prev
          ? {
              ...prev,
              contact: {
                ...prev.contact,
                [key]: val,
              },
            }
          : prev
      );
    },
    []
  );

  const handleUpdateSummary = useCallback((summary: string) => {
    setExtractedCv((prev) => (prev ? { ...prev, summary } : prev));
  }, []);

  const toggleSelectBullet = useCallback((id: string) => {
    setExtractedBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  }, []);

  const toggleSelectAll = useCallback((select: boolean) => {
    setExtractedBullets((prev) => prev.map((b) => ({ ...b, selected: select })));
  }, []);

  const removeBullet = useCallback((id: string) => {
    setExtractedBullets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleSaveAndApply = useCallback(() => {
    if (!extractedCv) return;

    saveStoredCv(extractedCv, currentUser?.id);

    const existingExperiences = getStoredExperiences();
    const { updatedUser, updatedExperiences, newLogs } =
      buildWorkspaceImportFromCv({
        extractedCv,
        selectedBullets: extractedBullets.filter((b) => b.selected),
        existingExperiences,
        currentUser,
        sourceFileName: selectedFile?.name,
      });

    if (updatedUser && onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }

    if (Array.isArray(extractedCv.experiences)) {
      saveExperiences(updatedExperiences);
      onExperiencesUpdated?.(updatedExperiences);
    }

    if (newLogs.length > 0) {
      onImportLogs(newLogs);
    }

    resetState();
    onClose();
  }, [
    currentUser,
    extractedBullets,
    extractedCv,
    onClose,
    onExperiencesUpdated,
    onImportLogs,
    onUpdateProfile,
    resetState,
    selectedFile?.name,
  ]);

  const handleSaveProEmail = useCallback((email: string) => {
    if (email && email.includes("@")) {
      saveProWaitlistEmail(email);
      setProEmailSaved(true);
    }
  }, []);

  return {
    phase,
    activeTab,
    setActiveTab,
    reviewTab,
    setReviewTab,
    selectedFile,
    pastedCvText,
    setPastedCvText,
    isDragging,
    setIsDragging,
    processingStep,
    errorMessage,
    fallbackNotice,
    extractedCv,
    pendingFields,
    completenessScore,
    extractedBullets,
    extractionEngine,
    activeFieldEditing,
    setActiveFieldEditing,
    quickFieldValue,
    setQuickFieldValue,
    aiUsage,
    showProModal,
    setShowProModal,
    proEmail,
    setProEmail,
    proEmailSaved,
    setProEmailSaved,
    isLoadingSamplePdf,
    handleFileSelect,
    handlePasteText,
    handleLoadSampleText,
    handleLoadSamplePdf,
    handleRunLocalExtractor,
    handleOpenFillPending,
    handleSaveFilledField,
    handleUpdateContactField,
    handleUpdateSummary,
    toggleSelectBullet,
    toggleSelectAll,
    removeBullet,
    handleSaveAndApply,
    handleSaveProEmail,
    resetState,
  };
}
