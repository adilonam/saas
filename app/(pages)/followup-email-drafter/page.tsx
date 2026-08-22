"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function draftFollowUp(recipient: string, context: string, ask: string, tone: string): string {
  const greeting = recipient ? `Hi ${recipient},` : "Hi there,";
  const closing = tone === "friendly" ? "Thanks so much," : "Best regards,";
  return [
    `Subject: Quick follow-up`,
    "",
    greeting,
    "",
    `I wanted to follow up on ${context}.`,
    ask ? `Could you please share an update on ${ask}?` : "Could you please share an update when you have a chance?",
    "",
    "Happy to provide anything needed from my side.",
    "",
    closing,
    "[Your Name]",
  ].join("\n");
}

export default function FollowupEmailDrafterPage() {
  const { ensureAccess } = useToolAccess();
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [ask, setAsk] = useState("");
  const [tone, setTone] = useState("professional");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const c = context.trim();
    if (!c) return "";
    return draftFollowUp(recipient.trim(), c, ask.trim(), tone);
  }, [recipient, context, ask, tone]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Follow-up Email Drafter</h1>
          <p className="mt-1 text-muted-foreground">
            Generate a clear follow-up email from your context and requested update.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient name (optional)</Label>
            <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <select id="tone" className="h-10 rounded-md border border-input bg-background px-3 text-sm w-full" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context</Label>
          <textarea
            id="context"
            className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="What are you following up on?"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ask">Specific ask (optional)</Label>
          <Input id="ask" value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="e.g. revised timeline and blockers" />
        </div>

        <Button onClick={handleSubmit} disabled={!result} className="gap-2">
          <SparklesIcon className="h-4 w-4" />
          Draft follow-up email
        </Button>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Email draft</Label>
            <div className="w-full min-h-[180px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
