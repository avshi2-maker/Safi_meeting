"use client";
// ConfirmRound.tsx (src/components/ConfirmRound.tsx) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { confirmAction } from "@/app/actions";
import { finalistKey } from "@/lib/roundView";
import type { RoundView } from "@/lib/roundView";
import FinalistBar from "./FinalistBar";
import PublicTally from "./PublicTally";
import BackButton from "./BackButton";

export default function ConfirmRound() {
  const [view, setView] = useState<RoundView | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toggled, setToggled] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  async function pull() {
    try {
      const res = await fetch("/api/round", { cache: "no-store" });
      if (res.ok) setView(await res.json());
    } catch { /* transient */ }
  }
  useEffect(() => { pull(); const t = setInterval(pull, 8000); return () => clearInterval(t); }, []);

  const finalists = view?.round.finalists ?? [];
  const counts = view?.counts ?? {};
  const total = view?.total ?? 0;
  const leaderKey = useMemo(() => {
    let best = ""; let bn = -1;
    for (const f of finalists) { const k = finalistKey(f); const n = counts[k] ?? 0; if (n > bn) { bn = n; best = k; } }
    return best;
  }, [finalists, counts]);

  function pickName(id: string) {
    setSelectedId(id); setSaved(false);
    setToggled(view?.people.find((p) => p.id === id)?.confirmations ?? []);
  }
  function toggle(key: string) {
    setSaved(false);
    setToggled((t) => (t.includes(key) ? t.filter((k) => k !== key) : [...t, key]));
  }
  function save() {
    if (!selectedId) return;
    start(async () => { const r = await confirmAction(selectedId, toggled); if (r.ok) { setSaved(true); pull(); } });
  }

  if (!view) return <main className="wrap"><BackButton /><div className="card">טוען…</div></main>;

  if (view.round.status === "locked" && view.round.final) {
    return (
      <main className="wrap">
        <BackButton />
        <div className="final-card">
          <div className="final-kick">נקבע! 🎉</div>
          <div className="final-when">{view.round.final.label_he}</div>
          {view.round.announcement && <pre className="final-ann">{view.round.announcement}</pre>}
        </div>
        <PublicTally people={view.people} finalists={finalists} mode="confirmation" />
      </main>
    );
  }

  if (view.round.status !== "open" || finalists.length === 0) {
    return (
      <main className="wrap">
        <BackButton />
        <div className="card">
          <h2>סבב האישור עדיין לא נפתח</h2>
          <p className="subtle">אבשי יפתח סבב אישור לאחר איסוף הזמינות. בינתיים אפשר לבחור תאריכים בדף הראשי.</p>
          <Link href="/" className="btn btn-ghost">→ לדף הראשי</Link>
        </div>
      </main>
    );
  }

  const me = view.people.find((p) => p.id === selectedId);
  return (
    <main className="wrap">
      <BackButton />
      <div className="hero">
        <div className="kick">סבב אישור</div>
        <h1>אשרו את המועד שמתאים לכם</h1>
        <p className="subtle">בלחיצה אחת: סמנו ✓ בכל מועד שמתאים (אפשר יותר מאחד) — ולמטה רואים בשקיפות מלאה מה כל המשפחה בחרה ואישרה.</p>
      </div>

      <div className="card">
        <FinalistBar finalists={finalists} counts={counts} total={total} leaderKey={leaderKey}
          toggled={selectedId ? toggled : undefined} onToggle={selectedId ? toggle : undefined} />
        {!selectedId ? (
          <div style={{ marginTop: 16 }}>
            <h3>בחרו את השם שלכם כדי לאשר</h3>
            <div className="namegrid">
              {view.people.map((p) => (
                <button key={p.id} className="namebtn" onClick={() => pickName(p.id)}>{p.name}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 14 }}>
            <button className="btn-save" onClick={save} disabled={pending}>
              {pending ? "שומר…" : saved ? "✓ נשמר!" : `שמירת האישור של ${me?.name}`}
            </button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => setSelectedId(null)}>החלפת שם</button>
          </div>
        )}
      </div>

      <PublicTally people={view.people} finalists={finalists} mode="confirmation" />
    </main>
  );
}
