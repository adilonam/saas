"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenObject(v as Record<string, unknown>, key));
    } else {
      out[key] = v == null ? "" : String(v);
    }
  }
  return out;
}

function jsonToCsv(jsonStr: string): string {
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON");
  }
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return "";
  const allKeys = new Set<string>();
  const flatRows = rows.map((row) => {
    const flat = flattenObject(
      typeof row === "object" && row !== null ? (row as Record<string, unknown>) : {}
    );
    Object.keys(flat).forEach((k) => allKeys.add(k));
    return flat;
  });
  const headers = Array.from(allKeys).sort();
  const escape = (s: string) => {
    const t = String(s);
    if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
    return t;
  };
  const line = (row: Record<string, string>) =>
    headers.map((h) => escape(row[h] ?? "")).join(",");
  return [headers.join(","), ...flatRows.map(line)].join("\n");
}

export default function JsonToCsvPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [jsonInput, setJsonInput] = useState('[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]');
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/json-to-csv")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setError(null);
    try {
      const csv = jsonToCsv(jsonInput);
      setCsvOutput(csv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    }
  };

  const handleCopy = () => {
    if (!csvOutput) return;
    navigator.clipboard.writeText(csvOutput);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <ArrowPathIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JSON → CSV Converter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Paste JSON (array of objects) and convert to CSV
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">JSON input</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder='[{"a": 1}, {"a": 2}]'
              spellCheck={false}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleConvert} className="gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Convert to CSV
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {csvOutput && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CSV output</label>
                <Button variant="outline" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <pre className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
                {csvOutput}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
