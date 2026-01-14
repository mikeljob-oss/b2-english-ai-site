type OpenAIResponse = any;

function isDemoMode(): boolean {
  return (process.env.DEMO_MODE ?? "").toLowerCase() === "true";
}

export function aiEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY && !isDemoMode();
}

export async function callOpenAIJson({
  system,
  developer,
  schemaName,
  schema,
  temperature = 0.8,
}: {
  system: string;
  developer: string;
  schemaName: string;
  schema: object;
  temperature?: number;
}): Promise<any> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: developer },
    ],
    temperature,
    response_format: { type: "json_object" },
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data: OpenAIResponse = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || "OpenAI error (" + res.status + ")";
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error("OpenAI returned no text output");
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse JSON from OpenAI");
  }
}
