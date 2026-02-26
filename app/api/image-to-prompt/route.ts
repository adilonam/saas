import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const VISION_MODEL = "gpt-4o";

export const promptTypeLabels: Record<string, string> = {
  general: "General Image Prompt",
  structured: "Structured Prompt",
  graphic_design: "Graphic Design",
  json: "JSON",
  flux: "Flux",
  midjourney: "Midjourney",
  stable_diffusion: "Stable Diffusion",
};

function getSystemPrompt(type: string): string {
  switch (type) {
    case "general":
      return "Describe this image in clear, natural language. Return only the description, no preamble.";
    case "structured":
      return `Describe this image split into three sections. Return ONLY the following structure, nothing else:
Subject: [what is shown - people, objects, actions]
Environment: [setting, lighting, atmosphere]
Visual Style: [art style, mood, composition, colors]`;
    case "graphic_design":
      return "Describe this image replicating professional design aesthetics: typography (fonts, hierarchy), layout (composition, spacing), and subject details. Return only the description.";
    case "json":
      return "Describe this image and output as valid JSON. Use keys like subject, environment, style, colors, composition, mood. Return only the JSON object, no markdown or explanation.";
    case "flux":
      return "Describe this image in concise natural language optimized for Flux AI image generation models. Keep it clear and prompt-friendly. Return only the prompt.";
    case "midjourney":
      return "Describe this image as a Midjourney prompt. Include appropriate parameters (e.g. --ar, --stylize) where relevant. Return only the prompt.";
    case "stable_diffusion":
      return "Describe this image as a Stable Diffusion prompt, formatted for SD models (comma-separated tags, quality words first). Return only the prompt.";
    default:
      return "Describe this image in clear, natural language. Return only the description.";
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
    const promptType = (formData.get("promptType") as string) || "general";

    if (!image || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please provide a valid image file" },
        { status: 400 },
      );
    }

    if (!Object.keys(promptTypeLabels).includes(promptType)) {
      return NextResponse.json(
        { error: "Invalid prompt type" },
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

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mime = image.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    const systemPrompt = getSystemPrompt(promptType);

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
              { type: "text", text: systemPrompt },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI vision error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate prompt from image" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "(No prompt could be generated.)";

    return NextResponse.json({ prompt: content, promptType });
  } catch (e) {
    console.error("Image to prompt error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating the prompt" },
      { status: 500 },
    );
  }
}
