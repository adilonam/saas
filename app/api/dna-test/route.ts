import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { normalizeOrigins } from "@/lib/dna-test/normalize-origins";
import { serializeAttempt } from "@/lib/dna-test/attempts";
import {
  getGuestToken,
  getOrCreateGuestToken,
} from "@/lib/dna-test/guest-token";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const VISION_MODEL = "gpt-4o";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const SYSTEM_PROMPT = `You estimate entertainment-style ancestry / ethnic country origins from a person's facial appearance in a selfie. This is NOT a real DNA test — it is a fun, speculative guess based only on visible facial features.

Rules:
- Analyze the face in the image.
- Return up to 6 country origins with integer percentages that sum to exactly 100.
- Use real country names and ISO 3166-1 alpha-2 codes (e.g. Argentina / AR, Morocco / MA, Philippines / PH, United States / US).
- Prefer distinctive countries; do not invent fake countries.
- Sort by percentage descending.
- If no clear human face is visible, return: {"error":"no_face","message":"No clear face detected in the image."}

Respond with ONLY valid JSON in this shape (no markdown):
{"origins":[{"country":"Argentina","countryCode":"AR","percentage":50},{"country":"Morocco","countryCode":"MA","percentage":20}]}`;

/**
 * POST /api/dna-test
 * Analyze selfie and persist scored origins on the attempt.
 * Guests and unsubscribed users may analyze once (results stored); the UI
 * paywalls the full report until auth + active subscription (IQ-style).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const guestToken = userId
      ? await getGuestToken()
      : await getOrCreateGuestToken();

    if (!userId && !guestToken) {
      return NextResponse.json(
        { error: "Unable to identify visitor" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const attemptIdRaw = formData.get("attemptId");
    const attemptId =
      typeof attemptIdRaw === "string" && attemptIdRaw.length > 0
        ? attemptIdRaw
        : null;

    if (!image || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please provide a valid image file" },
        { status: 400 },
      );
    }

    if (image.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Please use a file under 8 MB." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API is not configured" },
        { status: 503 },
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mime = image.type || "image/jpeg";
    const dataUrl = `data:${mime};base64,${imageBuffer.toString("base64")}`;

    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Estimate entertainment ancestry origins from this selfie. Return JSON only.",
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("DNA test OpenAI error:", res.status, err);
      return NextResponse.json(
        { error: "Failed to analyze the selfie. Please try again." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "No analysis was returned. Please try another photo." },
        { status: 502 },
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content) as Record<string, unknown>;
    } catch {
      console.error("DNA test JSON parse error:", content.slice(0, 200));
      return NextResponse.json(
        { error: "Could not parse ancestry results. Please try again." },
        { status: 502 },
      );
    }

    if (parsed.error === "no_face" || parsed.error === "no_face_detected") {
      return NextResponse.json(
        {
          error:
            typeof parsed.message === "string"
              ? parsed.message
              : "No clear face detected. Please upload a clear selfie.",
          code: "no_face",
        },
        { status: 422 },
      );
    }

    const origins = normalizeOrigins(parsed.origins);
    if (origins.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not estimate origins from this photo. Try a clearer face selfie.",
          code: "no_origins",
        },
        { status: 422 },
      );
    }

    const result = { origins };
    // Persist selfie bytes so unlock / restore can show the photo without re-upload.
    const selfieBytes = new Uint8Array(imageBuffer);
    let attempt = null;

    if (attemptId) {
      const existing = await prisma.dnaTestAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Attempt not found" },
          { status: 404 },
        );
      }

      const ownsAsUser = Boolean(userId && existing.userId === userId);
      const ownsAsGuest = Boolean(
        guestToken &&
          existing.guestToken === guestToken &&
          (!existing.userId || existing.userId === userId),
      );

      if (!ownsAsUser && !ownsAsGuest) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await prisma.dnaTestAttempt.update({
        where: { id: attemptId },
        data: {
          result: result as unknown as Prisma.InputJsonValue,
          selfie: selfieBytes,
          selfieMimeType: mime,
          status: "scored",
          ...(userId && existing.userId !== userId ? { userId } : {}),
        },
      });
      attempt = serializeAttempt(updated);
    } else {
      // No attempt id — create a scored attempt so unlock still works.
      const created = await prisma.dnaTestAttempt.create({
        data: {
          status: "scored",
          result: result as unknown as Prisma.InputJsonValue,
          selfie: selfieBytes,
          selfieMimeType: mime,
          ...(userId ? { userId } : {}),
          ...(guestToken ? { guestToken } : {}),
        },
      });
      attempt = serializeAttempt(created);
    }

    return NextResponse.json({
      origins,
      result,
      ...(attempt ? { attempt } : {}),
    });
  } catch (e) {
    console.error("DNA test error:", e);
    return NextResponse.json(
      { error: "An error occurred while analyzing the selfie" },
      { status: 500 },
    );
  }
}
