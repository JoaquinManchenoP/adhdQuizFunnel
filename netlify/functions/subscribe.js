// This runs server-side only. Your beehiiv API key lives in an
// environment variable here — it is never sent to the browser.
//
// Console output from this function shows up in your `netlify dev`
// terminal (or .netlify-dev.log if using the dev-start.sh script) —
// that's where you confirm a submission actually went to beehiiv.

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

  const { email, subtype, score, gender, ageRange, diagnosisStatus, utm_source, utm_medium, utm_campaign } = payload;

  if (!email || typeof email !== 'string') {
    console.error('[subscribe] ❌ missing/invalid email in payload:', payload);
    return { statusCode: 400, body: JSON.stringify({ error: 'A valid email is required' }) };
  }

  console.log(`[subscribe] received submission — email: ${email}, subtype: ${subtype || 'Unknown'}, score: ${score ?? 'n/a'}`);

  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error('[subscribe] ❌ missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID env vars');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server is missing beehiiv configuration' }) };
  }

  const requestBody = {
    email,
    reactivate_existing: false,
    send_welcome_email: false,
    // These custom fields MUST already exist in your beehiiv
    // publication (Settings > Custom Fields) with these exact
    // names, or beehiiv will silently discard them.
    custom_fields: [
      { name: 'quiz_subtype', value: subtype || 'Unknown' },
      { name: 'quiz_score', value: String(score ?? '') },
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
