import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a social media expert. Generate short, engaging bios for social media profiles.

Rules:
- Return 3 distinct bio options, each 1-2 sentences (under 160 characters for Twitter/X).
- Match the platform and tone requested.
- Return ONLY a JSON array of 3 strings, e.g. ["Bio 1", "Bio 2", "Bio 3"]. No markdown, no explanation.`;

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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const niche = typeof body.niche === "string" ? body.niche.trim() : "";
    const platform = typeof body.platform === "string" ? body.platform.trim() : "any";

    const prompt = [name && `Name/brand: ${name}`, niche && `Niche/topic: ${niche}`, platform && `Platform: ${platform}`]
      .filter(Boolean)
      .join(". ");
    if (!prompt) {
      return NextResponse.json(
        { error: "Name or niche is required" },
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
          { role: "user", content: `Generate 3 social media bios for: ${prompt}` },
        ],
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI social-bio error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate bios" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    let bios: string[] = [];
    try {
      const parsed = JSON.parse(raw.replace(/^```\w*\n?|\n?```$/g, "").trim());
      bios = Array.isArray(parsed) ? parsed.map(String).slice(0, 3) : [raw];
    } catch {
      bios = raw.split(/\n/).filter(Boolean).slice(0, 3);
    }
    return NextResponse.json({ bios });
  } catch (e) {
    console.error("Social bio error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating bios" },
      { status: 500 },
    );
  }
}
