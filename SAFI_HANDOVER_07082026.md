# Safi — Handover · 07.08.2026

Family meeting scheduler. Pick availability (1 Sep – 30 Nov 2026), AI ranks the
best 2–3 date+time slots. Hebrew RTL.

---

## ✅ Done so far
- **Supabase**: 3 tables created in the **sinks** project `givcxgzhfoetujhrjgvc`
  — `safi_participants`, `safi_responses`, `safi_suggestions` (RLS on, no public
  policies; all access server-side via service-role key). SQL already run.
- **Repo**: full app built, **build-tested green**, **pushed** to
  `github.com/avshi2-maker/Safi_meeting` (branch `main`).
- **Local**: `C:\Safi_meeting` (npm installed, `npm run build` green).

## ⛔ Where we paused
No Vercel project exists yet (the earlier import was cancelled). Everything is
ready to deploy.

---

## ▶️ RESUME HERE — 3 steps

### 1. Create the Vercel project
- Vercel → **Add New → Project**
- Import **avshi2-maker/Safi_meeting** (now auto-detects **Next.js**)
- Team **Sapirim** · Project Name **safi-meeting** · Root Directory **./**

### 2. Add these 4 env vars (in the import screen's Environment Variables, or later in Settings)
| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://givcxgzhfoetujhrjgvc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | the sinks project `eyJ…` service_role key (server-side only) |
| `ANTHROPIC_API_KEY` | your `sk-ant-…` (dedicated `safi-meeting` key) |
| `SAFI_ORGANIZER_PASSPHRASE` | your chosen word (gates `/organizer`) |

Optional: `SAFI_MODEL` (defaults to `claude-sonnet-5`).

### 3. Deploy → then verify
- Open `/` — should show 8 family names (seeded on first load) + "הוספת אדם".
- Open a name → `/respond` → pick dates + slots → save.
- Open `/organizer` → enter passphrase → tracker + heatmap → "חישוב הצעות עם AI".

After green: point a subdomain, e.g. **safi.marble-art.co.il** (Vercel → Domains).

---

## How it works
- `/` landing — pick your name (or add a person). Seeds the 8 contacts once.
- `/respond?p=<id>` — 3-month calendar (Sep/Oct/Nov 2026); tapping a date selects
  it as full-day, chips narrow to בוקר/צהריים/אחה״צ/ערב; free-text note; save = upsert
  (return with same name to edit).
- `/organizer` — passphrase-gated. Response tracker (X/8), overlap heatmap,
  "חישוב הצעות עם AI" → `/api/analyze` reads all answers + notes, ranks top 3 via
  Claude, shows attendees in/maybe/out + Hebrew reason.
- **Token+cost meter** — live, date-aware (Sonnet 5 intro $2/$10 → $3/$15 on 1 Sep).
- **Export bar** — Print / Outlook / Gmail / WhatsApp / Save. WhatsApp builds a
  ready-to-paste Hebrew message for the family group. Organizer also has a
  "שליחת הקישור לקבוצה" button that builds the invite message.

## Stack / conventions
- Next.js 15 (App Router, TypeScript, `src/`), server-side Supabase (service role),
  Anthropic SDK server-side. No client-side DB access. 32 files, all <200 lines,
  in-file timestamp headers.
- Deploy = `git push` to `main` (once Vercel is linked, it auto-deploys).

## If something's off
- **Build/deploy fails on env** → all 4 vars must be set on Production **and**
  Preview; `SUPABASE_SERVICE_ROLE_KEY` must be non-empty.
- **`/` errors on load** → service-role key wrong/empty, or SQL tables missing.
- **AI returns generic reasons** → still works; it falls back to deterministic
  top-3 by attendance if the model call fails. Check `ANTHROPIC_API_KEY`.
- **Do NOT** run `npm audit fix --force` (bumps Next a major version, breaks build).

## Data note
Tables live in the **shared sinks DB**. Never rotate that service_role key without
re-keying the sinks CRM too — rotating it knocks the live sinks site offline.
