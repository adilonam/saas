"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LightBulbIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const FORMATS = [
  { id: "any", label: "Any" },
  { id: "blog", label: "Blog posts" },
  { id: "social", label: "Social media" },
  { id: "video", label: "Videos / YouTube" },
  { id: "newsletter", label: "Newsletter" },
  { id: "podcast", label: "Podcast" },
];

export default function ContentIdeaGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("any");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/content-idea-generator")}`,
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
    if (!topic.trim()) {
      setError("Enter a topic.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIdeas([]);

    try {
      const res = await fetch("/api/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), format }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "subscription_required" || data.error === "Active subscription required") {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Failed to generate ideas");
        return;
      }
      setIdeas(data.ideas ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Content Idea Generator
          </h1>
          <p className="mt-1 text-muted-foreground">
            Get 10 content ideas for your topic. Choose a format for better suggestions.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or niche</Label>
            <input
              id="topic"
              type="text"
              placeholder="e.g. productivity, cooking, SaaS"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    format === f.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="gap-2 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate ideas
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {ideas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5" />
              Content ideas
            </h2>
            <ol className="list-decimal list-inside space-y-2 rounded-lg border border-input bg-muted/30 p-4">
              {ideas.map((idea, i) => (
                <li key={i} className="text-sm text-foreground">
                  {idea}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
