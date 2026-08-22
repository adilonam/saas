"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";

function leadingDepth(line: string): { depth: number; text: string } {
  let indent = 0;
  let i = 0;
  while (i < line.length) {
    if (line[i] === " ") indent += 1;
    else if (line[i] === "\t") indent += 4;
    else break;
    i++;
  }
  const depth = Math.floor(indent / 2);
  const text = line.slice(i).replace(/^[-*•]\s*/, "").trim();
  return { depth, text };
}

function linesToIndentedTree(lines: string[]): string {
  type Node = { title: string; depth: number; children: Node[] };
  const parsed: { depth: number; text: string }[] = [];
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const { depth, text } = leadingDepth(raw);
    if (text) parsed.push({ depth, text });
  }
  if (parsed.length === 0) return "";

  const root: Node = { title: "__root__", depth: -1, children: [] };
  const stack: Node[] = [root];

  for (const row of parsed) {
    const node: Node = { title: row.text, depth: row.depth, children: [] };
    while (stack.length > 1 && stack[stack.length - 1].depth >= row.depth) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  function emit(n: Node, pad: string): string[] {
    const out: string[] = [];
    if (n.depth >= 0) out.push(`${pad}${n.title}`);
    const nextPad = n.depth < 0 ? "" : `${pad}  `;
    for (const c of n.children) out.push(...emit(c, nextPad));
    return out;
  }
  return emit(root, "").join("\n");
}

export default function MindMapOutlinerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [outline, setOutline] = useState(
    "Course overview\n  Week 1\n    Reading\n    Lab\n  Week 2\n    Exam prep",
  );
  const [exported, setExported] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const preview = useMemo(() => {
    const lines = outline.split(/\r\n|\r|\n/);
    return linesToIndentedTree(lines);
  }, [outline]);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/mind-map-outliner")}`);
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handleExport = () => {
    if (!gate()) return;
    setExported(preview);
    setUnlocked(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exported || preview);
    } catch {
      /* ignore */
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <Bars3BottomLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mind-map bullet outliner</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Two spaces (or a tab as four spaces) per indent level; export a clean indented tree
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mmo-in">Outline</Label>
            <textarea
              id="mmo-in"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-mono"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleExport}>
            Build export
          </Button>

          {unlocked && (
            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Live preview</p>
                <pre className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 overflow-x-auto whitespace-pre-wrap min-h-[160px]">
                  {preview || "—"}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Export buffer</p>
                <pre className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 p-4 overflow-x-auto whitespace-pre-wrap min-h-[160px]">
                  {exported || preview}
                </pre>
                <Button type="button" variant="outline" size="sm" onClick={copy}>
                  Copy to clipboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
