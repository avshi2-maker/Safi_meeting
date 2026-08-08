# Safi — Handover · 07.08.2026 (evening, v2)

Family meeting scheduler. Pick availability (1 Sep – 30 Nov 2026), AI ranks the
best 2–3 date+time slots. Hebrew RTL. **LIVE.**

---

## ✅ Live now
- **URL:** https://safi-meeting.vercel.app (public — Vercel Deployment Protection is OFF).
- **Works on Android** with no login (that was the fix — disabling Vercel Auth).
- **Repo:** github.com/avshi2-maker/Safi_meeting (main). **Local:** C:\Safi_meeting.
- **DB:** shared sinks Supabase `givcxgzhfoetujhrjgvc`, tables `safi_participants`,
  `safi_responses` (has `preferences` jsonb column), `safi_suggestions`.
- **Next.js pinned to 15.5.23** (Vercel blocked 15.1.6 as vulnerable — do not downgrade).

## Shipped through v5
- **Landing** `/` — 50/50 split: Safi's full photo one side, family name-boxes
  (light-blue) the other; live digital clock on top. Heading "משפחות בן נון וביטי".
- **Respond** `/respond?p=<id>` — 3-month calendar (Sep–Nov 2026); each picked date
  is a light-blue card with a click-timestamp, per-slot chips (בוקר/צהריים/אחה״צ/ערב),
  a per-date remark, and delete. Preferences dropdown (מסעדה/טיול/פיקניק בחוף הים +
  free idea). General note. **Sticky save card** on the left (helmet photo + embossed
  save button that pulses when there are unsaved picks); **fixed bottom save bar** on
  mobile. Live read-only panel of what others chose (auto-refresh 8s). Print button.
- **Organizer** `/organizer` — passphrase-gated (SAFI_ORGANIZER_PASSPHRASE). Response
  tracker, overlap heatmap, family-preferences tally, "חישוב הצעות עם AI" → top-3
  date+slot with who's in/maybe/out, per-date remarks, Hebrew reason, live date-aware
  token+cost meter, 5-button export bar (Print/Outlook/Gmail/WhatsApp/Save). WhatsApp
  builds a ready-to-paste Hebrew invite/result for the family group.

## Env vars (Vercel → Settings → Environment Variables)
SUPABASE_URL = https://givcxgzhfoetujhrjgvc.supabase.co
SUPABASE_SERVICE_ROLE_KEY = sinks service_role key
ANTHROPIC_API_KEY = sk-ant-…
SAFI_ORGANIZER_PASSPHRASE = your word    (+ optional SAFI_MODEL = claude-sonnet-5)

---

## ▶️ AFTER BREAK — open items

### 1. Point the subdomain safi.marble-art.co.il
Same CNAME move as cash / kfar:
- Vercel → project safi-meeting → **Settings → Domains → Add** → `safi.marble-art.co.il`.
- Vercel shows a CNAME target (e.g. `cname.vercel-dns.com`).
- In your DNS host for marble-art.co.il, add a **CNAME**: host `safi` → that target.
- Wait for "Valid Configuration" in Vercel; SSL auto-issues. Then share the pretty URL.

### 2. Verify Safi photos on Win11 desktop
Reported: new photos show on Android but not on Win11 desktop. Likely just cache/deploy.
Check in this order:
- Confirm v5 was pushed (`git log -1` should show the v5 commit) and Vercel deployed green.
- Hard-refresh the desktop browser: **Ctrl + F5** (clears cached page).
- Confirm the images deployed: open
  https://safi-meeting.vercel.app/safi_backround.png and /safi_4helmets.png directly —
  both should load. If they 404, the PNGs weren't committed → run in C:\Safi_meeting:
  `git add public/safi_backround.png public/safi_4helmets.png` → commit → push.

## Standing deploy loop (how every change ships)
Extract overlay zip over C:\Safi_meeting → `npm run build` (verify green) → then a
separate step: `git add -A` / commit / `git push` (auto-deploys). One step, wait, next.

## Guardrails / do-not
- Do NOT run `npm audit fix --force` (bumps Next a major version, breaks build).
- Do NOT rotate the sinks service_role key (would take the live sinks CRM offline).
- All DB access is server-side via service-role; browser never gets a Supabase key.
