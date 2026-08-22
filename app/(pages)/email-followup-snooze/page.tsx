"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "eprod-email-followup-snooze-v1";

export type SnoozeItem = {
  id: string;
  who: string;
  due: string;
  note: string;
};

function loadItems(): SnoozeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SnoozeItem[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.id === "string");
  } catch {
    return [];
  }
}

function saveItems(items: SnoozeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function EmailFollowupSnoozePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState<SnoozeItem[]>([]);
  const [who, setWho] = useState("");
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/email-followup-snooze")}`,
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
      setItems(loadItems());
      setHydrated(true);
    });
  }, []);

  const sync = useCallback((next: SnoozeItem[]) => {
    setItems(next);
    saveItems(next);
  }, []);

  const handleOpen = () => {
    if (!gate()) return;
    setUnlocked(true);
  };

  const handleAdd = () => {
    if (!unlocked) return;
    const w = who.trim();
    const d = due.trim();
    if (!w || !d) return;
    const row: SnoozeItem = {
      id: crypto.randomUUID(),
      who: w,
      due: d,
      note: note.trim(),
    };
    sync([row, ...items]);
    setWho("");
    setDue("");
    setNote("");
  };

  const handleRemove = (id: string) => {
    sync(items.filter((x) => x.id !== id));
  };

  const sorted = [...items].sort((a, b) => a.due.localeCompare(b.due));

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <EnvelopeIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Email follow-up snooze list</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Reminders stay in this browser only — not synced to our servers.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {!unlocked ? (
            <Button onClick={handleOpen} className="gap-2">
              <EnvelopeIcon className="h-4 w-4" />
              Open list
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="who">Who / thread</Label>
                <Input
                  id="who"
                  placeholder="e.g. Jane @ Acme — proposal"
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Follow up on (date)</Label>
                <Input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="Send case study link"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <Button type="button" onClick={handleAdd} className="gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                Add reminder
              </Button>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Upcoming</p>
                {sorted.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No reminders yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {sorted.map((row) => (
                      <li
                        key={row.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between rounded-2xl border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{row.who}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Due {row.due}</p>
                          {row.note ? (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{row.note}</p>
                          ) : null}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => handleRemove(row.id)}>
                          Done
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {!hydrated && <p className="text-xs text-slate-500 mt-4">Loading…</p>}
      </div>
    </DashboardLayout>
  );
}
