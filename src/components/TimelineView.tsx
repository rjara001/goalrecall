import React, { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  CareerGoal,
  CareerGoalStatus,
  LogCategory,
  LogEntry,
  Product,
  TechnicalCertification,
  WorkExperience,
} from "../types";
import { useI18n } from "../i18n";
import { VIEW_LOCALES } from "../i18n/viewLocales";
import { formatFirestoreUiError } from "../utils/firestore/errors";
import {
  buildExtractedBulletSet,
  computeTotalBulletsCount,
  DEFAULT_PRESET_CATEGORIES,
  filterTimelineLogs,
  groupLogsByExperience,
} from "./timeline/timelineUtils";
import { TimelineStatsHeader, TimelineViewMode } from "./timeline/TimelineStatsHeader";
import { TimelineExperiencesTab } from "./timeline/TimelineExperiencesTab";
import { TimelineAchievementsTab } from "./timeline/TimelineAchievementsTab";
import { TimelineProductsTab } from "./timeline/TimelineProductsTab";
import { TimelineCertificationsTab } from "./timeline/TimelineCertificationsTab";
import { TimelineCareerGoalsTab } from "./timeline/TimelineCareerGoalsTab";

interface TimelineViewProps {
  logs: LogEntry[];
  experiences: WorkExperience[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  careerGoals?: CareerGoal[];
  onTogglePublic: (id: string) => Promise<void> | void;
  onToggleIncludeInCv?: (id: string) => Promise<void> | void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => Promise<void> | void;
  onDuplicateLog: (entry: LogEntry) => Promise<void> | void;
  onOpenQuickLog: () => void;
  onOpenPasteBullets: () => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: WorkExperience) => void;
  onDeleteExperience: (id: string) => Promise<void> | void;
  onAddLogToExperience: (experienceId: string) => void;
  onExtractBulletToLog?: (
    experienceId: string,
    company: string,
    role: string,
    bullet: string,
    technologies?: string[]
  ) => Promise<void> | void;
  onExtractAllBulletsForExperience?: (experienceId: string) => Promise<void> | void;
  onOpenNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => Promise<void> | void;
  onToggleProductPublic?: (id: string) => Promise<void> | void;
  onOpenNewCertification?: () => void;
  onEditCertification?: (cert: TechnicalCertification) => void;
  onDeleteCertification?: (id: string) => Promise<void> | void;
  onToggleCertificationPublic?: (id: string) => Promise<void> | void;
  onOpenNewCareerGoal?: () => void;
  onEditCareerGoal?: (goal: CareerGoal) => void;
  onDeleteCareerGoal?: (id: string) => Promise<void> | void;
  onSetCareerGoalStatus?: (id: string, status: CareerGoalStatus) => Promise<void> | void;
  onToggleCareerGoalActionItem?: (goalId: string, itemId: string) => Promise<void> | void;
  onConvertGoalToCertification?: (goal: CareerGoal) => void;
  onConvertGoalToLog?: (goal: CareerGoal) => void;
}

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CERTIFICATIONS: TechnicalCertification[] = [];
const EMPTY_CAREER_GOALS: CareerGoal[] = [];

