/* ============================================================
   Results page — low-score state
   overall_pct < LOW_THRESHOLD (40): no type, no locked blocks, no
   offer — just the number, one plain sentence, and the disclaimer.
   ============================================================ */

import { DISCLAIMER } from './config.js';
import { injectResultsStyles } from './styles.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderLowScoreResults(overallPct) {
  injectResultsStyles();
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) robotsMeta.setAttribute('content', 'noindex,nofollow');
  return `
    <div class="rp-root">
      <div class="rp-low-score">
        <h1 class="rp-h1" style="text-align:center;">Overall pattern strength: ${overallPct}% · Low</h1>
        <p class="rp-hook">${escapeHtml("Your answers don't show strong signs of the patterns commonly associated with ADHD.")}</p>
        <p class="disclaimer" style="text-align:center;">${escapeHtml(DISCLAIMER)}</p>
      </div>
    </div>`;
}
