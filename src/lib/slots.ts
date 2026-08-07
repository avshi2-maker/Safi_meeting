// slots.ts (src/lib/slots.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
import type { SlotKey } from "./types";

export interface SlotDef {
  key: SlotKey;
  he: string; // chip label
  phrase: string; // for sentence labels
}

export const SLOTS: SlotDef[] = [
  { key: "morning", he: "בוקר", phrase: "בבוקר" },
  { key: "noon", he: "צהריים", phrase: "בצהריים" },
  { key: "afternoon", he: "אחה״צ", phrase: "אחר הצהריים" },
  { key: "evening", he: "ערב", phrase: "בערב" },
];

export const SLOT_MAP: Record<SlotKey, SlotDef> = SLOTS.reduce(
  (acc, s) => ((acc[s.key] = s), acc),
  {} as Record<SlotKey, SlotDef>,
);
