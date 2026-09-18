# ADHD Quiz — Setup Guide

## What's in this folder
- `index.html` — the quiz itself (frontend, all scoring logic runs here)
- `netlify/functions/subscribe.js` — the server-side piece that talks to beehiiv (keeps your API key private)
- `netlify.toml` — tells Netlify where to find the function

## 1. Create two custom fields in beehiiv (do this first)
In your beehiiv dashboard: **Settings → Custom Fields** → create:
- `quiz_subtype` (text)
- `quiz_score` (text or number)
- `quiz_gender` (text)
- `quiz_age_range` (text)
- `quiz_diagnosis_status` (text)

These names must match exactly — beehiiv silently discards any custom field sent to the API that it doesn't already recognize.

## 2. Get your beehiiv API key and publication ID
- API key: **Settings → Integrations → API** (create a key with `subscriptions:write` access — treat this like a password, never put it in the HTML file)
- Publication ID: found in your publication settings, looks like `pub_xxxxxxxxxxxx`

## 3. Deploy to Netlify
1. Push this whole folder to a GitHub repo (or drag-and-drop deploy it directly in the Netlify dashboard)
2. In Netlify: **New site from Git** → pick the repo
3. Under **Site settings → Environment variables**, add:
   - `BEEHIIV_API_KEY` = your API key from step 2
   - `BEEHIIV_PUBLICATION_ID` = your publication ID from step 2
4. Deploy

## 4. Test it
Visit your live URL with `?debug=1` at the end (e.g. `yoursite.netlify.app?debug=1`) — this shows you the computed subtype/score on the final screen so you can confirm the scoring is working before checking beehiiv. Remove `?debug=1` for the real link you share publicly — without it, the debug panel never shows.

After a test submission, check beehiiv's subscriber list — you should see the new subscriber with `quiz_subtype` and `quiz_score` populated in their custom fields. That's what your beehiiv automation will trigger off of to send the right report/starter guide.

## 5. Set up the beehiiv automation
In beehiiv: create an automation triggered by a segment where `quiz_subtype` equals each value (`Inattentive-leaning`, `Hyperactive-Impulsive-leaning`, `Combined`), and have each one send the matching report + starter guide email. This is the piece that makes personalization automatic — no manual work per subscriber.

## Notes
- If you'd rather host on Vercel instead of Netlify, the function needs to move to `/api/subscribe.js` using Vercel's serverless function format instead — let me know if you want that version.
- Swap the brand name, colors, and copy in `index.html` before this goes live — right now it's placeholder ("The Clarity Check").
