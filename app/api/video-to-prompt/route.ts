import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const VISION_MODEL = "gpt-4o";
const MAX_FRAMES = 8;

export const promptTypeLabels: Record<string, string> = {
  general: "General Video Prompt",
  structured: "Structured Prompt",
  flux: "Flux",
  midjourney: "Midjourney",
  stable_diffusion: "Stable Diffusion",
};

function getSystemPrompt(type: string, frameCount: number): string {
  const frameNote = `You are given ${frameCount} key frames from a video in chronological order (start to end).`;
  switch (type) {
    case "general":
      return `${frameNote} Describe the video as a whole in clear, natural language: what happens, who or what is shown, setting, and style. Return only the description, no preamble.`;
    case "structured":
      return `${frameNote} Describe the video split into three sections. Return ONLY the following structure, nothing else:
Subject: [what is shown - people, objects, actions over time]
Environment: [setting, lighting, atmosphere]
Visual Style: [art style, mood, composition, colors, motion]`;
    case "flux":
      return `${frameNote} Describe the video in concise natural language optimized for Flux AI image/video generation. Capture the key visual narrative and style. Return only the prompt.`;
    case "midjourney":
      return `${frameNote} Describe the video as a Midjourney-style prompt (can be used for consistent character/scene generation). Include appropriate parameters (e.g. --ar, --stylize) where relevant. Return only the prompt.`;
    case "stable_diffusion":
      return `${frameNote} Describe the video as a Stable Diffusion prompt, formatted for SD models (comma-separated tags, quality words first). Return only the prompt.`;
    default:
      return `${frameNote} Describe the video in clear, natural language. Return only the description.`;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const promptType = (formData.get("promptType") as string) || "general";

    const frameFiles: { index: number; file: File }[] = [];
    for (let i = 0; i < MAX_FRAMES; i++) {
      const file = formData.get(`frame_${i}`) as File | null;
      if (file && file.size > 0 && file.type.startsWith("image/")) {
        frameFiles.push({ index: i, file });
      }
    }

    if (frameFiles.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one valid video frame (image)" },
        { status: 400 },
      );
    }

    frameFiles.sort((a, b) => a.index - b.index);

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

    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      { type: "text", text: getSystemPrompt(promptType, frameFiles.length) },
    ];

    for (const { file } of frameFiles) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mime = file.type || "image/jpeg";
      content.push({
        type: "image_url",
        image_url: { url: `data:${mime};base64,${base64}` },
      });
    }

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [{ role: "user", content }],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI vision error (video-to-prompt):", res.status, err);
      return NextResponse.json(
        { error: "Failed to generate prompt from video" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const prompt =
      data.choices?.[0]?.message?.content?.trim() ||
      "(No prompt could be generated.)";

    return NextResponse.json({ prompt, promptType });
  } catch (e) {
    console.error("Video to prompt error:", e);
    return NextResponse.json(
      { error: "An error occurred while generating the prompt" },
      { status: 500 },
    );
  }
}
