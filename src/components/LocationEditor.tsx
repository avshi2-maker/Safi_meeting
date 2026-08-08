"use client";
// LocationEditor.tsx (src/components/LocationEditor.tsx) · updated 08.08.2026 09:30 (Asia/Jerusalem)
import { useState, useTransition } from "react";
import { saveLocationAction, clearLocationAction } from "@/app/actions";
import { buildWazeLink } from "@/lib/exportFormats";
import type { MeetLocation } from "@/lib/types";
import AiHint from "./AiHint";
import ApiCostMeter, { MeterState } from "./ApiCostMeter";

export default function LocationEditor({
  location, onSaved,
}: { location: MeetLocation | null; onSaved: () => void }) {
  const [text, setText] = useState("");
  const [place, setPlace] = useState(location?.place ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [waze, setWaze] = useState(location?.waze ?? "");
  const [meter, setMeter] = useState<MeterState>({ state: "idle" });
  const [cleaned, setCleaned] = useState(!!location);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  async function clean() {
    if (!text.trim()) return;
    setErr(""); setSaved(false);
    setMeter({ state: "running", elapsedMs: 0 });
    const t0 = Date.now();
    try {
      const res = await fetch("/api/location", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "אין הרשאה" : "ניקוי נכשל");
      const d = await res.json();
      setPlace(d.place || ""); setAddress(d.address || ""); setWaze(d.waze || "");
      setCleaned(true);
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
      setText(""); setPlace(""); setAddress(""); setWaze(""); setCleaned(false); setSaved(false);
      onSaved();
    });
  }

  return (
    <div className="loc-card">
      <h3>מיקום המפגש</h3>
      <p className="subtle" style={{ marginTop: -4 }}>כתבו חופשי — שם מקום, מסעדה, כתובת, או הדביקו קישור Waze / Maps.</p>

      <textarea className="input" value={text} rows={2}
        placeholder="לדוגמה: אצל ספי ליד המרינה בהרצליה, מסעדת הדגים, ההגנה 5…"
        onChange={(e) => setText(e.target.value)} />
      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={clean} disabled={meter.state === "running" || !text.trim()}>
          {meter.state === "running" ? "מסדר…" : "✨ נקה וסדר לי את הכתובת"}
        </button>
      </div>
      <AiHint line="כתבו בלגן — נקבל כתובת מסודרת + לינק לוויז." more="ה-AI לא ממציא כתובות: אם משהו לא ברור הוא ישאיר ריק, ותוכלו להשלים ידנית. לבית פרטי — הכי בטוח להדביק כתובת מדויקת או קישור Waze." />

      <ApiCostMeter meter={meter} />

      {cleaned && (
        <div className="loc-result">
          <div className="label">שם המקום</div>
          <input className="input" value={place} onChange={(e) => onPlace(e.target.value)} />
          <div className="label">כתובת</div>
          <input className="input" value={address} onChange={(e) => onAddress(e.target.value)} />
          {waze && (
            <a className="btn btn-ghost" href={waze} target="_blank" rel="noreferrer" style={{ marginTop: 10, display: "inline-flex" }}>🧭 בדיקה ב-Waze</a>
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
