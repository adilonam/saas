"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type MetadataResponse = {
  page_count: number;
  metadata: Record<string, string | null>;
};

export default function PdfMetadataInspectorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MetadataResponse | null>(null);

  const handleInspect = async () => {
    setError(null);
    setResult(null);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-metadata-inspector")}`);
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
      setError("Please select a PDF file.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/pdf-metadata", { method: "POST", body: formData });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; detail?: string; page_count?: number; metadata?: Record<string, string | null> }
        | null;
      if (!res.ok) {
        setError(data?.error || data?.detail || "Failed to inspect PDF metadata");
        return;
      }
      setResult({
        page_count: data?.page_count || 0,
        metadata: data?.metadata || {},
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    const payload = JSON.stringify(result, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdf-metadata.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">PDF Metadata Inspector + JSON Export</h1>
          <p className="mt-1 text-muted-foreground">Inspect PDF metadata and export it as structured JSON.</p>
        </div>
        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-4">
            <Button variant="outline" type="button" onClick={() => inputRef.current?.click()} disabled={isLoading} className="gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose PDF
            </Button>
            <span className="text-sm text-muted-foreground truncate">{file?.name || "No file selected"}</span>
          </div>
          <Button onClick={handleInspect} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Inspecting...</> : <><DocumentMagnifyingGlassIcon className="h-4 w-4" />Inspect Metadata</>}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {result && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Pages: {result.page_count}</p>
              <Button variant="outline" size="sm" onClick={handleExportJson} className="gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-input bg-background p-4 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
