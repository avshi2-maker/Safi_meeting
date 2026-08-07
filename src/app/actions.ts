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
