/* ============================================================
   Screen: breather
   ============================================================ */

import { prefersReducedMotion } from '../utils.js';

// Character art (T016): each breather now shows one illustrated scene in
// place of the flat companion-mascot SVG. `solid` is kept as a separate
// field (consumed only by the thin timer-fill bar below) and set to the
// single system accent color for all three, matching this app's other
// progress indicator (`.progress-fill`) regardless of which image sits
// above it. All three share one fixed-size slot (`.breather-icon` in
// index.html) — each source image has a different native aspect ratio,
// so `object-fit: contain` scales each one down to fit that identical
// slot rather than cropping it.
export const BREATHERS = [
  { message: "It's okay if some of these feel familiar. That's kind of the point.", solid: "var(--accent)", image: "assets/breathers/breather-1-overwhelm.png", alt: "A person overwhelmed at a desk, buried under stacks of paper with their head in their hands" },
  { message: "No right or wrong answers. Just be honest with yourself.", solid: "var(--accent)", image: "assets/breathers/breather-2-reflection.png", alt: "A girl sitting alone on a dock, looking out over a lake at sunset" },
  { message: "Noticing these patterns is already a step forward.", solid: "var(--accent)", image: "assets/breathers/breather-3-progress.png", alt: "Two children walking hand in hand up a sunlit path" },
];

export function renderBreather(state) {
  const b = BREATHERS[state.breatherIndex];
  return `
    <div class="fade-in breather">
      <div class="breather-icon">
        <img class="breather-img" src="${b.image}" alt="${b.alt}">
      </div>
      <p class="breather-text">${b.message}</p>
      <div class="breather-timer-track"><div class="breather-timer-fill" id="breatherTimerFill" style="background:${b.solid};"></div></div>
    </div>
  `;
}

export function animateBreatherTimer() {
  const fill = document.getElementById('breatherTimerFill');
  if (!fill) return;
  if (prefersReducedMotion()) { fill.style.width = '100%'; return; }
  requestAnimationFrame(() => { fill.style.transition = 'width 4s linear'; fill.style.width = '100%'; });
}
