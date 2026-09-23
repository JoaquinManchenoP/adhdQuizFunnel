/* ============================================================
   Shared component: the top bar (back button + optional title).
   Reused across every screen except the ones that intentionally hide
   it (genderSelect, thankYou, breather, calculating) — rendered once
   centrally by js/main.js's render(), not duplicated inside each
   screen file, exactly matching the pre-T014 single call site.
   ============================================================ */

export function topbarHtml(state, showTitle) {
  const hidden = (state.screen === 'genderSelect' || state.screen === 'thankYou' || state.screen === 'breather' || state.screen === 'calculating');
  return `
    <div class="topbar">
      <button class="back" onclick="goBack()" aria-label="Back" style="visibility:${hidden ? 'hidden' : 'visible'};">
        <i data-lucide="chevron-left" width="25" height="25" color="var(--text-strong)"></i>
      </button>
      ${showTitle ? `<div class="label">ADHD self check</div><div class="spacer"></div>` : ''}
    </div>
  `;
}
