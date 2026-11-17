import React from "react";
import { Plus, Target, HelpCircle, Layers, Zap, FileText } from "lucide-react";
import { TimelineViewLocale } from "../../i18n/viewLocales";

type AccordionTheme = "indigo" | "amber" | "cyan" | "emerald" | "purple";

const THEME_STYLES: Record<
  AccordionTheme,
  {
    closedBtn: string;
    plusIcon: string;
    underline: string;
    actionLabel: string;
    openBox: string;
    openLabel: string;
    textarea: string;
  }
> = {
  indigo: {
    closedBtn:
      "border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/20 text-indigo-300",
    plusIcon: "text-indigo-400",
    underline: "decoration-indigo-500/40 group-hover:decoration-indigo-300",
    actionLabel: "text-indigo-400/80 group-hover:text-indigo-200",
    openBox: "from-indigo-950/30 via-slate-900/80 to-slate-900 border-indigo-500/50",
    openLabel: "text-indigo-300",
    textarea: "border-indigo-500/60 focus:border-indigo-400 focus:ring-indigo-400/40",
  },
  amber: {
    closedBtn:
      "border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/20 text-amber-300",
    plusIcon: "text-amber-400",
    underline: "decoration-amber-500/40 group-hover:decoration-amber-300",
    actionLabel: "text-amber-400/80 group-hover:text-amber-200",
    openBox: "from-amber-950/30 via-slate-900/80 to-slate-900 border-amber-500/50",
    openLabel: "text-amber-300",
    textarea: "border-amber-500/60 focus:border-amber-400 focus:ring-amber-400/40",
  },
  cyan: {
    closedBtn:
      "border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-300",
    plusIcon: "text-cyan-400",
    underline: "decoration-cyan-500/40 group-hover:decoration-cyan-300",
    actionLabel: "text-cyan-400/80 group-hover:text-cyan-200",
    openBox: "from-cyan-950/30 via-slate-900/80 to-slate-900 border-cyan-500/50",
    openLabel: "text-cyan-300",
    textarea: "border-cyan-500/60 focus:border-cyan-400 focus:ring-cyan-400/40",
  },
  emerald: {
    closedBtn:
      "border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-950/20 text-emerald-400",
    plusIcon: "text-emerald-400",
    underline: "decoration-emerald-500/40 group-hover:decoration-emerald-400",
    actionLabel: "text-emerald-500/70 group-hover:text-emerald-300",
    openBox: "from-emerald-950/30 via-slate-900/80 to-cyan-950/20 border-emerald-500/50",
    openLabel: "text-emerald-300",
    textarea: "border-emerald-500/60 focus:border-emerald-400 focus:ring-emerald-400/40",
  },
  purple: {
    closedBtn:
      "border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/20 text-purple-300",
    plusIcon: "text-purple-400",
    underline: "decoration-purple-500/40 group-hover:decoration-purple-300",
    actionLabel: "text-purple-400/80 group-hover:text-purple-200",
    openBox: "from-purple-950/30 via-slate-900/80 to-slate-900 border-purple-500/50",
    openLabel: "text-purple-300",
    textarea: "border-purple-500/60 focus:border-purple-400 focus:ring-purple-400/40",
  },
};

interface StructuredAccordionProps {
  theme: AccordionTheme;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  value: string;
  onChange: (val: string) => void;
  closedPreviewPrefix: string;
  closedPlaceholderLabel: string;
  emptyActionText: string;
  openTitle: string;
  icon: React.ReactNode;
  placeholder: string;
  rows: number;
  textareaExtraClass?: string;
  helperContent: React.ReactNode;
}

const StructuredAccordion: React.FC<StructuredAccordionProps> = ({
  theme,
  isOpen,
  onToggle,
  value,
  onChange,
  closedPreviewPrefix,
  closedPlaceholderLabel,
  emptyActionText,
  openTitle,
  icon,
  placeholder,
  rows,
  textareaExtraClass = "",
  helperContent,
}) => {
  const styles = THEME_STYLES[theme];

  return (
    <div>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`w-full text-left py-2.5 px-3.5 rounded-lg border border-dashed transition-all flex items-center justify-between group ${styles.closedBtn}`}
        >
          <div className="flex items-center gap-2 text-xs truncate">
            <Plus className={`w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform ${styles.plusIcon}`} />
            <span className={`font-semibold underline underline-offset-4 truncate ${styles.underline}`}>
              {value
                ? `${closedPreviewPrefix}: "${value.slice(0, 50)}${value.length > 50 ? "..." : ""}"`
                : `+ ${closedPlaceholderLabel}`}
            </span>
          </div>
          <span className={`text-[11px] font-mono shrink-0 ml-2 ${styles.actionLabel}`}>
            {value ? "Editar" : emptyActionText} ▾
          </span>
        </button>
      ) : (
        <div
          className={`space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r border animate-in fade-in duration-150 ${styles.openBox}`}
        >
          <div className="flex items-center justify-between">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${styles.openLabel}`}>
              {icon}
              {openTitle}
            </label>
            <button
              type="button"
              onClick={() => onToggle(false)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Ocultar
            </button>
          </div>
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-slate-900 border rounded-lg px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-y leading-relaxed ${styles.textarea} ${textareaExtraClass}`}
          />
          <p className="text-[11px] text-slate-400">{helperContent}</p>
        </div>
      )}
    </div>
  );
};

