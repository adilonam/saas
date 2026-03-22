import { NextResponse } from "next/server";
import { pickText, postOpenAiTextTool } from "@/lib/openai-text-tool";
import { parsePalettesFromJson } from "@/lib/palette-generator";

const SYSTEM_PROMPT = `You are a product designer suggesting UI color palettes for web and mobile apps.

Given a short description of an app (audience, purpose, mood), respond with a JSON object ONLY (no markdown) with this exact shape:
{
  "palettes": [
    {
      "name": "short palette title",
      "summary": "one line why this direction fits the app",
      "colors": [
        { "role": "primary", "hex": "#RRGGBB", "label": "optional short name" },
        { "role": "secondary", "hex": "#RRGGBB" },
        { "role": "accent", "hex": "#RRGGBB" },
        { "role": "background", "hex": "#RRGGBB" },
        { "role": "surface", "hex": "#RRGGBB" },
        { "role": "text", "hex": "#RRGGBB" },
        { "role": "muted", "hex": "#RRGGBB" }
      ]
 }
  ]
}

Rules:
- Include exactly 3 palettes in the array. Each must feel visually distinct (e.g. bold vs minimal vs soft, or different hue families).
- Each palette must have exactly 7 colors with the roles listed above (primary, secondary, accent, background, surface, text, muted).
- Use valid 6-digit hex with leading #. Ensure text has enough contrast on background/surface for real UI (WCAG-minded).
- Do not repeat trademarked palette names; invent neutral names.
- Base choices only on the user's description; if details are missing, infer reasonable defaults.`;

export async function POST(request: Request) {
  const response = await postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) =>
      pickText(body, "description") ?? pickText(body, "text"),
    emptyError: "Please describe your app.",
    maxTokens: 2200,
    logLabel: "palette-generator",
    responseFormat: "json_object",
  });

  const payload = (await response.json()) as {
    error?: string;
    code?: string;
    json?: unknown;
  };

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error ?? "Request failed" },
      { status: response.status },
    );
  }

  const palettes = parsePalettesFromJson(payload.json);
  if (!palettes) {
    return NextResponse.json(
      { error: "Could not build three valid palettes. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ palettes });
}
