import { postOpenAiTextTool, pickPrompt } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You convert meeting notes into a practical action plan.

Return clear markdown with:
- Objective
- Key decisions
- Action items table: Owner | Task | Deadline | Priority
- Risks/Blockers
- Next meeting agenda

Keep it concise and execution-focused.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: pickPrompt,
    emptyError: "Meeting notes are required",
    maxTokens: 1200,
    logLabel: "meeting-notes-action-plan",
  });
}
