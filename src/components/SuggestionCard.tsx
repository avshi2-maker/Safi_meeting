"use client";
// SuggestionCard.tsx (src/components/SuggestionCard.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import type { SuggestionOption } from "@/lib/types";

interface Props { option: SuggestionOption; rank: number; total: number; }

export default function SuggestionCard({ option, rank, total }: Props) {
  return (
    <div className="option">
      <div className="top">
        <span className="rank">{rank}</span>
        <span className="when">{option.label_he}</span>
        <span className="score">{option.available.length}/{total} יכולים</span>
      </div>
      {option.reason_he && <div className="reason">{option.reason_he}</div>}
      <div className="names">
        {option.available.map((n) => <span key={n} className="tag yes">✓ {n}</span>)}
        {option.maybe.map((n) => <span key={n} className="tag maybe">❔ {n}</span>)}
        {option.unavailable.map((n) => <span key={n} className="tag no">{n}</span>)}
      </div>
    </div>
  );
}
