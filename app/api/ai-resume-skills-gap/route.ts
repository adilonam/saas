import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM = `You compare a candidate's resume skills to a job description. Be concise and actionable.

Output markdown with:
## Missing or weak areas
(bullets)

## Suggested additions to resume
(bullets — skills or phrasing to add if honest)

## Interview prep angles
(2–4 bullets)

Do not invent credentials. If the paste is unclear, say what's missing.`;

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
    const resume = typeof body.resume === "string" ? body.resume.trim() : "";
    const jd = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
    if (!resume || !jd) {
      return NextResponse.json(
        { error: "resume and jobDescription are required" },
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
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Resume (skills/experience):\n${resume.slice(0, 12000)}\n\n---\n\nJob description:\n${jd.slice(0, 12000)}`,
          },
        ],
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI ai-resume-skills-gap:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to analyze gaps" }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ text });
  } catch (e) {
    console.error("ai-resume-skills-gap:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
