"use client";
// AddPerson.tsx (src/components/AddPerson.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPersonAction } from "@/app/actions";

export default function AddPerson() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setErr("");
    start(async () => {
      const res = await addPersonAction(name, phone);
      if (res.ok) {
        setName(""); setPhone(""); setOpen(false);
        router.refresh();
      } else {
        setErr(res.error || "שגיאה");
      }
    });
  }

  if (!open) {
    return (
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-ghost" onClick={() => setOpen(true)}>+ הוספת משתתף</button>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12 }}>
      <div className="label">שם</div>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" />
      <div className="label">טלפון (לא חובה)</div>
      <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+972 5X-XXX-XXXX" />
      {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" onClick={submit} disabled={pending}>
          {pending ? "מוסיף…" : "הוספה"}
        </button>
        <button className="btn btn-ghost" onClick={() => setOpen(false)}>ביטול</button>
      </div>
    </div>
  );
}
