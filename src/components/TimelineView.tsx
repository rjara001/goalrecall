import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";
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
import { ParsedExperienceJson } from "../utils/experienceJson";
import { doesLogBelongToExperience } from "../utils/bulletToLogMapper";
import {
  buildExtractedBulletSet,
  computeTotalBulletsCount,
  DEFAULT_PRESET_CATEGORIES,
  filterTimelineLogs,
  getLatestUpdatedLogs,
  getRecentlyEditedLogs,
  groupLogsByExperience,
  RECENT_EDIT_WINDOW_MS,
} from "./timeline/timelineUtils";
import { TimelineStatsHeader, TimelineViewMode } from "./timeline/TimelineStatsHeader";
import { TimelineExperiencesTab } from "./timeline/TimelineExperiencesTab";
import { TimelineAchievementsTab } from "./timeline/TimelineAchievementsTab";
import { TimelineProductsTab } from "./timeline/TimelineProductsTab";
import { TimelineCertificationsTab } from "./timeline/TimelineCertificationsTab";
import { TimelineCareerGoalsTab } from "./timeline/TimelineCareerGoalsTab";
import { TimelineHistoryTab } from "./timeline/TimelineHistoryTab";

interface TimelineViewProps {
  logs: LogEntry[];
  deletedLogs?: LogEntry[];
  experiences: WorkExperience[];
  deletedExperiences?: WorkExperience[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  careerGoals?: CareerGoal[];
  onRestoreDeletedLog?: (id: string) => Promise<unknown> | void;
  onRestoreDeletedExperience?: (id: string) => Promise<unknown> | void;
  onPermanentDeleteLog?: (id: string) => Promise<void> | void;
  onPermanentDeleteExperience?: (id: string) => Promise<void> | void;
  onTogglePublic: (id: string) => Promise<void> | void;
  onToggleIncludeInCv?: (id: string) => Promise<void> | void;
  onReorderLogs?: (
    sourceLogId: string,
    targetLogId: string,
    position: "before" | "after",
    experienceId?: string
  ) => Promise<void> | void;
  onEditLog: (entry: LogEntry) => void;
  onOpenLogHistory?: (entry: LogEntry) => void;
  onDeleteLog: (id: string) => Promise<void> | void;
  onDuplicateLog: (entry: LogEntry) => Promise<void> | void;
  onOpenQuickLog: () => void;
  onOpenPasteBullets: () => void;
  onOpenCvUpload: () => void;
  onAddExperience: () => void;
  onEditExperience: (exp: WorkExperience) => void;
  onOpenExperienceHistory?: (exp: WorkExperience) => void;
  onDeleteExperience: (id: string) => Promise<void> | void;
  onImportExperienceJson?: (
    experienceId: string,
    parsed: ParsedExperienceJson,
    source?: "json_editor" | "json_import"
  ) => Promise<void> | void;
  jsonEditorResetNonce?: number;
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

const EMPTY_LOGS: LogEntry[] = [];
const EMPTY_EXPERIENCES: WorkExperience[] = [];
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CERTIFICATIONS: TechnicalCertification[] = [];
const EMPTY_CAREER_GOALS: CareerGoal[] = [];

export const TimelineView: React.FC<TimelineViewProps> = ({
  logs,
  deletedLogs = EMPTY_LOGS,
  experiences,
  deletedExperiences = EMPTY_EXPERIENCES,
  onRestoreDeletedLog,
  onRestoreDeletedExperience,
  onPermanentDeleteLog,
  onPermanentDeleteExperience,
  onTogglePublic,
  onToggleIncludeInCv,
  onReorderLogs,
  onEditLog,
  onOpenLogHistory,
  onDeleteLog,
  onDuplicateLog,
  onOpenQuickLog,
  onOpenPasteBullets,
  onOpenCvUpload,
  onAddExperience,
  onEditExperience,
  onOpenExperienceHistory,
  onDeleteExperience,
  onImportExperienceJson,
  jsonEditorResetNonce,
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
  const { t, language } = useI18n();
  const tl = VIEW_LOCALES[language]?.timeline || VIEW_LOCALES.en.timeline;

  type PendingDeleteTarget =
    | {
        type: "experience";
        id: string;
        company: string;
        role: string;
        logsCount: number;
        permanent?: boolean;
      }
    | {
        type: "log";
        id: string;
        title: string;
        client?: string;
        permanent?: boolean;
      };

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
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteTarget | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
  }, [logs, deletedLogs, deletedExperiences]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => {
      window.clearInterval(intervalId);
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const focusLogElement = (logId: string) => {
    setHighlightedLogId(logId);
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(() => {
      const target = Array.from(document.querySelectorAll("[data-log-id]")).find(
        (el) => el.getAttribute("data-log-id") === logId
      );
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 70);
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedLogId((current) => (current === logId ? null : current));
    }, 1800);
  };

  const runMutation = async (fn: (() => Promise<void> | void) | undefined, fallbackMsg: string) => {
    if (!fn) return;
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(formatFirestoreUiError(err, fallbackMsg));
    }
  };

  const requestDeleteExperience = (id: string) => {
    const exp = experiences.find((item) => item.id === id);
    if (!exp || exp.isPersonalProjects) return;
    const logsCount = logs.filter((l) => doesLogBelongToExperience(l, exp)).length;
    setActionError(null);
    setPendingDelete({
      type: "experience",
      id: exp.id,
      company: exp.company,
      role: exp.role,
      logsCount,
    });
  };

  const requestDeleteLog = (id: string) => {
    const entry = logs.find((item) => item.id === id);
    if (!entry) return;
    setActionError(null);
    setPendingDelete({
      type: "log",
      id: entry.id,
      title: entry.title || entry.impact || "",
      client: entry.client,
    });
  };

  const requestPermanentDeleteExperience = (exp: WorkExperience) => {
    setActionError(null);
    setPendingDelete({
      type: "experience",
      id: exp.id,
      company: exp.company,
      role: exp.role,
      logsCount: 0,
      permanent: true,
    });
  };

  const requestPermanentDeleteLog = (entry: LogEntry) => {
    setActionError(null);
    setPendingDelete({
      type: "log",
      id: entry.id,
      title: entry.title || entry.impact || "",
      client: entry.client,
      permanent: true,
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || isConfirmingDelete) return;
    setIsConfirmingDelete(true);
    const target = pendingDelete;
    try {
      if (target.type === "experience") {
        if (target.permanent) {
          await runMutation(
            () => onPermanentDeleteExperience?.(target.id),
            "No se pudo eliminar definitivamente la experiencia."
          );
        } else {
          await runMutation(
            () => onDeleteExperience(target.id),
            "No se pudo eliminar la experiencia."
          );
        }
      } else {
        if (target.permanent) {
          await runMutation(
            () => onPermanentDeleteLog?.(target.id),
            "No se pudo eliminar definitivamente el logro."
          );
        } else {
          await runMutation(
            () => onDeleteLog(target.id),
            "No se pudo eliminar el logro."
          );
        }
      }
      setPendingDelete(null);
    } finally {
      setIsConfirmingDelete(false);
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

  const recentlyEditedLogs = useMemo(
    () => getRecentlyEditedLogs(logs, nowMs, RECENT_EDIT_WINDOW_MS, 10),
    [logs, nowMs]
  );

  const fallbackRecentLogs = useMemo(
    () => (recentlyEditedLogs.length === 0 ? getLatestUpdatedLogs(logs, 3) : []),
    [logs, recentlyEditedLogs.length]
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
        deletedHistoryCount={deletedLogs.length + deletedExperiences.length}
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
          nowMs={nowMs}
          tl={tl}
          onOpenPasteBullets={onOpenPasteBullets}
          onOpenCvUpload={onOpenCvUpload}
          onAddExperience={onAddExperience}
          onEditExperience={onEditExperience}
          onOpenExperienceHistory={onOpenExperienceHistory}
          onDeleteExperience={requestDeleteExperience}
          onImportExperienceJson={
            onImportExperienceJson
              ? async (expId, parsed, source) => {
                  setActionError(null);
                  await onImportExperienceJson(expId, parsed, source);
                }
              : undefined
          }
          jsonEditorResetNonce={jsonEditorResetNonce}
          onAddLogToExperience={onAddLogToExperience}
          onEditLog={onEditLog}
          onOpenLogHistory={onOpenLogHistory}
          onDeleteLog={requestDeleteLog}
          onToggleIncludeInCv={
            onToggleIncludeInCv
              ? (id) =>
                  void runMutation(
                    () => onToggleIncludeInCv(id),
                    "No se pudo actualizar la inclusión en CV."
                  )
              : undefined
          }
          onReorderLogs={
            onReorderLogs
              ? (sourceId, targetId, position, expId) =>
                  void runMutation(
                    () => onReorderLogs(sourceId, targetId, position, expId),
                    "No se pudo reordenar el logro."
                  )
              : undefined
          }
          onExtractBulletToLog={
            onExtractBulletToLog
              ? (expId, company, role, bullet, technologies) =>
                  void runMutation(
                    () => onExtractBulletToLog(expId, company, role, bullet, technologies),
                    "No se pudo guardar la viñeta en tu bitácora."
                  )
              : undefined
          }
          onExtractAllBulletsForExperience={
            onExtractAllBulletsForExperience
              ? (expId) =>
                  void runMutation(
                    () => onExtractAllBulletsForExperience(expId),
                    "No se pudieron extraer las viñetas a tu bitácora."
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
          nowMs={nowMs}
          recentlyEditedLogs={recentlyEditedLogs}
          fallbackRecentLogs={fallbackRecentLogs}
          highlightedLogId={highlightedLogId}
          onFocusLog={focusLogElement}
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
          onReorderLogs={
            onReorderLogs
              ? (sourceId, targetId, position, expId) =>
                  void runMutation(
                    () => onReorderLogs(sourceId, targetId, position, expId),
                    "No se pudo reordenar el logro."
                  )
              : undefined
          }
          onEditLog={onEditLog}
          onOpenLogHistory={onOpenLogHistory}
          onDeleteLog={requestDeleteLog}
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

      {viewMode === "history" && (
        <TimelineHistoryTab
          logs={logs}
          deletedLogs={deletedLogs}
          experiences={experiences}
          deletedExperiences={deletedExperiences}
          nowMs={nowMs}
          onRestoreDeletedLog={
            onRestoreDeletedLog
              ? (id) =>
                  runMutation(
                    async () => {
                      await onRestoreDeletedLog(id);
                    },
                    "No se pudo recuperar el logro."
                  )
              : undefined
          }
          onRestoreDeletedExperience={
            onRestoreDeletedExperience
              ? (id) =>
                  runMutation(
                    async () => {
                      await onRestoreDeletedExperience(id);
                    },
                    "No se pudo recuperar la experiencia."
                  )
              : undefined
          }
          onRequestPermanentDeleteLog={
            onPermanentDeleteLog ? requestPermanentDeleteLog : undefined
          }
          onRequestPermanentDeleteExperience={
            onPermanentDeleteExperience ? requestPermanentDeleteExperience : undefined
          }
          onOpenLogHistory={onOpenLogHistory}
          onOpenExperienceHistory={onOpenExperienceHistory}
        />
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-[70] isolate flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          onClick={() => {
            if (!isConfirmingDelete) setPendingDelete(null);
          }}
        >
          <div
            className="w-full max-w-md bg-[#0B0F19] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <h3 id="confirm-delete-title" className="text-sm font-bold text-white">
                  {pendingDelete.permanent
                    ? language === "en"
                      ? "Delete permanently"
                      : "Eliminar definitivamente"
                    : pendingDelete.type === "experience"
                      ? language === "en"
                        ? "Delete experience"
                        : "Eliminar experiencia"
                      : language === "en"
                        ? "Delete achievement"
                        : "Eliminar logro"}
                </h3>
              </div>
              <button
                type="button"
                disabled={isConfirmingDelete}
                onClick={() => setPendingDelete(null)}
                aria-label={t.common.close}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-300 leading-relaxed">
              {pendingDelete.type === "experience" ? (
                <>
                  <p className="text-slate-100 font-medium">
                    {tl.deleteCompanyConfirm(pendingDelete.company)}
                  </p>
                  {pendingDelete.role && (
                    <p className="text-[11px] text-slate-400">{pendingDelete.role}</p>
                  )}
                  {!pendingDelete.permanent && pendingDelete.logsCount > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                      {language === "en"
                        ? `Your ${pendingDelete.logsCount} linked achievement(s) will be kept and reassigned automatically.`
                        : `Se conservarán tus ${pendingDelete.logsCount} logro(s) vinculados y se reasignarán automáticamente a otra experiencia disponible.`}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-slate-100 font-medium">{t.timeline.deleteLogConfirm}</p>
                  {pendingDelete.title && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      {pendingDelete.client && (
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                          {pendingDelete.client}
                        </span>
                      )}
                      <p className="text-xs text-slate-200 line-clamp-3 break-words">
                        {pendingDelete.title}
                      </p>
                    </div>
                  )}
                </>
              )}

              {pendingDelete.permanent ? (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-[11px] text-red-200">
                  {language === "en"
                    ? "This action will permanently remove this record and all of its version history. It cannot be undone."
                    : "Esta acción eliminará permanentemente este registro y todo su historial de versiones. No se puede deshacer."}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-200">
                  {language === "en"
                    ? "It will move to the History tab with its saved versions so you can recover it anytime."
                    : "Se moverá a la pestaña Historial conservando sus versiones guardadas para que puedas recuperarlo cuando quieras."}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isConfirmingDelete}
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={isConfirmingDelete}
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isConfirmingDelete ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isConfirmingDelete
                    ? language === "en"
                      ? "Deleting..."
                      : "Eliminando..."
                    : pendingDelete.permanent
                      ? language === "en"
                        ? "Delete permanently"
                        : "Eliminar definitivamente"
                      : language === "en"
                        ? "Delete"
                        : "Eliminar"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
