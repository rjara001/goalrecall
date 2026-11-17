import React, { useMemo, useState } from "react";
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
  onTogglePublic: (id: string) => void;
  onEditLog: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => void;
  onDuplicateLog: (entry: LogEntry) => void;
  onOpenQuickLog: () => void;
  onOpenPasteBullets: () => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: WorkExperience) => void;
  onDeleteExperience: (id: string) => void;
  onAddLogToExperience: (experienceId: string) => void;
  onExtractBulletToLog?: (
    experienceId: string,
    company: string,
    role: string,
    bullet: string,
    technologies?: string[]
  ) => void;
  onExtractAllBulletsForExperience?: (experienceId: string) => void;
  onOpenNewProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onToggleProductPublic?: (id: string) => void;
  onOpenNewCertification?: () => void;
  onEditCertification?: (cert: TechnicalCertification) => void;
  onDeleteCertification?: (id: string) => void;
  onToggleCertificationPublic?: (id: string) => void;
  onOpenNewCareerGoal?: () => void;
  onEditCareerGoal?: (goal: CareerGoal) => void;
  onDeleteCareerGoal?: (id: string) => void;
  onSetCareerGoalStatus?: (id: string, status: CareerGoalStatus) => void;
  onToggleCareerGoalActionItem?: (goalId: string, itemId: string) => void;
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
          onDeleteExperience={onDeleteExperience}
          onAddLogToExperience={onAddLogToExperience}
          onExtractBulletToLog={onExtractBulletToLog}
          onExtractAllBulletsForExperience={onExtractAllBulletsForExperience}
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
          onTogglePublic={onTogglePublic}
          onEditLog={onEditLog}
          onDeleteLog={onDeleteLog}
          onDuplicateLog={onDuplicateLog}
        />
      )}

      {viewMode === "products" && (
        <TimelineProductsTab
          products={products}
          logs={logs}
          onOpenNewProduct={onOpenNewProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onDeleteProduct}
          onToggleProductPublic={onToggleProductPublic}
        />
      )}

      {viewMode === "certifications" && (
        <TimelineCertificationsTab
          certifications={certifications}
          onOpenNewCertification={onOpenNewCertification}
          onEditCertification={onEditCertification}
          onDeleteCertification={onDeleteCertification}
          onToggleCertificationPublic={onToggleCertificationPublic}
        />
      )}

      {viewMode === "career_goals" && (
        <TimelineCareerGoalsTab
          careerGoals={careerGoals}
          onOpenNewCareerGoal={onOpenNewCareerGoal}
          onEditCareerGoal={onEditCareerGoal}
          onDeleteCareerGoal={onDeleteCareerGoal}
          onSetCareerGoalStatus={onSetCareerGoalStatus}
          onToggleCareerGoalActionItem={onToggleCareerGoalActionItem}
          onConvertGoalToCertification={onConvertGoalToCertification}
          onConvertGoalToLog={onConvertGoalToLog}
        />
      )}
    </div>
  );
};
