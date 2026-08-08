// route.ts (src/app/api/location/route.ts) · updated 08.08.2026 09:30 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { costUsd } from "@/lib/pricing";
import { buildWazeLink } from "@/lib/exportFormats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = process.env.SAFI_MODEL || "claude-sonnet-5";
const URL_RE = /(https?:\/\/[^\s]+)/i;

function extractJson(text: string): { place?: string; address?: string } | null {
  const c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(c.slice(s, e + 1)); } catch { return null; }
}

export async function POST(req: Request) {
  const jar = await cookies();
  const expected = process.env.SAFI_ORGANIZER_PASSPHRASE;
  if (!expected || jar.get("safi_org")?.value !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const text: string = (body?.text ?? "").toString().trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  // If the organizer pasted a maps/waze link, use it directly — no guessing.
  const url = text.match(URL_RE)?.[1];
  if (url) {
    const place = text.replace(URL_RE, "").trim() || "מיקום המפגש";
    return NextResponse.json({
      place, address: "", waze: url,
      usage: { input_tokens: 0, output_tokens: 0 }, model: MODEL, cost_usd: 0,
    });
  }

  let inputTokens = 0, outputTokens = 0;
  let place = text, address = "";
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: [
        "קבל תיאור מיקום מבולגן בעברית עבור מפגש משפחתי, ונקה אותו.",
        "החזר JSON תקין בלבד ללא טקסט נוסף: {\"place\":\"שם מקום קצר\",\"address\":\"כתובת מסודרת עם רחוב, מספר ועיר אם קיימים\"}.",
        "אל תמציא מספרי בית, רחובות או ערים שלא הופיעו במפורש. אם חסר מידע, השאר שדה ריק.",
      ].join("\n"),
      messages: [{ role: "user", content: text }],
    });
    inputTokens = msg.usage?.input_tokens ?? 0;
    outputTokens = msg.usage?.output_tokens ?? 0;
    const tb = msg.content.find((b) => b.type === "text");
    const parsed = extractJson(tb && "text" in tb ? tb.text : "");
    if (parsed) {
      place = (parsed.place || text).trim();
      address = (parsed.address || "").trim();
    }
  } catch {
    // fall back to raw text as place
  }

  const query = [address, place].filter(Boolean).join(" ") || text;
  return NextResponse.json({
    place, address, waze: buildWazeLink(query),
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    model: MODEL, cost_usd: costUsd(MODEL, inputTokens, outputTokens),
  });
}
