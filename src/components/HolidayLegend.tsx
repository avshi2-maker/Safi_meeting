// HolidayLegend.tsx (src/components/HolidayLegend.tsx) · added 31.08.2026 (Asia/Jerusalem)
import { HOLIDAY_LEGEND } from "@/lib/holidays";

export default function HolidayLegend() {
  return (
    <div className="card holiday-card">
      <h3>חגים בתקופה</h3>
      <p className="subtle" style={{ marginTop: -4 }}>
        בתקופת החגים מתקיימים הרבה מפגשים משפחתיים — כדאי לשים לב אליהם בבחירת התאריכים. הימים מסומנים גם בלוח.
      </p>
      <ul className="hol-legend">
        {HOLIDAY_LEGEND.map((h, i) => (
          <li key={i}>
            <span className="hl-span">{h.span}</span>
            <span className="hl-name">{h.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
