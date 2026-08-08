"use client";
// AvailabilityForm.tsx (src/components/AvailabilityForm.tsx) · updated 07.08.2026 20:55 (Asia/Jerusalem)
import { useMemo, useState, useTransition } from "react";
import { SLOTS } from "@/lib/slots";
import { WINDOW_MONTHS, shortLabelHe } from "@/lib/dates";
import { saveAvailabilityAction } from "@/app/actions";
import type { Availability, Preferences, SlotKey } from "@/lib/types";
import MonthCalendar from "./MonthCalendar";
import BackButton from "./BackButton";
import PreferencesSelector from "./PreferencesSelector";
import LiveSync from "./LiveSync";

const ALL_SLOTS: SlotKey[] = SLOTS.map((s) => s.key);

function hm(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  participant: { id: string; name: string };
  existing: { availability: Availability; preferences: Preferences; note: string | null } | null;
}

export default function AvailabilityForm({ participant, existing }: Props) {
  const [av, setAv] = useState<Availability>(existing?.availability ?? {});
  const [prefs, setPrefs] = useState<Preferences>(existing?.preferences ?? { activities: [] });
  const [note, setNote] = useState(existing?.note ?? "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const selected = useMemo(() => new Set(Object.keys(av)), [av]);
  const sortedDates = useMemo(() => Object.keys(av).sort(), [av]);
  const totalPicked = sortedDates.length;

  function toggleDate(date: string) {
    setSaved(false);
    setAv((prev) => {
      const next = { ...prev };
      if (next[date]) delete next[date];
      else next[date] = { slots: [...ALL_SLOTS], pickedAt: new Date().toISOString() };
      return next;
    });
  }

  function toggleSlot(date: string, slot: SlotKey) {
    setSaved(false);
    setAv((prev) => {
      const cur = prev[date] ?? { slots: [], pickedAt: new Date().toISOString() };
      const has = cur.slots.includes(slot);
      const nextSlots = has ? cur.slots.filter((s) => s !== slot) : [...cur.slots, slot];
      const next = { ...prev };
      if (nextSlots.length === 0) delete next[date];
      else next[date] = { ...cur, slots: nextSlots };
      return next;
    });
  }

  function setRemark(date: string, text: string) {
    setSaved(false);
    setAv((prev) => {
      const cur = prev[date];
      if (!cur) return prev;
      return { ...prev, [date]: { ...cur, remark: text } };
    });
  }

  function save() {
    setErr("");
    start(async () => {
      const res = await saveAvailabilityAction(participant.id, av, prefs, note);
      if (res.ok) setSaved(true);
      else setErr(res.error || "שגיאה בשמירה");
    });
  }

  const dirty = totalPicked > 0 && !saved;
  const saveLabel = pending ? "שומר…" : saved ? "✓ נשמר — תודה!" : "שמירת הזמינות שלי";
  const btnCls =
    "btn-save" + (saved ? " saved" : "") + (dirty && !pending ? " attn" : "");

  return (
    <main className="wrap respond-wrap">
      <BackButton />
      <div className="hero">
        <div className="kick">שלום {participant.name} 👋</div>
        <h1>מתי נוח לכם להיפגש?</h1>
        <p className="subtle">לחצו על תאריכים (יום שלם — אפשר לצמצם לחלקי-יום ולהוסיף הערה לכל תאריך).</p>
      </div>

      <div className="card photo-card mobile-only"><img src="/safi_4helmets.png" alt="ספי" /></div>

      <div className="respond-grid">
        <div className="respond-main">
          <div className="card">
            <h2>בחירת תאריכים</h2>
            {WINDOW_MONTHS.map((m) => (
              <MonthCalendar key={`${m.year}-${m.month}`} year={m.year} month={m.month}
                selected={selected} onToggle={toggleDate} />
            ))}
          </div>

          {totalPicked > 0 && (
            <div className="card">
              <h2>פירוט לכל תאריך ({totalPicked})</h2>
              {sortedDates.map((date) => (
                <div key={date} className="daycard">
                  <div className="dayhead">
                    <span className="d">{shortLabelHe(date)}</span>
                    {av[date].pickedAt && <span className="picked-at">נבחר {hm(av[date].pickedAt)}</span>}
                    <button className="chip x" onClick={() => toggleDate(date)}>מחיקה ✕</button>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {SLOTS.map((s) => {
                      const on = (av[date].slots ?? []).includes(s.key);
                      const cls = "chip" + (on ? " on" : "");
                      return (
                        <button key={s.key} className={cls} onClick={() => toggleSlot(date, s.key)}>{s.he}</button>
                      );
                    })}
                  </div>
                  <input className="input day-remark" value={av[date].remark ?? ""} placeholder="הערה לתאריך זה (לא חובה) — לדוגמה: רק אחרי 19:00"
                    onChange={(e) => setRemark(date, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3>העדפות לפעילות</h3>
            <PreferencesSelector value={prefs} onChange={(p) => { setPrefs(p); setSaved(false); }} />
          </div>

          <div className="card">
            <h3>הערה כללית (לא חובה)</h3>
            <textarea className="input" value={note} placeholder="לדוגמה: בחו״ל 10–20/10, כל ערב מלבד שלישי…"
              onChange={(e) => { setNote(e.target.value); setSaved(false); }} />
          </div>
        </div>

        <aside className="respond-side">
          <LiveSync selfId={participant.id} />

          <div className="card save-card desk-save">
            <div className="save-hero"><img src="/safi_4helmets.png" alt="ספי" /></div>
            {err && <div className="err" style={{ marginBottom: 8 }}>{err}</div>}
            <button className={btnCls} onClick={save} disabled={pending || totalPicked === 0}>{saveLabel}</button>
            {dirty && <p className="save-nudge">יש לכם בחירות שלא נשמרו — אל תשכחו לשמור!</p>}
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => window.print()}>🖨️ הדפסה</button>
          </div>
        </aside>
      </div>

      <div className="mobile-save">
        {err && <span className="err">{err}</span>}
        <button className={btnCls} onClick={save} disabled={pending || totalPicked === 0}>{saveLabel}</button>
      </div>
    </main>
  );
}
