import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SUMMARIZE_PROMPT = (text: string) =>
  `Summarize the following text concisely. Return only the summary, no preamble.\n\n${text.slice(0, 12000)}`;

async function summarizeWithGroq(text: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (!text || !text.trim()) {
    return "(No text could be extracted from this PDF.)";
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
      messages: [{ role: "user", content: SUMMARIZE_PROMPT(text) }],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content =
    data.choices?.[0]?.message?.content?.trim() ||
    "(Summary could not be generated.)";
  return content;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files?.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: `File ${file.name} is not a PDF` },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription =
      user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required", subscriptionExpiresAt: user.subscriptionExpiresAt },
        { status: 403 }
      );
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 }
      );
    }

    const results: Array<{
      filename: string;
      total_pages: number;
      summary: string;
    }> = [];

    for (const file of files) {
      const forwardFormData = new FormData();
      forwardFormData.append("file", file);

      const pdfToTextRes = await fetch(
        `${fastApiUrl}/fast-api/v1/pdf-to-text`,
        { method: "POST", body: forwardFormData }
      );

      if (!pdfToTextRes.ok) {
        const errText = await pdfToTextRes.text();
        results.push({
          filename: file.name,
          total_pages: 0,
          summary: `(Failed to extract text: ${errText.slice(0, 200)})`,
        });
        continue;
      }

      const pdfData = (await pdfToTextRes.json()) as {
        text?: string;
        total_pages?: number;
      };
      const text = pdfData.text ?? "";
      const total_pages = pdfData.total_pages ?? 0;

      let summary: string;
      try {
        summary = await summarizeWithGroq(text);
      } catch (e) {
        summary =
          e instanceof Error
            ? `(Summarization failed: ${e.message})`
            : "(Summarization failed.)";
      }

      results.push({
        filename: file.name,
        total_pages,
        summary,
      });
    }

    return NextResponse.json({ summaries: results }, { status: 200 });
  } catch (error) {
    console.error("Summarize PDF error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
