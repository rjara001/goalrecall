import React, { useState, useEffect, useMemo } from "react";
import {
  InboxAchievementDraft,
  LogCategory,
  LogEntry,
  PresetTemplate,
  WorkExperience,
} from "../../types";
import { formatFirestoreUiError } from "../../utils/firestore/errors";
import {
  DEFAULT_TECH_CATEGORIES,
  DEFAULT_MARKETING_CATEGORIES,
  DEFAULT_BUSINESS_CATEGORIES,
  buildBulletPrefill,
} from "./quickLogPresets";

interface UseQuickLogFormOptions {
  isOpen: boolean;
  existingLogs: LogEntry[];
  experiences: WorkExperience[];
  initialData?: LogEntry | null;
  initialExperienceId?: string;
  initialBulletText?: string;
  initialDraft?: InboxAchievementDraft | null;
  onSave: (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCreateExperience?: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt">
  ) => Promise<WorkExperience>;
  onClose: () => void;
  titleInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useQuickLogForm({
  isOpen,
  existingLogs,
  experiences,
  initialData,
  initialExperienceId,
  initialBulletText,
  initialDraft,
  onSave,
  onCreateExperience,
  onClose,
  titleInputRef,
}: UseQuickLogFormOptions) {
  const [title, setTitle] = useState("");
  const [whatWasSought, setWhatWasSought] = useState("");
  const [whyImportant, setWhyImportant] = useState("");
  const [howApplied, setHowApplied] = useState("");
  const [impact, setImpact] = useState("");
  const [description, setDescription] = useState("");

  const [isWhatSoughtOpen, setIsWhatSoughtOpen] = useState(false);
  const [isWhyImportantOpen, setIsWhyImportantOpen] = useState(false);
  const [isHowAppliedOpen, setIsHowAppliedOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [experienceId, setExperienceId] = useState<string>("");
  const [isCreatingNewExp, setIsCreatingNewExp] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpRole, setNewExpRole] = useState("");
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [category, setCategory] = useState<LogCategory>("Feature ✨");
  const [categoryFilterTab, setCategoryFilterTab] = useState<
    "all" | "tech" | "marketing" | "business"
  >("all");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const existingProjects = useMemo(
    () => Array.from(new Set(existingLogs.map((l) => l.project))).filter(Boolean),
    [existingLogs]
  );

  const displayedCategories = useMemo(() => {
    const base =
      categoryFilterTab === "tech"
        ? DEFAULT_TECH_CATEGORIES
        : categoryFilterTab === "marketing"
        ? DEFAULT_MARKETING_CATEGORIES
        : categoryFilterTab === "business"
        ? DEFAULT_BUSINESS_CATEGORIES
        : [
            ...DEFAULT_TECH_CATEGORIES,
            ...DEFAULT_MARKETING_CATEGORIES,
            ...DEFAULT_BUSINESS_CATEGORIES,
          ];
    const fromLogs = existingLogs.map((l) => l.category).filter(Boolean);
    return Array.from(new Set([...base, ...customCategories, ...fromLogs]));
  }, [categoryFilterTab, customCategories, existingLogs]);

  useEffect(() => {
    if (!isOpen) return;

    setIsWhatSoughtOpen(false);
    setIsWhyImportantOpen(false);
    setIsHowAppliedOpen(false);
    setIsImpactOpen(false);
    setIsDescriptionOpen(false);
    setIsContextVisible(false);
    setIsTemplatesOpen(false);
    setIsCreatingNewExp(false);
    setNewExpCompany("");
    setNewExpRole("");
    setIsSaving(false);
    setSaveError(null);

    const exps = experiences || [];

    if (initialData) {
      setTitle(initialData.title);
      setWhatWasSought(initialData.whatWasSought || "");
      setWhyImportant(initialData.whyImportant || "");
      setHowApplied(initialData.howApplied || "");
      setImpact(initialData.impact || "");
      setDescription(initialData.description || "");
      setDate(initialData.date);
      setExperienceId(initialData.experienceId || exps[0]?.id || "exp-personal");
      setClient(initialData.client);
      setProject(initialData.project);
      setCategory(initialData.category);
      setTags(initialData.tags || []);
      setIsPublic(initialData.isPublic);
    } else {
      const targetExp = initialExperienceId
        ? exps.find((e) => e.id === initialExperienceId)
        : null;
      const defaultExp = targetExp ||
        exps[0] || {
          id: "exp-personal",
          company: "Proyectos Personales & Consultoría Independiente",
          technologies: [] as string[],
        };

      setDate(new Date().toISOString().substring(0, 10));
      setExperienceId(defaultExp.id);
      setClient(defaultExp.company);
      setProject(existingProjects[0] || "Producción");
      setCategory("Feature ✨");

      if (initialDraft) {
        setClient(initialDraft.client || defaultExp.company);
        setProject(initialDraft.project || existingProjects[0] || "Producción");
        setCategory(initialDraft.category || "Feature ✨");
        setTitle(initialDraft.title || "");
        setWhatWasSought(initialDraft.whatWasSought || "");
        setWhyImportant(initialDraft.whyImportant || "");
        setHowApplied(initialDraft.howApplied || "");
        setDescription(initialDraft.description || "");
        setImpact(initialDraft.impact || "");
        setTags(initialDraft.tags?.length ? initialDraft.tags : ["#Engineering"]);
        if (initialDraft.impact) setIsImpactOpen(true);
      } else if (initialBulletText) {
        const prefill = buildBulletPrefill(
          initialBulletText,
          defaultExp.company,
          defaultExp.technologies
        );
        setTitle(prefill.title);
        setDescription(prefill.description);
        setWhatWasSought(prefill.whatWasSought);
        setWhyImportant(prefill.whyImportant);
        setHowApplied(prefill.howApplied);
        setImpact(prefill.impact);
        setTags(prefill.tags);
      } else {
        setTitle("");
        setWhatWasSought("");
        setWhyImportant("");
        setHowApplied("");
        setDescription("");
        setImpact("");
        setTags(["#FullStack", "#TypeScript"]);
      }
      setIsPublic(false);
    }

    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [
    initialData,
    isOpen,
    initialExperienceId,
    initialBulletText,
    initialDraft,
    experiences,
    existingProjects,
    titleInputRef,
  ]);

  const handleAddCustomCategory = () => {
    const clean = customCategoryInput.trim();
    if (!clean) return;
    if (!customCategories.includes(clean)) {
      setCustomCategories((prev) => [...prev, clean]);
    }
    setCategory(clean);
    setCustomCategoryInput("");
  };

  const applyPreset = (preset: PresetTemplate) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setWhatWasSought(preset.whatWasSought || "");
    setWhyImportant(preset.whyImportant || "");
    setHowApplied(preset.howApplied || "");
    setDescription(preset.description);
    setImpact(preset.impact);
    setTags(preset.tags);
    setIsTemplatesOpen(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const formatted = tagInput.trim().startsWith("#")
        ? tagInput.trim()
        : `#${tagInput.trim()}`;
      if (!tags.includes(formatted)) setTags([...tags, formatted]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const finalImpact =
        impact.trim() || "Completado y verificado en entorno de producción";
      let targetExpId = experienceId;
      let targetClient = client;

      if (isCreatingNewExp && newExpCompany.trim()) {
        if (!onCreateExperience) {
          throw new Error("No se pudo crear la empresa en Firestore.");
        }
        const createdExp = await onCreateExperience({
          company: newExpCompany.trim(),
          role: newExpRole.trim() || "Ingeniero",
          startDate: new Date().getFullYear().toString(),
          isCurrent: true,
          summary: "Experiencia registrada para asignación de logros.",
          isPersonalProjects: false,
        });
        targetExpId = createdExp.id;
        targetClient = createdExp.company;
      }

      await onSave({
        date,
        experienceId: targetExpId,
        client: targetClient.trim() || "Empresa",
        project: project.trim() || "General",
        category,
        title: title.trim(),
        whatWasSought: whatWasSought.trim() || undefined,
        whyImportant: whyImportant.trim() || undefined,
        howApplied: howApplied.trim() || undefined,
        description: description.trim() || undefined,
        impact: finalImpact,
        tags,
        isPublic,
      });

      onClose();
    } catch (err) {
      setSaveError(
        formatFirestoreUiError(
          err,
          "No se pudo guardar el logro en Firestore. Inténtalo de nuevo."
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const currentExpObj = (experiences || []).find((exp) => exp.id === experienceId);
  const companyLabel = isCreatingNewExp
    ? newExpCompany || "Nueva Empresa"
    : currentExpObj?.company || client || "Personal";

  return {
    title,
    setTitle,
    whatWasSought,
    setWhatWasSought,
    whyImportant,
    setWhyImportant,
    howApplied,
    setHowApplied,
    impact,
    setImpact,
    description,
    setDescription,
    isWhatSoughtOpen,
    setIsWhatSoughtOpen,
    isWhyImportantOpen,
    setIsWhyImportantOpen,
    isHowAppliedOpen,
    setIsHowAppliedOpen,
    isImpactOpen,
    setIsImpactOpen,
    isDescriptionOpen,
    setIsDescriptionOpen,
    isContextVisible,
    setIsContextVisible,
    isTemplatesOpen,
    setIsTemplatesOpen,
    date,
    setDate,
    experienceId,
    setExperienceId,
    isCreatingNewExp,
    setIsCreatingNewExp,
    newExpCompany,
    setNewExpCompany,
    newExpRole,
    setNewExpRole,
    setClient,
    project,
    setProject,
    category,
    setCategory,
    categoryFilterTab,
    setCategoryFilterTab,
    customCategoryInput,
    setCustomCategoryInput,
    displayedCategories,
    tagInput,
    setTagInput,
    tags,
    isPublic,
    setIsPublic,
    experiencesList: experiences || [],
    existingProjects,
    companyLabel,
    isSaving,
    saveError,
    handleAddCustomCategory,
    applyPreset,
    handleAddTag,
    removeTag,
    handleSubmit,
  };
}
