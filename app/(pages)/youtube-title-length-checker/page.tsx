"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";
import { graphemeCount } from "@/lib/grapheme-count";

const YOUTUBE_TITLE_MAX = 100;

export default function YouTubeTitleLengthCheckerPage() {
  const { ensureAccess } = useToolAccess();
  const [title, setTitle] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const stats = useMemo(() => {
    const graphemes = graphemeCount(title);
    const bytes = new TextEncoder().encode(title).length;
    return {
      graphemes,
      bytes,
      withinLimit: graphemes <= YOUTUBE_TITLE_MAX,
      remaining: YOUTUBE_TITLE_MAX - graphemes,
    };
  }, [title]);

  const handleCheck = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30">
            <PlayCircleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              YouTube title length checker
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Count graphemes (including emoji) against YouTube&apos;s {YOUTUBE_TITLE_MAX}-character title limit.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="title">Video title</Label>
          <textarea
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paste or type your title…"
            className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="button" onClick={handleCheck} className="gap-2">
            Check title length
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-3 rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">Results</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Grapheme count:</span>{" "}
                {stats.graphemes} / {YOUTUBE_TITLE_MAX}
              </li>
              <li>
                <span className="font-medium text-foreground">UTF-8 size:</span> {stats.bytes}{" "}
                bytes
              </li>
              <li>
                <span className="font-medium text-foreground">Status:</span>{" "}
                {stats.withinLimit ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Within limit
                    {stats.remaining >= 0 && stats.remaining < 20 && (
                      <> ({stats.remaining} left)</>
                    )}
                  </span>
                ) : (
                  <span className="text-destructive">
                    Over by {Math.abs(stats.remaining)} character
                    {Math.abs(stats.remaining) === 1 ? "" : "s"}
                  </span>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
