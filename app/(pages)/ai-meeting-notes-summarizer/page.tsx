"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function AIMeetingNotesSummarizerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/ai-meeting-notes-summarizer")}`,
      );
      return;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    if (!prompt.trim()) {
      setError("Please paste your meeting notes.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai-meeting-notes-summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "subscription_required" || data.error === "Active subscription required") {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Failed to summarize");
        return;
      }

      setResult(data.text ?? "");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            AI Meeting Notes Summarizer
          </h1>
          <p className="mt-1 text-muted-foreground">
            Paste meeting notes or a transcript to get a structured summary with key decisions and action items.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium text-foreground">
            Meeting notes
          </label>
          <textarea
            id="prompt"
            className="w-full min-h-[180px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste your meeting transcript or bullet points here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <Button onClick={handleSubmit} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Summarizing…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Summarize
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Summary</label>
            <div className="w-full min-h-[120px] rounded-lg border border-input bg-muted/50 p-4 text-sm text-foreground whitespace-pre-wrap">
              {result}
            </div>
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
