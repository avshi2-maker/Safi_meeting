// page.tsx (src/app/page.tsx) · updated 07.08.2026 18:40 (Asia/Jerusalem)
import Link from "next/link";
import { ensureSeeded, getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import AddPerson from "@/components/AddPerson";
import Clock from "@/components/Clock";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureSeeded();
  const [participants, responses] = await Promise.all([
    getParticipants(),
    getAllResponses(),
  ]);
  const done = new Set(responses.map((r) => r.participant_id));

  return (
    <main className="wrap has-bg">
      <div className="bg-photo" aria-hidden="true" />
      <div className="bg-scrim" aria-hidden="true" />

      <Clock />

      <div className="hero">
        <div className="kick">מפגש משפחתי · ספטמבר–נובמבר 2026</div>
        <h1>מתאמים תאריך שמתאים לכולם</h1>
        <p className="subtle">בחרו את השם שלכם, סמנו מתי נוח, וה-AI יציע את המועדים הכי מסונכרנים.</p>
      </div>

      <div className="card glass">
        <h2>מי אתם?</h2>
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

      <div className="foot">
        <Link href="/organizer" className="btn btn-ghost">תצוגת מארגן →</Link>
      </div>
    </main>
  );
}
