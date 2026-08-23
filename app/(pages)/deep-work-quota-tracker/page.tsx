"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "eprod-deep-work-quota-v1";

function isoWeekKey(d: Date): string {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

type Stored = { weekKey: string; target: number; logged: number };

function readStore(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    if (typeof p.weekKey !== "string" || typeof p.target !== "number" || typeof p.logged !== "number") {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function writeStore(s: Stored) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function DeepWorkQuotaTrackerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const [target, setTarget] = useState("20");
  const [logged, setLogged] = useState("0");
  const [addHours, setAddHours] = useState("1");
  const [hydrated, setHydrated] = useState(false);

  const weekKey = useMemo(() => isoWeekKey(new Date()), []);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/deep-work-quota-tracker")}`,
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

  useEffect(() => {
    queueMicrotask(() => {
      const s = readStore();
      const current = isoWeekKey(new Date());
      if (s && s.weekKey === current) {
        setTarget(String(s.target));
        setLogged(String(s.logged));
      } else if (s && s.weekKey !== current) {
        setTarget(String(s.target));
        setLogged("0");
        writeStore({ weekKey: current, target: s.target, logged: 0 });
      }
      setHydrated(true);
    });
  }, []);

  const persist = useCallback(
    (nextTarget: number, nextLogged: number) => {
      const current = isoWeekKey(new Date());
      writeStore({ weekKey: current, target: nextTarget, logged: nextLogged });
    },
    [],
  );

  const targetNum = Math.max(parseFloat(target) || 0, 0);
  const loggedNum = Math.max(parseFloat(logged) || 0, 0);
  const pct = targetNum > 0 ? Math.min(100, (loggedNum / targetNum) * 100) : 0;

  const handleSaveTarget = () => {
    if (!gate()) return;
    setUnlocked(true);
    const t = Math.max(parseFloat(target) || 0, 0);
    const l = Math.max(parseFloat(logged) || 0, 0);
    persist(t, l);
  };

  const handleAdd = () => {
    if (!unlocked) return;
    const add = Math.max(parseFloat(addHours) || 0, 0);
    const t = Math.max(parseFloat(target) || 0, 0);
    const next = Math.max(parseFloat(logged) || 0, 0) + add;
    setLogged(String(next));
    persist(t, next);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deep-work quota tracker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Weekly target and logged hours ({weekKey}). Stored locally in your browser.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target">Deep-work target (hours / week)</Label>
            <Input
              id="target"
              type="number"
              min="0"
              max="80"
              step="0.5"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                if (unlocked) {
                  const t = Math.max(parseFloat(e.target.value) || 0, 0);
                  const l = Math.max(parseFloat(logged) || 0, 0);
                  persist(t, l);
                }
              }}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logged">Logged this week</Label>
            <Input
              id="logged"
              type="number"
              min="0"
              max="168"
              step="0.25"
              value={logged}
              onChange={(e) => {
                setLogged(e.target.value);
                if (unlocked) {
                  const t = Math.max(parseFloat(target) || 0, 0);
                  const l = Math.max(parseFloat(e.target.value) || 0, 0);
                  persist(t, l);
                }
              }}
              className="rounded-xl h-11"
              disabled={!unlocked}
            />
          </div>

          {!unlocked ? (
            <Button onClick={handleSaveTarget} className="gap-2">
              <ClockIcon className="h-4 w-4" />
              Open tracker
            </Button>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <Label htmlFor="add">Add hours</Label>
                  <Input
                    id="add"
                    type="number"
                    min="0"
                    step="0.25"
                    value={addHours}
                    onChange={(e) => setAddHours(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleAdd} className="h-11 rounded-xl">
                  Add to week
                </Button>
              </div>

              <div className="pt-4">
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {loggedNum.toFixed(2)} / {targetNum.toFixed(2)} h
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                  {pct.toFixed(0)}% of weekly quota
                </p>
              </div>
            </>
          )}
        </div>

        {!hydrated && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Loading saved progress…</p>
        )}
      </div>
    </DashboardLayout>
  );
}
