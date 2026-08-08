"use client";
// AiHint.tsx (src/components/AiHint.tsx) · updated 08.08.2026 09:30 (Asia/Jerusalem)
// Mobile-correct helper: an always-visible line (hover tooltips don't exist on touch)
// plus a tappable "?" that reveals a longer note.
import { useState } from "react";

export default function AiHint({ line, more }: { line: string; more?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ai-hint">
      <div className="ai-hint-row">
        <span className="ai-hint-line">{line}</span>
        {more && (
          <button className="ai-hint-q" onClick={() => setOpen((o) => !o)} aria-label="הסבר">?</button>
        )}
      </div>
      {more && open && <div className="ai-hint-more">{more}</div>}
    </div>
  );
}
