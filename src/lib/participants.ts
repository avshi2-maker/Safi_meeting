// participants.ts (src/lib/participants.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import type { Participant } from "./types";

// Seed family list (upserted once, on first load, if the table is empty).
const SEED: { name: string; phone: string }[] = [
  { name: "איתי בן נון", phone: "+972 52-272-4888" },
  { name: "טלי", phone: "+972 52-700-0067" },
  { name: "ספי", phone: "+972 52-340-9649" },
  { name: "נירה", phone: "+972 52-264-5721" },
  { name: "תמי", phone: "+972 52-434-7550" },
  { name: "רויטל", phone: "+972 50-455-0154" },
  { name: "ענת", phone: "+972 50-541-0944" },
  { name: "אבשי", phone: "+972 50-523-1042" },
];

export async function ensureSeeded(): Promise<void> {
  const sb = getServiceClient();
  const { count, error } = await sb
    .from("safi_participants")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  if ((count ?? 0) === 0) {
    const { error: insErr } = await sb.from("safi_participants").insert(SEED);
    if (insErr) throw insErr;
  }
}

export async function getParticipants(): Promise<Participant[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_participants")
    .select("id, name, phone")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Participant[];
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_participants")
    .select("id, name, phone")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Participant) ?? null;
}

export async function addParticipant(name: string, phone: string): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb
    .from("safi_participants")
    .insert({ name: name.trim(), phone: phone.trim() || null });
  if (error) throw error;
}
