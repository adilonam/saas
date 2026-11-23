"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "What should I enter into the AI resume bullet point generator?",
    a: "Describe your role and what you actually did: job title, company context, tasks, tools, and any numbers you know (revenue, users, time saved, team size). Rough notes are fine—the generator turns them into polished bullets.",
  },
  {
    q: "Are the resume bullets ATS-friendly?",
    a: "Bullets use clear action verbs and plain language, which works well for most applicant tracking systems. Avoid stuffing unusual symbols or graphics into the text you paste into your resume.",
  },
  {
    q: "Should every bullet include a number?",
    a: "Quantify when you can (percentages, dollar amounts, counts, timelines). If you do not have exact metrics, focus on scope, ownership, and outcomes in qualitative terms rather than inventing numbers.",
  },
  {
    q: "Is this AI resume bullet generator free?",
    a: "Yes. It is free to use with no signup or subscription required. You can generate bullets as often as you need for job applications.",
  },
  {
    q: "How do I make AI-generated bullets sound like me?",
    a: "Edit the output: keep verbs and structure that fit your voice, verify every claim against your real experience, and align wording with the job description keywords you honestly match.",
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
              AI Resume Bullet Point Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free AI resume bullet generator—turn raw experience into achievement-focused bullets. No signup.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-foreground">
              Role and experience
            </label>
            <textarea
              id="prompt"
              className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Software Engineer at Acme. Built APIs, led 2 juniors, reduced latency by 40%."
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
          <h2 className="text-2xl font-bold mb-4">How the AI Resume Bullet Point Generator Works</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Strong resume bullets emphasize outcomes, not just duties. This free AI resume bullet point generator
            rewrites your notes into concise lines that start with action verbs and highlight impact.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Steps</h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Paste your job title and raw experience (tasks, tools, scope, metrics).</li>
            <li>Click generate—the model returns only bullet points, one per line.</li>
            <li>Edit for accuracy, then copy into your resume or LinkedIn profile.</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3">Illustrative example</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">Input (rough notes)</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Marketing coordinator. Ran email campaigns. Helped redesign landing page. Worked with sales on webinars.
            </p>
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">Example output style</p>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Planned and sent email campaigns supporting product launches and nurture sequences</li>
              <li>Collaborated on landing page refreshes to clarify messaging and calls to action</li>
              <li>Partnered with sales to coordinate webinar promotion and follow-up content</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Illustrative only—always verify wording against your real experience.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Tips for better bullets</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Lead with verbs:</strong> Led, Built, Reduced, Launched, Owned, Designed.</li>
            <li><strong>Prefer results over tasks:</strong> what changed because you did the work.</li>
            <li><strong>Match the job ad honestly:</strong> mirror relevant skills you actually used.</li>
            <li><strong>Keep bullets short:</strong> roughly one to two lines each for readability.</li>
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
              href="/ai-email-subject-line"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Email Subject Line Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create compelling email subject lines with AI
              </p>
            </Link>
            <Link
              href="/ai-cold-outreach"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Cold Outreach Writer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Draft personalized cold outreach messages
              </p>
            </Link>
            <Link
              href="/acceptance-criteria-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Acceptance Criteria Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate clear acceptance criteria for user stories
              </p>
            </Link>
            <Link
              href="/meta-description-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Meta Description Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Write concise meta descriptions for pages
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
