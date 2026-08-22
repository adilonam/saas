"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const TRUTHS = [
  "What is a skill you wish you had learned earlier?",
  "What is your most-used emoji and why?",
  "What song have you listened to on repeat recently?",
  "What is something small that always improves your day?",
  "What was your favorite subject in school?",
  "What is a food you refused to try as a kid but like now?",
  "What is the kindest thing someone has done for you?",
  "What is a hobby you would try if time and money were unlimited?",
  "What is your go-to comfort show or movie?",
  "What is a place you would love to visit again?",
  "What is something you are proud of from the last year?",
  "What is a myth you believed for too long?",
  "What is your earliest clear memory?",
  "What is a trend you never understood?",
  "What would you title the current chapter of your life?",
  "What is a book or article that changed how you think?",
  "What is your ideal way to spend a free Saturday?",
  "What is something you are curious about right now?",
  "What is a compliment you still remember?",
  "What is a rule you follow that others might find odd?",
  "What is the best advice you have received?",
  "What is something you overcame that felt impossible at the time?",
  "What is a snack you could eat every day?",
  "What is a goal you are working toward quietly?",
  "What is something you would tell your past self from five years ago?",
];

const DARES = [
  "Do 15 jumping jacks or high knees on the spot.",
  "Speak in rhymes for the next two minutes.",
  "Draw a quick self-portrait and show the group.",
  "Name three things in the room you are grateful for.",
  "Do your best impression of a movie trailer voice for 20 seconds.",
  "Text a friend a genuine compliment right now.",
  "Balance on one foot for 30 seconds without holding anything.",
  "Hum a popular song until someone guesses it.",
  "Share a fun fact about yourself most people do not know.",
  "Do ten squats while naming vegetables for each rep.",
  "Make up a short jingle about the person to your left (or yourself).",
  "Walk to the kitchen and bring back a snack for someone else.",
  "Say the alphabet backwards as fast as you can.",
  "Plank for 20 seconds while smiling.",
  "Describe your day so far as a weather forecast.",
  "Swap seats with someone for the next round.",
  "Post a story with a silly selfie (or show the group if offline).",
  "Do your best robot dance for 15 seconds.",
  "Let the group pick your phone wallpaper for one hour.",
  "Speak only in questions until your next turn.",
  "Do a slow-motion walk across the room and back.",
  "Share the last photo in your camera roll (or describe it).",
  "Make animal sounds for each person in the group once.",
  "Try to lick your elbow (classic) and laugh about it.",
  "End your next sentence with “… allegedly” for three turns.",
];

type Mode = "truth" | "dare" | "either";

export default function TruthOrDareGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [mode, setMode] = useState<Mode>("either");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [kind, setKind] = useState<"truth" | "dare" | null>(null);

  const generate = useCallback(() => {
    if (!ensureAccess()) return;
    let pick: "truth" | "dare";
    if (mode === "truth") pick = "truth";
    else if (mode === "dare") pick = "dare";
    else pick = Math.random() < 0.5 ? "truth" : "dare";

    const pool = pick === "truth" ? TRUTHS : DARES;
    const line = pool[Math.floor(Math.random() * pool.length)] ?? "";
    setKind(pick);
    setPrompt(line);
  }, [ensureAccess, mode]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Truth or Dare Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Light, party-friendly prompts — keep it kind and consent-based.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Mode</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "either" as const, label: "Either" },
                  { id: "truth" as const, label: "Truth only" },
                  { id: "dare" as const, label: "Dare only" },
                ] as const
              ).map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  variant={mode === id ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setMode(id);
                    setPrompt(null);
                    setKind(null);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl"
            onClick={generate}
          >
            Generate prompt
          </Button>

          {prompt && kind && (
            <div
              className="rounded-xl border border-border bg-muted/50 p-6"
              aria-live="polite"
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  kind === "truth"
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {kind === "truth" ? "Truth" : "Dare"}
              </p>
              <p className="mt-3 text-lg font-medium leading-relaxed text-foreground">
                {prompt}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
