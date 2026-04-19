import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM = `You polish LinkedIn headlines. The user sends a draft headline (possibly with separators like |) and optional constraints (max chars, keywords to keep). Return ONE line: the improved headline only. Respect LinkedIn's ~220 character practical limit; stay under 220 characters.`;

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
    const draft = typeof body.draft === "string" ? body.draft.trim() : "";
    const constraints =
      typeof body.constraints === "string" ? body.constraints.trim() : "";
    if (!draft) {
      return NextResponse.json({ error: "draft is required" }, { status: 400 });
    }

    const userMsg = constraints
      ? `Draft:\n${draft}\n\nConstraints:\n${constraints}`
      : `Draft:\n${draft}`;

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
        max_tokens: 256,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI ai-linkedin-headline:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to polish headline" }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("ai-linkedin-headline:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
