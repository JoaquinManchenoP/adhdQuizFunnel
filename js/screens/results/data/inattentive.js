/* ============================================================
   Results page — data file: inattentive type
   Structure/logic lives in js/screens/results/template.js; this file
   is content only. Adding hyperactive-impulsive or combined later
   means adding a sibling file in this same shape (see
   js/screens/results/template.js's SECTION_DEFS for what each field
   feeds) — no code changes.
   Schema per section: hook (required, rendered first) · body ·
   list_items · locked_first_line. Fixed verbatim copy (disclaimer,
   credibility line) lives in ../config.js. Locked HEADINGS are mostly
   identical across all 3 types per the spec table, so they're centralized
   in template.js's SECTION_DEFS (with {type} substitution where the
   table calls for it) rather than repeated in every type's data file —
   the one exception is `special.heading`, below, which is genuinely
   different wording per type, not a substitution.
   Content grounded in DSM-5's inattentive-presentation criteria and the
   well-documented under-diagnosis pattern for this type (quieter
   symptoms, no classroom disruption, lower historical diagnosis rate in
   girls/women). Kept short and plain on purpose — simple sentences,
   no clinical run-ons, no hedging filler.
   ============================================================ */

export const inattentiveData = {
  type: 'inattentive',
  typeLabel: 'Inattentive',

  hero: {
    hook: "This means your brain struggles to stay focused. It does not mean you can't sit still. You get distracted, forget things, and lose track of tasks.",
    body: [
      "Inattentive ADHD is one of three types in the DSM-5. The other two are hyperactive-impulsive and combined. This type is about losing focus, not about moving too much.",
      "It's quiet. It doesn't disrupt a room. That's why it gets missed, or mistaken for anxiety or depression. This page covers what it looks like and what helps.",
    ],
  },

  areas: {
    hook: "These 5 areas show why your result landed where it did.",
    tooltips: {
      time: "Losing track of time.",
      overload: "Struggling to juggle more than one thing at once.",
      impulsivity: "Acting before you think.",
      paralysis: "Trouble starting tasks that aren't urgent.",
      emotion: "Feelings that hit harder and last longer than they should.",
    },
    locked_first_line: "Your top two areas are usually connected.",
  },

  type_guide: {
    // Section id "type" — heading "What is the inattentive type of ADHD?"
    hook: "Inattentive ADHD is about what's missing. Focus, memory, follow-through. It is not about hyperactivity.",
    body: [
      "The DSM-5 lists 9 signs of inattention. You need at least 6: missing details, losing focus, not listening, not finishing tasks, poor organization, avoiding hard tasks, losing things, getting distracted, forgetting things. Hyperactivity isn't part of it.",
      "Hyperactive-impulsive ADHD is about acting before thinking. Inattentive ADHD is about losing track of what you're doing. Combined type is both.",
    ],
    list_items: [
      "You start a task focused, then lose the thread halfway through",
      "You were listening. You just didn't retain it",
      "You finish work late because you lost track of time, not because you put it off",
    ],
    locked_first_line: "This is the type that gets missed the most.",
  },

  special: {
    // Fixed per spec for this type (table's §4 row 5, inattentive column).
    heading: "Why you were overlooked",
    hook: "It's quiet. There's no behavior problem to notice.",
    body: [
      "Doctors and teachers were trained to spot disruption, like a kid who can't sit still. Inattentive symptoms don't look like that. A kid staring out the window just looks bored. Boys get diagnosed 2 to 3 times more than girls, partly because girls present as inattentive more often.",
    ],
    locked_first_line: "What got you overlooked as a kid is still costing you now.",
  },

  work: {
    hook: "At work, you do well on what interests you. You struggle with the rest.",
    strengths: [
      "You focus hard on work you find interesting",
      "You make unusual connections others miss",
      "You work well alone once you're actually started",
      "You spot the big picture while others miss it",
    ],
    challenges: [
      "Repetitive, detail-heavy work drains you fast",
      "You miss deadlines from losing track of time, not from laziness",
      "Multi-step instructions slip away unless you write them down right away",
      "Your performance looks inconsistent. Great some weeks, checked out others",
    ],
    locked_first_line: "The fix isn't trying harder. It's changing how the boring parts reach you.",
  },

  daily: {
    hook: "Day to day, time slips away and things get lost.",
    strengths: [
      "You can lose yourself in a hobby for hours",
      "You notice details others miss",
      "You do well with unstructured time",
      "You're curious about a lot of things",
    ],
    challenges: [
      "You forget bills and appointments. Not from carelessness. They just slipped your mind",
      "You lose your keys, phone, or paperwork almost every week",
      "A 20-minute task can take 2 hours with no idea why",
      "Having a plan for the day doesn't mean you follow it",
    ],
    locked_first_line: "Systems fix this faster than willpower does.",
  },

  relationships: {
    hook: "People read this as not caring. It's attention, not affection.",
    strengths: [
      "You're fully present once you're actually tuned in",
      "You pick up on how someone feels, even if you miss the details",
      "You're easygoing and rarely start conflict",
      "You're loyal, even when you're inconsistent",
    ],
    challenges: [
      "Forgetting what someone said reads as not listening",
      "You zone out mid-conversation, even when you're interested",
      "Being late reads as not caring, not as a time problem",
      "People get frustrated when you need things repeated",
    ],
    locked_first_line: "Explaining this type to someone close to you fixes most of this.",
  },

  emotions: {
    hook: "This type often comes with years of being told you're not trying hard enough.",
    list_items: [
      "\"I'm smart enough. I just can't make myself focus.\"",
      "\"People think I'm lazy. I'm just exhausted from trying to concentrate.\"",
      "\"I'm always a step behind, apologizing for something I forgot.\"",
      "\"Why can't I do the simple thing everyone else does easily?\"",
    ],
    locked_first_line: "This is a real pattern. Not a flaw, and not permanent.",
  },

  assessment: {
    hook: "Get checked if this pattern has followed you your whole life, shows up everywhere, and is wearing you down.",
    body: [
      "This type rarely causes problems early on, so most people reach adulthood before anyone checks. Often it's a bigger role, like college, a new job, or a kid, that finally overwhelms the coping habits that used to work. Only a real assessment can rule out anxiety, depression, or a thyroid issue, which can look similar.",
    ],
    locked_first_line: "A good assessment looks at your whole life, not just today.",
  },
};
