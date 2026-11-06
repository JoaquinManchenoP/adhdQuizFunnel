/* ============================================================
   Screen: results — ROUTER
   Shown after a successful email submit (post-SparkLoop). This file
   decides, from the stored per-user values the quiz already computes
   (js/state.js's buildResultsReport()/buildPatternReport() — read
   only, never modified here), which of 3 things to render:

     overall_pct < 40        -> the low-score state (results/lowScore.js)
     type = inattentive      -> the new in-depth, type-agnostic template
                                 (results/template.js) fed inattentive's
                                 data file (results/data/inattentive.js)
     type = hyperactive-     -> the ORIGINAL, unchanged results screen
     impulsive / combined       (results/legacy.js) until their own
                                 data files exist — adding each later is
                                 a new data file only, per the build spec.

   Also handles the `?r=<id>` saved/shared-link entry point: a fresh
   tab with that param in the URL renders from the localStorage
   snapshot results/storage.js saved, instead of live quiz state —
   `&shared=1` additionally switches to the public read-only variant
   (sections 1+3 free parts only, no locks, no offer, no name/email).
   See the results-page build report for what each would need to
   become a real backend-backed feature (see js/screens/results/
   storage.js's own notes).
   ============================================================ */

import * as State from '../state.js';
import { renderLegacyResults } from './results/legacy.js';
import { renderTypeResultsPage, logResultEvent, buildResultUrl, isSharedModeUrl } from './results/template.js';
import { renderLowScoreResults } from './results/lowScore.js';
import { injectResultsStyles } from './results/styles.js';
import {
  computeInattentiveScore, computeHyperactiveScore, computeResultType, levelFor, TYPE_LABELS,
} from './results/config.js';
import {
  currentUrlResultId, loadResultSnapshot, installSharedModeRouting,
} from './results/storage.js';
import { inattentiveData } from './results/data/inattentive.js';

const TYPE_DATA_FILES = { inattentive: inattentiveData };

function unavailableLinkHtml() {
  injectResultsStyles();
  return `
    <div class="rp-root">
      <div class="rp-low-score">
        <p class="rp-hook">This saved link isn't available in this browser.</p>
        <p style="font-weight:600;font-size:13px;color:var(--ink-faint);">Results saved on this page are stored on the device that took the quiz — opening the link on a different browser or device can't load them yet.</p>
      </div>
    </div>`;
}

// Generic over TYPE_DATA_FILES — adding hyperactive-impulsive or combined
// later means adding a data file + one entry in that map above (an
// unavoidable minimum in a plain ES-module app with no bundler/dynamic
// file discovery); nothing in this routing logic changes.
function renderFromValues({ overallPct, pcts, shared }) {
  const level = levelFor(overallPct);
  const inattentiveScore = computeInattentiveScore(pcts);
  const hyperactiveScore = computeHyperactiveScore(pcts);
  const type = computeResultType(overallPct, inattentiveScore, hyperactiveScore);

  if (type === 'low') return renderLowScoreResults(overallPct);

  const data = TYPE_DATA_FILES[type];
  if (data) {
    return renderTypeResultsPage({
      typeKey: type, typeLabel: TYPE_LABELS[type], data,
      overallPct, level, inattentiveScore, hyperactiveScore, pcts,
    }, { shared: !!shared });
  }

  // No in-depth data file for this type yet (hyperactive-impulsive /
  // combined, for now) — fall back to the original, unchanged screen.
  return null; // signals "render legacy" to the caller
}

export function renderResults(state) {
  const linkedId = currentUrlResultId();

  if (linkedId) {
    const snapshot = loadResultSnapshot(linkedId);
    if (!snapshot) return unavailableLinkHtml();
    const html = renderFromValues({ overallPct: snapshot.overallPct, pcts: snapshot.pcts, shared: isSharedModeUrl() });
    // Snapshot was for a type without an in-depth template yet (legacy
    // path) — a saved/shared link for those isn't reachable from a
    // snapshot alone (legacy render needs live quiz `state`, which a
    // fresh tab doesn't have), so this is the one gap called out in
    // the build report rather than silently mis-rendering.
    return html || unavailableLinkHtml();
  }

  // Normal flow: compute live, from the current session's report.
  const report = state.buildResultsReport();
  const html = renderFromValues({ overallPct: report.totalPct, pcts: report.pattern.pcts, shared: false });
  return html || renderLegacyResults(state);
}

/* ---------------- Save / share / unlock stubs ----------------
   Results-page-scoped globals, same pattern js/main.js already uses
   for its own inline onclick="" handlers — kept here instead of there
   so main.js (shared/global) never needs to know this page's buttons
   exist. No payment or email-platform integration — see the report. */
window.rpUnlock = function rpUnlock(product, resultId) {
  logResultEvent('result_unlock_clicked', { product, result_id: resultId });
  console.info(`[results] "${product}" unlock tapped — payment integration not built yet (see report).`);
};
window.rpEmailResults = function rpEmailResults(resultId) {
  logResultEvent('result_email_requested', { result_id: resultId });
  console.info('[results] "Email me my results" tapped — email-platform integration not built yet (see report).');
};
window.rpShareResults = async function rpShareResults(resultId) {
  const url = buildResultUrl(resultId, { shared: true });
  logResultEvent('result_share_clicked', { result_id: resultId });
  try {
    if (navigator.share) {
      await navigator.share({ title: 'My ADHD quiz results', url });
      return;
    }
  } catch (e) { /* user cancelled share sheet — fall through to clipboard */ }
  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied — paste it anywhere to share your results.');
  } catch (e) {
    console.info('[results] share link:', url);
  }
};

// Side effect, at import time (before js/main.js's own State.restore()/
// render() run): see results/storage.js's note on why this is the one
// way shared/saved-link routing can work without editing main.js.
installSharedModeRouting(State);
