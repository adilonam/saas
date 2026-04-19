"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlobeAltIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const PAGE = "/timezone-now-grid";

const PRESETS = [
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
  { value: "UTC", label: "UTC" },
];

function formatNow(zone: string, now: Date): { time: string; date: string; offset: string } {
  try {
    const time = now.toLocaleTimeString("en-US", {
      timeZone: zone,
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
    const date = now.toLocaleDateString("en-US", {
      timeZone: zone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return { time, date, offset };
  } catch {
    return { time: "—", date: "Invalid zone", offset: "" };
  }
}

export default function TimezoneNowGridPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [rows, setRows] = useState<{ id: string; zone: string }[]>([
    { id: "a", zone: "America/New_York" },
    { id: "b", zone: "Europe/London" },
    { id: "c", zone: "Asia/Tokyo" },
  ]);
  const [customZone, setCustomZone] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!unlocked) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [unlocked]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setUnlocked(true);
  };

  const addPreset = (zone: string) => {
    setRows((r) => [...r, { id: Math.random().toString(36).slice(2), zone }]);
    setUnlocked(false);
  };

  const addCustom = () => {
    const z = customZone.trim();
    if (!z) return;
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: z }).format(new Date());
    } catch {
      return;
    }
    setRows((r) => [...r, { id: Math.random().toString(36).slice(2), zone: z }]);
    setCustomZone("");
    setUnlocked(false);
  };

  const removeRow = (id: string) => {
    setRows((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)));
    setUnlocked(false);
  };

  const setRowZone = (id: string, zone: string) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, zone } : row)));
    setUnlocked(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <GlobeAltIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Time zone “now” grid</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              See the current local date and time across regions you pick (updates every second).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label>Quick add</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button key={p.value} type="button" variant="outline" size="sm" onClick={() => addPreset(p.value)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={customZone}
              onChange={(e) => setCustomZone(e.target.value)}
              placeholder="IANA zone e.g. Africa/Nairobi"
              className="rounded-xl font-mono text-sm"
            />
            <Button type="button" variant="secondary" onClick={addCustom}>
              Add custom
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Rows</Label>
            {rows.map((row, i) => (
              <div key={row.id} className="flex flex-wrap items-center gap-2">
                <select
                  className="flex h-10 min-w-[12rem] flex-1 rounded-md border border-input bg-background px-2 text-sm"
                  value={row.zone}
                  onChange={(e) => setRowZone(row.id, e.target.value)}
                >
                  {PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.value})
                    </option>
                  ))}
                  {!PRESETS.some((p) => p.value === row.zone) && (
                    <option value={row.zone}>{row.zone}</option>
                  )}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  aria-label={`Remove row ${i + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => addPreset("UTC")}
            >
              <PlusIcon className="h-4 w-4" />
              Add row (UTC)
            </Button>
          </div>

          <Button onClick={handleSubmit} className="gap-2">
            <GlobeAltIcon className="h-4 w-4" />
            Show grid
          </Button>
        </div>

        {unlocked && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80">
                <tr>
                  <th className="text-left p-3 font-medium">Time zone</th>
                  <th className="text-left p-3 font-medium">Local time</th>
                  <th className="text-left p-3 font-medium">Local date</th>
                  <th className="text-left p-3 font-medium">Offset</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const f = formatNow(row.zone, now);
                  return (
                    <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-3 font-mono text-xs break-all">{row.zone}</td>
                      <td className="p-3 font-mono">{f.time}</td>
                      <td className="p-3">{f.date}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{f.offset}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
