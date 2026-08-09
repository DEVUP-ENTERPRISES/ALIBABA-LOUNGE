/**
 * US-locale display helpers.
 *
 * Reservation and event records store what the HTML inputs produce:
 *   <input type="date"> -> "2026-08-15"  (always ISO, regardless of locale)
 *   <input type="time"> -> "20:00"       (always 24-hour, regardless of locale)
 *
 * Those are correct as storage formats, but must never be shown to a US
 * audience as-is. Everything below converts them for display only.
 */

const US_DATE: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

/**
 * Parse an ISO calendar date as a LOCAL date.
 *
 * `new Date("2026-08-15")` is parsed as UTC midnight, which in every US
 * timezone renders as the previous day. Splitting the parts and using the
 * Date(y, m, d) constructor keeps the calendar date intact.
 */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2026-08-15" -> "Aug 15, 2026". Returns the input unchanged if unparseable. */
export function formatUsDate(value?: string | null) {
  if (!value) return "";

  const date = parseLocalDate(value);
  if (date) return date.toLocaleDateString("en-US", US_DATE);

  // Already a display string, or a full timestamp — try the generic path.
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime())
    ? value
    : fallback.toLocaleDateString("en-US", US_DATE);
}

/** "20:00" -> "8:00 PM". Returns the input unchanged if unparseable. */
export function formatUsTime(value?: string | null) {
  if (!value) return "";

  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return value;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** "2026-08-15" + "20:00" -> "Aug 15, 2026 at 8:00 PM". */
export function formatUsDateTime(date?: string | null, time?: string | null) {
  const formattedDate = formatUsDate(date);
  const formattedTime = formatUsTime(time);

  if (formattedDate && formattedTime) return `${formattedDate} at ${formattedTime}`;
  return formattedDate || formattedTime;
}

/** Full timestamp -> "Aug 15, 2026". For createdAt/updatedAt style values. */
export function formatUsTimestamp(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", US_DATE);
}
