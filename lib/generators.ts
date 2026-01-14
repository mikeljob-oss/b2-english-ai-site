import crypto from "crypto";
import type { GrammarExercise, WritingTask, WritingFeedback } from "./schemas";
function id(prefix: string): string {
  return prefix + "_" + crypto.randomBytes(10).toString("hex");
}
const TAG_TIPS: Record<string, string> = {
  articles: "Check first mention vs. specific reference, and singular countable nouns.",
  prepositions: "Learn common collocations (depend on, interested in, responsible for) and fixed phrases.",
  narrative_tenses: "Use past perfect for earlier past actions and keep tense consistency within a paragraph.",
  conditionals: "Choose the conditional based on time/likelihood (0/1/2/3) and keep verb forms consistent.",
  modals: "Use modals for deduction and advice (must/can’t/might; should/ought to).",
  relative_clauses: "Use defining vs non-defining clauses appropriately; punctuate non-defining clauses.",
  passive: "Use passive when the doer is unknown/unimportant; keep tense correct (is done / was done / has been done).",
  reported_speech: "Backshift when needed and adjust time expressions (today → that day).",
  linkers: "Use a range of linkers (however, therefore, whereas) and avoid repeating the same ones."
  ,
  // Additional tags for demo grammar exercises
  verb_patterns: "Use gerunds or infinitives appropriately after verbs (e.g., suggest + gerund, decide + to-infinitive).",
  comparatives: "Use comparatives and superlatives correctly; use 'the most' for the superlative of long adjectives.",
  inversion: "Invert the auxiliary and subject after negative adverbials for emphasis (e.g., 'Not until...' 'Rarely have...').",
  quantifiers: "Use 'many/few' with countable nouns and 'much/little' with uncountable nouns.",
  time_expressions: "After 'it’s high/about time' use a past simple verb to talk about the present.",
  present_perfect: "Use present perfect for actions that started in the past and continue to the present or when the time is not specified.",
  word_order: "In indirect questions, use statement word order (e.g., 'Do you know where the station is?')."
};
export function demoGrammarExercise(topic: string, count: number): GrammarExercise {
  // Define a richer set of demo templates with pre-defined correct answers, rationales and tags.
  type Template = {
    type: "mcq" | "gap_fill" | "sentence_transformation" | "error_correction";
    prompt: string;
    options?: string[];
    note?: string;
    correct: string;
    rationale: string;
    tag: string;
  };
  const templates: Template[] = [
    // Original demo items
    {
      type: "mcq",
      prompt: "By the time we arrived, the film ___.",
      options: ["started", "had started", "has started", "was starting"],
      correct: "had started",
      rationale: "Past perfect shows the earlier action happened before we arrived.",
      tag: "narrative_tenses",
    },
    {
      type: "gap_fill",
      prompt: "If I ____ about the traffic, I would have left earlier.",
      note: "Complete the conditional sentence.",
      correct: "had known",
      rationale: "Third conditional uses past perfect in the if-clause.",
      tag: "conditionals",
    },
    {
      type: "sentence_transformation",
      prompt: "Rewrite using the word given: 'Despite being tired, she finished the report.' (ALTHOUGH)",
      note: "Use 4–8 words.",
      correct: "Although she was tired, she finished the report.",
      rationale: "Use ‘although’ to introduce the contrast clause.",
      tag: "linkers",
    },
    {
      type: "error_correction",
      prompt: "Correct the sentence: 'I have been to London last year.'",
      note: "Fix the tense/time expression.",
      correct: "I went to London last year.",
      rationale: "A finished time in the past (‘last year’) takes past simple, not present perfect.",
      tag: "narrative_tenses",
    },
    {
      type: "mcq",
      prompt: "You ____ have told me earlier; now it’s too late to change the booking.",
      options: ["must", "should", "can", "might"],
      correct: "should",
      rationale: "‘Should have’ expresses criticism about a past action.",
      tag: "modals",
    },
    // Additional demo items to provide variety
    {
      type: "mcq",
      prompt: "I wish I ____ so much coffee last night; I couldn't sleep.",
      options: ["didn't drink", "haven't drunk", "hadn't drunk", "won't drink"],
      correct: "hadn't drunk",
      rationale: "Use past perfect after 'wish' to express regret about a past action.",
      tag: "narrative_tenses",
    },
    {
      type: "gap_fill",
      prompt: "She would have come to the party if she ____ (know) you were there.",
      note: "Complete the conditional sentence.",
      correct: "had known",
      rationale: "Third conditional uses past perfect in the if-clause.",
      tag: "conditionals",
    },
    {
      type: "error_correction",
      prompt: "Correct the sentence: 'They suggested to go by train.'",
      note: "Fix the verb pattern.",
      correct: "They suggested going by train.",
      rationale: "Use a gerund after ‘suggest’ rather than an infinitive.",
      tag: "verb_patterns",
    },
    {
      type: "sentence_transformation",
      prompt: "Rewrite using the word given: 'I haven't seen a film as exciting as this in years.' (MOST)",
      note: "Use 5–9 words.",
      correct: "This is the most exciting film I have seen in years.",
      rationale: "Use the superlative form 'the most exciting' with present perfect to express experience.",
      tag: "comparatives",
    },
    {
      type: "mcq",
      prompt: "He ____ be French because he hardly speaks any French.",
      options: ["can't", "mustn't", "might", "shouldn't"],
      correct: "can't",
      rationale: "'Can't' expresses deduction that something is impossible.",
      tag: "modals",
    },
    {
      type: "gap_fill",
      prompt: "Not until I reached the station ____ that I'd left my wallet at home.",
      note: "Use inversion.",
      correct: "did I realise",
      rationale: "After 'Not until', invert the auxiliary and subject (did I realise).",
      tag: "inversion",
    },
    {
      type: "error_correction",
      prompt: "Correct the sentence: 'There were too much people in the concert.'",
      note: "Check quantifiers.",
      correct: "There were too many people at the concert.",
      rationale: "Use 'many' with countable nouns and preposition 'at' for events.",
      tag: "quantifiers",
    },
    {
      type: "sentence_transformation",
      prompt: "Rewrite using the word given: 'Although he was tired, he went to work.' (IN SPITE OF)",
      note: "Use 5–8 words.",
      correct: "In spite of being tired, he went to work.",
      rationale: "Use 'in spite of' followed by a gerund or noun.",
      tag: "linkers",
    },
    {
      type: "mcq",
      prompt: "If I'd known about the exam, I ____ harder.",
      options: ["would have studied", "will have studied", "would study", "will study"],
      correct: "would have studied",
      rationale: "Third conditional uses 'would have' + past participle in the result clause.",
      tag: "conditionals",
    },
    {
      type: "gap_fill",
      prompt: "It's high time you ____ to bed.",
      note: "Use the correct verb form.",
      correct: "went",
      rationale: "After 'it's high time', use past simple to suggest an action in the present.",
      tag: "time_expressions",
    },
  ];
  // Shuffle templates and select up to 'count' unique items
  const shuffled = templates
    .map((t) => ({ sort: Math.random(), value: t }))
    .sort((a, b) => a.sort - b.sort)
    .map((t) => t.value);
  const selected: Template[] = [];
  for (let i = 0; i < count; i++) {
    selected.push(shuffled[i % shuffled.length]);
  }
  // Create final items and answer key from selected templates
  const finalItems: any[] = selected.map((tpl) => {
    return {
      item_id: id("i"),
      type: tpl.type,
      prompt: tpl.prompt,
      options: tpl.options,
      note: tpl.note,
    };
  });
  const key = finalItems.map((it, index) => {
    const tpl = selected[index];
    return {
      item_id: it.item_id,
      correct_answer: tpl.correct,
      rationale: tpl.rationale,
      tag: tpl.tag,
    };
  });
  return {
    meta: {
      level: "B2",
      topic: topic === "random" ? "general" : topic,
      item_types: ["mcq", "gap_fill", "sentence_transformation", "error_correction"],
    },
    student_view: {
      title: "B2 Grammar Mix",
      instructions: "Complete all items. Submit to see answers and feedback.",
      items: finalItems,
    },
    answer_key: key,
  };
}
export function demoWritingTask(topic: string): { task: WritingTask; rubric: any } {
  const task: WritingTask = {
    task_id: id("wt"),
    level: "B2",
    genre: "email",
    title: "Formal email: complaint",
    prompt:
      "You recently stayed at a hotel and were unhappy with the service. Write a formal email to the manager.\n\n" +
      "Include:\n" +
      "- what went wrong (give 2–3 details)\n" +
      "- how it affected your stay\n" +
      "- what solution you expect (refund, apology, future discount)\n\n" +
      "Write 180–220 words.",
    word_range: { min: 180, max: 220 }
  };
  const rubric = {
    content: "Covers all bullet points with relevant detail.",
    communicative_achievement: "Appropriate formal register and clear purpose.",
    organisation: "Clear paragraphs and cohesive linkers.",
    language: "Range of B2 grammar and vocabulary with acceptable accuracy."
  };
  return { task, rubric };
}
export function demoWritingFeedback(text: string): WritingFeedback {
  const issues: WritingFeedback["targeted_corrections"] = [];
  if (text.toLowerCase().includes("really")) {
    issues.push({ quote: "really", issue: "register", better: "consider a more formal alternative (e.g., 'particularly')" });
  }
  if (text.toLowerCase().includes("wanna")) {
    issues.push({ quote: "wanna", issue: "register", better: "want to" });
  }
  const detected = ["organisation", "register"];
  return {
    rubric: {
      content: { band: "B2", evidence: "You address the purpose and provide some details." },
      communicative_achievement: { band: "B2-", evidence: "Mostly formal, but some informal wording appears." },
      organisation: { band: "B2", evidence: "Paragraphing is clear and ideas are easy to follow." },
      language: { band: "B2-", evidence: "Good range, with some preposition/article slips." }
    },
    priority_actions: [
      "Keep the tone consistently formal throughout.",
      "Add 1–2 stronger linkers (However, Therefore, As a result).",
      "Check articles with singular countable nouns (a/the)."
    ],
    targeted_corrections: issues.slice(0, 8),
    one_paragraph_improved_example:
      "I would appreciate a full refund, as the service did not match what was advertised and it significantly affected my stay. " +
      "In particular, the room was not cleaned on two occasions and the noise at night prevented me from resting properly.",
    personalised_next_step: "Rewrite your opening paragraph aiming for a fully formal tone and 2 clear details.",
    detected_tags: detected
  };
}
export function tipForTag(tag: string): string {
  return TAG_TIPS[tag] ?? "Focus on accuracy first, then expand your range.";
}
