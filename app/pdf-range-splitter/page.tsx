"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function PdfRangeSplitterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [range, setRange] = useState("1-3");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSplit = async () => {
    if (!guardToolAccess(status, session, pathname, "/pdf-range-splitter", router)) return;
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("range", range);

      const res = await fetch("/api/pdf-range-splitter", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to split PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "range-split.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">PDF Page Range Splitter</h1>
          <p className="mt-1 text-muted-foreground">
            Extract a selected page range (e.g. 1-3,5,7-9) into a new PDF.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDF
          </Button>
          {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Page range</label>
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            />
          </div>
          <Button onClick={handleSplit} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Extract range
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
