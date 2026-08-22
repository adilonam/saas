"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

function num(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export default function QueryCostEstimatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [rows, setRows] = useState("100000");
  const [bytesPerRow, setBytesPerRow] = useState("256");
  const [scans, setScans] = useState("1");
  const [selectivity, setSelectivity] = useState("0.1");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/query-cost-estimator", router)) return;
    const r = num(rows, 0);
    const b = num(bytesPerRow, 1);
    const s = Math.max(1, Math.floor(num(scans, 1)));
    const sel = Math.min(1, Math.max(0.0001, num(selectivity, 1)));
    const rawBytes = r * b * s;
    const estResultRows = Math.max(1, Math.ceil(r * sel));
    const resultBytes = estResultRows * b;
    const mibRaw = rawBytes / (1024 * 1024);
    const mibRes = resultBytes / (1024 * 1024);

    setOut(
      [
        "## Rough working-set size (educational)",
        "",
        `- Estimated rows touched (read side): **${r.toLocaleString()}** × **${s}** scan(s) ≈ **${(r * s).toLocaleString()}** row-reads (upper bound if full scans).`,
        `- Assumed average row width: **${b}** bytes → ~**${mibRaw.toFixed(2)}** MiB if all those rows enter memory at once (ignoring compression and cache).`,
        `- With **${(sel * 100).toFixed(2)}%** selectivity, result rows ≈ **${estResultRows.toLocaleString()}** → ~**${mibRes.toFixed(3)}** MiB of payload if each result row is similar width.`,
        "",
        "_This is not query planner output — use EXPLAIN (ANALYZE, BUFFERS) on your database for real numbers._",
      ].join("\n"),
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Query cost estimator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Back-of-the-envelope row size math for learning — not for production tuning.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ["rows", "Table / scan rows (estimate)", rows, setRows],
                ["bpr", "Avg bytes per row (payload)", bytesPerRow, setBytesPerRow],
                ["scn", "Sequential scans counted", scans, setScans],
                ["sel", "Selectivity (0–1)", selectivity, setSelectivity],
              ] as const
            ).map(([id, lab, val, set]) => (
              <div key={id} className="space-y-2">
                <Label htmlFor={id}>{lab}</Label>
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-mono"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
          </div>

          <Button type="button" onClick={submit} className="gap-2">
            <CalculatorIcon className="size-4" />
            Estimate
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Notes</Label>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-background p-4 text-sm whitespace-pre-wrap">
                {out}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
