import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are an expert resume writer. Given a job title/role and raw experience details (tasks, responsibilities, metrics), turn them into strong resume bullet points.

Rules:
- Start each bullet with a strong action verb. Use quantifiable results (numbers, percentages, time) when possible.
- Keep each bullet to 1–2 lines. Use past tense for past roles.
- Return ONLY the bullet points, one per line. No headings or extra commentary.`;

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API is not configured" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI ai-resume-bullet error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate resume bullets" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("AI resume bullet error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating resume bullets" },
      { status: 500 },
    );
  }
}
