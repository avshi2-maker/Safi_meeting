// route.ts (src/app/api/round/route.ts) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getRound, finalistKey } from "@/lib/round";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public, full-transparency view for the family confirmation page.
export async function GET() {
  const [participants, responses, round] = await Promise.all([
    getParticipants(),
    getAllResponses(),
    getRound(),
  ]);

  const byId = new Map(responses.map((r) => [r.participant_id, r]));
  const people = participants.map((p) => {
    const r = byId.get(p.id);
    return {
      id: p.id,
      name: p.name,
      responded: !!r,
      note: r?.note ?? null,
      prefs: r?.preferences ?? { activities: [] },
      confirmations: r?.confirmations ?? [],
      dates: r
        ? Object.keys(r.availability).sort().map((d) => ({
            date: d,
            slots: r.availability[d]?.slots ?? [],
            remark: r.availability[d]?.remark ?? null,
          }))
        : [],
    };
  });

  const counts: Record<string, number> = {};
  for (const f of round.finalists) {
    const k = finalistKey(f);
    counts[k] = responses.filter((r) => r.confirmations.includes(k)).length;
  }

  return NextResponse.json({ round, total: participants.length, people, counts });
}
