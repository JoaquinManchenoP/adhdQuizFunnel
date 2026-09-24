/* ============================================================
   ENTRY POINT (T014 split)
   Imports state, components, and every screen; owns the central
   render()/screenBodyHtml() dispatcher, all DOM event handlers, and
   mounts the initial screen. Loaded via
   <script type="module" src="js/main.js"></script> in index.html.

   IMPORTANT — inline `onclick="..."` handlers: the screen/component
   markup (unchanged from before this refactor) calls functions like
   `onclick="selectGender(0)"`, `onclick="goBack()"`,
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
import { renderBreather, animateBreatherTimer, BREATHERS } from './screens/breather.js';
import { renderQuestion } from './screens/question.js';
import { renderCalculating, animateCalculatingScreen } from './screens/calculating.js';
import { renderInstantResult, animateResultGauge } from './screens/instantResult.js';
import { renderEmailCapture } from './screens/emailCapture.js';
import { renderThankYou } from './screens/thankYou.js';
import { prefersReducedMotion, hydrateIcons } from './utils.js';
import { track, trackScreen, trackQuizStarted, secondsSinceStart, utm } from './analytics.js';

let quizCompletedTracked = false;

function screenBodyHtml() {
  if (State.screen === 'genderSelect') return renderGenderSelect(State);
  if (State.screen === 'ageSelect') return renderAgeSelect(State);
  if (State.screen === 'diagnosisStatus') return renderDiagnosisStatus(State);
  if (State.screen === 'breather') return renderBreather(State);
  if (State.screen === 'question') return renderQuestion(State);
  if (State.screen === 'calculating') return renderCalculating();
  if (State.screen === 'instantResult') return renderInstantResult(State);
  if (State.screen === 'emailCapture') return renderEmailCapture();
  if (State.screen === 'thankYou') return renderThankYou(State);
}

function render() {
  const showTitle = (State.screen === 'genderSelect' || State.screen === 'question' || State.screen === 'ageSelect' || State.screen === 'diagnosisStatus' || State.screen === 'breather');
  const html = topbarHtml(State, showTitle) + progressBlockHtml(State) + screenBodyHtml();
  const apply = () => { document.getElementById('card').innerHTML = html; hydrateIcons(); };
  if (document.startViewTransition && !prefersReducedMotion()) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
  trackScreen(State.screen, State.qIndex);
  if (State.screen === 'instantResult' && !quizCompletedTracked) {
    quizCompletedTracked = true;
    track('quiz_completed', { subtype: State.fullScoring().subtype });
  }
  if (State.screen === 'instantResult') {
    const percent = Math.round((State.partAScore() / 24) * 100);
    setTimeout(() => animateResultGauge(percent), 200);
  }
}

function selectGender(i) {
  trackQuizStarted();
  State.setSelectedGender(i);
  document.querySelectorAll('#card .option').forEach((btn, idx) => btn.classList.toggle('selected', idx === i));
  setTimeout(() => { State.setScreen('ageSelect'); render(); }, 220);
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
function goBack() {
  if (State.screen === 'ageSelect') { State.setScreen('genderSelect'); render(); }
  else if (State.screen === 'diagnosisStatus') { State.setScreen('ageSelect'); render(); }
  else if (State.screen === 'question') {
    if (State.qIndex > 0) { State.setQIndex(State.qIndex - 1); render(); }
    else { State.setScreen('diagnosisStatus'); render(); }
  } else if (State.screen === 'instantResult') { State.setScreen('question'); State.setQIndex(State.QUESTIONS.length - 1); render(); }
  else if (State.screen === 'emailCapture') { State.setScreen('instantResult'); render(); }
}
function goEmailCapture() { State.setScreen('emailCapture'); render(); }

async function submitEmail(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const s = State.fullScoring();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  try {
    console.log('[subscribe] sending request for', email);
    const res = await fetch('/.netlify/functions/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, subtype: s.subtype, score: s.totalScore,
        gender: State.selectedGender !== null ? State.GENDER_OPTIONS[State.selectedGender] : null,
        ageRange: State.selectedAge !== null ? State.AGE_RANGES[State.selectedAge] : null,
        diagnosisStatus: State.selectedDiagnosis !== null ? State.DIAGNOSIS_OPTIONS[State.selectedDiagnosis] : null,
        ...utm,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[subscribe] failed:', res.status, data);
      throw new Error('Subscription request failed');
    }
    console.log(data.mock
      ? '[subscribe] ✅ mock success — beehiiv not connected yet, function logic checks out'
      : '[subscribe] ✅ confirmed sent to beehiiv');
    track('email_submitted', { subtype: s.subtype, seconds_to_submit: secondsSinceStart() });
    State.setScreen('thankYou');
    render();
  } catch (err) {
    console.error('[subscribe] error:', err);
    track('email_submit_failed');
    btn.disabled = false;
    btn.textContent = originalLabel;
    alert("Something didn't go through. Mind trying again?");
  }
}

/* ============================================================
   DEV-ONLY SCREEN JUMPER — temporary, delete this whole block
   before launch.
   ============================================================ */
function initDevPanel() {
  const panel = document.getElementById('devPanel');
  const screens = ['genderSelect', 'ageSelect', 'diagnosisStatus', 'question', 'breather', 'calculating', 'instantResult', 'emailCapture', 'thankYou'];
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

// Expose to window for the inline onclick="" attributes in the rendered
// markup (see the file-level comment above) — the one spot this split
// needed a deliberate global side effect.
window.selectGender = selectGender;
window.selectAge = selectAge;
window.selectDiagnosis = selectDiagnosis;
window.selectAnswer = selectAnswer;
window.goBack = goBack;
window.goEmailCapture = goEmailCapture;
window.submitEmail = submitEmail;
window.devJumpTo = devJumpTo;

render();
initDevPanel();
