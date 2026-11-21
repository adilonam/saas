"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobeAltIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { workWindowUtc, intersectSegments } from "@/lib/timezone-overlap";

type Participant = {
  id: string;
  timeZone: string;
  workStart: string;
  workEnd: string;
};

const COMMON_ZONES: { value: string; label: string }[] = [
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "UTC", label: "UTC" },
];

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatRange(start: Date, end: Date, zone: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleString("en-US", opts)} → ${end.toLocaleString("en-US", opts)}`;
}

export default function TimezoneOverlapCheckerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dateYmd, setDateYmd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [participants, setParticipants] = useState<Participant[]>([
    { id: randomId(), timeZone: "America/New_York", workStart: "09:00", workEnd: "17:00" },
    { id: randomId(), timeZone: "Europe/London", workStart: "09:00", workEnd: "17:00" },
  ]);
  const [unlocked, setUnlocked] = useState(false);

  const overlap = useMemo(() => {
    if (!unlocked) return null;
    const segments = participants.map((p) =>
      workWindowUtc(dateYmd, p.timeZone, p.workStart, p.workEnd),
    );
    if (segments.some((s) => !s)) return { error: "Could not resolve one or more time zones or hours." as const };
    return { segment: intersectSegments(segments as NonNullable<(typeof segments)[0]>[]) };
  }, [unlocked, dateYmd, participants]);

  const handleSubmit = useCallback(() => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/timezone-overlap-checker")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setUnlocked(true);
  }, [session, status, router, pathname]);

  const addRow = () =>
    setParticipants((rows) => [
      ...rows,
      { id: randomId(), timeZone: "UTC", workStart: "09:00", workEnd: "17:00" },
    ]);
  const removeRow = (id: string) =>
    setParticipants((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));

  const updateRow = (id: string, patch: Partial<Participant>) =>
    setParticipants((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Time Zone Overlap Checker</h1>
          <p className="mt-1 text-muted-foreground">
            Enter each person&apos;s time zone and local working hours on a chosen date to see when everyone is available at once.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="d">Date (calendar day per region)</Label>
            <Input id="d" type="date" value={dateYmd} onChange={(e) => setDateYmd(e.target.value)} />
          </div>

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
                  <Label className="text-xs text-muted-foreground">Time zone {idx + 1}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
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
                  <Label className="text-xs text-muted-foreground">Start</Label>
                  <Input
                    type="time"
                    value={p.workStart}
                    onChange={(e) => updateRow(p.id, { workStart: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">End</Label>
                  <Input
                    type="time"
                    value={p.workEnd}
                    onChange={(e) => updateRow(p.id, { workEnd: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(p.id)}
                    disabled={participants.length <= 1}
                    aria-label="Remove participant"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" onClick={handleSubmit} className="gap-2">
            <GlobeAltIcon className="h-4 w-4" />
            Find overlap
          </Button>
        </div>

        {unlocked && overlap && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            {"error" in overlap && overlap.error ? (
              <p className="text-sm text-destructive">{overlap.error}</p>
            ) : overlap.segment ? (
              <>
                <p className="font-medium text-foreground">Shared availability window (UTC)</p>
                <p className="text-sm text-muted-foreground">
                  {overlap.segment.start.toISOString().replace("T", " ").slice(0, 19)} UTC —{" "}
                  {overlap.segment.end.toISOString().replace("T", " ").slice(0, 19)} UTC
                </p>
                <div className="pt-2 space-y-2">
                  <p className="text-sm font-medium text-foreground">Same window in each zone</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    {participants.map((p) => (
                      <li key={p.id}>
                        <span className="text-foreground">{p.timeZone}:</span>{" "}
                        {formatRange(overlap.segment!.start, overlap.segment!.end, p.timeZone)}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground">
                No overlap on this date with these working hours — try different hours or fewer regions.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
