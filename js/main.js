/* ============================================================
   ENTRY POINT (T014 split)
   Imports state, components, and every screen; owns the central
   render()/screenBodyHtml() dispatcher, all DOM event handlers, and
   mounts the initial screen. Loaded via
   <script type="module" src="js/main.js"></script> in index.html.

   IMPORTANT — inline `onclick="..."` handlers: the screen/component
   markup (unchanged from before this refactor) calls functions like
   `onclick="selectGenderOption(0)"`, `onclick="goBack()"`,
   `onclick="submitEmail(event)"`, and the dev-panel buttons call
   `onclick="devJumpTo('...')"`. Because ES modules do NOT put their
   top-level function declarations on `window` (unlike the old classic
   <script> block, where every top-level function was implicitly
   global), these handlers would otherwise be undefined at click time.
   Rather than rewrite the markup to use addEventListener (which would
   change the rendered HTML/attributes and risk behavior drift — out
   of scope for a "pure code-organization refactor"), each handler is
   explicitly assigned onto `window` at the bottom of this file. This
   is the one piece of "shared global state" this split couldn't
   avoid — see T014's changelog note for the full explanation.
   ============================================================ */

import * as State from './state.js';
import { topbarHtml } from './components/topbar.js';
import { progressBlockHtml } from './components/progress.js';
import { renderGenderSelect } from './screens/genderSelect.js';
import { renderAgeSelect } from './screens/ageSelect.js';
import { renderDiagnosisStatus } from './screens/diagnosisStatus.js';
import { renderBreather, animateBreatherTimer, ensureBreatherImageVisible, BREATHERS } from './screens/breather.js';
import { renderQuestion } from './screens/question.js';
import { renderCalculating, animateCalculatingScreen } from './screens/calculating.js';
import { renderInstantResult, animateResultGauge } from './screens/instantResult.js';
import { renderSparkloop } from './screens/sparkloop.js';
import { renderThankYou } from './screens/thankYou.js';
import { prefersReducedMotion, hydrateIcons } from './utils.js';
import { poseThinkingSvg } from './components/companion.js';
import { track, trackScreen, trackQuizStarted, secondsSinceStart, utm } from './analytics.js';

// Shared by every milestone log below, so the style only lives in one place.
function logMilestone(label) {
  console.log('%c' + label, 'font-weight:bold;color:#a9790a;');
}

