import { NextResponse } from "next/server";
import { decryptJson } from "@/lib/crypto";
import { tipForTag } from "@/lib/generators";

export const runtime = "nodejs";

type KeyItem = { item_id: string; correct_answer: string; rationale: string; tag: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body?.submission_token ?? "");
    const answers = Array.isArray(body?.answers) ? body.answers : [];

    const payload = decryptJson<{ answer_key: KeyItem[] }>(token);
    const key = payload.answer_key;

    const answerMap = new Map<string, string>();
    for (const a of answers) {
      if (a && typeof a.item_id === "string") answerMap.set(a.item_id, String(a.value ?? ""));
    }

    const results = key.map((k) => {
      const given = (answerMap.get(k.item_id) ?? "").trim();
      const expected = (k.correct_answer ?? "").trim();

      // lenient compare: case-insensitive and collapse spaces
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
      const is_correct = norm(given) === norm(expected);

      return {
        item_id: k.item_id,
        is_correct,
        correct_answer: k.correct_answer,
        explanation: k.rationale,
        error_tag: is_correct ? null : k.tag
      };
    });

    const correct = results.filter(r => r.is_correct).length;
    const total = results.length;

    // Personalised feedback: simple heuristic based on mistakes
    const mistakes = results.filter(r => !r.is_correct && r.error_tag).map(r => r.error_tag as string);
    const freq: Record<string, number> = {};
    for (const t of mistakes) freq[t] = (freq[t] ?? 0) + 1;
    const topFocus = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(([tag]) => ({
      tag,
      tip: tipForTag(tag)
    }));

    const strengths = (() => {
      const correctTags: Record<string, number> = {};
      for (const r of results) {
        if (r.is_correct) {
          const tag = (key.find(k => k.item_id === r.item_id)?.tag) ?? "general";
          correctTags[tag] = (correctTags[tag] ?? 0) + 1;
        }
      }
      return Object.entries(correctTags).sort((a,b)=>b[1]-a[1]).slice(0, 2).map(([tag]) => tag);
    })();

    const recommended = topFocus.length
      ? { mode: "grammar" as const, level: "B2" as const, count: 8, target_tags: topFocus.map(x => x.tag), topic: "random" }
      : undefined;

    return NextResponse.json({
      score: { correct, total },
      results,
      personalised_feedback: {
        top_strengths: strengths.length ? strengths : ["overall accuracy"],
        top_focus_areas: topFocus.length ? topFocus : [{ tag: "general", tip: "Keep practising and review explanations for mistakes." }],
        next_step: topFocus.length
          ? "Generate a short set targeting your top focus area and re-check the explanations."
          : "Try a new random set and aim for 8/10 or higher."
      },
      recommended_next_request: recommended
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 400 });
  }
}
