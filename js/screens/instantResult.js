/* ============================================================
   Screen: instantResult
   ============================================================ */

import { prefersReducedMotion } from '../utils.js';

export function renderInstantResult(state) {
  const score = state.partAScore();
  const percent = Math.round((score / 24) * 100);
  const band = state.partABand(percent);
  return `
    <div class="fade-in">
      <div class="gauge-wrap">
        <div class="gauge-outer" id="gaugeOuter">
          <div class="gauge-inner">
            <div class="gauge-percent" id="percentNum">0%</div>
            <div class="gauge-caption">of traits shown</div>
          </div>
        </div>
      </div>
      <div class="result-label">${band.label}</div>
      <p class="lede centered small">${band.copy} Your full breakdown shows which ADHD pattern your answers point to most.</p>
      <div class="locked-teaser">
        <div class="locked-teaser-header"><i data-lucide="lock" width="18" height="18"></i>Locked in your full breakdown</div>
        <div class="skeleton-bars">
          <div class="skeleton-bar" style="width:90%; background:var(--accent);"></div>
          <div class="skeleton-bar" style="width:75%; background:var(--dataviz-coral);"></div>
          <div class="skeleton-bar" style="width:82%; background:var(--dataviz-teal);"></div>
        </div>
      </div>
      <button class="btn primary" onclick="goEmailCapture()">Get my free full results</button>
      <div class="microcopy">Takes 10 seconds. No spam, ever.</div>
      <div class="disclaimer">This self assessment is based on the structure of a validated adult ADHD screening tool but is not a diagnostic instrument and cannot diagnose ADHD or any other condition. It's intended to help you reflect on patterns worth discussing with a licensed healthcare provider. Only a qualified professional can provide an actual diagnosis.</div>
    </div>
  `;
}

export function animateResultGauge(percent) {
  const gauge = document.getElementById('gaugeOuter');
  const numEl = document.getElementById('percentNum');
  if (!gauge || !numEl) return;
  if (prefersReducedMotion()) {
    gauge.style.setProperty('--gauge-pct', percent + '%');
    numEl.textContent = percent + '%';
    return;
  }
  gauge.classList.add('animating');
  requestAnimationFrame(() => { gauge.style.setProperty('--gauge-pct', percent + '%'); });
  const duration = 1100;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    numEl.textContent = Math.round(eased * percent) + '%';
    if (t < 1) requestAnimationFrame(tick);
    else numEl.textContent = percent + '%';
  }
  requestAnimationFrame(tick);
}
