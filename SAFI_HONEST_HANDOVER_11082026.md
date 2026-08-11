# Safi — Honest Handover & Status  ·  11.08.2026

Written at Avshi's demand: what went wrong, what is actually live vs not,
every recent change request with its real deployment status, and how to
get current. No spin.

---

## 1. THE CORE PROBLEM (what actually happened)

Your app CODE is fine and builds successfully. The failures were in
GETTING CHANGES DEPLOYED, plus two outside issues:

1. **Paused database (earlier today):** Safi's tables live inside your
   *sinks* Supabase project (`givcxgzhfoetujhrjgvc`). When you paused
   projects this morning, that one went with it, so the site threw 500s
   and showed empty. **Restoring the project fixed it.** (Root cause found
   and resolved.)

2. **Windows build crashes on your PC:** `npm run build` prints
   "✓ Compiled successfully / ✓ Checking validity of types" and THEN dies
   with `spawn UNKNOWN (errno -4094)` or `3221226505`. These are Windows
   process/worker crashes AFTER the real build passed — not your code.
   The fix is to STOP building locally: `git push` and let Vercel build in
   the cloud (Linux), where these crashes don't exist.

3. **My mistake (own it):** several times I said "green / done" based on
   MY sandbox build test, while your local build was crashing or the push
   hadn't completed — so your LIVE site lagged behind what I described.
   I should have said "built and ready to deploy — confirm Vercel is green
   before trusting it," and verified the deploy each time. That gap is the
   mess you felt. It was not fabricated requests or hidden work — every
   change you asked for exists in code — but the "it reads as fixed"
   claims got ahead of what was actually deployed.

I cannot see your live site from here (no access), so deployment status
below is INFERRED from your screenshots. Where I'm inferring, I say so.

---

## 2. LIVE vs NOT-LIVE (as of your last WhatsApp screenshot)

Evidence: your shared links show `safi.marble-art.co.il` (so v21 IS live),
but the confirm message still says "פתחנו סבב אישור" with broken � emojis
(so v22 is NOT live).

### LIVE (deployed and working)
- Full flow: availability → AI 3 proposals → confirmation round → lock → announce
- AI spreads 3 proposals across DIFFERENT dates (v18)
- Stale-finalists ⚠️ banner + 🔄 refresh (v18)
- Lock guard: cannot lock before AI + ≥1 confirmation (v14/v18)
- Heatmap shows date + count (v15)
- Email digest 3×/day to avshi2@gmail.com (v16) — CONFIRMED working
- Home hub 3-column + big banner + QR corner (v11/v12)
- Private organizer teleprompter (v13)
- Per-person confirm NOTES box (v19) — should be live via v21 bundle; VERIFY on live /confirm
- API hardening so a DB outage shows empty, not a 500 (v20) — via v21 bundle
- Share links use the subdomain (v21)
- Finalist card wording "אישרו הצעה זו" + red phase-2 CTA (v21) — VERIFY on live

### NOT LIVE (built, in the v23 bundle, but NOT yet deployed)
- **v22 — confirm invite reworded** to "קיבלנו מכולם מועדים מועדפים למפגש"
  and the broken � emojis replaced with flowers 🌸🌷🌼.  <-- THIS is why your
  screenshot still shows the old text and the black diamonds.
- **v23 — force-subdomain redirect** (opening the vercel.app address auto-
  redirects to safi.marble-art.co.il).

Everything not-live is inside **Safi_v23_subdomain.zip** (last file I sent).

---

## 3. YOUR RECENT CHANGE REQUESTS — with honest status

