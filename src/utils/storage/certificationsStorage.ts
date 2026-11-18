import { TechnicalCertification } from "../../types";
import { workspaceState } from "./workspaceState";

export type CertificationValidityStatus =
  | "active"
  | "expiring_soon"
  | "expired"
  | "no_expiration";

export const getCertificationValidityStatus = (
  expirationDate?: string,
  referenceDate: Date = new Date()
): CertificationValidityStatus => {
  if (!expirationDate || !expirationDate.trim()) return "no_expiration";

  const clean = expirationDate.trim();
  const normalized = /^\d{4}-\d{2}$/.test(clean) ? `${clean}-28` : clean;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "active";

  const diffMs = parsed.getTime() - referenceDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays <= 90) return "expiring_soon";
  return "active";
};

export const getStoredCertifications = (): TechnicalCertification[] => {
  return workspaceState.certifications;
};

export const saveCertifications = (
  certifications: TechnicalCertification[]
): void => {
  workspaceState.certifications = certifications;
};

export const addCertification = (
  cert: Omit<TechnicalCertification, "id" | "createdAt" | "updatedAt">
): TechnicalCertification => {
  const now = Date.now();
  const created: TechnicalCertification = {
    ...cert,
    id: `cert-${now}-${Math.random().toString(36).substring(2, 7)}`,
    isPublic: cert.isPublic ?? true,
    skills: Array.isArray(cert.skills) ? cert.skills : [],
    createdAt: now,
    updatedAt: now,
  };
  saveCertifications([created, ...getStoredCertifications()]);
  return created;
};

export const updateCertification = (updated: TechnicalCertification): void => {
  saveCertifications(
    getStoredCertifications().map((c) =>
      c.id === updated.id ? { ...updated, updatedAt: Date.now() } : c
    )
  );
};

export const deleteCertification = (id: string): void => {
  saveCertifications(getStoredCertifications().filter((c) => c.id !== id));
};

export const toggleCertificationPublic = (
  id: string
): TechnicalCertification | null => {
  const list = getStoredCertifications();
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updated: TechnicalCertification = {
    ...list[index],
    isPublic: !list[index].isPublic,
    updatedAt: Date.now(),
  };
  const next = [...list];
  next[index] = updated;
  saveCertifications(next);
  return updated;
};
