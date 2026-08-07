"use client";
// ResponseTracker.tsx (src/components/ResponseTracker.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)

interface Props {
  participants: { id: string; name: string }[];
  respondedIds: Set<string>;
}

export default function ResponseTracker({ participants, respondedIds }: Props) {
  const done = participants.filter((p) => respondedIds.has(p.id));
  const pending = participants.filter((p) => !respondedIds.has(p.id));
  return (
    <div className="card">
      <h2>מצב תגובות</h2>
      <div className="count">{done.length}<small> / {participants.length} השיבו</small></div>
      <div className="pills" style={{ marginTop: 10 }}>
        {done.map((p) => <span key={p.id} className="pill done">✓ {p.name}</span>)}
        {pending.map((p) => <span key={p.id} className="pill pending">ממתין · {p.name}</span>)}
      </div>
    </div>
  );
}
