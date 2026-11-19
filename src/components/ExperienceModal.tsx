import React, { useState, useEffect } from "react";
import {
  X,
  Building,
  Briefcase,
  Calendar,
  MapPin,
  Tag,
  Check,
  FolderGit2,
  Plus,
  Compass,
  ListPlus,
  Layers,
  EyeOff,
  Eye,
  Trash2,
  ClipboardPaste,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  Link2,
} from "lucide-react";
import { WorkExperience, LogEntry } from "../types";
import { useI18n } from "../i18n";
import { MODALS_LOCALES } from "../i18n/modalsLocales";
import { formatFirestoreUiError } from "../utils/firestore/errors";
import {
  cleanLegacyBulletText,
  findLegacyUnlinkedBullets,
  getExperienceChildLogs,
  isLogIncludedInCv,
} from "../utils/bulletToLogMapper";

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string },
    bulletsToCreate?: string[],
    editedLogs?: LogEntry[]
  ) => Promise<void> | void;
  initialData?: WorkExperience | null;
  existingLogs?: LogEntry[];
}

interface ExperienceBulletDraftRow {
  key: string;
  log?: LogEntry;
  text: string;
  includeInCv: boolean;
  isLegacyUnlinked?: boolean;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingLogs = [],
}) => {
  const { t, language } = useI18n();
  const ml = MODALS_LOCALES[language]?.experienceModal || MODALS_LOCALES.en.experienceModal;

  // Main priority fields
  const [summary, setSummary] = useState("");
  const [bulletRows, setBulletRows] = useState<ExperienceBulletDraftRow[]>([]);
  const [showHiddenDrawer, setShowHiddenDrawer] = useState(false);

  // Quick multi-line paste box
  const [isPasteHelperOpen, setIsPasteHelperOpen] = useState(false);
  const [pasteBuffer, setPasteBuffer] = useState("");

  // Optional metadata fields (hidden in accordions)
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [isPersonalProjects, setIsPersonalProjects] = useState(false);

  // Accordion open/close states
  const [isCompanyRoleOpen, setIsCompanyRoleOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isLocationTechOpen, setIsLocationTechOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setCompany(initialData.company || "");
      setRole(initialData.role || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setIsCurrent(initialData.isCurrent || false);
      setLocation(initialData.location || "");
      setSummary(initialData.summary || "");
      setTechnologies(initialData.technologies || []);
      setIsPersonalProjects(initialData.isPersonalProjects || false);

      const childLogs = getExperienceChildLogs(initialData, existingLogs);
      const legacyUnlinked = findLegacyUnlinkedBullets(initialData, childLogs);

      const initialRows: ExperienceBulletDraftRow[] = [
        ...childLogs.map((log) => ({
          key: `log-${log.id}`,
          log,
          text: (log.title || log.logro || log.impact || "").trim(),
          includeInCv: isLogIncludedInCv(log),
        })),
        ...legacyUnlinked.map((text, idx) => ({
          key: `legacy-${idx}-${text.slice(0, 16)}`,
          text,
          includeInCv: true,
          isLegacyUnlinked: true,
        })),
      ];

      setBulletRows(
        initialRows.length > 0
          ? initialRows
          : [{ key: `new-${Date.now()}`, text: "", includeInCv: true }]
      );
    } else {
      setCompany("");
      setRole("");
      setStartDate(new Date().getFullYear().toString());
      setEndDate("");
      setIsCurrent(true);
      setLocation("Remoto");
      setSummary("");
      setBulletRows([{ key: `new-${Date.now()}`, text: "", includeInCv: true }]);
      setTechnologies(["TypeScript", "React", "Node.js"]);
      setIsPersonalProjects(false);
    }

    setShowHiddenDrawer(false);
    setIsPasteHelperOpen(false);
    setPasteBuffer("");
    setIsCompanyRoleOpen(false);
    setIsDatesOpen(false);
    setIsLocationTechOpen(false);
    setIsSaving(false);
    setSaveError(null);
  }, [initialData, isOpen, existingLogs]);

  if (!isOpen) return null;

  const handleAddTech = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    if (e) e.preventDefault();

    const clean = techInput.trim();
    if (!clean) return;

    if (!technologies.includes(clean)) {
      setTechnologies([...technologies, clean]);
    }
    setTechInput("");
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const handleAddRow = () => {
    setBulletRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: "",
        includeInCv: true,
      },
    ]);
  };

  const handleUpdateRowText = (key: string, nextText: string) => {
    setBulletRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, text: nextText } : row))
    );
  };

  const handleToggleRowIncludeInCv = (key: string, nextVal: boolean) => {
    setBulletRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, includeInCv: nextVal } : row))
    );
  };

  const handleRemoveDraftRow = (key: string) => {
    setBulletRows((prev) => prev.filter((row) => row.key !== key));
  };

  const handleApplyPasteLines = () => {
    const parsedLines = pasteBuffer
      .split(/\n+/)
      .map((line) => cleanLegacyBulletText(line))
      .filter((line) => line.length > 3);

    if (parsedLines.length === 0) return;

    setBulletRows((prev) => {
      const cleanedPrev = prev.filter((r) => r.log || r.text.trim().length > 0);
      const added: ExperienceBulletDraftRow[] = parsedLines.map((line, idx) => ({
        key: `paste-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        text: line,
        includeInCv: true,
      }));
      return [...cleanedPrev, ...added];
    });
    setPasteBuffer("");
    setIsPasteHelperOpen(false);
  };

  const activeRows = bulletRows.filter((row) => row.includeInCv);
  const hiddenRows = bulletRows.filter((row) => !row.includeInCv && Boolean(row.log));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    const cleanCompany =
      company.trim() ||
      (isPersonalProjects ? "Proyectos Personales & Consultoría" : "Experiencia Profesional");
    const cleanRole = role.trim() || "Ingeniero / Desarrollador de Software";

    const editedLogs: LogEntry[] = [];
    const bulletsToCreate: string[] = [];
    const projectedBullets: string[] = [];

    bulletRows.forEach((row) => {
      const cleanText = cleanLegacyBulletText(row.text);
      if (row.log) {
        const finalTitle = cleanText || row.log.title;
        if (row.includeInCv && finalTitle) {
          projectedBullets.push(finalTitle);
        }
        const titleChanged = finalTitle !== row.log.title;
        const cvFlagChanged = row.includeInCv !== isLogIncludedInCv(row.log);
        const clientChanged = row.log.client !== cleanCompany;
        if (titleChanged || cvFlagChanged || clientChanged) {
          editedLogs.push({
            ...row.log,
            title: finalTitle,
            logro: finalTitle,
            client: cleanCompany,
            includeInCv: row.includeInCv,
          });
        }
      } else if (cleanText.length > 3 && row.includeInCv) {
        bulletsToCreate.push(cleanText);
        projectedBullets.push(cleanText);
      }
    });

    const expData: Omit<WorkExperience, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      id: initialData?.id,
      company: cleanCompany,
      role: cleanRole,
      startDate: startDate.trim(),
      endDate: isCurrent ? "" : endDate.trim(),
      isCurrent,
      location: location.trim(),
      summary: summary.trim(),
      bullets: projectedBullets,
      technologies,
      isPersonalProjects,
    };

    try {
      await onSave(expData, bulletsToCreate, editedLogs);
      onClose();
    } catch (err) {
      setSaveError(
        formatFirestoreUiError(err, "No se pudo guardar la experiencia en Firestore.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const activeFilledCount = activeRows.filter((r) => cleanLegacyBulletText(r.text).length > 3).length;

  return (
    <div className="fixed inset-0 z-[60] isolate flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0D121F] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              {isPersonalProjects ? (
                <FolderGit2 className="w-4 h-4" />
              ) : (
                <Building className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialData ? t.modals.experienceEditTitle : t.modals.experienceTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label={t.common.close}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {saveError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/70 border border-red-700/70 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* 1. Misión & Contexto General del Rol */}
          <div className="space-y-1.5 p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-cyan-300 text-xs">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{ml.missionHeader}</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400 tabular-nums">
                Contexto del rol
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{ml.missionDesc}</p>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ej. Lideré el equipo core de pagos y checkout asegurando 99.99% de disponibilidad..."
              className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
            />
          </div>

          {/* 2. Viñetas & Logros Vinculados (Bidireccional) */}
          <div className="space-y-3 p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                  <ListPlus className="w-4 h-4 text-emerald-400" />
                  <span>Viñetas en CV · Logros Vinculados</span>
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cada viñeta nace de un logro en tu Bitácora. Editar el texto aquí actualiza el
                  título del logro automáticamente y viceversa.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 tabular-nums shrink-0">
                {activeFilledCount} en CV · {hiddenRows.length} solo en Bitácora
              </span>
            </div>

            {/* Interactive Bullet Rows */}
            <div className="space-y-2">
              {activeRows.map((row) => {
                const isLinked = Boolean(row.log);
                return (
                  <div
                    key={row.key}
                    className="p-2.5 rounded-xl bg-[#080C14] border border-slate-800 focus-within:border-cyan-500/60 transition-colors space-y-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-400 font-bold text-base leading-none mt-1.5 select-none">
                        •
                      </span>
                      <textarea
                        rows={2}
                        value={row.text}
                        onChange={(e) => handleUpdateRowText(row.key, e.target.value)}
                        placeholder="Ej. Reduje la latencia p95 en 60% optimizando consultas e implementando caché Redis..."
                        className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs leading-relaxed resize-y"
                      />
                    </div>

                    <div className="flex items-center justify-between pl-4 pt-1 border-t border-slate-800/70 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-mono text-slate-400">
                        {isLinked ? (
                          <>
                            <Link2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Logro vinculado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 text-cyan-400" />
                            <span className="text-cyan-300">
                              {row.isLegacyUnlinked
                                ? "Se vinculará a Bitácora al guardar"
                                : "Creará logro en Bóveda Privada"}
                            </span>
                          </>
                        )}
                      </span>

                      {isLinked ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRowIncludeInCv(row.key, false)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors font-medium"
                          title="Ocultar del CV sin borrar el logro ni sus detalles STAR en Bitácora"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Quitar del CV</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftRow(row.key)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar viñeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {activeRows.length === 0 && (
                <div className="p-3 rounded-xl border border-dashed border-slate-800 text-center text-slate-400 text-[11px]">
                  No hay viñetas activas en CV para esta experiencia.
                </div>
              )}
            </div>

            {/* Row Actions: + Add Bullet & Paste multiple */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir viñeta / logro</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPasteHelperOpen(!isPasteHelperOpen)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pegar varias líneas</span>
              </button>
            </div>

            {isPasteHelperOpen && (
              <div className="p-3 rounded-xl bg-[#080C14] border border-cyan-800/50 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-300 font-medium">
                  Pega varias viñetas (una por línea) para convertirlas en filas editables:
                </p>
                <textarea
                  rows={3}
                  value={pasteBuffer}
                  onChange={(e) => setPasteBuffer(e.target.value)}
                  placeholder="• Reduje costos de cloud en 25% migrando workers a Spot instances.&#10;• Diseñé pipeline CI/CD reduciendo deploys de 40m a 6m."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasteHelperOpen(false);
                      setPasteBuffer("");
                    }}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyPasteLines}
                    disabled={!pasteBuffer.trim()}
                    className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-[11px]"
                  >
                    Agregar filas
                  </button>
                </div>
              </div>
            )}

            {/* Hidden from CV (Bitácora only) collapsible drawer */}
            {hiddenRows.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowHiddenDrawer(!showHiddenDrawer)}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1"
                >
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    {showHiddenDrawer ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Ocultos del CV — solo en Bitácora ({hiddenRows.length})</span>
                  </span>
                  <span className="font-mono text-cyan-400">
                    {showHiddenDrawer ? "Ocultar" : "Mostrar"}
                  </span>
                </button>

                {showHiddenDrawer && (
                  <div className="mt-2 space-y-2">
                    {hiddenRows.map((row) => (
                      <div
                        key={row.key}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3"
                      >
                        <p className="text-[11px] text-slate-400 leading-relaxed flex-1">
                          {row.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleToggleRowIncludeInCv(row.key, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-semibold shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Incluir en CV</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. ACORDEÓN OPCIONAL 1: Empresa / Organización & Rol Técnico (+) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {!isCompanyRoleOpen ? (
              <button
                type="button"
                onClick={() => setIsCompanyRoleOpen(true)}
                className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                    {company || role
                      ? `${company || "Empresa"} · ${role || "Rol Profesional"}`
                      : `+ ${ml.optionalCompanyHeader} (Opcional)`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                  {company || role ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="p-4 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    {ml.optionalCompanyHeader}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCompanyRoleOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                      Empresa / Organización (Opcional)
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="ej. Pozo Monte, Mercado Libre, Stripe"
                        className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                      Rol / Cargo Profesional (Opcional)
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="ej. Staff Engineer, Growth Lead"
                        className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-200 text-[11px]">Tipo de Entidad</p>
                    <p className="text-[10px] text-slate-400">
                      {isPersonalProjects
                        ? "Proyectos personales, consultoría independiente o experimentos"
                        : "Empresa u organización formal"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPersonalProjects(!isPersonalProjects)}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-colors flex items-center gap-1.5 ${
                      isPersonalProjects
                        ? "bg-purple-950/60 border-purple-600/60 text-purple-200"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    {isPersonalProjects ? (
                      <FolderGit2 className="w-3 h-3 text-purple-400" />
                    ) : (
                      <Building className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>{isPersonalProjects ? "Proyecto Personal" : "Empresa Formal"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. ACORDEÓN OPCIONAL 2: Fechas */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {!isDatesOpen ? (
              <button
                type="button"
                onClick={() => setIsDatesOpen(true)}
                className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                    {startDate || endDate || isCurrent
                      ? `Fechas: ${startDate || "—"} a ${isCurrent ? "Actualidad" : endDate || "—"}`
                      : `+ ${ml.datesHeader} (Opcional)`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                  {startDate || endDate || isCurrent ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Fechas & Período
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDatesOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                      Fecha Inicio (Opcional)
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="ej. 2026 o 2022-03"
                        className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-slate-400 text-[11px]">
                        Fecha Fin (Opcional)
                      </label>
                      <label className="flex items-center gap-1 text-[11px] text-cyan-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCurrent}
                          onChange={(e) => setIsCurrent(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-[#080C14]"
                        />
                        <span>Actual</span>
                      </label>
                    </div>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        disabled={isCurrent}
                        value={isCurrent ? "Actualidad" : endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder={isCurrent ? "Actualidad" : "ej. 2026 o 2024-06"}
                        className={`w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs ${
                          isCurrent ? "opacity-60 cursor-not-allowed bg-slate-900" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. ACORDEÓN OPCIONAL 3: Ubicación & Stack Tecnológico */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {!isLocationTechOpen ? (
              <button
                type="button"
                onClick={() => setIsLocationTechOpen(true)}
                className="w-full text-left py-2.5 px-3.5 hover:bg-slate-800/50 text-slate-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-xs truncate">
                  <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-300 group-hover:text-white truncate">
                    {location || technologies.length > 0
                      ? `${location || "Ubicación"} · ${technologies.length} herramientas`
                      : `+ ${ml.toolsHeader} (Opcional)`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400/80 group-hover:text-cyan-200 shrink-0 ml-2">
                  {location || technologies.length > 0 ? "Editar" : "Definir"} ▾
                </span>
              </button>
            ) : (
              <div className="p-4 space-y-3.5 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    {ml.toolsHeader}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocationTechOpen(false)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Ocultar
                  </button>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                    Ubicación / Modalidad (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ej. Remoto / Santiago, Chile / Híbrido"
                      className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1 text-[11px]">
                    Herramientas, Canales & Habilidades Asociadas (Opcional)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={handleAddTech}
                        placeholder="ej. HubSpot, Python, Figma (Enter)"
                        className="w-full bg-[#080C14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
                    >
                      Añadir
                    </button>
                  </div>

                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg">
                      {technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono text-[11px]"
                        >
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="text-cyan-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-xs disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20 text-xs flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {isSaving
                  ? "Sincronizando Firestore..."
                  : "Guardar Experiencia y Sincronizar"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
