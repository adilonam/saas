"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const MAX_LEN = 220;

export default function LinkedInHeadlineCombinerPage() {
  const { assertAccess } = useSubscribedToolAccess("/linkedin-headline-combiner");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [sep, setSep] = useState(" | ");
  const [constraints, setConstraints] = useState(
    "Keep under 220 characters. No emojis unless I add them in segments.",
  );
  const [combined, setCombined] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildLocal = () => {
    const parts = [a, b, c].map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      setError("Add at least one segment.");
      return "";
    }
    const out = parts.join(sep || " ");
    setCombined(out);
    if (out.length > MAX_LEN) {
      setError(`Headline is ${out.length} characters (LinkedIn allows ~${MAX_LEN}). Trim or shorten segments.`);
    } else {
      setError(null);
    }
    return out;
  };

  const handleCombine = () => {
    if (!assertAccess()) return;
    buildLocal();
  };

  const handlePolishAi = async () => {
    if (!assertAccess()) return;
    const draft = combined.trim() || buildLocal();
    if (!draft) return;

    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-linkedin-headline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, constraints: constraints.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setError(data.error || "AI request failed");
        return;
      }
      setCombined(data.text ?? "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">LinkedIn headline combiner</h1>
          <p className="mt-1 text-muted-foreground">
            Merge role, specialty, and proof into one line. Optional AI polish respects your constraints.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="seg-a">Segment 1</Label>
            <Input id="seg-a" value={a} onChange={(e) => setA(e.target.value)} placeholder="e.g. Staff Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seg-b">Segment 2</Label>
            <Input id="seg-b" value={b} onChange={(e) => setB(e.target.value)} placeholder="e.g. Distributed systems" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seg-c">Segment 3 (optional)</Label>
            <Input id="seg-c" value={c} onChange={(e) => setC(e.target.value)} placeholder="e.g. Ex-FAANG · Writing @ blog" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sep">Separator</Label>
            <Input id="sep" value={sep} onChange={(e) => setSep(e.target.value)} placeholder=" | " />
          </div>
          <div className="space-y-2">
            <Label htmlFor="constraints">AI constraints (optional)</Label>
            <textarea
              id="constraints"
              className="w-full min-h-[72px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleCombine} className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Combine headline
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePolishAi}
            disabled={aiLoading || (!a.trim() && !b.trim() && !c.trim() && !combined.trim())}
            className="gap-2"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Polishing…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Polish with AI
              </>
            )}
          </Button>
        </div>

        {combined && (
          <div className="space-y-2 rounded-lg border border-input bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Result</p>
              <span className="text-xs text-muted-foreground">
                {combined.length} / {MAX_LEN}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{combined}</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
