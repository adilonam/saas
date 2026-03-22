import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You write SEO meta descriptions for web pages.

Rules:
- Aim for roughly 150–160 characters; never exceed 320 characters.
- Include a clear benefit or hook and a soft CTA when natural.
- Reflect only the page content the user describes.
- Return exactly 3 options, numbered 1. 2. 3., each on its own line, character count noted at the end of each line in parentheses like (158 chars).`;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const page = pickText(body, "text");
      if (!page) return null;
      const title = str(body.title).trim();
      if (title) {
        return `Page title: ${title}\n\nPage content / summary:\n${page}`;
      }
      return page;
    },
    emptyError: "Please describe the page or paste key content.",
    maxTokens: 500,
    logLabel: "meta-description-generator",
  });
}
