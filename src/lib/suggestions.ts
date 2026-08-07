// suggestions.ts (src/lib/suggestions.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
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

export async function getLatestSuggestion(): Promise<StoredSuggestion | null> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("safi_suggestions")
    .select("id, created_at, options, model, tokens_in, tokens_out, cost_usd")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as StoredSuggestion) ?? null;
}
