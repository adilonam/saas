import type { EqDomain, EqQuestion, ScenarioQuestion } from "./types";

/** Scenario MCQ — scored via answer-key.json using questionNumber. */
function scenarioQ(
  n: number,
  domain: EqDomain,
  question: string,
  options: [string, string, string, string],
): ScenarioQuestion {
  return {
    type: "scenario",
    id: `eq${String(n).padStart(2, "0")}`,
    questionNumber: n,
    domain,
    question,
    options,
  };
}

export const EQ_TEST_QUESTIONS: EqQuestion[] = [
  scenarioQ(
    1,
    "self_awareness",
    "After a meeting, you notice you feel unusually tense but are not sure why. What do you do first?",
    [
      "Ignore it and move on to the next task",
      "Blame a colleague for making the meeting difficult",
      "Pause and name the emotion and what may have triggered it",
      "Vent immediately to the first person you see",
    ],
  ),
  scenarioQ(
    2,
    "empathy",
    "A teammate seems quieter than usual and makes a small mistake. How do you respond?",
    [
      "Call out the mistake in front of the group so it is fixed quickly",
      "Ask privately if they are okay and offer help with the task",
      "Assume they are lazy and stop relying on them",
      "Ignore it completely — it is not your problem",
    ],
  ),
  scenarioQ(
    3,
    "self_regulation",
    "You receive critical feedback that feels unfair. Your first impulse is to reply defensively. What is the most emotionally intelligent next step?",
    [
      "Send a detailed rebuttal immediately",
      "Wait, cool down, then ask clarifying questions before responding",
      "Share the feedback publicly to get others on your side",
      "Stop engaging with that person entirely",
    ],
  ),
  scenarioQ(
    4,
    "social_skills",
    "Two colleagues disagree sharply in a group chat. How do you help?",
    [
      "Pick a side and argue publicly",
      "Joke about the conflict to lighten the mood",
      "Suggest a short sync to clarify goals and next steps",
      "Leave the chat and hope it resolves itself",
    ],
  ),
  scenarioQ(
    5,
    "motivation",
    "A long project stalls and progress feels invisible. What keeps you moving?",
    [
      "Wait until motivation returns on its own",
      "Break the work into smaller wins and track progress weekly",
      "Complain about the lack of recognition",
      "Switch to easier tasks and abandon the project",
    ],
  ),
  scenarioQ(
    6,
    "self_awareness",
    "People often say you interrupt in discussions. How do you take that in?",
    [
      "Deny it — you are just efficient",
      "Ask for a specific example and notice your own patterns",
      "Get offended and withdraw from meetings",
      "Interrupt even more to prove a point",
    ],
  ),
  {
    type: "checkpoint",
    id: "c01",
    title: "Nice start!",
    message:
      "You are building a clear picture of how you notice emotions, respond under pressure, and relate to others. Keep going.",
    highlight: "Self-awareness & empathy underway",
  },
  scenarioQ(
    7,
    "empathy",
    "A friend cancels plans last-minute, sounding stressed. What do you do?",
    [
      "Tell them they are unreliable",
      "Ghost them for a few days",
      "Acknowledge the stress and offer a flexible alternative",
      "Demand an immediate reschedule",
    ],
  ),
  scenarioQ(
    8,
    "self_regulation",
    "During a heated argument, your heart races and your voice rises. What helps most?",
    [
      "Raise your voice further so you are heard",
      "Take a brief pause, breathe, and lower your volume",
      "Walk out without saying anything",
      "Bring up unrelated past grievances",
    ],
  ),
  scenarioQ(
    9,
    "social_skills",
    "You need to give difficult feedback to someone you like. Best approach?",
    [
      "Avoid the topic to protect the relationship",
      "Be direct about the behavior, specific about impact, and open to their view",
      "Send a blunt message without context",
      "Tell others first so the person hears it indirectly",
    ],
  ),
  scenarioQ(
    10,
    "motivation",
    "You set a learning goal but keep postponing practice. What works better?",
    [
      "Rely on willpower alone when you feel like it",
      "Schedule short, recurring practice blocks and remove one friction point",
      "Quit because consistency is not realistic",
      "Only practice when others are watching",
    ],
  ),
  scenarioQ(
    11,
    "self_awareness",
    "You notice a recurring pattern: praise makes you uncomfortable. What is a useful response?",
    [
      "Deflect every compliment with a joke",
      "Explore why praise feels hard and practice receiving it briefly",
      "Reject praise and criticize yourself harder",
      "Seek constant validation to compensate",
    ],
  ),
  scenarioQ(
    12,
    "empathy",
    "A coworker from another culture expresses disagreement differently than you expect. What do you do?",
    [
      "Assume they are being rude",
      "Correct their style immediately",
      "Ask curious questions to understand their intent and norms",
      "Avoid working with them again",
    ],
  ),
  {
    type: "checkpoint",
    id: "c02",
    title: "Halfway there!",
    message:
      "Your answers are shaping a profile across empathy, regulation, and social skill. Stay honest — there are no trick questions.",
    highlight: "Strong reflection so far",
  },
  scenarioQ(
    13,
    "self_regulation",
    "You are tempted to check your phone repeatedly during a stressful wait. What shows better regulation?",
    [
      "Refresh social media until the wait ends",
      "Use a short grounding routine and limit checks to set times",
      "Snap at anyone nearby",
      "Make impulsive decisions just to feel in control",
    ],
  ),
  scenarioQ(
    14,
    "social_skills",
    "A new teammate seems left out in meetings. How do you include them?",
    [
      "Let them figure it out alone",
      "Invite their input on a topic they know and introduce them to one ally",
      "Speak for them without asking",
      "Only include them when the manager is watching",
    ],
  ),
  scenarioQ(
    15,
    "motivation",
    "You miss a personal deadline. What is the most constructive reaction?",
    [
      "Shame yourself for days",
      "Review what blocked you, adjust the plan, and restart with a smaller step",
      "Pretend the goal never mattered",
      "Blame external factors and change nothing",
    ],
  ),
  scenarioQ(
    16,
    "self_awareness",
    "Under pressure, you tend to become overly controlling. How do you handle that insight?",
    [
      "Deny it because control keeps standards high",
      "Name the trigger early and deliberately share ownership of decisions",
      "Double down on micromanaging",
      "Avoid leadership roles forever",
    ],
  ),
  scenarioQ(
    17,
    "empathy",
    "Someone shares that they feel overlooked at work. What response shows empathy?",
    [
      "Tell them to toughen up",
      "Immediately pitch solutions without listening",
      "Reflect what you heard and ask what support would help",
      "Compare their situation to your harder story",
    ],
  ),
  scenarioQ(
    18,
    "self_regulation",
    "You are about to send an angry email. What is wisest?",
    [
      "Send it — authenticity matters most",
      "Draft it, wait, then revise for clarity and respect",
      "CC leadership to escalate pressure",
      "Post about it on social media instead",
    ],
  ),
  {
    type: "checkpoint",
    id: "c03",
    title: "Almost done!",
    message:
      "A few more scenarios and your emotional intelligence profile will be ready to score.",
    highlight: "Final stretch",
  },
  scenarioQ(
    19,
    "social_skills",
    "You disagree with a decision but the team has already aligned. Best move?",
    [
      "Sabotage quietly so people see you were right",
      "Raise remaining concerns briefly, then support the agreed path",
      "Refuse to participate",
      "Complain only after it fails",
    ],
  ),
  scenarioQ(
    20,
    "motivation",
    "Recognition is delayed even though you delivered well. How do you stay motivated?",
    [
      "Stop contributing until praised",
      "Reconnect to your own standards and the impact of the work",
      "Undercut others who got recognition",
      "Only do the bare minimum going forward",
    ],
  ),
  scenarioQ(
    21,
    "self_awareness",
    "After conflict, you replay conversations for hours. What helps most?",
    [
      "Keep replaying until you feel justified",
      "Note what you felt, what you owned, and one learning — then stop ruminating",
      "Message everyone involved again immediately",
      "Numb out and never reflect",
    ],
  ),
  scenarioQ(
    22,
    "empathy",
    "A customer is frustrated and speaking harshly. What is the best first response?",
    [
      "Match their tone so they respect you",
      "Acknowledge the frustration, clarify the issue, then problem-solve",
      "Hang up or walk away without explanation",
      "Argue about who is right before helping",
    ],
  ),
  scenarioQ(
    23,
    "self_regulation",
    "You feel envy when a peer succeeds. Emotionally intelligent handling looks like:",
    [
      "Spreading doubt about their success",
      "Noticing the envy, congratulating them, and channeling energy into your goals",
      "Withdrawing friendship",
      "Pretending you do not care while sabotaging opportunities",
    ],
  ),
  scenarioQ(
    24,
    "social_skills",
    "A misunderstanding escalates between you and a peer. What rebuilds trust fastest?",
    [
      "Wait for them to apologize first",
      "Own your part, clarify intent, and agree on a repair",
      "Involve the whole team as judges",
      "Act as if nothing happened forever",
    ],
  ),
  scenarioQ(
    25,
    "motivation",
    "You want to improve a soft skill that feels awkward. How do you approach it?",
    [
      "Wait until it becomes natural without practice",
      "Practice in low-stakes settings and request specific feedback",
      "Only do it when forced",
      "Claim the skill does not matter",
    ],
  ),
  scenarioQ(
    26,
    "self_awareness",
    "You realize your mood is affecting how you interpret neutral messages. What do you do?",
    [
      "Reply based on your first emotional read",
      "Check your state, reread for alternate interpretations, then respond",
      "Assume people are against you",
      "Avoid all written communication",
    ],
  ),
  scenarioQ(
    27,
    "empathy",
    "A partner says they need space after a stressful week. How do you respond?",
    [
      "Take it as rejection and escalate",
      "Respect the request, confirm care, and set a time to reconnect",
      "Fill the space with constant check-ins",
      "Punish them by going silent for longer",
    ],
  ),
  scenarioQ(
    28,
    "social_skills",
    "In a negotiation, emotions rise on both sides. What keeps collaboration alive?",
    [
      "Push harder until they concede",
      "Name shared interests, slow the pace, and propose options",
      "Walk away mid-sentence",
      "Personalize the disagreement",
    ],
  ),
  scenarioQ(
    29,
    "self_regulation",
    "You are exhausted and irritable before an important conversation. Best preparation?",
    [
      "Power through without adjusting",
      "Rest briefly, set an intention, and postpone if you cannot be constructive",
      "Have the talk while distracted by other tasks",
      "Use caffeine and intensity to dominate",
    ],
  ),
  scenarioQ(
    30,
    "motivation",
    "You finished a hard growth stretch. What sustains long-term emotional fitness?",
    [
      "Stop reflecting because you are done improving",
      "Celebrate progress and set the next small developmental habit",
      "Compare yourself harshly to others",
      "Only improve when crisis forces it",
    ],
  ),
  {
    type: "choice",
    id: "d01",
    question: "How old are you?",
    options: ["Under 18", "18–29", "30–44", "45–60", "60+"],
  },
];

export const EQ_TEST_TOTAL = EQ_TEST_QUESTIONS.length;

export const EQ_DOMAIN_LABELS: Record<EqDomain, string> = {
  self_awareness: "Self-awareness",
  self_regulation: "Self-regulation",
  empathy: "Empathy",
  social_skills: "Social skills",
  motivation: "Motivation",
};

export const EQ_DOMAIN_DESCRIPTIONS: Record<EqDomain, string> = {
  self_awareness:
    "Recognizing your emotions, triggers, and patterns in the moment",
  self_regulation:
    "Managing impulses and recovering constructively under stress",
  empathy: "Understanding others' feelings and perspectives with care",
  social_skills: "Navigating relationships, conflict, and collaboration",
  motivation: "Sustaining purpose, persistence, and growth-oriented drive",
};
