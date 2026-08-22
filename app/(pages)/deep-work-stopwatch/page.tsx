"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BoltIcon, PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const LOG_KEY = "eprod:deep-work-log";

type BlockLog = {
  id: string;
  startedAt: string;
  endedAt: string;
  seconds: number;
};

function loadLog(): BlockLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as BlockLog[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveLog(entries: BlockLog[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, 100)));
}

function formatElapsed(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DeepWorkStopwatchPage() {
  const { assertAccess } = useSubscribedToolAccess("/deep-work-stopwatch");
  const [unlocked, setUnlocked] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState<BlockLog[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);

  useEffect(() => {
    if (unlocked) setLog(loadLog());
  }, [unlocked]);

  useEffect(() => {
    if (!running || !unlocked) return;
    const id = window.setInterval(() => {
      const start = startedAtRef.current;
      if (start == null) return;
      setElapsed(baseElapsedRef.current + Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [running, unlocked]);

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
    setRunning(false);
    setElapsed(0);
    baseElapsedRef.current = 0;
    startedAtRef.current = null;
  };

  const toggle = () => {
    if (!running) {
      startedAtRef.current = Date.now();
      setRunning(true);
    } else {
      if (startedAtRef.current != null) {
        baseElapsedRef.current += Math.floor(
          (Date.now() - startedAtRef.current) / 1000,
        );
        startedAtRef.current = null;
      }
      setElapsed(baseElapsedRef.current);
      setRunning(false);
    }
  };

  const reset = () => {
    setRunning(false);
    startedAtRef.current = null;
    baseElapsedRef.current = 0;
    setElapsed(0);
  };

  const saveBlock = () => {
    const total =
      running && startedAtRef.current != null
        ? baseElapsedRef.current +
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        : baseElapsedRef.current;
    if (total < 1) return;
    const end = new Date();
    const start = new Date(end.getTime() - total * 1000);
    const entry: BlockLog = {
      id: crypto.randomUUID(),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      seconds: total,
    };
    setLog((prev) => {
      const next = [entry, ...prev].slice(0, 100);
      saveLog(next);
      return next;
    });
    reset();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deep work stopwatch</h1>
          <p className="mt-1 text-muted-foreground">
            Count-up timer for focus blocks. Log finished blocks to history on this device.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6 space-y-4">
            <Label className="text-muted-foreground">
              No setup required — start counting when you open the tool.
            </Label>
            <Button onClick={handleOpen} className="gap-2">
              <BoltIcon className="h-4 w-4" />
              Open stopwatch
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-input bg-card p-8 text-center space-y-4">
              <p className="text-5xl sm:text-6xl font-mono font-semibold tabular-nums">
                {formatElapsed(elapsed)}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={toggle} className="gap-2">
                  {running ? (
                    <>
                      <PauseIcon className="h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={reset} className="gap-2">
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset
                </Button>
                <Button type="button" variant="secondary" onClick={saveBlock}>
                  Log block & reset
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-input bg-muted/30 p-6">
              <h2 className="text-lg font-medium mb-3">Saved blocks</h2>
              {log.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Use &quot;Log block & reset&quot; to store a completed deep-work session.
                </p>
              ) : (
                <ul className="space-y-2 text-sm max-h-56 overflow-auto">
                  {log.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-border/60 pb-2"
                    >
                      <span className="text-muted-foreground">
                        {new Date(row.startedAt).toLocaleString()} →{" "}
                        {new Date(row.endedAt).toLocaleTimeString()}
                      </span>
                      <span className="font-medium font-mono shrink-0">
                        {formatElapsed(row.seconds)}
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
