// responses.ts (src/lib/responses.ts) · updated 08.08.2026 08:30 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import { normalizeAvailability } from "./availability";
import { normalizePrefs } from "./prefs";
import type { Availability, Preferences, ResponseRow, ResponseWithName } from "./types";

function normConfirmations(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((k) => typeof k === "string") : [];
}

export async function getResponse(participantId: string): Promise<ResponseRow | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_responses")
    .select("participant_id, availability, preferences, confirmations, note, submitted_at, updated_at")
    .eq("participant_id", participantId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...(data as ResponseRow),
    availability: normalizeAvailability(data.availability),
    preferences: normalizePrefs(data.preferences),
    confirmations: normConfirmations(data.confirmations),
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

export async function upsertConfirmations(participantId: string, keys: string[], note = ""): Promise<void> {
  const sb = getServiceClient();
  const existing = await getResponse(participantId);
  const prefs = existing?.preferences ?? { activities: [] };
  const nextPrefs = { ...prefs, confirmNote: note.trim() ? note.trim() : undefined };
  const { error } = await sb
    .from("safi_responses")
    .upsert({ participant_id: participantId, confirmations: keys, preferences: nextPrefs }, { onConflict: "participant_id" });
  if (error) throw error;
}

// Wipe every submitted response (availability, preferences, confirmations) so a
// new round starts clean. Names in safi_participants are untouched.
export async function clearAllResponses(): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb.from("safi_responses").delete().not("participant_id", "is", null);
  if (error) throw error;
}

export async function getAllResponses(): Promise<ResponseWithName[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_responses")
    .select(
      "participant_id, availability, preferences, confirmations, note, submitted_at, updated_at, safi_participants(name)",
    );
  if (error) throw error;
  type Raw = ResponseRow & { safi_participants: { name: string } | null };
  return ((data ?? []) as unknown as Raw[]).map((r) => ({
    participant_id: r.participant_id,
    availability: normalizeAvailability(r.availability),
    preferences: normalizePrefs(r.preferences),
    confirmations: normConfirmations(r.confirmations),
    note: r.note,
    submitted_at: r.submitted_at,
    updated_at: r.updated_at,
    name: r.safi_participants?.name ?? "—",
  }));
}
