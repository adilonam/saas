import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a YouTube growth expert. Given a video topic or description, generate 5–8 compelling video titles that are click-worthy and SEO-friendly.

Rules:
- Keep titles under 60 characters when possible for full visibility. Use power words and curiosity where appropriate.
- Return ONLY the titles, one per line. No numbering, bullet symbols, or extra commentary.`;

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
        { error: "Video topic or description is required" },
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
      console.error("OpenAI youtube-title-generator error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate titles" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("YouTube title generator error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating titles" },
      { status: 500 },
    );
  }
}