// Logs the instant SparkLoop's own recommendations overlay appears in the
// DOM — independent of armSparkloopFallback() below (which reacts to the
// same element for its own, unrelated purpose). Disconnects after a
// generous window regardless of outcome — armSparkloopFallback's own
// 8s timer has already acted on a no-show by then, so there's nothing
// left for this purely-diagnostic observer to usefully catch.
(function watchForSparkloopMount() {
  if (document.querySelector('sparkloop-signup-flow')) {
    logMilestone('[SparkLoop] Recommendations page loaded');
    return;
  }
  const mo = new MutationObserver(() => {
    if (document.querySelector('sparkloop-signup-flow')) {
      logMilestone('[SparkLoop] Recommendations page loaded');
      mo.disconnect();
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => mo.disconnect(), 15000);
})();

// Screens shown right after the results-page email submit, in the order
// they appear. To reorder, add, or remove a step (e.g. move sparkloop
// elsewhere, or insert a new screen), just edit this array — each screen
// just needs to call advancePostResults('itsOwnName') to move to
// whatever comes next.
const POST_RESULTS_SEQUENCE = ['sparkloop', 'thankYou'];
function advancePostResults(fromScreen) {
  const next = POST_RESULTS_SEQUENCE[POST_RESULTS_SEQUENCE.indexOf(fromScreen) + 1] || 'thankYou';
  State.setScreen(next);
  render();
}

let quizCompletedTracked = false;
// Guards the very first render() of a page load (see render() below) —
// there's no meaningful prior screen to crossfade FROM on a fresh load,
// only ever a later screen-to-screen swap.
let hasRenderedOnce = false;

function screenBodyHtml() {
  if (State.screen === 'genderSelect') return renderGenderSelect(State);
  if (State.screen === 'ageSelect') return renderAgeSelect(State);
  if (State.screen === 'diagnosisStatus') return renderDiagnosisStatus(State);
  if (State.screen === 'breather') return renderBreather(State);
  if (State.screen === 'question') return renderQuestion(State);
  if (State.screen === 'calculating') return renderCalculating();
  if (State.screen === 'instantResult') return renderInstantResult(State);
  if (State.screen === 'sparkloop') return renderSparkloop(State);
  if (State.screen === 'thankYou') return renderThankYou(State);
}

function render() {
  // TASK-1 fix 1: scope the full-bleed yellow background (and its iOS
  // overscroll/bounce coverage) to the genderSelect screen only, via a
  // class on <html> toggled on every render() call — this is the one
  // mount/unmount hook every screen transition already passes through,
  // so the class is guaranteed to be removed the instant the user
  // advances or skips past this screen. See index.html's
  // `html.adhd-gender-active` rules.
  document.documentElement.classList.toggle('adhd-gender-active', State.screen === 'genderSelect');
  const showTitle = (State.screen === 'question' || State.screen === 'ageSelect' || State.screen === 'diagnosisStatus' || State.screen === 'breather');
  // T016: genderSelect is the quiz-funnel-adhd-ui skill's "accent-flip
  // demographic screen" — it owns its own full-bleed shell (back-arrow-only
  // header baked into its own markup, no title, no progress bar) instead of
  // the shared topbarHtml()/progressBlockHtml() chrome every other screen
  // uses. See js/screens/genderSelect.js.
  // TASK-2 fix: thankYou gets the same full-bleed special-case — it was
  // still paying for a `.topbar` with a permanently-hidden back button
  // (~43px of dead space) even though topbarHtml() already hides it, which
  // blocked true vertical centering. See js/screens/thankYou.js's own
  // `.thankyou-screen` wrapper for the centering technique.
  const html = (State.screen === 'genderSelect' || State.screen === 'thankYou')
    ? screenBodyHtml()
    : topbarHtml(State, showTitle) + progressBlockHtml(State) + screenBodyHtml();
  const apply = () => { document.getElementById('card').innerHTML = html; hydrateIcons(); };
  // Whole-page glitch fix: View Transitions snapshot the ENTIRE document
  // into the browser's top layer — which sits above every normal
  // stacking context, including our own max z-index SparkLoop masks — so
  // firing one on the very first render() of a page load (there's
  // nothing meaningful in #card yet to crossfade FROM) can itself flash
  // across the whole viewport. This is exactly the render() that runs
  // right after SparkLoop's "End of journey" hard redirect lands back
  // here (?from=sparkloop) — so it was undermining that mask rather than
  // the mask being insufficient on its own. Skip the transition only for
  // that first call; every later screen-to-screen swap still gets it.
  if (hasRenderedOnce && document.startViewTransition && !prefersReducedMotion()) {
    // The browser can legitimately abort/skip a transition (confirmed live:
    // "InvalidStateError: ... Document hidden" fires even on an ordinary
    // screen-to-screen tap, not just anything SparkLoop-related) — the
    // content update still happens either way per spec, only the animation
    // itself is skipped, so this is just silencing the resulting unhandled
    // rejection rather than papering over a real failure.
    const transition = document.startViewTransition(apply);
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
  } else {
    apply();
  }
  hasRenderedOnce = true;
  trackScreen(State.screen, State.qIndex);
  if (State.screen === 'instantResult' && !quizCompletedTracked) {
    quizCompletedTracked = true;
    track('quiz_completed', { subtype: State.fullScoring().subtype });
  }
  if (State.screen === 'instantResult') {
    logMilestone('[Results] Results page loaded');
    const percent = Math.round((State.partAScore() / 24) * 100);
    setTimeout(() => animateResultGauge(percent), 200);
  }
  // Single choke point every breather entry passes through (the normal
  // quiz flow via selectAnswer(), the dev-panel jumper, and a restored
  // mid-breather session alike) — see breather.js's own note on why this
  // is needed even with the <head> preload hints in place.
  if (State.screen === 'breather') ensureBreatherImageVisible();
}

// T016: the accent-flip demographic screen (genderSelect) is always
// skippable and never auto-advances on tap — it has its own pinned
// "Continue" button and a "Skip this question" link, both leading to
// the same next screen (ageSelect), per the skill's spec. Tapping an
// option just marks it selected; it does not navigate by itself.
function selectGenderOption(i) {
  State.setSelectedGender(i);
  document.querySelectorAll('#card .adhd-gender-opt').forEach((btn, idx) => btn.classList.toggle('adhd-opt-selected', idx === i));
}
function advanceFromGender() {
  trackQuizStarted();
  State.setScreen('ageSelect');
  render();
}
function skipGender() {
  // Skipping means "I'd rather not say" even if an option had already
  // been tapped — it explicitly clears any in-progress selection rather
  // than silently keeping it, so "skip" always means no data recorded.
  State.setSelectedGender(null);
  advanceFromGender();
}
function selectAge(i) {
  State.setSelectedAge(i);
  document.querySelectorAll('#card .option').forEach((btn, idx) => btn.classList.toggle('selected', idx === i));
  setTimeout(() => { State.setScreen('diagnosisStatus'); render(); }, 220);
}
function selectDiagnosis(i) {
  State.setSelectedDiagnosis(i);
  document.querySelectorAll('#card .option').forEach((btn, idx) => btn.classList.toggle('selected', idx === i));
  setTimeout(() => { State.setScreen('question'); State.setQIndex(0); render(); }, 220);
}
function selectAnswer(i) {
  State.setAnswer(State.qIndex, i);
  document.querySelectorAll('#card .option').forEach((btn, idx) => btn.classList.toggle('selected', idx === i));
  setTimeout(() => {
    const answeredCount = State.qIndex + 1;
    if (State.qIndex >= State.QUESTIONS.length - 1) {
      State.setScreen('calculating');
      render();
      setTimeout(() => animateCalculatingScreen(State), 60);
      setTimeout(() => {
        if (State.screen === 'calculating') { State.setScreen('instantResult'); render(); }
      }, 8000);
      return;
    }
    if (answeredCount % 4 === 0) {
      State.setBreatherIndex((answeredCount / 4 - 1) % BREATHERS.length);
      State.setScreen('breather');
      render();
      setTimeout(() => animateBreatherTimer(), 60);
      setTimeout(() => {
        if (State.screen === 'breather') { State.setQIndex(State.qIndex + 1); State.setScreen('question'); render(); }
      }, 4000);
    } else {
      State.setQIndex(State.qIndex + 1);
      render();
    }
  }, 220);
}
function continueFromSparkloop() {
  advancePostResults('sparkloop');
}
function goBack() {
  if (State.screen === 'ageSelect') { State.setScreen('genderSelect'); render(); }
  else if (State.screen === 'diagnosisStatus') { State.setScreen('ageSelect'); render(); }
  else if (State.screen === 'question') {
    if (State.qIndex > 0) { State.setQIndex(State.qIndex - 1); render(); }
    else { State.setScreen('diagnosisStatus'); render(); }
  } else if (State.screen === 'instantResult') { State.setScreen('question'); State.setQIndex(State.QUESTIONS.length - 1); render(); }
}

// Confirmed via direct A/B test: a bare page with nothing but SparkLoop's
// own script and a plain form mounts their overlay cleanly — no glitch,
// no cover needed. Everything this project built on top (a full-screen
// spinner, polling their shadow DOM for image-readiness, nudging their
// images to load eagerly, fighting for DOM position) turned out to be
// the thing introducing visible jank, not a fix for anything SparkLoop
// itself was doing wrong. So: do nothing, exactly like the bare page,
// and only step in if their widget doesn't show up at all — a safety
// net for the one real gap (see screens/sparkloop.js's note: unconfirmed
// whether their auto-detect fires for a custom fetch()-based form like
// ours), not a visual cover for their mount. Returns the timer id so a
// failed subscribe request can clearTimeout() it outright.
function armSparkloopFallback() {
  const FALLBACK_MS = 8000;
  return setTimeout(() => {
    if (!document.querySelector('sparkloop-signup-flow')) {
      State.setScreen('sparkloop');
      render();
    }
  }, FALLBACK_MS);
}

// Reported still glitching even with zero active interference above —
// pointing at something passive rather than anything we're doing in the
// moment. SparkLoop's overlay fades itself in from opacity:0 over
// ~250-500ms (confirmed via an earlier live trace); whatever sits behind
// it is visible through that fade. On the bare A/B test page that's
// plain white on white — invisible. Here it's this screen's gauge,
// accent-yellow button, and colored bars, so the same natural fade reads
// as a visible glitch. Replacing this screen's own content with a plain
// hand-off screen the instant we submit removes what's behind the fade
// entirely — and doubles as the actual "you're being moved along"
// moment for the visitor, rather than a dead blank gap. Reuses the
// companion mascot's thinking pose (same one calculating.js uses) and
// the app's standard .fade-in entrance, so it reads as part of the same
// product, not a different loading mechanism bolted on.
function showSparkloopBridge() {
  document.getElementById('card').innerHTML = `
    <div class="fade-in sparkloop-bridge">
      <div class="sparkloop-bridge-icon char-pop-in">${poseThinkingSvg(74)}</div>
      <p class="lede centered small">One second<span class="sparkloop-bridge-dots"><span>.</span><span>.</span><span>.</span></span></p>
    </div>
  `;
  hydrateIcons();
}

async function submitEmail(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const s = State.fullScoring();
  const report = State.buildResultsReport();
  // Armed synchronously here, before the fetch() below, purely as a
  // safety net — see armSparkloopFallback's note. Nothing visible
  // happens unless SparkLoop's widget never shows up at all.
  const fallbackTimer = armSparkloopFallback();
  // Replaces the whole form synchronously, before the fetch below — see
  // showSparkloopBridge's note. This also means there's no submit button
  // left in the DOM to double-click once this runs, so no separate
  // disable-the-button step is needed either.
  showSparkloopBridge();
  try {
    const res = await fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, subtype: s.subtype, score: s.totalScore,
        gender: State.selectedGender !== null ? State.GENDER_OPTIONS[State.selectedGender] : null,
        ageRange: State.selectedAge !== null ? State.AGE_RANGES[State.selectedAge] : null,
        diagnosisStatus: State.selectedDiagnosis !== null ? State.DIAGNOSIS_OPTIONS[State.selectedDiagnosis] : null,
        // Raw answers + which rubric version produced `report` below — so
        // a submission stays explainable/auditable later even if the
        // scoring formula in state.js changes down the line (see
        // state.js's buildResultsReport() note on SCORING_VERSION).
        scoringVersion: report.scoringVersion,
        answers: State.answers,
        report,
        ...utm,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[subscribe] failed:', res.status, data);
      throw new Error('Subscription request failed');
    }
    track('email_submitted', { subtype: s.subtype, seconds_to_submit: secondsSinceStart() });
    State.setSubmittedEmail(email);
    // Deliberately no further setScreen()/render() here beyond the bridge
    // already showing: SparkLoop's embedded widget auto-detects this same
    // successful submit and takes over the whole page as a full-screen
    // overlay within a moment. Swapping to another screen of our own
    // right before that happens caused a janky double-transition (our
    // screen flashing, then the overlay slamming on top of it) — so the
    // bridge just sits there calmly underneath instead.
    // Fallback armed above stays running in the background — it's a
    // no-op unless SparkLoop's widget never actually shows up.
  } catch (err) {
    console.error('[subscribe] error:', err);
    track('email_submit_failed');
    clearTimeout(fallbackTimer);
    // Screen is still 'instantResult' — a plain render() regenerates the
    // real results screen (and a fresh, enabled form) from scratch,
    // rather than trying to manually restore the bridge's replaced DOM.
    render();
    alert("Something didn't go through. Mind trying again?");
  }
}

/* ============================================================
   DEV-ONLY SCREEN JUMPER — temporary, delete this whole block
   before launch.
   ============================================================ */
function initDevPanel() {
  // TASK-2 fix: actually gate this behind ?dev=1, matching what the
  // HTML comment above #devPanel already claimed (it previously forced
  // display:flex unconditionally for every visitor). Production users
  // never see or reserve layout space for this panel now.
  if (!new URLSearchParams(location.search).has('dev')) return;
  const panel = document.getElementById('devPanel');
  const screens = ['genderSelect', 'ageSelect', 'diagnosisStatus', 'question', 'breather', 'calculating', 'instantResult', 'sparkloop', 'thankYou'];
  panel.style.display = 'flex';
  panel.innerHTML = screens.map(s =>
    `<button onclick="devJumpTo('${s}')" style="font-size:11px;padding:6px 10px;border-radius:6px;border:none;background:#333;color:#fff;cursor:pointer;">${s}</button>`
  ).join('');
}
function devJumpTo(targetScreen) {
  State.setScreen(targetScreen);
  if (targetScreen === 'question') State.setQIndex(0);
  if (targetScreen === 'breather') State.setBreatherIndex(0);
  render();
}

// "Take the quiz again" on the thank-you screen — must clear the saved
// progress before reloading, or restore() below would just put the
// visitor right back on thankYou, making this button a no-op.
function restartQuiz() {
  State.clearSaved();
  location.reload();
}

// Expose to window for the inline onclick="" attributes in the rendered
// markup (see the file-level comment above) — the one spot this split
// needed a deliberate global side effect.
window.selectGenderOption = selectGenderOption;
window.advanceFromGender = advanceFromGender;
window.skipGender = skipGender;
window.selectAge = selectAge;
window.selectDiagnosis = selectDiagnosis;
window.selectAnswer = selectAnswer;
window.goBack = goBack;
window.continueFromSparkloop = continueFromSparkloop;
window.submitEmail = submitEmail;
window.devJumpTo = devJumpTo;
window.restartQuiz = restartQuiz;

// Restore progress from a previous load in this tab (if any) BEFORE the
// first render — this is what makes refreshing mid-quiz stay on the same
// screen instead of bouncing back to genderSelect. See state.js's
// save()/restore()/clearSaved(). Must run before the sparkloop-return
// check right below, so that check's own setScreen('thankYou') — a
// fresh, authoritative signal from SparkLoop's redirect — always wins
// over whatever screen happened to be saved.
State.restore();

// Entry point for SparkLoop's "End of journey" redirect, configured in
// their dashboard to send subscribers back here after the recommendations
// step, instead of ending on SparkLoop's own generic confirmation screen.
// This is a hard browser navigation, not an in-page transition — see
// index.html's #sparkloopReturnMask, painted inline before this module
// even started loading, which bridges that reload's own blank gap.
const isSparkloopReturn = new URLSearchParams(location.search).get('from') === 'sparkloop';
if (isSparkloopReturn) {
  State.setScreen('thankYou');
}

render();
initDevPanel();

if (isSparkloopReturn) {
  // The real thankYou screen has now painted into #card above — safe to
  // fade the early inline cover away.
  const returnMask = document.getElementById('sparkloopReturnMask');
  if (returnMask) {
    returnMask.classList.add('fade-out');
    setTimeout(() => returnMask.remove(), 320);
  }
}
