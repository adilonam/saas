"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CodeBracketSquareIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type CsvToJsonResponse = { rows?: string[][] };

export default function CsvToJsonPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState<string>(",");
  const [maxRows, setMaxRows] = useState<string>("10000");

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] = useState<CsvToJsonResponse | null>(null);
  const rows = useMemo(() => response?.rows ?? [], [response]);

  const preview = useMemo(() => {
    if (!rows.length) return { header: [] as string[], data: [] as string[][] };
    const header = rows[0] ?? [];
    const data = rows.slice(1, 51); // preview first 50 data rows
    return { header, data };
  }, [rows]);

  const jsonPretty = useMemo(() => {
    return response ? JSON.stringify(response, null, 2) : "";
  }, [response]);

  const validateBeforeConvert = (): boolean => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/csv-to-json")}`);
      return false;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }

    if (!file) {
      setError("Please select a .csv file first.");
      return false;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Selected file must be a .csv");
      return false;
    }

    const d = delimiter.trim();
    if (d.length !== 1) {
      setError("Delimiter must be a single character (e.g. , or ;).");
      return false;
    }

    if (maxRows.trim()) {
      const n = Number(maxRows.trim());
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        setError("Max rows must be a non-negative integer (or empty for default).");
        return false;
      }
    }

    return true;
  };

  const handleConvert = async () => {
    setError(null);
    setResponse(null);

    if (!validateBeforeConvert()) return;

    setIsConverting(true);
    try {
      const formData = new FormData();
      if (!file) return;
      formData.append("file", file);

      const d = delimiter.trim();
      if (d) formData.append("delimiter", d);

      const mr = maxRows.trim();
      if (mr) formData.append("max_rows", mr);

      const res = await fetch("/api/csv-to-json", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string; detail?: string }
        | CsvToJsonResponse
        | null;

      if (!res.ok) {
        const msg =
          (data as { error?: string; detail?: string } | null)?.error ||
          (data as { error?: string; detail?: string } | null)?.detail ||
          "Failed to convert CSV to JSON";
        setError(msg);
        return;
      }

      setResponse(data as CsvToJsonResponse);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (!jsonPretty) return;
    await navigator.clipboard.writeText(jsonPretty);
  };

  const handleDownload = () => {
    if (!jsonPretty) return;
    const blob = new Blob([jsonPretty], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "csv-to-json.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectFile = (f: File | null) => {
    setResponse(null);
    setError(null);
    setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">CSV to JSON</h1>
          <p className="mt-1 text-muted-foreground">
            Upload a CSV file and get `rows` as a 2D JSON array.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleSelectFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              disabled={isConverting}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose CSV
            </Button>

            {file && (
              <span className="text-sm text-muted-foreground truncate">
                {file.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Delimiter</label>
              <Input
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                placeholder=","
                disabled={isConverting}
              />
              <p className="text-xs text-muted-foreground">
                Single character (default: `,`).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Max rows (optional)
              </label>
              <Input
                value={maxRows}
                onChange={(e) => setMaxRows(e.target.value)}
                placeholder="10000"
                disabled={isConverting}
              />
              <p className="text-xs text-muted-foreground">
                Use `0` for no limit.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
              className="gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  Convert to JSON
                </>
              )}
            </Button>

            {file && (
              <Button
                variant="outline"
                type="button"
                disabled={isConverting}
                onClick={() => handleSelectFile(null)}
              >
                Remove File
              </Button>
            )}
          </div>
        </div>

        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CodeBracketSquareIcon className="h-4 w-4" />
                  Preview
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleCopy}
                    disabled={!jsonPretty}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleDownload}
                    disabled={!jsonPretty}
                    className="gap-1.5"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="overflow-auto rounded-lg border border-input bg-background">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted/60">
                    <tr>
                      {preview.header.map((h, idx) => (
                        <th key={idx} className="px-3 py-2 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.data.map((row, i) => (
                      <tr key={i} className="border-t border-input/60">
                        {preview.header.map((_, colIdx) => (
                          <td key={colIdx} className="px-3 py-2 text-muted-foreground">
                            {row?.[colIdx] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">
                Showing first {Math.min(Math.max(rows.length - 1, 0), 50)} data rows.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full JSON</label>
              <pre className="w-full max-h-[360px] overflow-auto rounded-xl border border-input bg-background p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {jsonPretty}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

