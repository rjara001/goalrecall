import { useCallback, useEffect, useState } from "react";
import { LogEntry, Product, WorkExperience } from "../types";

export const useAppModals = () => {
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isCvUploadOpen, setIsCvUploadOpen] = useState(false);
  const [isPasteBulletsOpen, setIsPasteBulletsOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initialExperienceIdForLog, setInitialExperienceIdForLog] = useState<string | undefined>(
    undefined
  );
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const openQuickLog = useCallback((experienceId?: string) => {
    setEditingLog(null);
    setInitialExperienceIdForLog(experienceId);
    setIsQuickLogOpen(true);
  }, []);

  const openEditLog = useCallback((log: LogEntry) => {
    setEditingLog(log);
    setIsQuickLogOpen(true);
  }, []);

  const closeQuickLog = useCallback(() => {
    setIsQuickLogOpen(false);
    setEditingLog(null);
    setInitialExperienceIdForLog(undefined);
  }, []);

  const openAddExperience = useCallback(() => {
    setEditingExperience(null);
    setIsExperienceModalOpen(true);
  }, []);

  const openEditExperience = useCallback((exp: WorkExperience) => {
    setEditingExperience(exp);
    setIsExperienceModalOpen(true);
  }, []);

  const closeExperienceModal = useCallback(() => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
  }, []);

  const openNewProduct = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }, []);

  const openEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  }, []);

  const resetAllModals = useCallback(() => {
    setIsAuthOpen(false);
    setIsSettingsOpen(false);
    setIsQuickLogOpen(false);
    setIsCvUploadOpen(false);
    setIsPasteBulletsOpen(false);
    setIsExperienceModalOpen(false);
    setIsProductModalOpen(false);
    setIsAvatarModalOpen(false);
    setIsShareModalOpen(false);
    setEditingLog(null);
    setEditingExperience(null);
    setEditingProduct(null);
    setInitialExperienceIdForLog(undefined);
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl+K, Alt+L, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setEditingLog(null);
        setIsQuickLogOpen(true);
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setEditingLog(null);
        setIsQuickLogOpen(true);
      } else if (e.key === "Escape") {
        setIsQuickLogOpen(false);
        setIsAuthOpen(false);
        setIsSettingsOpen(false);
        setEditingLog(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isQuickLogOpen,
    setIsQuickLogOpen,
    isCvUploadOpen,
    setIsCvUploadOpen,
    isPasteBulletsOpen,
    setIsPasteBulletsOpen,
    isExperienceModalOpen,
    setIsExperienceModalOpen,
    isProductModalOpen,
    setIsProductModalOpen,
    editingExperience,
    setEditingExperience,
    editingProduct,
    setEditingProduct,
    initialExperienceIdForLog,
    setInitialExperienceIdForLog,
    editingLog,
    setEditingLog,
    isAuthOpen,
    setIsAuthOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isAvatarModalOpen,
    setIsAvatarModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    openQuickLog,
    openEditLog,
    closeQuickLog,
    openAddExperience,
    openEditExperience,
    closeExperienceModal,
    openNewProduct,
    openEditProduct,
    closeProductModal,
    resetAllModals,
  };
};
