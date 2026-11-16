import React from "react";
import { Award, Briefcase, Check, FileText, GraduationCap, Tag, User } from "lucide-react";
import { ExtractedCvData } from "../../../types";

interface CvRadiographyTabProps {
  extractedCv: ExtractedCvData;
  onUpdateContactField: (key: keyof ExtractedCvData["contact"], value: string) => void;
  onUpdateSummary: (summary: string) => void;
}

const CONTACT_FIELDS: Array<{ key: keyof ExtractedCvData["contact"]; label: string; placeholder: string; type?: string }> = [
  { key: "name", label: "Nombre Completo", placeholder: "Nombre del candidato" },
  { key: "headline", label: "Titular Profesional", placeholder: "ej: Senior Systems Architect" },
  { key: "email", label: "Correo Electrónico", placeholder: "correo@ejemplo.com", type: "email" },
  { key: "phone", label: "Teléfono / WhatsApp", placeholder: "ej: +56 9 1234 5678" },
  { key: "location", label: "Ubicación / Modalidad", placeholder: "ej: Santiago, Chile / Remoto" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/usuario" },
];

export const CvRadiographyTab: React.FC<CvRadiographyTabProps> = ({ extractedCv, onUpdateContactField, onUpdateSummary }) => {
  const allSkills = [...extractedCv.skills.technical, ...extractedCv.skills.frameworks, ...extractedCv.skills.toolsCloud];
  const totalBullets = extractedCv.experiences.reduce((acc, e) => acc + (e.bullets?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2"><User className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Identidad & Contacto</h5></div>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Datos Reales</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CONTACT_FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{label}</label>
              <input
                type={type || "text"}
                value={extractedCv.contact[key]}
                onChange={(e) => onUpdateContactField(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3"><FileText className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resumen Profesional (Sobre Mí)</h5></div>
        <textarea
          rows={3}
          value={extractedCv.summary}
          onChange={(e) => onUpdateSummary(e.target.value)}
          placeholder="Resumen del candidato no detectado en el documento..."
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Experiencia Laboral ({extractedCv.experiences.length})</h5></div>
          <span className="text-[11px] text-slate-400">{totalBullets} viñetas reales</span>
        </div>
        <div className="space-y-4">
          {extractedCv.experiences.map((exp, idx) => (
            <div key={exp.id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2"><span className="font-bold text-sm text-white">{exp.role}</span><span className="text-xs text-purple-400">@ {exp.company}</span></div>
                <span className="text-xs font-mono text-slate-400">{exp.startDate || ""} {exp.endDate ? `— ${exp.endDate}` : ""}</span>
              </div>
              <ul className="space-y-1.5 mt-2">
                {exp.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-purple-400 mt-1">•</span><span>{b}</span></li>
                ))}
              </ul>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.technologies.map((tech, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3"><Tag className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Habilidades Técnicas & Stack</h5></div>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((s, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-xs font-mono text-purple-200">{s}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2"><GraduationCap className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Educación ({extractedCv.education.length})</h5></div>
          {extractedCv.education.length === 0 ? (
            <p className="text-xs text-amber-400/80 italic">No especificada en el CV.</p>
          ) : (
            extractedCv.education.map((edu, idx) => (
              <div key={idx} className="text-xs"><p className="font-semibold text-white">{edu.degree}</p><p className="text-slate-400">{edu.institution} {edu.year ? `(${edu.year})` : ""}</p></div>
            ))
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2"><Award className="w-4 h-4 text-purple-400" /><h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Certificaciones ({extractedCv.certifications.length})</h5></div>
          {extractedCv.certifications.length === 0 ? (
            <p className="text-xs text-amber-400/80 italic">No detectadas en el documento.</p>
          ) : (
            extractedCv.certifications.map((c, idx) => (
              <div key={idx} className="text-xs"><p className="font-semibold text-white">{c.name}</p><p className="text-slate-400">{c.issuer} {c.year ? `(${c.year})` : ""}</p></div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
