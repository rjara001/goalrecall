import { describe, expect, it } from "bun:test";
import {
  buildLiveSvgBadgeUrl,
  buildShieldsBadgeUrl,
  generateEmbedWidgetSnippet,
  generateGitHubProfileMarkdown,
  selectTopPublicLogs,
} from "./githubProfileGenerator";
import {
  renderEmbedWidgetHtml,
  renderSummaryBadgeSvg,
} from "../../server/services/publicBadgeRenderer";
import { LogEntry, Product, TechnicalCertification, UserProfile } from "../types";

const sampleUser: UserProfile = {
  id: "usr-1",
  username: "rjara001",
  name: "Rodrigo Jara",
  email: "rodrigo@example.com",
  avatar: "",
  title: "Principal Full Stack Architect",
  bio: "Arquitectura distribuida y producto.",
  location: "Santiago",
  skills: [],
};

const sampleLogs: LogEntry[] = [
  {
    id: "log-private",
    date: "2026-05-01",
    client: "SecretCo",
    project: "Internal NDA",
    category: "Architecture 🏗️",
    title: "CONFIDENCIAL NO COMPARTIR",
    impact: "99% secreto",
    tags: [],
    isPublic: false,
    createdAt: 1,
    updatedAt: 100,
  },
  {
    id: "log-pub-1",
    date: "2026-03-01",
    client: "Acme",
    project: "Payments",
    category: "Architecture 🏗️",
    title: "Rediseño de pipeline de liquidaciones",
    impact: "Latencia -92% y ahorro de 14h/semana",
    tags: ["#Postgres"],
    isPublic: true,
    createdAt: 2,
    updatedAt: 200,
  },
  {
    id: "log-pub-2",
    date: "2026-04-01",
    client: "Acme",
    project: "Security",
    category: "Infra/DevOps 🚀",
    title: "Automatización de cumplimiento SOC2",
    impact: "0 hallazgos críticos en auditoría",
    tags: ["#SOC2"],
    isPublic: true,
    createdAt: 3,
    updatedAt: 300,
  },
];

const sampleCerts: TechnicalCertification[] = [
  {
    id: "cert-pub",
    name: "AWS Solutions Architect Professional",
    issuer: "AWS",
    issueDate: "2025-04",
    credentialUrl: "https://credly.com/aws-psa",
    skills: ["AWS"],
    isPublic: true,
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: "cert-priv",
    name: "Curso Interno Confidencial",
    issuer: "SecretCo",
    issueDate: "2025-05",
    skills: [],
    isPublic: false,
    createdAt: 2,
    updatedAt: 2,
  },
];

const sampleProducts: Product[] = [
  {
    id: "prod-1",
    userId: "usr-1",
    title: "GoalRecall",
    tagline: "Career Telemetry Vault",
    description: "Private/public career vault",
    imageUrl: "",
    techStack: ["React", "TypeScript"],
    liveUrl: "https://goalrecall.com",
    isPublic: true,
    createdAt: "2026-01-01",
  },
];

describe("GitHub Profile README & SVG badge generation (Paso 3)", () => {
  it("selects only public logs prioritizing quantified metrics", () => {
    const top = selectTopPublicLogs(sampleLogs, 3);
    expect(top).toHaveLength(2);
    expect(top.some((l) => l.id === "log-private")).toBe(false);
    expect(top[0].id).toBe("log-pub-2");
  });

  it("generates README Markdown isolating private logs and private certifications", () => {
    const md = generateGitHubProfileMarkdown({
      user: sampleUser,
      logs: sampleLogs,
      products: sampleProducts,
      certifications: sampleCerts,
      baseUrl: "https://goalrecall.com",
    });

    expect(md).toContain("Rodrigo Jara — Principal Full Stack Architect");
    expect(md).toContain("Latencia -92% y ahorro de 14h/semana");
    expect(md).toContain("AWS Solutions Architect Professional");
    expect(md).toContain("GoalRecall");
    expect(md).toContain("https://goalrecall.com/u/rjara001");
    expect(md).not.toContain("CONFIDENCIAL NO COMPARTIR");
    expect(md).not.toContain("Curso Interno Confidencial");
  });

  it("supports dynamic SVG badge mode and iframe embed generation", () => {
    const md = generateGitHubProfileMarkdown({
      user: sampleUser,
      logs: sampleLogs,
      baseUrl: "https://goalrecall.com/",
      options: { badgeStyle: "live_svg" },
    });

    const svgUrl = buildLiveSvgBadgeUrl("https://goalrecall.com/", "rjara001", "card");
    expect(svgUrl).toBe("https://goalrecall.com/api/public/u/rjara001/badge.svg");
    expect(md).toContain(svgUrl);

    const shields = buildShieldsBadgeUrl("Logros Verificados", "2");
    expect(shields).toContain("img.shields.io/badge/Logros%20Verificados-2-10b981");

    const iframe = generateEmbedWidgetSnippet(
      "https://goalrecall.com",
      "rjara001",
      "Rodrigo Jara"
    );
    expect(iframe).toContain("https://goalrecall.com/api/public/u/rjara001/widget");
  });

  it("renders valid escaped SVG and embed HTML without script tags", () => {
    const svgCard = renderSummaryBadgeSvg({
      name: "Rodrigo <Admin> & Dev",
      title: "Architect",
      handle: "rjara001",
      publicLogsCount: 3,
      publicCertsCount: 1,
      publicProductsCount: 2,
      topImpact: "Latencia -92%",
      variant: "card",
    });

    expect(svgCard).toContain("<svg ");
    expect(svgCard).toContain("Rodrigo &lt;Admin&gt; &amp; Dev");
    expect(svgCard).toContain("3 logros públicos · 1 certificaciones · 2 productos");

    const svgCompact = renderSummaryBadgeSvg({
      name: "Rodrigo",
      handle: "rjara001",
      publicLogsCount: 3,
      publicCertsCount: 1,
      publicProductsCount: 2,
      variant: "compact",
    });
    expect(svgCompact).toContain("GoalRecall");
    expect(svgCompact).toContain("3 logros · 1 cert(s)");

    const widgetHtml = renderEmbedWidgetHtml({
      name: "Rodrigo Jara",
      title: "Architect",
      handle: "rjara001",
      deckUrl: "https://goalrecall.com/u/rjara001",
      publicLogs: [{ title: "Test <script>", impact: "-40% p99" }],
      publicCerts: [{ name: "CKA", issuer: "CNCF" }],
      publicProductsCount: 1,
    });

    expect(widgetHtml).toContain("<!doctype html>");
    expect(widgetHtml).toContain("Test &lt;script&gt;");
    expect(widgetHtml).not.toContain("<script>");
  });
});
