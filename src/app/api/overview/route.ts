// route.ts (src/app/api/overview/route.ts) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { tallyPrefs } from "@/lib/prefs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Read-only live overview for the picking screen (no secrets exposed).
export async function GET() {
  const [participants, responses] = await Promise.all([
    getParticipants(),
    getAllResponses(),
  ]);
  const counts: Record<string, number> = {};
  for (const r of responses) {
    for (const date of Object.keys(r.availability || {})) {
      if ((r.availability[date]?.slots || []).length > 0) counts[date] = (counts[date] ?? 0) + 1;
    }
  }
  const people = responses.map((r) => ({
    id: r.participant_id,
    name: r.name,
    dates: Object.keys(r.availability || {}).sort().map((d) => ({
      date: d,
      slots: r.availability[d]?.slots ?? [],
    })),
  }));
  return NextResponse.json({
    total: participants.length,
    responded: responses.length,
    counts,
    people,
    prefs: tallyPrefs(responses),
  });
}
