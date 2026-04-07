"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type XlsxMode = "sheet-explorer" | "chart-json";

type XlsxResponse = { rows?: unknown[] };

const COPY_BY_MODE: Record<XlsxMode, { title: string; subtitle: string; submitLabel: string }> = {
  "sheet-explorer": {
    title: "XLSX Sheet Explorer",
    subtitle: "Inspect rows from the first worksheet in your XLSX file.",
    submitLabel: "Explore Sheet",
  },
  "chart-json": {
    title: "XLSX to Chart JSON",
    subtitle: "Convert XLSX data into a labels + dataset JSON structure.",
    submitLabel: "Generate Chart JSON",
  },
};

export default function XlsxRowsToolPage({ mode }: { mode: XlsxMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [maxRows, setMaxRows] = useState("10000");
  const [labelColumn, setLabelColumn] = useState("0");
  const [valueColumn, setValueColumn] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<(string | number | null)[][]>([]);
  const [chartJson, setChartJson] = useState("");

  const copy = COPY_BY_MODE[mode];

  const preview = useMemo(() => {
    if (!rows.length) return { header: [] as (string | number | null)[], data: [] as (string | number | null)[][] };
    return { header: rows[0] ?? [], data: rows.slice(1, 31) };
  }, [rows]);

  const ensureAccess = (): boolean => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`);
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

  const handleSubmit = async () => {
    setError(null);
    setRows([]);
    setChartJson("");

    if (!ensureAccess()) return;
    if (!file) {
      setError("Please choose one .xlsx file.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (maxRows.trim()) formData.append("max_rows", maxRows.trim());

      const res = await fetch("/api/xlsx-to-json", { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as
        | XlsxResponse
        | { error?: string; detail?: string }
        | null;

      if (!res.ok) {
        const message =
          (data as { error?: string; detail?: string } | null)?.error ||
          (data as { error?: string; detail?: string } | null)?.detail ||
          "Failed to process XLSX";
        throw new Error(message);
      }

      const parsedRows = ((data?.rows ?? []) as (string | number | null)[][]) || [];
      setRows(parsedRows);

      if (mode === "chart-json" && parsedRows.length > 1) {
        const lIdx = Number(labelColumn);
        const vIdx = Number(valueColumn);
        const labels = parsedRows.slice(1).map((row) => String(row[lIdx] ?? ""));
        const values = parsedRows.slice(1).map((row) => Number(row[vIdx] ?? 0));
        const chart = {
          labels,
          datasets: [
            {
              label: String(parsedRows[0]?.[vIdx] ?? "Series 1"),
              data: values,
            },
          ],
        };
        setChartJson(JSON.stringify(chart, null, 2));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="text-muted-foreground mt-1">{copy.subtitle}</p>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              Choose XLSX
            </Button>
            <span className="text-sm text-muted-foreground">{file ? file.name : "No file selected"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Max rows</label>
              <Input value={maxRows} onChange={(e) => setMaxRows(e.target.value)} disabled={isLoading} />
            </div>
            {mode === "chart-json" ? (
              <>
                <div>
                  <label className="text-sm font-medium">Label column index</label>
                  <Input value={labelColumn} onChange={(e) => setLabelColumn(e.target.value)} disabled={isLoading} />
                </div>
                <div>
                  <label className="text-sm font-medium">Value column index</label>
                  <Input value={valueColumn} onChange={(e) => setValueColumn(e.target.value)} disabled={isLoading} />
                </div>
              </>
            ) : null}
          </div>

          <Button onClick={handleSubmit} disabled={!file || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Working...
              </>
            ) : (
              copy.submitLabel
            )}
          </Button>
        </div>

        {rows.length > 0 ? (
          <div className="rounded-xl border border-input overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/60">
                <tr>
                  {preview.header.map((h, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-medium">
                      {String(h ?? "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-input/60">
                    {preview.header.map((_, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 text-muted-foreground">
                        {String(row[colIdx] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {mode === "chart-json" && chartJson ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Chart JSON Output</label>
            <pre className="w-full max-h-[320px] overflow-auto rounded-xl border border-input bg-background p-4 text-xs whitespace-pre-wrap">
              {chartJson}
            </pre>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
