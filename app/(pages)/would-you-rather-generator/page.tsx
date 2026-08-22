"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ScaleIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const PAIRS: { a: string; b: string }[] = [
  {
    a: "Always be 10 minutes late",
    b: "Always be 20 minutes early",
  },
  {
    a: "Have perfect memory for faces",
    b: "Have perfect memory for names",
  },
  {
    a: "Never need sleep again",
    b: "Never need food again",
  },
  {
    a: "Speak every language fluently",
    b: "Play every instrument expertly",
  },
  {
    a: "Travel to the past for a week",
    b: "Travel to the future for a week",
  },
  {
    a: "Read minds but only when people complain",
    b: "Teleport but only to grocery stores",
  },
  {
    a: "Live in a cozy cabin in the woods",
    b: "Live in a sleek apartment downtown",
  },
  {
    a: "Win $50,000 today",
    b: "Win $500,000 in ten years",
  },
  {
    a: "Have unlimited books",
    b: "Have unlimited movies",
  },
  {
    a: "Be famous for doing good",
    b: "Be unknown but very wealthy",
  },
  {
    a: "Always know the fastest route",
    b: "Always get the best parking spot",
  },
  {
    a: "Master cooking every cuisine",
    b: "Master baking every dessert",
  },
  {
    a: "Explore the deep ocean",
    b: "Explore outer space",
  },
  {
    a: "Have a pause button for life",
    b: "Have a rewind button (5 minutes only)",
  },
  {
    a: "Perfect singing voice",
    b: "Perfect dancing skills",
  },
  {
    a: "Summer forever where you live",
    b: "Winter forever where you live",
  },
  {
    a: "Talk to animals",
    b: "Speak every human language",
  },
  {
    a: "Never lose your keys",
    b: "Never lose your phone",
  },
  {
    a: "Best player on a bad team",
    b: "Average player on a championship team",
  },
  {
    a: "Read twice as fast",
    b: "Type twice as fast",
  },
  {
    a: "Free coffee for life",
    b: "Free dessert for life",
  },
  {
    a: "Live without music",
    b: "Live without video",
  },
  {
    a: "Always dress sharp",
    b: "Always feel perfectly comfortable",
  },
  {
    a: "Time travel to meet ancestors",
    b: "Time travel to meet descendants",
  },
  {
    a: "Win a debate every time",
    b: "Win a negotiation every time",
  },
];

export default function WouldYouRatherGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [pair, setPair] = useState<{ a: string; b: string } | null>(null);

  const generate = useCallback(() => {
    if (!ensureAccess()) return;
    const i = Math.floor(Math.random() * PAIRS.length);
    setPair(PAIRS[i] ?? null);
  }, [ensureAccess]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
            <ScaleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Would You Rather Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Random dilemmas for icebreakers, streams, or group chats.
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl"
            onClick={generate}
          >
            Generate dilemma
          </Button>

          {pair && (
            <div className="space-y-4" aria-live="polite">
              <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                  Option A
                </p>
                <p className="mt-2 text-lg font-medium text-foreground">
                  {pair.a}?
                </p>
              </div>
              <p className="text-center text-sm font-bold text-muted-foreground">
                or
              </p>
              <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-5 dark:border-violet-900 dark:bg-violet-950/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Option B
                </p>
                <p className="mt-2 text-lg font-medium text-foreground">
                  {pair.b}?
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
