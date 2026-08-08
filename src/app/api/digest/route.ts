// route.ts (src/app/api/digest/route.ts) · updated 08.08.2026 15:00 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import { getRound, getLastNotified, setLastNotified, finalistKey } from "@/lib/round";
import { buildDigest } from "@/lib/emailDigest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

export async function GET(req: Request) {
  // Only Vercel Cron (which sends the CRON_SECRET as a bearer) may trigger sends.
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return NextResponse.json({ error: "missing GMAIL_USER / GMAIL_APP_PASSWORD" }, { status: 500 });
  }
  const to = process.env.DIGEST_TO || user;
  const origin = new URL(req.url).origin;

  const [participants, responses, round, last] = await Promise.all([
    getParticipants(),
    getAllResponses(),
    getRound(),
    getLastNotified(),
  ]);
  const now = new Date().toISOString();

  // First run establishes a baseline without emailing.
  if (!last) {
    await setLastNotified(now);
    return NextResponse.json({ ok: true, baseline: true });
  }

  const cutoff = new Date(last).getTime();
  const changed = responses
    .filter((r) => new Date(r.updated_at).getTime() > cutoff)
    .map((r) => ({ name: r.name, confirmed: r.confirmations.length > 0 }));

  if (changed.length === 0) {
    await setLastNotified(now);
    return NextResponse.json({ ok: true, sent: false });
  }

  const finalKey = round.final ? finalistKey(round.final) : null;
  const confirmedCount = finalKey
    ? responses.filter((r) => r.confirmations.includes(finalKey)).length
    : responses.filter((r) => r.confirmations.length > 0).length;

  const { subject, text, html } = buildDigest({
    changed,
    responded: responses.length,
    total: participants.length,
    roundStatus: round.status,
    confirmedCount,
    finalLabel: round.final?.label_he ?? null,
    organizerUrl: `${origin}/organizer`,
  });

  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass },
    });
    await transport.sendMail({ from: `Safi <${user}>`, to, subject, text, html });
    await setLastNotified(now); // advance only after a successful send
    return NextResponse.json({ ok: true, sent: true, count: changed.length });
  } catch (e) {
    // leave the pointer so the next run retries this window
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
