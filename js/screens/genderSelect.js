/* ============================================================
   Screen: genderSelect
   ============================================================
   T016 rebuild: this screen now implements the quiz-funnel-adhd-ui
   skill's "accent-flip demographic screen" pattern verbatim (see
   ~/.claude/skills/quiz-funnel-adhd-ui/SKILL.md, "Optional extension:
   an accent-flip demographic screen" + references/components.md
   section 10), instead of the old in-shell white-card question style.
   It is deliberately NOT rendered through the shared
   topbarHtml()/progressBlockHtml() chrome — js/main.js's render()
   special-cases this screen and renders only this function's markup,
   full-bleed. See js/main.js's render() and the CSS block in
   index.html tagged "T016 — accent-flip demographic screen" for the
   supporting pieces (fixed-position full-bleed shell + keyframes).

   Deviation from the skill's accent-flip spec (flagged, per the
   skill's own escalation rule): the pattern calls for every option row
   to carry the same generic profile-outline icon in a pale-yellow
   chip. Per explicit user request, those icon chips have been removed
   — options are distinguished by label text only now, no emoji and no
   icon.
   ============================================================ */

export function renderGenderSelect(state) {
  return `
    <div class="adhd-gender-screen">
     <div class="adhd-gender-inner">
      <div class="adhd-gender-header">
        <a href="javascript:void(0)" aria-label="Back" class="adhd-gender-back" style="visibility:hidden;pointer-events:none;" tabindex="-1">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M18 11H4M4 11l6-6M4 11l6 6" stroke="#2A2A2A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <div style="width:40px;"></div>
      </div>

      <div class="adhd-gender-body">
        <div class="adhd-fade adhd-shimmer adhd-gender-eyebrow" style="animation-delay:.05s;">One quick thing</div>

        <div class="adhd-fade adhd-gender-heading" style="animation-delay:.1s;">
          <h1 class="adhd-gender-h1">What's your gender?</h1>
          <p class="adhd-gender-sub">Helps us tailor your results. Totally optional.</p>
        </div>

        <div class="adhd-gender-options">
          ${state.GENDER_OPTIONS.map((opt, i) => `
            <button type="button"
              class="adhd-fade adhd-opt adhd-gender-opt ${state.selectedGender === i ? 'adhd-opt-selected' : ''}"
              style="animation-delay:${(0.16 + i * 0.08).toFixed(2)}s;"
              onclick="selectGenderOption(${i})"
              aria-pressed="${state.selectedGender === i}">
              <span class="adhd-gender-opt-label">${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div style="flex:1; min-height:24px;"></div>

      <div class="adhd-fade adhd-gender-cta" style="animation-delay:.5s;">
        <button type="button" class="adhd-gender-continue" onclick="advanceFromGender()">Continue</button>
      </div>
      <div class="adhd-fade adhd-gender-skip" style="animation-delay:.58s;">
        <a href="javascript:void(0)" onclick="skipGender()">Skip this question</a>
      </div>
     </div>
    </div>
  `;
}
