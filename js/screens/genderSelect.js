/* ============================================================
   Screen: genderSelect
   ============================================================ */

export function renderGenderSelect(state) {
  const GENDER_ICONS = [
    // Woman — Venus symbol
    '<circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="2"/><path d="M12 14v6M9 17h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    // Man — Mars symbol
    '<circle cx="10" cy="14" r="5" stroke="currentColor" stroke-width="2"/><path d="M14 10l6-6M14 4h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    // Non-binary — combined Venus + Mars symbol
    '<circle cx="10" cy="12" r="4.5" stroke="currentColor" stroke-width="2"/><path d="M13.2 8.8l5.8-5.8M13.2 3h5.8v5.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 16.5v4.5M7.7 18.75h4.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    // Prefer not to say — uses the real Lucide "eye-off" icon instead of a hand-drawn one
    null,
  ];
  return `
    <div class="fade-in">
      <div class="question-text">What's your gender?</div>
      <div class="options">
        ${state.GENDER_OPTIONS.map((opt, i) => `
          <button class="option ${state.selectedGender === i ? 'selected' : ''}" onclick="selectGender(${i})">
            <span style="display:flex; align-items:center; gap:14px;">
              <span style="display:flex; color:var(--text-strong); flex-shrink:0;">${
                GENDER_ICONS[i] ? `<svg width="25" height="25" viewBox="0 0 24 24" fill="none">${GENDER_ICONS[i]}</svg>` : `<i data-lucide="eye-off" width="25" height="25"></i>`
              }</span>
              <span>${opt}</span>
            </span>
            <span class="check-icon"><i data-lucide="check" width="21" height="21"></i></span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}
