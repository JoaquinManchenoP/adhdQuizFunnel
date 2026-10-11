/* ============================================================
   Screen: sparkloop
   Sits between instantResult (results) and thankYou in the funnel.
   The loader script in index.html's <head> (pub_bbc2ad900d79) is the
   only confirmed SparkLoop integration so far — site-wide, styled via
   the dashboard's Look & Feel tab (already matches this project's
   colors/fonts/radius, which applies to whatever UI SparkLoop shows).

   NOT yet wired here: an actual trigger for SparkLoop's recommendations
   UI. Their "Hosted page" install mode was tried and reverted — tested
   live, it expects to own its own Subscribe step too (no config there,
   since we subscribe via our own Beehiiv function) and bounced visitors
   straight to an unrelated external site instead of showing
   recommendations. Their "Embedded widget" mode (current dashboard
   setting) is built for a native subscribe form it auto-detects; our
   form is a custom fetch() call, so there's no confirmed way yet to
   fire it after submit. Don't invent a window.SparkLoop.* call here —
   verified: no such global is exposed on this page. Ask SparkLoop
   support for the right hook for a custom/Beehiiv-based submit before
   wiring this further.
   ============================================================ */

export function renderSparkloop(state) {
  return `
    <div class="fade-in">
      <h1 style="text-align:center;">One more thing</h1>
      <p class="lede centered small">A few other free newsletters people check out alongside this one.</p>

      <button type="button" class="btn primary" onclick="continueFromSparkloop()" style="margin-top:16px;">Continue</button>
    </div>
  `;
}
