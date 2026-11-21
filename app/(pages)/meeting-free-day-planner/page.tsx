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
    // All tools are now free - no auth required
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
