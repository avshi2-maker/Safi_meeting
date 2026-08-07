// analyze.ts (src/lib/analyze.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import type {
  ResponseWithName,
  Participant,
  SlotKey,
  SuggestionOption,
} from "./types";
import { SLOTS, SLOT_MAP } from "./slots";
import { fullLabelHe } from "./dates";

export interface Candidate {
  date: string;
  slot: SlotKey;
  available: string[];
}

const VALID_SLOTS = new Set(SLOTS.map((s) => s.key));

function keyOf(date: string, slot: SlotKey): string {
  return `${date}|${slot}`;
}

// Build every (date, slot) that at least one person picked, with the roster,
// ranked by attendance then earliest date.
export function computeCandidates(responses: ResponseWithName[]): Candidate[] {
  const map = new Map<string, string[]>();
  for (const r of responses) {
    const av = r.availability || {};
    for (const date of Object.keys(av)) {
      const slots = Array.isArray(av[date]) ? av[date] : [];
      for (const slot of slots) {
        if (!VALID_SLOTS.has(slot)) continue;
        const k = keyOf(date, slot);
        const arr = map.get(k) ?? [];
        if (!arr.includes(r.name)) arr.push(r.name);
        map.set(k, arr);
      }
    }
  }
  const out: Candidate[] = [];
  for (const [k, names] of map.entries()) {
    const [date, slot] = k.split("|");
    out.push({ date, slot: slot as SlotKey, available: names });
  }
  out.sort((a, b) =>
    b.available.length - a.available.length || a.date.localeCompare(b.date),
  );
  return out;
}

export function candidateMap(cands: Candidate[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const c of cands) m.set(keyOf(c.date, c.slot), c.available);
  return m;
}

// Compact text of everyone's picks + notes, for the model prompt.
export function buildResponsesBlock(responses: ResponseWithName[]): string {
  const lines: string[] = [];
  for (const r of responses) {
    const av = r.availability || {};
    const parts = Object.keys(av)
      .sort()
      .map((d) => `${d}:${(av[d] || []).join(",")}`);
    lines.push(
      `- ${r.name}: ${parts.length ? parts.join(" | ") : "(ריק)"}${
        r.note ? `  [הערה: ${r.note}]` : ""
      }`,
    );
  }
  return lines.join("\n");
}

export function buildCandidateBlock(cands: Candidate[], limit = 14): string {
  return cands
    .slice(0, limit)
    .map(
      (c) =>
        `${c.date} | ${SLOT_MAP[c.slot].he} | ${c.available.length} זמינים: ${c.available.join(", ")}`,
    )
    .join("\n");
}

// Turn the model's picks into full options, deriving the roster server-side
// (never trusting the model for who is in/out).
export function assembleOptions(
  picks: { date: string; slot: string; reason_he?: string; maybe?: string[] }[],
  cmap: Map<string, string[]>,
  allNames: string[],
): SuggestionOption[] {
  const out: SuggestionOption[] = [];
  for (const p of picks.slice(0, 3)) {
    if (!VALID_SLOTS.has(p.slot as SlotKey)) continue;
    const slot = p.slot as SlotKey;
    const available = cmap.get(keyOf(p.date, slot)) ?? [];
    const maybe = (p.maybe ?? []).filter(
      (n) => allNames.includes(n) && !available.includes(n),
    );
    const unavailable = allNames.filter(
      (n) => !available.includes(n) && !maybe.includes(n),
    );
    out.push({
      date: p.date,
      slot,
      label_he: fullLabelHe(p.date, slot),
      available,
      maybe,
      unavailable,
      reason_he: p.reason_he?.trim() || "",
    });
  }
  return out;
}

// Deterministic top-3 if the model call fails.
export function fallbackOptions(
  cands: Candidate[],
  allNames: string[],
): SuggestionOption[] {
  return cands.slice(0, 3).map((c) => ({
    date: c.date,
    slot: c.slot,
    label_he: fullLabelHe(c.date, c.slot),
    available: c.available,
    maybe: [],
    unavailable: allNames.filter((n) => !c.available.includes(n)),
    reason_he: `${c.available.length} מתוך ${allNames.length} זמינים במועד זה.`,
  }));
}

export function buildSystemPrompt(): string {
  return [
    "אתה עוזר לתאם מפגש משפחתי אחד בין כל המשתתפים, בין 1.9.2026 ל-30.11.2026.",
    "מטרתך: לבחור עד 3 מועדים (תאריך + חלק-יום) שממקסמים את מספר המשתתפים הזמינים.",
    "בחר אך ורק מתוך רשימת המועדים המועמדים שסופקה. שים לב להערות (למשל מי בחו״ל).",
    "החזר JSON תקין בלבד, ללא טקסט נוסף וללא סימוני קוד, במבנה:",
    '{"options":[{"date":"YYYY-MM-DD","slot":"morning|noon|afternoon|evening","reason_he":"משפט אחד בעברית","maybe":["שם"]}]}',
    "השדה maybe אופציונלי — רק אם הערה יוצרת אי-ודאות לגבי מישהו.",
  ].join("\n");
}

export function buildUserPrompt(
  participants: Participant[],
  responses: ResponseWithName[],
  cands: Candidate[],
): string {
  const names = participants.map((p) => p.name).join(", ");
  return [
    `סה״כ ${participants.length} משתתפים: ${names}.`,
    `נענו ${responses.length}.`,
    "",
    "זמינות שהוגשה:",
    buildResponsesBlock(responses),
    "",
    "מועדים מועמדים (ממויינים לפי מספר זמינים):",
    buildCandidateBlock(cands),
    "",
    "בחר את 3 המועדים הטובים ביותר והחזר JSON כפי שהוגדר.",
  ].join("\n");
}
