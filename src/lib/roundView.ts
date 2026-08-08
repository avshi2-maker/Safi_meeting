// roundView.ts (src/lib/roundView.ts) · updated 08.08.2026 08:30 (Asia/Jerusalem)
// Pure helpers + view types shared by client + server (no server-only imports).
import type { Finalist, Round, SlotKey } from "./types";

export function optionKey(date: string, slot: SlotKey): string {
  return `${date}|${slot}`;
}
export function finalistKey(f: Finalist): string {
  return optionKey(f.date, f.slot);
}

export interface PersonView {
  id: string;
  name: string;
  responded: boolean;
  note: string | null;
  prefs: { activities: string[]; freeIdea?: string; location?: string };
  confirmations: string[];
  dates: { date: string; slots: SlotKey[]; remark: string | null }[];
}

export interface RoundView {
  round: Round;
  total: number;
  people: PersonView[];
  counts: Record<string, number>;
  stale?: boolean;
}
