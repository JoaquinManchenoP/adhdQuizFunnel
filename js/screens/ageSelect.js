/* ============================================================
   Screen: ageSelect
   ============================================================ */

export function renderAgeSelect(state) {
  return `
    <div class="fade-in">
      <div class="question-text">What's your age?</div>
      <div class="options">
        ${state.AGE_RANGES.map((range, i) => `
          <button class="option ${state.selectedAge === i ? 'selected' : ''}" onclick="selectAge(${i})">
            <span>${range}</span><span class="check-icon"><i data-lucide="check" width="21" height="21"></i></span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
