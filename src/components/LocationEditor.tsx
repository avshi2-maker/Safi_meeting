"use client";
// LocationEditor.tsx (src/components/LocationEditor.tsx) · updated 08.08.2026 12:10 (Asia/Jerusalem)
import { useState, useTransition } from "react";
import { saveLocationAction, clearLocationAction } from "@/app/actions";
import { buildWazeLink } from "@/lib/exportFormats";
import { MEETING_PLACE, MEETING_ADDRESS } from "@/lib/meeting";
import type { MeetLocation } from "@/lib/types";
import AiHint from "./AiHint";
import ApiCostMeter, { MeterState } from "./ApiCostMeter";

interface Suggestion { name: string; text: string; }

export default function LocationEditor({
  location, onSaved,
}: { location: MeetLocation | null; onSaved: () => void }) {
  const [text, setText] = useState("");
  // Location is fixed to Tali's house this round — prefill it so the organizer
  // only needs to paste the exact address / Waze link and save.
  const [place, setPlace] = useState(location?.place || MEETING_PLACE);
  const [address, setAddress] = useState(location?.address || MEETING_ADDRESS);
  const [waze, setWaze] = useState(location?.waze || buildWazeLink(MEETING_ADDRESS));
  const [reason, setReason] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [meter, setMeter] = useState<MeterState>({ state: "idle" });
  const [cleaned, setCleaned] = useState(true);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  async function run() {
    setErr(""); setSaved(false);
    setMeter({ state: "running", elapsedMs: 0 });
    const t0 = Date.now();
    try {
      const res = await fetch("/api/location", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "אין הרשאה" : "הבחירה נכשלה");
      const d = await res.json();
      setPlace(d.place || ""); setAddress(d.address || ""); setWaze(d.waze || "");
      setReason(d.reason_he || ""); setSuggestions(d.suggestions || []); setCleaned(true);
      setMeter({ state: "done", model: d.model, inputTokens: d.usage.input_tokens, outputTokens: d.usage.output_tokens, costUsd: d.cost_usd, elapsedMs: Date.now() - t0 });
    } catch (e) {
      setMeter({ state: "error", error: (e as Error).message, elapsedMs: Date.now() - t0 });
    }
  }

  function onAddress(v: string) { setAddress(v); setWaze(buildWazeLink([v, place].filter(Boolean).join(" "))); setSaved(false); }
  function onPlace(v: string) { setPlace(v); setWaze(buildWazeLink([address, v].filter(Boolean).join(" "))); setSaved(false); }

  function save() {
    setErr("");
    start(async () => {
      const r = await saveLocationAction({ place: place.trim(), address: address.trim(), waze });
      if (r.ok) { setSaved(true); onSaved(); } else setErr(r.error === "unauthorized" ? "אין הרשאה" : r.error || "שגיאה");
    });
  }
  function clear() {
    start(async () => {
      await clearLocationAction();
      setText(""); setPlace(""); setAddress(""); setWaze(""); setReason(""); setCleaned(false); setSaved(false);
      onSaved();
    });
  }

  return (
    <div className="loc-card">
      <h3>מיקום המפגש</h3>
      <p className="subtle" style={{ marginTop: -4 }}>ה-AI אוסף את כל הצעות המיקום מהמשפחה ובוחר מקום. אפשר להוסיף רמז או להדביק קישור Waze / Maps.</p>

      <textarea className="input" value={text} rows={2}
        placeholder="רמז אופציונלי — למשל 'עדיף מרכז', 'קרוב לספי', או הדביקו קישור Waze…"
        onChange={(e) => setText(e.target.value)} />
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={run} disabled={meter.state === "running"}>
          {meter.state === "running" ? "בוחר…" : "✨ בחר מיקום מהצעות המשפחה"}
        </button>
      </div>
      <AiHint line="כתבו בלגן (או כלום) — נאסוף את הצעות כולם ונבחר מקום + לינק לוויז." more="ה-AI קורא את מה שכל אחד הציע ובוחר מקום מרכזי ונוח. הוא לא ממציא כתובת מדויקת — לבית פרטי הכי בטוח להדביק כתובת או קישור Waze." />

      <ApiCostMeter meter={meter} />

      {cleaned && (
        <div className="loc-result">
          {reason && <div className="subtle" style={{ marginBottom: 8 }}>💡 {reason}</div>}
          <div className="label">שם המקום</div>
          <input className="input" value={place} onChange={(e) => onPlace(e.target.value)} />
          <div className="label">כתובת</div>
          <input className="input" value={address} onChange={(e) => onAddress(e.target.value)} />
          {waze && (
            <a className="btn btn-ghost" href={waze} target="_blank" rel="noreferrer" style={{ marginTop: 10, display: "inline-flex" }}>🧭 בדיקה ב-Waze</a>
          )}
          {suggestions.length > 0 && (
            <div className="remarks">
              <div className="remarks-h">הצעות המשפחה שנשקלו</div>
              {suggestions.map((s, i) => <div key={i} className="remark-line"><b>{s.name}:</b> {s.text}</div>)}
            </div>
          )}
          {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btn-green" onClick={save} disabled={pending}>{saved ? "✓ נשמר" : "שמירת המיקום"}</button>
            <button className="btn btn-ghost" onClick={clear} disabled={pending}>הסרה</button>
          </div>
        </div>
      )}
    </div>
  );
}
