"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HashtagIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

/** Matches #word tokens; allows letters, numbers, underscore, and common Unicode letters. */
const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

function extractHashtags(text: string): string[] {
  return text.match(HASHTAG_RE) ?? [];
}

export default function HashtagCounterPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const analysis = useMemo(() => {
    const tags = extractHashtags(text);
    const lower = tags.map((t) => t.toLowerCase());
    const unique = new Set(lower);
    return {
      total: tags.length,
      uniqueCount: unique.size,
      tags,
      duplicates: tags.length - unique.size,
    };
  }, [text]);

  const handleCount = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
            <HashtagIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Hashtag counter</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Count hashtags in captions or bios. Case-insensitive unique tally included.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="caption">Caption or text</Label>
          <textarea
            id="caption"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="#creator #tools #social"
            className="min-h-[140px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="button" onClick={handleCount} className="gap-2">
            Count hashtags
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">Results</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Total hashtags:</span>{" "}
                {analysis.total}
              </li>
              <li>
                <span className="font-medium text-foreground">Unique (case-insensitive):</span>{" "}
                {analysis.uniqueCount}
              </li>
              {analysis.duplicates > 0 && (
                <li>
                  <span className="font-medium text-foreground">Repeated tags:</span>{" "}
                  {analysis.duplicates}
                </li>
              )}
            </ul>
            {analysis.tags.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Found
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.tags.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="rounded-md bg-background px-2 py-1 font-mono text-xs text-foreground ring-1 ring-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.total === 0 && (
              <p className="text-sm text-muted-foreground">No hashtags detected in this text.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
