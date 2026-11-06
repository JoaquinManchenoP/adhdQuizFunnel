/* ============================================================
   Results page — type-agnostic template
   Renders any of the 3 types (inattentive now; hyperactive-impulsive/
   combined later) from the same markup, driven only by: a type key, a
   type label, and that type's data file (js/screens/results/data/*.js).
   Adding a type later = adding one data file; nothing here changes.
   See §4/§5/§6/§7 of the build spec for the exact section table,
   locked-block rule, offer/pricing block, and the hook-first/semantic-
   HTML rules this follows.

   T-next: layout rebuilt to track a reference page the user supplied
   (a 16personalities-style type report) — alternating full-bleed
   "bands" per section, a numbered-badge header on each major content
   section, a bigger illustration slot, strengths/challenges shown as a
   2-column feature grid instead of a bare list, locked content shown
   as a small grid of blurred placeholder cards, a compact sidebar
   "card" (type badge + numbered links + an embedded unlock/share CTA)
   instead of a plain link list, and the offer block closing inside a
   tinted banner. Content/data schema is unchanged; see the report.
   ============================================================ */

import { PRICES, UNLOCK_LABELS, DISCLAIMER, CREDIBILITY_LINE, BAR_COLORS, levelFor } from './config.js';
import { getOrCreateResultId, saveResultSnapshot, buildResultUrl, logResultEvent, isSharedModeUrl } from './storage.js';
import { injectResultsStyles } from './styles.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const AREA_LABELS = { time: 'Time blindness', overload: 'Executive overload', impulsivity: 'Impulsivity', paralysis: 'Task paralysis', emotion: 'Emotional dysregulation' };
const AREA_ORDER = ['time', 'overload', 'impulsivity', 'paralysis', 'emotion'];

// Centralized headings — identical across all 3 types, or a plain
// {type}/{Type} substitution, per the build spec's §4 table. The one
// exception, special.heading, is genuinely different wording per type
// and lives in each type's own data file instead (see data/inattentive.js).
// `band` picks the alternating background (a/b); `num` is the position
// shown in the numbered badge/sidebar (only the 8 real content sections
// get one — hero/save/offer/share don't, matching the reference's own
// numbering, which only counts its 4 main content blocks).
function sub(tpl, typeKey, typeLabel) {
  return tpl.replace(/\{Type\}/g, typeLabel).replace(/\{type\}/g, typeKey);
}

const SECTION_DEFS = [
  { id: 'hero', toc: false, band: 'hero' },
  { id: 'save', toc: false, band: 'a', heading: 'Save your results' },
  { id: 'areas', toc: true, num: 1, band: 'b', tocLabel: 'Your 5 areas', heading: 'Your results across 5 areas', lockedHeading: 'How your top areas connect', product: 'personal_profile' },
  { id: 'type', toc: true, num: 2, band: 'a', tocLabel: 'Your type', headingTpl: 'What is the {type} type of ADHD?', lockedHeadingTpl: 'Why the {type} type is often missed', product: 'type_guide' },
  { id: 'special', toc: true, num: 3, band: 'b', tocLabel: 'Why missed', lockedHeading: 'Going deeper', product: 'type_guide' },
  { id: 'work', toc: true, num: 4, band: 'a', tocLabel: 'Work & study', headingTpl: 'How the {type} type shows up at work and study', lockedHeading: 'What helps at work', product: 'type_guide' },
  { id: 'daily', toc: true, num: 5, band: 'b', tocLabel: 'Daily life', heading: 'How it affects daily life, time and money', lockedHeading: 'What helps day to day', product: 'type_guide' },
  { id: 'relationships', toc: true, num: 6, band: 'a', tocLabel: 'Relationships', heading: 'How it affects relationships', lockedHeading: 'Relationship pitfalls and how to explain it', product: 'type_guide' },
  { id: 'emotions', toc: true, num: 7, band: 'b', tocLabel: 'Emotions', heading: 'How it affects emotions and self-image', lockedHeading: 'What helps when it hits', product: 'type_guide' },
  { id: 'assessment', toc: true, num: 8, band: 'a', tocLabel: 'Assessment', heading: 'Should you get assessed for ADHD?', lockedHeading: 'Prepare for your assessment', product: 'assessment_prep' },
  { id: 'offer', toc: false, band: 'offer', heading: 'Unlock your full results' },
  { id: 'share', toc: false, band: 'b', heading: 'Save or share your results' },
];

