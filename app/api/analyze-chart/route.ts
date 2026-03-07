import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const VISION_MODEL = "gpt-4.1";

const SYSTEM_PROMPT = `You are a trading chart analyst. Analyze this trading chart image and propose concrete levels.

Propose specific levels (use precise numbers, not round numbers like 64000 — use values like 64543, 97250, 101230):
1. entryPrice - Your proposed entry price for the trade. Return as a number (e.g. 64543.50, not 64000).
2. takeProfit - Your proposed take profit price level. Return as a number with precise digits (e.g. 67210.25).
3. stopLoss - Your proposed stop loss price level. Return as a number with precise digits (e.g. 61890.75).
4. probability - Probability of success as a percentage (0-100). Return as a number.
5. direction - Either "BUY" or "SELL" based on your analysis.

Return ONLY a valid JSON object with exactly these keys: entryPrice, probability, takeProfit, stopLoss, direction.
Use precise numeric values for entryPrice, takeProfit and stopLoss (e.g. 64543.5, 67210.25). No markdown, no code block, no other text.
Example: {"entryPrice": 64543.5, "probability": 68, "takeProfit": 67210.25, "stopLoss": 61890.75, "direction": "BUY"}`;

export interface AnalyzeChartResponse {
  entryPrice: number;
  probability: number;
  takeProfit: number;
  stopLoss: number;
  direction: "BUY" | "SELL";
}

function parseChartJson(text: string): AnalyzeChartResponse | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const obj = JSON.parse(cleaned) as Record<string, unknown>;
    const entryPrice = typeof obj.entryPrice === "number" ? obj.entryPrice : Number(obj.entryPrice) || 0;
    const probability = typeof obj.probability === "number" ? obj.probability : Number(obj.probability) || 0;
    const takeProfit = typeof obj.takeProfit === "number" ? obj.takeProfit : Number(obj.takeProfit) || 0;
    const stopLoss = typeof obj.stopLoss === "number" ? obj.stopLoss : Number(obj.stopLoss) || 0;
    const direction = obj.direction === "SELL" ? "SELL" : "BUY";
    return { entryPrice, probability, takeProfit, stopLoss, direction };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please provide a valid chart screenshot (image file)" },
        { status: 400 },
      );
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

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime = image.type || "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: SYSTEM_PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI analyze-chart error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to analyze chart" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";
    console.log("content", content);
    const parsed = parseChartJson(content);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse analysis result, retry again" },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Analyze chart error:", e);
    return NextResponse.json(
      { error: "An error occurred while analyzing the chart" },
      { status: 500 },
    );
  }
}
