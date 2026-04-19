import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM = `You turn short bullet phrases into study flashcards. For each bullet, output one line in the exact format:
Front: <short question or term> | Back: <concise answer or definition>

Rules:
- One flashcard per input line; skip empty lines.
- Keep each side under 120 characters when possible.
- No numbering or extra commentary — only lines matching "Front: ... | Back: ...".`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const hasActive =
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActive) {
      return NextResponse.json(
        { error: "Active subscription required", code: "subscription_required" },
        { status: 403 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API is not configured" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const bullets = typeof body.bullets === "string" ? body.bullets.trim() : "";
    if (!bullets) {
      return NextResponse.json({ error: "bullets is required" }, { status: 400 });
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
          { role: "system", content: SYSTEM },
          { role: "user", content: bullets.slice(0, 8000) },
        ],
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI ai-flashcard-expand:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to expand flashcards" }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("ai-flashcard-expand:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