interface QuickLogAccordionsProps {
  tl: TimelineViewLocale;
  whatWasSought: string;
  setWhatWasSought: (v: string) => void;
  isWhatSoughtOpen: boolean;
  setIsWhatSoughtOpen: (v: boolean) => void;
  whyImportant: string;
  setWhyImportant: (v: string) => void;
  isWhyImportantOpen: boolean;
  setIsWhyImportantOpen: (v: boolean) => void;
  howApplied: string;
  setHowApplied: (v: string) => void;
  isHowAppliedOpen: boolean;
  setIsHowAppliedOpen: (v: boolean) => void;
  impact: string;
  setImpact: (v: string) => void;
  isImpactOpen: boolean;
  setIsImpactOpen: (v: boolean) => void;
  description: string;
  setDescription: (v: string) => void;
  isDescriptionOpen: boolean;
  setIsDescriptionOpen: (v: boolean) => void;
}

export const QuickLogAccordions: React.FC<QuickLogAccordionsProps> = ({
  tl,
  whatWasSought,
  setWhatWasSought,
  isWhatSoughtOpen,
  setIsWhatSoughtOpen,
  whyImportant,
  setWhyImportant,
  isWhyImportantOpen,
  setIsWhyImportantOpen,
  howApplied,
  setHowApplied,
  isHowAppliedOpen,
  setIsHowAppliedOpen,
  impact,
  setImpact,
  isImpactOpen,
  setIsImpactOpen,
  description,
  setDescription,
  isDescriptionOpen,
  setIsDescriptionOpen,
}) => {
  return (
    <>
      <StructuredAccordion
        theme="indigo"
        isOpen={isWhatSoughtOpen}
        onToggle={setIsWhatSoughtOpen}
        value={whatWasSought}
        onChange={setWhatWasSought}
        closedPreviewPrefix="🎯 Qué se buscaba lograr"
        closedPlaceholderLabel={tl.accordionWhat}
        emptyActionText="Definir"
        openTitle="¿Qué se buscaba lograr?"
        icon={<Target className="w-3.5 h-3.5 text-indigo-400" />}
        rows={3}
        placeholder="¿Cuál era el objetivo inicial, la meta de negocio o el requerimiento que dio origen a este trabajo? (ej. Desacoplar el checkout síncrono para soportar 15,000 rps en Black Friday)..."
        helperContent="Define el problema de negocio o requerimiento inicial que motivó esta iniciativa."
      />

      <StructuredAccordion
        theme="amber"
        isOpen={isWhyImportantOpen}
        onToggle={setIsWhyImportantOpen}
        value={whyImportant}
        onChange={setWhyImportant}
        closedPreviewPrefix="💡 Por qué era importante"
        closedPlaceholderLabel={tl.accordionWhy}
        emptyActionText="Definir"
        openTitle="¿Por qué era importante?"
        icon={<HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
        rows={3}
        placeholder="¿Por qué era crítico resolverlo? (Dolor del cliente, riesgo mitigado, coste de inacción o impacto estratégico para la empresa)..."
        helperContent="Explica el riesgo o valor de negocio en juego si esto no se hubiera implementado."
      />

      <StructuredAccordion
        theme="cyan"
        isOpen={isHowAppliedOpen}
        onToggle={setIsHowAppliedOpen}
        value={howApplied}
        onChange={setHowApplied}
        closedPreviewPrefix="🛠️ Cómo se aplicó"
        closedPlaceholderLabel={tl.accordionHow}
        emptyActionText="Definir"
        openTitle="¿Cómo se aplicó la solución?"
        icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />}
        rows={3}
        placeholder="Estrategia técnica aplicada: arquitectura, patrones de diseño (CQRS, Saga), herramientas, bibliotecas y decisiones de diseño..."
        helperContent="Resume el método técnico y las herramientas empleadas para construir la solución."
      />

      <StructuredAccordion
        theme="emerald"
        isOpen={isImpactOpen}
        onToggle={setIsImpactOpen}
        value={impact}
        onChange={setImpact}
        closedPreviewPrefix="⚡ El impacto"
        closedPlaceholderLabel={tl.impactXyzLabel}
        emptyActionText="Definir"
        openTitle={`${tl.impactXyzLabel} *`}
        icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />}
        rows={2}
        placeholder="ej. Reducción de latencia p99 en 85% (de 2.4s a 180ms) y despliegue exitoso para 10,000+ firmas sin fallos"
        helperContent={
          <>
            <span className="text-emerald-300 font-semibold">Fórmula XYZ de Google:</span> Logró [X] medido por [Y] haciendo [Z]. Expresa el resultado en %, tiempo o volumen.
          </>
        }
      />

      <StructuredAccordion
        theme="purple"
        isOpen={isDescriptionOpen}
        onToggle={setIsDescriptionOpen}
        value={description}
        onChange={setDescription}
        closedPreviewPrefix="📝 Detalle o Descripción"
        closedPlaceholderLabel={tl.accordionDesc}
        emptyActionText="Explayarse"
        openTitle={tl.accordionDesc}
        icon={<FileText className="w-3.5 h-3.5 text-purple-400" />}
        rows={6}
        textareaExtraClass="bg-slate-900/90 rounded-xl px-4 py-3 text-xs text-slate-200 min-h-[145px]"
        placeholder="Aquí podemos explayarnos: pon todo el detalle técnico de lo que se hizo con respecto a este logro. Decisiones de arquitectura, patrones de diseño, optimizaciones de queries, índices creados, trampas de concurrencia superadas, fragmentos conceptuales o lecciones clave..."
        helperContent="Espacio amplio y sin límites para conservar todo el trasfondo técnico para entrevistas, revisiones de arquitectura o recuerdos de diseño."
      />
    </>
  );
};
