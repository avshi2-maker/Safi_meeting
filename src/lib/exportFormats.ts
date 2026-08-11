// exportFormats.ts (src/lib/exportFormats.ts) · updated 11.08.2026 12:12 (Asia/Jerusalem)
// NO EMOJIS in any outgoing WhatsApp message — Avshi's phone renders them as black
// boxes. Plain Hebrew text only. buildConfirmInvite() is the single source of the
// phase-2 confirm message, used by both share buttons (OrganizerDashboard + ClosingRound).
import type { Finalist, MeetLocation, SuggestionOption } from "./types";
import { SITE_URL } from "./site";

export function buildShareText(
  options: SuggestionOption[],
  responded: number,
  total: number,
): string {
  const lines: string[] = [];
  lines.push("תיאום מפגש משפחתי — הצעות מועד");
  lines.push(`(על סמך ${responded} מתוך ${total} שהשיבו)`);
  lines.push("");
  options.forEach((o, i) => {
    lines.push(`${i + 1}. ${o.label_he} — ${o.available.length}/${total} יכולים`);
    if (o.available.length) lines.push(`   פנויים: ${o.available.join(", ")}`);
    if (o.maybe.length) lines.push(`   אולי: ${o.maybe.join(", ")}`);
    if (o.unavailable.length) lines.push(`   לא יכולים: ${o.unavailable.join(", ")}`);
    if (o.reason_he) lines.push(`   ${o.reason_he}`);
    (o.remarks ?? []).forEach((r) => lines.push(`   ${r.name}: ${r.text}`));
    lines.push("");
  });
  lines.push("מה הכי מתאים לכם? תגיבו כאן.");
  return lines.join("\n");
}

export function buildSubject(): string {
  return "תיאום מפגש משפחתי — הצעות מועד";
}

// Phase-2 confirm invite (the AI already collected everyone's dates; now the family
// approves the proposed date). Sent by BOTH share buttons — single source of truth.
export function buildConfirmInvite(origin: string): string {
  return [
    "שלום למשפחה",
    "קיבלנו מכולם מועדים מועדפים למפגש.",
    "בלחיצה אחת אפשר לאשר את המועד שמתאים לכם, וגם לראות מה כולם בחרו — הכל במקום אחד.",
    "לחצו, בחרו את השם שלכם וסמנו:",
    `${origin}/confirm`,
    "(30 שניות, ואפשר לשנות בכל רגע)",
  ].join("\n");
}

export function buildAnnounce(
  final: Finalist,
  confirmers: { name: string; phone: string | null }[],
  location: MeetLocation | null,
  origin?: string,
): string {
  const lines: string[] = [];
  lines.push("נקבע! המפגש המשפחתי:");
  lines.push(final.label_he);
  if (location && location.place) {
    lines.push(`מיקום: ${location.place}${location.address ? ` — ${location.address}` : ""}`);
    // Clean, tappable link on our own domain that redirects into Waze (no %D7 soup).
    if (location.waze) lines.push(`ניווט ב-Waze: ${SITE_URL}/go`);
  }
  lines.push("");
  if (confirmers.length) {
    lines.push(`מגיעים (${confirmers.length}):`);
    confirmers.forEach((c) => lines.push(`- ${c.name}${c.phone ? ` · ${c.phone}` : ""}`));
  }
  lines.push("");
  lines.push("נתראה!");
  return lines.join("\n");
}

export function buildWazeLink(query: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}
