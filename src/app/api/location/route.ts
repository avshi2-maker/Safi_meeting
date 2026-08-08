// route.ts (src/app/api/location/route.ts) · updated 08.08.2026 12:10 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { getAllResponses } from "@/lib/responses";
import { costUsd } from "@/lib/pricing";
import { buildWazeLink } from "@/lib/exportFormats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = process.env.SAFI_MODEL || "claude-sonnet-5";
const URL_RE = /(https?:\/\/[^\s]+)/i;

function extractJson(text: string): { place?: string; address?: string; reason_he?: string } | null {
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
  const hint: string = (body?.text ?? "").toString().trim();

  // Gather every family location suggestion.
  const responses = await getAllResponses();
  const suggestions = responses
    .map((r) => ({ name: r.name, text: (r.preferences.location ?? "").trim() }))
    .filter((s) => s.text);

  // If the organizer pasted a maps/waze link, use it directly.
  const url = hint.match(URL_RE)?.[1];
  if (url) {
    return NextResponse.json({
      place: hint.replace(URL_RE, "").trim() || "מיקום המפגש", address: "", waze: url,
      reason_he: "נעשה שימוש בקישור שהודבק.", suggestions,
      usage: { input_tokens: 0, output_tokens: 0 }, model: MODEL, cost_usd: 0,
    });
  }

  const familyBlock = suggestions.length
    ? suggestions.map((s) => `- ${s.name}: ${s.text}`).join("\n")
    : "(אין הצעות מהמשפחה)";

  let inputTokens = 0, outputTokens = 0;
  let place = hint || "מיקום המפגש", address = "", reason = "";
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: [
        "אתה בוחר מקום מפגש אחד למשפחה על סמך הצעות המיקום של כולם ורמז אופציונלי מהמארגן.",
        "בחר/סנתז מקום מרכזי ונוח שמתאים למרב האנשים.",
        "החזר JSON תקין בלבד: {\"place\":\"שם מקום קצר\",\"address\":\"כתובת מסודרת אם ידועה, אחרת ריק\",\"reason_he\":\"משפט קצר למה זה המקום\"}.",
        "אל תמציא כתובת מדויקת או מספר בית שלא סופקו. אם זו רק אזור — השאר address ריק.",
      ].join("\n"),
      messages: [{ role: "user", content: `הצעות המשפחה:\n${familyBlock}\n\nרמז מהמארגן: ${hint || "(אין)"}` }],
    });
    inputTokens = msg.usage?.input_tokens ?? 0;
    outputTokens = msg.usage?.output_tokens ?? 0;
    const tb = msg.content.find((b) => b.type === "text");
    const parsed = extractJson(tb && "text" in tb ? tb.text : "");
    if (parsed) {
      place = (parsed.place || place).trim();
      address = (parsed.address || "").trim();
      reason = (parsed.reason_he || "").trim();
    }
  } catch {
    // fall back to hint/first suggestion
    if (!hint && suggestions[0]) place = suggestions[0].text;
  }

  const query = [address, place].filter(Boolean).join(" ") || place;
  return NextResponse.json({
    place, address, waze: buildWazeLink(query), reason_he: reason, suggestions,
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    model: MODEL, cost_usd: costUsd(MODEL, inputTokens, outputTokens),
  });
}
