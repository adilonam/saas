import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_PROMPT = `You are a LaTeX expert. Given a user's description or topic, generate a complete, valid LaTeX document that could be compiled to PDF.

Rules:
- Use \\documentclass[12pt]{article} (or appropriate class) and include necessary packages (e.g. amsmath, geometry).
- Return ONLY the raw LaTeX source code. No markdown, no \`\`\`latex wrapper, no explanation.
- The document must be complete (\\begin{document} ... \\end{document}) and compile with pdflatex.`;

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
      return NextResponse.json(
        { error: "Prompt is required" },
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
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI generate-latex error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate LaTeX" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const latex = data.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ latex });
  } catch (e) {
    console.error("Generate LaTeX error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating LaTeX" },
      { status: 500 },
    );
  }
}