function illustrationSlot(sectionId, size) {
  const cls = size ? `rp-illustration rp-illustration-${size}` : 'rp-illustration';
  return `<div class="${cls}" aria-hidden="true">illustration: ${escapeHtml(sectionId)}</div>`;
}

// Every full-bleed section band, slanted on its bottom edge (mobile
// only — the desktop media query turns the clip off for the rounded-
// panel layout there). `hero` gets no slant on its own illustration-
// bearing second half, since that's a plain full-width continuation.
function bandClass(def) {
  return `rp-band rp-band-${def.band} rp-band-cut`;
}

function sectionHead(def, headingText) {
  const num = def.num ? `<span class="rp-section-num">${def.num}</span>` : '';
  return `<div class="rp-section-head" id="${def.id}"><h2 class="rp-h2">${num}${escapeHtml(headingText)}</h2></div>`;
}

// A dual-anchored "Low <-> High" spectrum bar: a value chip pinned to a
// marker positioned at `pct`, end labels below — tracks the reference's
// own trait-bar mechanic (see styles.js's .rp-spec-* comment for why
// "Low/High" rather than a named bipolar pair like the reference uses).
function specRow(name, pct, color, tooltipText) {
  const tip = tooltipText
    ? `<button type="button" class="rp-tooltip" title="${escapeHtml(tooltipText)}" aria-label="${escapeHtml(tooltipText)}">?</button>`
    : '';
  // The floating value chip is wider than the marker dot, so its own
  // left% is clamped a few points in from either edge — the marker and
  // fill stay at the true, unclamped percentage.
  const labelPos = Math.min(90, Math.max(10, pct));
  return `
    <div class="rp-spec-row">
      <div class="rp-spec-name">${escapeHtml(name)}${tip}</div>
      <div class="rp-spec-track">
        <div class="rp-spec-fill" style="width:${pct}%;background:${color};"></div>
        <div class="rp-spec-value" style="left:${labelPos}%;">${escapeHtml(levelFor(pct))} · ${pct}%</div>
        <div class="rp-spec-marker" style="left:${pct}%;border:3px solid ${color};"></div>
      </div>
      <div class="rp-spec-ends"><span>Low</span><span>High</span></div>
    </div>`;
}

// icon: 'ok' (green check, strengths) | 'warn' (amber "!", challenges) |
// 'chip' (plain accent chip square, neutral signs/locked items) — see
// styles.js's .rp-feature-icon comment for why these 3, not one style.
const ICONS = {
  ok: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#3f8f6e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warn: `<svg width="3" height="11" viewBox="0 0 3 11" fill="none"><rect width="3" height="7" rx="1.5" fill="#8a6d1a"/><circle cx="1.5" cy="9.5" r="1.5" fill="#8a6d1a"/></svg>`,
};
function featureIcon(type) {
  if (type === 'chip') return `<span class="rp-feature-icon chip" aria-hidden="true"></span>`;
  return `<span class="rp-feature-icon ${type}" aria-hidden="true">${ICONS[type]}</span>`;
}
function featureGrid(items, icon) {
  if (!items || !items.length) return '';
  return `<div class="rp-feature-grid">${items.map((i) => `<div class="rp-feature-item">${featureIcon(icon)}<span>${escapeHtml(i)}</span></div>`).join('')}</div>`;
}

function listBlock(items) {
  return featureGrid(items, 'chip');
}

function strengthsChallenges(strengths, challenges) {
  return `
    <h3 class="rp-sub-h3">Strengths</h3>
    ${featureGrid(strengths, 'ok')}
    <h3 class="rp-sub-h3">Challenges</h3>
    ${featureGrid(challenges, 'warn')}`;
}

