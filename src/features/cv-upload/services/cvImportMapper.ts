import {
  CvPendingField,
  ExtractedAchievementItem,
  ExtractedBullet,
  ExtractedCvData,
  LogCategory,
  LogEntry,
  PendingFieldEditingState,
  UserProfile,
  WorkExperience,
} from "../../../types";

export function mapRawAchievementsToBullets(
  rawAchievements: ExtractedAchievementItem[] = []
): ExtractedBullet[] {
  return rawAchievements.map((item, idx) => ({
    id: item.id || `bullet-${Date.now()}-${idx}`,
    client: item.client || "Empresa",
    project: item.project || "Ingeniería",
    category: (item.category as LogCategory) || "Feature ✨",
    title: item.title || "Logro técnico verídico",
    description: item.description || item.title || "",
    impact: item.impact || item.title || "",
    whatWasSought: item.whatWasSought,
    whyImportant: item.whyImportant,
    howApplied: item.howApplied,
    tags: Array.isArray(item.tags) ? item.tags : ["#Ingeniería"],
    xyzScore: item.xyzScore || 80,
    metricHighlight: item.metricHighlight,
    selected: true,
    isEditing: false,
  }));
}

export function computeUpdatedCvField(
  extractedCv: ExtractedCvData,
  pendingFields: CvPendingField[],
  activeFieldEditing: PendingFieldEditingState,
  rawValue: string
): {
  updatedCv: ExtractedCvData;
  newPendingFields: CvPendingField[];
  completenessScore: number;
} {
  const value = rawValue.trim();
  const updatedCv: ExtractedCvData = {
    ...extractedCv,
    contact: { ...extractedCv.contact },
    skills: {
      ...extractedCv.skills,
      technical: [...extractedCv.skills.technical],
    },
    experiences: [...extractedCv.experiences],
    education: [...extractedCv.education],
    certifications: [...extractedCv.certifications],
    languages: [...extractedCv.languages],
  };

  if (activeFieldEditing.section === "contact") {
    const contactKey = activeFieldEditing.fieldName as keyof ExtractedCvData["contact"];
    updatedCv.contact[contactKey] = value;
  } else if (activeFieldEditing.section === "summary") {
    updatedCv.summary = value;
  } else if (activeFieldEditing.section === "skills") {
    const skillsArray = value
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    updatedCv.skills.technical = Array.from(
      new Set([...updatedCv.skills.technical, ...skillsArray])
    );
  } else if (activeFieldEditing.section === "experiences") {
    updatedCv.experiences.push({
      id: `exp-manual-${Date.now()}`,
      company: value.split("-")[0]?.trim() || value,
      role: value.split("-")[1]?.trim() || "Ingeniero",
      bullets: [value],
      technologies: [],
      category: "Feature ✨",
    });
  } else if (activeFieldEditing.section === "education") {
    updatedCv.education.push({
      id: `edu-manual-${Date.now()}`,
      degree: value,
      institution: "",
    });
  } else if (activeFieldEditing.section === "certifications") {
    updatedCv.certifications.push({
      id: `cert-manual-${Date.now()}`,
      name: value,
      issuer: "",
    });
  } else if (activeFieldEditing.section === "languages") {
    updatedCv.languages.push({
      id: `lang-manual-${Date.now()}`,
      language: value,
      level: "Competencia profesional",
    });
  }

  const newPendingFields = pendingFields.filter(
    (p) => p.id !== activeFieldEditing.fieldId
  );
  const totalChecks = 13;
  const completed = Math.max(0, totalChecks - newPendingFields.length);
  const completenessScore = Math.round((completed / totalChecks) * 100);

  return {
    updatedCv,
    newPendingFields,
    completenessScore,
  };
}

export interface BuildWorkspaceImportParams {
  extractedCv: ExtractedCvData;
  selectedBullets: ExtractedBullet[];
  existingExperiences: WorkExperience[];
  currentUser?: UserProfile | null;
  sourceFileName?: string;
}

export interface WorkspaceImportResult {
  updatedUser: UserProfile | null;
  updatedExperiences: WorkExperience[];
  newLogs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[];
}

