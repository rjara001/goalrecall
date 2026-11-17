import React, { useEffect, useState } from "react";
import { Award, Calendar, Eye, EyeOff, Link2, ShieldCheck, X } from "lucide-react";
import { TechnicalCertification } from "../types";
import { CertificationPrefillDraft } from "../hooks/useAppModals";

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    cert: Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt"> | TechnicalCertification,
    sourceGoalId?: string
  ) => void;
  certification?: TechnicalCertification | null;
  prefill?: CertificationPrefillDraft | null;
}

const ISSUER_PRESETS = [
  "Amazon Web Services (AWS)",
  "Google Cloud",
  "Microsoft Azure",
  "CNCF / Linux Foundation",
  "HashiCorp",
  "Meta / Coursera",
];

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  certification,
  prefill,
}) => {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (certification) {
      setName(certification.name || "");
      setIssuer(certification.issuer || "");
      setIssueDate(certification.issueDate || "");
      setExpirationDate(certification.expirationDate || "");
      setCredentialId(certification.credentialId || "");
      setCredentialUrl(certification.credentialUrl || "");
      setSkills(certification.skills || []);
      setSummary(certification.summary || "");
      setIsPublic(certification.isPublic ?? true);
    } else if (prefill) {
      setName(prefill.name || "");
      setIssuer(prefill.issuer || "");
      setIssueDate(prefill.issueDate || new Date().toISOString().substring(0, 7));
      setExpirationDate("");
      setCredentialId("");
      setCredentialUrl("");
      setSkills(prefill.skills || []);
      setSummary(prefill.summary || "");
      setIsPublic(true);
    } else {
      setName("");
      setIssuer("");
      setIssueDate(new Date().toISOString().substring(0, 7));
      setExpirationDate("");
      setCredentialId("");
      setCredentialUrl("");
      setSkills([]);
      setSummary("");
      setIsPublic(true);
    }
    setSkillsInput("");
  }, [certification, prefill, isOpen]);

  if (!isOpen) return null;

  const handleAddSkills = () => {
    const clean = skillsInput.trim().replace(/^,+|,+$/g, "");
    if (!clean) return;
    const parts = clean
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSkills((prev) => Array.from(new Set([...prev, ...parts])));
    setSkillsInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !issuer.trim() || !issueDate.trim()) return;

    const basePayload = {
      ...(certification ? { id: certification.id, createdAt: certification.createdAt } : {}),
      userId: certification?.userId,
      name: name.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim(),
      expirationDate: expirationDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      credentialUrl: credentialUrl.trim() || undefined,
      skills,
      summary: summary.trim() || undefined,
      isPublic,
    };

    onSave(
      basePayload as Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt"> | TechnicalCertification,
      prefill?.sourceGoalId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0B111E] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cert-modal-title" className="text-base font-bold text-white">
                {certification
                  ? "Editar Certificación Técnica"
                  : prefill?.sourceGoalId
                  ? "Convertir Objetivo en Certificación"
                  : "Nueva Certificación Técnica"}
              </h2>
              <p className="text-xs text-slate-400">
                Credenciales oficiales y validaciones de arquitectura, cloud o dominio técnico
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Nombre oficial de la certificación *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: AWS Certified Solutions Architect - Professional"
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Organismo emisor *
            </label>
            <input
              type="text"
              required
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Ej: Amazon Web Services (AWS), CNCF / Linux Foundation"
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 font-mono">Emisores frecuentes:</span>
              {ISSUER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIssuer(preset)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                    issuer === preset
                      ? "bg-amber-950/70 text-amber-300 border-amber-700"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fecha de emisión (YYYY-MM o fecha) *</span>
              </label>
              <input
                type="text"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="Ej: 2025-04"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expiración (opcional, vacío si no vence)</span>
              </label>
              <input
                type="text"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                placeholder="Ej: 2028-04"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ID de credencial (Opcional)</span>
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Ej: AWS-PSA-94812"
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>URL de verificación (Credly / Portal)</span>
              </label>
              <input
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://www.credly.com/badges/..."
                className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Habilidades y dominios validados
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkills();
                  }
                }}
                placeholder="Ej: AWS, Distributed Systems, Cloud Security (separa con comas)"
                className="flex-1 bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkills}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700 whitespace-nowrap"
              >
                Agregar
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 text-amber-300 rounded-md"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label={`Quitar ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">
              Resumen de competencias validadas (Opcional)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ej: Diseño de arquitecturas multi-región altamente disponibles, optimización de costos y gobierno IAM."
              className="w-full bg-[#080C14] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-semibold text-white block">
                Visibilidad en Vitrina Pública
              </span>
              <p className="text-[11px] text-slate-400">
                {isPublic
                  ? "Visible para reclutadores en tu Public Deck y enlaces compartidos."
                  : "Guardada solo en tu registro privado hasta que decidas publicarla."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isPublic
                  ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                  : "bg-slate-900 border-slate-700 text-slate-300"
              }`}
            >
              {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isPublic ? "Pública" : "Privada"}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-all"
            >
              {certification ? "Guardar Cambios" : "Guardar Certificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
