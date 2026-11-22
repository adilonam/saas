"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";
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

export default function CountdownTimerGeneratorPage() {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const target = useMemo(() => parseTarget(dateStr, timeStr), [dateStr, timeStr]);

  const tick = useCallback(() => setNow(Date.now()), []);

  useEffect(() => {
    if (!unlocked || !target) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlocked, target, tick]);

  const remaining = useMemo(() => {
    if (!target) return null;
    return splitRemaining(target.getTime() - now);
  }, [target, now]);

  const handleStart = () => {
    if (!target) return;
    setUnlocked(true);
    setNow(Date.now());
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Countdown Timer Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Live countdown to any future date and time
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
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cd-time">Target time</Label>
              <Input
                id="cd-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleStart} disabled={!target} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Start countdown
          </Button>

          {unlocked && target && remaining && (
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
                Target (ISO): {target.toISOString()}
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Create a Countdown Timer</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Our countdown timer generator creates a live, real-time countdown to any date and time you specify. Perfect for events, launches, deadlines, or celebrations.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">How It Works</h3>
          <p className="text-slate-600 dark:text-slate-300">
            The countdown timer calculates the difference between your target date/time and the current moment, updating every second:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Remaining Time = Target DateTime - Current DateTime<br/>
            Updated every 1 second
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Product Launch Countdown</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Target:</strong> December 1, 2026 at 09:00</li>
              <li><strong>Current:</strong> November 22, 2026 at 15:30</li>
              <li><strong>Remaining:</strong> 8 days, 17 hours, 30 minutes</li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              The countdown updates live, showing the precise time remaining until your event.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Common Use Cases</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Product Launches:</strong> Build anticipation for new releases or features</li>
            <li><strong>Events:</strong> Countdown to conferences, webinars, or celebrations</li>
            <li><strong>Holidays:</strong> Track time until Christmas, New Year, or birthdays</li>
            <li><strong>Deadlines:</strong> Monitor time remaining for projects or submissions</li>
            <li><strong>Sales:</strong> Create urgency for limited-time offers or flash sales</li>
            <li><strong>Personal Goals:</strong> Motivate yourself toward important milestones</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Tips for Effective Countdowns</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Be Specific:</strong> Include both date and time for precision</li>
            <li><strong>Time Zone:</strong> The countdown uses your local time zone automatically</li>
            <li><strong>Keep It Visible:</strong> Place countdowns prominently where your audience will see them</li>
            <li><strong>Add Context:</strong> Explain what happens when the countdown reaches zero</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What happens when the countdown reaches zero?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                When the target time is reached, the countdown will show all zeros. If you keep it running past the target, it will show how much time has elapsed since the target time.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What time zone does the countdown use?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The countdown uses your local time zone (the browser's time zone). If you're coordinating across time zones, make sure everyone knows which time zone the target time is in.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How accurate is the countdown timer?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The countdown updates every second and is accurate to within 1 second. It automatically adjusts for daylight saving time changes.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Can I create a countdown for a date far in the future?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes! The countdown works for any future date your browser supports (typically up to year 2100 and beyond). It's perfect for long-term goals or milestones.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Will the countdown keep running if I close the page?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                No, the countdown runs in your browser and stops when you close the page. When you return and start it again, it will show the current time remaining to your target.
              </p>
            </details>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/christmas-countdown"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Christmas Countdown</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Live countdown to Christmas Day
              </p>
            </Link>
            <Link
              href="/new-year-countdown"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">New Year Countdown</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Count down to the new year
              </p>
            </Link>
            <Link
              href="/time-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Duration Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate elapsed time between two dates
              </p>
            </Link>
            <Link
              href="/pomodoro-timer"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Pomodoro Timer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Productivity timer with work and break intervals
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
