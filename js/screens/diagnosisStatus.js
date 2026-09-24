/* ============================================================
   Screen: diagnosisStatus
   ============================================================ */

export function renderDiagnosisStatus(state) {
  return `
    <div class="fade-in">
      <div class="question-text">Have you ever been diagnosed with ADHD?</div>
      <p class="lede small">It helps us personalize your results, but everyone's welcome here, diagnosis or not.</p>
      <div class="options">
        ${state.DIAGNOSIS_OPTIONS.map((opt, i) => `
          <button class="option ${state.selectedDiagnosis === i ? 'selected' : ''}" onclick="selectDiagnosis(${i})">
            <span>${opt}</span><span class="check-icon"><i data-lucide="check" width="21" height="21"></i></span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
