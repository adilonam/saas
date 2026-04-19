"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToolAccess } from "@/lib/use-tool-access";

export default function FocusSessionPlannerPage() {
  const { ensureAccess } = useToolAccess();
  const [task, setTask] = useState("");
  const [duration, setDuration] = useState(50);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [sessions, setSessions] = useState(4);
  const [startedAt, setStartedAt] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalFocus = useMemo(() => duration * sessions, [duration, sessions]);
  const totalBreak = useMemo(
    () => Math.max(0, sessions - 1) * breakMinutes,
    [sessions, breakMinutes],
  );
  const totalMinutes = totalFocus + totalBreak;

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Focus Session Planner</h1>
          <p className="mt-1 text-muted-foreground">
            Plan deep-work blocks with repeatable focus and break intervals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Main task</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full min-h-[110px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="What will you work on during this focus block?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Focus duration (minutes)</label>
            <input
              type="number"
              min={15}
              max={120}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Break duration (minutes)</label>
            <input
              type="number"
              min={0}
              max={45}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Number of sessions</label>
            <input
              type="number"
              min={1}
              max={12}
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Start time (optional)</label>
            <input
              type="time"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <Button onClick={handleSubmit}>Build focus plan</Button>

        {submitted && (
          <div className="rounded-xl border border-input bg-muted/30 p-5 text-sm space-y-2">
            <p><strong>Task:</strong> {task.trim() || "No task provided"}</p>
            <p><strong>Sessions:</strong> {sessions} x {duration}m focus</p>
            <p><strong>Breaks:</strong> {Math.max(0, sessions - 1)} x {breakMinutes}m</p>
            <p><strong>Total planned time:</strong> {totalMinutes} minutes</p>
            {startedAt ? <p><strong>Suggested start:</strong> {startedAt}</p> : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
