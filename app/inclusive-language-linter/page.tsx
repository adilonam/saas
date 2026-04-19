"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";
import { scanInclusiveLanguage } from "@/lib/inclusive-language-rules";

export default function InclusiveLanguageLinterPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const findings = useMemo(() => scanInclusiveLanguage(text), [text]);

  const runScan = () => {
    if (!ensureAccess()) return;
    if (!text.trim()) {
      setScanError("Please paste some text first.");
      return;
    }
    setScanError(null);
    setAiError(null);
    setUnlocked(true);
    setAiNotes("");
    setAiError(null);
  };

  const runAi = async () => {
    if (!ensureAccess()) return;
    const t = text.trim();
    if (!t) return;
    setAiLoading(true);
    setAiError(null);
    setAiNotes("");
    try {
      const res = await fetch("/api/inclusive-language-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setAiError(data.error || "AI pass failed.");
        return;
      }
      setAiNotes(data.text ?? "");
    } catch {
      setAiError("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/30">
            <ShieldCheckIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Inclusive language linter</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Rule-based highlights for common wording pitfalls, plus an optional AI pass for nuance.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="draft">Draft text</Label>
          <textarea
            id="draft"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste email, post, or doc excerpt…"
            className="min-h-[180px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Button type="button" onClick={runScan} className="gap-2">
            Run rule scan
          </Button>
          {scanError && (
            <p className="text-sm text-destructive" role="alert">
              {scanError}
            </p>
          )}
        </div>

        {unlocked && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">Rule-based findings ({findings.length})</p>
            {findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No starter-rule matches. Try the AI pass for deeper review.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {findings.map((f, i) => (
                  <li key={i} className="rounded-lg border border-border bg-background p-3">
                    <p className="font-medium text-foreground">
                      Line {f.line}: “{f.snippet}”
                    </p>
                    <p className="mt-1 text-muted-foreground">{f.message}</p>
                    <p className="mt-1 text-foreground">Try: {f.suggestion}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={runAi} disabled={aiLoading} className="gap-2">
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI review…
                  </>
                ) : (
                  "Optional AI deeper pass"
                )}
              </Button>
              {aiError && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {aiError}
                </p>
              )}
              {aiNotes && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-sm text-foreground">
                  {aiNotes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
