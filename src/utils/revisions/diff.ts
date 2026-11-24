import {
  ExperienceRevisionSnapshot,
  LogRevisionSnapshot,
  RevisionEntityType,
} from "../../types";
import {
  EXPERIENCE_REVISION_FIELDS,
  getRevisionFieldLabel,
  getRevisionFieldMeta,
  LOG_REVISION_FIELDS,
  normalizeScalarText,
} from "./snapshot";

export interface WordDiffSegment {
  type: "equal" | "added" | "removed";
  text: string;
}

export interface LineDiffEntry {
  type: "equal" | "added" | "removed";
  text: string;
  oldIndex?: number;
  newIndex?: number;
}

export type FieldDiffKind = "scalar" | "multiline" | "list" | "boolean";

export type FieldDiffStatus = "unchanged" | "modified" | "added" | "removed";

export interface RevisionFieldDiff {
  field: string;
  label: string;
  section: string;
  propertyLabel: string;
  hint: string;
  kind: FieldDiffKind;
  status: FieldDiffStatus;
  oldDisplay: string;
  newDisplay: string;
  unifiedSegments: WordDiffSegment[];
  oldSegments: WordDiffSegment[];
  newSegments: WordDiffSegment[];
  listLines?: LineDiffEntry[];
}

const MAX_LCS_TOKENS = 420;

