/* ============================================================
   ANALYTICS (PostHog)
   Thin wrapper around window.posthog (loaded by the snippet in
   index.html's <head>). Every event the quiz sends is defined here so
   the full tracking plan is readable in one place — and so the custom
   dashboard can rely on stable event names.

   PRIVACY RULE: never send individual quiz answers, gender, age,
   diagnosis status, or the email address to PostHog. Those go only to
   beehiiv via netlify/functions/subscribe.js. PostHog gets screen
   names, question numbers, the final subtype, and traffic source.

   Events:
     quiz_screen_viewed  { screen, step, question_number?, question_label? }  every screen change
     quiz_started        {}                                  first answer (gender) picked
     quiz_completed      { subtype }                         instant result reached
     email_submitted     { subtype, seconds_to_submit }      beehiiv call succeeded
     email_submit_failed { }                                 beehiiv call failed
   Every event also carries `environment` (development | production)
   and any utm_* params from the landing URL.
   ============================================================ */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Captured once on load. The quiz is a single page and never changes
// URL, so the landing URL's params hold for the whole session.
export const utm = (() => {
  const params = new URLSearchParams(window.location.search);
  const out = {};
  UTM_KEYS.forEach((k) => { if (params.get(k)) out[k] = params.get(k); });
  return out;
})();

const isDev = ['localhost', '127.0.0.1', ''].includes(window.location.hostname)
  || new URLSearchParams(window.location.search).has('dev');

if (window.posthog) {
  window.posthog.register({ environment: isDev ? 'development' : 'production', ...utm });
}

export function track(event, props = {}) {
  try {
    if (window.posthog) window.posthog.capture(event, props);
  } catch (err) {
    // Analytics must never break the quiz.
    console.warn('[analytics] capture failed:', err);
  }
}

// Order of the funnel, used for the `step` property so the dashboard
// can sort screens without hard-coding names.
const STEP_ORDER = ['genderSelect', 'ageSelect', 'diagnosisStatus', 'question', 'breather', 'calculating', 'instantResult', 'emailCapture', 'thankYou'];

let lastScreenKey = null;
let startedAt = null;

export function trackScreen(screen, qIndex) {
  // Question screens are one screen name reused per question, so the
  // question number is part of the key — otherwise re-renders of the
  // same screen would be counted twice.
  const key = screen === 'question' ? `question:${qIndex}` : screen;
  if (key === lastScreenKey) return;
  lastScreenKey = key;
  const props = { screen, step: STEP_ORDER.indexOf(screen) };
  if (screen === 'question') {
    props.question_number = qIndex + 1;
    // Zero-padded label ("Q01"…"Q21") so PostHog, which sorts breakdown
    // values as text, lists questions in quiz order.
    props.question_label = `Q${String(qIndex + 1).padStart(2, '0')}`;
  }
  track('quiz_screen_viewed', props);
}

export function trackQuizStarted() {
  if (startedAt !== null) return;
  startedAt = Date.now();
  track('quiz_started');
}

export function secondsSinceStart() {
  return startedAt === null ? null : Math.round((Date.now() - startedAt) / 1000);
}
