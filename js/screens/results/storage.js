/* ============================================================
   Results page — result_id, client-side storage, shared-mode routing
   The project has no existing way to address one person's results by
   URL (sessionStorage in js/state.js is per-tab and holds only the
   CURRENT session's live quiz state, not a shareable/reloadable
   record). So: mint a result_id, snapshot the report the quiz already
   computed into localStorage under it, and address it via `?r=<id>`
   (optionally `&shared=1`). See the results-page report for what a
   real backend would add (cross-device/cross-browser persistence).
   ============================================================ */

import { track } from '../../analytics.js';

const STORAGE_PREFIX = 'adhdQuizResult_';
const SESSION_ID_KEY = 'adhdQuizResultId';
const URL_ID_PARAM = 'r';
const URL_SHARED_PARAM = 'shared';

function randomId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// One id per browser session (sessionStorage), reused across re-renders
// of the same results view so repeat saves/shares don't mint a new id
// every time.
export function getOrCreateResultId() {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return randomId(); // storage unavailable — still usable for this render, just not persisted
  }
}

export function saveResultSnapshot(id, snapshot) {
  try { localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(snapshot)); } catch (e) { /* private mode/quota — skip persisting */ }
}
export function loadResultSnapshot(id) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function currentUrlResultId() {
  return new URLSearchParams(location.search).get(URL_ID_PARAM);
}
export function isSharedModeUrl() {
  return new URLSearchParams(location.search).get(URL_SHARED_PARAM) === '1';
}
export function buildResultUrl(id, { shared = false } = {}) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set(URL_ID_PARAM, id);
  if (shared) url.searchParams.set(URL_SHARED_PARAM, '1');
  return url.toString();
}

// Stub for every "unlock"/save/share tap: routes through the app's
// existing PostHog wrapper when present, and always also logs to
// console.info so the stub is visible with no analytics configured.
// No payment or email-platform integration — see the report for what
// each needs.
export function logResultEvent(event, data) {
  try { track(event, data); } catch (e) { /* analytics must never break the page */ }
  console.info(`[results] ${event}`, data);
}

// Shared mode needs the SPA to land on the 'results' screen when a
// shared link (`?r=<id>&shared=1`) is opened fresh, but js/main.js's
// screen dispatcher is a shared/global file this task must not edit.
// Instead, this runs as an import-time side effect of the results
// feature itself (js/main.js already imports renderResults from
// js/screens/results.js before it calls State.restore()/render()), so
// by the time main.js's own startup code runs, State.screen is already
// 'results' — main.js never needs to know shared mode exists. Safe
// because State.setScreen() persists synchronously to sessionStorage,
// and State.restore() (which runs right after, in main.js) just reads
// that same value back.
export function installSharedModeRouting(State) {
  // Any `?r=<id>` link (self-saved OR someone else's shared link) needs
  // to land on the results screen from a fresh tab — `&shared=1` only
  // decides which VARIANT renders (see results.js's router), not
  // whether this fires.
  if (currentUrlResultId()) {
    State.setScreen('results');
  }
}
