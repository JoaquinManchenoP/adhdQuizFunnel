# ADHD Quiz — Setup Guide

A lead-gen quiz funnel: a 22-question ADHD self-check, an instant teaser
score, an email-gated full results breakdown, a SparkLoop recommendations
step, and a beehiiv newsletter subscription — all served as a static site
plus one Netlify Function.

## What's in this folder
- `index.html` + `js/` — the quiz itself. `js/main.js` is the entry point
  (render loop, event handlers); `js/state.js` owns quiz state and all
  scoring; `js/screens/*.js` and `js/components/*.js` render each screen;
  `js/analytics.js` sends PostHog events.
- `netlify/functions/subscribe.js` — server-side function that validates
  the submitted email, writes a full raw record to Netlify Blobs, and
  calls the beehiiv API to subscribe the reader (keeps the API key off
  the client).
- `netlify.toml` — tells Netlify where to find the function.
- `BEEHIIV_SETUP.md` — step by step guide to the beehiiv custom fields and
  the results-email automation.
- `TESTING.md` — the repeatable test procedure for the scoring → Blobs →
  beehiiv pipeline (mock mode first, then a live end-to-end check).

## 1. Create the custom fields in beehiiv
See `BEEHIIV_SETUP.md` Step 1 for the full, current list of field names —
it must match exactly what `netlify/functions/subscribe.js` sends, or
beehiiv silently drops the mismatched field.

## 2. Get your beehiiv API key and publication ID
- API key: **Settings → Integrations → API** (create a key with
  `subscriptions:write` access — treat this like a password, never commit
  it or put it in client-side code)
- Publication ID: found in your publication settings, looks like
  `pub_xxxxxxxxxxxx`

## 3. Deploy to Netlify
1. Push this repo to GitHub (or drag-and-drop deploy it directly in the
   Netlify dashboard)
2. In Netlify: **New site from Git** → pick the repo
3. Under **Site settings → Environment variables**, add:
   - `BEEHIIV_API_KEY` = your API key from step 2
   - `BEEHIIV_PUBLICATION_ID` = your publication ID from step 2
   - `BEEHIIV_RESULTS_AUTOMATION_ID` (optional) — see `BEEHIIV_SETUP.md`
     Step 4
4. Deploy

## 4. Test it
Follow `TESTING.md` end to end: a safe mock-mode dry run first (no real
beehiiv writes), then a live verification against your real beehiiv
account. Visiting with `?debug=1` shows the computed score/subtype/band on
the thank-you screen so you can cross-check it against what beehiiv
received — remove `?debug=1` from the link you actually share.

## 5. Build the beehiiv automation
Once custom fields are confirmed correct (`BEEHIIV_SETUP.md` Step 2),
follow Steps 3–4 there to build the "Your ADHD Quiz Results" automation and
point the function at it via `BEEHIIV_RESULTS_AUTOMATION_ID`. This is what
sends each subscriber their personalized results email.

## Local development
`npm run dev` starts the full local stack (Netlify Functions + a
live-reload static server + an HTTPS passthrough for testing SparkLoop's
redirect locally) — see `scripts/dev-start.sh` for exactly what it runs
and why. `npm run dev:stop` stops it.

## Notes
- If you'd rather host on Vercel instead of Netlify, the function needs to
  move to `/api/subscribe.js` using Vercel's serverless function format.
- The dev-only screen jumper (`?dev=1`, bottom of the page) lets you skip
  straight to any screen for testing — it's gated so real visitors never
  see it, but is meant to be deleted before a final launch.
