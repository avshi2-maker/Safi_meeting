"use client";
// OrganizerDashboard.tsx (src/components/OrganizerDashboard.tsx) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutOrganizerAction } from "@/app/actions";
import type { Availability, SuggestionOption } from "@/lib/types";
import type { PrefsTally } from "@/lib/prefs";
import ResponseTracker from "./ResponseTracker";
import HeatmapCalendar from "./HeatmapCalendar";
import SuggestionCard from "./SuggestionCard";
import ExportBar from "./ExportBar";
import ApiCostMeter, { MeterState } from "./ApiCostMeter";
import BackButton from "./BackButton";
import ClosingRound from "./ClosingRound";

interface RespItem {
  participant_id: string;
  name: string;
  availability: Availability;
  note: string | null;
}
interface Latest {
  options: SuggestionOption[];
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: number | null;
}
interface Props {
  participants: { id: string; name: string }[];
  responses: RespItem[];
  latest: Latest | null;
  prefs: PrefsTally;
}

export default function OrganizerDashboard({ participants, responses, latest, prefs }: Props) {
  const router = useRouter();
  const total = participants.length;
  const responded = responses.length;
  const respondedIds = useMemo(
    () => new Set(responses.map((r) => r.participant_id)), [responses],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of responses) {
      for (const date of Object.keys(r.availability || {})) {
        if ((r.availability[date]?.slots || []).length > 0) c[date] = (c[date] ?? 0) + 1;
      }
    }
    return c;
  }, [responses]);

  const [options, setOptions] = useState<SuggestionOption[]>(latest?.options ?? []);
  const initialMeter: MeterState = latest && latest.model
    ? {
        state: "done", model: latest.model,
        inputTokens: latest.tokens_in ?? 0, outputTokens: latest.tokens_out ?? 0,
        costUsd: latest.cost_usd ?? 0, elapsedMs: 0,
      }
    : { state: "idle" };
  const [meter, setMeter] = useState<MeterState>(initialMeter);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function analyze() {
    const startedAt = Date.now();
    setMeter({ state: "running", elapsedMs: 0 });
    timer.current = setInterval(() => {
      setMeter((m) => (m.state === "running" ? { ...m, elapsedMs: Date.now() - startedAt } : m));
    }, 100);
    try {
      const res = await fetch("/api/analyze", { method: "POST" });
      if (!res.ok) throw new Error(res.status === 401 ? "לא מורשה — התחברו מחדש" : "הניתוח נכשל");
      const data = await res.json();
      setOptions(data.options || []);
      setMeter({
        state: "done", model: data.model,
        inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens,
        costUsd: data.cost_usd, elapsedMs: Date.now() - startedAt,
      });
    } catch (e) {
      setMeter({ state: "error", error: (e as Error).message, elapsedMs: Date.now() - startedAt });
    } finally {
      if (timer.current) clearInterval(timer.current);
    }
  }

  async function shareInvite() {
    const origin = window.location.origin;
    const text = `שלום משפחה 💛\nמתאמים מפגש (ספטמבר–נובמבר).\nכנסו לקישור, בחרו את השם שלכם וסמנו מתי נוח לכם:\n${origin}/\nתודה!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function logout() {
    await logoutOrganizerAction();
    router.refresh();
  }

  return (
    <main className="wrap">
      <BackButton />
      <div className="hero">
        <div className="kick">תצוגת מארגן</div>
        <h1>סיכום ותיאום</h1>
      </div>

      <div className="row">
        <button className="btn btn-green" onClick={shareInvite}>🟢 שליחת הקישור לקבוצה</button>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={logout}>יציאה</button>
      </div>

      <ResponseTracker participants={participants} respondedIds={respondedIds} />
      <HeatmapCalendar counts={counts} total={total} />

      <div className="card">
        <h2>העדפות המשפחה</h2>
        <div className="pills">
          {prefs.counts.map((c) => (
            <span key={c.key} className="pill done">{c.he}: {c.n}</span>
          ))}
        </div>
        {prefs.freeIdeas.length > 0 && (
          <div className="remarks">
            <div className="remarks-h">רעיונות חופשיים</div>
            {prefs.freeIdeas.map((f, i) => (
              <div key={i} className="remark-line"><b>{f.name}:</b> {f.text}</div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>הצעות מועד חכמות</h2>
        <p className="subtle">ה-AI קורא את כל התשובות וההערות ומציע עד 3 מועדים אופטימליים.</p>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" onClick={analyze}
            disabled={meter.state === "running" || responded === 0}>
            {meter.state === "running" ? "מנתח…" : "✨ חישוב הצעות עם AI"}
          </button>
          {responded === 0 && <span className="subtle">אין עדיין תגובות לנתח.</span>}
        </div>

        <ApiCostMeter meter={meter} />

        {options.map((o, i) => (
          <SuggestionCard key={`${o.date}-${o.slot}`} option={o} rank={i + 1} total={total} />
        ))}

        {options.length > 0 && (
          <ExportBar options={options} responded={responded} total={total} />
        )}
      </div>

      <ClosingRound hasOptions={options.length > 0} />
    </main>
  );
}
