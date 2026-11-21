"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpTrayIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type RowsResponse = { rows?: unknown[][]; error?: string; detail?: string };

export default function DataProfilerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<unknown[][]>([]);

  const stats = useMemo(() => {
    const header = rows[0] || [];
    const dataRows = rows.slice(1);
    return {
      columns: header.length,
      rows: dataRows.length,
      nullCells: dataRows.flat().filter((value) => value === null || value === "").length,
      sample: dataRows.slice(0, 10),
    };
  }, [rows]);

  const handleProfile = async () => {
    setError(null);
    setRows([]);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/data-profiler")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (!file) {
      setError("Please select a CSV or XLSX file.");
      return;
    }

    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
    if (!isCsv && !isXlsx) {
      setError("Only .csv and .xlsx files are supported.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("max_rows", "10000");
      const endpoint = isCsv ? "/api/csv-to-json" : "/api/xlsx-to-json";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as RowsResponse | null;
      if (!res.ok) {
        setError(data?.error || data?.detail || "Failed to profile file");
        return;
      }
      setRows(Array.isArray(data?.rows) ? data!.rows! : []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">CSV/XLSX Quick Profiler</h1>
          <p className="mt-1 text-muted-foreground">Upload CSV or XLSX and get a quick structural profile.</p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isLoading} className="gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose CSV/XLSX
            </Button>
            <span className="text-sm text-muted-foreground truncate">{file?.name || "No file selected"}</span>
          </div>
          <Button onClick={handleProfile} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Profiling...</> : <><ChartBarIcon className="h-4 w-4" />Run Profile</>}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {rows.length > 0 && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-input bg-background p-4"><p className="text-xs text-muted-foreground">Columns</p><p className="text-xl font-semibold">{stats.columns}</p></div>
              <div className="rounded-lg border border-input bg-background p-4"><p className="text-xs text-muted-foreground">Data rows</p><p className="text-xl font-semibold">{stats.rows}</p></div>
              <div className="rounded-lg border border-input bg-background p-4"><p className="text-xs text-muted-foreground">Empty cells</p><p className="text-xl font-semibold">{stats.nullCells}</p></div>
            </div>
            <div className="overflow-auto rounded-lg border border-input bg-background">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/60">
                  <tr>
                    {(rows[0] || []).map((col, i) => <th key={i} className="px-3 py-2 text-left">{String(col ?? "")}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {stats.sample.map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-input/60">
                      {(rows[0] || []).map((_, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-muted-foreground">{String((row?.[cIdx] ?? "") as string)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
