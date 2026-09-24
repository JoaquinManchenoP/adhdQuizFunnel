/* ============================================================
   Small cross-screen helpers with no markup of their own — not UI
   fragments (so they don't belong in js/components/), just shared
   logic used by js/main.js and multiple js/screens/*.js animation
   functions. This file wasn't named in T014's structure requirements
   but isn't excluded either; splitting these two one-liners out of
   main.js keeps the animation code in screens/instantResult.js,
   screens/calculating.js, and screens/breather.js free of duplicating
   them. Flagged here for visibility.
   ============================================================ */

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hydrateIcons() {
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}
