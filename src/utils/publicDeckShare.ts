import { LogEntry, Product, UserProfile, WorkExperience } from "../types";

export interface SharedDeckPayload {
  version: "1.0";
  u: {
    n: string; // name
    t: string; // title
    b?: string; // bio
    a?: string; // avatar
    l?: string; // location
    li?: string; // linkedin
    gh?: string; // github
    s?: string; // availability status
    e?: string; // email (optional for contact)
    soc?: UserProfile["socialLinks"];
  };
  exp?: Array<{
    id: string;
    c: string; // company
    r: string; // role
    sd: string; // startDate
    ed?: string; // endDate
    cur?: boolean; // isCurrent
    loc?: string; // location
    sum?: string; // summary
    b?: string[]; // bullets
    tech?: string[]; // technologies
    pp?: boolean; // isPersonalProjects
  }>;
  l: Array<{
    id: string;
    c: string; // company / client
    p: string; // project
    d: string; // date
    cat: string; // category
    t: string; // title / achievement
    i: string; // impact
    w?: string; // what was sought
    y?: string; // why important
    h?: string; // how applied
    desc?: string; // description
    tg?: string[]; // tags
    expId?: string; // experienceId
  }>;
  p?: Array<{
    id: string;
    t: string; // title
    tl?: string; // tagline
    d?: string; // description
    ts?: string[]; // techStack
    pu?: string; // productUrl
    gu?: string; // githubUrl
    iu?: string; // imageUrl
    bl?: string; // badgeLabel
    achIds?: string[]; // relatedAchievementIds
  }>;
}

// Convert string to base64url safe string
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Convert base64url safe string back to string
function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Compression stream support for minimal URL length
async function compressString(str: string): Promise<string> {
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([str]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      const buffer = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return "z_" + btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      console.warn("CompressionStream failed, falling back to base64url", e);
    }
  }
  return "b_" + toBase64Url(str);
}

async function decompressString(encoded: string): Promise<string> {
  if (encoded.startsWith("z_") && typeof DecompressionStream !== "undefined") {
    try {
      const clean = encoded.substring(2);
      let base64 = clean.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return await new Response(stream).text();
    } catch (e) {
      console.warn("DecompressionStream failed", e);
    }
  }

  const payload = encoded.startsWith("b_") || encoded.startsWith("z_") ? encoded.substring(2) : encoded;
  return fromBase64Url(payload);
}

/**
 * Builds the compact shareable payload containing ONLY public achievements and public products
 */
export function buildSharedDeckPayload(
  user: UserProfile,
  logs: LogEntry[],
  products: Product[] = [],
  experiences: WorkExperience[] = []
): SharedDeckPayload {
  const publicLogs = logs.filter((l) => l.isPublic);
  const publicProducts = products.filter((p) => p.isPublic !== false);
  const publicExpIds = new Set(publicLogs.map((l) => l.experienceId).filter(Boolean));
  const publicExperiences = experiences.filter((e) => e.isPublic !== false || publicExpIds.has(e.id));

  return {
    version: "1.0",
    u: {
      n: user.name || "Profesional Técnico",
      t: user.title || "",
      b: user.bio || "",
      a: user.avatar,
      l: user.location,
      li: user.socialLinks?.linkedin || user.linkedin,
      gh: user.socialLinks?.github || user.github,
      s: user.availabilityStatus,
      e: user.email,
      soc: user.socialLinks,
    },
    exp: publicExperiences.map((e) => ({
      id: e.id,
      c: e.company,
      r: e.role,
      sd: e.startDate,
      ed: e.endDate,
      cur: e.isCurrent,
      loc: e.location,
      sum: e.summary,
      b: e.bullets,
      tech: e.technologies,
      pp: e.isPersonalProjects,
    })),
    l: publicLogs.map((log) => ({
      id: log.id,
      c: log.client,
      p: log.project,
      d: log.date,
      cat: log.category,
      t: log.title,
      i: log.impact,
      w: log.whatWasSought,
      y: log.whyImportant,
      h: log.howApplied,
      desc: log.description,
      tg: log.tags,
      expId: log.experienceId,
    })),
    p: publicProducts.map((prod) => ({
      id: prod.id,
      t: prod.title,
      tl: prod.tagline,
      d: prod.description,
      ts: prod.techStack,
      pu: prod.liveUrl,
      gu: prod.repoUrl,
      iu: prod.imageUrl,
      bl: prod.badge,
      achIds: prod.relatedAchievementIds,
    })),
  };
}

