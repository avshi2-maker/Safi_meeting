// exportFormats.ts (src/lib/exportFormats.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import type { SuggestionOption } from "./types";

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
    lines.push("");
  });
  lines.push("מה הכי מתאים לכם? תגיבו כאן 🙏");
  return lines.join("\n");
}

export function buildSubject(): string {
  return "תיאום מפגש משפחתי — הצעות מועד";
}
