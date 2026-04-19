"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";

export default function PlainLanguageRewriterPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  const run = async () => {
    if (!ensureAccess()) return;
    const t = text.trim();
    if (!t) {
      setError("Enter text to simplify.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const res = await fetch("/api/plain-language-rewriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "Request failed.");
        return;
      }
      setResult(data.text ?? "");
      setShown(true);
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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-900/30">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Plain language rewriter</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Short sentences, common words, and active voice—while keeping your facts intact.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="src">Source text</Label>
          <textarea
            id="src"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste policy text, email, or help article…"
          />
          <Button type="button" onClick={run} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rewriting…
              </>
            ) : (
              "Rewrite in plain language"
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        {shown && result && (
          <div className="space-y-2 rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">Plain version</p>
            <div className="whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-sm text-foreground">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
