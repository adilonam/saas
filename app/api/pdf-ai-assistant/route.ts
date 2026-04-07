import { NextResponse } from "next/server";
import { postOpenAiTextTool } from "@/lib/openai-text-tool";

function buildPrompt(task: string, text: string, extraPrompt: string): string | null {
  const normalizedTask = task.trim().toLowerCase();
  if (!text.trim()) return null;

  const taskInstructions: Record<string, string> = {
    translate:
      "Translate the provided OCR text to clear English while preserving structure and meaning.",
    keywords:
      "Extract the 20 most relevant keywords/phrases from the text. Return one item per line.",
    qa: `Answer the user's question based only on the provided text.
If the answer is not present, say so clearly.
User question: ${extraPrompt || "No question provided."}`,
    outline:
      "Create a concise hierarchical outline with sections and bullet points from the text.",
    action_items:
      "Extract actionable tasks with owner (if present), due date (if present), and priority guess.",
    compare:
      "Compare the provided documents and list key similarities, differences, and notable conflicts.",
  };

  const instruction = taskInstructions[normalizedTask];
  if (!instruction) return null;

  return `${instruction}\n\n---\nSOURCE TEXT:\n${text}`;
}

export async function POST(request: Request) {
  const cloned = request.clone();
  let parsedBody: { task?: string; text?: string; prompt?: string };

  try {
    parsedBody = (await cloned.json()) as {
      task?: string;
      text?: string;
      prompt?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const task = parsedBody.task || "";
  const text = parsedBody.text || "";
  const prompt = parsedBody.prompt || "";
  const userMessage = buildPrompt(task, text, prompt);

  if (!userMessage) {
    return NextResponse.json(
      { error: "Invalid task or missing text" },
      { status: 400 },
    );
  }

  return postOpenAiTextTool(request, {
    systemPrompt:
      "You are a precise PDF analysis assistant. Do not invent facts. Be concise and structured.",
    getUserMessage: () => userMessage,
    emptyError: "Text is required",
    maxTokens: 1400,
    logLabel: "pdf-ai-assistant",
  });
}
