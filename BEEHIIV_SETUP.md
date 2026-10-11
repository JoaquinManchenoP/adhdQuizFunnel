# Wiring beehiiv to send the real results email

Exact steps to (1) confirm beehiiv is actually receiving the quiz data, and
(2) build the automation that sends the results email with the correct
numbers merged in. This pairs with `TESTING.md` (Phase 2 there is the same
"confirm beehiiv receives it" step — this doc goes further into actually
building the automation).

## Step 1 — create the custom fields beehiiv needs

In beehiiv: **Settings → Custom Fields → New custom field**. Create one
Text field for each of these, using this **exact spelling** (this is the
`name` our code sends — beehiiv silently drops any custom field whose name
doesn't already exist):

```
quiz_subtype
quiz_score
quiz_total_pct
quiz_band_label
quiz_inattentive_pct
quiz_inattentive_label
quiz_hyperimpulsive_pct
quiz_hyperimpulsive_label
quiz_associated_pct
quiz_associated_label
quiz_gender
quiz_age_range
quiz_diagnosis_status
utm_source
utm_medium
utm_campaign
```

## Step 2 — confirm beehiiv is actually receiving them

1. Make sure `.env` has your real `BEEHIIV_API_KEY`/`BEEHIIV_PUBLICATION_ID`
   (see `TESTING.md` Phase 2, step 1).
2. Run the quiz once with a real test email you control, through to
   submitting on the results screen.
3. In beehiiv: **Subscribers → search your test email → open their
   profile**. Scroll to the custom fields section — every field from Step
   1 should show a real value (not blank). If a field is missing or blank,
   its name doesn't match exactly — go back and fix the spelling in
   Settings → Custom Fields.

If this step isn't clean, stop here and fix field names before touching
the automation — a mistyped field name fails silently on both ends.

## Step 3 — build the automation

1. **Automations → New Automation.**
2. **Trigger: "Add by API."** (Not "Subscribed" — our code enrolls the
   subscriber directly by automation ID rather than relying on beehiiv to
   detect a matching condition, which is both simpler and guaranteed to
   fire every time. See Step 4.)
3. Add a single **Send Email** step. Design "Your ADHD Quiz Results" the
   way you want it to read.
4. Everywhere you want a number or label from the quiz, click into that
   spot in the editor and type `{{` — pick the matching field from the
   dropdown (e.g. the field for `quiz_band_label`) rather than typing the
   tag by hand; merge tags are case-sensitive and must match exactly.
   Optionally add a fallback for safety: `{{ quiz_band_label | your results }}`
   renders that fallback text if the field is ever empty for some reason.
5. Once the email looks right, use beehiiv's **"Send test email"** button
   to send it to yourself and visually confirm the merged values render
   correctly — do this before turning the automation on.
6. Turn the automation **on**.

## Step 4 — point our code at this automation

1. Open the automation you just made; copy its ID from the dashboard URL
   (the id segment right after `/automations/`).
2. Add it to `.env`:
   ```
   BEEHIIV_RESULTS_AUTOMATION_ID=<that id>
   ```
3. Restart the dev stack (`npm run dev:stop` then `npm run dev`) so the
   function picks up the new env var.

From here on, every quiz submission's `subscribe.js` call includes
`automation_ids: [BEEHIIV_RESULTS_AUTOMATION_ID]` — beehiiv enrolls that
subscriber into the automation immediately, no trigger-matching guesswork.

## Step 5 — the real end-to-end test

1. Take the quiz once more with a real test email.
2. In beehiiv, open the automation → its subscriber/journey list → confirm
   your test email was just enrolled.
3. Check your test inbox: the results email should arrive with your
   actual score, subtype, and band label merged in correctly — compare it
   against `http://localhost:8080/?debug=1`'s debug block from that same
   run; every number should match exactly.

If the email arrives with blank or wrong merge tags but Step 2 showed the
subscriber's custom fields were correct, the mismatch is in the merge tag
itself (Step 3.4) — re-pick it from beehiiv's dropdown instead of
retyping it.
