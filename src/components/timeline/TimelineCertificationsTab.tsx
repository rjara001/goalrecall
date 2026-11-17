import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { TechnicalCertification } from "../../types";
import {
  CertificationValidityStatus,
  getCertificationValidityStatus,
} from "../../utils/storage/certificationsStorage";

interface TimelineCertificationsTabProps {
  certifications: TechnicalCertification[];
  onOpenNewCertification?: () => void;
  onEditCertification?: (cert: TechnicalCertification) => void;
  onDeleteCertification?: (id: string) => void;
  onToggleCertificationPublic?: (id: string) => void;
}

type CertFilter =
  | "all"
  | "active"
  | "expiring_soon"
  | "expired"
  | "public_only"
  | "private_only";

const VALIDITY_META: Record<
  CertificationValidityStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "Vigente",
    className: "text-emerald-300 border-emerald-800/70 bg-emerald-950/60",
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  },
  expiring_soon: {
    label: "Por vencer",
    className: "text-amber-300 border-amber-800/70 bg-amber-950/60",
    icon: <Clock className="w-3 h-3 text-amber-400" />,
  },
  expired: {
    label: "Vencida",
    className: "text-rose-300 border-rose-800/70 bg-rose-950/60",
    icon: <AlertTriangle className="w-3 h-3 text-rose-400" />,
  },
  no_expiration: {
    label: "Sin vencimiento",
    className: "text-cyan-300 border-cyan-800/70 bg-cyan-950/60",
    icon: <CheckCircle2 className="w-3 h-3 text-cyan-400" />,
  },
};

export const TimelineCertificationsTab: React.FC<TimelineCertificationsTabProps> = ({
  certifications,
  onOpenNewCertification,
  onEditCertification,
  onDeleteCertification,
  onToggleCertificationPublic,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CertFilter>("all");

  const filteredCertifications = useMemo(() => {
    const q = search.trim().toLowerCase();
    return certifications.filter((cert) => {
      const validity = getCertificationValidityStatus(cert.expirationDate);
      if (filter === "active" && validity !== "active" && validity !== "no_expiration") {
        return false;
      }
      if (filter === "expiring_soon" && validity !== "expiring_soon") return false;
      if (filter === "expired" && validity !== "expired") return false;
      if (filter === "public_only" && !cert.isPublic) return false;
      if (filter === "private_only" && cert.isPublic) return false;

      if (!q) return true;
      const hay = [
        cert.name,
        cert.issuer,
        cert.credentialId || "",
        cert.summary || "",
        ...(cert.skills || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [certifications, filter, search]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Certificaciones Técnicas & Credenciales Oficiales</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Valida conocimientos especializados con enlaces verificables y vigencias controladas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar certificación, emisor o skill..."
              className="bg-[#080C14] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-60"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CertFilter)}
            className="bg-[#080C14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas ({certifications.length})</option>
            <option value="active">Vigentes</option>
            <option value="expiring_soon">Por vencer (90d)</option>
            <option value="expired">Vencidas</option>
            <option value="public_only">Solo Públicas</option>
            <option value="private_only">Solo Privadas</option>
          </select>

          {onOpenNewCertification && (
            <button
              type="button"
              onClick={onOpenNewCertification}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Certificación</span>
            </button>
          )}
        </div>
      </div>

      {filteredCertifications.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20 space-y-3">
          <Award className="w-8 h-8 text-amber-400/80 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              {certifications.length === 0
                ? "Aún no has registrado certificaciones técnicas"
                : "No hay certificaciones que coincidan con el filtro"}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Registra tus credenciales de AWS, GCP, CNCF, seguridad o especializaciones con URL oficial para destacarlas en tu Public Deck.
            </p>
          </div>
          {certifications.length === 0 && onOpenNewCertification && (
            <button
              type="button"
              onClick={onOpenNewCertification}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Primera Certificación</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCertifications.map((cert) => {
            const validity = getCertificationValidityStatus(cert.expirationDate);
            const meta = VALIDITY_META[validity];
            return (
              <div
                key={cert.id}
                className="p-5 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${meta.className}`}
                        >
                          {meta.icon}
                          <span>{meta.label}</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${
                            cert.isPublic
                              ? "text-emerald-300 border-emerald-800/60 bg-emerald-950/60"
                              : "text-slate-300 border-slate-700 bg-slate-800/80"
                          }`}
                        >
                          {cert.isPublic ? (
                            <Eye className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{cert.isPublic ? "Pública" : "Privada"}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {cert.name}
                      </h4>
                      <p className="text-xs text-amber-300/90 font-medium">{cert.issuer}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onToggleCertificationPublic && (
                        <button
                          type="button"
                          onClick={() => onToggleCertificationPublic(cert.id)}
                          title={cert.isPublic ? "Ocultar de Public Deck" : "Mostrar en Public Deck"}
                          className="p-1.5 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          {cert.isPublic ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {onEditCertification && (
                        <button
                          type="button"
                          onClick={() => onEditCertification(cert)}
                          title="Editar certificación"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteCertification && (
                        <button
                          type="button"
                          onClick={() => onDeleteCertification(cert.id)}
                          title="Eliminar certificación"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-slate-400">
                    <span>Emitida: {cert.issueDate}</span>
                    {cert.expirationDate && <span>· Expira: {cert.expirationDate}</span>}
                    {cert.credentialId && <span>· ID: {cert.credentialId}</span>}
                  </div>

                  {cert.summary && (
                    <p className="text-xs text-slate-300 leading-relaxed">{cert.summary}</p>
                  )}

                  {cert.skills && cert.skills.length > 0 && (
                    <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                      {cert.skills.join(" · ")}
                    </p>
                  )}
                </div>

                {cert.credentialUrl && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                    <a
                      href={
                        cert.credentialUrl.startsWith("http")
                          ? cert.credentialUrl
                          : `https://${cert.credentialUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verificar credencial</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
