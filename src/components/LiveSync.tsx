"use client";
// LiveSync.tsx (src/components/LiveSync.tsx) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { useEffect, useState } from "react";
import { shortLabelHe } from "@/lib/dates";

interface Person { id: string; name: string; dates: { date: string; slots: string[] }[]; }
interface Overview { total: number; responded: number; people: Person[]; }

export default function LiveSync({ selfId, title = "מה שאר המשפחה כבר בחרו" }: { selfId: string; title?: string }) {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    let alive = true;
    async function pull() {
      try {
        const res = await fetch("/api/overview", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Overview;
        if (alive) setData(json);
      } catch { /* ignore transient */ }
    }
    pull();
    const t = setInterval(pull, 8000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const others = (data?.people ?? []).filter((p) => p.id !== selfId);

  return (
    <div className="card live">
      <h3>{title} <span className="live-dot" /></h3>
      <p className="subtle" style={{ marginTop: -4 }}>
        {data ? `${data.responded}/${data.total} השיבו · מתעדכן אוטומטית` : "טוען…"}
      </p>
      {others.length === 0 && data && (
        <p className="subtle">עדיין אף אחד אחר לא בחר. אתם מהראשונים 🙂</p>
      )}
      {others.map((p) => (
        <div key={p.id} className="live-person">
          <div className="live-name">{p.name}</div>
          <div className="live-chips">
            {p.dates.length === 0 && <span className="subtle">—</span>}
            {p.dates.map((d) => (
              <span key={d.date} className="live-chip">{shortLabelHe(d.date)}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
