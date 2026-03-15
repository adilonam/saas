import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a content strategist. Generate engaging content ideas for blogs, social media, or videos.

Rules:
- Return exactly 10 short, actionable content ideas.
- Each idea one line, specific and creative.
- Return ONLY a JSON array of 10 strings. No markdown, no numbering in the strings, no explanation.`;

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
    const hasActiveSubscription =
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
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
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const format = typeof body.format === "string" ? body.format.trim() : "any";

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 },
      );
    }

    const userMessage = format
      ? `Topic: ${topic}. Format/medium: ${format}.`
      : `Topic: ${topic}.`;

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
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI content-ideas error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate ideas" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    let ideas: string[] = [];
    try {
      const parsed = JSON.parse(raw.replace(/^```\w*\n?|\n?```$/g, "").trim());
      ideas = Array.isArray(parsed) ? parsed.map(String).slice(0, 10) : [raw];
    } catch {
      ideas = raw.split(/\n/).filter(Boolean).slice(0, 10);
    }
    return NextResponse.json({ ideas });
  } catch (e) {
    console.error("Content ideas error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating ideas" },
      { status: 500 },
    );
  }
}
