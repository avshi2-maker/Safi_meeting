"use client";
// FinalistBar.tsx (src/components/FinalistBar.tsx) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { finalistKey } from "@/lib/roundView";
import type { Finalist } from "@/lib/types";

interface Props {
  finalists: Finalist[];
  counts: Record<string, number>;
  total: number;
  leaderKey?: string;
  selectedKey?: string;
  onSelect?: (key: string) => void;
  toggled?: string[];
  onToggle?: (key: string) => void;
}

export default function FinalistBar({
  finalists, counts, total, leaderKey, selectedKey, onSelect, toggled, onToggle,
}: Props) {
  return (
    <div className="finalists">
      {finalists.map((f, i) => {
        const key = finalistKey(f);
        const n = counts[key] ?? 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const isLeader = key === leaderKey;
        const isSel = key === selectedKey;
        const on = toggled?.includes(key);
        const cls =
          "finalist" + (isLeader ? " leader" : "") + (isSel ? " sel" : "") + (onSelect ? " clickable" : "");
        return (
          <div key={key} className={cls} onClick={onSelect ? () => onSelect(key) : undefined}>
            <div className="finalist-top">
              <span className="finalist-rank">אפשרות {i + 1}</span>
              {isLeader && <span className="finalist-lead">מוביל</span>}
            </div>
            <div className="finalist-when">{f.label_he}</div>
            <div className="finalist-bar"><div className="finalist-fill" style={{ width: `${pct}%` }} /></div>
            <div className="finalist-count">{n}/{total} אישרו הצעה זו</div>
            {onToggle && (
              <button className={"chip toggle" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); onToggle(key); }}>
                {on ? "✓ מתאים לי" : "סמנו שמתאים"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
