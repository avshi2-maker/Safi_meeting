# Safi — Handover · 08.08.2026

Family meeting scheduler, full lifecycle. Hebrew RTL. **LIVE & complete.**

---

## ✅ Live now
- **Public URL:** https://safi.marble-art.co.il (custom domain, SSL, no login for family).
  Also https://safi-meeting.vercel.app. Vercel Deployment Protection is OFF (required).
- **Repo:** github.com/avshi2-maker/Safi_meeting (main). **Local:** C:\Safi_meeting.
- **DB:** shared sinks Supabase `givcxgzhfoetujhrjgvc`. Tables: `safi_participants`,
  `safi_responses` (cols incl. preferences, confirmations jsonb), `safi_suggestions`,
  `safi_round` (singleton id=1: finalists, status idle|open|locked, final, location).
- **Next.js pinned 15.5.23** (never downgrade — Vercel blocks 15.1.6).

## The full lifecycle (all built, v1–v8)
1. Family: scan QR / open link -> pick name -> `/respond` pick dates+slots+per-date
   remark+preferences+note -> save. (Live panel shows others; sticky pulsing save;
   mobile save bar; Safi photos.)
2. You `/organizer` (passphrase `SAFI_ORGANIZER_PASSPHRASE`): response tracker,
   overlap heatmap, prefs tally, **✨ 3 הצעות בלחיצה** (AI top-3, token+cost meter,
   5-button export bar). Everything AI/admin is organizer-only.
3. **סבב אישור וסגירה:** פתיחת סבב אישור (publish AI finalists) -> share `/confirm`
   link to group.
4. Family `/confirm`: pick name -> multi-✓ finalists -> save. Full transparency tally
   below (everyone's dates/slots/remarks/prefs/note/confirmations, 100% visible).
5. **מיקום המפגש:** type messy location (or paste Waze/Maps link) -> ✨ AI cleans to
   place+address+Waze navigate-link -> verify/edit -> save.
6. **🔒 נעילת מועד סופי** (server-enforced, Avshi-only) -> "נקבע!" announcement =
   date + 📍location + 🧭Waze + מגיעים (confirmers name+mobile) -> 🟢 send to group.

## ▶️ AFTER BREAK — 2 small fixes he approved (NOT yet built)
1. **Lock guard:** block "נעילת מועד סופי" until >=1 person has confirmed the chosen
   slot; show gentle note "אף אחד עוד לא אישר". (Prevents empty guest list.)
2. **Confirm-tally pill:** on `/confirm` PublicTally, the status pill currently reads
   availability ("השיב/ה" / "טרם השיב/ה") — change to confirmation wording
   ("אישר/ה" / "טרם אישר/ה") so it matches that page's purpose.

Optional polish he raised (not committed): the Waze line in the WhatsApp message shows
the %D7-encoded URL — make it a clean tappable label (or short link) so it reads nicely.

### Order-of-operations note (why his test showed empty מגיעים)
Availability (`/respond`) and confirmation (`/confirm`) are separate. The announcement
lists **confirmers only**. He locked before anyone confirmed -> empty list.
Manual workaround: `/organizer` -> **פתיחה מחדש** -> `/confirm` pick name -> ✓ -> save
-> lock again. Fix #1 above prevents the trap.

## Deploy loop
Extract overlay zip over C:\Safi_meeting -> `npm run build` (verify green) -> then a
SEPARATE step: `git add -A` / commit / `git push` (auto-deploys). Any new column/table
change: run its SQL in Supabase editor for `givcxgzhfoetujhrjgvc` BEFORE the push.

## Guardrails
- Never `npm audit fix --force` (bumps Next major, breaks build).
- Never rotate the sinks service_role key (kills the live sinks CRM).
- All DB access server-side via service role; browser never gets a Supabase key.
- Organizer actions (analyze, publish, lock, reopen, location save) re-check the
  passphrase server-side — genuinely Avshi-only, not just hidden.
