"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { addDays, sm2Schedule, type Sm2State } from "@/lib/sm2-lite";

export default function SpacedRepetitionSchedulerPage() {
  const { assertAccess } = useSubscribedToolAccess("/spaced-repetition-scheduler");
  const [quality, setQuality] = useState("4");
  const [ef, setEf] = useState("2.5");
  const [interval, setInterval] = useState("0");
  const [reps, setReps] = useState("0");
  const [out, setOut] = useState<{ sm2: Sm2State; nextDate: string } | null>(null);

  const handleSubmit = () => {
    if (!assertAccess()) return;
    const q = Number(quality);
    const prev: Sm2State = {
      ef: Math.max(1.3, parseFloat(ef) || 2.5),
      interval: Math.max(0, parseInt(interval, 10) || 0),
      reps: Math.max(0, parseInt(reps, 10) || 0),
    };
    const sm2 = sm2Schedule(Number.isFinite(q) ? q : 4, prev);
    const next = addDays(new Date(), sm2.interval);
    setOut({ sm2, nextDate: next.toLocaleDateString() });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Spaced repetition scheduler (SM-2 lite)</h1>
          <p className="mt-1 text-muted-foreground">
            Enter your last card stats and today&apos;s recall quality (0–5). Get the next interval and ease factor.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q">Quality (0–5)</Label>
            <Input
              id="q"
              type="number"
              min={0}
              max={5}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">0–2: forgot; 3: hard; 4: good; 5: easy</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ef">Ease factor (EF)</Label>
            <Input id="ef" type="number" step="0.01" min="1.3" value={ef} onChange={(e) => setEf(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iv">Previous interval (days)</Label>
            <Input id="iv" type="number" min={0} value={interval} onChange={(e) => setInterval(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reps">Successful repetitions</Label>
            <Input id="reps" type="number" min={0} value={reps} onChange={(e) => setReps(e.target.value)} />
          </div>
        </div>

        <Button type="button" onClick={handleSubmit} className="gap-2">
          <ClockIcon className="h-4 w-4" />
          Compute next review
        </Button>

        {out && (
          <div className="rounded-lg border border-input bg-muted/40 p-4 text-sm space-y-2">
            <p>
              <span className="font-medium">New EF:</span> {out.sm2.ef.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">New interval:</span> {out.sm2.interval} days
            </p>
            <p>
              <span className="font-medium">Repetitions:</span> {out.sm2.reps}
            </p>
            <p>
              <span className="font-medium">Suggested next review:</span> {out.nextDate}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
