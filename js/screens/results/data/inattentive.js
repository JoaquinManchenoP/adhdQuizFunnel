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
    // hook: currently unused by template.js (dead field), kept in sync
    // with the reference's own hero subtitle anyway for consistency.
    hook: "A closer look at your daily habits, work, growth, and relationships.",
    // body: verbatim from the reference file's #overview intro (4 paragraphs).
    body: [
      "With inattentive ADHD, your attention may not always follow your intentions. ADHD is a neurodevelopmental condition, meaning it involves how the brain develops and works, and genes play a strong role. In this presentation, difficulties with attention and organization are more prominent than hyperactivity. You may appear quiet while your mind moves between thoughts, surrounding activity, and the task in front of you.",
      "Your interest can make a noticeable difference in how you approach everyday life. An engaging subject may hold your attention, while a simple responsibility takes repeated effort to begin. You can understand what needs to happen and still struggle to act. Recognizing this pattern helps you identify where clearer instructions, smaller steps, or outside support could make a difference.",
      "Daily responsibilities can require more effort than others see. Remembering appointments, keeping track of belongings, and finishing tasks may each demand your full attention. When several demands arrive together, you can lose track of something important despite trying hard to stay organized. Keeping information somewhere visible can reduce how much you need to remember at once.",
      "Your experience is individual. Inattentive ADHD does not determine your personality, interests, or abilities. Understanding how it affects you gives you a practical starting point for choosing helpful routines, communicating your needs, and making plans that fit your daily life.",
    ],
  },

  areas: {
    // hook: verbatim from the reference file's #attention section intro.
    hook: "Inattentive ADHD can affect several parts of daily life. You may find some of these areas much harder than others. Use them to notice patterns in your experience rather than judge your abilities.",
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
    // hook + strengths/challenges: verbatim from the reference file's
    // #career section (its 2 intro paragraphs, then its "Your
    // Strengths"/"Your Weaknesses" cards — title+paragraph combined per
    // item since this schema's arrays are flat strings, no title field).
    hook: "At work, clear expectations can make a considerable difference. You may find it easier to make progress when you know what matters most, what a finished task should look like, and when it is due. Broad instructions and constantly changing priorities can leave you spending more time deciding what to do than doing it. Your career choices should reflect your interests and skills. Inattentive ADHD does not point to one ideal profession. A role that suits you will also need working conditions that help you manage attention, deadlines, and routine responsibilities.",
    strengths: [
      "Knowledge in Your Interests: Subjects that hold your attention may lead you to develop valuable knowledge. Look for opportunities to apply what you already enjoy learning.",
      "Awareness of Helpful Conditions: Knowing when and where you work well can help you plan demanding tasks more effectively.",
      "Practical Experience: Methods you have developed to manage your own difficulties may also help you simplify confusing tasks or processes.",
      "Clear Communication: Explaining what you need can prevent avoidable mistakes. Asking for written priorities or an example of the expected result gives everyone a clearer starting point.",
    ],
    challenges: [
      "Routine Administration: Forms, expenses, and email can pile up while more engaging work holds your attention. Give these tasks a regular place in your schedule.",
      "Unclear Assignments: A large task without defined steps can be difficult to begin. Agree on the first milestone before starting.",
      "Frequent Interruptions: Each interruption can make it harder to return to your original task. Leave yourself a brief note about what comes next.",
      "Final Details: You may complete the main work and overlook the last check or submission. Include those steps in your task list.",
      "Taking On Too Much: Several interesting projects can quickly become competing demands. Check your existing commitments before accepting another.",
    ],
    locked_first_line: "A job title tells you less than a clear picture of an ordinary working day.",
  },

  daily: {
    // hook + strengths/challenges: verbatim from the reference file's
    // #growth section (its 2 intro paragraphs, then its first
    // comparison's "Your Strengths"/"Your Weaknesses" cards).
    hook: "Personal growth starts with understanding where your effort is going. You may spend considerable energy remembering tasks, recovering from distractions, or worrying about unfinished work. Noticing these patterns helps you choose a specific problem to address. Small changes are easier to assess and adjust. Try one reminder, one clearer routine, or one simpler way to begin a recurring task. Keep what helps and change what adds unnecessary work.",
    strengths: [
      "Knowing Yourself: Recognize the situations in which you need more time, clearer information, or fewer distractions.",
      "Asking for Support: Describe the difficulty clearly enough that someone can help with the actual problem.",
      "Setting Realistic Goals: Plan around the time and energy you have available.",
      "Noticing Progress: Look for improvements in daily life, such as fewer missed appointments or less time spent finding things.",
      "Returning After a Disruption: Make it easy to restart a useful habit after a difficult day.",
    ],
    challenges: [
      "Changing Everything at Once: Several new routines can become another set of responsibilities. Begin with the change most likely to help.",
      "Waiting for Motivation: A task may remain important even when it feels uninteresting. Prepare a small starting step in advance.",
      "Making Plans Too Complicated: A detailed system is only useful if you can keep using it.",
      "Judging Yourself by One Day: An unusually productive or difficult day gives you only part of the picture.",
      "Avoiding an Overdue Task: The longer a task waits, the harder it may feel to face. Start by checking what is still needed.",
    ],
    locked_first_line: "Systems fix this faster than willpower does.",
  },

  relationships: {
    // hook + strengths/challenges: verbatim from the reference file's
    // #relationships section (its 2 intro paragraphs, then its first
    // comparison's "Your Strengths"/"Your Weaknesses" cards).
    hook: "Inattentive ADHD can affect how you listen, remember plans, and keep in touch. You may care about someone and still forget to reply or lose track of a conversation. Other people may see the missed message or forgotten detail without seeing the effort behind it. Clear communication helps both of you understand what is happening. Explain the difficulties you notice, ask what the other person needs, and agree on practical ways to manage shared responsibilities. Understanding the reason for a problem is most useful when it leads to a workable change.",
    strengths: [
      "Honesty About Your Needs: Explaining when you are distracted or overwhelmed helps others understand your behavior.",
      "Interest in Shared Activities: Spending time doing something you both enjoy gives you a natural way to connect.",
      "Willingness to Repair Mistakes: Acknowledging a missed commitment and taking action can help rebuild trust.",
      "Attention to What Works: Remember the habits that help you stay connected and make them easier to repeat.",
    ],
    challenges: [
      "Forgotten Replies: You may read a message, intend to answer, and then forget. A reminder can help you return to it.",
      "Missed Details: You may lose part of a conversation while thinking about something that was said earlier. Ask for clarification when you need it.",
      "Uneven Attention: Being absorbed in another activity can make you seem unavailable. Agree on times when you can give the conversation your attention.",
      "Unclear Responsibilities: A general plan to help more can leave both people frustrated. Decide who will do what and when.",
      "Avoiding Difficult Conversations: Worry about disappointing someone may lead you to delay speaking. Bringing up the problem earlier gives you more room to solve it.",
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
    // hook + body: verbatim from the reference file's #next section
    // (its closing band quote, then its final closing paragraph).
    hook: "Choose one difficulty that regularly affects your work, home life, or relationships. Look at when it happens, what gets in the way, and what would make the next step easier. Start with a change small enough to use on an ordinary day.",
    body: [
      "Your understanding becomes useful when it changes how you plan, ask for help, or respond to a problem. Over time, those decisions can make daily responsibilities easier to manage and leave more room for your interests and goals.",
    ],
    locked_first_line: "A good assessment looks at your whole life, not just today.",
  },
};
