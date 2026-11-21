import { NextResponse } from "next/server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM = `You convert between outlines and flashcards.

If the user asks for flashcards from an outline: produce lines only as:
Front: ... | Back: ...

If the user asks for an outline from flashcards: produce a simple nested outline using 2-space indent and "- " bullets. Group related cards under a sensible heading.

No extra commentary outside the requested format.`;

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
    const direction = body.direction === "to-outline" ? "to-outline" : "to-cards";
    const textIn = typeof body.text === "string" ? body.text.trim() : "";
    if (!textIn) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const userMsg =
      direction === "to-outline"
        ? `Convert these flashcards (Front: ... | Back: ...) into a study outline:\n\n${textIn.slice(0, 12000)}`
        : `Convert this outline into flashcards (one per line, format Front: ... | Back: ...):\n\n${textIn.slice(0, 12000)}`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI ai-outline-flashcards:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to convert" }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("ai-outline-flashcards:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