// Locked block: the real locked heading + its first line — required,
// always rendered, never blurred — then the SAME feature-grid shape
// used above, reused here with decorative placeholder items (never the
// real locked body, which is never sent to the browser pre-purchase),
// blurred, and ONE centered floating "Unlock now" card over the grid.
function lockedBlock({ heading, firstLine, product, typeKey, resultId }) {
  const dataProduct = product === 'type_guide' ? `type_guide_${typeKey}` : product;
  const label = UNLOCK_LABELS[product];
  const placeholders = ['Unlocks after purchase', 'Unlocks after purchase', 'Unlocks after purchase', 'Unlocks after purchase'];
  return `
    <div class="rp-locked">
      <p class="rp-locked-heading">${escapeHtml(heading)}</p>
      <p class="rp-locked-first-line">${escapeHtml(firstLine)}</p>
      <div class="rp-locked-grid">
        <div aria-hidden="true">${featureGrid(placeholders, 'chip')}</div>
        <div class="rp-locked-overlay">
          <div class="rp-locked-lock-badge"><i data-lucide="lock" width="16" height="16" color="var(--ink)"></i></div>
          <p class="rp-locked-overlay-title">Unlock now</p>
          <p class="rp-locked-overlay-copy">Get the full report to see this section in full.</p>
          <button type="button" class="btn primary rp-unlock-btn" data-product="${escapeHtml(dataProduct)}"
            onclick="window.rpUnlock && window.rpUnlock('${escapeHtml(dataProduct)}','${escapeHtml(resultId)}')">${escapeHtml(label)}</button>
        </div>
      </div>
    </div>`;
}

function tocHtml(typeLabel, resultId) {
  const items = SECTION_DEFS.filter((s) => s.toc);
  const linksOrdered = (tag) => items.map((s) => `<li><a href="#${s.id}">${tag === 'ol' ? '' : (s.num + '. ')}${escapeHtml(s.tocLabel)}</a></li>`).join('');
  return `
    <nav class="rp-toc-desktop" aria-label="Sections">
      <div class="rp-toc-badge">
        ${illustrationSlot('type-badge', 'circle')}
        <div>
          <p class="label-eyebrow">Your type is</p>
          <p class="label">${escapeHtml(typeLabel)}</p>
        </div>
      </div>
      <p class="rp-toc-title">On this page</p>
      <ol>${linksOrdered('ol')}</ol>
      <a href="#offer" class="rp-toc-unlock-row">📖 Unlock full results</a>
      <div class="rp-toc-cta">
        <button type="button" class="btn-sec" onclick="window.rpShareResults && window.rpShareResults('${escapeHtml(resultId)}')">↑ Share results</button>
        <button type="button" class="btn-sec" onclick="window.rpEmailResults && window.rpEmailResults('${escapeHtml(resultId)}')">✉ Email results</button>
      </div>
    </nav>
    <details class="rp-toc-mobile">
      <summary>☰ Sections</summary>
      <ul>${linksOrdered('ul')}</ul>
    </details>`;
}

