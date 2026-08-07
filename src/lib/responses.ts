// responses.ts (src/lib/responses.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import type { Availability, ResponseRow, ResponseWithName } from "./types";

export async function getResponse(
  participantId: string,
): Promise<ResponseRow | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_responses")
    .select("participant_id, availability, note, submitted_at, updated_at")
    .eq("participant_id", participantId)
    .maybeSingle();
  if (error) throw error;
  return (data as ResponseRow) ?? null;
}

export async function upsertResponse(
  participantId: string,
  availability: Availability,
  note: string,
): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from("safi_responses")
    .upsert(
      {
        participant_id: participantId,
        availability,
        note: note.trim() || null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "participant_id" },
    );
  if (error) throw error;
}

export async function getAllResponses(): Promise<ResponseWithName[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_responses")
    .select(
      "participant_id, availability, note, submitted_at, updated_at, safi_participants(name)",
    );
  if (error) throw error;
  type Raw = ResponseRow & { safi_participants: { name: string } | null };
  return ((data ?? []) as unknown as Raw[]).map((r) => ({
    participant_id: r.participant_id,
    availability: r.availability,
    note: r.note,
    submitted_at: r.submitted_at,
    updated_at: r.updated_at,
    name: r.safi_participants?.name ?? "—",
  }));
}
