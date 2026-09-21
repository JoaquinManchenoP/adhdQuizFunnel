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

/* ---------------- QUESTION DATA (18-item set) ---------------- */
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
export const AGE_RANGES = ["18 to 24", "25 to 34", "35 to 44", "45 to 54", "55 to 64", "65+"];
export const GENDER_OPTIONS = ["Woman", "Man", "Nonbinary", "Prefer not to say"];
export const DIAGNOSIS_OPTIONS = ["I'm diagnosed by a doctor", "I'm self diagnosed", "I suspect I might have ADHD", "Something else"];

/* ---------------- Mutators ----------------
   Every screen/component reads state via import; only these functions
   (called from js/main.js's event handlers) may change it. */
export function setScreen(s) { screen = s; }
export function setQIndex(i) { qIndex = i; }
export function setBreatherIndex(i) { breatherIndex = i; }
export function setSelectedGender(i) { selectedGender = i; }
export function setSelectedAge(i) { selectedAge = i; }
export function setSelectedDiagnosis(i) { selectedDiagnosis = i; }
export function setAnswer(index, value) { answers[index] = value; }

/* ---------------- Scoring ---------------- */
export function partAScore() { return answers.slice(0, PART_A_COUNT).reduce((s, v) => s + (v ?? 0), 0); }
export function partABand(percent) {
  if (percent < 15) return { label: "Low signs of ADHD-related traits", cls: "low", copy: "Few ADHD-related patterns showed up in your answers." };
  if (percent < 35) return { label: "Mild signs of ADHD-related traits", cls: "low", copy: "A few ADHD-related patterns showed up, but not often." };
  if (percent < 55) return { label: "Moderate signs of ADHD-related traits", cls: "", copy: "Some of your answers match patterns common in ADHD. Others not so much." };
  if (percent < 75) return { label: "Strong signs of ADHD-related traits", cls: "high", copy: "Several ADHD-related patterns showed up often. It may be worth taking a closer look." };
  return { label: "Very strong signs of ADHD-related traits", cls: "high", copy: "Most core ADHD-related patterns showed up often. Talking to a professional could help." };
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
  if (diff > 15) subtype = "Inattentive-leaning";
  else if (diff < -15) subtype = "Hyperactive-Impulsive-leaning";
  const totalMax = QUESTIONS.reduce((s, q) => s + ((q.options ? q.options.length : OPTIONS.length) - 1), 0);
  return { inattentive, hyperImpulsive, inattentivePct, hyperImpulsivePct, subtype, totalScore: answers.reduce((s,v) => s + (v ?? 0), 0), totalMax };
}
