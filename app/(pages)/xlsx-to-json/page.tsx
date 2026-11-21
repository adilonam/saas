"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";

export default function XlsxToJsonPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [maxRows, setMaxRows] = useState<number>(10000);

  const [rows, setRows] = useState<unknown[] | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    if (!f.name.toLowerCase().endsWith(".xlsx")) {
      setError("Please select a .xlsx file.");
      return;
    }

    setFile(f);
    setRows(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/xlsx-to-json")}`,
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

    if (!file) {
      setError("Please select an XLSX file first.");
      return;
    }

    setIsConverting(true);
    setError(null);
    setRows(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("max_rows", String(maxRows));

      const res = await fetch("/api/xlsx-to-json", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error || "Failed to convert XLSX on backend"
        );
        return;
      }

      await update();

      const data = (await res.json()) as { rows?: unknown };
      setRows((Array.isArray(data.rows) ? data.rows : []) as unknown[]);
    } catch {
      setError("Something went wrong while converting. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!rows) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(rows, null, 2)
      );
    } catch {
      setError("Copy failed. Your browser may block clipboard access.");
    }
  };

  const handleDownload = () => {
    if (!rows) return;
    const content = JSON.stringify(rows, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rows.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const jsonText = rows ? JSON.stringify(rows, null, 2) : "";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CodeBracketSquareIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">XLSX to JSON</h1>
            <p className="mt-1 text-muted-foreground">
              Convert the first sheet of an XLSX workbook into JSON rows.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              disabled={isConverting}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose XLSX
            </Button>
            {file ? (
              <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                {file.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No file selected</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxRows">Max rows (default 10000)</Label>
              <input
                id="maxRows"
                type="number"
                min={0}
                value={maxRows}
                onChange={(e) => setMaxRows(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isConverting}
              />
              <p className="text-xs text-muted-foreground">
                Use <code>0</code> for no row limit.
              </p>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full gap-2"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting…
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-4 w-4" />
                    Convert to JSON
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {rows && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Conversion result
                </p>
                <p className="text-sm text-muted-foreground">
                  Rows: {rows.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download JSON
                </Button>
              </div>
            </div>
            <pre className="w-full min-h-[200px] max-h-[520px] overflow-auto rounded-xl border border-input bg-background p-4 font-mono text-xs text-foreground whitespace-pre-wrap break-all">
              {jsonText}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

