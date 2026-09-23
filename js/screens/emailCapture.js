/* ============================================================
   Screen: emailCapture
   Doesn't read any app state, so its render function takes no
   parameter (unlike most other screens) — kept parameter-free rather
   than accepting an unused `state` argument for the sake of uniformity.
   ============================================================ */

export function renderEmailCapture() {
  return `
    <div class="fade-in">
      <h1 style="font-size:25px;">Almost there</h1>
      <p class="lede">Enter your email and we'll send your full ADHD self check breakdown, plus a free starter guide.</p>
      <form onsubmit="submitEmail(event)">
        <label class="field-label" for="emailInput">Email address</label>
        <input type="email" id="emailInput" placeholder="you@email.com" required>
        <div style="height:18px;"></div>
        <button type="submit" class="btn primary">Send my results</button>
      </form>
      <div class="trust-row">
        <i data-lucide="shield-check" width="17" height="17" color="var(--text-subtle)"></i>
        <span>We'll also send occasional tips from our ADHD newsletter. Unsubscribe anytime, no spam.</span>
      </div>
    </div>
  `;
}
