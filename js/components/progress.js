/* ============================================================
   Shared component: the top progress bar.
   Reused across the `question` and `breather` screens — rendered once
   centrally by js/main.js's render(), exactly matching the pre-T014
   single call site.
   ============================================================ */

export function progressBlockHtml(state) {
  if (!(state.screen === 'question' || state.screen === 'breather')) return '';
  const current = state.qIndex + 1;
  const pct = Math.round((current / state.QUESTIONS.length) * 100);
  return `
    <div class="progress-block">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
    </div>
  `;
}
