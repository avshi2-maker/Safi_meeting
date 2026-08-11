// route.ts (src/app/api/round/route.ts) · updated 08.08.2026 09:30 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getRound, finalistKey } from "@/lib/round";
import { buildAnnounce } from "@/lib/exportFormats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
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

  // Compute the final announcement live so it always reflects current location + confirmers.
  if (round.final) {
    const key = finalistKey(round.final);
    const confirmers = participants
      .filter((p) => byId.get(p.id)?.confirmations.includes(key))
      .map((p) => ({ name: p.name, phone: p.phone }));
    const origin = new URL(req.url).origin;
    round.announcement = buildAnnounce(round.final, confirmers, round.location, origin);
  }

  // Stale = someone changed availability after the finalists were published.
  let stale = false;
  if (round.status === "open" && round.finalists.length > 0 && round.finalists_at) {
    const pub = new Date(round.finalists_at).getTime();
    stale = responses.some((r) => new Date(r.updated_at).getTime() > pub);
  }

  return NextResponse.json({ round, total: participants.length, people, counts, stale });
  } catch (e) {
    console.error("round error:", (e as Error).message);
    return NextResponse.json({
      round: { finalists: [], status: "idle", final: null, announcement: null, location: null, finalists_at: null },
      total: 0, people: [], counts: {}, stale: false,
    });
  }
}
