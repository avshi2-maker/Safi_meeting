// types.ts (src/lib/types.ts) · updated 07.08.2026 18:40 (Asia/Jerusalem)

export type SlotKey = "morning" | "noon" | "afternoon" | "evening";

// Per-date selection: chosen slots, when it was picked, and an optional remark.
export interface DaySelection {
  slots: SlotKey[];
  pickedAt: string; // ISO timestamp of the click
  remark?: string;
}

// availability: { "2026-09-04": { slots:["evening"], pickedAt:"...", remark:"אחרי 19:00" } }
// Legacy rows may still be Record<string, SlotKey[]> — normalized on read.
export type Availability = Record<string, DaySelection>;
export type RawAvailability = Record<string, SlotKey[] | DaySelection>;

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

export interface OptionRemark {
  name: string;
  text: string;
}

export interface SuggestionOption {
  date: string; // YYYY-MM-DD
  slot: SlotKey;
  label_he: string; // "שישי 25/09 בערב"
  available: string[]; // names
  maybe: string[];
  unavailable: string[];
  reason_he: string;
  remarks: OptionRemark[]; // per-date remarks tied to this date
}

export interface AnalyzeResult {
  options: SuggestionOption[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
  cost_usd: number;
  responded: number;
  total: number;
}
