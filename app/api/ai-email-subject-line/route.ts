import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an expert email marketing copywriter. Given a topic, product, or goal, generate 5 compelling email subject lines that are concise, engaging, and likely to get high open rates. Return only the subject lines, one per line, no numbering or bullets. Keep each under 60 characters when possible.`;

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
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI ai-email-subject-line error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate subject lines" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text: content });
  } catch (e) {
    console.error("AI email subject line error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating subject lines" },
      { status: 500 },
    );
  }
}
