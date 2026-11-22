"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseTime(value: string): number {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return 0;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] != null ? parseInt(match[3], 10) : 0;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return 0;
  return h * 3600 + m * 60 + s;
}

function dateTimeToMs(dateStr: string, timeStr: string): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const sec = parseTime(timeStr);
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t.getTime() + sec * 1000;
}

function formatDuration(totalSeconds: number): string {
  const SEC_PER_DAY = 24 * 3600;
  const days = Math.floor(totalSeconds / SEC_PER_DAY);
  const rest = Math.floor(totalSeconds % SEC_PER_DAY);
  const h = Math.floor(rest / 3600);
  const m = Math.floor((rest % 3600) / 60);
  const s = rest % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (h) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} min${m !== 1 ? "s" : ""}`);
  if (s || parts.length === 0) parts.push(`${s} sec${s !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

function getTodayStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export default function DurationCalculatorPage() {
  const today = getTodayStr();
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("17:30");

  const durationResult = useMemo(() => {
    const startMs = dateTimeToMs(startDate, startTime);
    const endMs = dateTimeToMs(endDate, endTime);
    if (startMs == null || endMs == null) return null;
    const diffMs = endMs - startMs;
    if (diffMs < 0) return null;
    return Math.floor(diffMs / 1000);
  }, [startDate, startTime, endDate, endTime]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Duration Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculate elapsed time between two dates and times
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time">Start time</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-xl h-11 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time">End time</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-xl h-11 font-mono"
            />
          </div>

          {durationResult != null && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Duration</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatDuration(durationResult)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Total seconds: {durationResult.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Calculate Duration Between Two Times</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Our duration calculator finds the elapsed time between two dates and times. Simply enter your start and end points, and the calculator instantly shows the difference in days, hours, minutes, and seconds.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Formula</h3>
          <p className="text-slate-600 dark:text-slate-300">
            The duration calculation works by converting both dates to timestamps (milliseconds since epoch), subtracting them, and formatting the result:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Duration = End DateTime - Start DateTime
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Project Duration</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Start:</strong> Nov 1, 2026 at 09:00</li>
              <li><strong>End:</strong> Nov 22, 2026 at 17:30</li>
              <li><strong>Duration:</strong> 21 days, 8 hours, 30 minutes</li>
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              This calculation is useful for tracking project timelines, work hours, event durations, or any time-based measurement.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Common Use Cases</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Project Management:</strong> Calculate total time spent on tasks or projects</li>
            <li><strong>Time Tracking:</strong> Measure work hours or billable time</li>
            <li><strong>Event Planning:</strong> Determine event duration or countdown remaining</li>
            <li><strong>Academic:</strong> Calculate study time, exam duration, or semester length</li>
            <li><strong>Personal:</strong> Track exercise duration, travel time, or life milestones</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How do I calculate duration across different time zones?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                This calculator uses your local time zone. If you need to calculate duration across time zones, convert one of the times to your local zone first, or use the actual local times if you're measuring wall-clock duration.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Can I calculate duration for dates in the past?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes! The calculator works for any date range, past or future. Just ensure your end date/time is after your start date/time.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What's the maximum duration I can calculate?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The calculator supports any date range your browser can handle (typically from year 1900 to beyond 2100), making it suitable for historical research or long-term planning.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Does the calculator account for daylight saving time?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes, the calculator automatically accounts for daylight saving time transitions in your time zone when calculating durations that span those transitions.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How accurate is the duration calculation?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The calculator is accurate to the second level. It accounts for varying month lengths, leap years, and all calendar irregularities automatically.
              </p>
            </details>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/countdown-timer-generator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Countdown Timer Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Live countdown to any future date and time
              </p>
            </Link>
            <Link
              href="/age-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Age Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate exact age from date of birth
              </p>
            </Link>
            <Link
              href="/work-hours-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Work Hours Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate total work hours for payroll or timesheets
              </p>
            </Link>
            <Link
              href="/pomodoro-timer"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
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
