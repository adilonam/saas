"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type InputMode = "auto" | "unix_s" | "unix_ms" | "iso";

function parseTimestamp(raw: string, mode: InputMode): Date | null {
  const t = raw.trim();
  if (!t) return null;
  if (mode === "unix_s") {
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return new Date(n * 1000);
  }
  if (mode === "unix_ms") {
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    return new Date(n);
  }
  if (mode === "iso") {
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    if (!Number.isFinite(n)) return null;
    if (t.length >= 13) return new Date(n);
    return new Date(n * 1000);
  }
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<InputMode>("auto");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);

  const handleConvert = () => {
    if (!guardToolAccess(status, session, pathname, "/timestamp-converter", router)) {
      return;
    }
    setError(null);
    const d = parseTimestamp(input, mode);
    if (!d) {
      setError("Could not parse that value. Try another format or switch input type.");
      setDate(null);
      setUnlocked(false);
      return;
    }
    setDate(d);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Timestamp Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Convert between Unix time, ISO strings, and local display.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ts-input">Value</Label>
            <Input
              id="ts-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setUnlocked(false);
              }}
              placeholder="1735689600, 1735689600000, or 2025-01-01T00:00:00.000Z"
              className="rounded-xl font-mono text-sm"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-900 dark:text-white">
              Input type
            </legend>
            <div className="flex flex-wrap gap-3 text-sm">
              {(
                [
                  ["auto", "Auto"],
                  ["unix_s", "Unix (seconds)"],
                  ["unix_ms", "Unix (milliseconds)"],
                  ["iso", "ISO / date string"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ts-mode"
                    checked={mode === v}
                    onChange={() => setMode(v)}
                    className="rounded-full border-slate-300"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <Button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="gap-2"
          >
            <ClockIcon className="h-4 w-4" />
            Convert
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && date && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 font-mono text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">
                  Unix (seconds)
                </dt>
                <dd className="text-slate-900 dark:text-white">
                  {Math.floor(date.getTime() / 1000)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">
                  Unix (milliseconds)
                </dt>
                <dd className="text-slate-900 dark:text-white">{date.getTime()}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">
                  ISO (UTC)
                </dt>
                <dd className="text-slate-900 dark:text-white break-all">
                  {date.toISOString()}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs font-sans mb-0.5">
                  Local string
                </dt>
                <dd className="text-slate-900 dark:text-white break-all">
                  {date.toString()}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
