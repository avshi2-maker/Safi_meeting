// types.ts (src/lib/types.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)

export type SlotKey = "morning" | "noon" | "afternoon" | "evening";

// availability: { "2026-09-04": ["evening","noon"], ... }
export type Availability = Record<string, SlotKey[]>;

export interface Participant {
  id: string;
  name: string;
  phone: string | null;
}

export interface ResponseRow {
  participant_id: string;
  availability: Availability;
  note: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface ResponseWithName extends ResponseRow {
  name: string;
}

export interface SuggestionOption {
  date: string; // YYYY-MM-DD
  slot: SlotKey;
  label_he: string; // "שישי 25/09 בערב"
  available: string[]; // names
  maybe: string[];
  unavailable: string[];
  reason_he: string;
}

export interface AnalyzeResult {
  options: SuggestionOption[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
  cost_usd: number;
  responded: number;
  total: number;
}
