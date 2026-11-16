/* ============================================================
   Results page — type logic + pricing config
   Pure functions and named, tunable constants only (no DOM/markup
   here). Reads the stored per-user values the quiz already produces
   (js/state.js's buildResultsReport()/buildPatternReport()) but never
   changes how those are computed. Scope: results page only.
   ============================================================ */

// Overall-% -> level label. Same four tiers as state.js's own
// overallLevel() (kept independent, per the results-page-only scope,
// rather than importing and risking drift if that function ever moves).
export const LEVELS = [
  { min: 70, label: 'High' },
  { min: 55, label: 'Medium-high' },
  { min: 40, label: 'Medium' },
  { min: 0, label: 'Low' },
];
export function levelFor(pct) {
  for (const l of LEVELS) if (pct >= l.min) return l.label;
  return 'Low';
}

export const LOW_THRESHOLD = 40;
export const COMBINED_THRESHOLD = 55;

export const TYPE_LABELS = {
  inattentive: 'Inattentive',
  'hyperactive-impulsive': 'Hyperactive-impulsive',
  combined: 'Combined',
};

// inattentive_score = mean(time, overload, paralysis)
export function computeInattentiveScore(pcts) {
  return Math.round((pcts.time + pcts.overload + pcts.paralysis) / 3);
}

// hyperactive_score = mean(impulsivity, restlessness) IF a separate
// restlessness area exists. It doesn't: the quiz's two explicit
// restlessness questions ("How often do you feel restless?", "Do you
// have trouble staying still?" — QUESTIONS[3] and QUESTIONS[4]) are
// pooled inside the `impulsivity` pattern bucket in state.js's
// PATTERN_MAP, not scored as their own area. So this falls back to
// impulsivity alone, exactly as the spec's fallback rule allows —
// flagged here (and in the build report) rather than silently assumed.
export const HYPERACTIVE_SCORE_IS_IMPULSIVITY_ONLY = true;
export function computeHyperactiveScore(pcts) {
  return pcts.impulsivity;
}

// Routing: 'low' | 'inattentive' | 'hyperactive-impulsive' | 'combined'
export function computeResultType(overallPct, inattentiveScore, hyperactiveScore) {
  if (overallPct < LOW_THRESHOLD) return 'low';
  if (inattentiveScore >= COMBINED_THRESHOLD && hyperactiveScore >= COMBINED_THRESHOLD) return 'combined';
  if (inattentiveScore === hyperactiveScore) return 'inattentive'; // exact tie below threshold
  return inattentiveScore > hyperactiveScore ? 'inattentive' : 'hyperactive-impulsive';
}

/* ---------------- Pricing ---------------- */
export const PRICES = {
  type_guide: 9,
  all_guides: 19,
  all_guides_separately: 27,
  complete: 34,
  complete_separately: 60,
  personal_profile: 24,
  assessment_prep: 9,
};

export const UNLOCK_LABELS = {
  type_guide: `Unlock your type guide · €${PRICES.type_guide}`,
  personal_profile: `Unlock your personal profile · €${PRICES.personal_profile}`,
  assessment_prep: `Unlock assessment prep · €${PRICES.assessment_prep}`,
};

// Pure function, no UI: price to move from an already-purchased tier up
// to a higher one (target tier price minus the price already paid).
// `paidProduct` may be null/'' for "nothing purchased yet".
export function upgradePrice(targetProduct, paidProduct) {
  const tierPrice = (p) => {
    if (p === 'complete') return PRICES.complete;
    if (p === 'all_guides') return PRICES.all_guides;
    if (p === 'type_guide') return PRICES.type_guide;
    return 0;
  };
  return Math.max(tierPrice(targetProduct) - tierPrice(paidProduct), 0);
}

/* ---------------- Fixed copy (verbatim) ---------------- */
export const DISCLAIMER = "This is not an ADHD diagnosis. For a diagnosis, consult a licensed professional.";

// Approved warm data-viz palette only (adhd-ui + quiz-funnel-adhd-ui
// extension) — never gray/ink as a fill.
export const BAR_COLORS = ['var(--accent)', 'var(--dataviz-coral)', 'var(--dataviz-teal)', 'var(--dataviz-periwinkle)'];
export const BAR_HIGHLIGHT = 'var(--accent-alt-deep)';
