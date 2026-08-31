"use client";
// PreferencesSelector.tsx (src/components/PreferencesSelector.tsx) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { useState } from "react";
import { ACTIVITIES, DEFAULT_ACTIVITY } from "@/lib/prefs";
import type { Preferences } from "@/lib/types";

interface Props { value: Preferences; onChange: (p: Preferences) => void; }

export default function PreferencesSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const activities = value.activities ?? [];
  const hasDefault = activities.includes(DEFAULT_ACTIVITY);

  function toggle(key: string) {
    const has = activities.includes(key);
    onChange({ ...value, activities: has ? activities.filter((k) => k !== key) : [...activities, key] });
  }

  const summary = activities.length
    ? ACTIVITIES.filter((a) => activities.includes(a.key)).map((a) => a.he).join(", ")
    : "בחירת העדפות…";

  return (
    <div className="prefs">
      <button className="prefs-toggle" onClick={() => setOpen((o) => !o)}>
        <span className={hasDefault ? "prefs-summary-default" : undefined}>העדפות: {summary}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="prefs-panel">
          {ACTIVITIES.map((a) => {
            const on = activities.includes(a.key);
            const cls = "chip" + (on ? " on" : "") + (a.key === DEFAULT_ACTIVITY ? " pref-family" : "");
            return (
              <button key={a.key} className={cls} onClick={() => toggle(a.key)}>{on ? "✓ " : ""}{a.he}</button>
            );
          })}
          <input className="input" style={{ marginTop: 10 }} value={value.freeIdea ?? ""} placeholder="רעיון חופשי משלכם…"
            onChange={(e) => onChange({ ...value, freeIdea: e.target.value })} />
        </div>
      )}
    </div>
  );
}
