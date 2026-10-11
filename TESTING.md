# Testing the quiz results → beehiiv pipeline

Repeatable test procedure for the scoring + Netlify Blobs + beehiiv changes
(`js/state.js` `buildResultsReport()`, `netlify/functions/subscribe.js`).
Two phases: a safe local dry run (no real emails sent, no real beehiiv
writes), then a live verification once you're ready to test against the
real beehiiv account.

## ⚠️ Before you start: your `.env` has REAL beehiiv credentials

`.env` currently has your live `BEEHIIV_API_KEY`/`BEEHIIV_PUBLICATION_ID`,
not the `test_`/`pub_dummy` placeholders `subscribe.js` checks for. That
means `npm run dev` right now will actually call the live beehiiv API on
every test submission and create a real subscriber. For Phase 1, temporarily
swap in placeholders so you can test safely and repeatedly:

1. Open `.env`.
2. Temporarily change the two values to:
   - `BEEHIIV_API_KEY=test_123`
   - `BEEHIIV_PUBLICATION_ID=pub_dummy_123`
3. Save. (Don't commit this — it's already gitignored.)
4. When you're done with Phase 1, put your real values back before Phase 2.

## Phase 1 — local dry run (mock beehiiv, real scoring + real Blobs write)

1. Start the dev stack: `npm run dev` — wait for it to print the three
   local URLs. Visit `http://localhost:8080`.
2. Open `http://localhost:8080/?dev=1` instead, so the dev screen-jumper
   panel shows up at the bottom. Click `question` to skip straight past
   the gender/age/diagnosis screens (they're optional fields — not needed
   to test scoring).
3. Answer all 22 questions normally (click through the breather screens
   when they appear — they auto-advance after a few seconds).
4. After the "calculating" screen, you'll land on the results/email-capture
   screen. Enter any test email (doesn't need to be real — nothing is
   actually emailed by this function, beehiiv's own Automation sends the
   real email, and that's mocked in this phase) and submit.
5. Check the log: `tail -50 .netlify-dev.log`. You should see, in order:
   - `[subscribe] received submission — email: ..., subtype: ..., score: ...`
   - `[subscribe] ✅ saved result record <timestamp>-<suffix> to Netlify Blobs ('quiz-results' store)`
   - `[subscribe] ⚠️  MOCK MODE — ...` followed by the full `custom_fields`
     array it WOULD have sent to beehiiv — confirm every field listed below
     has a real value, not `Unknown` or an empty string:
     `quiz_subtype, quiz_score, quiz_total_pct, quiz_band_label,
     quiz_inattentive_pct, quiz_inattentive_label, quiz_hyperimpulsive_pct,
     quiz_hyperimpulsive_label, quiz_associated_pct, quiz_associated_label,
     quiz_gender, quiz_age_range, quiz_diagnosis_status, utm_source,
     utm_medium, utm_campaign`
6. Cross-check against the UI: reload `http://localhost:8080/?debug=1`
   right after submitting (same tab, so session storage still has your
   answers) — the thank-you screen's debug block should show the exact
   same `total_score`, percentages, and labels as step 5's logged
   `custom_fields`. Any mismatch here means the UI and the beehiiv payload
   have drifted apart — that should be impossible since both read from
   `buildResultsReport()`, so treat a mismatch as a real bug.
7. Retake test: click "Take the quiz again," answer differently, submit
   again. Confirm step 5 logs a **different** record id (timestamped) —
   this proves retakes create new Blobs records instead of overwriting the
   previous one.

If any of steps 5–7 don't match, stop and report back what you saw before
moving to Phase 2.

## Phase 2 — live verification (real beehiiv + real Blobs store)

1. Restore your real `BEEHIIV_API_KEY`/`BEEHIIV_PUBLICATION_ID` in `.env`.
2. In beehiiv, go to **Settings → Custom Fields** and create every field
   name listed in step 5 above that doesn't already exist, if you haven't
   already (plain text type is fine for all of them).
3. Restart the dev stack (`npm run dev:stop` then `npm run dev`, so the
   function picks up the restored `.env`), repeat the Phase 1 quiz flow
   once with a real, disposable test email you control.
4. Check `.netlify-dev.log` again — this time it should show
   `[subscribe] sending request to beehiiv for ...` and then
   `✅ confirmed: beehiiv accepted ... (subscriber id: ...)`, not the MOCK
   MODE lines.
5. In beehiiv's dashboard, find that subscriber (Subscribers → search by
   the test email) and open their profile — confirm every custom field
   from step 5 of Phase 1 shows the correct value.
6. To check the persisted Blobs record (not just beehiiv's copy): this
   requires the site to be linked once —
   `./node_modules/.bin/netlify login` then
   `./node_modules/.bin/netlify link` (pick/confirm the deployed site).
   Then:
   - `./node_modules/.bin/netlify blobs:list quiz-results` — lists every
     saved submission's key.
   - `./node_modules/.bin/netlify blobs:get quiz-results <key> --json` —
     prints that one record; confirm `answers` is the full 22-item raw
     array and `report` matches what beehiiv/UI showed.
   Note: this only sees records written by a **deployed** site (or a
   `netlify dev` session run after linking) — purely local, unlinked
   `netlify dev` runs (Phase 1) use a local-only emulated store the CLI's
   `blobs:list`/`blobs:get` commands can't see, which is expected.
7. Once custom fields are confirmed correct in beehiiv, build the
   Automation (Automations → New → trigger: subscribed via this quiz's
   source → action: send your results email, using `{{ custom field }}`
   merge tags for the fields above) and send yourself one real test send
   from beehiiv's own "send test email" button before turning it on live.

## What "working correctly" means

- Every field in the beehiiv payload is populated (no stray `Unknown`/empty
  values) and matches the `?debug=1` UI exactly.
- A Blobs record exists for every submission, retakes don't overwrite
  earlier ones, and `answers`/`report` inside it match what was shown.
- The real beehiiv Automation's test send renders correct score/band text
  via merge tags.
