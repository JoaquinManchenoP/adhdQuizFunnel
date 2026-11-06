/* ============================================================
   Results page — legacy renderer (pre-rebuild)
   Moved verbatim out of js/screens/results.js, which is now a router
   (see that file). Used for the hyperactive-impulsive and combined
   types only, until their own in-depth templates/data files exist —
   per the build spec, those two types keep rendering exactly this,
   unchanged, in the meantime. Nothing in this file was altered as
   part of that rebuild; only its export name changed
   (renderResults -> renderLegacyResults) and its location.
   ============================================================ */

import { poseIdleSvg } from '../../components/companion.js';

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
// on, they get the same full write-up: intro, why it happens, why it's a
// meaningful signal, what it looks like, its consequences across work/
// relationships/daily life, and why the usual advice doesn't stick.
// Locked rows stay on state.js's short PATTERN_DESCRIPTIONS only. tips/
// closing are still supported by the renderer below (shown only if
// present) for any future pattern that wants them instead.
const PATTERN_DEEP_DIVE = {
  time: {
    intro: "You underestimate how long things take. You lose track of time once you're into something. Deadlines that aren't right in front of you don't feel real until it's too late.",
    why: [
      "Time Blindness has nothing to do with discipline. Your sense of time comes from a network in the brain linking the frontal lobes, the basal ganglia and the cerebellum, and that network depends on dopamine. In ADHD, dopamine signalling in those same areas works differently. The result is an internal clock that runs less reliably.",
      "The same frontal systems are what let you keep a future event in mind and act on it now. When they're underactive, the future doesn't seem real until it's already here. That's why a deadline can sit on your calendar for weeks and still feel like it came out of nowhere.",
    ],
    whySignOfADHD: [
      "Trouble with time isn't a side effect of ADHD. It's one of its most consistent features. It's significant enough that some researchers now treat time processing as one of the core pathways of ADHD.",
      "What makes it a meaningful signal is the pattern: time blindness that has been there since childhood, shows up at work, at home and in relationships, and doesn't improve no matter what you try.",
      "Time blindness on its own doesn't mean you have ADHD. Stress, poor sleep, anxiety and depression can all distort your sense of time. But when it shows up alongside other signs, like trouble focusing, restlessness or struggling to start tasks, it's a pattern worth thinking about.",
    ],
    examples: [
      "You say \"15 minutes\" and mean it. You arrive 45 minutes later.",
      "You start something at 8pm, and by the time you realize you should go to bed, it's already 2am.",
      "Every deadline seems much closer than you thought.",
      "A task feels like it'll take 30 minutes, but it takes 3 hours.",
    ],
    contextsHeader: "The Consequences",
    contexts: {
      work: "Deadlines seem to come out of nowhere. Long term projects that need consistency always fall apart after a few months.",
      relationships: "People notice your lateness before you do. It can come off as not caring or being uninterested.",
      dailyLife: "You leave no buffer between tasks, so if one thing doesn't work out, the rest of your day can be ruined as well.",
      dailyLifeLabel: "Day to day",
    },
    whyAdviceFails: [
      "Calendars, planners, organizers: you've heard it all. The advice is fine. The problem is that every one of those tools needs you to remember it at the exact moment you've lost track of time, and that's the moment your brain isn't sending the signal. So timers get dismissed, reminders get ignored, and it starts to look like a lack of discipline and willpower. It isn't.",
      "What works is a setup that runs without you having to remember it.",
    ],
  },
  overload: {
    intro: "You freeze when too many things need attention at once. Open-ended tasks with no clear structure are the hardest to start. One extra request can tip a day that was going fine into chaos.",
    why: [
      "Executive overload comes from how the prefrontal cortex manages working memory, the mental workspace that holds several things in mind at once and decides what to do first. In ADHD, that workspace fills up faster and empties out less efficiently, so holding three tasks in mind can feel the same as holding ten.",
      "The same system is responsible for breaking a vague goal into an ordered sequence of steps. When it's under strain, a task without a built-in structure, no checklist, no obvious first move, doesn't get organized on its own. It just sits there as one undifferentiated block, which is what makes it feel heavier than it actually is.",
    ],
    whySignOfADHD: [
      "Difficulty managing multiple demands at once isn't a minor quirk of ADHD. It's one of the clearest expressions of the executive function differences the condition is built around. Working-memory load is one of the most consistently measured differences in ADHD research.",
      "What makes it a meaningful signal is the pattern: overload that's been there for as long as you can remember, that shows up whether the task is boring or genuinely interesting, and that doesn't resolve just by \"getting more organized.\"",
      "Feeling overwhelmed on its own doesn't mean you have ADHD. Everyone hits their limit with enough going on. But when it happens at a noticeably lower threshold than it seems to for other people, and shows up alongside other patterns like time blindness or trouble starting tasks, it's worth paying attention to.",
    ],
    examples: [
      "A to-do list with more than a few unordered items makes you want to close the app entirely",
      "A clean space turns into chaos the moment a second project gets added on top of the first",
      "You're completely capable of handling one thing, until a second one lands on the same day",
      "A big project goes untouched for weeks because there's no obvious first step",
      "You've got several notes apps and lists all half-tracking the same handful of things",
    ],
    contextsHeader: "The Consequences",
    contexts: {
      work: "Open-ended projects with no clear structure are the ones most likely to stall for months, even when the skills to do them were never in question.",
      relationships: "Other people's requests landing on top of your own tasks can tip things over fast. It's not that you don't want to help. It's that every addition is competing for the same limited space.",
      dailyLife: "Simple multi-step errands, like unpacking groceries or sorting mail, end up feeling disproportionately exhausting, because of how many small decisions they quietly require.",
      dailyLifeLabel: "Day to day",
    },
    whyAdviceFails: [
      "\"Just make a list\" is the most common advice, and it's not wrong. It's incomplete. A list still asks you to hold the whole picture in mind long enough to prioritize it, which is exactly the step that's straining in the first place. So the list gets made and then never opened again.",
      "What works is removing the need to prioritize in the moment at all, deciding the order in advance, when you're not already overloaded.",
    ],
  },
  impulsivity: {
    intro: "You act, say, or decide before you've finished thinking it through. Something grabbing your attention is hard not to follow. By the time the second thought arrives, the first one has usually already happened.",
    why: [
      "Impulsivity comes from how the brain's response-inhibition system works, the mechanism that normally creates a short pause between noticing an urge and acting on it. That pause depends on dopamine signalling in the same frontal-striatal circuits affected in ADHD, so the gap between impulse and action runs shorter and less reliably.",
      "It isn't that the urge itself is stronger. It's that the brake that would normally slow it down engages a beat later, or not at all. By the time the \"should I do this\" thought shows up, the doing has often already started.",
    ],
    whySignOfADHD: [
      "Acting before thinking isn't a side detail of ADHD. Response inhibition is one of the most heavily studied executive differences in the condition, and one of the clearest markers researchers point to.",
      "What makes it meaningful as a signal is the pattern: impulsivity that's shown up since childhood, across completely different settings, a classroom, a workplace, a relationship, not just one context where it would be easy to explain away.",
      "An impulsive decision now and then doesn't mean you have ADHD. Everyone acts without thinking sometimes. But when it's a near-constant feature of how you move through a day, and shows up alongside patterns like restlessness or trouble with time, it's worth a closer look.",
    ],
    examples: [
      "You interrupt someone mid-sentence, then immediately wish you hadn't",
      "You buy something on a whim you'd never actually plan to buy",
      "Something more interesting shows up and you drop what you were doing without deciding to",
      "You react to what someone said before you've actually heard the whole thing",
      "You agree to something in the moment that you regret by the next morning",
    ],
    contextsHeader: "The Consequences",
    contexts: {
      work: "Jumping into a reply or a task before fully reading the brief means redoing work a few extra seconds of pause would have caught.",
      relationships: "Interrupting or reacting quickly can come across as not listening, even when every word landed. It's the timing of the response people notice, not your attention.",
      dailyLife: "Impulse purchases, snap decisions, and sudden changes of plan add up over time in ways that are hard to see in any single moment.",
      dailyLifeLabel: "Day to day",
    },
    whyAdviceFails: [
      "\"Just pause and think\" assumes the pause is available on demand. For impulsivity, the whole issue is that the pause doesn't reliably show up on its own. Telling someone to use a gap that isn't there yet doesn't create it.",
      "What works is building the pause into the environment itself, so it doesn't depend on remembering to use it in the moment.",
    ],
  },
  paralysis: {
    intro: "You know exactly what needs to happen, and you still don't start it. Tasks without a deadline breathing down your neck can sit untouched for weeks. The harder it gets to start, the more a strange kind of relief shows up once it's officially too late.",
    why: [
      "Task paralysis is less about the task and more about activation, the brain's system for actually getting moving. In ADHD, that system responds more reliably to urgency or novelty than to importance on its own, so a task that matters but isn't urgent or interesting doesn't reliably trigger the \"go\" signal.",
      "This is tied to the same dopamine-linked circuits involved in motivation generally. A task has to clear a higher bar before it registers as worth starting right now, rather than later. \"Later\" just never quite arrives until a deadline forces it to.",
    ],
    whySignOfADHD: [
      "Struggling to start isn't a willpower problem layered on top of ADHD. Difficulty with task initiation is one of the condition's most consistently described features, closely tied to the same motivation and reward circuitry researchers study in ADHD.",
      "What makes it a meaningful signal is the pattern: paralysis on tasks you genuinely want to do, not just ones you're avoiding because you dislike them, and a pattern of deadlines being the only thing that reliably gets you moving.",
      "Procrastinating sometimes doesn't mean you have ADHD. Almost everyone puts things off. But when starting is consistently the hardest part, regardless of how much the task matters to you, and it shows up alongside other patterns like time blindness or overload, it's worth paying attention to.",
    ],
    examples: [
      "You know exactly what needs to happen and still don't start it",
      "You'll do almost anything else, including other chores, to avoid the one thing on the list",
      "You only ever finish things the night before they're due",
      "A task with no clear first step leaves you stuck, even when it's small",
      "You rewrite the same to-do item across several lists without ever doing it",
      "A task becoming impossible to start on time brings a strange flash of relief",
    ],
    contextsHeader: "The Consequences",
    contexts: {
      work: "Tasks without a hard deadline or an obvious first step are the ones most likely to sit untouched for weeks, no matter how important they are.",
      relationships: "Promising to handle something and then stalling on it can look like avoidance, when it's really a stuck starting gear, not a lack of care.",
      dailyLife: "Household tasks with no natural trigger, the ones nobody's waiting on, are often the last to get done, no matter how small they actually are.",
      dailyLifeLabel: "Day to day",
    },
    whyAdviceFails: [
      "\"Just start\" treats starting like a decision you make once you're ready. For task paralysis, readiness is exactly what doesn't reliably show up. Waiting for it to arrive on its own can mean waiting indefinitely.",
      "What works is manufacturing the conditions that trigger starting, deadlines, novelty, accountability, on purpose, instead of waiting for motivation to arrive first.",
    ],
  },
  emotion: {
    intro: "Your reactions can feel bigger than the moment calls for, and they take longer to settle than you'd expect. A small frustration can turn into something that lingers for hours. By the time you've calmed down, the thing that set it off is usually long over.",
    why: [
      "Emotional dysregulation is linked to how the prefrontal cortex and the brain's emotional centers communicate. The prefrontal cortex normally helps turn the emotional \"volume\" back down once a feeling has registered. In ADHD, that connection runs less reliably, so the feeling itself isn't exaggerated, but the system that would dial it back down responds more slowly.",
      "This is the same regulation system involved in impulse control and attention, which is part of why emotional reactivity tends to travel alongside those other patterns rather than showing up completely on its own.",
    ],
    whySignOfADHD: [
      "Emotional reactivity isn't a personality trait sitting beside ADHD. Difficulty with emotional regulation is increasingly recognized as a core feature of the condition, not just a downstream consequence of struggling with other things.",
      "What makes it a meaningful signal is the pattern: reactions that have felt \"too big\" for as long as you can remember, across different relationships and settings, and a recovery time that consistently runs longer than it seems to for people around you.",
      "Strong emotions on their own don't mean you have ADHD. Plenty of things affect how intensely people feel things. But when it's a lifelong pattern that shows up alongside things like impulsivity or trouble focusing, it's worth paying attention to.",
    ],
    examples: [
      "A small frustration turns into a reaction that feels bigger than the moment calls for",
      "You replay an embarrassing or hurtful moment for hours after it's long over",
      "You can go from calm to overwhelmed with very little warning",
      "Feedback lands harder than it was probably meant to",
      "You need real time alone to recover after a stressful interaction, even a short one",
    ],
    contextsHeader: "The Consequences",
    contexts: {
      work: "Feedback or criticism can land harder and linger longer than it was meant to, even when you know logically it wasn't a big deal.",
      relationships: "A reaction that feels proportional in the moment can look like \"too much\" to someone else, adding a layer of self-consciousness on top of the original feeling.",
      dailyLife: "Small daily frustrations, a dropped item, a slow line, a typo, can trigger a reaction sized for something much bigger.",
      dailyLifeLabel: "Day to day",
    },
    whyAdviceFails: [
      "\"Just calm down\" assumes calming down is a switch you can flip on command. For emotional dysregulation, the system that does the calming is exactly what's running slower. Telling it to hurry up doesn't make it faster.",
      "What works is building in real recovery time after a reaction, instead of expecting yourself to snap back to baseline immediately.",
    ],
  },
};

