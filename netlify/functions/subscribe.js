// This runs server-side only. Your beehiiv API key lives in an
// environment variable here — it is never sent to the browser.
//
// Console output from this function shows up in your `netlify dev`
// terminal (or .netlify-dev.log if using the dev-start.sh script) —
// that's where you confirm a submission actually went to beehiiv.

const { getStore } = require('@netlify/blobs');

// Overall band label for report.totalPct — same five-tier thresholds as
// js/state.js's domainBand()/partABand(), kept in sync by hand since this
// one string (unlike the per-domain ones) isn't part of buildResultsReport()'s
// return value today.
function overallBandLabel(report) {
  const pct = report.totalPct;
  if (pct < 15) return 'Low signs of ADHD related traits';
  if (pct < 35) return 'Mild signs of ADHD related traits';
  if (pct < 55) return 'Moderate signs of ADHD related traits';
  if (pct < 75) return 'Strong signs of ADHD related traits';
  return 'Very strong signs of ADHD related traits';
}

// Writes the full, raw submission to Netlify Blobs — independent of
// whatever happens with the beehiiv call below. beehiiv's custom_fields
// get overwritten if someone retakes the quiz, and only ever hold the
// final numbers, not the raw answers or which rubric produced them. This
// is the durable, explainable record: if a reader asks "why did I get
// this score," this is what you'd pull up to answer it, and it survives
// retakes (one blob per submission, keyed by time + a short random
// suffix — never overwritten).
async function saveResultRecord(payload) {
  const { email, answers, report, scoringVersion, gender, ageRange, diagnosisStatus, utm_source, utm_medium, utm_campaign } = payload;
  const submittedAt = new Date().toISOString();
  const id = `${submittedAt}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id, email, submittedAt, scoringVersion: scoringVersion || null,
    answers: Array.isArray(answers) ? answers : null,
    report: report || null,
    gender: gender || null, ageRange: ageRange || null, diagnosisStatus: diagnosisStatus || null,
    utm: { source: utm_source || 'direct', medium: utm_medium || 'none', campaign: utm_campaign || 'none' },
  };
  const store = getStore('quiz-results');
  await store.setJSON(id, record);
  return id;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    console.error('[subscribe] ❌ invalid JSON body:', event.body);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  let { email, subtype, score, report, gender, ageRange, diagnosisStatus, utm_source, utm_medium, utm_campaign } = payload;

  // Pragmatic RFC-5322-ish check (not a full spec parser — good enough to
  // reject obvious garbage without rejecting real addresses). The native
  // type="email" check on the form already catches most of this client
  // side, but that's trivially bypassable (devtools, a direct POST), so
  // the server is the actual gate.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  email = typeof email === 'string' ? email.trim() : email;
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    console.error('[subscribe] ❌ missing/invalid email in payload:', payload);
    return { statusCode: 400, body: JSON.stringify({ error: 'A valid email is required' }) };
  }
  // Keep the raw payload (read directly by saveResultRecord below) in
  // sync with the trimmed value above, so the Blobs record never stores
  // stray leading/trailing whitespace the beehiiv call itself no longer has.
  payload.email = email;

  console.log(`[subscribe] received submission — email: ${email}, subtype: ${subtype || 'Unknown'}, score: ${score ?? 'n/a'}`);

  // Persisted first and independently of the beehiiv call below (own
  // try/catch) — a beehiiv outage should never cost us the submission
  // record, and a Blobs hiccup should never block the subscribe request.
  try {
    const recordId = await saveResultRecord(payload);
    console.log(`[subscribe] ✅ saved result record ${recordId} to Netlify Blobs ('quiz-results' store)`);
  } catch (err) {
    console.error('[subscribe] ❌ failed to save result record to Netlify Blobs:', err.message);
  }

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error('[subscribe] ❌ missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID env vars');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing beehiiv configuration' }) };
  }

  // Optional: the beehiiv Automation ID for "Your ADHD Quiz Results"
  // (Automations → the automation → copy the id from its URL). Passing
  // it via automation_ids below enrolls every quiz subscriber into that
  // exact automation immediately and deterministically — no guessing
  // whether a trigger condition (tag/custom-field/UTM match) actually
  // fired. Requires that automation's trigger be set to "Add by API" in
  // beehiiv's dashboard. Left unset = no automation_ids sent, nothing
  // breaks, you just haven't wired an automation yet.
  const BEEHIIV_RESULTS_AUTOMATION_ID = process.env.BEEHIIV_RESULTS_AUTOMATION_ID;

  const requestBody = {
    email,
    reactivate_existing: false,
    send_welcome_email: false,
    ...(BEEHIIV_RESULTS_AUTOMATION_ID ? { automation_ids: [BEEHIIV_RESULTS_AUTOMATION_ID] } : {}),
    // These custom fields MUST already exist in your beehiiv
    // publication (Settings > Custom Fields) with these exact
    // names, or beehiiv will silently discard them. beehiiv fields are
    // flat strings with no template logic, so every label/copy string a
    // results-email Automation would want to merge-tag in is precomputed
    // here server-side from `report` (js/state.js's buildResultsReport())
    // rather than left for the email template to figure out.
    custom_fields: [
      { name: 'quiz_subtype', value: subtype || 'Unknown' },
      { name: 'quiz_score', value: String(score ?? '') },
      { name: 'quiz_total_pct', value: String(report?.totalPct ?? '') },
      { name: 'quiz_band_label', value: report ? overallBandLabel(report) : 'Unknown' },
      { name: 'quiz_inattentive_pct', value: String(report?.inattentive?.pct ?? '') },
      { name: 'quiz_inattentive_label', value: report?.inattentive?.label || 'Unknown' },
      { name: 'quiz_hyperimpulsive_pct', value: String(report?.hyperImpulsive?.pct ?? '') },
      { name: 'quiz_hyperimpulsive_label', value: report?.hyperImpulsive?.label || 'Unknown' },
      { name: 'quiz_associated_pct', value: String(report?.associated?.pct ?? '') },
      { name: 'quiz_associated_label', value: report?.associated?.label || 'Unknown' },
      { name: 'quiz_gender', value: gender || 'Unknown' },
      { name: 'quiz_age_range', value: ageRange || 'Unknown' },
      { name: 'quiz_diagnosis_status', value: diagnosisStatus || 'Unknown' },
      // Traffic source from the landing URL's utm_* params, so beehiiv
      // segments can be split by channel. 'direct' = no UTM tags.
      { name: 'utm_source', value: utm_source || 'direct' },
      { name: 'utm_medium', value: utm_medium || 'none' },
      { name: 'utm_campaign', value: utm_campaign || 'none' },
    ],
  };

  // Placeholder credentials (like the test_/dummy ones shipped in .env
  // for local dev) let you verify the whole pipeline — frontend call,
  // payload validation, request shape — WITHOUT hitting the real
  // beehiiv API or needing real credentials yet.
  const isMock = BEEHIIV_API_KEY.startsWith('test_') || BEEHIIV_PUBLICATION_ID.startsWith('pub_dummy');

  if (isMock) {
    console.log('[subscribe] ⚠️  MOCK MODE — BEEHIIV_API_KEY/PUBLICATION_ID look like placeholders, not calling the real beehiiv API');
    console.log('[subscribe] request that WOULD be sent to beehiiv:', JSON.stringify(requestBody, null, 2));
    console.log(`[subscribe] ✅ [MOCK] simulated successful subscribe for ${email}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, mock: true }) };
  }

  try {
    console.log(`[subscribe] sending request to beehiiv for ${email}...`);
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(`[subscribe] ❌ beehiiv rejected the request (status ${response.status}) for ${email}:`, data);
      return { statusCode: response.status, body: JSON.stringify({ error: data }) };
    }

    console.log(`[subscribe] ✅ confirmed: beehiiv accepted ${email} (subscriber id: ${data?.data?.id || 'n/a'})`);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(`[subscribe] ❌ network/request error calling beehiiv for ${email}:`, err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
