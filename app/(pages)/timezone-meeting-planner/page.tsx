"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobeAltIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

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

function formatInZone(zone: string, date: Date): string {
  try {
    return date.toLocaleTimeString("en-US", {
      timeZone: zone,
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function TimezoneMeetingPlannerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [zones, setZones] = useState<string[]>(["America/New_York", "Europe/London"]);
  const [localTime, setLocalTime] = useState("09:00");
  const [localDate, setLocalDate] = useState(() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  });
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/timezone-meeting-planner")}`,
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
    setResultUnlocked(true);
  };

  const baseDate = useMemo(() => {
    const [y, m, d] = localDate.split("-").map(Number);
    const [h, min] = localTime.split(":").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0, 0, 0);
  }, [localDate, localTime]);

  const addZone = () => setZones((z) => [...z, "UTC"]);
  const removeZone = (i: number) => setZones((z) => z.filter((_, j) => j !== i));
  const setZone = (i: number, value: string) =>
    setZones((z) => {
      const next = [...z];
      next[i] = value;
      return next;
    });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Time Zone Meeting Planner
          </h1>
          <p className="mt-1 text-muted-foreground">
            Enter a meeting time and time zones to see the same moment everywhere.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local-date">Date</Label>
              <Input
                id="local-date"
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="local-time">Time (your local)</Label>
              <Input
                id="local-time"
                type="time"
                value={localTime}
                onChange={(e) => setLocalTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Time zones</Label>
              <Button type="button" variant="outline" size="sm" onClick={addZone} className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {zones.map((zone, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={zone}
                    onChange={(e) => setZone(i, e.target.value)}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {COMMON_ZONES.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label} ({z.value})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeZone(i)}
                    disabled={zones.length <= 1}
                    aria-label="Remove timezone"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="gap-2 w-full sm:w-auto">
            <GlobeAltIcon className="h-4 w-4" />
            Show times
          </Button>
        </div>

        {resultUnlocked && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5" />
              Same moment in each time zone
            </h2>
            <ul className="space-y-2">
              {zones.map((zone) => (
                <li key={zone} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{zone}</span>
                  <span className="font-medium">{formatInZone(zone, baseDate)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
