"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClockIcon, PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const HISTORY_KEY = "eprod:pomodoro-history";

type SessionLog = {
  id: string;
  at: string;
  phase: "work" | "short" | "long";
  plannedMinutes: number;
};

type Phase = "work" | "short" | "long";

function loadHistory(): SessionLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: SessionLog[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 200)));
}

export default function PomodoroTimerPage() {
  const { assertAccess } = useSubscribedToolAccess("/pomodoro-timer");
  const [unlocked, setUnlocked] = useState(false);
  const [workMin, setWorkMin] = useState(25);
  const [shortMin, setShortMin] = useState(5);
  const [longMin, setLongMin] = useState(15);
  const [workSessionsBeforeLong, setWorkSessionsBeforeLong] = useState(4);

  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [completedWorkCount, setCompletedWorkCount] = useState(0);
  const [history, setHistory] = useState<SessionLog[]>([]);

  const workCountRef = useRef(0);
  const phaseRef = useRef<Phase>("work");
  const durationsRef = useRef({ work: 25 * 60, short: 5 * 60, long: 15 * 60 });

  useEffect(() => {
    if (unlocked) setHistory(loadHistory());
  }, [unlocked]);

  useEffect(() => {
    durationsRef.current = {
      work: Math.max(1, workMin) * 60,
      short: Math.max(1, shortMin) * 60,
      long: Math.max(1, longMin) * 60,
    };
  }, [workMin, shortMin, longMin]);

  const resetToPhase = useCallback((p: Phase) => {
    setPhase(p);
    phaseRef.current = p;
    const d = durationsRef.current;
    setSecondsLeft(p === "work" ? d.work : p === "short" ? d.short : d.long);
    setRunning(false);
  }, []);

  const handleOpenTool = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
    const d = {
      work: Math.max(1, workMin) * 60,
      short: Math.max(1, shortMin) * 60,
      long: Math.max(1, longMin) * 60,
    };
    durationsRef.current = d;
    setSecondsLeft(d.work);
    setPhase("work");
    phaseRef.current = "work";
    workCountRef.current = 0;
    setCompletedWorkCount(0);
    setRunning(false);
  };

  const advanceAfterComplete = useCallback(() => {
    const p = phaseRef.current;
    const d = durationsRef.current;
    const log = (nextPhase: Phase) => {
      const entry: SessionLog = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        phase: p,
        plannedMinutes: Math.round(
          (p === "work" ? d.work : p === "short" ? d.short : d.long) / 60,
        ),
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 200);
        saveHistory(next);
        return next;
      });
    };

    if (p === "work") {
      log("work");
      workCountRef.current += 1;
      setCompletedWorkCount(workCountRef.current);
      const n = Math.max(1, workSessionsBeforeLong);
      if (workCountRef.current % n === 0) {
        setPhase("long");
        phaseRef.current = "long";
        setSecondsLeft(d.long);
      } else {
        setPhase("short");
        phaseRef.current = "short";
        setSecondsLeft(d.short);
      }
    } else {
      log(p);
      setPhase("work");
      phaseRef.current = "work";
      setSecondsLeft(d.work);
    }
    setRunning(false);
  }, [workSessionsBeforeLong]);

  useEffect(() => {
    if (!running || !unlocked) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : s));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, unlocked]);

  useEffect(() => {
    if (!running || !unlocked || secondsLeft > 0) return;
    advanceAfterComplete();
  }, [running, unlocked, secondsLeft, advanceAfterComplete]);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  const phaseLabel =
    phase === "work" ? "Focus" : phase === "short" ? "Short break" : "Long break";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pomodoro timer</h1>
          <p className="mt-1 text-muted-foreground">
            Work and break intervals with session history stored on this device.
          </p>
        </div>

        {!unlocked ? (
          <div className="space-y-4 rounded-xl border border-input bg-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work">Work (minutes)</Label>
                <Input
                  id="work"
                  type="number"
                  min={1}
                  max={120}
                  value={workMin}
                  onChange={(e) => setWorkMin(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short">Short break</Label>
                <Input
                  id="short"
                  type="number"
                  min={1}
                  max={60}
                  value={shortMin}
                  onChange={(e) => setShortMin(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long">Long break</Label>
                <Input
                  id="long"
                  type="number"
                  min={1}
                  max={60}
                  value={longMin}
                  onChange={(e) => setLongMin(Number(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="longEvery">Long break after N work sessions</Label>
              <Input
                id="longEvery"
                type="number"
                min={1}
                max={12}
                value={workSessionsBeforeLong}
                onChange={(e) =>
                  setWorkSessionsBeforeLong(Number(e.target.value) || 1)
                }
              />
            </div>
            <Button onClick={handleOpenTool} className="gap-2">
              <ClockIcon className="h-4 w-4" />
              Open timer
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-input bg-card p-8 text-center space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {phaseLabel}
              </p>
              <p className="text-6xl font-mono font-semibold tabular-nums tracking-tight">
                {fmt(secondsLeft)}
              </p>
              <p className="text-sm text-muted-foreground">
                Completed work sessions this visit: {completedWorkCount}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant={running ? "secondary" : "default"}
                  onClick={() => setRunning((r) => !r)}
                  className="gap-2"
                >
                  {running ? (
                    <>
                      <PauseIcon className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      {secondsLeft === 0 ? "Start next" : "Start"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resetToPhase(phase)}
                  className="gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset phase
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-input bg-muted/30 p-6">
              <h2 className="text-lg font-medium mb-3">Session history</h2>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Finished intervals appear here (most recent first).
                </p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-auto text-sm">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {new Date(h.at).toLocaleString()}
                      </span>
                      <span className="font-medium shrink-0">
                        {h.phase} · {h.plannedMinutes} min
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
