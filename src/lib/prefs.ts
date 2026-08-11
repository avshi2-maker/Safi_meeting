// prefs.ts (src/lib/prefs.ts) · updated 07.08.2026 19:30 (Asia/Jerusalem)
import type { Preferences, ResponseWithName } from "./types";

export const ACTIVITIES: { key: string; he: string }[] = [
  { key: "restaurant", he: "מסעדה" },
  { key: "trip", he: "טיול" },
  { key: "beach", he: "פיקניק בחוף הים" },
];

export const ACTIVITY_HE: Record<string, string> = ACTIVITIES.reduce(
  (a, x) => ((a[x.key] = x.he), a),
  {} as Record<string, string>,
);

export function normalizePrefs(raw: unknown): Preferences {
  const r = (raw ?? {}) as Partial<Preferences>;
  return {
    activities: Array.isArray(r.activities) ? r.activities.filter((k) => !!ACTIVITY_HE[k]) : [],
    freeIdea: typeof r.freeIdea === "string" ? r.freeIdea : undefined,
    location: typeof r.location === "string" ? r.location : undefined,
    confirmNote: typeof r.confirmNote === "string" ? r.confirmNote : undefined,
  };
}

export interface PrefsTally {
  counts: { key: string; he: string; n: number }[];
  freeIdeas: { name: string; text: string }[];
}

export function tallyPrefs(responses: ResponseWithName[]): PrefsTally {
  const counts = ACTIVITIES.map((a) => ({ key: a.key, he: a.he, n: 0 }));
  const freeIdeas: { name: string; text: string }[] = [];
  for (const r of responses) {
    const p = r.preferences || { activities: [] };
    for (const c of counts) if (p.activities?.includes(c.key)) c.n += 1;
    const idea = p.freeIdea?.trim();
    if (idea) freeIdeas.push({ name: r.name, text: idea });
  }
  return { counts, freeIdeas };
}
