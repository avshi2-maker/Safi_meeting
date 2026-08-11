# Safi — Honest Handover · 11.08.2026 12:40

Written at Avshi's demand. No spin. This lists everything I changed today, every
mistake I made, what is actually live right now (and how I verified it), and the
one remaining WhatsApp-caching item plus the real fix I just shipped for it.

---

## 1. Where I wasted your time (my mistakes — owned, not hidden)

1. **I fixed the wrong target twice.** You said the share message was wrong. I first
   chased "dead code" in exportFormats.ts, then chased "broken emojis" — while the
   REAL problem was that the button sent the wrong PHASE (the phase-1 "come submit
   dates" invite instead of the phase-2 AI-proposal/confirm message). I should have
   pinned down the exact target with you before writing any code. That's on me.

2. **I misdiagnosed the black boxes (�).** I first said it was file-encoding
   corruption, then "swapped" the yellow heart for flower emojis — which just traded
   one unrenderable emoji for another. The truth: your phone cannot render those
   emojis at all, so WhatsApp shows � boxes. The correct fix was to REMOVE all
   emojis from the messages, which I should have done the first time you asked.

3. **I told you to "wait a few days" for the WhatsApp preview.** That was me stating
   something uncertain as if it were reliable. WhatsApp's preview cache does expire
   eventually, but the timing is unpredictable and it was not a real solution. I
   should not have presented it as one.

4. **(Carried over from earlier today)** I called things "green/done" from my own
   sandbox build before your live deploy was confirmed. Build-test passing is NOT
   the same as deployed. I now verify the live site and your actual git state before
   saying anything is done.

---

## 2. What is ACTUALLY live right now (verified, not claimed)

- **App builds and deploys fine.** Every change below passed a full `next build` on
  Linux (same as Vercel) before delivery.
- **Confirm message body is correct and clean.** Your 12:26 / 12:37 WhatsApp
  screenshots show the message text with NO black boxes and the RIGHT phase-2 wording:
  "שלום למשפחה / קיבלנו מכולם מועדים מועדפים למפגש / ... / אשרו את המועד / /confirm".
- **Link-preview header is fixed site-wide.** I pulled the live page fresh from your
  server: the title is now "תיאום מפגש משפחתי קרול-ביטי" and there is NO description
  tag. Your 12:32 screenshot (the `?x=1` link) confirms the correct card renders.
- **All emojis removed from every outgoing WhatsApp message** (confirm invite, AI
  proposal share, final announcement). Plain Hebrew text only. UI buttons inside the
  website still have emojis — those render fine on your screen; only the WhatsApp
  message text had to be emoji-free.

---

## 3. The one remaining item: WhatsApp preview cache — and the real fix

**The situation:** WhatsApp stores link-preview cards on Meta's own servers, keyed to
the exact URL. Once it cached the OLD card for `https://safi.marble-art.co.il/confirm`,
it keeps showing that old card for that exact link. This is why:
- Clearing WhatsApp cache on your phone did NOT help (the cache is on Meta's servers).
- A browser hard-refresh did NOT help (that only refreshes the website, not WhatsApp).
- The `?x=1` link DID show the correct card (a different URL = a fresh crawl).

**The fix I just shipped (needs nothing from you except a push):** the confirm button
now generates the link as `.../confirm?v=2` automatically. Because that is a URL
WhatsApp has not cached, it crawls it fresh and shows the correct card — the one your
own `?x=1` test already proved works. The family clicks a normal link; the page ignores
the `?v=2` and works exactly the same.

You do NOT need Facebook tools. You do NOT need to wait.

---

## 4. What YOU do now

The fixed file is already written into `C:\Safi_meeting` (no download needed). Push it:

```powershell
cd C:\Safi_meeting
git add -A
git commit -m "confirm link uses fresh ?v=2 URL so WhatsApp shows the correct preview card"
git push
```

Then, after Vercel goes green, tap the organizer button and send the confirm link to
yourself once. You will see the correct card: bold header "תיאום מפגש משפחתי קרול-ביטי",
no description, and the clean emoji-free message body.

---

## 5. Every change I made this session (files + commits)

| Commit message | Files touched | What it does |
|---|---|---|
| cleanup: remove dead buildConfirmInvite | exportFormats.ts | removed one unused function (stale text) |
| v24: organizer share button sends phase-2 confirm message | exportFormats.ts, OrganizerDashboard.tsx, ClosingRound.tsx | top button now sends the AI-proposal CONFIRM message, not the old phase-1 invite; both share buttons share one function |
| remove all emojis from WhatsApp messages | exportFormats.ts | confirm invite + AI-proposal share + final announcement are now plain text |
| link preview: bold header only (Karol-Biti) | layout.tsx | title = "תיאום מפגש משפחתי קרול-ביטי"; description removed |
| confirm link uses fresh ?v=2 URL (PENDING YOUR PUSH) | exportFormats.ts | forces WhatsApp to show the correct preview card |

## 6. Standing reminders (so this doesn't repeat)

- **No emojis in any Safi WhatsApp message, ever** — your phone renders them as boxes.
- **The top organizer button = phase-2 confirm message.** The phase-1 "come submit
  dates" invite is just sharing the home link `safi.marble-art.co.il/` (the home page
  is that invite: names grid → tap to fill).
- **WhatsApp link previews are cached by Meta per-URL.** To change a card, you change
  the URL (the `?v=2` trick) — not the phone, not the browser.
- **Delivery method now:** I write files straight into `C:\Safi_meeting` over the
  bridge. You only ever run `git add -A` → `commit` → `push`. No downloads, no zips.
- **Don't build locally on your Win11 PC** (`npm run build` crashes there). Push and
  let Vercel build on Linux. A failed Vercel build leaves the last good deploy live.
