/* ============================================================
   Results page — scoped styles, injected at runtime
   index.html's global <style> block is a shared file this task must
   not edit, so every new rule the results template needs lives here
   instead, under `.rp-*` class names that don't exist anywhere else in
   the app. Injected once into <head> the first time the results
   screen renders; every value below is either an existing adhd-ui/
   quiz-funnel-adhd-ui token (var(--accent), var(--card), the warm bar
   palette, Fredoka/Nunito, the 10px/8px bar-track shape, etc. — all
   already defined in index.html's shared :root, just referenced, never
   redefined) or, where noted, a documented deviation.

   T-next (round 2): tightened against a full walkthrough of the
   reference the user supplied — outline-style numbered badges (not
   solid-filled), real bold sub-headings for Strengths/Weaknesses,
   checkmark/warning icons on strengths vs. challenges, locked content
   shown as its real (required) heading + first line followed by a
   blurred feature-grid with a small chip icon, ONE centered floating
   "Unlock now" card over it (not a fade), a diagonal band-transition
   edge, a redesigned sidebar (gold top accent, small avatar badge, an
   "ON THIS PAGE" label, secondary-style Share/Email/Compare buttons),
   and a decorated closing banner. See the report for what changed.
   ============================================================ */

const STYLE_ID = 'rp-results-styles';

