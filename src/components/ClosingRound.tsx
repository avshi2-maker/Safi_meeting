"use client";
// ClosingRound.tsx (src/components/ClosingRound.tsx) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { useEffect, useMemo, useState, useTransition } from "react";
import { publishFinalistsAction, lockFinalAction, reopenRoundAction } from "@/app/actions";
import { finalistKey } from "@/lib/roundView";
import type { RoundView } from "@/lib/roundView";
import FinalistBar from "./FinalistBar";
import PublicTally from "./PublicTally";
import LocationEditor from "./LocationEditor";

type ActionResult = { ok: boolean; error?: string };

export default function ClosingRound({ hasOptions }: { hasOptions: boolean }) {
  const [view, setView] = useState<RoundView | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  async function pull() {
    try { const r = await fetch("/api/round", { cache: "no-store" }); if (r.ok) setView(await r.json()); } catch { /* transient */ }
  }
  useEffect(() => { pull(); const t = setInterval(pull, 8000); return () => clearInterval(t); }, []);

  const finalists = view?.round.finalists ?? [];
  const counts = view?.counts ?? {};
  const total = view?.total ?? 0;
  const status = view?.round.status ?? "idle";
  const leaderKey = useMemo(() => {
    let b = ""; let bn = -1;
    for (const f of finalists) { const k = finalistKey(f); const n = counts[k] ?? 0; if (n > bn) { bn = n; b = k; } }
    return b;
  }, [finalists, counts]);
  useEffect(() => { if (!selectedKey && leaderKey) setSelectedKey(leaderKey); }, [leaderKey, selectedKey]);

  function act(fn: () => Promise<ActionResult>) {
    setErr("");
    start(async () => {
      const r = await fn();
      if (!r.ok) setErr(r.error === "unauthorized" ? "אין הרשאה" : r.error || "שגיאה");
      pull();
    });
  }
  function shareInvite() {
    const t = `משפחה יקרה 💛\nפתחנו סבב אישור למועד המפגש.\nכנסו, בחרו את השם שלכם וסמנו ✓ מה שמתאים:\n${location.origin}/confirm`;
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  }
  function shareAnnounce() {
    if (view?.round.announcement) window.open(`https://wa.me/?text=${encodeURIComponent(view.round.announcement)}`, "_blank");
  }

  if (!view) return <div className="card">טוען סבב…</div>;

  return (
    <div className="card">
      <h2>סבב אישור וסגירה</h2>
      {err && <div className="err">{err}</div>}

      {status === "idle" || finalists.length === 0 ? (
        <div>
          <p className="subtle">פרסמו את הצעות ה-AI כמועדים לאישור המשפחה.</p>
          <button className="btn btn-primary" onClick={() => act(() => publishFinalistsAction())} disabled={pending || !hasOptions}>פתיחת סבב אישור</button>
          {!hasOptions && <span className="subtle" style={{ marginInlineStart: 8 }}>הריצו קודם ניתוח AI.</span>}
        </div>
      ) : status === "open" ? (
        <div>
          <p className="subtle">בחרו מועד לנעילה (ברירת מחדל: המוביל), ושתפו את קישור האישור בקבוצה.</p>
          <FinalistBar finalists={finalists} counts={counts} total={total} leaderKey={leaderKey} selectedKey={selectedKey} onSelect={setSelectedKey} />
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn-lock" onClick={() => act(() => lockFinalAction(selectedKey))} disabled={pending || !selectedKey || (counts[selectedKey] ?? 0) === 0} title="פעולה זו מתבצעת על ידי אבשי בלבד">🔒 נעילת מועד סופי</button>
            <button className="btn btn-green" onClick={shareInvite}>🟢 שליחת קישור האישור</button>
            <button className="btn btn-ghost" onClick={() => act(() => publishFinalistsAction())}>עדכון מהניתוח האחרון</button>
          </div>
          {selectedKey && (counts[selectedKey] ?? 0) === 0 && (
            <p className="save-nudge">אף אחד עוד לא אישר את המועד הזה — שתפו את קישור האישור וחכו לאישור ראשון.</p>
          )}
        </div>
      ) : (
        <div>
          <div className="final-card">
            <div className="final-kick">נעול · נקבע 🎉</div>
            <div className="final-when">{view.round.final?.label_he}</div>
            {view.round.announcement && <pre className="final-ann">{view.round.announcement}</pre>}
          </div>
          <div className="row">
            <button className="btn btn-green" onClick={shareAnnounce}>🟢 שליחת ההודעה לקבוצה</button>
            <button className="btn btn-ghost" onClick={() => act(() => reopenRoundAction())}>פתיחה מחדש</button>
          </div>
        </div>
      )}

      {(status === "open" || status === "locked") && (
        <div style={{ marginTop: 14 }}><LocationEditor location={view.round.location} onSaved={pull} /></div>
      )}

      {finalists.length > 0 && <div style={{ marginTop: 14 }}><PublicTally people={view.people} finalists={finalists} mode="confirmation" /></div>}
    </div>
  );
}
