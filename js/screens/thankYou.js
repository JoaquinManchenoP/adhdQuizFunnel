/* ============================================================
   Screen: thankYou
   Redesign pass: this used to be a bare "Thank you / Check your
   inbox" line. It's now a small celebratory moment that closes the
   funnel's narrative loop — the companion mascot (same character seen
   on the breather/calculating screens) takes a bow, a checkmark badge
   draws itself in, and a one-shot confetti burst fires on mount, all
   built from adhd-ui tokens/classes already used elsewhere in the app
   (.adhd-fade, .adhd-glow, .char-pop-in) plus a small set of
   screen-scoped `.ty-*` classes for the parts that are new (the float
   bob, the confetti burst, the checkmark draw). Every animation here
   is a single pass on mount, not a loop — per adhd-ui's low-clutter
   ethos, the celebration is one focused moment, not ambient motion
   competing with the rest of the (calm, static) page.
   ============================================================ */

import { poseIdleSvg } from '../components/companion.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Confetti dots: angle evenly around the badge, warm-trio + accent colors
// per the quiz-funnel-adhd-ui data-viz palette (never a flat gray fill).
const CONFETTI = [
  { tx: '-58px', ty: '-46px', color: 'var(--accent)', delay: '.42s' },
  { tx: '4px', ty: '-66px', color: 'var(--dataviz-coral)', delay: '.48s' },
  { tx: '60px', ty: '-42px', color: 'var(--dataviz-teal)', delay: '.44s' },
  { tx: '70px', ty: '12px', color: 'var(--dataviz-periwinkle)', delay: '.52s' },
  { tx: '44px', ty: '58px', color: 'var(--accent-alt-deep)', delay: '.46s' },
  { tx: '-46px', ty: '56px', color: 'var(--dataviz-coral)', delay: '.5s' },
  { tx: '-72px', ty: '8px', color: 'var(--dataviz-teal)', delay: '.4s' },
  { tx: '-12px', ty: '-70px', color: 'var(--dataviz-periwinkle)', delay: '.54s' },
];

export function renderThankYou(state) {
  const s = state.fullScoring();
  const debug = new URLSearchParams(location.search).has('debug');
  const email = state.submittedEmail;
  const subtext = email
    ? `On its way to <strong>${escapeHtml(email)}</strong>.`
    : `On its way to your inbox.`;

  return `
    <div class="thankyou-screen">
      <div class="thankyou-inner">

        <div class="ty-badge-wrap">
          <div class="adhd-glow" style="position:absolute;width:150px;height:150px;border-radius:50%;background:var(--accent);filter:blur(16px);opacity:.5;top:50%;left:50%;margin:-75px 0 0 -75px;"></div>

          <div class="ty-confetti-wrap">
            ${CONFETTI.map(d => `<span class="ty-confetti-dot" style="--tx:${d.tx};--ty:${d.ty};background:${d.color};animation-delay:${d.delay};"></span>`).join('')}
          </div>

          <div class="ty-mascot-float">
            ${poseIdleSvg(118)}
          </div>

          <div class="ty-check-badge char-pop-in" style="animation-delay:.38s;">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path class="ty-check-path" d="M3 8.5l3 3 7-7" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="adhd-fade" style="animation-delay:.1s;display:flex;justify-content:center;">
          <div class="ty-eyebrow">📬 Email on its way</div>
        </div>

        <h1 class="adhd-fade" style="animation-delay:.18s;text-align:center;">We've got it. Check your <span class="ty-mark">inbox</span>.</h1>

        <p class="lede centered small adhd-fade" style="animation-delay:.26s;">${subtext}</p>

        <div class="ty-next-list">
          <div class="ty-next-row adhd-fade" style="animation-delay:.34s;">
            <div class="ty-next-icon" style="background:var(--chip-yellow);">📬</div>
            <span>Not there yet? Check spam or promotions — it can take a minute.</span>
          </div>
          <div class="ty-next-row adhd-fade" style="animation-delay:.4s;">
            <div class="ty-next-icon" style="background:var(--chip-teal);">💡</div>
            <span>A weekly newsletter for navigating life with ADHD. Unsubscribe anytime.</span>
          </div>
          <div class="ty-next-row adhd-fade" style="animation-delay:.46s;">
            <div class="ty-next-icon" style="background:var(--chip-blue);">🔒</div>
            <span>Your answers stay yours. Always.</span>
          </div>
        </div>

        <button type="button" class="btn ty-retake adhd-fade" style="animation-delay:.54s;" onclick="location.reload()">Take the quiz again</button>

        ${debug ? `
        <div class="disclaimer thankyou-debug">
          DEBUG (visible because of ?debug=1):<br>
          gender: <strong>${state.selectedGender !== null ? state.GENDER_OPTIONS[state.selectedGender] : 'not set'}</strong><br>
          age_range: <strong>${state.selectedAge !== null ? state.AGE_RANGES[state.selectedAge] : 'not set'}</strong><br>
          diagnosis_status: <strong>${state.selectedDiagnosis !== null ? state.DIAGNOSIS_OPTIONS[state.selectedDiagnosis] : 'not set'}</strong><br>
          submitted_email: <strong>${email ? escapeHtml(email) : 'not set'}</strong><br>
          subtype: <strong>${s.subtype}</strong><br>
          total_score: <strong>${s.totalScore} / ${s.totalMax}</strong><br>
          inattentive_pct: <strong>${Math.round(s.inattentivePct*100)}%</strong><br>
          hyperactive_impulsive_pct: <strong>${Math.round(s.hyperImpulsivePct*100)}%</strong>
        </div>` : ''}
      </div>
    </div>
  `;
}
