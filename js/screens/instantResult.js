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
      <p class="lede centered small">${band.copy}</p>
      <div class="locked-teaser">
        <div class="locked-teaser-header"><i data-lucide="lock" width="18" height="18"></i>Locked in your full breakdown</div>
        <div class="skeleton-bars">
          <div class="skeleton-bar" style="width:90%; background:var(--accent);"></div>
          <div class="skeleton-bar" style="width:75%; background:var(--dataviz-coral);"></div>
          <div class="skeleton-bar" style="width:82%; background:var(--dataviz-teal);"></div>
        </div>
        <div class="locked-teaser-divider"></div>
        <p class="lede small centered" style="margin-bottom:12px;">Enter your email and we'll send it over now.</p>
        <form onsubmit="submitEmail(event)">
          <label class="field-label" for="emailInput">Email address</label>
          <input type="email" id="emailInput" placeholder="you@email.com" required>
          <div style="height:14px;"></div>
          <button type="submit" class="btn primary">Send my results</button>
        </form>
        <div class="trust-row">
          <i data-lucide="shield-check" width="17" height="17" color="var(--text-subtle)"></i>
          <span>Occasional tips too. Unsubscribe anytime, no spam.</span>
        </div>
      </div>
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
    else {
      numEl.textContent = percent + '%';
      // T018: celebratory flourish fired only once the count-up above has
      // fully finished — the count-up's own duration/easing are untouched.
      gauge.classList.add('gauge-pulse');
    }
  }
  requestAnimationFrame(tick);
}
