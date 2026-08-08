// actions.ts (src/app/actions.ts) · updated 07.08.2026 12:10 (Asia/Jerusalem)
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addParticipant } from "@/lib/participants";
import { upsertResponse } from "@/lib/responses";
import type { Availability, Preferences } from "@/lib/types";

const ORG_COOKIE = "safi_org";

export async function addPersonAction(
  name: string,
  phone: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!name.trim()) return { ok: false, error: "חסר שם" };
  try {
    await addParticipant(name, phone);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveAvailabilityAction(
  participantId: string,
  availability: Availability,
  preferences: Preferences,
  note: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!participantId) return { ok: false, error: "חסר מזהה" };
  try {
    await upsertResponse(participantId, availability, preferences, note);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function checkPassphraseAction(
  pass: string,
): Promise<{ ok: boolean }> {
  const expected = process.env.SAFI_ORGANIZER_PASSPHRASE;
  if (expected && pass === expected) {
    const jar = await cookies();
    jar.set(ORG_COOKIE, pass, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return { ok: true };
  }
  return { ok: false };
}

export async function logoutOrganizerAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(ORG_COOKIE);
}

export async function isOrganizer(): Promise<boolean> {
  const expected = process.env.SAFI_ORGANIZER_PASSPHRASE;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(ORG_COOKIE)?.value === expected;
}

// --- confirmation round actions ---
import { getLatestSuggestion } from "@/lib/suggestions";
import { upsertConfirmations } from "@/lib/responses";
import { publishFinalists, setFinal, reopenRound, getRound, setLocation, finalistKey } from "@/lib/round";
import type { Finalist, MeetLocation } from "@/lib/types";

export async function publishFinalistsAction(): Promise<{ ok: boolean; error?: string; count?: number }> {
  if (!(await isOrganizer())) return { ok: false, error: "unauthorized" };
  const latest = await getLatestSuggestion();
  const opts = latest?.options ?? [];
  if (opts.length === 0) return { ok: false, error: "צריך קודם להריץ ניתוח AI" };
  const finalists: Finalist[] = opts.map((o) => ({ date: o.date, slot: o.slot, label_he: o.label_he }));
  try {
    await publishFinalists(finalists);
    return { ok: true, count: finalists.length };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function lockFinalAction(key: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isOrganizer())) return { ok: false, error: "unauthorized" };
  const round = await getRound();
  const chosen = round.finalists.find((f) => finalistKey(f) === key);
  if (!chosen) return { ok: false, error: "מועד לא נמצא" };
  try {
    await setFinal(chosen);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveLocationAction(loc: MeetLocation): Promise<{ ok: boolean; error?: string }> {
  if (!(await isOrganizer())) return { ok: false, error: "unauthorized" };
  try {
    await setLocation(loc);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function clearLocationAction(): Promise<{ ok: boolean; error?: string }> {
  if (!(await isOrganizer())) return { ok: false, error: "unauthorized" };
  try {
    await setLocation(null);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function reopenRoundAction(): Promise<{ ok: boolean; error?: string }> {
  if (!(await isOrganizer())) return { ok: false, error: "unauthorized" };
  try {
    await reopenRound();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// public: a participant confirms which finalists work for them
export async function confirmAction(participantId: string, keys: string[]): Promise<{ ok: boolean; error?: string }> {
  if (!participantId) return { ok: false, error: "חסר מזהה" };
  const round = await getRound();
  if (round.status !== "open") return { ok: false, error: "סבב האישור אינו פתוח" };
  const valid = new Set(round.finalists.map((f) => finalistKey(f)));
  const filtered = keys.filter((k) => valid.has(k));
  try {
    await upsertConfirmations(participantId, filtered);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
