"use client";
// AvailabilityForm.tsx (src/components/AvailabilityForm.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { SLOTS } from "@/lib/slots";
import { WINDOW_MONTHS, shortLabelHe } from "@/lib/dates";
import { saveAvailabilityAction } from "@/app/actions";
import type { Availability, SlotKey } from "@/lib/types";
import MonthCalendar from "./MonthCalendar";

const ALL_SLOTS: SlotKey[] = SLOTS.map((s) => s.key);

interface Props {
  participant: { id: string; name: string };
  existing: { availability: Availability; note: string | null } | null;
}

export default function AvailabilityForm({ participant, existing }: Props) {
  const [av, setAv] = useState<Availability>(existing?.availability ?? {});
  const [note, setNote] = useState(existing?.note ?? "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const selected = useMemo(() => new Set(Object.keys(av)), [av]);
  const sortedDates = useMemo(() => Object.keys(av).sort(), [av]);

  function toggleDate(date: string) {
    setSaved(false);
    setAv((prev) => {
      const next = { ...prev };
      if (next[date]) delete next[date];
      else next[date] = [...ALL_SLOTS];
      return next;
    });
  }

  function toggleSlot(date: string, slot: SlotKey) {
    setSaved(false);
    setAv((prev) => {
      const cur = prev[date] ?? [];
      const has = cur.includes(slot);
      const nextSlots = has ? cur.filter((s) => s !== slot) : [...cur, slot];
      const next = { ...prev };
      if (nextSlots.length === 0) delete next[date];
      else next[date] = nextSlots;
      return next;
    });
  }

  function save() {
    setErr("");
    start(async () => {
      const res = await saveAvailabilityAction(participant.id, av, note);
      if (res.ok) setSaved(true);
      else setErr(res.error || "שגיאה בשמירה");
    });
  }

  const totalPicked = sortedDates.length;

  return (
    <main className="wrap">
      <div className="hero">
        <div className="kick">שלום {participant.name} 👋</div>
        <h1>מתי נוח לכם להיפגש?</h1>
        <p className="subtle">
          לחצו על התאריכים שמתאימים (נבחרים כיום שלם — אפשר לצמצם לחלקי-יום למטה).
        </p>
      </div>

      <div className="card">
        <h2>בחירת תאריכים</h2>
        {WINDOW_MONTHS.map((m) => (
          <MonthCalendar key={`${m.year}-${m.month}`} year={m.year} month={m.month}
            selected={selected} onToggle={toggleDate} />
        ))}
      </div>

      {totalPicked > 0 && (
        <div className="card">
          <h2>שעות מועדפות ({totalPicked} תאריכים)</h2>
          <div className="slots-picked">
            {sortedDates.map((date) => (
              <div key={date} className="slotrow">
                <div className="d">{shortLabelHe(date)}</div>
                {SLOTS.map((s) => {
                  const on = (av[date] ?? []).includes(s.key);
                  const cls = "chip" + (on ? " on" : "");
                  return (
                    <button key={s.key} className={cls} onClick={() => toggleSlot(date, s.key)}>{s.he}</button>
                  );
                })}
                <button className="chip x" onClick={() => toggleDate(date)}>הסר ✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>הערה (לא חובה)</h3>
        <textarea className="input" value={note} placeholder="לדוגמה: בחו״ל 10–20/10, אחרי 19:00 עדיף…"
          onChange={(e) => { setNote(e.target.value); setSaved(false); }} />
      </div>

      {err && <div className="err">{err}</div>}
      <div className="row">
        <button className="btn btn-primary btn-block" onClick={save} disabled={pending || totalPicked === 0}>
          {pending ? "שומר…" : saved ? "✓ נשמר — תודה!" : "שמירת הזמינות שלי"}
        </button>
      </div>
      {saved && <p className="saved" style={{ textAlign: "center" }}>אפשר לחזור ולעדכן בכל שלב.</p>}
      <div className="foot"><Link href="/" className="btn btn-ghost">→ חזרה</Link></div>
    </main>
  );
}
