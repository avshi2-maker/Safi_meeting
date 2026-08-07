"use client";
// ApiCostMeter.tsx (src/components/ApiCostMeter.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)

export interface MeterState {
  state: "idle" | "running" | "done" | "error";
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  elapsedMs?: number;
  error?: string;
}

const ILS_PER_USD = 3.7;

export default function ApiCostMeter({ meter }: { meter: MeterState }) {
  if (meter.state === "idle") return null;
  if (meter.state === "error") {
    return <div className="meter"><span className="err">שגיאה: {meter.error || "ניתוח נכשל"}</span></div>;
  }
  const running = meter.state === "running";
  const inTok = meter.inputTokens ?? 0;
  const outTok = meter.outputTokens ?? 0;
  const usd = meter.costUsd ?? 0;
  const secs = ((meter.elapsedMs ?? 0) / 1000).toFixed(1);
  return (
    <div className="meter">
      {running && <span className="dot" />}
      <div className="m"><b>{running ? "…" : meter.model}</b><span>מודל</span></div>
      <div className="m"><b>{running ? "…" : inTok.toLocaleString()}</b><span>טוקן קלט</span></div>
      <div className="m"><b>{running ? "…" : outTok.toLocaleString()}</b><span>טוקן פלט</span></div>
      <div className="m"><b>{running ? "…" : `$${usd.toFixed(5)}`}</b><span>עלות</span></div>
      <div className="m"><b>{running ? "…" : `~₪${(usd * ILS_PER_USD).toFixed(4)}`}</b><span>בשקלים</span></div>
      <div className="m"><b>{secs}s</b><span>{running ? "רץ…" : "משך"}</span></div>
    </div>
  );
}
