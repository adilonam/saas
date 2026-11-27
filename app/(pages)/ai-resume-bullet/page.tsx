"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "What is a resume bullet point generator?",
    a: "It turns rough notes about your role—tasks, tools, scope, and results—into concise achievement-focused bullets. This free AI resume bullet point generator returns one bullet per line so you can edit and paste into a resume or LinkedIn profile.",
  },
  {
    q: "What formula should resume bullet points follow?",
    a: "A reliable structure is: action verb + task or ownership + measurable result (or clear scope when you lack a number). STAR (Situation, Task, Action, Result) is useful for interviews; on a resume, compress Action + Result into one line.",
  },
  {
    q: "Are the resume bullets ATS-friendly?",
    a: "Bullets use clear action verbs and plain language, which works well for most applicant tracking systems. Avoid unusual symbols or graphics in the text you paste into your resume.",
  },
  {
    q: "Should every bullet include a number?",
    a: "Quantify when you can (counts, timelines, dollar amounts you actually know). If you do not have exact metrics, describe scope, ownership, and outcomes in honest qualitative terms—never invent numbers.",
  },
  {
    q: "Is this resume bullet point generator free?",
    a: "Yes. It is free with no signup or subscription. Generate and edit bullets as often as you need for applications.",
  },
];

export default function AIResumeBulletPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Please enter your role and experience details.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult("");

    try {
      const res = await fetch("/api/ai-resume-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate resume bullets");
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

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Resume Bullet Point Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free AI resume bullet point generator—turn duties into achievement-focused bullets. No signup.
            </p>
          </div>
        </div>

        <p className="mb-8 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          Paste your role and raw experience below. For the writing formula, before/after examples, and
          common mistakes, read{" "}
          <a
            href="/blog/how-to-write-resume-bullet-points"
            className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:text-violet-700"
          >
            how to write resume bullet points
          </a>
          .
        </p>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-foreground">
              Role and experience
            </label>
            <textarea
              id="prompt"
              className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Software Engineer at Acme. Built APIs, led 2 juniors, reduced latency for checkout requests."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            <Button onClick={handleSubmit} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate resume bullets
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Resume bullets
              </p>
              <div className="w-full min-h-[120px] rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4 text-sm text-foreground whitespace-pre-wrap">
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

        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Write Strong Resume Bullet Points</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Strong resume bullets emphasize outcomes, not just duties. This free{" "}
            <strong>resume bullet point generator</strong> rewrites your notes into concise lines that
            start with action verbs and highlight impact. Always verify every claim against your real
            experience—never invent metrics.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Formula: Action Verb + Task + Result</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 not-prose">
            [Action verb] + [what you owned or did] + [measurable result or clear scope]
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Prefer verbs such as Led, Built, Reduced, Launched, Designed, Owned, Automated, or Negotiated.
            Put the result as close to the end of the line as you can so a skimming reader still catches impact.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">STAR on a Resume (Compressed)</h3>
          <p className="text-slate-600 dark:text-slate-300">
            STAR (Situation, Task, Action, Result) is excellent for interviews. On a resume, keep Situation
            and Task short or implied, and lead with Action + Result:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Situation / Task:</strong> context only if needed (team size, product area)
            </li>
            <li>
              <strong>Action:</strong> what you personally did
            </li>
            <li>
              <strong>Result:</strong> what changed—numbers when honest, otherwise concrete outcomes
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Before / After Examples (illustrative)</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose space-y-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Weak (duty-only)</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Responsible for managing social media accounts and posting content.
              </p>
              <p className="font-semibold text-slate-900 dark:text-white mt-3 mb-1">Stronger (illustrative rewrite)</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Planned and published weekly social content across LinkedIn and Instagram, coordinating
                with product launches and tracking engagement trends.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Weak</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Helped the engineering team with APIs and bug fixes.
              </p>
              <p className="font-semibold text-slate-900 dark:text-white mt-3 mb-1">Stronger (illustrative rewrite)</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Built and maintained REST APIs for checkout flows; partnered with QA to triage and resolve
                production defects before release windows.
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Illustrative only—replace with your real scope and metrics. Do not invent percentages or revenue.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Steps to use this generator</h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Paste your job title and raw experience (tasks, tools, scope, metrics you actually know).</li>
            <li>Generate—the model returns only bullet points, one per line.</li>
            <li>Edit for accuracy and voice, then copy into your resume or LinkedIn.</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3">Tips for better bullets</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Lead with verbs:</strong> avoid “Responsible for…” and “Helped with…”
            </li>
            <li>
              <strong>Prefer results over tasks:</strong> what changed because you did the work
            </li>
            <li>
              <strong>Match the job ad honestly:</strong> mirror skills you actually used
            </li>
            <li>
              <strong>Keep bullets short:</strong> roughly one to two lines each for readability
            </li>
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
          <h2 className="text-xl font-bold mb-4">Related Tools &amp; Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/resume-skills-gap"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Resume Skills Gap Suggester
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compare your resume language to a job description
              </p>
            </Link>
            <Link
              href="/linkedin-headline-combiner"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                LinkedIn Headline Combiner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Combine role keywords into a clear headline
              </p>
            </Link>
            <Link
              href="/ai-cold-outreach"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                AI Cold Outreach Writer
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Draft personalized cold outreach messages
              </p>
            </Link>
            <Link
              href="/ai-email-subject-line"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                AI Email Subject Line Generator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create compelling email subject lines with AI
              </p>
            </Link>
            <a
              href="/blog/how-to-write-resume-bullet-points"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50 sm:col-span-2"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Guide: How to Write Resume Bullet Points
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Formula, before/after examples, tips by role, and common mistakes
              </p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
