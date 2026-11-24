import { useState, useEffect, useCallback } from "react";
import {
  AiUsageRecord,
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
import { checkCanUseAi, getAiUsage } from "../../../utils/storage";
import { formatFirestoreUiError } from "../../../utils/firestore/errors";
import {
  getAiQuotaFirestore,
  recordAiUsageFirestore,
  saveCvAndApplyBatchFirestore,
  saveProWaitlistEmailFirestore,
} from "../../../utils/firestore/repository";
import { auth } from "../../../firebase";
import { SAMPLE_CV_TEXT } from "../data/sampleCv";
import {
  normalizeCvText,
  parseCvFile,
  validateCvFile,
} from "../services/cvFileParser";
import { CvAiExtractionError, extractCvWithAi } from "../services/cvAiExtractor";
import {
  buildWorkspaceImportFromCv,
  computeUpdatedCvField,
  mapRawAchievementsToBullets,
} from "../services/cvImportMapper";

export interface CvSavedResult {
  cvData: ExtractedCvData;
  savedUser: UserProfile | null;
  savedExperiences: WorkExperience[];
  savedLogs: LogEntry[];
}

export interface UseCvUploadParams {
  isOpen: boolean;
  onClose: () => void;
  existingExperiences?: WorkExperience[];
  currentUser?: UserProfile | null;
  aiQuota?: AiUsageRecord | null;
  onAiQuotaUpdated?: (quota: AiUsageRecord) => void;
  onCvSaved?: (result: CvSavedResult) => Promise<void> | void;
}

export function useCvUpload({
  isOpen,
  onClose,
  existingExperiences = [],
  currentUser,
  aiQuota,
  onAiQuotaUpdated,
  onCvSaved,
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

  // Persistence State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
  const [aiUsage, setAiUsage] = useState<AiUsageRecord>(() =>
    getAiUsage(new Date(), aiQuota)
  );
  const [pendingPayload, setPendingPayload] = useState<CvExtractionPayload | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proEmail, setProEmail] = useState("");
  const [proEmailSaved, setProEmailSaved] = useState(false);
  const [proEmailError, setProEmailError] = useState<string | null>(null);
  const [isLoadingSamplePdf, setIsLoadingSamplePdf] = useState(false);

  // Sync AI usage counter from Firestore when modal opens or user/quota changes
  useEffect(() => {
    setAiUsage(getAiUsage(new Date(), aiQuota));
    if (isOpen && auth?.currentUser?.emailVerified) {
      getAiQuotaFirestore()
        .then((record) => {
          setAiUsage(record);
        })
        .catch(() => {
          // Keep last known quota if offline
        });
    }
  }, [isOpen, currentUser?.id, aiQuota]);

  const resetState = useCallback(() => {
    setPhase("upload");
    setSelectedFile(null);
    setExtractedCv(null);
    setPendingFields([]);
    setCompletenessScore(0);
    setExtractedBullets([]);
    setExtractionEngine("");
    setErrorMessage(null);
    setSaveError(null);
    setIsSaving(false);
    setFallbackNotice(null);
    setPastedCvText("");
    setActiveFieldEditing(null);
    setQuickFieldValue("");
    setPendingPayload(null);
  }, []);

  const executeExtraction = useCallback(
    async (payload: CvExtractionPayload) => {
      setProcessingStep("Auditando completitud e identificando campos pendientes...");

      let idToken: string | undefined;
      if (!payload.forceLocal && auth && auth.currentUser) {
        try {
          idToken = await auth.currentUser.getIdToken();
        } catch (tokenErr) {
          console.warn("No se pudo obtener el token de autenticación:", tokenErr);
        }
      }

      try {
        const result = await extractCvWithAi(payload, { idToken });

        if (result.usedAi && auth?.currentUser?.emailVerified) {
          try {
            const updatedQuota = await recordAiUsageFirestore();
            setAiUsage(updatedQuota);
            onAiQuotaUpdated?.(updatedQuota);
          } catch (quotaErr) {
            console.warn("No se pudo registrar el uso de cuota AI en Firestore:", quotaErr);
          }
        }

        setPendingPayload(null);
        setFallbackNotice(result.fallbackReason || null);
        setExtractionEngine(result.response.engine || "local-strict-parser");
        setExtractedCv(result.response.cvData || null);
        setPendingFields(result.response.pendingFields || []);
        setCompletenessScore(result.response.completenessScore || 0);
        setExtractedBullets(mapRawAchievementsToBullets(result.response.achievements || []));
        setSaveError(null);
        setPhase("review");

        if (result.response.cvData?.experiences?.length > 0) {
          setReviewTab("radiography");
        } else if (result.response.pendingFields?.length > 0) {
          setReviewTab("pending");
        } else {
          setReviewTab("radiography");
        }
      } catch (err) {
        if (err instanceof CvAiExtractionError) {
          setPendingPayload(payload);
          setErrorMessage(err.message);
          setPhase("upload");
          return;
        }
        throw err;
      }
    },
    [onAiQuotaUpdated]
  );

  const checkQuotaOrRun = useCallback(
    async (payload: CvExtractionPayload) => {
      const quota = checkCanUseAi(currentUser?.plan || "free", Date.now(), aiUsage);
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
    [aiUsage, currentUser?.plan, executeExtraction]
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
      setSaveError(null);
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
      setSaveError(null);
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

  const handleSaveAndApply = useCallback(async () => {
    if (!extractedCv || isSaving) return;

    if (!auth?.currentUser || !auth.currentUser.emailVerified) {
      setSaveError(
        "Debes iniciar sesión con una cuenta de Google verificada para guardar tu CV."
      );
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const { updatedUser, updatedExperiences, newLogs } =
        buildWorkspaceImportFromCv({
          extractedCv,
          selectedBullets: extractedBullets.filter((b) => b.selected),
          existingExperiences,
          currentUser,
          sourceFileName: selectedFile?.name,
        });

      const saved = await saveCvAndApplyBatchFirestore({
        cvData: extractedCv,
        currentUser,
        updatedUser,
        updatedExperiences,
        newLogs,
      });

      await onCvSaved?.({
        cvData: extractedCv,
        savedUser: saved.savedUser,
        savedExperiences: saved.savedExperiences,
        savedLogs: saved.savedLogs,
      });

      resetState();
      onClose();
    } catch (err) {
      setSaveError(
        formatFirestoreUiError(
          err,
          "No se pudieron guardar los datos del CV. Verifica tu conexión e intenta de nuevo."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    currentUser,
    existingExperiences,
    extractedBullets,
    extractedCv,
    isSaving,
    onClose,
    onCvSaved,
    resetState,
    selectedFile?.name,
  ]);

  const handleSaveProEmail = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) return;
    setProEmailError(null);
    try {
      await saveProWaitlistEmailFirestore(email);
      setProEmailSaved(true);
    } catch (err) {
      setProEmailError(
        formatFirestoreUiError(
          err,
          "No se pudo registrar tu correo en la lista de espera. Inicia sesión con Google e intenta de nuevo."
        )
      );
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
    isSaving,
    saveError,
    setSaveError,
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
    canFallbackLocally: Boolean(pendingPayload),
    showProModal,
    setShowProModal,
    proEmail,
    setProEmail,
    proEmailSaved,
    setProEmailSaved,
    proEmailError,
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
