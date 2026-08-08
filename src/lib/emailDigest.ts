// emailDigest.ts (src/lib/emailDigest.ts) · updated 08.08.2026 15:00 (Asia/Jerusalem)

export interface DigestInput {
  changed: { name: string; confirmed: boolean }[];
  responded: number;
  total: number;
  roundStatus: "idle" | "open" | "locked";
  confirmedCount: number;
  finalLabel?: string | null;
  organizerUrl: string;
}

const STATUS_HE: Record<string, string> = {
  idle: "טרם נפתח סבב אישור",
  open: "סבב אישור פתוח",
  locked: "מועד ננעל",
};

export function buildDigest(d: DigestInput): { subject: string; text: string; html: string } {
  const n = d.changed.length;
  const subject = `Safi · ${n} עדכון${n === 1 ? "" : "ים"} חדש${n === 1 ? "" : "ים"} מהמשפחה`;

  const lines = d.changed.map((c) => `• ${c.name}${c.confirmed ? " (אישר/ה מועד)" : " (עדכון זמינות)"}`);
  const statusLine = `מצב: ${d.responded}/${d.total} מילאו · ${STATUS_HE[d.roundStatus]}${d.roundStatus !== "idle" ? ` · ${d.confirmedCount} אישרו` : ""}${d.finalLabel ? ` · נקבע: ${d.finalLabel}` : ""}`;

  const text = [
    "שלום אבשי,",
    `מאז הבדיקה האחרונה יש ${n} עדכונים במפגש המשפחתי:`,
    "",
    ...lines,
    "",
    statusLine,
    "",
    `לניהול ולעיבוד: ${d.organizerUrl}`,
    "",
    "(סיכום אוטומטי · 3 פעמים ביום)",
  ].join("\n");

  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;color:#3d2c22;line-height:1.6">
    <p>שלום אבשי,</p>
    <p>מאז הבדיקה האחרונה יש <b>${n}</b> עדכונים במפגש המשפחתי:</p>
    <ul>${d.changed.map((c) => `<li>${c.name}${c.confirmed ? " — אישר/ה מועד" : " — עדכון זמינות"}</li>`).join("")}</ul>
    <p style="background:#fdf6ec;border:1px solid #ecdcc8;border-radius:8px;padding:8px 12px">${statusLine}</p>
    <p><a href="${d.organizerUrl}" style="background:#e07a5f;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">פתיחת מסך המארגן ←</a></p>
    <p style="color:#8a7563;font-size:12px">סיכום אוטומטי · 3 פעמים ביום (08:00 · 15:00 · 20:00)</p>
  </div>`;

  return { subject, text, html };
}
