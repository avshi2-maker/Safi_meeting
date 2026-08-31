"use client";
// HeatmapCalendar.tsx (src/components/HeatmapCalendar.tsx) · updated 31.08.2026 (Asia/Jerusalem)
// Organizer heatmap now also marks holiday days (tint + tiny label) for awareness.
import { MONTHS_HE, WEEKDAYS_HE_SHORT, WINDOW_MONTHS, monthGrid } from "@/lib/dates";
import { holidayFor } from "@/lib/holidays";

interface Props { counts: Record<string, number>; total: number; }

function shade(count: number, total: number): string {
  if (!count || total === 0) return "#ffffff";
  const a = 0.15 + 0.85 * (count / total);
  return `rgba(111, 174, 143, ${a.toFixed(3)})`;
}

export default function HeatmapCalendar({ counts, total }: Props) {
  return (
    <div className="card">
      <h2>מפת חפיפה</h2>
      <div className="heat-legend">ככל שהיום ירוק יותר — יותר אנשים פנויים בו (מתוך {total}). ימים כתומים הם חגים.</div>
      {WINDOW_MONTHS.map((m) => {
        const weeks = monthGrid(m.year, m.month);
        return (
          <div key={`${m.year}-${m.month}`} className="cal">
            <div className="cal-title">{MONTHS_HE[m.month]} {m.year}</div>
            <div className="cal-dow">
              {WEEKDAYS_HE_SHORT.map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="cal-grid">
              {weeks.flat().map((cell, i) => {
                if (!cell.date) return <div key={i} className="cal-cell empty" />;
                const c = counts[cell.date] ?? 0;
                const hol = holidayFor(cell.date);
                const style = { background: shade(c, total) };
                const title = `${cell.date}: ${c} פנויים${hol ? ` · ${hol.full}` : ""}`;
                return (
                  <div key={i} className={"heat-cell" + (hol ? " holiday" : "")} style={style} title={title}>
                    <span className="hc-day">{cell.day}</span>
                    {c > 0 && <span className="hc-count">{c}</span>}
                    {hol && <span className="hc-hol">{hol.short}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
