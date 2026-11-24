"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Mode = "elapsed" | "combine";

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

interface DurationRow {
  id: string;
  hours: string;
  minutes: string;
  seconds: string;
  label: string;
}

function emptyRow(): DurationRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    hours: "0",
    minutes: "0",
    seconds: "0",
    label: "",
  };
}

export default function DurationCalculatorPage() {
  const today = getTodayStr();
  const [mode, setMode] = useState<Mode>("elapsed");
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState("17:30");
  const [rows, setRows] = useState<DurationRow[]>([
    { ...emptyRow(), hours: "0", minutes: "12", seconds: "30", label: "Clip A" },
    { ...emptyRow(), hours: "0", minutes: "8", seconds: "45", label: "Clip B" },
  ]);

  const durationResult = useMemo(() => {
    const startMs = dateTimeToMs(startDate, startTime);
    const endMs = dateTimeToMs(endDate, endTime);
    if (startMs == null || endMs == null) return null;
    const diffMs = endMs - startMs;
    if (diffMs < 0) return null;
    return Math.floor(diffMs / 1000);
  }, [startDate, startTime, endDate, endTime]);

  const combinedSeconds = useMemo(() => {
    return rows.reduce((sum, row) => {
      const h = Math.max(0, parseInt(row.hours, 10) || 0);
      const m = Math.max(0, parseInt(row.minutes, 10) || 0);
      const s = Math.max(0, parseInt(row.seconds, 10) || 0);
      return sum + h * 3600 + m * 60 + s;
    }, 0);
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Time Period &amp; Duration Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free elapsed-time and time period calculator—or add and combine durations (video,
              tests, sessions). No signup.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("elapsed")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "elapsed"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Elapsed / time period
          </button>
          <button
            type="button"
            onClick={() => setMode("combine")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "combine"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Add / combine durations
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {mode === "elapsed" ? (
            <>
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
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Elapsed time / period
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatDuration(durationResult)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Total seconds: {durationResult.toLocaleString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Add hours, minutes, and seconds for each segment—useful for summing video lengths,
                test durations, or session blocks into one total.
              </p>
              <div className="space-y-4">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end border-b border-slate-200 dark:border-slate-700 pb-4"
                  >
                    <div className="col-span-2 sm:col-span-3 space-y-1">
                      <Label htmlFor={`label-${row.id}`} className="text-xs">
                        Label (optional)
                      </Label>
                      <Input
                        id={`label-${row.id}`}
                        placeholder={`Duration ${index + 1}`}
                        value={row.label}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, label: e.target.value } : r
                            )
                          )
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor={`h-${row.id}`} className="text-xs">
                        Hours
                      </Label>
                      <Input
                        id={`h-${row.id}`}
                        type="number"
                        min={0}
                        value={row.hours}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, hours: e.target.value } : r
                            )
                          )
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor={`m-${row.id}`} className="text-xs">
                        Minutes
                      </Label>
                      <Input
                        id={`m-${row.id}`}
                        type="number"
                        min={0}
                        value={row.minutes}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, minutes: e.target.value } : r
                            )
                          )
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor={`s-${row.id}`} className="text-xs">
                        Seconds
                      </Label>
                      <Input
                        id={`s-${row.id}`}
                        type="number"
                        min={0}
                        value={row.seconds}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, seconds: e.target.value } : r
                            )
                          )
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        disabled={rows.length <= 1}
                        onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                        aria-label="Remove duration"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => setRows((prev) => [...prev, emptyRow()])}
              >
                <PlusIcon className="h-4 w-4" />
                Add duration
              </Button>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Combined duration</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatDuration(combinedSeconds)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Total seconds: {combinedSeconds.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">
            How to Use This Time Period &amp; Duration Calculator
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Use <strong>Elapsed / time period</strong> to measure the difference between two dates
            and times (project length, shift length, approximate duration between start and end).
            Use <strong>Add / combine durations</strong> when you already have segment lengths—for
            example summing video clips, exam sections, or test runs into one total.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Elapsed time formula</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Both dates convert to timestamps; the calculator subtracts start from end and formats
            days, hours, minutes, and seconds:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Duration = End DateTime − Start DateTime
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Combining durations</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Each row is converted to seconds, then summed:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Total = Σ (hours×3600 + minutes×60 + seconds)
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">
              Illustrative example: video lengths
            </p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-sm">
              <li>Clip A: 12 min 30 sec = 750 seconds</li>
              <li>Clip B: 8 min 45 sec = 525 seconds</li>
              <li>
                Combined: 1,275 seconds = <strong>21 minutes, 15 seconds</strong>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked example (elapsed)</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Project Duration (illustrative)</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Start:</strong> Nov 1, 2026 at 09:00
              </li>
              <li>
                <strong>End:</strong> Nov 22, 2026 at 17:30
              </li>
              <li>
                <strong>Duration:</strong> 21 days, 8 hours, 30 minutes
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Common use cases</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Time period / scheduling:</strong> Length of a project phase or event window
            </li>
            <li>
              <strong>Elapsed time tracking:</strong> Work hours or billable blocks between punch-in
              and punch-out
            </li>
            <li>
              <strong>Video duration:</strong> Sum clip lengths before publishing
            </li>
            <li>
              <strong>Test duration:</strong> Add section times for exams or performance tests
            </li>
            <li>
              <strong>Personal:</strong> Exercise, travel, or study session totals
            </li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What is the difference between elapsed time and combining durations?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Elapsed time needs a start and end clock time. Combining durations adds lengths you
                already know (for example three video clips) without needing wall-clock start/end.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How do I calculate duration across different time zones?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                The elapsed mode uses your local time zone. Convert one of the times to your local
                zone first, or enter the wall-clock times you actually experienced if you want local
                elapsed time.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Can I calculate duration for dates in the past?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes. Enter any valid start and end where end is after start—past or future.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Does the calculator account for daylight saving time?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes for elapsed mode: browser date math accounts for DST transitions in your time
                zone. Combined-duration mode is pure arithmetic on hours/minutes/seconds and does
                not involve calendar DST.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How accurate is the duration calculation?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Results are accurate to the second. Elapsed mode handles month lengths and leap
                years via the system calendar.
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
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Countdown Timer Generator
              </h3>
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
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Work Hours Calculator
              </h3>
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
