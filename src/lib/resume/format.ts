const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse a JSON Resume date (YYYY, YYYY-MM or YYYY-MM-DD) into year and month. */
export function parseDate(value: string): { year: number; month?: number } {
  const [y, m] = value.split("-");
  const year = Number(y);
  const month = m === undefined ? undefined : Number(m);
  if (!Number.isInteger(year) || (month !== undefined && (month < 1 || month > 12))) {
    throw new Error(`Invalid resume date: ${value}`);
  }
  return { year, month };
}

/** "2022-03" -> "Mar 2022", "2022" -> "2022". */
export function formatDate(value: string): string {
  const { year, month } = parseDate(value);
  return month === undefined ? String(year) : `${MONTHS[month - 1]} ${year}`;
}

/** "Mar 2022 – Present" or "Jun 2019 – Feb 2022". */
export function formatRange(start: string, end?: string): string {
  return `${formatDate(start)} – ${end ? formatDate(end) : "Present"}`;
}

/**
 * Whole months between two resume dates, inclusive of the starting month.
 * `now` is injected so the value is deterministic in prerendered output and tests.
 */
export function monthsBetween(start: string, end: string | undefined, now: Date): number {
  const s = parseDate(start);
  const e = end ? parseDate(end) : { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  const months = (e.year - s.year) * 12 + ((e.month ?? 1) - (s.month ?? 1)) + 1;
  return Math.max(0, months);
}

/** 14 -> "1 yr 2 mos", 24 -> "2 yrs", 5 -> "5 mos". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
  return parts.join(" ") || "0 mos";
}
