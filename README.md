# Safi · תיאום מפגש משפחתי

Family meeting scheduler. Participants pick availability (1 Sep – 30 Nov 2026);
Claude ranks the best 2–3 date+time slots. Hebrew RTL.

Stack: Next.js 15 (App Router, TS) · Supabase (shared sinks DB, `safi_` tables) ·
Anthropic API (server-side) · Vercel.

## Pages
- `/` landing — pick your name / add a person
- `/respond?p=<id>` — availability diary (3-month calendar + time-of-day + note)
- `/organizer` — passphrase-gated: response tracker, overlap heatmap, AI button,
  live token+cost meter, 5-button export bar

## Env (Vercel > Settings > Environment Variables)
- `SUPABASE_URL` = https://givcxgzhfoetujhrjgvc.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `ANTHROPIC_API_KEY`
- `SAFI_ORGANIZER_PASSPHRASE`
- `SAFI_MODEL` (optional; default `claude-sonnet-5`)

DB tables (`safi_participants`, `safi_responses`, `safi_suggestions`) already
created via SQL in the sinks Supabase project.
