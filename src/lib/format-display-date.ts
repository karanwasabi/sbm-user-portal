const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function formatShortStartDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function exclusiveBoundaryUtcParts(isoOrDate: string): { y: number; m: number; d: number } | null {
  const trimmed = isoOrDate.trim();
  if (!trimmed) return null;
  if (DATE_ONLY.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return { y, m: m - 1, d };
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() };
}

function utcDateOnlyString(parts: { y: number; m: number; d: number }): string {
  const yy = parts.y;
  const mm = String(parts.m + 1).padStart(2, '0');
  const dd = String(parts.d).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Shift a UTC calendar date by deltaDays (mirrors Go AddDate day arithmetic). */
export function shiftUtcDateOnly(yyyyMmDd: string, deltaDays: number): string {
  const parts = exclusiveBoundaryUtcParts(yyyyMmDd);
  if (!parts) return yyyyMmDd;
  const date = new Date(Date.UTC(parts.y, parts.m, parts.d + deltaDays));
  return utcDateOnlyString({
    y: date.getUTCFullYear(),
    m: date.getUTCMonth(),
    d: date.getUTCDate(),
  });
}

/** Last inclusive access day (YYYY-MM-DD UTC) from stored exclusive boundary ISO or date. */
export function inclusiveAccessEndDateOnly(exclusiveIsoOrDate?: string | null): string {
  if (!exclusiveIsoOrDate?.trim()) return '';
  const parts = exclusiveBoundaryUtcParts(exclusiveIsoOrDate);
  if (!parts) return '';
  return shiftUtcDateOnly(utcDateOnlyString(parts), -1);
}

/** Exclusive lapse boundary (YYYY-MM-DD UTC) from inclusive end date for API save. */
export function exclusiveBoundaryDateOnly(inclusiveYYYYMMDD?: string | null): string {
  if (!inclusiveYYYYMMDD?.trim()) return '';
  if (!DATE_ONLY.test(inclusiveYYYYMMDD.trim())) return inclusiveYYYYMMDD.trim();
  return shiftUtcDateOnly(inclusiveYYYYMMDD.trim(), 1);
}

export function formatInclusiveAccessEndDate(iso?: string | null, style: 'short' | 'long' = 'short'): string | null {
  const inclusive = inclusiveAccessEndDateOnly(iso);
  if (!inclusive) return null;
  const parts = exclusiveBoundaryUtcParts(inclusive);
  if (!parts) return null;
  const date = new Date(Date.UTC(parts.y, parts.m, parts.d));
  if (Number.isNaN(date.getTime())) return null;
  if (style === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Days until inclusive access end (UTC calendar), from exclusive boundary ISO. */
export function daysUntilInclusiveAccessEnd(exclusiveIso?: string | null): number | null {
  const inclusive = inclusiveAccessEndDateOnly(exclusiveIso);
  if (!inclusive) return null;
  const parts = exclusiveBoundaryUtcParts(inclusive);
  if (!parts) return null;
  const target = new Date(Date.UTC(parts.y, parts.m, parts.d));
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((target.getTime() - todayUtc.getTime()) / (1000 * 60 * 60 * 24));
}
