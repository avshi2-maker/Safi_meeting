// availability.ts (src/lib/availability.ts) · updated 07.08.2026 18:40 (Asia/Jerusalem)
import type { Availability, DaySelection, RawAvailability, SlotKey } from "./types";

export function normalizeDay(v: SlotKey[] | DaySelection): DaySelection {
  if (Array.isArray(v)) return { slots: v, pickedAt: "" };
  return { slots: v.slots ?? [], pickedAt: v.pickedAt ?? "", remark: v.remark };
}

// Accepts legacy (array) or new (object) shapes and returns the new shape.
export function normalizeAvailability(raw: RawAvailability | null | undefined): Availability {
  const out: Availability = {};
  if (!raw) return out;
  for (const date of Object.keys(raw)) out[date] = normalizeDay(raw[date]);
  return out;
}

export function slotsOf(av: Availability, date: string): SlotKey[] {
  return av[date]?.slots ?? [];
}

export function remarkOf(av: Availability, date: string): string | undefined {
  const r = av[date]?.remark?.trim();
  return r ? r : undefined;
}
