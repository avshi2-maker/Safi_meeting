// holidays.ts (src/lib/holidays.ts) · added 31.08.2026 (Asia/Jerusalem)
// Jewish holidays Sep–Dec 2026 (source: family PDF). Shown on the calendar for
// AWARENESS only — days stay pickable. Also fed to the AI so proposals note a
// holiday date, and rendered as a readable legend for the family.

export interface Holiday {
  short: string; // tiny label shown inside a calendar cell
  full: string; // full name (tooltip + legend)
}

// inclusive date range, ISO strings "YYYY-MM-DD"
function range(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const cur = new Date(startISO + "T00:00:00Z");
  const end = new Date(endISO + "T00:00:00Z");
  while (cur.getTime() <= end.getTime()) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

const RAW: { dates: string[]; short: string; full: string }[] = [
  { dates: ["2026-09-11"], short: "ערב ר״ה", full: "ערב ראש השנה" },
  { dates: ["2026-09-12"], short: "ראש השנה", full: "ראש השנה (יום א׳)" },
  { dates: ["2026-09-13"], short: "ראש השנה", full: "ראש השנה (יום ב׳)" },
  { dates: ["2026-09-20"], short: "ערב כיפור", full: "ערב יום כיפור" },
  { dates: ["2026-09-21"], short: "יום כיפור", full: "יום כיפור" },
  { dates: ["2026-09-25"], short: "ערב סוכות", full: "ערב סוכות" },
  { dates: ["2026-09-26"], short: "סוכות", full: "סוכות (יום א׳)" },
  { dates: range("2026-09-27", "2026-10-01"), short: "חוה״מ", full: "חול המועד סוכות" },
  { dates: ["2026-10-02"], short: "ערב שמח״ת", full: "הושענא רבה / ערב שמחת תורה" },
  { dates: ["2026-10-03"], short: "שמחת תורה", full: "שמיני עצרת / שמחת תורה" },
  { dates: ["2026-10-04"], short: "אסרו חג", full: "אסרו חג סוכות" },
  { dates: ["2026-12-04"], short: "ערב חנוכה", full: "ערב חנוכה (נר ראשון)" },
  { dates: range("2026-12-05", "2026-12-12"), short: "חנוכה", full: "חנוכה" },
];

export const HOLIDAYS: Record<string, Holiday> = (() => {
  const m: Record<string, Holiday> = {};
  for (const g of RAW) for (const d of g.dates) m[d] = { short: g.short, full: g.full };
  return m;
})();

export function holidayFor(date: string): Holiday | null {
  return HOLIDAYS[date] ?? null;
}

// Readable list for the family/organizer "חגים בתקופה" legend card.
export const HOLIDAY_LEGEND: { span: string; name: string }[] = [
  { span: "11/9", name: "ערב ראש השנה" },
  { span: "12–13/9", name: "ראש השנה" },
  { span: "20/9", name: "ערב יום כיפור" },
  { span: "21/9", name: "יום כיפור" },
  { span: "25/9", name: "ערב סוכות" },
  { span: "26/9", name: "סוכות (יום א׳)" },
  { span: "27/9–1/10", name: "חול המועד סוכות" },
  { span: "2/10", name: "הושענא רבה / ערב שמחת תורה" },
  { span: "3/10", name: "שמיני עצרת / שמחת תורה" },
  { span: "4/10", name: "אסרו חג" },
  { span: "4/12", name: "ערב חנוכה (נר ראשון)" },
  { span: "5–12/12", name: "חנוכה (8 ימים)" },
];

// Compact block for the AI prompt so proposals can flag a holiday date.
export function holidayPromptBlock(): string {
  return Object.keys(HOLIDAYS)
    .sort()
    .map((d) => `${d}: ${HOLIDAYS[d].full}`)
    .join("\n");
}