const CSS = `
.rp-root {
  position: fixed; inset: 0;
  background: var(--white);
  z-index: 20;
  overflow-y: auto;
  font-family: 'Nunito', sans-serif;
  color: var(--ink);
}
/* 20px side padding here is exactly what each .rp-band's -20px margin
   cancels, so a band's background bleeds flush to the real viewport
   edge on mobile while its content stays inset — see .rp-band below.
   max-width was a flat 640px, which is ~100% on phones (640 never
   binds below that width) but left large dead margins on tablet-ish
   widths up to the 1024px desktop breakpoint below, where the fixed
   640px cap started binding well before the viewport did — down to
   ~62% of the page at 1023px. max(640px, 95vw) keeps phones exactly as
   they were (640px still wins under ~674px wide) while guaranteeing
   the shell never drops under 95% of the viewport from there up to
   the desktop breakpoint, where the 1024px media query below takes
   over with its own fixed 1260px value regardless. */
.rp-shell { width: 100%; max-width: max(640px, 95vw); margin: 0 auto; padding: 0 20px 48px; box-sizing: border-box; }
.rp-h1 {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 38px; line-height: 1.12;
  color: var(--ink); margin: 6px 0 10px;
}
/* Plain text label, not a chip — "Your personality type is" style lead-in
   directly above the big type name, per the reference. */
.rp-eyebrow {
  font-weight: 700; font-size: 15px; color: var(--ink-soft); margin: 0;
}
.rp-hook { font-weight: 700; font-size: 17px; line-height: 1.55; color: var(--ink); margin: 0 0 10px; }
.rp-body p { font-weight: 500; font-size: 16px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 12px; }
.rp-ul { margin: 6px 0 10px; padding-left: 20px; }
.rp-ul li { font-weight: 500; font-size: 16px; line-height: 1.6; color: var(--ink-soft); margin-bottom: 8px; }
.rp-ul li::marker { color: var(--accent-alt-deep); }
/* Real sub-heading weight (Strengths/Weaknesses etc.) — not a muted
   uppercase micro-label, per the reference's own plain bold h3s. */
.rp-sub-h3 { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 20px; color: var(--ink); margin: 24px 0 14px; }

/* Illustration slot — large, central, borderless (a soft panel rather
   than a dashed "debug" box) so the page still reads as production
   layout. Still just a labeled empty box — no images created/sourced,
   per the original build spec. */
.rp-illustration {
  height: 260px; display: flex; align-items: center; justify-content: center;
  border-radius: 20px; background: var(--card);
  color: var(--ink-faint); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .03em;
  margin: 18px 0 20px;
}
.rp-illustration.rp-illustration-sm { height: 120px; width: 150px; margin: 0; flex-shrink: 0; border-radius: 16px; }
.rp-illustration.rp-illustration-circle { height: 40px; width: 40px; border-radius: 50%; margin: 0; flex-shrink: 0; font-size: 7px; }
/* Sized for the hero's own type-badge slot — bigger than the circle
   avatar, smaller than the full-width illustration below the hero. */
.rp-illustration.rp-illustration-md { height: 92px; width: 92px; margin: 0; flex-shrink: 0; border-radius: 20px; font-size: 9px; background: var(--white); }

/* ---- Hero image + body copy, 2-column (image 1/3, text 2/3) ----
   Was stacked (full-width image on top, body text below) — reorganized
   per request into a row. Scoped override on .rp-illustration's height
   below (not a change to the shared class, which other illustration
   slots on this page still use at their own default 260px) since a
   260px-tall box in a now much narrower 1/3 column reads as an odd
   tall sliver rather than a photo-shaped panel. */
/* Equal 36px gap above and below this row (this specific band's own
   padding-top is bumped to match, just below — scoped to .rp-hero-
   body-band, not the shared .rp-band default, since other 'a'-colored
   bands on the page must keep their own padding) and the same 36px
   again before .rp-bars-card right after it — three evenly-spaced
   components in this band instead of mismatched ad-hoc margins. (This
   doesn't fold in the hero band's own padding-bottom above — that's
   reserved specifically for the wave divider shape, a different kind
   of space, not a plain inter-component gap.) */
.rp-band.rp-hero-body-band { padding-top: 36px; }
/* Image column retired from this row — the hero illustration now lives
   up in the header band itself (.rp-hero-float, below) — so the text
   simply takes the full width it used to share with that column. */
.rp-hero-text-col { margin: 0 0 36px; }
.rp-hero-text-col .rp-body { margin: 0; }

/* Hero illustration, floating in the header's own lower-right corner.
   Sibling of .rp-band-inner (not nested inside it) so it's positioned
   against the header band's actual edge, not the centered/max-width
   content column — and placed after .rp-hero-wave in source order so
   it naturally paints above the wave without needing z-index. Reuses
   .rp-locked-overlay's existing "floating card" shadow
   (0 10px 30px rgba(0,0,0,.08)) for the same elevated feel already
   established elsewhere on this page, rather than inventing a new one.
   pointer-events:none since it's decorative (aria-hidden in the slot
   itself) and must never block taps on anything beneath it. */
.rp-hero-float { position: absolute; right: 20px; bottom: 16px; width: 120px; pointer-events: none; }
.rp-illustration.rp-illustration-float {
  height: 120px; width: 100%; margin: 0; font-size: 8px;
  border-radius: 20px; background: var(--white); box-shadow: 0 10px 30px rgba(0,0,0,.08);
}

/* ---- Bands: each major section is a full-bleed (mobile) / rounded
   panel (desktop) alternating-background block, echoing the reference
   layout's gray/white rhythm — built from existing tokens only
   (--white / --card / --chip-yellow), never a new color. The diagonal
   clip on each band's bottom edge tracks the reference's own slanted
   band transitions. */
.rp-band {
  padding: 34px 20px 50px;
  margin: 0 -20px;
  position: relative;
}
.rp-band.rp-band-cut { clip-path: polygon(0 0, 100% 0, 100% calc(100% - 18px), 0 100%); }
/* --rp-band-bg tracks each band's own background so content that needs
   to match the band it's sitting in (the locked-grid overlay card's
   edge) never assumes white. */
.rp-band.rp-band-a { background: var(--white); --rp-band-bg: var(--white); }
.rp-band.rp-band-b { background: var(--card); --rp-band-bg: var(--card); }
/* T023: round-1's diagonal gradient band was itself rejected along with
   everything inside it — back to a flat fill, but a soft warm tint
   (--chip-yellow) rather than plain white/card, so the hero band still
   visually announces itself as "the one that matters" without a bold
   color block. Deliberately the SAME tint .rp-band-offer already uses
   below, pairing this page's two most important moments (the reveal,
   the purchase) with one consistent treatment instead of inventing a
   second special color. */
/* Taller than the base .rp-band padding (34px/50px) — the hero is the
   one section meant to feel like a deliberate, roomy moment rather
   than a content band like the rest of the page. */
/* Follow-up (round 15): lighter than the flat --chip-yellow — marigold-50
   is the palest yellow token available, meant to make the darker text
   sitting on top of it easier to read. */
/* Follow-up (round 17): padding-top matched to padding-bottom (both
   92px/112px) so the text block sits centered between the top edge
   and the wave, instead of sitting high with a lot of reserved-for-
   the-wave space below it. */
/* z-index:0 pins this band's own stacking context explicitly below the
   floating sidebar's z-index:6 (.rp-toc-desktop) — the two visually
   overlap near the top of the page once the sidebar floats free of
   the row, so this band's cream background needs to stay under it,
   not relying on implicit z-index:auto ordering for that. */
.rp-band.rp-band-hero { background: var(--marigold-50); --rp-band-bg: var(--marigold-50); padding-top: 92px; padding-bottom: 92px; overflow: hidden; position: relative; z-index: 0; }
/* Unique shape for this band only (not the shared diagonal .rp-band-cut
   every other band uses) — a smooth wave bottom edge instead of a
   straight cut, filled in the next band's own background color
   (var(--white), matching .rp-band-a right after it) so the curve
   itself reads as the transition, not an extra stripe. overflow:hidden
   above keeps it (and the desktop rounded corners) clipped cleanly. */
.rp-hero-wave { position: absolute; left: 0; right: 0; bottom: -1px; width: 100%; height: 68px; display: block; }
.rp-band.rp-band-offer { background: var(--chip-yellow); --rp-band-bg: var(--chip-yellow); }
.rp-band-inner { max-width: 600px; margin: 0 auto; position: relative; }
.rp-band:first-of-type { padding-top: 26px; }
/* Same specificity as the rule above (two selectors each), and the
   hero band IS the first .rp-band in the DOM — without this, the rule
   above would silently win by source order and undo the hero's own
   padding-top override just set above. */
.rp-band.rp-band-hero:first-of-type { padding-top: 92px; }

.rp-section-head { display: flex; align-items: center; gap: 12px; margin: 0 0 12px; scroll-margin-top: 90px; }
/* Outline badge — white fill, accent-deep ring, ink number — not a
   solid accent-filled dot, per the reference's own numbered circles. */
/* display:flex made this a block-level box sitting inside the heading's
   own inline text flow (num + title are both inline content of one
   <h2>, not flex siblings) — its vertical position relative to the
   title text was then whatever the browser's inline-level blockifying
   fallback happened to produce, not a real alignment. inline-flex +
   vertical-align:middle makes it a proper inline-level box centered on
   the title's own middle, same pairing used for inline icon+text
   combos elsewhere on this page (e.g. .rp-tooltip). */
.rp-section-num {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  vertical-align: middle; margin-right: 10px;
  width: 30px; height: 30px; border-radius: 50%; background: var(--white);
  border: 2px solid var(--accent-alt-deep);
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 14px; color: var(--ink);
}
h2.rp-h2 {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 26px; line-height: 1.25;
  color: var(--ink); margin: 0;
}

/* ---- T023 hero rebuild ----
   Structurally different mechanic from the rejected round-1 design:
   no kicker pill, no gradient, no decorative circles, no "small lead-
   in line then giant standalone type-name line." Order is: a plain-
   text (no background/pill) eyebrow -> the type name rendered as one
   solid-filled tag/chip (the actual reveal/payoff, sized readably, not
   blown up to a standalone giant headline) -> the hook as normal body
   copy (reusing the page's existing .rp-hook class) -> one inline stat
   row pairing a circular conic-gradient meter with its level label.
   .rp-hero-head just stacks these vertically; sizes scale up at the
   1024px band below. */
.rp-hero-head { position: relative; }
/* Follow-up (round 16): the "Your personalized result" eyebrow label
   above the headline was removed outright — rule removed too. */
/* Follow-up (round 3): the type name chip was the <h1>/primary element;
   now the LEVEL claim ("You show {level} levels of ADHD-related
   traits") is the primary headline and the type name is demoted to a
   small secondary chip underneath it — same reasoning as the straight-
   text option below: this band's background is never white
   (--chip-yellow), so --on-accent-label (not --ink/black) is used for
   any text sitting directly on it. */
/* Follow-up (round 8): sized with clamp()/vw instead of a fixed px, so
   it scales to fill the available width and stays as large as
   possible without wrapping, on anything from a 320px phone up. Fixed
   px alone can't do that — a value safe at 320px wastes space at
   390px+, and a value sized for 390px overflows at 320px. The 1024px
   override below switches to a fixed value since that layout's column
   width is capped, not viewport-relative, so vw stops being the right
   unit there. */
/* Follow-up (round 9): hierarchy pass across the whole hero — weight
   wasn't actually tracking importance (the lead-in span was bolder
   than this headline, and the ring's caption was the single boldest
   text on the page despite being the least important). Headline was
   made the clear anchor via weight; everything else below sits under
   it — see each rule's own note.
   Follow-up (round 12): sized up significantly further — dropped the
   weight back down from 700 at the same time, on purpose: a much
   bigger headline at full boldness reads as shouting. Size alone
   (still the largest, most dominant element by far) carries the
   "most important" signal now; the lighter weight keeps it readable
   instead of overwhelming. */
.rp-hero-headline {
  font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: clamp(32px, 9.8vw, 50px); line-height: 1.1;
  color: var(--on-accent-label); margin: 0 0 18px; white-space: nowrap;
}
/* Follow-up (round 14): the "not a formal diagnosis" disclaimer line
   (.rp-hero-screener-note) was removed from the hero outright — gone
   from the markup, rule removed here too since nothing uses it. */
/* Follow-up (round 6): was a solid pill/chip — now plain title text
   (no box, no fill), sized clearly below the main headline so it
   reads as a secondary title, not a tag.
   Follow-up (round 7): split into two spans so the actual claim
   ("signs of {type} ADHD") visually contrasts with its own lead-in
   ("Your answers show").
   Follow-up (round 8): each span gets its own white-space:nowrap
   (not the shared parent) — so wrapping, if the viewport is too
   narrow for both phrases together, happens BETWEEN them rather than
   mid-phrase, while each one is still sized as large as it can be
   without breaking apart on its own. Color is the same
   --on-accent-label the headline uses, just lighter via opacity
   (not a second invented color) — same hue, clearly secondary. */
.rp-hero-type-title { margin: 0; line-height: 1.35; }
/* Follow-up (round 14): forced onto its own line ABOVE the type name
   always (display:block), rather than wrapping there only when the
   viewport happened to be too narrow for both on one line — and
   recolored to an actual yellow (marigold-700, a strong amber-gold)
   instead of the same brown the headline uses, so it reads as its own
   distinct, lighter-toned line. Still dark enough against this band's
   pale --chip-yellow fill. Slightly smaller, full opacity (the color
   itself now carries the "lighter than the title" distinction, not a
   dimmed opacity). */
.rp-hero-type-lead {
  font-family: 'Nunito', sans-serif; font-weight: 500; font-size: 16px;
  color: var(--marigold-700); display: block; margin: 0 0 2px;
}
/* Promoted to a genuine secondary title — as bold as the headline and
   sized close behind it.
   Follow-up (round 15): sized down slightly, and recolored to an
   actual bright gold (marigold-500) instead of the headline's brown —
   a real "shade of yellow," clearly brighter than the lead line above
   it (marigold-700), still dark enough to hold up against the band's
   own brighter background. */
.rp-hero-type-emphasis {
  font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: clamp(18px, 6.5vw, 29px);
  color: var(--marigold-500); opacity: 1;
  text-transform: uppercase; letter-spacing: .02em; white-space: nowrap;
}
/* Disclaimer, living in the header itself per explicit user request.
   Positioned absolute (sibling of .rp-band-inner, same technique as
   .rp-hero-float just above) rather than pushed down with margin —
   margin would grow .rp-band-hero's own height since the band isn't a
   fixed size, it just wraps its content plus fixed padding; this way
   it sits low in the band's own reserved bottom padding without
   changing the band's size at all. bottom value clears .rp-hero-wave's
   own height (68px here, 86px at the 1024px override below) with a
   small buffer so the curve never runs through the text. Same
   --on-accent-label hue the rest of this band's text uses, at reduced
   opacity (the same "lighter than the line above it" technique
   .rp-hero-type-lead's own color already establishes) to keep it
   legible without pulling focus. right is inset past .rp-hero-float's
   own right:20px + width:120px (plus a buffer) so the two never
   overlap — recalculated for the floating illustration's desktop
   right:44px + width:170px at the 1024px override below. */
.rp-hero-disclaimer {
  position: absolute; left: 20px; right: 160px; bottom: 80px;
  margin: 0; font-weight: 600; font-size: 11px; line-height: 1.45; color: var(--on-accent-label); opacity: .55;
}
/* Follow-up (round 4): the stat badge used to sit inline after the hook
   paragraph, in a left-aligned row — read as disconnected, bolted on
   below a block of text. Moved it up to sit right next to the title
   block instead.
   Follow-up (round 18): the stat badge (ring + "Based on your quiz
   answers") was removed from the hero entirely — rule removed. The
   row wrapper is kept (now wrapping a single child) in case another
   element joins it later; harmless either way with just one child. */
.rp-hero-top-row { display: flex; flex-direction: column; gap: 32px; }
.rp-hero-top-block { flex: 1; min-width: 0; }

/* ---- Spectrum bars (area bars + the inattentive/hyperactive-impulsive
   split bar): a dual-anchored "Low ↔ High" track with the value as a
   floating label pinned to a marker, tracking the reference's own trait-
   bar mechanic — adapted since this app's 5 areas are each a single 0–
   100% strength, not a named bipolar pair like the reference's own
   dimensions. Sits in a plain card shell (--card bg, 2px --border, 22px
   radius — the quiz-funnel-adhd-ui data-viz container shape). */
/* margin-top gives the heading+hook text above it (e.g. section 1's
   "Your results across 5 areas" + its hook line) real breathing room
   from the card, instead of the 10px .rp-hook already has on its own
   (too tight, reading as if the text sat on/inside the card's edge).
   The hero's own .rp-bars-card usage overrides this via the more
   specific .rp-hero-body-band .rp-bars-card rule below, so this only
   actually affects the areas section's card. */
.rp-bars-card { background: var(--card); border: 2px solid var(--border); border-radius: 22px; padding: 24px; margin-top: 20px; box-sizing: border-box; }
/* Scoped to this band only — the "areas" section reuses .rp-bars-card
   too, with its own unrelated spacing right after its hook paragraph,
   which must stay untouched.
   margin-bottom added to match margin-top: paragraphs 3-4 now sit
   right after this card (see renderHero's second .rp-hero-text-col),
   and that element's own margin-top is 0, so without this the card
   had a 36px gap above but none below. */
.rp-hero-body-band .rp-bars-card { margin-top: 36px; margin-bottom: 36px; }
.rp-spec-row { margin-bottom: 30px; }
.rp-spec-row:last-child { margin-bottom: 0; }
.rp-spec-name { display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 15px; color: var(--ink); margin-bottom: 18px; }
.rp-spec-track { position: relative; height: 8px; background: var(--track); border-radius: 8px; margin: 0 8px; }
.rp-spec-fill { position: absolute; top: 0; left: 0; bottom: 0; border-radius: 8px; }
.rp-spec-marker {
  position: absolute; top: 50%; width: 18px; height: 18px; border-radius: 50%;
  background: var(--white); box-sizing: border-box; transform: translate(-50%, -50%);
}
.rp-spec-value {
  position: absolute; bottom: 100%; margin-bottom: 8px; transform: translateX(-50%);
  white-space: nowrap; background: var(--ink); color: var(--white);
  font-weight: 800; font-size: 12.5px; padding: 5px 10px; border-radius: 100px;
}
.rp-spec-value::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 4px solid transparent; border-top-color: var(--ink);
}
.rp-spec-ends { display: flex; justify-content: space-between; margin-top: 9px; font-weight: 700; font-size: 12.5px; color: var(--ink-faint); }
.rp-tooltip {
  all: unset; cursor: help; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%; background: var(--chip-yellow);
  color: var(--on-accent-label); font-weight: 800; font-size: 11px; flex-shrink: 0;
}

/* ---- Strengths/weaknesses + signs: a plain 2-column text list (no
   card boxes) with a leading icon — tracking the reference's own
   checkmark/warning-marked dual-column trait lists. .ok (strengths):
   a green check. .warn (challenges): an amber "!". .chip (plain
   signs/locked items): a small accent-chip square, adhd-ui's own
   icon-chip pattern, reused here rather than a third icon style. */
.rp-feature-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin: 0 0 6px; }
.rp-feature-item { display: flex; gap: 10px; align-items: flex-start; }
.rp-feature-icon {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
  display: flex; align-items: center; justify-content: center;
}
.rp-feature-icon.ok { background: #eaf6ef; }
.rp-feature-icon.warn { background: var(--chip-yellow); }
.rp-feature-icon.chip { width: 20px; height: 20px; border-radius: 6px; background: var(--chip-yellow); margin-top: 2px; }
.rp-feature-item span { display: block; font-weight: 700; font-size: 15.5px; line-height: 1.55; color: var(--ink); }

/* Plain neutral 2-column card grid — the type section's list_items
   only (see template.js's plainCardGrid), matching a reference layout
   the user supplied: no icon, just a thin top-border divider ahead of
   the bold text, same text style .rp-feature-item span already uses
   for visual consistency with the rest of the page. Column
   breakpoints mirror .rp-feature-grid's own (480px/1024px) above. */
.rp-plain-grid { display: grid; grid-template-columns: 1fr; gap: 14px 24px; margin: 0 0 6px; }
.rp-plain-card { border-top: 1.5px solid var(--border); padding-top: 14px; }
.rp-plain-card span { display: block; font-weight: 700; font-size: 15.5px; line-height: 1.55; color: var(--ink); }

/* ---- Locked blocks: the real heading + first line (required, always
   shown, never blurred), then the SAME feature-grid shape as above
   reused for blurred placeholder items (a small chip icon + blurred
   decorative text, never the real locked body), with ONE centered
   floating "Unlock now" card over the grid — a solid card, not a
   gradient fade, tracking the reference's own floating unlock card. */
.rp-locked { margin-top: 20px; }
.rp-locked-heading { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 20px; color: var(--ink); margin: 0 0 6px; }
.rp-locked-first-line { font-weight: 600; font-size: 16px; color: var(--ink-soft); margin: 0 0 14px; }
.rp-locked-grid { position: relative; }
.rp-locked-grid .rp-feature-grid { filter: blur(3px); user-select: none; pointer-events: none; }
.rp-locked-overlay {
  position: absolute; left: 50%; bottom: 6%; transform: translateX(-50%);
  width: calc(100% - 20px); max-width: 320px; box-sizing: border-box;
  background: var(--white); border: 2px solid var(--border); border-top: 4px solid var(--accent-alt-deep);
  border-radius: 18px; padding: 20px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
}
.rp-locked-lock-badge {
  width: 36px; height: 36px; border-radius: 50%; background: var(--accent);
  display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
}
.rp-locked-overlay-title { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 18px; color: var(--ink); margin: 0; }
.rp-locked-overlay-copy { font-weight: 500; font-size: 14px; color: var(--ink-soft); line-height: 1.5; margin: 0 0 6px; }
.rp-unlock-btn { width: auto !important; padding: 14px 24px !important; font-size: 15px !important; display: inline-flex !important; }

/* Save / Share */
.rp-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.rp-btn-row .btn { width: auto; flex: 1; min-width: 140px; }

/* Offer block — decorated banner: gold top border + small corner
   accents, tracking the reference's closing "unlocked" card. */
.rp-offer-banner { position: relative; overflow: hidden; }
.rp-offer-banner::before {
  content: ''; position: absolute; top: -30px; right: -30px; width: 90px; height: 90px;
  background: var(--accent-alt-deep); opacity: .18; border-radius: 28px; transform: rotate(18deg);
}
.rp-offer-banner::after {
  content: ''; position: absolute; bottom: -34px; left: -20px; width: 70px; height: 70px;
  background: var(--accent-alt-deep); opacity: .14; border-radius: 24px; transform: rotate(-12deg);
}
.rp-offer-grid { display: flex; flex-direction: column; gap: 14px; position: relative; }
.rp-offer-card {
  background: var(--white); border: 2px solid var(--border); border-radius: 22px; padding: 22px; box-sizing: border-box;
  display: flex; flex-direction: column; gap: 8px;
}
.rp-offer-card.rp-offer-emphasis { background: var(--ink); border-color: var(--ink); }
.rp-offer-card.rp-offer-emphasis .rp-offer-name,
.rp-offer-card.rp-offer-emphasis .rp-offer-price { color: var(--accent); }
.rp-offer-card.rp-offer-emphasis .rp-offer-includes li { color: var(--white); }
.rp-offer-name { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 19px; color: var(--ink); }
.rp-offer-price { font-family: 'Fredoka', sans-serif; font-weight: 700; font-size: 29px; color: var(--ink); }
.rp-offer-separately { font-weight: 700; font-size: 13px; color: var(--ink-faint); text-decoration: line-through; }
.rp-offer-card.rp-offer-emphasis .rp-offer-separately { color: var(--accent-alt-light); opacity: .8; }
.rp-offer-includes { margin: 4px 0 10px; padding-left: 18px; }
.rp-offer-includes li { font-weight: 600; font-size: 14.5px; color: var(--ink); margin-bottom: 6px; display: flex; justify-content: space-between; gap: 8px; }
.rp-offer-fineprint { font-weight: 600; font-size: 13px; color: var(--ink-faint); margin-top: 14px; position: relative; }

/* ---- Sidebar: a compact "type card" — gold top accent bar, a small
   avatar badge, an "ON THIS PAGE" label over the numbered link list, a
   distinct "Unlock full results" row, then secondary (outlined, not
   solid) Share/Email/Compare buttons — tracking the reference's own
   floating sidebar shape instead of a plain link list. */
.rp-toc-mobile { position: sticky; top: 0; z-index: 5; background: var(--white); border-bottom: 1.5px solid var(--border); padding: 10px 20px; margin: 0 -20px 8px; }
.rp-toc-mobile summary { list-style: none; cursor: pointer; font-weight: 800; font-size: 15px; color: var(--ink); display: flex; align-items: center; gap: 6px; }
.rp-toc-mobile ul { margin: 10px 0 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 10px; }
.rp-toc-mobile a { font-weight: 700; font-size: 15px; color: var(--ink-soft); text-decoration: none; }
.rp-toc-desktop { display: none; }

.rp-low-score { padding: 60px 24px; max-width: 480px; margin: 0 auto; text-align: center; }

/* Reuses the app's shared .disclaimer class (never edited) but bumps
   its size for this page only, via a more specific results-page
   selector — same technique used throughout this file to avoid
   touching index.html's global stylesheet. */
.rp-root .disclaimer { font-size: 15px; line-height: 1.6; }

.rp-share-cta { text-align: center; margin-top: 20px; }
.rp-share-cta a { font-weight: 800; font-size: 14px; color: var(--ink); text-decoration: underline; }

/* Desktop (>=1024px): centered content column + sticky sidebar card.
   This remains the one adhd-ui/quiz-funnel-adhd-ui deviation on this
   page — neither skill defines a desktop in-page sidebar layout (their
   desktop pattern is the landing-page hero/feature-grid shape); this
   reuses only existing tokens/radii/shadows for it, see the report. */
@media (min-width: 1024px) {
  .rp-hero-float { right: 44px; bottom: 26px; width: 170px; }
  .rp-illustration.rp-illustration-float { height: 170px; }
  /* Mirrors .rp-hero-float's bump just above — left/bottom match the
     band's own larger desktop padding (44px/112px), right clears the
     floating illustration's wider desktop box (right:44px + 170px +
     buffer), bottom clears the taller 86px wave below. */
  .rp-hero-disclaimer { left: 44px; right: 234px; bottom: 96px; }
  /* T023: widened further on top of the earlier 680/600 -> 760/720
     bump (see git log) per explicit user request for more breathing
     room. .rp-shell 1140 -> 1260, .rp-main 760 -> 880, .rp-band-inner
     720 -> 800 below — kept proportional to the sidebar's own fixed
     240px/48px-gap (240 + 48 + 880 = 1168, comfortably inside the
     shell's 1260 - 80px padding = 1180px inner width) and still well
     short of a 1000px+ reading-width text column.
     Follow-up: per explicit user request, the gap to the sidebar was
     tightened (48 -> 32, pulling the sidebar closer/leftward) and
     .rp-main widened (880 -> 950) so the main column takes up more of
     the row. .rp-shell's own cap was bumped 1260 -> 1320 to give that
     extra width room without eating into the sidebar (240 + 32 + 950 =
     1222, comfortably inside the new 1320 - 80px padding = 1240px
     inner width).
     Follow-up: the sidebar was taken out of this flex row entirely —
     see .rp-toc-desktop below, now position:fixed and floating over
     the page instead of reserving its own column — so .rp-main is the
     row's only flex child now and .rp-shell's gap no longer has a
     second item to apply to (left declared; harmless no-op). .rp-main
     widened again (950 -> 1100) to reclaim the space the sidebar used
     to occupy, now that nothing else in the row needs it.
     Follow-up: 1100 was too wide per explicit user feedback — dialed
     back to 900. */
  .rp-shell { max-width: 1320px; display: flex; gap: 32px; align-items: flex-start; padding: 56px 40px 80px; }
  .rp-main { flex: 1; min-width: 0; max-width: 900px; }
  .rp-toc-mobile { display: none; }
  /* Taken out of the flex row via position:fixed (was sticky, which
     still reserved its own 240px column) — it now floats directly
     over the page instead, per explicit user request. 'right' mirrors
     .rp-shell's own centering math: once the viewport exceeds the
     shell's 1320px cap, max() keeps the card pinned the same 40px
     inset from the shell's actual right edge rather than drifting
     toward the real viewport edge as the outer margin grows; below
     that cap (shell == 100vw, no outer margin) it falls back to a
     flat 40px matching .rp-shell's own side padding. z-index sits
     above .rp-toc-mobile's own 5 and the shadow reuses this file's
     established "floating card" value (see .rp-locked-overlay /
     .rp-hero-float) for a consistent elevated look. */
  .rp-toc-desktop {
    display: flex; flex-direction: column; gap: 14px;
    position: fixed; top: 40px; right: max(40px, calc((100vw - 1320px) / 2 + 40px));
    width: 240px; flex-shrink: 0; z-index: 6;
    background: var(--white); border: 2px solid var(--border); border-top: 4px solid var(--accent-alt-deep);
    border-radius: 18px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.08);
  }
  .rp-toc-badge { display: flex; align-items: center; gap: 10px; }
  .rp-toc-badge .label-eyebrow { font-size: 12px; font-weight: 700; color: var(--ink-faint); margin: 0 0 2px; }
  .rp-toc-badge .label { font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 17px; color: var(--ink); line-height: 1.2; }
  .rp-toc-badge .code { font-size: 12px; font-weight: 800; color: var(--accent-alt-deep); }
  .rp-toc-desktop .rp-toc-title { font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; color: var(--ink-faint); margin: 0; border-top: 1.5px solid var(--border); padding-top: 14px; }
  .rp-toc-desktop ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; counter-reset: rp-toc; }
  .rp-toc-desktop ol li { counter-increment: rp-toc; }
  .rp-toc-desktop ol a { display: flex; align-items: baseline; gap: 8px; padding: 8px; border-radius: 8px; }
  .rp-toc-desktop ol a:hover { background: var(--card); }
  .rp-toc-desktop ol li::before { content: counter(rp-toc) '.'; font-weight: 800; font-size: 14px; color: var(--accent-alt-deep); flex-shrink: 0; }
  .rp-toc-desktop a { font-weight: 700; font-size: 15px; color: var(--ink-soft); text-decoration: none; }
  .rp-toc-unlock-row {
    display: flex; align-items: center; gap: 8px; padding: 10px 8px; border-radius: 8px;
    background: var(--chip-yellow); font-weight: 800; font-size: 14px; color: var(--ink);
  }
  .rp-toc-cta { display: flex; flex-direction: column; gap: 8px; border-top: 1.5px solid var(--border); padding-top: 14px; }
  .rp-toc-cta .btn-sec {
    all: unset; box-sizing: border-box; width: 100%; text-align: center; cursor: pointer;
    background: var(--white); border: 1.5px solid var(--border-default); color: var(--ink);
    font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 14px; padding: 12px; border-radius: 14px;
  }

  /* .rp-band-inner's base 600px cap (set above, used on mobile/tablet
     too) was the real bottleneck for "cramped" at desktop width — .rp-
     main's own max-width increase just above does nothing if every
     band's actual text column still clamps to 600px inside it.
     Follow-up: raised 800 -> 860 alongside .rp-main's 880 -> 950 bump
     above — each band's own 44px/side padding (88 total) subtracted
     from 950 leaves 862px of content room, so 860 actually reaches it
     instead of leaving the extra width unused as dead padding.
     Follow-up: raised again, 860 -> 1010, alongside .rp-main's 950 ->
     1100 bump (1100 - 88 = 1012 of content room).
     Follow-up: dialed back to 810 alongside .rp-main's 1100 -> 900. */
  .rp-band-inner { max-width: 810px; }
  .rp-h1 { font-size: 46px; }
  .rp-hero-headline { font-size: 68px; }
  .rp-band.rp-band-hero { padding-top: 112px; padding-bottom: 112px; }
  .rp-hero-wave { height: 86px; }
  .rp-hero-headline { margin-bottom: 26px; }
  .rp-hero-type-lead { font-size: 20px; }
  .rp-hero-type-emphasis { font-size: 38px; }
  h2.rp-h2 { font-size: 28px; }
  .rp-feature-grid { grid-template-columns: 1fr 1fr; }
  .rp-plain-grid { grid-template-columns: 1fr 1fr; }
  .rp-band { margin: 0 0 20px; padding: 44px 44px 58px; border-radius: 28px; clip-path: none !important; }
  .rp-band:first-of-type { padding-top: 44px; }
  .rp-band.rp-band-hero:first-of-type { padding-top: 112px; }
  .rp-offer-grid { flex-direction: row; }
  .rp-offer-card { flex: 1; }
}

@media (min-width: 480px) {
  .rp-feature-grid { grid-template-columns: 1fr 1fr; }
  .rp-plain-grid { grid-template-columns: 1fr 1fr; }
}
`;

export function injectResultsStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}
