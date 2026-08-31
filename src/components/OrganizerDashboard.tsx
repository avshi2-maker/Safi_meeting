"use client";
// OrganizerDashboard.tsx (src/components/OrganizerDashboard.tsx) · updated 11.08.2026 11:58 (Asia/Jerusalem)
// Top share button now sends the phase-2 CONFIRM message (AI proposal + /confirm link),
// not the old phase-1 "come submit dates" invite. Uses shared buildConfirmInvite().
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutOrganizerAction, resetForNewRoundAction } from "@/app/actions";
import type { Availability, SuggestionOption } from "@/lib/types";
import type { PrefsTally } from "@/lib/prefs";
import ResponseTracker from "./ResponseTracker";
import HeatmapCalendar from "./HeatmapCalendar";
import HolidayLegend from "./HolidayLegend";
import SuggestionCard from "./SuggestionCard";
import ExportBar from "./ExportBar";
import ApiCostMeter, { MeterState } from "./ApiCostMeter";
import BackButton from "./BackButton";
import ClosingRound from "./ClosingRound";
import AiHint from "./AiHint";
import Teleprompter from "./Teleprompter";
import { SITE_URL } from "@/lib/site";
import { buildConfirmInvite } from "@/lib/exportFormats";

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

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetErr, setResetErr] = useState("");

  async function doReset() {
    setResetErr("");
    setResetting(true);
    try {
      const r = await resetForNewRoundAction();
      if (!r.ok) {
        setResetErr(r.error === "unauthorized" ? "אין הרשאה — התחברו מחדש" : r.error || "האיפוס נכשל");
        setResetting(false);
        return;
      }
      setOptions([]);
      setMeter({ state: "idle" });
      setConfirmReset(false);
      setResetting(false);
      router.refresh();
    } catch (e) {
      setResetErr((e as Error).message);
      setResetting(false);
    }
  }

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

  function shareInvite() {
    // Phase-2: send the AI-proposal confirm message (+ /confirm link), not the old invite.
    window.open(`https://wa.me/?text=${encodeURIComponent(buildConfirmInvite(SITE_URL))}`, "_blank");
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
        <button className="btn btn-green" onClick={shareInvite}>🟢 שליחת הצעת המועד לאישור</button>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={logout}>יציאה</button>
      </div>

      <Teleprompter responded={responded} total={total} hasOptions={options.length > 0} />

      <ResponseTracker participants={participants} respondedIds={respondedIds} />
      <HeatmapCalendar counts={counts} total={total} />
      <HolidayLegend />

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
          <button
            className={"btn btn-primary" + (responded > 0 && options.length === 0 && meter.state !== "running" ? " attn-soft" : "")}
            onClick={analyze} disabled={meter.state === "running" || responded === 0}>
            {meter.state === "running" ? "חושב…" : "✨ 3 הצעות בלחיצה"}
          </button>
          {responded === 0 && <span className="subtle">אין עדיין תגובות לנתח.</span>}
        </div>
        <AiHint
          line="לחיצה אחת, 2 שניות — לא יורים על פיל 🐘 (ורק אתם רואים את זה)"
          more="ה-AI קורא את כל הזמינות וההערות ומציע 3 מועדים. זו הפעולה ה'חכמה' היחידה — והיא רק אצלכם, המשפחה לא רואה אותה בכלל." />

        <ApiCostMeter meter={meter} />

        {options.map((o, i) => (
          <SuggestionCard key={`${o.date}-${o.slot}`} option={o} rank={i + 1} total={total} />
        ))}

        {options.length > 0 && (
          <ExportBar options={options} responded={responded} total={total} />
        )}
      </div>

      <ClosingRound hasOptions={options.length > 0} />

      <div className="card reset-card">
        <h2>התחלת סבב חדש</h2>
        <p className="subtle">
          מנקה את כל התאריכים, האישורים וההצעות מהסבב הקודם — ומשאיר את רשימת השמות. אחרי האיפוס המשפחה ממלאה זמינות מחדש.
        </p>
        {resetErr && <div className="err">{resetErr}</div>}
        {!confirmReset ? (
          <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>🔄 התחלת סבב חדש (איפוס)</button>
        ) : (
          <div className="row" style={{ marginTop: 6 }}>
            <button className="btn-lock" onClick={doReset} disabled={resetting}>
              {resetting ? "מאפס…" : "כן, לאפס הכול"}
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)} disabled={resetting}>ביטול</button>
          </div>
        )}
      </div>
    </main>
  );
}