export const TimelineView: React.FC<TimelineViewProps> = ({
  logs,
  experiences,
  onTogglePublic,
  onToggleIncludeInCv,
  onEditLog,
  onDeleteLog,
  onDuplicateLog,
  onOpenQuickLog,
  onOpenPasteBullets,
  onOpenCvUpload,
  onAddExperience,
  onEditExperience,
  onDeleteExperience,
  onAddLogToExperience,
  onExtractBulletToLog,
  onExtractAllBulletsForExperience,
  products = EMPTY_PRODUCTS,
  certifications = EMPTY_CERTIFICATIONS,
  careerGoals = EMPTY_CAREER_GOALS,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProductPublic,
  onOpenNewCertification,
  onEditCertification,
  onDeleteCertification,
  onToggleCertificationPublic,
  onOpenNewCareerGoal,
  onEditCareerGoal,
  onDeleteCareerGoal,
  onSetCareerGoalStatus,
  onToggleCareerGoalActionItem,
  onConvertGoalToCertification,
  onConvertGoalToLog,
}) => {
  const { language } = useI18n();
  const tl = VIEW_LOCALES[language]?.timeline || VIEW_LOCALES.en.timeline;

  const [viewMode, setViewMode] = useState<TimelineViewMode>("by_experience");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<"Todas" | LogCategory>("Todas");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState<
    "all" | "public_only" | "private_only"
  >("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const runMutation = async (fn: (() => Promise<void> | void) | undefined, fallbackMsg: string) => {
    if (!fn) return;
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(formatFirestoreUiError(err, fallbackMsg));
    }
  };

  const toggleField = (key: string) => {
    setExpandedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clients = useMemo(
    () => Array.from(new Set(logs.map((l) => l.client))).filter(Boolean),
    [logs]
  );
  const allTags = useMemo(
    () => Array.from(new Set(logs.flatMap((l) => l.tags))).filter(Boolean),
    [logs]
  );
  const dynamicCategories = useMemo(() => {
    const fromLogs = logs.map((l) => l.category).filter(Boolean);
    return Array.from(new Set(["Todas", ...DEFAULT_PRESET_CATEGORIES, ...fromLogs])) as Array<
      "Todas" | LogCategory
    >;
  }, [logs]);

  const totalBulletsCount = useMemo(
    () => computeTotalBulletsCount(experiences, logs),
    [experiences, logs]
  );

  const extractedBulletSet = useMemo(() => buildExtractedBulletSet(logs), [logs]);

  const filteredLogs = useMemo(
    () =>
      filterTimelineLogs(logs, {
        search,
        selectedClient,
        selectedCategory,
        selectedTag,
        selectedVisibility,
        dateRange,
      }),
    [logs, search, selectedClient, selectedCategory, selectedTag, selectedVisibility, dateRange]
  );

  const experienceGroups = useMemo(
    () => groupLogsByExperience(experiences, filteredLogs),
    [experiences, filteredLogs]
  );

  const totalPublicCount = logs.filter((l) => l.isPublic).length;
  const totalPrivateCount = logs.filter((l) => !l.isPublic).length;

  return (
    <div className="space-y-6">
      <TimelineStatsHeader
        experiencesCount={experiences.length}
        totalBulletsCount={totalBulletsCount}
        logsCount={logs.length}
        totalPrivateCount={totalPrivateCount}
        totalPublicCount={totalPublicCount}
        productsCount={products.length}
        certificationsCount={certifications.length}
        careerGoalsCount={careerGoals.length}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenCvUpload={onOpenCvUpload}
        onAddExperience={onAddExperience}
        onOpenQuickLog={onOpenQuickLog}
        onOpenNewProduct={onOpenNewProduct}
        onOpenNewCertification={onOpenNewCertification}
        onOpenNewCareerGoal={onOpenNewCareerGoal}
      />

      {actionError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-950/70 border border-red-700/70 text-red-200 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] font-semibold text-red-300 hover:text-white shrink-0"
          >
            Ocultar
          </button>
        </div>
      )}

      {viewMode === "by_experience" && (
        <TimelineExperiencesTab
          experiences={experiences}
          logs={logs}
          totalBulletsCount={totalBulletsCount}
          extractedBulletSet={extractedBulletSet}
          tl={tl}
          onOpenPasteBullets={onOpenPasteBullets}
          onOpenCvUpload={onOpenCvUpload}
          onAddExperience={onAddExperience}
          onEditExperience={onEditExperience}
          onDeleteExperience={(id) =>
            void runMutation(() => onDeleteExperience(id), "No se pudo eliminar la experiencia.")
          }
          onAddLogToExperience={onAddLogToExperience}
          onEditLog={onEditLog}
          onToggleIncludeInCv={
            onToggleIncludeInCv
              ? (id) =>
                  void runMutation(
                    () => onToggleIncludeInCv(id),
                    "No se pudo actualizar la inclusión en CV."
                  )
              : undefined
          }
          onExtractBulletToLog={
            onExtractBulletToLog
              ? (expId, company, role, bullet, technologies) =>
                  void runMutation(
                    () => onExtractBulletToLog(expId, company, role, bullet, technologies),
                    "No se pudo guardar la viñeta en Firestore."
                  )
              : undefined
          }
          onExtractAllBulletsForExperience={
            onExtractAllBulletsForExperience
              ? (expId) =>
                  void runMutation(
                    () => onExtractAllBulletsForExperience(expId),
                    "No se pudieron extraer las viñetas a Firestore."
                  )
              : undefined
          }
          onJumpToCompanyLogs={(company) => {
            setSelectedClient(company);
            setViewMode("achievements");
          }}
        />
      )}

      {viewMode === "achievements" && (
        <TimelineAchievementsTab
          logs={logs}
          filteredLogs={filteredLogs}
          experiences={experiences}
          clients={clients}
          allTags={allTags}
          dynamicCategories={dynamicCategories}
          experienceGroups={experienceGroups}
          search={search}
          setSearch={setSearch}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedVisibility={selectedVisibility}
          setSelectedVisibility={setSelectedVisibility}
          dateRange={dateRange}
          setDateRange={setDateRange}
          expandedFields={expandedFields}
          onToggleField={toggleField}
          tl={tl}
          onGoToExperiencesTab={() => setViewMode("by_experience")}
          onOpenQuickLog={onOpenQuickLog}
          onAddLogToExperience={onAddLogToExperience}
          onTogglePublic={(id) =>
            void runMutation(
              () => onTogglePublic(id),
              "No se pudo actualizar la visibilidad del logro."
            )
          }
          onToggleIncludeInCv={
            onToggleIncludeInCv
              ? (id) =>
                  void runMutation(
                    () => onToggleIncludeInCv(id),
                    "No se pudo actualizar la inclusión en CV."
                  )
              : undefined
          }
          onEditLog={onEditLog}
          onDeleteLog={(id) =>
            void runMutation(() => onDeleteLog(id), "No se pudo eliminar el logro.")
          }
          onDuplicateLog={(entry) =>
            void runMutation(() => onDuplicateLog(entry), "No se pudo duplicar el logro.")
          }
        />
      )}

      {viewMode === "products" && (
        <TimelineProductsTab
          products={products}
          logs={logs}
          onOpenNewProduct={onOpenNewProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={
            onDeleteProduct
              ? (id) =>
                  void runMutation(() => onDeleteProduct(id), "No se pudo eliminar el producto.")
              : undefined
          }
          onToggleProductPublic={
            onToggleProductPublic
              ? (id) =>
                  void runMutation(
                    () => onToggleProductPublic(id),
                    "No se pudo actualizar la visibilidad del producto."
                  )
              : undefined
          }
        />
      )}

      {viewMode === "certifications" && (
        <TimelineCertificationsTab
          certifications={certifications}
          onOpenNewCertification={onOpenNewCertification}
          onEditCertification={onEditCertification}
          onDeleteCertification={
            onDeleteCertification
              ? (id) =>
                  void runMutation(
                    () => onDeleteCertification(id),
                    "No se pudo eliminar la certificación."
                  )
              : undefined
          }
          onToggleCertificationPublic={
            onToggleCertificationPublic
              ? (id) =>
                  void runMutation(
                    () => onToggleCertificationPublic(id),
                    "No se pudo actualizar la visibilidad de la certificación."
                  )
              : undefined
          }
        />
      )}

      {viewMode === "career_goals" && (
        <TimelineCareerGoalsTab
          careerGoals={careerGoals}
          onOpenNewCareerGoal={onOpenNewCareerGoal}
          onEditCareerGoal={onEditCareerGoal}
          onDeleteCareerGoal={
            onDeleteCareerGoal
              ? (id) =>
                  void runMutation(() => onDeleteCareerGoal(id), "No se pudo eliminar el objetivo.")
              : undefined
          }
          onSetCareerGoalStatus={
            onSetCareerGoalStatus
              ? (id, status) =>
                  void runMutation(
                    () => onSetCareerGoalStatus(id, status),
                    "No se pudo actualizar el estado del objetivo."
                  )
              : undefined
          }
          onToggleCareerGoalActionItem={
            onToggleCareerGoalActionItem
              ? (goalId, itemId) =>
                  void runMutation(
                    () => onToggleCareerGoalActionItem(goalId, itemId),
                    "No se pudo actualizar el hito del objetivo."
                  )
              : undefined
          }
          onConvertGoalToCertification={onConvertGoalToCertification}
          onConvertGoalToLog={onConvertGoalToLog}
        />
      )}
    </div>
  );
};
