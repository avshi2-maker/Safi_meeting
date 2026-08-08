"use client";
// PublicTally.tsx (src/components/PublicTally.tsx) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { shortLabelHe } from "@/lib/dates";
import { SLOT_MAP } from "@/lib/slots";
import { ACTIVITY_HE } from "@/lib/prefs";
import { finalistKey } from "@/lib/roundView";
import type { PersonView } from "@/lib/roundView";
import type { Finalist } from "@/lib/types";

interface Props { people: PersonView[]; finalists: Finalist[]; }

export default function PublicTally({ people, finalists }: Props) {
  return (
    <div className="card">
      <h2>מה כולם בחרו — שקוף לכל המשפחה</h2>
      <p className="subtle" style={{ marginTop: -4 }}>כל התאריכים, ההערות וההעדפות של כל אחד.</p>
      {people.map((p) => {
        const confirmed = finalists.filter((f) => p.confirmations.includes(finalistKey(f)));
        return (
          <div key={p.id} className="person-card">
            <div className="person-head">
              <span className="person-name">{p.name}</span>
              {p.responded ? (
                <span className="pill done">✓ השיב/ה</span>
              ) : (
                <span className="pill pending">טרם השיב/ה</span>
              )}
            </div>

            {confirmed.length > 0 && (
              <div className="person-line">
                <span className="lbl">אישר/ה מועד:</span>
                {confirmed.map((f) => <span key={finalistKey(f)} className="tag yes">✓ {f.label_he}</span>)}
              </div>
            )}

            {(p.prefs.activities.length > 0 || p.prefs.freeIdea) && (
              <div className="person-line">
                <span className="lbl">העדפות:</span>
                {p.prefs.activities.map((a) => <span key={a} className="tag maybe">{ACTIVITY_HE[a] ?? a}</span>)}
                {p.prefs.freeIdea && <span className="tag maybe">💡 {p.prefs.freeIdea}</span>}
              </div>
            )}

            {p.dates.length > 0 && (
              <div className="person-dates">
                {p.dates.map((d) => (
                  <div key={d.date} className="person-date">
                    <span className="pd-label">{shortLabelHe(d.date)}</span>
                    <span className="pd-slots">{d.slots.map((s) => SLOT_MAP[s]?.he ?? s).join(" · ")}</span>
                    {d.remark && <span className="pd-remark">📝 {d.remark}</span>}
                  </div>
                ))}
              </div>
            )}

            {p.note && <div className="person-note">💬 {p.note}</div>}
          </div>
        );
      })}
    </div>
  );
}
