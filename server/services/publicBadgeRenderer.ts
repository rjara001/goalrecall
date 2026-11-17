export function escapeXml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateLabel(value: string, maxLen: number): string {
  const clean = (value || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

export interface BadgeSvgRenderInput {
  name: string;
  title?: string;
  handle: string;
  publicLogsCount: number;
  publicCertsCount: number;
  publicProductsCount: number;
  topImpact?: string;
  variant?: "card" | "compact";
}

export function renderSummaryBadgeSvg(input: BadgeSvgRenderInput): string {
  const {
    name,
    title = "",
    handle,
    publicLogsCount,
    publicCertsCount,
    publicProductsCount,
    topImpact = "",
    variant = "card",
  } = input;

  if (variant === "compact") {
    const leftText = "GoalRecall";
    const rightText = `${publicLogsCount} logros · ${publicCertsCount} cert(s)`;
    const leftWidth = 78;
    const rightWidth = Math.max(120, rightText.length * 6.8 + 20);
    const totalWidth = Math.round(leftWidth + rightWidth);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" role="img" aria-label="${escapeXml(
      `${leftText}: ${rightText}`
    )}">
  <rect width="${leftWidth}" height="24" rx="4" fill="#0f172a"/>
  <rect x="${leftWidth}" width="${rightWidth}" height="24" rx="4" fill="#059669"/>
  <rect x="${leftWidth}" width="6" height="24" fill="#059669"/>
  <g fill="#f8fafc" font-family="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace" font-size="11" font-weight="600">
    <text x="${leftWidth / 2}" y="16" text-anchor="middle">${escapeXml(leftText)}</text>
    <text x="${leftWidth + rightWidth / 2}" y="16" text-anchor="middle">${escapeXml(
      rightText
    )}</text>
  </g>
</svg>`;
  }

  const safeName = escapeXml(truncateLabel(name || "Profesional Técnico", 42));
  const safeTitle = escapeXml(truncateLabel(title || `@${handle}`, 60));
  const safeImpact = escapeXml(
    truncateLabel(
      topImpact || "Vitrina técnica verificada · GoalRecall Public Deck",
      74
    )
  );
  const statsLine = escapeXml(
    `${publicLogsCount} logros públicos · ${publicCertsCount} certificaciones · ${publicProductsCount} productos`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="156" viewBox="0 0 680 156" role="img" aria-label="GoalRecall · ${safeName}">
  <rect x="0.5" y="0.5" width="679" height="155" rx="14" fill="#080c14" stroke="#1e293b"/>
  <text x="24" y="34" fill="#f8fafc" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="18" font-weight="700">${safeName}</text>
  <text x="24" y="55" fill="#67e8f9" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12" font-weight="600">${safeTitle}</text>
  <rect x="528" y="20" width="128" height="24" rx="6" fill="#064e3b" stroke="#047857"/>
  <text x="592" y="36" text-anchor="middle" fill="#6ee7b7" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11" font-weight="700">VERIFIED DECK</text>
  <line x1="24" y1="74" x2="656" y2="74" stroke="#1e293b"/>
  <text x="24" y="98" fill="#94a3b8" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="12">${statsLine}</text>
  <rect x="24" y="112" width="632" height="28" rx="8" fill="#0f172a" stroke="#1e293b"/>
  <text x="36" y="130" fill="#34d399" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="11.5" font-weight="600">${safeImpact}</text>
</svg>`;
}

export interface EmbedWidgetLog {
  title: string;
  impact: string;
  client?: string;
  date?: string;
}

export interface EmbedWidgetCert {
  name: string;
  issuer: string;
  credentialUrl?: string;
}

export interface EmbedWidgetRenderInput {
  name: string;
  title?: string;
  handle: string;
  deckUrl: string;
  publicLogs: EmbedWidgetLog[];
  publicCerts: EmbedWidgetCert[];
  publicProductsCount: number;
}

export function renderEmbedWidgetHtml(input: EmbedWidgetRenderInput): string {
  const {
    name,
    title = "",
    handle,
    deckUrl,
    publicLogs,
    publicCerts,
    publicProductsCount,
  } = input;

  const topLogs = publicLogs.slice(0, 3);
  const topCerts = publicCerts.slice(0, 3);

  const logsHtml =
    topLogs.length === 0
      ? `<p class="empty">Sin logros públicos publicados todavía.</p>`
      : topLogs
          .map(
            (l) => `<li class="item">
  <div class="item-title">${escapeXml(l.title)}</div>
  <div class="item-meta">${escapeXml(l.impact)}${
              l.client ? ` · ${escapeXml(l.client)}` : ""
            }${l.date ? ` · ${escapeXml(l.date)}` : ""}</div>
</li>`
          )
          .join("\n");

  const certsHtml =
    topCerts.length > 0
      ? `<div class="certs">
  <div class="section-label">Certificaciones verificadas</div>
  <div class="certs-list">${topCerts
    .map((c) => {
      const label = `${escapeXml(c.name)} (${escapeXml(c.issuer)})`;
      return c.credentialUrl
        ? `<a class="cert-link" href="${escapeXml(
            c.credentialUrl
          )}" target="_blank" rel="noreferrer">${label}</a>`
        : `<span class="cert-plain">${label}</span>`;
    })
    .join(" · ")}</div>
</div>`
      : "";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>GoalRecall · ${escapeXml(name)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080c14;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:16px}
  .card{border:1px solid #1e293b;border-radius:14px;background:#0b111e;padding:18px;max-width:760px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid #1e293b;padding-bottom:12px;margin-bottom:14px}
  .name{font-size:16px;font-weight:700;color:#fff}
  .role{font-size:12px;color:#67e8f9;margin-top:2px}
  .stats{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#94a3b8;margin-top:6px}
  .cta{display:inline-block;background:#10b981;color:#020617;text-decoration:none;font-size:11.5px;font-weight:700;padding:7px 12px;border-radius:8px;white-space:nowrap}
  .section-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:8px}
  .list{list-style:none;display:flex;flex-direction:column;gap:10px}
  .item{padding:10px 12px;border:1px solid #1e293b;border-radius:10px;background:#080c14}
  .item-title{font-size:12.5px;font-weight:600;color:#f8fafc;line-height:1.4}
  .item-meta{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#34d399;margin-top:4px}
  .certs{margin-top:12px;padding-top:10px;border-top:1px solid #1e293b}
  .certs-list{font-size:11.5px;color:#cbd5e1;line-height:1.5}
  .cert-link{color:#fbbf24;text-decoration:none}
  .cert-link:hover{text-decoration:underline}
  .cert-plain{color:#cbd5e1}
  .empty{font-size:12px;color:#64748b}
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="name">${escapeXml(name || "Profesional Técnico")}</div>
        ${title ? `<div class="role">${escapeXml(title)}</div>` : ""}
        <div class="stats">${publicLogs.length} logros · ${publicCerts.length} certificaciones · ${publicProductsCount} productos · @${escapeXml(handle)}</div>
      </div>
      <a class="cta" href="${escapeXml(deckUrl)}" target="_blank" rel="noreferrer">Abrir Public Deck</a>
    </div>
    <div class="section-label">Top victorias verificadas</div>
    <ul class="list">${logsHtml}</ul>
    ${certsHtml}
  </div>
</body>
</html>`;
}
