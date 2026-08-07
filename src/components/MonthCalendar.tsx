"use client";
// MonthCalendar.tsx (src/components/MonthCalendar.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { MONTHS_HE, WEEKDAYS_HE_SHORT, monthGrid } from "@/lib/dates";

interface Props {
  year: number;
  month: number; // 0-based
  selected: Set<string>;
  onToggle: (date: string) => void;
}

export default function MonthCalendar({ year, month, selected, onToggle }: Props) {
  const weeks = monthGrid(year, month);
  return (
    <div className="cal">
      <div className="cal-title">{MONTHS_HE[month]} {year}</div>
      <div className="cal-dow">
        {WEEKDAYS_HE_SHORT.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {weeks.flat().map((cell, i) => {
          if (!cell.date) return <div key={i} className="cal-cell empty" />;
          const on = selected.has(cell.date);
          const cls = "cal-cell" + (on ? " sel" : "");
          const d = cell.date;
          return (
            <div key={i} className={cls} onClick={() => onToggle(d)}>{cell.day}</div>
          );
        })}
      </div>
    </div>
  );
}
