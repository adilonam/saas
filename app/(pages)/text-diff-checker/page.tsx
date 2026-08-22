"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { lineBasedDiff, type DiffLine } from "@/lib/text-productivity";

export default function TextDiffCheckerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [diff, setDiff] = useState<DiffLine[]>([]);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/text-diff-checker")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setDiff(lineBasedDiff(left, right));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <DocumentDuplicateIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Text Diff Checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Line-by-line comparison (left vs right)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diff-left">Original (left)</Label>
              <textarea
                id="diff-left"
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-mono"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diff-right">Revised (right)</Label>
              <textarea
                id="diff-right"
                value={right}
                onChange={(e) => setRight(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-mono"
                spellCheck={false}
              />
            </div>
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <DocumentDuplicateIcon className="h-4 w-4" />
            Compare texts
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Green = only in right, red = only in left, muted = unchanged
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[min(400px,50vh)] overflow-y-auto font-mono text-sm">
                {diff.length === 0 ? (
                  <p className="p-4 text-slate-500">Both sides are empty.</p>
                ) : (
                  diff.map((row, i) => (
                    <div
                      key={i}
                      className={
                        row.type === "insert"
                          ? "px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 border-l-4 border-emerald-500"
                          : row.type === "delete"
                            ? "px-3 py-1 bg-rose-100/80 dark:bg-rose-900/30 border-l-4 border-rose-500"
                            : "px-3 py-1 bg-slate-100/50 dark:bg-slate-800/40 border-l-4 border-transparent"
                      }
                    >
                      <span className="text-slate-400 dark:text-slate-500 select-none w-6 inline-block">
                        {row.type === "insert" ? "+" : row.type === "delete" ? "−" : " "}
                      </span>
                      {row.content || " "}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
