"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { TableCellsIcon } from "@heroicons/react/24/outline";
import { logLinesToTable } from "@/lib/log-line-parse";

const SAMPLE = `{"level":"info","msg":"ready","port":3000}
time=2026-04-19T10:00:00Z level=error msg="db timeout" code=504`;

export default function LogLineParserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [input, setInput] = useState(SAMPLE);
  const [parsed, setParsed] = useState<ReturnType<typeof logLinesToTable> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/log-line-parser")}`);
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

  const handleParse = () => {
    if (!ensureAuth()) return;
    setError(null);
    const lines = input.split(/\r?\n/);
    const table = logLinesToTable(lines);
    if (table.rows.length === 0) {
      setError("No non-empty lines to parse.");
      setParsed(null);
      return;
    }
    setParsed(table);
  };

  const tsv = useMemo(() => {
    if (!parsed) return "";
    const cols = parsed.columns;
    const esc = (s: string) => {
      if (/[\t\n\r"]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = cols.map(esc).join("\t");
    const body = parsed.rows.map((r) => cols.map((c) => esc(r[c] ?? "")).join("\t")).join("\n");
    return `${header}\n${body}`;
  }, [parsed]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <TableCellsIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Log line parser</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              One JSON object or key=value line per row — flattened keys become columns.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Log lines</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleParse}>
            Parse into table
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {parsed && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(tsv)}>
                  Copy as TSV
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80">
                      {parsed.columns.map((c) => (
                        <th key={c} className="text-left font-semibold px-3 py-2 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        {parsed.columns.map((c) => (
                          <td key={c} className="px-3 py-2 align-top font-mono text-xs break-all max-w-[280px]">
                            {row[c] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
