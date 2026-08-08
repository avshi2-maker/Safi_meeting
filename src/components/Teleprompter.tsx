"use client";
// Teleprompter.tsx (src/components/Teleprompter.tsx) · updated 08.08.2026 14:10 (Asia/Jerusalem)
// Private organizer guide: reads live state and shows exactly what to do next.
import { useEffect, useState } from "react";
import type { RoundView } from "@/lib/roundView";

interface Props { responded: number; total: number; hasOptions: boolean; }

interface Step { title: string; now: string; sub?: string; done: boolean; }

export default function Teleprompter({ responded, total, hasOptions }: Props) {
  const [view, setView] = useState<RoundView | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const r = await fetch("/api/round", { cache: "no-store" });
        if (r.ok && alive) setView(await r.json());
      } catch { /* transient */ }
    }
    pull();
    const t = setInterval(pull, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const status = view?.round.status ?? "idle";
  const finalists = view?.round.finalists ?? [];
  const hasLocation = !!view?.round.location;
  const roundStarted = (status === "open" || status === "locked") && finalists.length > 0;
  const locked = status === "locked";
  const confirmedTotal = (view?.people ?? []).filter((p) => p.confirmations.length > 0).length;

  const steps: Step[] = [
    {
      title: "שליחת הזמנה לקבוצה",
      now: 'לחצו "🟢 שליחת קישור לקבוצה" והדביקו בוואטסאפ המשפחתי.',
      done: responded > 0,
    },
    {
      title: "איסוף זמינות → הרצת AI",
      now: `כשמספיק אנשים מילאו, לחצו "✨ 3 הצעות בלחיצה". עד כה ${responded}/${total}.`,
      sub: `${responded}/${total} מילאו`,
      done: hasOptions,
    },
    {
      title: "פתיחת סבב אישור",
      now: 'לחצו "פתיחת סבב אישור", ואז "🟢 שליחת קישור האישור" לקבוצה. אפשר גם להגדיר מיקום עם AI.',
      sub: hasLocation ? "מיקום הוגדר ✓" : "מיקום טרם הוגדר",
      done: roundStarted,
    },
    {
      title: "איסוף אישורים → נעילה",
      now: `ממתינים לאישורים (${confirmedTotal} אישרו). כשמוכנים — בחרו את המועד המוביל ולחצו "🔒 נעילת מועד סופי".`,
      sub: `${confirmedTotal} אישרו`,
      done: locked,
    },
    {
      title: "שליחת ההודעה לקבוצה",
      now: 'לחצו "🟢 שליחת ההודעה לקבוצה" — עם התאריך, המיקום, לינק Waze והמגיעים. סיימתם! 🎉',
      done: false,
    },
  ];

  let currentIdx = steps.findIndex((s) => !s.done);
  if (currentIdx === -1) currentIdx = steps.length - 1;
  const cur = steps[currentIdx];

  return (
    <div className="card teleprompter">
      <div className="tp-head" onClick={() => setOpen((o) => !o)}>
        <h2>🧭 מדריך מהיר — רק בשבילך</h2>
        <span className="tp-toggle">{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <>
          <div className="tp-now">
            <div className="tp-now-kick">עכשיו · שלב {currentIdx + 1} מתוך {steps.length}</div>
            <div className="tp-now-title">{cur.title}</div>
            <div className="tp-now-do">{cur.now}</div>
          </div>
          <ol className="tp-steps">
            {steps.map((s, i) => {
              const cls = s.done ? "done" : i === currentIdx ? "cur" : "todo";
              return (
                <li key={s.title} className={cls}>
                  <span className="tp-ic">{s.done ? "✓" : i + 1}</span>
                  <span className="tp-txt">{s.title}{s.sub ? <em> · {s.sub}</em> : null}</span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
