"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserGroupIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { findSlotsAcrossDays, type SlotParticipant } from "@/lib/meeting-slot-finder";

const PAGE = "/meeting-overlap-finder";

const COMMON_ZONES: { value: string; label: string }[] = [
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "UTC", label: "UTC" },
];

type Row = SlotParticipant & { id: string };

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtUtc(d: Date) {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

export default function MeetingOverlapFinderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [startYmd, setStartYmd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [endYmd, setEndYmd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [stepMinutes, setStepMinutes] = useState(15);
  const [maxSlots, setMaxSlots] = useState(24);
  const [skipWeekend, setSkipWeekend] = useState(true);
  const [weekendTZ, setWeekendTZ] = useState("America/New_York");
  const [participants, setParticipants] = useState<Row[]>([
    { id: randomId(), timeZone: "America/New_York", workStart: "09:00", workEnd: "17:00" },
    { id: randomId(), timeZone: "Europe/London", workStart: "09:00", workEnd: "17:00" },
    { id: randomId(), timeZone: "Asia/Tokyo", workStart: "09:00", workEnd: "18:00" },
  ]);
  const [unlocked, setUnlocked] = useState(false);

  const slotPayload = useMemo(
    () => participants.map(({ timeZone, workStart, workEnd }) => ({ timeZone, workStart, workEnd })),
    [participants],
  );

  const slots = useMemo(() => {
    if (!unlocked) return [];
    return findSlotsAcrossDays(startYmd, endYmd, slotPayload, {
      slotMinutes,
      stepMinutes,
      maxSlots,
      skipWeekend,
      weekendTimeZone: weekendTZ,
    });
  }, [unlocked, startYmd, endYmd, slotPayload, slotMinutes, stepMinutes, maxSlots, skipWeekend, weekendTZ]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setUnlocked(true);
  };

  const addRow = () =>
    setParticipants((rows) => [
      ...rows,
      { id: randomId(), timeZone: "UTC", workStart: "09:00", workEnd: "17:00" },
    ]);
  const removeRow = (id: string) =>
    setParticipants((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  const updateRow = (id: string, patch: Partial<Row>) =>
    setParticipants((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <UserGroupIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">World meeting overlap finder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Scan a date range for meeting slots where everyone’s local work hours overlap (runs in your browser only).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s">Range start</Label>
              <Input id="s" type="date" value={startYmd} onChange={(e) => { setStartYmd(e.target.value); setUnlocked(false); }} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e">Range end</Label>
              <Input id="e" type="date" value={endYmd} onChange={(e) => { setEndYmd(e.target.value); setUnlocked(false); }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot">Meeting length (min)</Label>
              <Input
                id="slot"
                type="number"
                min={5}
                max={480}
                value={slotMinutes}
                onChange={(e) => { setSlotMinutes(Number(e.target.value) || 30); setUnlocked(false); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step">Step (min)</Label>
              <Input
                id="step"
                type="number"
                min={5}
                max={120}
                value={stepMinutes}
                onChange={(e) => { setStepMinutes(Number(e.target.value) || 15); setUnlocked(false); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Max slots</Label>
              <Input
                id="max"
                type="number"
                min={1}
                max={200}
                value={maxSlots}
                onChange={(e) => { setMaxSlots(Number(e.target.value) || 24); setUnlocked(false); }}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={skipWeekend}
              onChange={(e) => { setSkipWeekend(e.target.checked); setUnlocked(false); }}
            />
            Skip weekends (Sat/Sun in reference zone)
          </label>
          {skipWeekend && (
            <div className="space-y-2 max-w-md">
              <Label>Weekend reference zone</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={weekendTZ}
                onChange={(e) => { setWeekendTZ(e.target.value); setUnlocked(false); }}
              >
                {COMMON_ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
            {participants.map((p, idx) => (
              <div
                key={p.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end rounded-lg border border-border p-3"
              >
                <div className="sm:col-span-5 space-y-1">
                  <Label className="text-xs text-muted-foreground">Zone {idx + 1}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                    value={p.timeZone}
                    onChange={(e) => updateRow(p.id, { timeZone: e.target.value })}
                  >
                    {COMMON_ZONES.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Work start</Label>
                  <Input type="time" value={p.workStart} onChange={(e) => updateRow(p.id, { workStart: e.target.value })} />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Work end</Label>
                  <Input type="time" value={p.workEnd} onChange={(e) => updateRow(p.id, { workEnd: e.target.value })} />
                </div>
                <div className="sm:col-span-1 flex justify-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(p.id)}
                    disabled={participants.length <= 1}
                    aria-label="Remove"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} className="gap-2">
            <UserGroupIcon className="h-4 w-4" />
            Find slots
          </Button>
        </div>

        {unlocked && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4">
            {slots.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No overlapping slots in this range with these rules. Widen the range, shorten the meeting, or relax weekend skipping.
              </p>
            ) : (
              slots.map((day) => (
                <div key={day.dateYmd}>
                  <p className="font-medium text-slate-900 dark:text-white mb-2">{day.dateYmd}</p>
                  <ul className="text-sm font-mono space-y-1 text-slate-700 dark:text-slate-200">
                    {day.slots.map((s, i) => (
                      <li key={`${day.dateYmd}-${i}`}>
                        {fmtUtc(s.start)} UTC → {fmtUtc(s.end)} UTC
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
