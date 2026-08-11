// page.tsx (src/app/page.tsx) · updated 08.08.2026 12:50 (Asia/Jerusalem)
import Link from "next/link";
import { ensureSeeded, getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getRound } from "@/lib/round";
import AddPerson from "@/components/AddPerson";
import Clock from "@/components/Clock";
import LiveSync from "@/components/LiveSync";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeeded().catch(() => {});
  const [participants, responses, round] = await Promise.all([
    getParticipants().catch(() => []),
    getAllResponses().catch(() => []),
    getRound(),
  ]);
  const done = new Set(responses.map((r) => r.participant_id));

  return (
    <main className="wrap home">
      <div className="home-banner">
        <a className="qr-corner" href="/" title="לחצו על הברקוד לקישור מיידי לאתר">
          <img src="/safi_qr.png" alt="קוד QR לאתר" />
          <span>סרקו לנייד</span>
        </a>
        <div className="home-banner-title">🗓️ מתאמים מפגש משפחתי</div>
        <div className="home-banner-sub">ספטמבר–נובמבר 2026 · בוחרים יחד תאריך שמתאים לכולם</div>
      </div>

      <Clock />

      {round.status === "open" && (
        <Link href="/confirm" className="round-banner open">🗳️ נפתח סבב אישור — לחצו לאישור המועד שמתאים לכם וצפו בכל האישורים שנשלחו כולל פרטים</Link>
      )}
      {round.status === "locked" && round.final && (
        <Link href="/confirm" className="round-banner locked">🎉 נקבע! {round.final.label_he} — לחצו לפרטים</Link>
      )}

      <div className="home3">
        <div className="home3-names">
          <div className="card glass">
            <h2>משפחות בן נון וביטי</h2>
            <p className="subtle" style={{ marginTop: -2, marginBottom: 12 }}>בחרו את השם שלכם כדי לסמן תאריכים</p>
            <div className="namegrid">
              {participants.map((p) => {
                const cls = "namebtn" + (done.has(p.id) ? " done" : "");
                return (
                  <Link key={p.id} href={`/respond?p=${p.id}`} className={cls}>
                    {p.name}
                    {done.has(p.id) ? <span className="ok">✓ כבר מילא/ה</span> : <small>לחצו כדי לבחור מועדים</small>}
                  </Link>
                );
              })}
            </div>
            <AddPerson />
          </div>
        </div>

        <div className="home3-photo">
          <img src="/safi_backround.png" alt="ספי" />
        </div>

        <div className="home3-live">
          <LiveSync selfId="" title="מי כבר מילא/ה" />
        </div>
      </div>

      <div className="foot">
        <Link href="/organizer" className="btn btn-ghost">תצוגת מארגן — לשימוש אבשי בלבד →</Link>
      </div>
    </main>
  );
}
