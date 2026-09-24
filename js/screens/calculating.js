/* ============================================================
   Screen: calculating
   ============================================================ */

import { poseThinkingSvg } from '../components/companion.js';
import { prefersReducedMotion } from '../utils.js';

// T015: recolored per the quiz-funnel-adhd-ui skill's updated "Approved
// extension: a warm secondary palette for data/stat fills" section — this
// is a "progress-bar stat row" data-viz component (components.md section
// 9), so it now rotates through the skill's canonical 4-color warm
// palette (accent yellow, warm coral, warm teal, periwinkle blue) by
// index i % 4, rather than the marigold/teal pair T007-T013 settled on.
// With 6 rows, the 5th/6th reuse the 1st/2nd color, same as the skill's
// own "7 bars in a weekly chart" example describes. All 4 colors were
// chosen specifically because they're saturated enough to clear solid
// contrast against the `--ink-100` metric-track background — this
// intentionally avoids reopening the T007-flagged bug (a fill nearly
// indistinguishable from its own track once filled); the skill's warm
// trio is explicitly documented as "solid enough to read as a filled bar
// against the white/near-white background," and --accent/--dataviz-* are
// all comfortably darker/richer than --ink-100 (#F5F5F0).
const CALC_METRICS = [
  { label: "Anxiety", color: "var(--accent)" },
  { label: "Stress", color: "var(--dataviz-coral)" },
  { label: "Restlessness", color: "var(--dataviz-teal)" },
  { label: "Focus", color: "var(--dataviz-periwinkle)" },
  { label: "Impulse control", color: "var(--accent)" },
  { label: "Emotional regulation", color: "var(--dataviz-coral)" },
];
// Screen-owned local state — not part of the app state machine (js/state.js),
// since nothing outside this file's own render/animate pair ever needs it.
let calcMetricTargets = [];

export function renderCalculating() {
  // These bars are purely illustrative — not derived from the person's
  // actual answers. They exist to give a sense of active processing
  // before the reveal, nothing more. Randomized per visit so repeat
  // testing doesn't show identical numbers each time.
  calcMetricTargets = CALC_METRICS.map(() => 45 + Math.floor(Math.random() * 40));
  return `
    <div class="fade-in" style="text-align:center;">
      <div class="calc-companion-icon">${poseThinkingSvg(74)}</div>
      <h1 style="margin-bottom:7px;">Calculating your results</h1>
      <p class="lede centered small" id="calcCaption">Analyzing your answers…</p>
      <div style="text-align:left; margin-top:9px;">
        ${CALC_METRICS.map((m, i) => `
          <div class="metric-row">
            <div class="metric-label-row"><span>${m.label}</span><span id="metricPct${i}">0%</span></div>
            <div class="metric-track"><div class="metric-fill" id="metricFill${i}" style="background:${m.color};"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function animateCalculatingScreen(state) {
  const phrases = ["Analyzing your answers…", "Cross referencing patterns…", "Comparing to common traits…", "Finalizing your results…"];
  let phraseIdx = 0;
  const captionInterval = setInterval(() => {
    if (state.screen !== 'calculating') { clearInterval(captionInterval); return; }
    phraseIdx = (phraseIdx + 1) % phrases.length;
    const el = document.getElementById('calcCaption');
    if (el) el.textContent = phrases[phraseIdx];
  }, 2000);

  const stagger = 350;   // ms between each bar starting
  const duration = 5500; // ms each bar takes to fill, smoothly, via CSS

  if (prefersReducedMotion()) {
    CALC_METRICS.forEach((m, i) => {
      const fillEl = document.getElementById('metricFill' + i);
      const pctEl = document.getElementById('metricPct' + i);
      if (fillEl) fillEl.style.width = calcMetricTargets[i] + '%';
      if (pctEl) pctEl.textContent = calcMetricTargets[i] + '%';
    });
    return;
  }

  CALC_METRICS.forEach((m, i) => {
    const fillEl = document.getElementById('metricFill' + i);
    if (!fillEl) return;
    setTimeout(() => {
      if (state.screen !== 'calculating') return;
      // A gentle ease-in-out cubic-bezier, native CSS transition — smoother
      // and more reliably jank-free than setting width by hand every frame.
      fillEl.style.transition = `width ${duration}ms cubic-bezier(.45,0,.2,1)`;
      requestAnimationFrame(() => { fillEl.style.width = calcMetricTargets[i] + '%'; });
    }, i * stagger);
  });

  // The number count-up runs on its own rAF loop, timed to match each bar's
  // stagger/duration, independent of the CSS-driven width animation above.
  const start = performance.now();
  function tick(now) {
    if (state.screen !== 'calculating') return;
    let stillAnimating = false;
    CALC_METRICS.forEach((m, i) => {
      const barStart = start + i * stagger;
      const elapsed = now - barStart;
      if (elapsed < 0) { stillAnimating = true; return; }
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(eased * calcMetricTargets[i]);
      const pctEl = document.getElementById('metricPct' + i);
      if (pctEl) pctEl.textContent = val + '%';
      if (t < 1) stillAnimating = true;
    });
    if (stillAnimating) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
