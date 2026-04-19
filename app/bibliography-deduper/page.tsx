"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const DOI_RE = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

function normalizeDoi(s: string) {
  return s.trim().toLowerCase();
}

function normTitle(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(the|a|an|of|and|in|for|on)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDoi(block: string): string | null {
  const m = block.match(DOI_RE);
  return m && m[0] ? normalizeDoi(m[0]) : null;
}

function titleKey(block: string): string {
  const lines = block
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^https?:\/\//i.test(l));
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "");
  const n = normTitle(longest);
  return n.slice(0, 120) || normTitle(block).slice(0, 120);
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  const A = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const B = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return inter / Math.max(A.size, B.size);
}

function splitEntries(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const byPara = t.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (byPara.length > 1) return byPara;
  const lines = t.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1 && lines.every((l) => l.length > 40)) return lines;
  return [t];
}

export default function BibliographyDeduperPage() {
  const { assertAccess } = useSubscribedToolAccess("/bibliography-deduper");
  const [text, setText] = useState("");
  const [threshold, setThreshold] = useState("0.72");
  const [result, setResult] = useState<{
    unique: string[];
    removed: { kept: string; drop: string; reason: string }[];
  } | null>(null);

  const previewCount = useMemo(() => splitEntries(text).length, [text]);

  const handleSubmit = () => {
    if (!assertAccess()) return;
    const entries = splitEntries(text);
    const thr = Math.min(0.99, Math.max(0.5, parseFloat(threshold) || 0.72));
    const unique: string[] = [];
    const removed: { kept: string; drop: string; reason: string }[] = [];
    const seenDoi = new Map<string, number>();
    const seenTitles: { key: string; idx: number }[] = [];

    for (const block of entries) {
      const doi = extractDoi(block);
      if (doi) {
        if (seenDoi.has(doi)) {
          const kept = unique[seenDoi.get(doi)!];
          removed.push({ kept: kept.slice(0, 120), drop: block.slice(0, 120), reason: `Same DOI ${doi}` });
          continue;
        }
        seenDoi.set(doi, unique.length);
        unique.push(block);
        continue;
      }

      const tk = titleKey(block);
      let dup = false;
      for (const st of seenTitles) {
        const sim = similarity(tk, st.key);
        if (sim >= thr) {
          const kept = unique[st.idx];
          removed.push({
            kept: kept.slice(0, 120),
            drop: block.slice(0, 120),
            reason: `Title fuzzy match (~${Math.round(sim * 100)}%)`,
          });
          dup = true;
          break;
        }
      }
      if (!dup) {
        seenTitles.push({ key: tk, idx: unique.length });
        unique.push(block);
      }
    }

    setResult({ unique, removed });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bibliography deduper</h1>
          <p className="mt-1 text-muted-foreground">
            One entry per paragraph (or one long citation per line). Matches on DOI first, then fuzzy title overlap.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bib">Bibliography paste</Label>
          <textarea
            id="bib"
            className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Detected ~{previewCount} entries (after split rules).</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="thr">Title match threshold (0.5–0.99)</Label>
            <input
              id="thr"
              type="number"
              step="0.01"
              min={0.5}
              max={0.99}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="h-9 w-28 rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <DocumentDuplicateIcon className="h-4 w-4" />
            Dedupe bibliography
          </Button>
        </div>

        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Unique ({result.unique.length})</p>
              <textarea
                readOnly
                className="w-full min-h-[280px] rounded-lg border border-input bg-muted/30 p-3 text-xs font-mono"
                value={result.unique.join("\n\n---\n\n")}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Removed ({result.removed.length})</p>
              <ul className="text-xs space-y-3 max-h-[320px] overflow-y-auto rounded-lg border border-input p-3">
                {result.removed.length === 0 && <li className="text-muted-foreground">No duplicates found.</li>}
                {result.removed.map((r, i) => (
                  <li key={i} className="border-b border-border pb-2 last:border-0">
                    <p className="text-destructive font-medium">{r.reason}</p>
                    <p className="mt-1 text-muted-foreground line-clamp-2">Dropped: {r.drop}…</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
