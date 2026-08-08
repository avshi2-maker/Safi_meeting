// route.ts (src/app/go/route.ts) · updated 08.08.2026 11:15 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { getRound } from "@/lib/round";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Short, clean nav link -> redirects into the meeting's Waze location.
export async function GET(req: Request) {
  const round = await getRound();
  const waze = round.location?.waze;
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(waze || `${origin}/confirm`);
}
