"use client";
// OrganizerGate.tsx (src/components/OrganizerGate.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkPassphraseAction } from "@/app/actions";

export default function OrganizerGate() {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setErr(false);
    start(async () => {
      const res = await checkPassphraseAction(pass);
      if (res.ok) router.refresh();
      else setErr(true);
    });
  }

  return (
    <main className="wrap">
      <div className="card gate">
        <h2>תצוגת מארגן</h2>
        <p className="subtle">הזינו את סיסמת המארגן כדי לראות את הסיכום וההצעות.</p>
        <input className="input" type="password" value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="סיסמה" />
        {err && <div className="err" style={{ marginTop: 8 }}>סיסמה שגויה</div>}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary btn-block" onClick={submit} disabled={pending}>
            {pending ? "בודק…" : "כניסה"}
          </button>
        </div>
      </div>
    </main>
  );
}
