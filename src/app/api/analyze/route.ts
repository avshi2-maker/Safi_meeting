// route.ts (src/app/api/analyze/route.ts) · updated 07.08.2026 18:40 (Asia/Jerusalem)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";
import { getParticipants } from "@/lib/participants";
import { getAllResponses } from "@/lib/responses";
import {
  computeCandidates,
  candidateMap,
  remarksByDate,
  assembleOptions,
  fallbackOptions,
  buildSystemPrompt,
  buildUserPrompt,
} from "@/lib/analyze";
import { costUsd } from "@/lib/pricing";
import { insertSuggestion } from "@/lib/suggestions";
import type { AnalyzeResult } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MODEL = process.env.SAFI_MODEL || "claude-sonnet-5";

function extractJson(text: string): { options?: unknown[] } | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST() {
  const jar = await cookies();
  const expected = process.env.SAFI_ORGANIZER_PASSPHRASE;
  if (!expected || jar.get("safi_org")?.value !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [participants, responses] = await Promise.all([
    getParticipants(),
    getAllResponses(),
  ]);
  const allNames = participants.map((p) => p.name);
  const total = participants.length;
  const responded = responses.length;

  const cands = computeCandidates(responses);
  const remarks = remarksByDate(responses);

  if (cands.length === 0) {
    const empty: AnalyzeResult = {
      options: [],
      usage: { input_tokens: 0, output_tokens: 0 },
      model: MODEL,
      cost_usd: 0,
      responded,
      total,
    };
    return NextResponse.json(empty);
  }

  const cmap = candidateMap(cands);
  let inputTokens = 0;
  let outputTokens = 0;
  let options = fallbackOptions(cands, allNames, remarks);

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(),
      messages: [
        { role: "user", content: buildUserPrompt(participants, responses, cands) },
      ],
    });
    inputTokens = msg.usage?.input_tokens ?? 0;
    outputTokens = msg.usage?.output_tokens ?? 0;
    const textBlock = msg.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(text);
    if (parsed && Array.isArray(parsed.options)) {
      const assembled = assembleOptions(parsed.options as never, cmap, allNames, remarks);
      if (assembled.length) options = assembled;
    }
  } catch {
    // keep deterministic fallback options
  }

  const cost = costUsd(MODEL, inputTokens, outputTokens);
  try {
    await insertSuggestion({
      options,
      model: MODEL,
      tokens_in: inputTokens,
      tokens_out: outputTokens,
      cost_usd: cost,
    });
  } catch {
    // non-fatal
  }

  const result: AnalyzeResult = {
    options,
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    model: MODEL,
    cost_usd: cost,
    responded,
    total,
  };
  return NextResponse.json(result);
}
