"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClockIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type Topic = { id: string; title: string; minutes: string };

function newTopic(): Topic {
  return { id: crypto.randomUUID(), title: "Topic", minutes: "5" };
}

export default function MeetingAgendaTimerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "Kickoff & goals", minutes: "5" },
    { id: "2", title: "Design review", minutes: "10" },
    { id: "3", title: "Wrap & actions", minutes: "5" },
  ]);
  const [unlocked, setUnlocked] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/meeting-agenda-timer")}`);
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

  const currentMinutesStr = topics[activeIndex]?.minutes ?? "1";

  useEffect(() => {
    if (!unlocked) return;
    const m = Number.parseInt(currentMinutesStr, 10) || 1;
    setSecondsLeft(Math.max(1, m * 60));
  }, [activeIndex, unlocked, currentMinutesStr]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  const handleStartMeeting = () => {
    if (!gate()) return;
    setUnlocked(true);
    setActiveIndex(0);
    const m = Number.parseInt(topics[0]?.minutes ?? "5", 10) || 1;
    setSecondsLeft(Math.max(1, m * 60));
    setRunning(true);
  };

  const startCurrentTopic = () => {
    if (!unlocked) return;
    const m = Number.parseInt(currentMinutesStr, 10) || 1;
    setSecondsLeft(Math.max(1, m * 60));
    setRunning(true);
  };

  const nextTopic = () => {
    setRunning(false);
    setActiveIndex((i) => Math.min(i + 1, Math.max(topics.length - 1, 0)));
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting agenda timer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Per-topic minutes with a simple countdown
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleStartMeeting}>
              Start meeting
            </Button>
            {unlocked && (
              <>
                <Button type="button" variant="outline" onClick={startCurrentTopic} disabled={running}>
                  Reset topic timer
                </Button>
                <Button type="button" variant="outline" onClick={nextTopic}>
                  Next topic
                </Button>
              </>
            )}
          </div>

          {unlocked && (
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-white dark:bg-slate-800/40 p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">
                Topic {activeIndex + 1} of {topics.length}
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {topics[activeIndex]?.title ?? "—"}
              </p>
              <p className="text-5xl font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {fmt(secondsLeft)}
              </p>
              <p className="text-xs text-slate-500 mt-3">{running ? "Running" : "Paused / idle"}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Agenda</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setTopics((t) => [...t, newTopic()])}
              >
                <PlusIcon className="size-4" />
                Row
              </Button>
            </div>
            {topics.map((row, i) => (
              <div
                key={row.id}
                className={`flex flex-wrap gap-2 items-end p-3 rounded-xl border ${
                  unlocked && i === activeIndex
                    ? "border-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex-1 min-w-[140px] space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={row.title}
                    onChange={(e) =>
                      setTopics((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, title: e.target.value } : x)),
                      )
                    }
                    className="rounded-lg h-10"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Minutes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.minutes}
                    onChange={(e) =>
                      setTopics((list) =>
                        list.map((x) => (x.id === row.id ? { ...x, minutes: e.target.value } : x)),
                      )
                    }
                    className="rounded-lg h-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() =>
                    setTopics((list) => (list.length > 1 ? list.filter((x) => x.id !== row.id) : list))
                  }
                  aria-label="Remove topic"
                >
                  <TrashIcon className="size-5 text-slate-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
