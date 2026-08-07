// responses.ts (src/lib/responses.ts) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import { normalizeAvailability } from "./availability";
import { normalizePrefs } from "./prefs";
import type { Availability, Preferences, ResponseRow, ResponseWithName } from "./types";

export async function getResponse(participantId: string): Promise<ResponseRow | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_responses")
    .select("participant_id, availability, preferences, note, submitted_at, updated_at")
    .eq("participant_id", participantId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as ResponseRow),
    availability: normalizeAvailability(data.availability),
    preferences: normalizePrefs(data.preferences),
  };
}

export async function upsertResponse(
  participantId: string,
  availability: Availability,
  preferences: Preferences,
  note: string,
): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from("safi_responses")
    .upsert(
      {
        participant_id: participantId,
        availability,
        preferences,
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
      "participant_id, availability, preferences, note, submitted_at, updated_at, safi_participants(name)",
    );
  if (error) throw error;
  type Raw = ResponseRow & { safi_participants: { name: string } | null };
  return ((data ?? []) as unknown as Raw[]).map((r) => ({
    participant_id: r.participant_id,
    availability: normalizeAvailability(r.availability),
    preferences: normalizePrefs(r.preferences),
    note: r.note,
    submitted_at: r.submitted_at,
    updated_at: r.updated_at,
    name: r.safi_participants?.name ?? "—",
  }));
}
