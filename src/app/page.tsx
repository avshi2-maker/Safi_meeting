// page.tsx (src/app/page.tsx) · updated 07.08.2026 20:20 (Asia/Jerusalem)
import Link from "next/link";
import { ensureSeeded, getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getRound } from "@/lib/round";
import AddPerson from "@/components/AddPerson";
import Clock from "@/components/Clock";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeeded();
  const [participants, responses, round] = await Promise.all([
    getParticipants(),
    getAllResponses(),
    getRound(),
  ]);
  const done = new Set(responses.map((r) => r.participant_id));

  return (
    <main className="wrap home">
      <Clock />

      {round.status === "open" && (
        <Link href="/confirm" className="round-banner open">
          🗳️ נפתח סבב אישור — לחצו לאישור המועד שמתאים לכם
        </Link>
      )}
      {round.status === "locked" && round.final && (
        <Link href="/confirm" className="round-banner locked">
          🎉 נקבע! {round.final.label_he} — לחצו לפרטים
        </Link>
      )}

      <div className="hero">
        <div className="kick">מפגש משפחתי · ספטמבר–נובמבר 2026</div>
        <h1>מתאמים תאריך שמתאים לכולם</h1>
      </div>

      <div className="home-split">
        <div className="home-photo">
          <img src="/safi_backround.png" alt="ספי" />
        </div>

        <div className="home-content">
          <div className="card">
            <h2>משפחות בן נון וביטי</h2>
            <p className="subtle" style={{ marginTop: -2, marginBottom: 12 }}>בבקשה לבחור תאריכים למפגש בלחיצה על השם</p>
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
      </div>

      <div className="foot">
        <Link href="/organizer" className="btn btn-ghost">תצוגת מארגן — לשימוש אבשי בלבד →</Link>
      </div>
    </main>
  );
}
