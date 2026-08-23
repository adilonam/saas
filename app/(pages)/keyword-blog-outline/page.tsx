"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QueueListIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";
import { heuristicKeywordOutline } from "@/lib/keyword-outline-heuristic";

export default function KeywordBlogOutlinePage() {
  const { ensureAccess } = useToolAccess();
  const [keywords, setKeywords] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [aiOutline, setAiOutline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quick = useMemo(() => heuristicKeywordOutline(keywords), [keywords]);

  const run = () => {
    if (!ensureAccess()) return;
    if (!keywords.trim()) {
      setError("Enter at least one keyword.");
      return;
    }
    setError(null);
    setUnlocked(true);
    setAiOutline("");
  };

  const runAi = async () => {
    if (!ensureAccess()) return;
    const k = keywords.trim();
    if (!k) return;
    setLoading(true);
    setError(null);
    setAiOutline("");
    try {
      const res = await fetch("/api/keyword-blog-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: k }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "Outline failed.");
        return;
      }
      setAiOutline(data.text ?? "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/30">
            <QueueListIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Keyword → blog outline</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Instant heuristic outline from a keyword list, plus optional AI structure (no PDF).
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="kw">Keywords (comma or line separated)</Label>
          <textarea
            id="kw"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="remote onboarding, IT security, small teams"
            className="min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="button" onClick={run}>
            Build outlines
          </Button>
          {error && !unlocked && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        {unlocked && (
          <div className="space-y-6 rounded-xl border border-input bg-muted/30 p-6">
            <div>
              <p className="text-sm font-medium text-foreground">Quick heuristic outline</p>
              <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-xs text-foreground">
                {quick || "Add keywords to see a scaffold."}
              </pre>
            </div>
            <div className="border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={runAi} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Optional AI outline"
                )}
              </Button>
              {error && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              {aiOutline && (
                <pre className="mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-xs text-foreground">
                  {aiOutline}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
