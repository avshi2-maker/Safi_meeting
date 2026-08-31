// dates.ts (src/lib/dates.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import type { SlotKey } from "./types";
import { SLOT_MAP } from "./slots";

export const WINDOW_START = "2026-09-01";
// Extended to end of December 2026 so Chanukah (4–12 Dec) is selectable.
export const WINDOW_END = "2026-12-31";

// Months shown (0-based): Sep, Oct, Nov, Dec 2026
export const WINDOW_MONTHS: { year: number; month: number }[] = [
  { year: 2026, month: 8 },
  { year: 2026, month: 9 },
  { year: 2026, month: 10 },
  { year: 2026, month: 11 },
];

export const MONTHS_HE = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export const WEEKDAYS_HE_SHORT = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
export const WEEKDAYS_HE_FULL = [
  "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת",
];

function parseUTC(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function toISO(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function allDates(): string[] {
  const out: string[] = [];
  const cur = parseUTC(WINDOW_START);
  const end = parseUTC(WINDOW_END);
  while (cur.getTime() <= end.getTime()) {
    out.push(toISO(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export interface Cell {
  date: string | null;
  day: number | null;
}

// Weeks for a month, Sunday-first (Israel).
export function monthGrid(year: number, month: number): Cell[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const startWeekday = first.getUTCDay(); // 0=Sun
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: toISO(new Date(Date.UTC(year, month, d))), day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function weekdayHe(dateStr: string): string {
  return WEEKDAYS_HE_FULL[parseUTC(dateStr).getUTCDay()];
}

// "שישי 25/09" (no slot)
export function shortLabelHe(dateStr: string): string {
  const d = parseUTC(dateStr);
  return `${weekdayHe(dateStr)} ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;
}

// "שישי 25/09 בערב"
export function fullLabelHe(dateStr: string, slot: SlotKey): string {
  return `${shortLabelHe(dateStr)} ${SLOT_MAP[slot].phrase}`;
}
