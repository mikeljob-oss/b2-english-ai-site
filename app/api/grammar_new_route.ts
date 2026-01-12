import { NextResponse } from "next/server";
import { aiEnabled, callOpenAIJson } from "@/lib/openai";
import { demoGrammarExercise } from "@/lib/generators";
import { GrammarExerciseSchema } from "@/lib/schemas";
import { encryptJson } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body?.topic ?? "random");
    const count = Math.max(5, Math.min(15, Number(body?.count ?? 10)));
    const targetTags = Array.isArray(body?.target_tags)
      ? body.target_tags.map(String).slice(0, 3)
      : [];

    let exercise;
    if (!aiEnabled()) {
      exercise = demoGrammarExercise(topic, count);
    } else {
      const system = [
        "You are an expert CEFR B2 English item writer.",
        "Create unambiguous, classroom-appropriate exercises.",
        "Never reveal answers inside student_view.",
        "Avoid trick questions and cultural bias.",
        "Return ONLY valid JSON that matches the provided schema."
      ].join("\n");

      const developer = [
        `Generate a B2 grammar exercise set with ${count} items.`,
        `Topic: ${topic}.`,
        targetTags.length
          ? `Target error tags (if any): ${targetTags.join(", ")}.`
          : "No specific target tags.",
        "Mix item types across: mcq, gap_fill, sentence_transformation, error_correction.",
        "Constraints:",
        "- B2 level: meaningful contexts, not trivial A2 sentences.",
        "- Exactly one correct answer per item.",
        "- Provide brief rationales (1–2 sentences) in answer_key only.",
        "- Include per-item tags from a controlled list: articles, prepositions, narrative_tenses, conditionals, modals, relative_clauses, passive, reported_speech, linkers."
      ].join("\n");

      const schema = GrammarExerciseSchema.toJSON();

      const raw = await callOpenAIJson({
        system,
        developer,
        schemaName: "grammar_exercise_v1",
        schema,
        temperature: 0.8
      });

      const parsed = GrammarExerciseSchema.parse(raw);
      exercise = parsed;
    }

    // Encrypt server-only payload (answer key) into a token the browser cannot read.
    // This allows the site to work without a database.
    const payload = {
      answer_key: exercise.answer_key,
      meta: exercise.meta,
      created_at: new Date().toISOString()
    };
    const submission_token = encryptJson(payload);

    const exercise_id = "ex_" + cryptoRandom();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    return NextResponse.json({
      exercise_id,
      expires_at: expires,
      student_view: exercise.student_view,
      submission_token
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}

function cryptoRandom(): string {
  // simple random id without importing node crypto in edge runtime
  return Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
}
