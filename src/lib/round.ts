// round.ts (src/lib/round.ts) · updated 08.08.2026 09:30 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import type { Finalist, MeetLocation, Round, RoundStatus } from "./types";
export { optionKey, finalistKey } from "./roundView";

const EMPTY_ROUND: Round = {
  finalists: [], status: "idle", final: null, announcement: null, location: null, finalists_at: null,
};

export async function getRound(): Promise<Round> {
  const sb = getServiceClient();
  // Resilient: full select first; if a column is missing (migration lag) retry
  // without it; if anything still fails, return an idle round instead of crashing.
  let data: Record<string, unknown> | null = null;
  const full = await sb.from("safi_round")
    .select("finalists, status, final, announcement, location, finalists_at")
    .eq("id", 1).maybeSingle();
  if (full.error) {
    const base = await sb.from("safi_round")
      .select("finalists, status, final, announcement, location")
      .eq("id", 1).maybeSingle();
    if (base.error) return EMPTY_ROUND;
    data = base.data as Record<string, unknown> | null;
  } else {
    data = full.data as Record<string, unknown> | null;
  }
  if (!data) return EMPTY_ROUND;
  return {
    finalists: Array.isArray(data.finalists) ? (data.finalists as Finalist[]) : [],
    status: (data.status as RoundStatus) ?? "idle",
    final: (data.final as Finalist) ?? null,
    announcement: (data.announcement as string) ?? null,
    location: (data.location as MeetLocation) ?? null,
    finalists_at: (data.finalists_at as string) ?? null,
  };
}

async function patchRound(patch: Record<string, unknown>): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from("safi_round")
    .upsert({ id: 1, ...patch, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

export async function publishFinalists(finalists: Finalist[]): Promise<void> {
  await patchRound({ finalists, status: "open", final: null, finalists_at: new Date().toISOString() });
}
export async function setFinal(final: Finalist): Promise<void> {
  await patchRound({ final, status: "locked" });
}
export async function reopenRound(): Promise<void> {
  await patchRound({ status: "open", final: null });
}
export async function setLocation(location: MeetLocation | null): Promise<void> {
  await patchRound({ location });
}
// Start a fresh round: clear finalists, final pick, announcement and location,
// and return to idle. (Participant names live in safi_participants and are kept.)
export async function resetRound(): Promise<void> {
  await patchRound({
    finalists: [], status: "idle", final: null,
    announcement: null, location: null, finalists_at: null,
  });
}

export async function getLastNotified(): Promise<string | null> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("safi_round").select("last_notified").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data?.last_notified as string) ?? null;
}
export async function setLastNotified(ts: string): Promise<void> {
  await patchRound({ last_notified: ts });
}
