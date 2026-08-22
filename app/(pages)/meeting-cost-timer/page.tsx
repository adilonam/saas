"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClockIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function MeetingCostTimerPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [attendees, setAttendees] = useState("4");
  const [hourlyRate, setHourlyRate] = useState("150");
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef<number | null>(null);
  const baseMs = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (startedAt.current == null) return;
      setElapsedMs(baseMs.current + (Date.now() - startedAt.current));
    }, 200);
    return () => window.clearInterval(id);
  }, [running]);

  const handlePrepare = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const a = Math.max(1, parseInt(attendees, 10) || 1);
  const rate = Math.max(0, parseFloat(hourlyRate) || 0);
  const hours = elapsedMs / 3_600_000;
  const burn = hours * rate * a;

  const start = () => {
    if (!ensureAccess()) return;
    baseMs.current = elapsedMs;
    startedAt.current = Date.now();
    setRunning(true);
  };

  const stop = () => {
    if (startedAt.current != null) {
      baseMs.current += Date.now() - startedAt.current;
      setElapsedMs(baseMs.current);
    }
    startedAt.current = null;
    setRunning(false);
  };

  const reset = () => {
    stop();
    baseMs.current = 0;
    setElapsedMs(0);
  };

  const h = Math.floor(elapsedMs / 3_600_000);
  const m = Math.floor((elapsedMs % 3_600_000) / 60_000);
  const s = Math.floor((elapsedMs % 60_000) / 1000);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meeting cost timer</h1>
          <p className="mt-1 text-muted-foreground">
            Estimated burn: attendees × blended hourly rate × elapsed time.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mct-att">Attendees</Label>
              <Input
                id="mct-att"
                type="number"
                min={1}
                step={1}
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mct-rate">Hourly rate (USD, per person)</Label>
              <Input
                id="mct-rate"
                type="number"
                min={0}
                step={1}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handlePrepare} className="gap-2 w-full sm:w-auto">
            <ClockIcon className="h-4 w-4" />
            Unlock timer
          </Button>
        </div>

        {unlocked && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Elapsed</p>
              <p className="text-4xl font-semibold tabular-nums tracking-tight">
                {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
              </p>
              <p className="text-lg font-medium text-emerald-700 dark:text-emerald-400">
                {formatMoney(burn)}
              </p>
              <p className="text-xs text-muted-foreground">
                {a} people × {formatMoney(rate)}/hr × {hours.toFixed(3)} hr
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {!running ? (
                <Button type="button" onClick={start} className="gap-2">
                  <PlayIcon className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={stop} className="gap-2">
                  <PauseIcon className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button type="button" variant="outline" onClick={reset}>
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
