"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const GRADE_POINTS: { letter: string; value: number }[] = [
  { letter: "A", value: 4.0 },
  { letter: "A-", value: 3.7 },
  { letter: "B+", value: 3.3 },
  { letter: "B", value: 3.0 },
  { letter: "B-", value: 2.7 },
  { letter: "C+", value: 2.3 },
  { letter: "C", value: 2.0 },
  { letter: "C-", value: 1.7 },
  { letter: "D+", value: 1.3 },
  { letter: "D", value: 1.0 },
  { letter: "D-", value: 0.7 },
  { letter: "F", value: 0 },
];

export type CourseRow = { id: string; grade: string; credits: string };

function createRow(): CourseRow {
  return { id: crypto.randomUUID(), grade: "A", credits: "3" };
}

export default function GPACalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<CourseRow[]>(() => [createRow(), createRow()]);
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/gpa-calculator")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  const addCourse = () => setRows((prev) => [...prev, createRow()]);
  const removeCourse = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  const updateRow = (id: string, field: keyof CourseRow, value: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  const { totalCredits, gpa, qualityPoints } = useMemo(() => {
    let totalCredits = 0;
    let qualityPoints = 0;
    for (const row of rows) {
      const credits = parseFloat(row.credits) || 0;
      const gradeEntry = GRADE_POINTS.find((g) => g.letter === row.grade);
      const points = gradeEntry?.value ?? 0;
      totalCredits += credits;
      qualityPoints += credits * points;
    }
    const gpa = totalCredits > 0 ? qualityPoints / totalCredits : null;
    return {
      totalCredits,
      qualityPoints,
      gpa: gpa != null ? Math.round(gpa * 100) / 100 : null,
    };
  }, [rows]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GPA Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Grade Point Average from letter grades and credit hours
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Courses</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCourse}
              className="rounded-xl gap-1.5"
            >
              <PlusIcon className="size-4" />
              Add course
            </Button>
          </div>

          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-end gap-3 sm:gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label htmlFor={`grade-${row.id}`}>Grade</Label>
                  <select
                    id={`grade-${row.id}`}
                    value={row.grade}
                    onChange={(e) => updateRow(row.id, "grade", e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  >
                    {GRADE_POINTS.map(({ letter }) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-2">
                  <Label htmlFor={`credits-${row.id}`}>Credits</Label>
                  <Input
                    id={`credits-${row.id}`}
                    type="number"
                    min="0"
                    max="99"
                    step="0.5"
                    placeholder="3"
                    value={row.credits}
                    onChange={(e) => updateRow(row.id, "credits", e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(row.id)}
                  className="rounded-xl shrink-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  aria-label="Remove course"
                >
                  <TrashIcon className="size-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {resultUnlocked && (totalCredits > 0 || gpa != null) && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-baseline gap-4 gap-y-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">Total credits</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {totalCredits}
                  </p>
                </div>
                {gpa != null && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">GPA (4.0 scale)</p>
                    <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                      {gpa}
                    </p>
                  </div>
                )}
              </div>
              {totalCredits > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Quality points:{" "}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {qualityPoints.toFixed(1)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          GPA = total quality points ÷ total credits. Uses a standard 4.0 scale (A=4.0, F=0).
        </p>
      </div>
    </DashboardLayout>
  );
}
