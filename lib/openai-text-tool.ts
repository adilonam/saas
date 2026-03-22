import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
export const OPENAI_MODEL = "gpt-4o";

export type OpenAiTextToolOptions = {
  systemPrompt: string;
  getUserMessage: (body: Record<string, unknown>) => string | null;
  emptyError?: string;
  maxTokens?: number;
  logLabel: string;
  /** When set to json_object, the API returns { json } instead of { text }. */
  responseFormat?: "text" | "json_object";
};

export async function postOpenAiTextTool(
  request: Request,
  options: OpenAiTextToolOptions,
): Promise<NextResponse> {
  const {
    systemPrompt,
    getUserMessage,
    emptyError = "Content is required",
    maxTokens = 1024,
    logLabel,
    responseFormat = "text",
  } = options;

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
        {
          error: "Active subscription required",
          code: "subscription_required",
        },
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

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userMessage = getUserMessage(body);
    if (!userMessage?.trim()) {
      return NextResponse.json({ error: emptyError }, { status: 400 });
    }

    const openAiBody: Record<string, unknown> = {
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage.trim() },
      ],
      max_tokens: maxTokens,
    };
    if (responseFormat === "json_object") {
      openAiBody.response_format = { type: "json_object" };
    }

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openAiBody),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`OpenAI ${logLabel} error:`, res.status, err);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    if (responseFormat === "json_object") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Model returned invalid JSON" },
          { status: 502 },
        );
      }
      return NextResponse.json({ json: parsed });
    }
    return NextResponse.json({ text });
  } catch (e) {
    console.error(`${logLabel} route error:`, e);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function pickText(body: Record<string, unknown>, key = "text"): string | null {
  const t = str(body[key]).trim();
  return t || null;
}

export function pickPrompt(body: Record<string, unknown>): string | null {
  const t = str(body.prompt).trim();
  return t || null;
}
