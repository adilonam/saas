"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { graphemeCount } from "@/lib/grapheme-count";
import Link from "next/link";

const YOUTUBE_TITLE_MAX = 100;

const FAQ_ITEMS = [
  {
    q: "What is YouTube's title character limit?",
    a: "YouTube allows up to 100 characters in a video title. Titles longer than that are truncated when you save. This checker counts grapheme clusters so emoji are counted the way users typically expect.",
  },
  {
    q: "Why count graphemes instead of JavaScript string length?",
    a: "Some characters (especially emoji and combined symbols) use multiple code units in JavaScript. Grapheme counting better matches what people see as one character when scanning a title.",
  },
  {
    q: "Do titles need to use the full 100 characters?",
    a: "No. Shorter, clearer titles often read better in search results and on mobile. Use the limit as a ceiling, not a goal—front-load the important words.",
  },
  {
    q: "Is the YouTube title length checker free?",
    a: "Yes. It runs entirely in your browser with no signup. Paste a title and see the count update instantly.",
  },
  {
    q: "Does UTF-8 byte size matter for YouTube titles?",
    a: "YouTube's published title limit is character-based (100). Byte size is shown as an extra detail for technical curiosity; focus on staying within the 100-character grapheme limit.",
  },
];

export default function YouTubeTitleLengthCheckerPage() {
  const [title, setTitle] = useState("");

  const stats = useMemo(() => {
    const graphemes = graphemeCount(title);
    const bytes = new TextEncoder().encode(title).length;
    return {
      graphemes,
      bytes,
      withinLimit: graphemes <= YOUTUBE_TITLE_MAX,
      remaining: YOUTUBE_TITLE_MAX - graphemes,
    };
  }, [title]);

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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30">
            <PlayCircleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              YouTube Title Length Checker
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free character counter for YouTube titles—including emoji—against the 100-character limit.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Video title</Label>
            <textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paste or type your title…"
              className="min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Results</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <span className="font-medium text-slate-900 dark:text-white">Grapheme count:</span>{" "}
                {stats.graphemes} / {YOUTUBE_TITLE_MAX}
              </li>
              <li>
                <span className="font-medium text-slate-900 dark:text-white">UTF-8 size:</span>{" "}
                {stats.bytes} bytes
              </li>
              <li>
                <span className="font-medium text-slate-900 dark:text-white">Status:</span>{" "}
                {stats.withinLimit ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Within limit
                    {title.length > 0 && stats.remaining >= 0 && stats.remaining < 20 && (
                      <> ({stats.remaining} left)</>
                    )}
                  </span>
                ) : (
                  <span className="text-destructive">
                    Over by {Math.abs(stats.remaining)} character
                    {Math.abs(stats.remaining) === 1 ? "" : "s"}
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Check YouTube Title Length</h2>
          <p className="text-slate-600 dark:text-slate-300">
            YouTube caps video titles at 100 characters. This free YouTube title length checker updates as you type
            so you can trim titles before they get cut off in Studio.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Why length matters</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>Titles over 100 characters cannot be saved as entered.</li>
            <li>Search and suggested-video UIs often show even fewer characters on small screens.</li>
            <li>Putting the main topic first helps viewers and search understand the video quickly.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Illustrative example</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">Example title</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              How to Check YouTube Title Length (Free Tool + Tips)
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This sample is well under 100 characters, leads with the topic, and leaves room for a clarifying phrase.
              Illustrative only—adapt to your video.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Practical tips</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Front-load keywords:</strong> say what the video is about in the first half of the title.</li>
            <li><strong>Use emoji carefully:</strong> they count toward the limit and can push you over unexpectedly.</li>
            <li><strong>Skip filler:</strong> words like “amazing” or “you won’t believe” rarely help clarity.</li>
            <li><strong>Match the thumbnail:</strong> title and thumbnail should tell one coherent story.</li>
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
              href="/youtube-title-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">YouTube Title Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate title ideas for your next video
              </p>
            </Link>
            <Link
              href="/hashtag-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Hashtag Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate relevant hashtags for social content
              </p>
            </Link>
            <Link
              href="/ai-email-subject-line"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Email Subject Line Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Craft short, clear subject lines with AI
              </p>
            </Link>
            <Link
              href="/meta-description-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Meta Description Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Write concise meta descriptions for web pages
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
