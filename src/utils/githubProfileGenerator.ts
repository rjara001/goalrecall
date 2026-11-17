import {
  LogEntry,
  Product,
  TechnicalCertification,
  UserProfile,
} from "../types";

export interface GitHubProfileExportOptions {
  includeTopLogs: boolean;
  maxTopLogs: number;
  includeCertifications: boolean;
  includeProducts: boolean;
  badgeStyle: "live_svg" | "shields";
  includeFirstMateCta: boolean;
}

export const DEFAULT_GITHUB_EXPORT_OPTIONS: GitHubProfileExportOptions = {
  includeTopLogs: true,
  maxTopLogs: 3,
  includeCertifications: true,
  includeProducts: true,
  badgeStyle: "shields",
  includeFirstMateCta: true,
};

export function resolvePublicHandle(user: UserProfile): string {
  const candidate =
    user.username ||
    (user.email ? user.email.split("@")[0] : "") ||
    user.name ||
    "usuario";
  const cleaned = candidate
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return cleaned.length >= 2 ? cleaned : "usuario";
}

function hasQuantitativeSignal(text?: string): boolean {
  if (!text) return false;
  return /\d|%|\bms\b|\bx\b|\bsla\b|\bp9[059]\b/i.test(text);
}

export function selectTopPublicLogs(
  logs: LogEntry[],
  limit = 3
): LogEntry[] {
  const publicLogs = logs.filter((l) => l.isPublic === true);
  return [...publicLogs]
    .sort((a, b) => {
      const aQuant = hasQuantitativeSignal(a.impact) ? 1 : 0;
      const bQuant = hasQuantitativeSignal(b.impact) ? 1 : 0;
      if (aQuant !== bQuant) return bQuant - aQuant;

      const dateCompare = (b.date || "").localeCompare(a.date || "");
      if (dateCompare !== 0) return dateCompare;

      return (b.updatedAt || 0) - (a.updatedAt || 0);
    })
    .slice(0, Math.max(0, limit));
}

function escapeShieldsSegment(value: string): string {
  return encodeURIComponent(
    value
      .trim()
      .replace(/-/g, "--")
      .replace(/_/g, "__")
  );
}

export function buildShieldsBadgeUrl(
  label: string,
  message: string,
  color = "10b981"
): string {
  return `https://img.shields.io/badge/${escapeShieldsSegment(
    label
  )}-${escapeShieldsSegment(message)}-${color}?style=flat-square`;
}

export function buildLiveSvgBadgeUrl(
  baseUrl: string,
  handle: string,
  variant: "card" | "compact" = "card"
): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const suffix = variant === "compact" ? "?variant=compact" : "";
  return `${cleanBase}/api/public/u/${encodeURIComponent(handle)}/badge.svg${suffix}`;
}

export function generateEmbedWidgetSnippet(
  baseUrl: string,
  handle: string,
  userName: string
): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const widgetUrl = `${cleanBase}/api/public/u/${encodeURIComponent(handle)}/widget`;
  const safeName = (userName || "Perfil Técnico").replace(/"/g, "&quot;");
  return `<iframe src="${widgetUrl}" title="GoalRecall · ${safeName}" width="100%" height="360" style="border:1px solid #1e293b;border-radius:16px;background:#080c14;" loading="lazy"></iframe>`;
}

function sanitizeMarkdownInline(text?: string): string {
  if (!text) return "";
  return text.replace(/\r?\n+/g, " ").replace(/\|/g, "\\|").trim();
}

