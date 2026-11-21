import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a social media expert. Given long-form content or a message, reformat it into one or more tweet/X posts (and optionally a short LinkedIn-style post).

Rules:
- For Twitter/X: each post must be 280 characters or less. If the content is long, split into a clear thread (number posts as 1/5, 2/5, etc.).
- Preserve the core message and tone. Use line breaks for readability. Add a hook in the first post if it's a thread.
- Return ONLY the formatted post(s). No meta commentary. If multiple posts, separate them with "---" on its own line.`;

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
        { error: "Content to format is required" },
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
      console.error("OpenAI tweet-post-formatter error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to format post" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Tweet/Post formatter error:", e);
    return NextResponse.json(
      { error: "An error occurred while formatting" },
      { status: 500 },
    );
  }
}
