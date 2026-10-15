import { LogEntry, STARStory, XYZBullet } from "../types";

/**
 * Generate Google XYZ formula CV bullet points:
 * "Accomplished [X] as measured by [Y] by doing [Z]"
 */
export const generateXYZBullets = (logs: LogEntry[]): XYZBullet[] => {
  return logs.map((log) => {
    // Clean and normalize strings
    const accomplishment = log.title.replace(/^(migrated|shipped|resolved|implemented|built|designed|refactored|cut)\s+/i, "");
    const impact = log.impact.trim();
    const actionPart = log.description 
      ? log.description.split(".")[0].trim() 
      : `leveraging ${log.tags.join(", ") || "targeted architectural patterns"}`;

    const verb = log.title.split(" ")[0] || "Engineered";
    const bullet = `${verb} ${accomplishment}, resulting in ${impact.toLowerCase()} by ${actionPart.toLowerCase()}.`;

    return {
      id: "xyz-" + log.id,
      logId: log.id,
      client: log.client,
      project: log.project,
      date: log.date,
      bullet: bullet.replace(/\.\./g, "."),
      originalTitle: log.title,
      impact: log.impact,
    };
  });
};

/**
 * Generate STAR behavioral interview stories from complex logs
 */
export const generateSTARStories = (logs: LogEntry[]): STARStory[] => {
  return logs.map((log) => {
    // Generate context-aware STAR components
    const situation = `At ${log.client} during the ${log.project} initiative, the team faced architectural constraints where ${log.title.toLowerCase()}.`;
    
    let task = `The mandate was to remediate the underlying issue while preserving strict system uptime, zero data loss, and predictable latency under high concurrency.`;
    if (log.category.includes("Fix")) {
      task = `The critical objective was to isolate the root cause of the defect, prevent cascading failures, and safeguard transaction integrity without regressions.`;
    } else if (log.category.includes("Architecture")) {
      task = `The goal was to replace fragile legacy dependencies with a decoupled, horizontally scalable architecture compliant with enterprise SLOs.`;
    }

    const action = log.description 
      ? `${log.description} Coordinated technical rollout, instrumented monitoring checkpoints, and validated reliability using ${log.tags.join(", ") || "production benchmarks"}.`
      : `Led technical design and implementation, established automated safeguards, and verified end-to-end telemetry using ${log.tags.join(", ") || "standard benchmarks"}.`;

    const result = `${log.impact}. Documented the design architecture, mentored engineering peers, and eliminated recurring operational overhead.`;

    return {
      id: "star-" + log.id,
      title: log.title,
      category: log.category,
      client: log.client,
      project: log.project,
      situation,
      task,
      action,
      result,
      tags: log.tags,
    };
  });
};

/**
 * Generate a clean Portfolio / Case Study in Markdown format
 */
export const generateCaseStudyMarkdown = (
  clientOrProject: string,
  logs: LogEntry[],
  userName = "Lead Software Engineer"
): string => {
  const publicLogs = logs.filter((l) => l.isPublic);
  const targetLogs = publicLogs.length > 0 ? publicLogs : logs;
  const allTags = Array.from(new Set(targetLogs.flatMap((l) => l.tags)));

  const markdown = `# Case Study: ${clientOrProject}
*Engineering Leadership & Technical Execution by ${userName}*
*Generated via Captain's Log on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*

---

## 1. Executive Summary
During the engineering lifecycle of **${clientOrProject}**, technical efforts were focused on high-availability design, system performance optimization, and mission-critical reliability. This case study documents verified deliverables, quantifiable business impact, and architectural decisions.

## 2. Core Problem & Engineering Challenges
The initiative required resolving complex scalability bottlenecks, eliminating distributed race conditions, and delivering responsive user experiences under high transaction loads. Key challenges included:
- Preserving strict data consistency and sub-second p99 latency SLAs.
- Eliminating fragile monolithic coupling without disrupting ongoing operations.
- Accelerating feature release velocity while maintaining comprehensive test coverage.

## 3. Technical Architecture & Implementation
The following milestone accomplishments were engineered and deployed:

${targetLogs
  .map(
    (log, i) => `### ${i + 1}. ${log.title} (${log.category})
- **Client / Initiative:** ${log.client} · ${log.project}
- **Date Delivered:** ${log.date}
- **Technical Steps:** ${log.description || "Executed standard architectural implementation and verification."}
- **Measurable Outcome:** **${log.impact}**
- **Technologies:** ${log.tags.join(" ") || "#FullStack"}
`
  )
  .join("\n")}

## 4. Aggregated Impact & Outcomes
- **Reliability:** Replaced legacy failure modes with resilient patterns and comprehensive observability.
- **Performance:** Achieved verifiable reductions in processing latency and system overhead.
- **Velocity:** Simplified maintainability and established modular domain boundaries.

## 5. Technology Stack
\`${allTags.join("`, `") || "TypeScript, Node.js, React, PostgreSQL, Docker"}\`

---
*Verified from production engineering records tracked in Captain's Log.*
`;

  return markdown;
};
