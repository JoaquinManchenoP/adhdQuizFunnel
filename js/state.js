/* ============================================================
   STATE MACHINE (T014 split)
   Current-screen tracking, quiz answers, and the data the quiz is
   built from live here. No rendering/DOM code belongs in this file —
   js/screens/*.js and js/components/*.js own all markup, and
   js/main.js owns all DOM manipulation/event wiring. This module only
   tracks state and derives scores from it.

   NOTE on live bindings: the `let` values below (screen, qIndex,
   breatherIndex, selectedGender, selectedAge, selectedDiagnosis) are
   exported as live ES-module bindings — any module that does
   `import { screen } from './state.js'` or `import * as State from
   './state.js'` always reads the CURRENT value, but only this module
   may reassign them directly. Every other module must go through the
   setter functions below. `answers` is a mutable array — its element
   values are also expected to be changed only via `setAnswer()`.
   ============================================================ */

/* ---------------- QUESTION DATA (22-item set) ---------------- */
export const QUESTIONS = [
  { text: "How often do you start something, then never actually finish it?", domain: "A" },
  { text: "How often do you just forget things you meant to do?", domain: "A" },
  { text: "How often do you put off starting things that require focus or mental effort?", domain: "A" },
  { text: "How often do you feel restless?", domain: "B" },
  { text: "Do you have trouble staying still?", domain: "B" },
  { text: "How often do you interrupt people without meaning to?", domain: "B" },
  { text: "How often does just getting yourself ready for a task feel harder than the task itself?", domain: "A" },
  { text: "How hard is it for you to relax?", domain: "B", hint: "This one's about difficulty, not frequency:", options: ["Not hard at all", "A little hard", "Moderately hard", "Very hard", "Extremely hard"] },
  { text: "How often do you make mistakes because you got distracted?", domain: "A" },
  { text: "How often do you zone out while someone's talking to you?", domain: "A" },
  { text: "How often do you lose things you regularly need?", domain: "A" },
  { text: "How often are you distracted by sounds?", domain: "A" },
  { text: "Does this sound like you? “I often feel misunderstood by the people around me.”", domain: "C", options: ["No", "Yes"] },
  { text: "How often do you get so absorbed in something that you lose track of everything else?", domain: "C" },
  { text: "How often do you start the day meaning to get organized, then end up feeling like you failed?", domain: "C" },
  { text: "Do you ever feel like a fraud, even when things are actually going fine?", domain: "C", options: ["No", "Yes"] },
  { text: "Do you go out of your way to keep people happy with you?", domain: "C", options: ["No", "Yes"] },
  { text: "How often are you way off when you guess how long something will take?", domain: "C" },
  { text: "How often little things set you off more than they probably need to?", domain: "C" },
  { text: "How often is it hard to stop one thing and start another?", domain: "C" },
  { text: "Are you harder on yourself than you'd ever be on anyone else?", domain: "C", options: ["No", "Yes"] },
  { text: "How often do bills or payments slip through the cracks?", domain: "C" },
];

export const OPTIONS = ["Never", "Rarely", "Sometimes", "Often", "Very Often"];
export const PART_A_COUNT = 6;

export let answers = new Array(QUESTIONS.length).fill(null);
export let screen = "genderSelect";
export let qIndex = 0;
export let breatherIndex = 0;
export let selectedGender = null;
export let selectedAge = null;
export let selectedDiagnosis = null;
export let submittedEmail = null;
export const AGE_RANGES = ["18 to 24", "25 to 34", "35 to 44", "45 to 54", "55 to 64", "65+"];
export const GENDER_OPTIONS = ["Woman", "Man", "Nonbinary", "Prefer not to say"];
export const DIAGNOSIS_OPTIONS = ["I'm diagnosed by a doctor", "I'm self diagnosed", "I suspect I might have ADHD", "Something else"];

/* ---------------- Refresh persistence ----------------
   Survives a page reload mid-quiz (sessionStorage: gone once the tab
   actually closes, so it doesn't linger across unrelated future visits).
   save() is called from every setter below; restore() is called once by
   main.js before the first render(). Note: "Take the quiz again" on the
   thank-you screen must call clearSaved() before reloading, or this would
   make that button a no-op by restoring straight back to 'thankYou'. */
