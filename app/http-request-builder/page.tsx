"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import type { ParsedCurl } from "@/lib/curl-parse";
import { buildCurlCommand, snippetsFromParsed } from "@/lib/curl-snippets";
import { BoltIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

type Row = { key: string; value: string };

function rowsToHeaders(rows: Row[]): Record<string, string> {
  const h: Record<string, string> = {};
  for (const r of rows) {
    const k = r.key.trim();
    if (k) h[k] = r.value;
  }
  return h;
}

export default function HttpRequestBuilderPage() {
  const { assertAccess } = useSubscribedToolAccess("/http-request-builder");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/v1/hello");
  const [rows, setRows] = useState<Row[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "", value: "" },
  ]);
  const [body, setBody] = useState('{\n  "ok": true\n}');
  const [built, setBuilt] = useState<{
    curl: string;
    fetch: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo((): ParsedCurl => {
    const headers = rowsToHeaders(rows);
    const m = method.toUpperCase();
    const trimmedBody = body.trim();
    const includeBody =
      !["GET", "HEAD"].includes(m) && trimmedBody.length > 0;
    return {
      url: url.trim(),
      method: m,
      headers,
      body: includeBody ? body : undefined,
    };
  }, [method, url, rows, body]);

  const handleBuild = () => {
    if (!assertAccess()) return;
    if (!parsed.url) return;
    const p: ParsedCurl = { ...parsed };
    const sn = snippetsFromParsed(p);
    setBuilt({ curl: buildCurlCommand(p), fetch: sn.fetchJs });
  };

  const copyCurl = () => {
    if (!built) return;
    void navigator.clipboard.writeText(built.curl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <BoltIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              HTTP request builder
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Compose method, URL, headers, and body — then copy as cURL or
              JavaScript fetch.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,140px)_1fr] gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm h-10"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <input
                id="url"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono h-10"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Headers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRows((r) => [...r, { key: "", value: "" }])}
              >
                Add row
              </Button>
            </div>
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
                    placeholder="Name"
                    value={row.key}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows((rs) =>
                        rs.map((x, j) => (j === i ? { ...x, key: v } : x)),
                      );
                    }}
                  />
                  <input
                    className="flex-[2] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRows((rs) =>
                        rs.map((x, j) => (j === i ? { ...x, value: v } : x)),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body (optional)</Label>
            <textarea
              id="body"
              className="w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <Button
            type="button"
            onClick={handleBuild}
            disabled={!url.trim()}
            className="gap-2"
          >
            <BoltIcon className="size-4" />
            Build snippets
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>cURL</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyCurl}
                    className="gap-1.5"
                  >
                    <DocumentDuplicateIcon className="size-4" />
                    {copied ? "Copied" : "Copy cURL"}
                  </Button>
                </div>
                <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap">
                  {built.curl}
                </pre>
              </div>
              <div>
                <Label className="mb-2 block">JavaScript fetch</Label>
                <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-64 font-mono whitespace-pre-wrap">
                  {built.fetch}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
