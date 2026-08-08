// exportFormats.ts (src/lib/exportFormats.ts) · updated 08.08.2026 09:30 (Asia/Jerusalem)
import type { Finalist, MeetLocation, SuggestionOption } from "./types";

export function buildShareText(
  options: SuggestionOption[],
  responded: number,
  total: number,
): string {
  const lines: string[] = [];
  lines.push("🗓️ תיאום מפגש משפחתי — הצעות מועד");
  lines.push(`(על סמך ${responded} מתוך ${total} שהשיבו)`);
  lines.push("");
  options.forEach((o, i) => {
    lines.push(`${i + 1}. ${o.label_he} — ${o.available.length}/${total} יכולים`);
    if (o.available.length) lines.push(`   ✅ ${o.available.join(", ")}`);
    if (o.maybe.length) lines.push(`   ❔ אולי: ${o.maybe.join(", ")}`);
    if (o.unavailable.length) lines.push(`   ❌ לא יכולים: ${o.unavailable.join(", ")}`);
    if (o.reason_he) lines.push(`   💬 ${o.reason_he}`);
    (o.remarks ?? []).forEach((r) => lines.push(`   📝 ${r.name}: ${r.text}`));
    lines.push("");
  });
  lines.push("מה הכי מתאים לכם? תגיבו כאן 🙏");
  return lines.join("\n");
}

export function buildSubject(): string {
  return "תיאום מפגש משפחתי — הצעות מועד";
}

export function buildConfirmInvite(origin: string): string {
  return [
    "משפחה יקרה 💛",
    "פתחנו סבב אישור למועד המפגש.",
    "כנסו, בחרו את השם שלכם וסמנו ✓ מה שמתאים לכם:",
    `${origin}/confirm`,
    "אפשר גם לראות מה כולם בחרו. תודה!",
  ].join("\n");
}

export function buildAnnounce(
  final: Finalist,
  confirmers: { name: string; phone: string | null }[],
  location: MeetLocation | null,
): string {
  const lines: string[] = [];
  lines.push("🎉 נקבע! המפגש המשפחתי:");
  lines.push(`📅 ${final.label_he}`);
  if (location && location.place) {
    lines.push(`📍 ${location.place}${location.address ? ` — ${location.address}` : ""}`);
    if (location.waze) lines.push(`🧭 ניווט ב-Waze: ${location.waze}`);
  }
  lines.push("");
  if (confirmers.length) {
    lines.push(`מגיעים (${confirmers.length}):`);
    confirmers.forEach((c) => lines.push(`• ${c.name}${c.phone ? ` · ${c.phone}` : ""}`));
  }
  lines.push("");
  lines.push("נתראה! 💛");
  return lines.join("\n");
}

export function buildWazeLink(query: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}