const STORAGE_KEY = 'adhdQuizState';
function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      screen, qIndex, breatherIndex, selectedGender, selectedAge, selectedDiagnosis, answers, submittedEmail,
    }));
  } catch (e) { /* storage unavailable (private mode, quota) — just don't persist */ }
}
export function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.screen) screen = saved.screen;
    if (typeof saved.qIndex === 'number') qIndex = saved.qIndex;
    if (typeof saved.breatherIndex === 'number') breatherIndex = saved.breatherIndex;
    if (saved.selectedGender !== undefined) selectedGender = saved.selectedGender;
    if (saved.selectedAge !== undefined) selectedAge = saved.selectedAge;
    if (saved.selectedDiagnosis !== undefined) selectedDiagnosis = saved.selectedDiagnosis;
    // Guards against a stale save from a previous version of QUESTIONS.
    if (Array.isArray(saved.answers) && saved.answers.length === QUESTIONS.length) answers = saved.answers;
    if (saved.submittedEmail !== undefined) submittedEmail = saved.submittedEmail;
    // 'breather' and 'calculating' are transient, self-advancing screens —
    // their own auto-advance timers live in the selectAnswer() call that
    // enters them (js/main.js), not in render() itself, so restoring
    // straight into one left no timer running to move the visitor along.
    // Fast-forward past them to whatever stable screen they'd naturally
    // land on next instead.
    if (screen === 'breather') { screen = 'question'; qIndex += 1; }
    else if (screen === 'calculating') { screen = 'instantResult'; }
  } catch (e) { /* corrupted/unavailable storage — just start fresh */ }
}
export function clearSaved() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* nothing to clear */ }
}

/* ---------------- Mutators ----------------
   Every screen/component reads state via import; only these functions
   (called from js/main.js's event handlers) may change it. */
export function setScreen(s) { screen = s; save(); }
export function setQIndex(i) { qIndex = i; save(); }
export function setBreatherIndex(i) { breatherIndex = i; save(); }
export function setSelectedGender(i) { selectedGender = i; save(); }
export function setSelectedAge(i) { selectedAge = i; save(); }
export function setSelectedDiagnosis(i) { selectedDiagnosis = i; save(); }
export function setSubmittedEmail(e) { submittedEmail = e; save(); }
export function setAnswer(index, value) { answers[index] = value; save(); }

/* ---------------- Scoring ---------------- */
export function partAScore() { return answers.slice(0, PART_A_COUNT).reduce((s, v) => s + (v ?? 0), 0); }
export function partABand(percent) {
  if (percent < 15) return { label: "Low signs of ADHD related traits", cls: "low", copy: "Few ADHD related patterns showed up in your answers." };
  if (percent < 35) return { label: "Mild signs of ADHD related traits", cls: "low", copy: "A few ADHD related patterns showed up, but not often." };
  if (percent < 55) return { label: "Moderate signs of ADHD related traits", cls: "", copy: "Some of your answers match patterns common in ADHD. Others not so much." };
  if (percent < 75) return { label: "Strong signs of ADHD related traits", cls: "high", copy: "Several ADHD related patterns showed up often. It may be worth taking a closer look." };
  return { label: "Very strong signs of ADHD related traits", cls: "high", copy: "Most core ADHD related patterns showed up often. Talking to a professional could help." };
}
export function fullScoring() {
  const inattentiveIdx = [0,1,2,6,8,9,10,11];
  const hyperImpulsiveIdx = [3,4,5,7];
  const sum = (idxs) => idxs.reduce((s,i) => s + (answers[i] ?? 0), 0);
  const inattentive = sum(inattentiveIdx);
  const hyperImpulsive = sum(hyperImpulsiveIdx);
  const inattentivePct = inattentive / (inattentiveIdx.length * 4);
  const hyperImpulsivePct = hyperImpulsive / (hyperImpulsiveIdx.length * 4);
  const diff = (inattentivePct - hyperImpulsivePct) * 100;
  let subtype = "Combined";
  if (diff > 15) subtype = "Inattentive leaning";
  else if (diff < -15) subtype = "Hyperactive Impulsive leaning";
  const totalMax = QUESTIONS.reduce((s, q) => s + ((q.options ? q.options.length : OPTIONS.length) - 1), 0);
  return { inattentive, hyperImpulsive, inattentivePct, hyperImpulsivePct, subtype, totalScore: answers.reduce((s,v) => s + (v ?? 0), 0), totalMax };
}