| # | You asked for | Status |
|---|---|---|
| 1 | Confirm page = confirm AND view everyone, one click | LIVE (v17/v21) |
| 2 | Prefill the WhatsApp share message | LIVE (v17/v21) |
| 3 | Fix stale finalists (03/09 leftovers) + spread 3 different days | LIVE (v18) |
| 4 | Add per-person NOTES box on the confirm screen | Built v19; live via v21 bundle — VERIFY |
| 5 | Fix the "Server Components render" / 500 crash | Root cause was paused DB (fixed) + hardening (v20) |
| 6 | Share links → subdomain (DNS fixed) | LIVE (v21) |
| 7 | Finalist card line → "אישרו הצעה זו" | Built v21 — VERIFY on live |
| 8 | Confirm header → red phase-2 line "אשרו את המועד שמתאים לרוב… מקום המפגש יישלח בהמשך" | Built v21 — VERIFY on live |
| 9 | Change "פתחנו סבב אישור למפגש" → "קיבלנו מכולם מועדים מועדפים למפגש" | **BUILT (v22), NOT DEPLOYED** |
| 10 | Replace the 3 ugly black-diamond emojis with flowers/happy | **BUILT (v22), NOT DEPLOYED** |
| 11 | Force the app to open on the subdomain, not vercel.app | **BUILT (v23), NOT DEPLOYED** |

So the outstanding, not-yet-live items are **#9, #10, #11** — all inside
Safi_v23_subdomain.zip.

---

## 4. OPEN BUGS / ISSUES (honest list)

- **Broken � emojis in the WhatsApp messages** — caused by v22 not being
  deployed (the old emoji-heavy text is still live). Deploying v23 replaces
  them with flowers. If they STILL show as diamonds after deploy, it's a
  UTF-8/encoding issue in the save chain — tell me and I'll switch to
  emojis your device definitely renders.
- **Duplicate/confusing messages in your WhatsApp** — your screenshot shows
  several test invites (availability invite + confirm invite) sent close
  together, which reads as messy. That's from testing the share buttons
  repeatedly, not a code fault. Once #9/#10 deploy, the confirm message will
  read clearly as phase-2 ("קיבלנו מכולם… אשרו").
- **The "final vs first request" confusion** — the message that should read
  as "we collected everyone's dates, now confirm" still shows the old
  phase-1-sounding text because #9 isn't deployed. Deploying fixes it.
- **Local Windows build crashes** — not fixable in code; workaround is to
  skip local builds and push (Vercel builds in the cloud).

---

## 5. HOW TO GET FULLY CURRENT (no local build)

```powershell
cd C:\Safi_meeting
Expand-Archive -LiteralPath "C:\Safi_meeting\Safi_v23_subdomain.zip" -DestinationPath "C:\Safi_meeting" -Force
Remove-Item "C:\Safi_meeting\Safi_v23_subdomain.zip" -Force
git add -A
git commit -m "v22+v23: reworded confirm invite + flowers + force-subdomain redirect"
git push
```

Then: vercel.com → your project → Deployments → wait for GREEN (Ready).
Do NOT run `npm run build` locally — that is the step that crashes, and it
is not needed. If the Vercel build ever fails, your live site stays on the
last working version and I fix the error you paste me.

After green, verify on the LIVE site:
- Confirm message says "קיבלנו מכולם מועדים מועדפים למפגש" with 🌸🌷🌼 (no �).
- Opening safi-meeting.vercel.app redirects to safi.marble-art.co.il.
- Confirm page shows the red phase-2 line + the personal notes box.

---

## 6. FULL VERSION HISTORY (for the record)
v1–v16 = build-out (see prior handover SAFI_HANDOVER_08082026.md).
v17 confirm+view-all wording + prefilled share.
v18 stale-finalists flag + 🔄 refresh + distinct-date spread.
v19 per-person confirm notes box + crash-hardening.
v20 /api/overview & /api/round never 500.
v21 subdomain share links + finalist wording + red CTA (bundle of v19–v21).
v22 confirm invite reworded + flower emojis.  [NOT DEPLOYED]
v23 force-subdomain redirect middleware.        [NOT DEPLOYED]

Infra unchanged: Next.js 15.5.23 pinned; DB = sinks Supabase givcxgzhfoetujhrjgvc
(tables safi_*); Vercel Hobby; digest via nodemailer+Gmail; domain safi.marble-art.co.il.