// ---- hero ----
// Two bands, matching the reference's own short cream title strip
// giving way to a plain-white area for the big illustration + body
// copy + the overall/type-split bars, rather than one long cream block.
//
// T023 (full from-scratch rebuild — see TEAM_WORKFLOW.md): the prior
// round-1 redesign (kicker badge + gradient + "small lead-in line, then
// the type name alone at giant scale") was explicitly rejected by the
// user as not different enough. Replaced with a different mechanic
// entirely: an uppercase eyebrow (plain text, no pill/badge), the type
// name rendered as a single solid-filled tag/chip (the "reveal," not a
// giant standalone headline), the hook line as normal body copy below
// it, then a conic-gradient stat *ring* (the same conic-gradient-driven
// circular-meter technique this app's own instantResult gauge already
// uses — new `.rp-stat-ring` class, not a shared/edited class, per this
// file's own "never touch index.html" rule) paired with its level label
// as one inline stat row. No gradient band background, no decorative
// SVG circles, no stacked lead-in+giant-name structure survives.
function renderHero(data, typeKey, typeLabel, overallPct, level, inattentiveScore, hyperactiveScore) {
  const h = data.hero;
  return `
    <section class="rp-band rp-band-hero">
      <svg class="rp-hero-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,50 C260,115 460,5 720,45 C980,85 1180,10 1440,55 L1440,120 L0,120 Z" style="fill:var(--white);"></path>
      </svg>
      <div class="rp-band-inner">
        <div class="rp-hero-head">
          <div class="rp-hero-top-row">
            <div class="rp-hero-top-block">
              <h1 class="rp-hero-headline">You might have ADHD</h1>
              <h2 class="rp-hero-type-title"><span class="rp-hero-type-lead">Your answers show signs of:</span> <span class="rp-hero-type-emphasis">${escapeHtml(typeLabel)} ADHD</span></h2>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="rp-band rp-band-a">
      <div class="rp-band-inner">
        ${illustrationSlot('hero')}
        <div class="rp-body">${h.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
        <div class="rp-bars-card" style="margin-top:10px;">
          <p style="font-weight:800;font-size:15px;color:var(--ink);margin:0 0 4px;">Overall pattern strength: ${overallPct}% · ${escapeHtml(level)}</p>
          ${specRow('Inattentive', inattentiveScore, 'var(--accent)')}
          ${specRow('Hyperactive-impulsive', hyperactiveScore, 'var(--dataviz-coral)')}
        </div>
        <p class="disclaimer">${escapeHtml(DISCLAIMER)}</p>
        <p style="font-weight:600;font-size:14px;color:var(--ink-faint);margin-top:8px;">${escapeHtml(CREDIBILITY_LINE)}</p>
      </div>
    </section>`;
}

// ---- save (section 2) ----
function renderSave(def, resultId) {
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner">
        <h2 class="rp-h2" style="margin-bottom:10px;">${escapeHtml(def.heading)}</h2>
        <p class="rp-hook">Keep a link to this page, or share a read-only version with someone else.</p>
        <div class="rp-btn-row">
          <button type="button" class="btn primary" onclick="window.rpEmailResults && window.rpEmailResults('${escapeHtml(resultId)}')">Email me my results</button>
          <button type="button" class="btn primary" onclick="window.rpShareResults && window.rpShareResults('${escapeHtml(resultId)}')">Share</button>
        </div>
      </div>
    </section>`;
}

// ---- areas (section 1 in the numbered sequence) ----
function renderAreas(data, def, pcts, typeKey, resultId, sharedMode) {
  const bars = AREA_ORDER.map((key, i) => specRow(AREA_LABELS[key], pcts[key], BAR_COLORS[i % BAR_COLORS.length], data.areas.tooltips[key])).join('');
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner">
        ${sectionHead(def, def.heading)}
        ${illustrationSlot('areas')}
        <p class="rp-hook">${escapeHtml(data.areas.hook)}</p>
        <div class="rp-bars-card">${bars}</div>
        ${sharedMode ? '' : lockedBlock({ heading: def.lockedHeading, firstLine: data.areas.locked_first_line, product: def.product, typeKey, resultId })}
      </div>
    </section>`;
}