/* ---------------- Full results report (v1) ----------------
   This is the single source of truth for the POST-EMAIL results: the
   thankYou debug view, the payload sent to netlify/functions/subscribe.js
   for Netlify Blobs persistence, and the custom_fields sent to beehiiv
   all read from THIS, so the UI and the results email can never disagree.
   (instantResult.js's free teaser gauge deliberately stays on
   partAScore()/partABand() — first PART_A_COUNT questions only — that's
   the pre-email teaser, not the full breakdown; don't point it at this.)

   SCORING_VERSION is stamped onto every persisted record so that if this
   rubric ever changes, old submissions stay explainable against the
   rules that actually produced them, rather than being silently
   reinterpreted by whatever the formula looks like later. Bump it any
   time the math below changes in a way that would move someone's score. */
export const SCORING_VERSION = "v1";

function domainMax(idxs) {
  return idxs.reduce((s, i) => s + ((QUESTIONS[i].options ? QUESTIONS[i].options.length : OPTIONS.length) - 1), 0);
}
function domainScore(idxs) {
  return idxs.reduce((s, i) => s + (answers[i] ?? 0), 0);
}
// Same five-tier thresholds as partABand(), generalized to any domain
// label so inattentive/hyperactive-impulsive/associated-patterns all get
// consistent, explainable wording instead of three bespoke copy sets.
function domainBand(pct, domainLabel) {
  // "point to {domainLabel}" reads cleanly whether domainLabel is a trait
  // phrase ("inattentive-type ADHD traits") or already starts with the
  // word "patterns" ("patterns often associated with ADHD") — avoids the
  // "patterns tied to patterns..." stutter an earlier template had.
  if (pct < 15) return { label: `Low signs of ${domainLabel}`, cls: "low", copy: `Not much in your answers points to ${domainLabel}.` };
  if (pct < 35) return { label: `Mild signs of ${domainLabel}`, cls: "low", copy: `A little in your answers points to ${domainLabel}, but not often.` };
  if (pct < 55) return { label: `Moderate signs of ${domainLabel}`, cls: "", copy: `Some of your answers point to ${domainLabel}. Others don't.` };
  if (pct < 75) return { label: `Strong signs of ${domainLabel}`, cls: "high", copy: `Several of your answers point to ${domainLabel}.` };
  return { label: `Very strong signs of ${domainLabel}`, cls: "high", copy: `Most of your answers point to ${domainLabel}.` };
}
function domainReport(idxs, label) {
  const score = domainScore(idxs);
  const max = domainMax(idxs);
  const pct = max ? Math.round((score / max) * 100) : 0;
  return { score, max, pct, ...domainBand(pct, label) };
}

export function buildResultsReport() {
  const inattentiveIdx = [0,1,2,6,8,9,10,11];
  const hyperImpulsiveIdx = [3,4,5,7];
  // Domain C (10 of 22 questions: emotional regulation, time blindness,
  // people-pleasing, perfectionism-leaning items) previously had no
  // scoring output at all — surfaced here as its own "associated
  // patterns" bucket rather than silently folded into A or B, since it's
  // nearly half the quiz and measures something genuinely distinct from
  // core inattentive/hyperactive-impulsive traits.
  const associatedIdx = [12,13,14,15,16,17,18,19,20,21];

  const inattentive = domainReport(inattentiveIdx, "inattentive-type ADHD traits");
  const hyperImpulsive = domainReport(hyperImpulsiveIdx, "hyperactive-impulsive ADHD traits");
  const associated = domainReport(associatedIdx, "patterns often associated with ADHD");

  const diff = inattentive.pct - hyperImpulsive.pct;
  let subtype = "Combined";
  if (diff > 15) subtype = "Inattentive leaning";
  else if (diff < -15) subtype = "Hyperactive Impulsive leaning";

  const totalScore = answers.reduce((s, v) => s + (v ?? 0), 0);
  const totalMax = QUESTIONS.reduce((s, q) => s + ((q.options ? q.options.length : OPTIONS.length) - 1), 0);
  const totalPct = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;

  return {
    scoringVersion: SCORING_VERSION,
    subtype,
    totalScore, totalMax, totalPct,
    inattentive, hyperImpulsive, associated,
  };
}
