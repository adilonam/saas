"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  CalculatorIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

function parseTarget(dateStr: string, timeStr: string): Date | null {
  if (!dateStr.trim()) return null;
  const t = timeStr.trim() || "00:00";
  const d = new Date(`${dateStr}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function splitRemaining(ms: number): {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
} {
  if (ms <= 0) {
    const s = Math.floor(Math.abs(ms) / 1000);
    return {
      totalSeconds: s,
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      past: true,
    };
  }
  const s = Math.floor(ms / 1000);
  return {
    totalSeconds: s,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past: false,
  };
}

const FAQ_ITEMS = [
  {
    q: "What is a countdown timer generator?",
    a: "A countdown timer generator (also called a countdown maker or online countdown generator) lets you pick a target date and time and shows the live time remaining in days, hours, minutes, and seconds. This free tool also builds a shareable link and a simple iframe embed snippet for websites.",
  },
  {
    q: "Can I embed this countdown on my website?",
    a: "Yes. After you set a date and time, copy the embed snippet and paste it into your HTML. It loads this countdown page with your target in the URL—no backend or account required. Style and layout follow the eProd page; for fully custom design you would build your own timer.",
  },
  {
    q: "Can I share a countdown for events or social posts?",
    a: "Yes. Use Copy shareable link to send a URL that opens the same target date and time. That works for messaging apps, email, event pages, and social posts that accept links (including Facebook posts or stories that link out).",
  },
  {
    q: "What time zone does the countdown use?",
    a: "The countdown uses your browser’s local time zone. When you share a link, recipients see the same absolute target instant interpreted in their local zone. State the intended zone in your event copy if people join from multiple regions.",
  },
  {
    q: "What happens when the countdown reaches zero?",
    a: "At the target time the display reaches zero. If you leave it running, it shows how much time has elapsed since the target. Closing the tab stops the live tick; reopening the shareable link resumes from the current remaining time.",
  },
  {
    q: "Is the online countdown generator free?",
    a: "Yes. Creating, sharing, and embedding the countdown is free with no signup.",
  },
];

export default function CountdownTimerGeneratorPage() {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);
  const [origin, setOrigin] = useState("https://www.eprod.io");

  const target = useMemo(() => parseTarget(dateStr, timeStr), [dateStr, timeStr]);

  const tick = useCallback(() => setNow(Date.now()), []);

  // Restore target from ?date=&time= share/embed URL (client-only)
  useEffect(() => {
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const d = params.get("date");
    const t = params.get("time");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setDateStr(d);
      if (t && /^\d{2}:\d{2}$/.test(t)) setTimeStr(t);
      setRunning(true);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    if (!running || !target) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, target, tick]);

  const remaining = useMemo(() => {
    if (!target) return null;
    return splitRemaining(target.getTime() - now);
  }, [target, now]);

  const shareUrl = useMemo(() => {
    if (!dateStr) return "";
    const params = new URLSearchParams({ date: dateStr, time: timeStr || "00:00" });
    return `${origin}/countdown-timer-generator?${params.toString()}`;
  }, [origin, dateStr, timeStr]);

  const embedSnippet = useMemo(() => {
    if (!shareUrl) return "";
    return `<iframe src="${shareUrl}" title="Countdown timer" width="100%" height="420" style="border:0;border-radius:12px;max-width:640px;" loading="lazy"></iframe>`;
  }, [shareUrl]);

  const handleStart = () => {
    if (!target) return;
    setRunning(true);
    setNow(Date.now());
  };

  const copyText = async (text: string, kind: "link" | "embed") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard may be blocked; ignore
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
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Countdown Timer Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free online countdown maker — live timer, shareable link, and website embed snippet
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cd-date">Target date</Label>
              <Input
                id="cd-date"
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  setRunning(false);
                }}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cd-time">Target time</Label>
              <Input
                id="cd-time"
                type="time"
                value={timeStr}
                onChange={(e) => {
                  setTimeStr(e.target.value);
                  setRunning(false);
                }}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleStart} disabled={!target} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Start countdown
          </Button>

          {running && target && remaining && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {remaining.past ? (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  That time is in the past — elapsed since target:
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Time remaining</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    ["Days", remaining.days],
                    ["Hours", remaining.hours],
                    ["Minutes", remaining.minutes],
                    ["Seconds", remaining.seconds],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 p-4 text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {val}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 break-all">
                Target (local): {target.toLocaleString()} · ISO: {target.toISOString()}
              </p>

              {shareUrl && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Share or embed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => copyText(shareUrl, "link")}
                    >
                      {copied === "link" ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                      {copied === "link" ? "Link copied" : "Copy shareable link"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => copyText(embedSnippet, "embed")}
                    >
                      {copied === "embed" ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                      {copied === "embed" ? "Snippet copied" : "Copy embed snippet"}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-all">
                    Share URL: {shareUrl}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">
            How to Use This Online Countdown Generator
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            This free <strong>countdown timer generator</strong> (countdown maker / countdown
            creator) builds a live clock to any date and time. Pick a target, start the timer,
            then copy a <strong>shareable link</strong> or a simple <strong>iframe embed</strong>{" "}
            for a website or landing page—no account or backend required.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">How It Works</h3>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Enter the target date and time (your browser’s local time zone).</li>
            <li>Click <strong>Start countdown</strong> to see days, hours, minutes, and seconds update every second.</li>
            <li>Copy the shareable link so others open the same target, or paste the embed snippet into HTML.</li>
          </ol>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 not-prose">
            Remaining = Target DateTime − Current DateTime
            <br />
            Updated every 1 second in the browser
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Illustrative Example</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">Example: Product launch countdown (illustrative)</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Target:</strong> December 1, 2026 at 09:00
              </li>
              <li>
                <strong>If “now” were:</strong> November 22, 2026 at 15:30
              </li>
              <li>
                <strong>Remaining:</strong> 8 days, 17 hours, 30 minutes
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Numbers above are an illustrative walkthrough, not a live reading from your device.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            Use Cases: Websites, Events &amp; Social
          </h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Websites &amp; landing pages:</strong> Embed a launch or sale countdown with
              the iframe snippet (countdown generator for website).
            </li>
            <li>
              <strong>Events &amp; webinars:</strong> Share a link so attendees see the same start
              time.
            </li>
            <li>
              <strong>Social posts:</strong> Link a shareable URL from Facebook, LinkedIn, or
              elsewhere; the timer opens in the browser.
            </li>
            <li>
              <strong>Holidays:</strong> For fixed dates, try the dedicated{" "}
              <Link href="/christmas-countdown">Christmas countdown</Link> or{" "}
              <Link href="/new-year-countdown">New Year countdown</Link>.
            </li>
            <li>
              <strong>Deadlines &amp; personal goals:</strong> Keep a tab open to a project due
              date or milestone.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Tips for Clear Countdowns</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>State the time zone</strong> in your event copy when your audience is
              distributed.
            </li>
            <li>
              <strong>Include both date and time</strong> so midnight vs midday is unambiguous.
            </li>
            <li>
              <strong>Explain what happens at zero</strong> (doors open, sale ends, stream starts).
            </li>
            <li>
              <strong>Prefer a dedicated holiday page</strong> when the date is fixed every year.
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
              href="/christmas-countdown"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Christmas Countdown
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Live countdown to Christmas Day
              </p>
            </Link>
            <Link
              href="/new-year-countdown"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                New Year Countdown
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Count down to the new year
              </p>
            </Link>
            <Link
              href="/time-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Time / Duration Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Elapsed time, periods, and combine durations
              </p>
            </Link>
            <Link
              href="/working-days-countdown"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Working Days Countdown
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Count business days until a date
              </p>
            </Link>
            <a
              href="/blog/how-to-create-a-countdown-timer"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50 sm:col-span-2"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Guide: How to Create a Countdown Timer
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Practical steps for websites, events, and launches
              </p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