function tokenizeForWordDiff(input: string): string[] {
  if (!input) return [];
  const matches = input.match(/\s+|[^\s.,;:!?()[\]{}"'«»]+|[.,;:!?()[\]{}"'«»]/g);
  return matches ? matches : [input];
}

function mergeAdjacentSegments(segments: WordDiffSegment[]): WordDiffSegment[] {
  const merged: WordDiffSegment[] = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.type === seg.type) {
      prev.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function computeLcsPairs<T>(
  a: T[],
  b: T[],
  equals: (x: T, y: T) => boolean
): Array<{ type: "equal" | "added" | "removed"; value: T }> {
  const m = a.length;
  const n = b.length;

  // Fallback for unexpectedly massive inputs to guarantee snappy client rendering
  if (m * n > MAX_LCS_TOKENS * MAX_LCS_TOKENS) {
    const fallback: Array<{ type: "equal" | "added" | "removed"; value: T }> = [];
    for (const item of a) fallback.push({ type: "removed", value: item });
    for (const item of b) fallback.push({ type: "added", value: item });
    return fallback;
  }

  // Flat Int32Array DP matrix (rows = m+1, cols = n+1)
  const cols = n + 1;
  const dp = new Int32Array((m + 1) * cols);

  for (let i = m - 1; i >= 0; i--) {
    const rowOffset = i * cols;
    const nextRowOffset = (i + 1) * cols;
    for (let j = n - 1; j >= 0; j--) {
      if (equals(a[i], b[j])) {
        dp[rowOffset + j] = dp[nextRowOffset + (j + 1)] + 1;
      } else {
        const down = dp[nextRowOffset + j];
        const right = dp[rowOffset + (j + 1)];
        dp[rowOffset + j] = down >= right ? down : right;
      }
    }
  }

  const ops: Array<{ type: "equal" | "added" | "removed"; value: T }> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (equals(a[i], b[j])) {
      ops.push({ type: "equal", value: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * cols + j] >= dp[i * cols + (j + 1)]) {
      ops.push({ type: "removed", value: a[i] });
      i++;
    } else {
      ops.push({ type: "added", value: b[j] });
      j++;
    }
  }
  while (i < m) {
    ops.push({ type: "removed", value: a[i] });
    i++;
  }
  while (j < n) {
    ops.push({ type: "added", value: b[j] });
    j++;
  }

  return ops;
}

export function diffWords(oldText: string, newText: string): WordDiffSegment[] {
  const prev = normalizeScalarText(oldText);
  const next = normalizeScalarText(newText);

  if (prev === next) {
    return prev ? [{ type: "equal", text: prev }] : [];
  }
  if (!prev) {
    return [{ type: "added", text: next }];
  }
  if (!next) {
    return [{ type: "removed", text: prev }];
  }

  const prevTokens = tokenizeForWordDiff(prev);
  const nextTokens = tokenizeForWordDiff(next);

  // If extremely long text, fall back to line-level LCS + word diff inside blocks
  if (prevTokens.length > MAX_LCS_TOKENS || nextTokens.length > MAX_LCS_TOKENS) {
    const prevLines = prev.split("\n");
    const nextLines = next.split("\n");
    const lineOps = computeLcsPairs(prevLines, nextLines, (x, y) => x === y);
    const out: WordDiffSegment[] = [];
    lineOps.forEach((op, idx) => {
      out.push({
        type: op.type,
        text: idx < lineOps.length - 1 ? `${op.value}\n` : op.value,
      });
    });
    return mergeAdjacentSegments(out);
  }

  const ops = computeLcsPairs(prevTokens, nextTokens, (x, y) => x === y);
  return mergeAdjacentSegments(
    ops.map((op) => ({
      type: op.type,
      text: op.value,
    }))
  );
}

export function diffLines(oldItems: string[], newItems: string[]): LineDiffEntry[] {
  const prev = oldItems.map((s) => normalizeScalarText(s)).filter(Boolean);
  const next = newItems.map((s) => normalizeScalarText(s)).filter(Boolean);

  const ops = computeLcsPairs(prev, next, (x, y) => x === y);
  let oldIdx = 0;
  let newIdx = 0;

  return ops.map((op) => {
    if (op.type === "equal") {
      oldIdx++;
      newIdx++;
      return {
        type: "equal",
        text: op.value,
        oldIndex: oldIdx,
        newIndex: newIdx,
      };
    }
    if (op.type === "removed") {
      oldIdx++;
      return {
        type: "removed",
        text: op.value,
        oldIndex: oldIdx,
      };
    }
    newIdx++;
    return {
      type: "added",
      text: op.value,
      newIndex: newIdx,
    };
  });
}

function splitSideSegments(unified: WordDiffSegment[]): {
  oldSegments: WordDiffSegment[];
  newSegments: WordDiffSegment[];
} {
  const oldSegments = mergeAdjacentSegments(
    unified.filter((s) => s.type === "equal" || s.type === "removed")
  );
  const newSegments = mergeAdjacentSegments(
    unified.filter((s) => s.type === "equal" || s.type === "added")
  );
  return { oldSegments, newSegments };
}

function resolveStatusFromValues(oldVal: string, newVal: string): FieldDiffStatus {
  if (oldVal === newVal) return "unchanged";
  if (!oldVal && newVal) return "added";
  if (oldVal && !newVal) return "removed";
  return "modified";
}

function resolveStatusFromLists(oldArr: string[], newArr: string[]): FieldDiffStatus {
  if (
    oldArr.length === newArr.length &&
    oldArr.every((item, idx) => item === newArr[idx])
  ) {
    return "unchanged";
  }
  if (oldArr.length === 0 && newArr.length > 0) return "added";
  if (oldArr.length > 0 && newArr.length === 0) return "removed";
  return "modified";
}

function formatBooleanLabel(val: boolean): string {
  return val ? "Sí" : "No";
}

export function buildRevisionFieldDiffs(
  entityType: RevisionEntityType,
  baseSnapshot: LogRevisionSnapshot | ExperienceRevisionSnapshot,
  targetSnapshot: LogRevisionSnapshot | ExperienceRevisionSnapshot
): RevisionFieldDiff[] {
  if (entityType === "log") {
    const base = baseSnapshot as LogRevisionSnapshot;
    const target = targetSnapshot as LogRevisionSnapshot;

    return LOG_REVISION_FIELDS.map((field) => {
      const label = getRevisionFieldLabel("log", field);
      const meta = getRevisionFieldMeta("log", field);
      if (field === "tags") {
        const oldList = base.tags || [];
        const newList = target.tags || [];
        const status = resolveStatusFromLists(oldList, newList);
        const oldDisplay = oldList.join(", ");
        const newDisplay = newList.join(", ");
        const listLines = diffLines(oldList, newList);
        const unifiedSegments = diffWords(oldDisplay, newDisplay);
        const { oldSegments, newSegments } = splitSideSegments(unifiedSegments);

        return {
          field,
          label,
          section: meta.section,
          propertyLabel: meta.propertyLabel,
          hint: meta.hint,
          kind: "list",
          status,
          oldDisplay,
          newDisplay,
          unifiedSegments,
          oldSegments,
          newSegments,
          listLines,
        };
      }

      const oldVal = normalizeScalarText(base[field]);
      const newVal = normalizeScalarText(target[field]);
      const status = resolveStatusFromValues(oldVal, newVal);
      const unifiedSegments = diffWords(oldVal, newVal);
      const { oldSegments, newSegments } = splitSideSegments(unifiedSegments);
      const kind: FieldDiffKind =
        field === "title" ||
        field === "impact" ||
        field === "whatWasSought" ||
        field === "whyImportant" ||
        field === "howApplied" ||
        field === "description"
          ? "multiline"
          : "scalar";

      return {
        field,
        label,
        section: meta.section,
        propertyLabel: meta.propertyLabel,
        hint: meta.hint,
        kind,
        status,
        oldDisplay: oldVal,
        newDisplay: newVal,
        unifiedSegments,
        oldSegments,
        newSegments,
      };
    });
  }

  const base = baseSnapshot as ExperienceRevisionSnapshot;
  const target = targetSnapshot as ExperienceRevisionSnapshot;

  return EXPERIENCE_REVISION_FIELDS.map((field) => {
    const label = getRevisionFieldLabel("experience", field);
    const meta = getRevisionFieldMeta("experience", field);

    if (field === "bullets" || field === "technologies") {
      const oldList = base[field] || [];
      const newList = target[field] || [];
      const status = resolveStatusFromLists(oldList, newList);
      const oldDisplay = oldList.join("\n");
      const newDisplay = newList.join("\n");
      const listLines = diffLines(oldList, newList);
      const unifiedSegments = diffWords(
        oldList.join(field === "technologies" ? ", " : "\n"),
        newList.join(field === "technologies" ? ", " : "\n")
      );
      const { oldSegments, newSegments } = splitSideSegments(unifiedSegments);

      return {
        field,
        label,
        section: meta.section,
        propertyLabel: meta.propertyLabel,
        hint: meta.hint,
        kind: "list",
        status,
        oldDisplay,
        newDisplay,
        unifiedSegments,
        oldSegments,
        newSegments,
        listLines,
      };
    }

    if (field === "isCurrent" || field === "isPersonalProjects") {
      const oldBool = Boolean(base[field]);
      const newBool = Boolean(target[field]);
      const oldDisplay = formatBooleanLabel(oldBool);
      const newDisplay = formatBooleanLabel(newBool);
      const status: FieldDiffStatus = oldBool === newBool ? "unchanged" : "modified";
      const unifiedSegments = diffWords(oldDisplay, newDisplay);
      const { oldSegments, newSegments } = splitSideSegments(unifiedSegments);

      return {
        field,
        label,
        section: meta.section,
        propertyLabel: meta.propertyLabel,
        hint: meta.hint,
        kind: "boolean",
        status,
        oldDisplay,
        newDisplay,
        unifiedSegments,
        oldSegments,
        newSegments,
      };
    }

    const oldVal = normalizeScalarText(base[field]);
    const newVal = normalizeScalarText(target[field]);
    const status = resolveStatusFromValues(oldVal, newVal);
    const unifiedSegments = diffWords(oldVal, newVal);
    const { oldSegments, newSegments } = splitSideSegments(unifiedSegments);

    return {
      field,
      label,
      section: meta.section,
      propertyLabel: meta.propertyLabel,
      hint: meta.hint,
      kind: field === "summary" ? "multiline" : "scalar",
      status,
      oldDisplay: oldVal,
      newDisplay: newVal,
      unifiedSegments,
      oldSegments,
      newSegments,
    };
  });
}
