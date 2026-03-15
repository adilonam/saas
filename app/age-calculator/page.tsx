"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ageBetween(birth: Date, asOf: Date): { years: number; months: number; days: number } | null {
  if (asOf < birth) return null;
  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function nextBirthday(birth: Date, asOf: Date): Date | null {
  const next = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
  if (next <= asOf) next.setFullYear(next.getFullYear() + 1);
  return next;
}

export default function AgeCalculatorPage() {
  const today = useMemo(() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }, []);

  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState(today);
  const [useToday, setUseToday] = useState(true);

  const result = useMemo(() => {
    const birth = parseDate(birthDate);
    const asOf = useToday ? new Date() : parseDate(asOfDate);
    if (!birth || !asOf || asOf < birth) return null;
    const age = ageBetween(birth, asOf);
    if (!age) return null;
    const totalDays = daysBetween(birth, asOf);
    const next = nextBirthday(birth, asOf);
    const daysUntilNext = next ? daysBetween(asOf, next) : 0;
    return { age, totalDays, nextBirthday: next, daysUntilNext };
  }, [birthDate, asOfDate, useToday]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Age Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculate age in years, months, and days from birth date
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="birth-date">Birth date</Label>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="use-today"
                type="checkbox"
                checked={useToday}
                onChange={(e) => setUseToday(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor="use-today" className="cursor-pointer font-normal">
                Calculate age as of today
              </Label>
            </div>
            {!useToday && (
              <div className="space-y-2">
                <Label htmlFor="as-of-date">Age as of date</Label>
                <Input
                  id="as-of-date"
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            )}
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Age</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.age.years} year{result.age.years !== 1 ? "s" : ""},{" "}
                {result.age.months} month{result.age.months !== 1 ? "s" : ""},{" "}
                {result.age.days} day{result.age.days !== 1 ? "s" : ""}
              </p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p>Total days: {result.totalDays.toLocaleString()}</p>
                {result.nextBirthday && (
                  <p>
                    Next birthday in {result.daysUntilNext} day{result.daysUntilNext !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Enter your birth date to see your exact age. You can optionally set an &quot;as of&quot; date instead of today.
        </p>
      </div>
    </DashboardLayout>
  );
}
