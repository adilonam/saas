"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";
import { splitTextIntoChunks, graphemeLength } from "@/lib/thread-split";

const PRESETS = [
  { id: "bsky", label: "Bluesky (300 graphemes)", limit: 300, grapheme: true },
  { id: "threads", label: "Threads (500 characters)", limit: 500, grapheme: false },
  { id: "x", label: "X / Twitter (280 graphemes)", limit: 280, grapheme: true },
] as const;

function splitByGraphemes(text: string, maxLen: number): string[] {
  const t = text.trim();
  if (!t) return [];

  let segments: string[];
  try {
    const Seg = Intl.Segmenter;
    if (typeof Seg === "function") {
      const seg = new Seg(undefined, { granularity: "grapheme" });
      segments = [...seg.segment(t)].map((s) => s.segment);
    } else {
      segments = [...t];
    }
  } catch {
    segments = [...t];
  }

  const chunks: string[] = [];
  let buf = "";
  for (const g of segments) {
    const combined = buf + g;
    if (graphemeLength(combined) <= maxLen) {
      buf = combined;
    } else {
      if (buf.trim()) chunks.push(buf.trim());
      buf = g;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export default function SocialThreadSplitterPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["id"]>("bsky");
  const [unlocked, setUnlocked] = useState(false);

  const cfg = PRESETS.find((p) => p.id === preset)!;

  const parts = useMemo(() => {
    const t = text.trim();
    if (!t) return [];
    if (cfg.grapheme) return splitByGraphemes(t, cfg.limit);
    return splitTextIntoChunks(t, cfg.limit);
  }, [text, cfg]);

  const numbered = useMemo(() => {
    const n = parts.length;
    return parts.map((p, i) => `${i + 1}/${n}\n\n${p}`);
  }, [parts]);

  const run = () => {
    if (!ensureAccess()) return;
    if (!text.trim()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30">
            <ListBulletIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Social thread splitter</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Split a long post into a numbered thread using common platform limits.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="preset">Platform limit</Label>
          <select
            id="preset"
            value={preset}
            onChange={(e) => setPreset(e.target.value as (typeof PRESETS)[number]["id"])}
            className="h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <Label htmlFor="post">Post text</Label>
          <textarea
            id="post"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste long post…"
          />
          <Button type="button" onClick={run}>
            Split into thread
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-3 rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">
              {parts.length} segment{parts.length === 1 ? "" : "s"} · {cfg.label}
            </p>
            <textarea
              readOnly
              className="min-h-[280px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={numbered.join("\n\n— — —\n\n")}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
