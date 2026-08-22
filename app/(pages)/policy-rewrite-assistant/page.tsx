"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function rewritePolicy(text: string, tone: string): string {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\bshall\b/gi, "must")
    .replace(/\butilize\b/gi, "use")
    .trim();

  if (tone === "friendly") {
    return `Friendly rewrite:\n\n${cleaned.replace(/\bmust\b/gi, "should")}`;
  }
  if (tone === "strict") {
    return `Strict rewrite:\n\n${cleaned.replace(/\bshould\b/gi, "must")}`;
  }
  return `Professional rewrite:\n\n${cleaned}`;
}

export default function PolicyRewriteAssistantPage() {
  const { ensureAccess } = useToolAccess();
  const [policy, setPolicy] = useState("");
  const [tone, setTone] = useState("professional");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const trimmed = policy.trim();
    if (!trimmed) return "";
    return rewritePolicy(trimmed, tone);
  }, [policy, tone]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Policy Rewrite Assistant</h1>
          <p className="mt-1 text-muted-foreground">
            Rewrite policy text into a cleaner style. Choose tone and generate an improved draft.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="policy-tone">Tone</Label>
          <select
            id="policy-tone"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="strict">Strict</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="policy-input">Policy text</Label>
          <textarea
            id="policy-input"
            className="w-full min-h-[180px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Paste policy text..."
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!result} className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            Rewrite policy
          </Button>
        </div>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Rewritten output</Label>
            <div className="w-full min-h-[140px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