/**
 * Generates the full share URL with compressed payload in URL hash
 */
export async function generatePublicDeckShareUrl(
  user: UserProfile,
  logs: LogEntry[],
  products: Product[] = [],
  experiences: WorkExperience[] = []
): Promise<string> {
  const payload = buildSharedDeckPayload(user, logs, products, experiences);
  const jsonStr = JSON.stringify(payload);
  const encoded = await compressString(jsonStr);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://goalrecall.com";
  return `${origin}/public#deck=${encoded}`;
}

/**
 * Parses shared deck payload from window.location (hash or query)
 */
export async function parseSharedDeckFromUrl(): Promise<{
  userProfile: UserProfile;
  experiences: WorkExperience[];
  logs: LogEntry[];
  products: Product[];
} | null> {
  if (typeof window === "undefined") return null;

  let rawEncoded = "";

  // Check URL hash first: /public#deck=...
  const hash = window.location.hash;
  if (hash.includes("deck=")) {
    const match = hash.match(/deck=([^&]+)/);
    if (match && match[1]) {
      rawEncoded = decodeURIComponent(match[1]);
    }
  }

  // Fallback to query param: /public?deck=...
  if (!rawEncoded && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const paramVal = params.get("deck");
    if (paramVal) {
      rawEncoded = paramVal;
    }
  }

  if (!rawEncoded) return null;

  try {
    const decompressed = await decompressString(rawEncoded);
    const parsed = JSON.parse(decompressed) as SharedDeckPayload;

    if (!parsed || !parsed.u || !Array.isArray(parsed.l)) {
      return null;
    }

    const userProfile: UserProfile = {
      id: `usr-shared-${Date.now()}`,
      name: parsed.u.n || "Profesional Técnico",
      title: parsed.u.t || "Arquitecto / Desarrollador de Software",
      bio: parsed.u.b || "",
      avatar: parsed.u.a || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      location: parsed.u.l || "Remoto / Global",
      linkedin: parsed.u.li,
      github: parsed.u.gh,
      availabilityStatus: parsed.u.s,
      email: parsed.u.e || "contacto@profesional.dev",
      socialLinks: parsed.u.soc,
      authProvider: "custom",
      isDemoUser: false,
      isCustom: true,
      skills: [],
      createdAt: Date.now(),
    };

    const experiences: WorkExperience[] = (parsed.exp || []).map((e) => ({
      id: e.id,
      company: e.c,
      role: e.r,
      startDate: e.sd,
      endDate: e.ed,
      isCurrent: e.cur,
      location: e.loc,
      summary: e.sum,
      bullets: e.b,
      technologies: e.tech,
      isPersonalProjects: e.pp,
      isPublic: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const logs: LogEntry[] = parsed.l.map((item) => ({
      id: item.id,
      client: item.c,
      project: item.p,
      date: item.d,
      category: item.cat as any,
      title: item.t,
      impact: item.i,
      whatWasSought: item.w,
      whyImportant: item.y,
      howApplied: item.h,
      description: item.desc,
      tags: item.tg || [],
      experienceId: item.expId,
      isPublic: true, // by definition, all items in shared deck are public
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const products: Product[] = (parsed.p || []).map((prod) => ({
      id: prod.id,
      userId: `usr-shared-${Date.now()}`,
      title: prod.t,
      tagline: prod.tl || "",
      description: prod.d || "",
      techStack: prod.ts || [],
      liveUrl: prod.pu,
      repoUrl: prod.gu,
      imageUrl: prod.iu || "",
      badge: prod.bl || "PROYECTO",
      relatedAchievementIds: prod.achIds || [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    return { userProfile, experiences, logs, products };
  } catch (err) {
    console.error("Failed to parse shared deck from URL:", err);
    return null;
  }
}
