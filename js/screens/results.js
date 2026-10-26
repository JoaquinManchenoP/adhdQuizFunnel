/* ============================================================
   Screen: results
   Shown after a successful email submit (post-SparkLoop) — this is
   the "full breakdown" instantResult.js's locked-teaser promised
   before email capture. Reuses .thankyou-screen/.thankyou-inner for
   the same full-bleed centered shell as the old thankYou screen (no
   new layout CSS needed), plus the companion mascot and .ty-eyebrow
   chip already used there. Content specifics (copy, exact bands)
   aren't the point yet — this just needs to exist and read real
   scoring data from buildResultsReport() so it isn't a dead mock.
   ============================================================ */

import { poseIdleSvg } from '../components/companion.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Same 4-color warm rotation calculating.js's metric bars use (accent,
// coral, teal, periwinkle) — reused here rather than inventing new fills,
// cycling i % 4 same as that screen's own precedent for >4 rows.
const PATTERN_COLORS = ['var(--accent)', 'var(--dataviz-coral)', 'var(--dataviz-teal)', 'var(--dataviz-periwinkle)'];

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// The actual depth of this page — only ever rendered for the primary
// pattern's expanded row, so whichever of the 5 patterns someone lands
// on, they get the full write-up: why it happens, where it tends to show
// up, concrete day-to-day examples, and things that tend to help. Locked
// rows stay on state.js's short PATTERN_DESCRIPTIONS only.
const PATTERN_DEEP_DIVE = {
  time: {
    why: "Time blindness comes from the brain's internal \"time-tracking\" system running less reliably — research on ADHD links it to real differences in how the brain estimates duration and holds a sense of \"now\" versus \"later,\" not a character flaw or a lack of trying.",
    contexts: {
      work: "Meetings and deadlines creep up with almost no warning, even when they were on the calendar the whole time — projects that need steady pacing are the hardest to manage.",
      relationships: "Being late becomes a pattern other people notice before you do, which can read as not caring even when it's really about how time is being tracked.",
      dailyLife: "Everyday errands and chores get scheduled back-to-back with no buffer, so one running-long task knocks over everything after it.",
    },
    examples: [
      "Saying \"I'll be there in 10 minutes\" and meaning it, then showing up 40 minutes later",
      "Starting a task at 9pm \"for a few minutes\" and looking up at 1am",
      "Being chronically surprised by how close a deadline actually is",
      "Underestimating how long getting ready will take, every single time",
      "Losing a whole afternoon to something that felt like \"just a few minutes\"",
      "Being equally convinced a task will take 10 minutes or 3 hours, with no in-between feeling",
    ],
    tips: [
      "External clocks over internal ones — timers, alarms, and visible countdowns instead of trying to \"just feel\" the time",
      "Padding every estimate: whatever your gut says, add 50% more time",
      "Planning backward from the deadline instead of forward from \"now\"",
      "Time-boxing with a timer visibly running in the room, not just on a phone screen",
      "Building buffer time between tasks instead of scheduling back-to-back",
      "Checking the actual clock at set checkpoints during a task, instead of trusting your sense of how much time has passed",
    ],
    closing: "None of this means you don't care about time — it means your brain tracks it differently, and the right tools can close that gap.",
  },
  overload: {
    why: "Executive overload happens when the brain's \"air traffic controller\" — the system that prioritizes, sequences, and holds several tasks in mind at once — gets overwhelmed faster than it does for most people, especially with tasks that don't come with built-in structure.",
    contexts: {
      work: "Open-ended projects with no clear structure are the ones most likely to stall, even when the skills to do them aren't in question.",
      relationships: "Juggling other people's needs on top of your own tasks can tip things over fast, since every added request is one more thing competing for the same attention.",
      dailyLife: "Simple multi-step chores — unpacking groceries, sorting mail, setting up a new gadget — can feel disproportionately exhausting because of how many small decisions they require.",
    },
    examples: [
      "Freezing when a to-do list has too many unordered items on it",
      "A tidy space turning into chaos the moment more than one project is \"in progress\" at once",
      "Feeling fine with one task, but falling apart the moment a second one gets added",
      "Big projects staying untouched because there's no obvious first step",
      "Having five browser tabs, three notes apps, and two half-written lists all tracking the same handful of things",
      "Feeling capable right up until a second deadline or request lands on the same day",
    ],
    tips: [
      "Breaking any task into the smallest possible first step — not \"clean the kitchen,\" but \"put one dish in the sink\"",
      "Writing down everything competing for attention, even small things, so your brain doesn't have to hold it all",
      "Picking one single next action instead of planning the whole sequence up front",
      "Building routines/checklists for anything recurring, so it stops needing a fresh decision every time",
      "Using a single trusted place for every task (one list, one app) instead of several competing ones",
      "Capping how many things are \"in progress\" at once, and finishing or parking the rest before adding something new",
    ],
    closing: "This isn't about not being capable — it's about the difference between tasks that come pre-structured and tasks that don't.",
  },
  impulsivity: {
    why: "Impulsivity is linked to the brain's \"pause button\" — the mechanism that creates a gap between noticing an urge and acting on it — responding a beat slower, so the action often happens before the thinking does.",
    contexts: {
      work: "Jumping into a task or reply before fully reading the brief can mean redoing work that a few extra seconds of pause would have caught.",
      relationships: "Interrupting or reacting quickly in conversation can come across as not listening, even when you heard every word — it's the timing of the response, not the attention.",
      dailyLife: "Impulse purchases, snap decisions, and sudden plan changes can add up over time in ways that are hard to see in any single moment.",
    },
    examples: [
      "Interrupting someone mid-sentence, then immediately wishing you hadn't",
      "Buying something on a whim you'd never actually plan to buy",
      "Switching tasks the second something more interesting shows up",
      "Blurting out a reaction before fully hearing someone out",
      "Agreeing to something in the moment that you regret by the next day",
      "Starting a reply or a project mid-thought, before fully working out where it's going",
    ],
    tips: [
      "Building in a deliberate pause — even counting to five — before responding or acting",
      "Removing triggers from easy reach (closing tabs, putting the phone in another room) instead of relying on willpower alone",
      "Naming the impulse the moment it shows up (\"I want to interrupt right now\") — naming it creates a half-second of space",
      "Channeling restlessness into something physical first, before switching tasks",
      "Setting a short waiting period for anything with a cost or consequence (a purchase, a reply, a commitment)",
      "Keeping a \"parking lot\" note for thoughts that want to interrupt, so they're captured without derailing the moment",
    ],
    closing: "The urge to act fast isn't a character flaw — it's a timing difference, and timing is something you can work with.",
  },
  paralysis: {
    why: "Task paralysis is often less about the task itself and more about activation — the brain's system for getting started is more reliably triggered by urgency or interest than by importance alone, so \"someday\" tasks can sit untouched no matter how much they matter.",
    contexts: {
      work: "Tasks without a hard deadline or an obvious first step are the ones most likely to sit untouched for weeks, regardless of how important they are.",
      relationships: "Promising to handle something and then stalling on it can look like avoidance, when it's really a stuck starting gear.",
      dailyLife: "Household tasks with no natural trigger — the ones nobody's waiting on — are often the last to get done, no matter how small they actually are.",
    },
    examples: [
      "Knowing exactly what needs to happen and still not starting it",
      "Doing almost anything else — including other chores — to avoid the one thing on the list",
      "Only ever finishing things the night before they're due",
      "Feeling stuck on a task with no clear first step, even a small one",
      "Rewriting the same to-do item across several lists without ever doing it",
      "Feeling relief the moment a task becomes impossible to start on time",
    ],
    tips: [
      "Manufacturing urgency on purpose — small deadlines, timers, or telling someone else your plan",
      "Shrinking the first step until it's almost too easy to skip (\"open the document\" instead of \"write the report\")",
      "Starting in a different environment than usual — a change of scenery can break the freeze",
      "Pairing the task with something enjoyable (music, a drink you like) to lower the cost of starting",
      "Telling someone else your plan and a deadline, so there's outside accountability instead of relying on internal motivation alone",
      "Starting with a 2-minute version of the task, with permission to stop after that if you want to",
    ],
    closing: "Struggling to start isn't the same as not caring — for this pattern, the barrier is almost always at the beginning, not the finish.",
  },
  emotion: {
    why: "Emotional dysregulation reflects a brain that registers emotions at full volume and takes longer to turn that volume back down — the feelings themselves aren't exaggerated, but the brakes on them respond more slowly.",
    contexts: {
      work: "Feedback or criticism at work can land harder and linger longer than it was meant to, even when you know logically it wasn't a big deal.",
      relationships: "A reaction that feels proportional in the moment can look like \"too much\" to someone else, which adds a layer of self-consciousness on top of the original feeling.",
      dailyLife: "Small daily frustrations — a dropped item, a slow line, a typo — can trigger a reaction sized for something much bigger.",
    },
    examples: [
      "A small frustration turning into a reaction that feels bigger than the moment calls for",
      "Replaying an embarrassing or hurtful moment for hours after it's long over",
      "Going from calm to overwhelmed with very little warning",
      "Taking feedback harder than it was probably intended",
      "Needing real time alone to recover after a stressful interaction, even a short one",
      "Feeling fine one moment and completely overwhelmed the next, for a trigger that looks small from the outside",
    ],
    tips: [
      "Naming the emotion out loud the moment it shows up — labeling tends to lower its intensity",
      "Building in a physical reset — a short walk, cold water, a few slow breaths — before responding to anything charged",
      "Giving yourself permission to step away from a conversation or task until the spike passes",
      "Keeping a short list of what's helped you calm down before, so you're not inventing a plan mid-reaction",
      "Telling the people close to you what helps (space, quiet, a specific phrase) before you need it, not in the middle of a spike",
      "Treating the recovery time after a big reaction as normal and necessary, not something to rush past",
    ],
    closing: "Feeling things intensely isn't a flaw to fix — it just means the \"cool-down\" period needs more deliberate support than it does for most people.",
  },
};

export function renderResults(state) {
  const report = state.buildResultsReport();
  const email = state.submittedEmail;
  const pattern = report.pattern;
  const primaryPct = pattern.pcts[pattern.primary];
  const primaryTerm = state.PATTERN_LABELS[pattern.primary];
  const strength = primaryPct >= 70 ? 'strong' : 'some';
  // Short subtitle only: how this result relates to ADHD, nothing more —
  // worded to never use the literal "signs of ADHD" phrase (names the
  // specific pattern instead, same rule the rest of this page's copy
  // follows). The actual depth lives in the expandable row below.
  const commonalityNote = `${capitalize(primaryTerm)} is one of the most common patterns people associate with ADHD — you're far from alone in this.`;
  const deepDive = PATTERN_DEEP_DIVE[pattern.primary];

  // Ranked highest-first so the primary pattern (already named above)
  // leads the list, same emphasis the teaser gave it.
  const ranked = Object.keys(pattern.pcts)
    .map((key) => ({ key, pct: pattern.pcts[key] }))
    .sort((a, b) => b.pct - a.pct);

  return `
    <div class="thankyou-screen">
      <div class="thankyou-inner">

        <div class="ty-mascot-float" style="margin-bottom:10px;">
          ${poseIdleSvg(96)}
        </div>

        <div class="adhd-fade" style="animation-delay:.05s;display:flex;justify-content:center;">
          <div class="ty-eyebrow">📊 Your results are in</div>
        </div>

        <h1 class="adhd-fade" style="animation-delay:.12s;text-align:center;">Here's your full breakdown</h1>

        <p class="lede centered small adhd-fade" style="animation-delay:.2s;">
          ${email ? `A copy is on its way to <strong>${escapeHtml(email)}</strong>.` : 'A copy is on its way to your inbox.'}
        </p>

        <div class="result-label adhd-fade" style="animation-delay:.26s;">Your answers show ${strength} signs of ${escapeHtml(primaryTerm)}</div>
        <p class="lede centered small adhd-fade" style="animation-delay:.3s;">${escapeHtml(commonalityNote)}</p>

        <!-- Slightly wider than the rest of the page's 450px column, just
             for this list — a small negative-margin bleed on the list
             itself rather than widening .thankyou-inner, which thankYou.js
             also uses and shouldn't be affected. -->
        <div class="result-trait-list adhd-fade" style="animation-delay:.36s; margin-left:-10px; margin-right:-10px; width:calc(100% + 20px);">
          ${ranked.map((p, i) => {
            const title = capitalize(state.PATTERN_LABELS[p.key]);
            const bar = `
                <div class="result-trait-head">
                  <span>${title}</span>
                  <span>${p.pct}%</span>
                </div>
                <div class="result-trait-track">
                  <div class="result-trait-fill" style="width:${p.pct}%; background:${PATTERN_COLORS[i % PATTERN_COLORS.length]};"></div>
                </div>`;
            // The person's own result: a native <details> disclosure so
            // they can expand it for the full write-up — collapsed by
            // default, same at-a-glance look (title/bar/%) as the locked
            // rows below until they choose to open it. No circular gauge
            // in the expanded state — the straight bar above already
            // carries the percent; expanding is for the write-up only.
            if (p.key === pattern.primary) {
              const context = deepDive.contexts;
              return `
              <details class="result-trait-row">
                <summary style="list-style:none; cursor:pointer;">
                  ${bar}
                  <div class="field-label" style="display:flex; align-items:center; gap:4px; margin-top:9px;">
                    <i data-lucide="chevron-down" width="14" height="14"></i>
                    <span>Tap to see what this means</span>
                  </div>
                </summary>

                <p class="result-trait-copy" style="margin-top:12px;">${escapeHtml(state.PATTERN_DESCRIPTIONS[p.key])}</p>

                <p class="field-label" style="margin-top:14px;">Why this happens</p>
                <p class="result-trait-copy">${escapeHtml(deepDive.why)}</p>

                <p class="field-label" style="margin-top:14px;">Where this tends to show up</p>
                <p class="result-trait-copy">• <strong>Work:</strong> ${escapeHtml(context.work)}</p>
                <p class="result-trait-copy">• <strong>Relationships:</strong> ${escapeHtml(context.relationships)}</p>
                <p class="result-trait-copy">• <strong>Daily life:</strong> ${escapeHtml(context.dailyLife)}</p>

                <p class="field-label" style="margin-top:14px;">What this can look like</p>
                ${deepDive.examples.map((ex) => `<p class="result-trait-copy">• ${escapeHtml(ex)}</p>`).join('')}

                <p class="field-label" style="margin-top:14px;">What tends to help</p>
                ${deepDive.tips.map((tip) => `<p class="result-trait-copy">• ${escapeHtml(tip)}</p>`).join('')}

                <p class="result-trait-copy" style="margin-top:14px;">${escapeHtml(deepDive.closing)}</p>
              </details>
            `;
            }
            // Every other pattern: title/bar/% stay visible, but the
            // description is rendered blurred and un-clickable — locked
            // until a future update, not expandable.
            return `
              <div class="result-trait-row">
                ${bar}
                <div style="position:relative; margin-top:9px;">
                  <p class="result-trait-copy" style="filter:blur(4px); user-select:none;" aria-hidden="true">${escapeHtml(state.PATTERN_DESCRIPTIONS[p.key])}</p>
                  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="lock" width="16" height="16" color="var(--text-subtle)"></i>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button type="button" class="btn ty-retake adhd-fade" style="animation-delay:.44s;" onclick="restartQuiz()">Take the quiz again</button>

        <p class="disclaimer adhd-fade" style="animation-delay:.5s;">This quiz is for informational and educational purposes only. It is not a medical device and does not provide a medical diagnosis. Only a licensed healthcare professional can diagnose ADHD or any other condition.</p>
      </div>
    </div>
  `;
}