// ---- generic hook/body/list section with a locked block ----
function renderSimpleSection(def, sectionData, heading, typeKey, resultId) {
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner">
        ${sectionHead(def, heading)}
        ${illustrationSlot(def.id)}
        <p class="rp-hook">${escapeHtml(sectionData.hook)}</p>
        <div class="rp-body">${(sectionData.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
        ${listBlock(sectionData.list_items)}
        ${lockedBlock({ heading: def.lockedHeadingTpl ? sub(def.lockedHeadingTpl, typeKey, '') : def.lockedHeading, firstLine: sectionData.locked_first_line, product: def.product, typeKey, resultId })}
      </div>
    </section>`;
}

// ---- strengths/challenges section (work, daily, relationships) ----
function renderTraitsSection(def, sectionData, heading, typeKey, resultId) {
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner">
        ${sectionHead(def, heading)}
        ${illustrationSlot(def.id)}
        <p class="rp-hook">${escapeHtml(sectionData.hook)}</p>
        ${strengthsChallenges(sectionData.strengths, sectionData.challenges)}
        ${lockedBlock({ heading: def.lockedHeading, firstLine: sectionData.locked_first_line, product: def.product, typeKey, resultId })}
      </div>
    </section>`;
}

// ---- offer block (closing banner) ----
function renderOffer(def, typeKey, typeLabel, resultId) {
  const typeGuideProduct = `type_guide_${typeKey}`;
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner rp-offer-banner">
        <h2 class="rp-h2" style="margin-bottom:10px;">${escapeHtml(def.heading)}</h2>
        <p class="rp-hook">Pick one type guide, all three, or everything including your personal profile and assessment prep.</p>
        <div class="rp-offer-grid">
          <div class="rp-offer-card">
            <span class="rp-offer-name">One type guide</span>
            <span class="rp-offer-price">€${PRICES.type_guide}</span>
            <ul class="rp-offer-includes"><li>This type's locked sections</li></ul>
            <button type="button" class="btn primary" data-product="${escapeHtml(typeGuideProduct)}" onclick="window.rpUnlock && window.rpUnlock('${escapeHtml(typeGuideProduct)}','${escapeHtml(resultId)}')">Unlock · €${PRICES.type_guide}</button>
          </div>
          <div class="rp-offer-card">
            <span class="rp-offer-name">All 3 type guides</span>
            <span class="rp-offer-price">€${PRICES.all_guides} <span class="rp-offer-separately">€${PRICES.all_guides_separately}</span></span>
            <ul class="rp-offer-includes"><li>All 3 types' locked sections</li></ul>
            <button type="button" class="btn primary" data-product="all_guides" onclick="window.rpUnlock && window.rpUnlock('all_guides','${escapeHtml(resultId)}')">Unlock · €${PRICES.all_guides}</button>
          </div>
          <div class="rp-offer-card rp-offer-emphasis">
            <span class="rp-offer-name">Complete</span>
            <span class="rp-offer-price">€${PRICES.complete} <span class="rp-offer-separately">€${PRICES.complete_separately}</span></span>
            <ul class="rp-offer-includes">
              <li><span>3 type guides</span><span>€${PRICES.all_guides_separately}</span></li>
              <li><span>Personal profile</span><span>€${PRICES.personal_profile}</span></li>
              <li><span>Assessment prep</span><span>€${PRICES.assessment_prep}</span></li>
              <li><span>PDF download</span><span>included</span></li>
            </ul>
            <button type="button" class="btn primary" data-product="complete" onclick="window.rpUnlock && window.rpUnlock('complete','${escapeHtml(resultId)}')">Unlock · €${PRICES.complete}</button>
          </div>
        </div>
        <p class="rp-offer-fineprint">Secure checkout. Instant access after purchase.</p>
      </div>
    </section>`;
}

function renderShareSection(def, resultId) {
  return `
    <section class="${bandClass(def)}">
      <div class="rp-band-inner">
        <h2 class="rp-h2" style="margin-bottom:10px;">${escapeHtml(def.heading)}</h2>
        <p class="rp-hook">Keep this link, or send a read-only copy to someone else.</p>
        <div class="rp-btn-row">
          <button type="button" class="btn primary" onclick="window.rpShareResults && window.rpShareResults('${escapeHtml(resultId)}')">Share</button>
          <button type="button" class="btn primary" onclick="window.rpEmailResults && window.rpEmailResults('${escapeHtml(resultId)}')">Email this to yourself</button>
        </div>
      </div>
    </section>`;
}

function quizStartHref() {
  // Link only — the quiz start page itself is untouched (out of scope).
  return location.pathname;
}

/* ---------------- Public entry ---------------- */
// mode: { shared: boolean }
export function renderTypeResultsPage({ typeKey, typeLabel, data, overallPct, level, inattentiveScore, hyperactiveScore, pcts }, mode = {}) {
  injectResultsStyles();
  const shared = !!mode.shared;
  const resultId = getOrCreateResultId();

  // Persist a snapshot for this result_id so a save/share link opened
  // later (same browser) can reload the same numbers — see the report
  // for what a real backend would add for cross-device sharing.
  if (!shared) {
    saveResultSnapshot(resultId, { typeKey, overallPct, level, inattentiveScore, hyperactiveScore, pcts, savedAt: Date.now() });
  }

  // noindex both the normal and shared views of this page — results.js's
  // router is the only thing that ever toggles this, and only while this
  // screen is showing; index.html's own static meta tag is never edited.
  const robotsMeta = document.querySelector('meta[name="robots"]');
  if (robotsMeta) robotsMeta.setAttribute('content', 'noindex,nofollow');

  const areasDef = SECTION_DEFS.find((s) => s.id === 'areas');
  const saveDef = SECTION_DEFS.find((s) => s.id === 'save');
  const typeDef = SECTION_DEFS.find((s) => s.id === 'type');
  const specialDef = SECTION_DEFS.find((s) => s.id === 'special');
  const workDef = SECTION_DEFS.find((s) => s.id === 'work');
  const dailyDef = SECTION_DEFS.find((s) => s.id === 'daily');
  const relDef = SECTION_DEFS.find((s) => s.id === 'relationships');
  const emoDef = SECTION_DEFS.find((s) => s.id === 'emotions');
  const assessDef = SECTION_DEFS.find((s) => s.id === 'assessment');
  const offerDef = SECTION_DEFS.find((s) => s.id === 'offer');
  const shareDef = SECTION_DEFS.find((s) => s.id === 'share');

  const heroHtml = renderHero(data, typeKey, typeLabel, overallPct, level, inattentiveScore, hyperactiveScore);
  const areasHtml = renderAreas(data, areasDef, pcts, typeKey, resultId, shared);

  if (shared) {
    // Shared mode: sections 1 and 3 (free parts only), no locked blocks,
    // no offer, never the name/email, ends with a link back to the quiz.
    return `
      <div class="rp-root">
        <div class="rp-shell">
          <div class="rp-main">
            ${heroHtml}
            ${areasHtml}
            <div class="rp-share-cta">
              <p class="rp-hook">What about you? <a href="${escapeHtml(quizStartHref())}">Take the free 3-minute quiz</a></p>
            </div>
          </div>
        </div>
      </div>`;
  }

  const typeHeading = sub(typeDef.headingTpl, typeKey, typeLabel);
  const workHeading = sub(workDef.headingTpl, typeKey, typeLabel);

  return `
    <div class="rp-root">
      <div class="rp-shell">
        ${tocHtml(typeLabel, resultId)}
        <div class="rp-main">
          ${heroHtml}
          ${renderSave(saveDef, resultId)}
          ${areasHtml}
          ${renderSimpleSection(typeDef, data.type_guide, typeHeading, typeKey, resultId)}
          <section class="${bandClass(specialDef)}">
            <div class="rp-band-inner">
              ${sectionHead(specialDef, data.special.heading)}
              ${illustrationSlot('special')}
              <p class="rp-hook">${escapeHtml(data.special.hook)}</p>
              <div class="rp-body">${data.special.body.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</div>
              ${lockedBlock({ heading: specialDef.lockedHeading, firstLine: data.special.locked_first_line, product: specialDef.product, typeKey, resultId })}
            </div>
          </section>
          ${renderTraitsSection(workDef, data.work, workHeading, typeKey, resultId)}
          ${renderTraitsSection(dailyDef, data.daily, dailyDef.heading, typeKey, resultId)}
          ${renderTraitsSection(relDef, data.relationships, relDef.heading, typeKey, resultId)}
          <section class="${bandClass(emoDef)}">
            <div class="rp-band-inner">
              ${sectionHead(emoDef, emoDef.heading)}
              ${illustrationSlot('emotions')}
              <p class="rp-hook">${escapeHtml(data.emotions.hook)}</p>
              ${listBlock(data.emotions.list_items)}
              ${lockedBlock({ heading: emoDef.lockedHeading, firstLine: data.emotions.locked_first_line, product: emoDef.product, typeKey, resultId })}
            </div>
          </section>
          ${renderSimpleSection(assessDef, data.assessment, assessDef.heading, typeKey, resultId)}
          ${renderOffer(offerDef, typeKey, typeLabel, resultId)}
          ${renderShareSection(shareDef, resultId)}
        </div>
      </div>
    </div>`;
}

export { logResultEvent, buildResultUrl, isSharedModeUrl };