export function generateGitHubProfileMarkdown(params: {
  user: UserProfile;
  logs: LogEntry[];
  products?: Product[];
  certifications?: TechnicalCertification[];
  baseUrl: string;
  options?: Partial<GitHubProfileExportOptions>;
}): string {
  const {
    user,
    logs,
    products = [],
    certifications = [],
    baseUrl,
    options: partialOptions,
  } = params;

  const opts: GitHubProfileExportOptions = {
    ...DEFAULT_GITHUB_EXPORT_OPTIONS,
    ...partialOptions,
  };

  const cleanBase = (baseUrl || "https://goalrecall.com").replace(/\/+$/, "");
  const handle = resolvePublicHandle(user);
  const deckUrl = `${cleanBase}/u/${encodeURIComponent(handle)}`;

  const publicLogs = logs.filter((l) => l.isPublic === true);
  const publicProducts = products.filter((p) => p.isPublic !== false);
  const publicCerts = certifications.filter((c) => c.isPublic !== false);
  const topLogs = opts.includeTopLogs
    ? selectTopPublicLogs(publicLogs, opts.maxTopLogs)
    : [];

  const lines: string[] = [];

  lines.push(`### ${user.name || "Perfil Técnico"}${user.title ? ` — ${user.title}` : ""}`);
  if (user.bio?.trim()) {
    lines.push("");
    lines.push(`> ${sanitizeMarkdownInline(user.bio)}`);
  }

  lines.push("");

  if (opts.badgeStyle === "live_svg") {
    const svgUrl = buildLiveSvgBadgeUrl(cleanBase, handle, "card");
    lines.push(`[![GoalRecall Verified Profile](${svgUrl})](${deckUrl})`);
  } else {
    const logBadge = buildShieldsBadgeUrl(
      "Logros Verificados",
      `${publicLogs.length}`,
      "10b981"
    );
    const certBadge = buildShieldsBadgeUrl(
      "Certificaciones",
      `${publicCerts.length}`,
      "f59e0b"
    );
    const prodBadge = buildShieldsBadgeUrl(
      "Productos",
      `${publicProducts.length}`,
      "06b6d4"
    );
    const badges: string[] = [
      `[![Logros Verificados](${logBadge})](${deckUrl})`,
    ];
    if (publicCerts.length > 0) {
      badges.push(`[![Certificaciones](${certBadge})](${deckUrl})`);
    }
    if (publicProducts.length > 0) {
      badges.push(`[![Productos](${prodBadge})](${deckUrl})`);
    }
    if (topLogs[0]?.impact && topLogs[0].impact.length <= 40) {
      const impactBadge = buildShieldsBadgeUrl(
        "Impacto Destacado",
        sanitizeMarkdownInline(topLogs[0].impact),
        "0ea5e9"
      );
      badges.push(`[![Impacto Destacado](${impactBadge})](${deckUrl})`);
    }
    lines.push(badges.join(" "));
  }

  if (opts.includeTopLogs) {
    lines.push("");
    lines.push("#### Top Victorias Técnicas (Metodología Google XYZ)");
    if (topLogs.length === 0) {
      lines.push(
        "_Aún no hay logros marcados como públicos en GoalRecall._"
      );
    } else {
      topLogs.forEach((log) => {
        const title = sanitizeMarkdownInline(log.title);
        const impact = sanitizeMarkdownInline(log.impact);
        const meta = [log.client, log.project, log.date]
          .filter(Boolean)
          .map(sanitizeMarkdownInline)
          .join(" · ");
        lines.push(`- **${title}**`);
        lines.push(`  - Impacto: \`${impact}\` _(${meta})_`);
      });
    }
  }

  if (opts.includeCertifications && publicCerts.length > 0) {
    lines.push("");
    lines.push("#### Certificaciones & Credenciales Oficiales");
    publicCerts.forEach((cert) => {
      const name = sanitizeMarkdownInline(cert.name);
      const issuer = sanitizeMarkdownInline(cert.issuer);
      const dateStr = cert.issueDate ? ` · ${sanitizeMarkdownInline(cert.issueDate)}` : "";
      const linkPart = cert.credentialUrl
        ? ` — [Validar credencial](${cert.credentialUrl.trim()})`
        : "";
      lines.push(`- **${name}** · ${issuer}${dateStr}${linkPart}`);
    });
  }

  if (opts.includeProducts && publicProducts.length > 0) {
    lines.push("");
    lines.push("#### Productos & Showcase");
    publicProducts.forEach((prod) => {
      const title = sanitizeMarkdownInline(prod.title);
      const tagline = prod.tagline ? ` — ${sanitizeMarkdownInline(prod.tagline)}` : "";
      const stack =
        prod.techStack && prod.techStack.length > 0
          ? ` \`${prod.techStack.slice(0, 5).join("` `")}\``
          : "";
      const links: string[] = [];
      if (prod.liveUrl) links.push(`[Demo](${prod.liveUrl.trim()})`);
      if (prod.repoUrl) links.push(`[Repo](${prod.repoUrl.trim()})`);
      const linksPart = links.length > 0 ? ` (${links.join(" · ")})` : "";
      lines.push(`- **${title}**${tagline}${stack}${linksPart}`);
    });
  }

  if (opts.includeFirstMateCta) {
    lines.push("");
    lines.push(
      `[Explorar Vitrina Interactiva & Preguntar a First Mate AI →](${deckUrl})`
    );
  }

  return lines.join("\n");
}
