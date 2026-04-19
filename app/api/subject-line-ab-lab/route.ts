import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are an email marketing expert focused on A/B testing subject lines. The user will describe a campaign or paste two candidate subject lines.

If they describe a topic only: propose 4 pairs of subject line A/B variants. For each pair, label clearly:
Line A: ...
Line B: ...
and add one sentence on why the test is interesting (hypothesis). Keep subject lines under 60 characters when possible.

If they include two explicit candidates: critique both briefly (clarity, curiosity, length), then suggest 2 alternative A/B pairs that might beat them.`;

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
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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
        max_tokens: 900,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI subject-line-ab-lab error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate A/B ideas" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text: content });
  } catch (e) {
    console.error("subject-line-ab-lab error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating ideas" },
      { status: 500 },
    );
  }
}
