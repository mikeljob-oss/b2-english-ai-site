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
};
export function demoGrammarExercise(topic: string, count: number): GrammarExercise {
  const items = [
    {
      item_id: id("i"),
      type: "mcq" as const,
      prompt: "By the time we arrived, the film ___.",
      options: ["started", "had started", "has started", "was starting"]
    },
    {
      item_id: id("i"),
      type: "gap_fill" as const,
      prompt: "If I ____ about the traffic, I would have left earlier.",
      note: "Complete the conditional sentence."
    },
    {
      item_id: id("i"),
      type: "sentence_transformation" as const,
      prompt: "Rewrite using the word given: 'Despite being tired, she finished the report.' (ALTHOUGH)",
      note: "Use 4–8 words."
    },
    {
      item_id: id("i"),
      type: "error_correction" as const,
      prompt: "Correct the sentence: 'I have been to London last year.'",
      note: "Fix the tense/time expression."
    },
    {
      item_id: id("i"),
      type: "mcq" as const,
      prompt: "You ____ have told me earlier; now it’s too late to change the booking.",
      options: ["must", "should", "can", "might"]
    }
  ];
  // Repeat with variations to reach count
  const expanded = [];
  for (let k = 0; k < count; k++) expanded.push(items[k % items.length]);
  const finalItems = expanded.map((it, idx) => ({ ...it, item_id: it.item_id + "_" + idx }));
  const key = finalItems.map((it) => {
    if (it.type === "mcq") {
      const correct = it.prompt.includes("film") ? "had started" : "should";
      return {
        item_id: it.item_id,
        correct_answer: correct,
        rationale: it.prompt.includes("film")
          ? "Past perfect shows the earlier action happened before we arrived."
          : "‘Should have’ expresses criticism about a past action.",
        tag: it.prompt.includes("film") ? "narrative_tenses" : "modals"
      };
    }
    if (it.type === "gap_fill") {
      return {
        item_id: it.item_id,
        correct_answer: "had known",
        rationale: "Third conditional uses past perfect in the if-clause.",
        tag: "conditionals"
      };
    }
    if (it.type === "sentence_transformation") {
      return {
        item_id: it.item_id,
        correct_answer: "Although she was tired, she finished the report.",
        rationale: "Use ‘although’ to introduce the contrast clause.",
        tag: "linkers"
      };
    }
    return {
      item_id: it.item_id,
      correct_answer: "I went to London last year.",
      rationale: "A finished time in the past (‘last year’) takes past simple, not present perfect.",
      tag: "narrative_tenses"
    };
  });
  return {
    meta: { level: "B2", topic: topic === "random" ? "general" : topic, item_types: ["mcq", "gap_fill", "sentence_transformation", "error_correction"] },
    student_view: {
      title: "B2 Grammar Mix",
      instructions: "Complete all items. Submit to see answers and feedback.",
      items: finalItems
    },
    answer_key: key
  };
}
export function demoWritingTask(topic: string): { task: WritingTask; rubric: any } {
  const task: WritingTask = {
    task_id: id("wt"),
    level: "B2",
    genre: "email",
    title: "Formal email: complaint",
    prompt:
      "You recently stayed at a hotel and were unhappy with the service. Write a formal email to the manager.

" +
      "Include:
" +
      "• what went wrong (give 2–3 details)
" +
      "• how it affected your stay
" +
      "• what solution you expect (refund, apology, future discount)

" +
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
