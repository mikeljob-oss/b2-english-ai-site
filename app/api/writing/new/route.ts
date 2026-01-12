import { NextResponse } from "next/server";
import { aiEnabled, callOpenAIJson } from "@/lib/openai";
import { demoWritingTask } from "@/lib/generators";
import { encryptJson } from "@/lib/crypto";
import { WritingNewResponseSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body?.topic ?? "random");
    const targetTags = Array.isArray(body?.target_tags) ? body.target_tags.map(String).slice(0, 3) : [];
    let taskBundle: any;
    if (!aiEnabled()) {
      taskBundle = demoWritingTask(topic);
    } else {
      const system = [
        "You are an expert CEFR B2 writing task designer.",
        "Return ONLY valid JSON that matches the provided schema.",
        "Write a single B2 task that is unambiguous and classroom-appropriate.",
        "Do not include a full sample answer; only the task prompt."
      ].join("\n");
      const developer = [
        `Create one CEFR B2 writing task.`,
        `Topic: ${topic}.`,
        targetTags.length ? `Try to naturally elicit these focus areas if possible: ${targetTags.join(", ")}.` : "No specific focus areas.",
        "Choose a genre from: email, essay, report, review.",
        "Provide a clear word range (min/max).",
        "Also provide short rubric descriptors (content, communicative_achievement, organisation, language)."
      ].join("\n");
      const schema = WritingNewResponseSchema.toJSON();
      taskBundle = await callOpenAIJson({
        system,
        developer,
        schemaName: "writing_task_v1",
        schema,
        temperature: 0.7
      });
      taskBundle = WritingNewResponseSchema.parse(taskBundle);
    }

    const submission_token = encryptJson({
      task: taskBundle.task,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      task: taskBundle.task,
      submission_token
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