export function buildWorkspaceImportFromCv({
  extractedCv,
  selectedBullets,
  existingExperiences,
  currentUser,
  sourceFileName,
}: BuildWorkspaceImportParams): WorkspaceImportResult {
  const updatedUser: UserProfile | null = currentUser
    ? {
        ...currentUser,
        name: extractedCv.contact.name || currentUser.name,
        title: extractedCv.contact.headline || currentUser.title,
        email: extractedCv.contact.email || currentUser.email,
        bio: extractedCv.summary || currentUser.bio,
        location: extractedCv.contact.location || currentUser.location,
        linkedin: extractedCv.contact.linkedin || currentUser.linkedin,
        github: extractedCv.contact.github || currentUser.github,
        skills: [
          ...extractedCv.skills.technical.map((s) => ({
            name: s,
            category: "Languages" as const,
          })),
          ...extractedCv.skills.frameworks.map((s) => ({
            name: s,
            category: "Frameworks" as const,
          })),
          ...extractedCv.skills.toolsCloud.map((s) => ({
            name: s,
            category: "Cloud/DevOps" as const,
          })),
        ].slice(0, 15),
      }
    : null;

  const updatedExperiences: WorkExperience[] = existingExperiences.map((exp) => ({
    ...exp,
    bullets: exp.bullets ? [...exp.bullets] : undefined,
    technologies: exp.technologies ? [...exp.technologies] : undefined,
  }));
  const expIdMap = new Map<string, string>();

  if (Array.isArray(extractedCv.experiences)) {
    extractedCv.experiences.forEach((exp) => {
      const companyKey = (exp.company || "").trim().toLowerCase();
      if (!companyKey) return;

      const existing = updatedExperiences.find(
        (e) =>
          e.company.toLowerCase() === companyKey ||
          e.company.toLowerCase().includes(companyKey) ||
          companyKey.includes(e.company.toLowerCase())
      );

      const finalBullets =
        Array.isArray(exp.bullets) && exp.bullets.length > 0
          ? [...exp.bullets]
          : exp.description
            ? [exp.description]
            : [];

      if (existing) {
        expIdMap.set(companyKey, existing.id);
        if (finalBullets.length > 0) {
          existing.bullets = finalBullets;
        }
        if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
          existing.technologies = Array.from(
            new Set([...(existing.technologies || []), ...exp.technologies])
          );
        }
        if (
          exp.description &&
          (!existing.summary || existing.summary.includes("extraída de CV"))
        ) {
          existing.summary = exp.description;
        }
        if (exp.role && (!existing.role || existing.role === "Ingeniero")) {
          existing.role = exp.role;
        }
        if (exp.startDate && !existing.startDate) {
          existing.startDate = exp.startDate;
        }
      } else {
        const newWorkExp: WorkExperience = {
          id:
            exp.id ||
            `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          company: exp.company.trim(),
          role: exp.role?.trim() || "Ingeniero",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          isCurrent: exp.isCurrent || false,
          location: exp.location || "",
          summary:
            exp.description || (finalBullets.length > 0 ? finalBullets[0] : ""),
          bullets: finalBullets,
          technologies: exp.technologies || [],
          isPersonalProjects: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        updatedExperiences.push(newWorkExp);
        expIdMap.set(companyKey, newWorkExp.id);
      }
    });
  }

  const toImport = selectedBullets.filter((b) => b.selected);
  const defaultExpId = updatedExperiences[0]?.id || "exp-personal";
  const today = new Date().toISOString().substring(0, 10);

  const newLogs: Omit<LogEntry, "id" | "createdAt" | "updatedAt">[] = toImport.map(
    (b) => {
      const matchedExpId =
        expIdMap.get(b.client.trim().toLowerCase()) || defaultExpId;
      return {
        experienceId: matchedExpId,
        originalBullet: b.originalText || b.impact || b.title,
        date: today,
        client: b.client.trim() || "Empresa",
        project: b.project.trim() || "Ingeniería",
        category: b.category,
        title: b.title.trim(),
        whatWasSought: b.whatWasSought,
        whyImportant: b.whyImportant,
        howApplied: b.howApplied,
        description:
          b.description ||
          `Extraído de CV verídico (${sourceFileName || "Documento"}).`,
        impact: b.impact.trim(),
        tags: b.tags.length > 0 ? b.tags : ["#CVVerídico", "#Producción"],
        isPublic: false,
        includeInCv: true,
      };
    }
  );

  return {
    updatedUser,
    updatedExperiences,
    newLogs,
  };
}
