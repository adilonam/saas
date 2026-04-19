import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You help with B2B and freelance cold outreach. Given a short context (role, offer, audience), write 6 distinct cold email opening lines (first 1–2 sentences only). Vary tone: direct, curious, social proof, pattern interrupt, question-led, and ultra-short. No subject lines. No numbering labels — one opener per line, plain text.`;

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
    const context = typeof body.context === "string" ? body.context.trim() : "";
    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
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
          { role: "user", content: context },
        ],
        max_tokens: 700,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI cold-email-openers error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate openers" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text: content });
  } catch (e) {
    console.error("cold-email-openers error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating openers" },
      { status: 500 },
    );
  }
}
