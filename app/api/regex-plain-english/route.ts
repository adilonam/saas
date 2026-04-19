import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You explain regular expressions in plain English for developers.

Rules:
- Walk through the pattern left to right; explain quantifiers, groups, and character classes.
- Mention common pitfalls (e.g. dot matches newline only with flags) when relevant.
- If the user specifies a flavor (JavaScript, PCRE, etc.), respect it in the explanation.
- Return plain paragraphs or short bullets — no markdown code fences around the whole answer.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const pattern = pickText(body, "pattern");
      const flavor = typeof body.flavor === "string" && body.flavor.trim() ? body.flavor.trim() : "JavaScript";
      if (!pattern) return null;
      return `Regex flavor: ${flavor}\n\nPattern:\n${pattern}`;
    },
    emptyError: "Enter the regular expression to explain.",
    maxTokens: 2000,
    logLabel: "regex-plain-english",
  });
}
