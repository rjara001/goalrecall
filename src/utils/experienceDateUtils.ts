export interface NormalizedExperiencePeriod {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

const PRESENT_TOKEN_REGEX =
  /^(?:present|presente|actualidad|actual|current|currently|hoy|now|to\s+date|hasta\s+la\s+fecha|hasta\s+hoy)$/i;

const MONTH_NAME_REGEX =
  /\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sep|sept|oct|nov|dic|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;

const DATE_FRAGMENT_REGEX =
  /(?:(?:19|20)\d{2}|\b\d{1,2}[/-](?:19|20)?\d{2,4}\b)/;

export function isPresentDateToken(value?: string | null): boolean {
  if (!value) return false;
  return PRESENT_TOKEN_REGEX.test(value.trim());
}

function looksLikeDateEndpoint(token: string, allowPresent: boolean): boolean {
  const clean = token.trim();
  if (!clean) return false;
  if (allowPresent && isPresentDateToken(clean)) return true;
  if (DATE_FRAGMENT_REGEX.test(clean)) return true;
  if (MONTH_NAME_REGEX.test(clean)) return true;
  return false;
}

function stripTrailingNonDateSuffix(raw: string): string {
  const parts = raw
    .split(/\s*[·|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return raw.trim();
  const first = parts[0];
  if (
    /[–—]|\s-\s|\s+(?:to|a|al|hasta)\s+/i.test(first) &&
    looksLikeDateEndpoint(first, true)
  ) {
    return first;
  }
  return raw.trim();
}

export function parseExperienceDateRange(
  rawDateRange?: string | null
): NormalizedExperiencePeriod | null {
  if (!rawDateRange) return null;
  const cleaned = stripTrailingNonDateSuffix(rawDateRange);
  if (!cleaned) return null;

  const patterns: RegExp[] = [
    /^(.+?)\s*[–—]\s*(.+)$/,
    /^(.+?)\s+-\s+(.+)$/,
    /^((?:19|20)\d{2})\s*-\s*((?:19|20)\d{2}|present(?:e)?|actualidad|actual|current|hoy|now)$/i,
    /^(.+?)\s+(?:to|a|al|hasta)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (!match) continue;
    const left = match[1].trim();
    const right = match[2].trim();
    if (
      looksLikeDateEndpoint(left, false) &&
      looksLikeDateEndpoint(right, true)
    ) {
      if (isPresentDateToken(right)) {
        return {
          startDate: left,
          endDate: "",
          isCurrent: true,
        };
      }
      return {
        startDate: left,
        endDate: right,
        isCurrent: false,
      };
    }
  }

  return null;
}

export function normalizeExperiencePeriod(exp: {
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}): NormalizedExperiencePeriod {
  let startDate = typeof exp.startDate === "string" ? exp.startDate.trim() : "";
  let endDate = typeof exp.endDate === "string" ? exp.endDate.trim() : "";
  let isCurrent = Boolean(exp.isCurrent);

  if (isPresentDateToken(endDate)) {
    isCurrent = true;
    endDate = "";
  }

  if (startDate && (!endDate || isCurrent)) {
    const parsed = parseExperienceDateRange(startDate);
    if (parsed) {
      startDate = parsed.startDate;
      if (!isCurrent) {
        endDate = parsed.endDate;
        isCurrent = parsed.isCurrent;
      }
    } else if (isPresentDateToken(startDate) && !endDate) {
      startDate = "";
      isCurrent = true;
    }
  }

  if (isCurrent) {
    endDate = "";
  }

  return {
    startDate,
    endDate,
    isCurrent,
  };
}

export interface FormatExperiencePeriodOptions {
  language?: string;
  emptyLabel?: string;
}

export function formatExperiencePeriod(
  exp: {
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  },
  options: FormatExperiencePeriodOptions = {}
): string {
  const { startDate, endDate, isCurrent } = normalizeExperiencePeriod(exp);
  const isEn = options.language === "en";
  const presentLabel = isEn ? "Present" : "Actualidad";
  const emptyLabel =
    options.emptyLabel !== undefined
      ? options.emptyLabel
      : isEn
        ? "Dates not specified"
        : "Sin fechas definidas";

  if (startDate && isCurrent) {
    return `${startDate} — ${presentLabel}`;
  }
  if (startDate && endDate) {
    return `${startDate} — ${endDate}`;
  }
  if (startDate) {
    return startDate;
  }
  if (isCurrent) {
    return presentLabel;
  }
  if (endDate) {
    return endDate;
  }
  return emptyLabel;
}
