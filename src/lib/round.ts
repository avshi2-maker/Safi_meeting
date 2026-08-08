// round.ts (src/lib/round.ts) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import type { Finalist, Round, RoundStatus } from "./types";
export { optionKey, finalistKey } from "./roundView";

export async function getRound(): Promise<Round> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_round")
    .select("finalists, status, final, announcement")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { finalists: [], status: "idle", final: null, announcement: null };
  return {
    finalists: Array.isArray(data.finalists) ? (data.finalists as Finalist[]) : [],
    status: (data.status ?? "idle") as RoundStatus,
    final: (data.final as Finalist) ?? null,
    announcement: data.announcement ?? null,
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
  await patchRound({ finalists, status: "open", final: null, announcement: null });
}
export async function setFinal(final: Finalist, announcement: string): Promise<void> {
  await patchRound({ final, announcement, status: "locked" });
}
export async function reopenRound(): Promise<void> {
  await patchRound({ status: "open", final: null, announcement: null });
}