export function renderLegacyResults(state) {
  const report = state.buildResultsReport();
  const pattern = report.pattern;
  const primaryPct = pattern.pcts[pattern.primary];
  const primaryTerm = state.PATTERN_LABELS[pattern.primary];
  const strength = primaryPct >= 70 ? 'strong' : 'some';
  // Short subtitle only: how this result relates to ADHD, nothing more —
  // worded to never use the literal "signs of ADHD" phrase (names the
  // specific pattern instead, same rule the rest of this page's copy
  // follows). The actual depth lives in the expandable row below.
  const commonalityNote = `${capitalize(primaryTerm)} is one of the most common patterns people associate with ADHD. You're far from alone in this.`;
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
              const dailyLifeLabel = context.dailyLifeLabel || 'Daily life';
              return `
              <details class="result-trait-row">
                <summary style="list-style:none; cursor:pointer;">
                  ${bar}
                  <div class="field-label" style="display:flex; align-items:center; gap:4px; margin-top:9px;">
                    <i data-lucide="chevron-down" width="14" height="14"></i>
                    <span>Tap to see what this means</span>
                  </div>
                </summary>

                <p class="result-trait-copy" style="margin-top:12px;">${escapeHtml(deepDive.intro || state.PATTERN_DESCRIPTIONS[p.key])}</p>

                <p class="field-label" style="margin-top:14px;">Why this happens</p>
                ${deepDive.why.map((para) => `<p class="result-trait-copy">${escapeHtml(para)}</p>`).join('')}

                ${deepDive.whySignOfADHD ? `
                <p class="field-label" style="margin-top:14px;">Why it's a strong sign of ADHD</p>
                ${deepDive.whySignOfADHD.map((para) => `<p class="result-trait-copy">${escapeHtml(para)}</p>`).join('')}
                ` : ''}

                <p class="field-label" style="margin-top:14px;">Common signs</p>
                ${deepDive.examples.map((ex) => `<p class="result-trait-copy">• ${escapeHtml(ex)}</p>`).join('')}

                <p class="field-label" style="margin-top:14px;">${escapeHtml(deepDive.contextsHeader || 'Where this tends to show up')}</p>
                <p class="result-trait-copy">• <strong>Work:</strong> ${escapeHtml(context.work)}</p>
                <p class="result-trait-copy">• <strong>Relationships:</strong> ${escapeHtml(context.relationships)}</p>
                <p class="result-trait-copy">• <strong>${escapeHtml(dailyLifeLabel)}:</strong> ${escapeHtml(context.dailyLife)}</p>

                ${deepDive.whyAdviceFails ? `
                <p class="field-label" style="margin-top:14px;">Why the usual advice doesn't work</p>
                ${deepDive.whyAdviceFails.map((para) => `<p class="result-trait-copy">${escapeHtml(para)}</p>`).join('')}
                ` : ''}

                ${deepDive.tips ? `
                <p class="field-label" style="margin-top:14px;">What tends to help</p>
                ${deepDive.tips.map((tip) => `<p class="result-trait-copy">• ${escapeHtml(tip)}</p>`).join('')}
                ` : ''}

                ${deepDive.closing ? `<p class="result-trait-copy" style="margin-top:14px;">${escapeHtml(deepDive.closing)}</p>` : ''}
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
