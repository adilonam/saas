"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "What makes a good AI-generated email subject line?",
    a: "Clarity, relevance, and specificity. The best lines preview the value of the email without clickbait. Keep them short enough to read on mobile and honest about what is inside.",
  },
  {
    q: "How many subject line ideas does this generator create?",
    a: "It aims for five concise options per run so you can A/B test or pick the tone that fits your audience—direct, curious, benefit-led, or time-sensitive.",
  },
  {
    q: "Can I use this for newsletters and cold outreach?",
    a: "Yes. Describe the audience and goal (product launch, weekly tip, follow-up, event invite). For cold email, pair a clear subject with a short, personalized body—try our cold outreach tool for the message itself.",
  },
  {
    q: "Is the AI email subject line generator free?",
    a: "Yes. It is free with no signup or paywall. Generate as many batches as you need for campaigns and tests.",
  },
  {
    q: "Should subject lines include emojis or ALL CAPS?",
    a: "Use sparingly. One relevant emoji can work for some brands; ALL CAPS often looks spammy. Prefer concrete language over hype, and match your brand voice.",
  },
];

export default function AIEmailSubjectLinePage() {
  const [prompt, setPrompt] = useState(
    "Product launch: New project management tool for remote teams"
  );
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a topic or description.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai-email-subject-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate subject lines");
        return;
      }
      if (data.text) {
        setResult(data.text);
      } else {
        setError("No subject lines were generated.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              AI Email Subject Line Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free AI subject line generator—get five concise ideas for your campaign. No signup.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Topic or description</Label>
            <textarea
              id="prompt"
              className="w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Newsletter about productivity tips for freelancers"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate subject lines
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject lines
              </p>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 space-y-2">
                {result.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-slate-800 dark:text-slate-200">
                    {line.replace(/^[\d.)\-\s]+/, "").trim() || line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How the AI Email Subject Line Generator Works</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Your subject line is often the first (and only) thing someone reads before deciding to open.
            This free AI email subject line generator turns a short brief into several options you can test.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Steps</h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Describe the email: product, audience, offer, or announcement.</li>
            <li>Generate five subject line ideas in one click.</li>
            <li>Pick favorites, tweak brand voice, and send or A/B test.</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3">Illustrative examples</h3>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">Brief</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Weekly newsletter with three productivity tips for freelancers.
            </p>
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">Example idea styles</p>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>3 freelancer habits that protect deep work</li>
              <li>Your Friday focus checklist (quick read)</li>
              <li>Stop context-switching: tips inside</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Illustrative only—actual AI output varies with your prompt.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Practical tips</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Front-load the benefit:</strong> put the useful part early for mobile previews.</li>
            <li><strong>Be specific:</strong> “Q4 roadmap update” beats “Important news.”</li>
            <li><strong>Avoid spam triggers:</strong> excessive punctuation, misleading urgency, and vague freebies.</li>
            <li><strong>Test:</strong> send two honest variants to a slice of your list when your ESP supports it.</li>
          </ul>
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                  {item.q}
                </summary>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/ai-cold-outreach"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Cold Outreach Writer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Draft personalized cold outreach emails
              </p>
            </Link>
            <Link
              href="/ai-resume-bullet"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Resume Bullet Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Turn experience notes into resume bullets
              </p>
            </Link>
            <Link
              href="/meta-description-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Meta Description Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Write concise SEO meta descriptions
              </p>
            </Link>
            <Link
              href="/youtube-title-length-checker"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">YouTube Title Length Checker</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Check titles against YouTube&apos;s character limit
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
