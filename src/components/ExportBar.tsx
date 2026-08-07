"use client";
// ExportBar.tsx (src/components/ExportBar.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { useState } from "react";
import type { SuggestionOption } from "@/lib/types";
import { buildShareText, buildSubject } from "@/lib/exportFormats";

interface Props { options: SuggestionOption[]; responded: number; total: number; }

export default function ExportBar({ options, responded, total }: Props) {
  const [msg, setMsg] = useState("");
  const text = buildShareText(options, responded, total);
  const subject = buildSubject();
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
  function gmail() {
    const u = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(u, "_blank");
  }
  function outlook() {
    const u = `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(u, "_blank");
  }
  function print() { window.print(); }
  async function save() {
    try { await navigator.clipboard.writeText(text); flash("הועתק ✓"); }
    catch { /* clipboard blocked */ }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "safi-הצעות-מועד.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="exportbar">
        <button onClick={print}>🖨️ הדפסה</button>
        <button onClick={outlook}>📧 Outlook</button>
        <button onClick={gmail}>✉️ Gmail</button>
        <button onClick={whatsapp}>🟢 WhatsApp</button>
        <button onClick={save}>💾 שמירה</button>
      </div>
      {msg && <p className="saved" style={{ textAlign: "center", marginTop: 8 }}>{msg}</p>}
    </div>
  );
}
