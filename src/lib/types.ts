// types.ts (src/lib/types.ts) · updated 07.08.2026 19:30 (Asia/Jerusalem)

export type SlotKey = "morning" | "noon" | "afternoon" | "evening";

export interface DaySelection {
  slots: SlotKey[];
  pickedAt: string;
  remark?: string;
}

export type Availability = Record<string, DaySelection>;
export type RawAvailability = Record<string, SlotKey[] | DaySelection>;

export interface Preferences {
  activities: string[]; // activity keys
  freeIdea?: string;
}

export interface Participant {
  id: string;
  name: string;
  phone: string | null;
}

export interface ResponseRow {
  participant_id: string;
  availability: Availability;
  preferences: Preferences;
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
  date: string;
  slot: SlotKey;
  label_he: string;
  available: string[];
  maybe: string[];
  unavailable: string[];
  reason_he: string;
  remarks: OptionRemark[];
}

export interface AnalyzeResult {
  options: SuggestionOption[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
  cost_usd: number;
  responded: number;
  total: number;
}
