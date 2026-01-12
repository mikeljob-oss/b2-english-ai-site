import { z } from "zod";

export const GrammarItemSchema = z.discriminatedUnion("type", [
  z.object({
    item_id: z.string(),
    type: z.literal("mcq"),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6)
  }),
  z.object({
    item_id: z.string(),
    type: z.literal("gap_fill"),
    prompt: z.string().min(1),
    note: z.string().optional()
  }),
  z.object({
    item_id: z.string(),
    type: z.literal("sentence_transformation"),
    prompt: z.string().min(1),
    note: z.string().optional()
  }),
  z.object({
    item_id: z.string(),
    type: z.literal("error_correction"),
    prompt: z.string().min(1),
    note: z.string().optional()
  })
]);
export const GrammarExerciseSchema = z.object({
  meta: z.object({
    level: z.literal("B2"),
    topic: z.string(),
    item_types: z.array(z.enum(["mcq", "gap_fill", "sentence_transformation", "error_correction"]))
  }),
  student_view: z.object({
    title: z.string(),
    instructions: z.string(),
    items: z.array(GrammarItemSchema).min(1)
  }),
  answer_key: z.array(z.object({
    item_id: z.string(),
    correct_answer: z.string(),
    rationale: z.string(),
    tag: z.string()
  })).min(1)
});
export type GrammarExercise = z.infer<typeof GrammarExerciseSchema>;
export const WritingTaskSchema = z.object({
  task_id: z.string(),
  level: z.literal("B2"),
  genre: z.enum(["email", "essay", "report", "review"]),
  title: z.string(),
  prompt: z.string(),
  word_range: z.object({ min: z.number().int().min(50), max: z.number().int().min(60) })
});
export type WritingTask = z.infer<typeof WritingTaskSchema>;
export const WritingNewResponseSchema = z.object({
  task: WritingTaskSchema,
  rubric: z.object({
    content: z.string(),
    communicative_achievement: z.string(),
    organisation: z.string(),
    language: z.string()
  })
});
export const WritingFeedbackSchema = z.object({
  rubric: z.object({
    content: z.object({ band: z.string(), evidence: z.string() }),
    communicative_achievement: z.object({ band: z.string(), evidence: string() }),
    organisation: z.object({ band: z.string(), evidence: z.string() }),
    language: z.object({ band: z.string(), evidence: string() })
  }),
  priority_actions: z.array(z.string()).min(1).max(5),
  targeted_corrections: z.array(z.object({
    quote: z.string(),
    issue: z.string(),
    better: z.string()
  })).max(12),
  one_paragraph_improved_example: z.string(),
  personalised_next_step: z.string(),
  detected_tags: z.array(z.string()).max(6)
});
export type WritingFeedback = z.infer<typeof WritingFeedbackSchema>;
