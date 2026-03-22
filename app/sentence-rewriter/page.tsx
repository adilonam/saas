"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const TONES = [
  { value: "", label: "Default (balanced)" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "concise", label: "More concise" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
];

export default function SentenceRewriterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/sentence-rewriter")}`,
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
    if (!text.trim()) {
      setError("Please enter text to rewrite.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/sentence-rewriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (
          data.code === "subscription_required" ||
          data.error === "Active subscription required"
        ) {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Something went wrong.");
        return;
      }
      setResult(data.text ?? "");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sentence Rewriter</h1>
          <p className="mt-1 text-muted-foreground">
            Improve clarity and flow; optionally steer tone without changing the underlying meaning.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="tone" className="text-sm font-medium text-foreground">
            Tone
          </label>
          <select
            id="tone"
            className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isLoading}
          >
            {TONES.map((t) => (
              <option key={t.value || "default"} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="sr-text" className="text-sm font-medium text-foreground">
            Text
          </label>
          <textarea
            id="sr-text"
            className="w-full min-h-[160px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste sentences or a paragraph…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rewriting…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Rewrite
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Result</label>
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
