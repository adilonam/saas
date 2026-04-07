"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type CsvMode =
  | "cleaner"
  | "column-mapper"
  | "deduplicator"
  | "merge-assistant"
  | "markdown-table";

type CsvRowsResponse = { rows?: string[][] };

function toMarkdownTable(rows: string[][]): string {
  if (!rows.length) return "";
  const header = rows[0] ?? [];
  const body = rows.slice(1);
  const escapeCell = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");
  const headerLine = `| ${header.map(escapeCell).join(" | ")} |`;
  const dividerLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map((row) => {
    const padded = header.map((_, idx) => row[idx] ?? "");
    return `| ${padded.map(escapeCell).join(" | ")} |`;
  });
  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

function transformRows(
  mode: CsvMode,
  rows: string[][],
  mappedHeadersInput: string,
): { rows: string[][]; markdown: string } {
  if (!rows.length) return { rows: [], markdown: "" };

  if (mode === "cleaner") {
    const cleaned = rows
      .map((row) => row.map((cell) => cell.trim()))
      .filter((row) => row.some((cell) => cell.length > 0));
    return { rows: cleaned, markdown: "" };
  }

  if (mode === "column-mapper") {
    const header = rows[0] ?? [];
    const mapped = mappedHeadersInput
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (!mapped.length) return { rows, markdown: "" };
    const nextHeader = header.map((current, idx) => mapped[idx] || current);
    return { rows: [nextHeader, ...rows.slice(1)], markdown: "" };
  }

  if (mode === "deduplicator") {
    const [header, ...data] = rows;
    const seen = new Set<string>();
    const unique = data.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { rows: [header, ...unique], markdown: "" };
  }

  if (mode === "markdown-table") {
    return { rows, markdown: toMarkdownTable(rows) };
  }

  return { rows, markdown: "" };
}

const COPY_BY_MODE: Record<CsvMode, { title: string; subtitle: string; submitLabel: string }> = {
  cleaner: {
    title: "CSV Cleaner",
    subtitle: "Trim cells and remove blank rows from CSV files.",
    submitLabel: "Clean CSV",
  },
  "column-mapper": {
    title: "CSV Column Mapper",
    subtitle: "Rename CSV columns quickly after importing your file.",
    submitLabel: "Map Columns",
  },
  deduplicator: {
    title: "CSV Deduplicator",
    subtitle: "Remove duplicate data rows while preserving order.",
    submitLabel: "Deduplicate CSV",
  },
  "merge-assistant": {
    title: "CSV Merge Assistant",
    subtitle: "Merge multiple CSV files into one unified table.",
    submitLabel: "Merge CSV Files",
  },
  "markdown-table": {
    title: "CSV to Markdown Table",
    subtitle: "Convert CSV rows into a Markdown table ready for docs.",
    submitLabel: "Convert to Markdown",
  },
};

export default function CsvRowsToolPage({ mode }: { mode: CsvMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [delimiter, setDelimiter] = useState(",");
  const [maxRows, setMaxRows] = useState("10000");
  const [mappedHeadersInput, setMappedHeadersInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [markdown, setMarkdown] = useState("");

  const copy = COPY_BY_MODE[mode];

  const isMergeMode = mode === "merge-assistant";
  const hasFile = files.length > 0;

  const preview = useMemo(() => {
    if (!rows.length) return { header: [] as string[], data: [] as string[][] };
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

  const fetchRows = async (file: File): Promise<string[][]> => {
    const formData = new FormData();
    formData.append("file", file);
    if (delimiter.trim()) formData.append("delimiter", delimiter.trim());
    if (maxRows.trim()) formData.append("max_rows", maxRows.trim());

    const res = await fetch("/api/csv-to-json", { method: "POST", body: formData });
    const data = (await res.json().catch(() => null)) as
      | CsvRowsResponse
      | { error?: string; detail?: string }
      | null;
    if (!res.ok) {
      const message =
        (data as { error?: string; detail?: string } | null)?.error ||
        (data as { error?: string; detail?: string } | null)?.detail ||
        "Failed to process CSV";
      throw new Error(message);
    }
    return (data?.rows ?? []) as string[][];
  };

  const handleSubmit = async () => {
    setError(null);
    setRows([]);
    setMarkdown("");

    if (!ensureAccess()) return;
    if (!hasFile) {
      setError("Please choose at least one .csv file.");
      return;
    }

    setIsLoading(true);
    try {
      let sourceRows: string[][] = [];
      if (isMergeMode) {
        for (let i = 0; i < files.length; i += 1) {
          const chunkRows = await fetchRows(files[i]);
          if (!chunkRows.length) continue;
          if (!sourceRows.length) sourceRows = chunkRows;
          else sourceRows = [...sourceRows, ...chunkRows.slice(1)];
        }
      } else {
        sourceRows = await fetchRows(files[0]);
      }

      const transformed = transformRows(mode, sourceRows, mappedHeadersInput);
      setRows(transformed.rows);
      setMarkdown(transformed.markdown);
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
            accept=".csv,text/csv"
            multiple={isMergeMode}
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Choose CSV{isMergeMode ? " Files" : ""}
            </Button>
            <span className="text-sm text-muted-foreground">
              {hasFile ? `${files.length} file(s) selected` : "No file selected"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Delimiter</label>
              <Input
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                placeholder=","
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max rows</label>
              <Input
                value={maxRows}
                onChange={(e) => setMaxRows(e.target.value)}
                placeholder="10000"
                disabled={isLoading}
              />
            </div>
          </div>

          {mode === "column-mapper" ? (
            <div>
              <label className="text-sm font-medium">New headers (comma separated)</label>
              <Input
                value={mappedHeadersInput}
                onChange={(e) => setMappedHeadersInput(e.target.value)}
                placeholder="name,email,role,..."
                disabled={isLoading}
              />
            </div>
          ) : null}

          <Button onClick={handleSubmit} disabled={!hasFile || isLoading}>
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
          <div className="space-y-4">
            <div className="rounded-xl border border-input overflow-auto">
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
                  {preview.data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-t border-input/60">
                      {preview.header.map((_, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 text-muted-foreground">
                          {row[colIdx] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing first {Math.max(preview.data.length, 0)} rows. Total rows:{" "}
              {Math.max(rows.length - 1, 0)}.
            </p>
          </div>
        ) : null}

        {mode === "markdown-table" && markdown ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Markdown Table Output</label>
            <pre className="w-full max-h-[320px] overflow-auto rounded-xl border border-input bg-background p-4 text-xs whitespace-pre-wrap">
              {markdown}
            </pre>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
