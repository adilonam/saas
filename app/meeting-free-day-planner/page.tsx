"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function MeetingFreeDayPlannerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [meetingHours, setMeetingHours] = useState("");
  const [workWeekHours, setWorkWeekHours] = useState("40");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/meeting-free-day-planner")}`,
      );
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const result = useMemo(() => {
    const m = parseFloat(meetingHours) || 0;
    const w = parseFloat(workWeekHours) || 0;
    if (w <= 0) return null;
    if (m < 0) return null;
    const free = w - m;
    const pctMeetings = (m / w) * 100;
    let tip = "";
    if (pctMeetings < 20) tip = "Light meeting load — good room for deep work blocks.";
    else if (pctMeetings < 35)
      tip = "Consider protecting two half-days with no recurring meetings.";
    else if (pctMeetings < 50)
      tip = "High meeting share; try a team-wide meeting-free day or no-meeting mornings.";
    else tip = "Very meeting-heavy; audit recurring meetings and default lengths (25 vs 30 min).";
    const overload = free < 0;
    return { pctMeetings, free, tip, overload };
  }, [meetingHours, workWeekHours]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting-free day planner</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Meeting hours vs a typical workweek — see load and meeting-free time.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="work">Workweek hours (typical)</Label>
            <Input
              id="work"
              type="number"
              min="1"
              max="168"
              step="1"
              placeholder="40"
              value={workWeekHours}
              onChange={(e) => setWorkWeekHours(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meet">Meeting hours per week</Label>
            <Input
              id="meet"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 12"
              value={meetingHours}
              onChange={(e) => setMeetingHours(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button
            onClick={() => {
              if (!gate()) return;
              setUnlocked(true);
            }}
            className="gap-2"
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Plan
          </Button>

          {unlocked && result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Meetings of workweek</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {result.pctMeetings.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Meeting-free hours / week</p>
                <p
                  className={`text-2xl font-semibold ${
                    result.overload
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {result.free.toFixed(1)} hrs
                </p>
                {result.overload && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Meetings exceed this workweek model — check totals or raise workweek hours.
                  </p>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{result.tip}</p>
            </div>
          )}

          {unlocked && !result && (
            <p className="text-sm text-amber-600 dark:text-amber-400">Enter a positive workweek and non-negative meeting hours.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
