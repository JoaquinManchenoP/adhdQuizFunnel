/* ============================================================
   Screen: thankYou
   ============================================================ */

export function renderThankYou(state) {
  const s = state.fullScoring();
  const debug = new URLSearchParams(location.search).has('debug');
  return `
    <div class="fade-in">
      <div class="icon-square mint"><i data-lucide="check" width="28" height="28" color="var(--ink)"></i></div>
      <h1>Check your inbox.</h1>
      <p class="lede">Your full report and starter guide are on the way.</p>
      ${debug ? `
      <div class="disclaimer">
        DEBUG (visible because of ?debug=1):<br>
        gender: <strong>${state.selectedGender !== null ? state.GENDER_OPTIONS[state.selectedGender] : 'not set'}</strong><br>
        age_range: <strong>${state.selectedAge !== null ? state.AGE_RANGES[state.selectedAge] : 'not set'}</strong><br>
        diagnosis_status: <strong>${state.selectedDiagnosis !== null ? state.DIAGNOSIS_OPTIONS[state.selectedDiagnosis] : 'not set'}</strong><br>
        subtype: <strong>${s.subtype}</strong><br>
        total_score: <strong>${s.totalScore} / ${s.totalMax}</strong><br>
        inattentive_pct: <strong>${Math.round(s.inattentivePct*100)}%</strong><br>
        hyperactive_impulsive_pct: <strong>${Math.round(s.hyperImpulsivePct*100)}%</strong>
      </div>` : ''}
    </div>
  `;
}
