// suggestions.ts (src/lib/suggestions.ts) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import { getServiceClient } from "./supabaseServer";
import type { SuggestionOption } from "./types";

export interface StoredSuggestion {
  id: string;
  created_at: string;
  options: SuggestionOption[];
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  cost_usd: number | null;
}

function sanitizeOption(o: Partial<SuggestionOption>): SuggestionOption {
  return {
    date: o.date ?? "",
    slot: (o.slot ?? "evening") as SuggestionOption["slot"],
    label_he: o.label_he ?? "",
    available: Array.isArray(o.available) ? o.available : [],
    maybe: Array.isArray(o.maybe) ? o.maybe : [],
    unavailable: Array.isArray(o.unavailable) ? o.unavailable : [],
    reason_he: o.reason_he ?? "",
    remarks: Array.isArray(o.remarks) ? o.remarks : [],
  };
}

export async function insertSuggestion(s: {
  options: SuggestionOption[];
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb.from("safi_suggestions").insert(s);
  if (error) throw error;
}

// Remove stored AI suggestions so the organizer dashboard starts empty next round.
export async function clearSuggestions(): Promise<void> {
  const sb = getServiceClient();
  const { error } = await sb.from("safi_suggestions").delete().not("id", "is", null);
  if (error) throw error;
}

export async function getLatestSuggestion(): Promise<StoredSuggestion | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_suggestions")
    .select("id, created_at, options, model, tokens_in, tokens_out, cost_usd")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const raw = data as StoredSuggestion;
  return {
    ...raw,
    options: Array.isArray(raw.options) ? raw.options.map(sanitizeOption) : [],
  };
}
