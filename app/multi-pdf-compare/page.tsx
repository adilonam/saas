"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function MultiPdfComparePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!guardToolAccess(status, session, pathname, "/multi-pdf-compare", router)) return;
    if (files.length < 2) {
      setError("Please upload at least 2 PDFs.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const extracted = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/pdf-to-text", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || `Failed to extract ${file.name}`);
          return `DOCUMENT: ${file.name}\n${String(data.text || "").slice(0, 12000)}`;
        }),
      );

      const aiRes = await fetch("/api/pdf-ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "compare",
          text: extracted.join("\n\n---\n\n"),
        }),
      });
      const aiData = await aiRes.json();
      if (!aiRes.ok) {
        setError(aiData.error || "Comparison failed.");
        return;
      }
      setResult(String(aiData.text || ""));
    } catch (e) {
      console.error(e);
      setError("Something went wrong while comparing PDFs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Multi-PDF Compare</h1>
          <p className="mt-1 text-muted-foreground">
            Compare multiple PDFs and get a structured similarity and differences report.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDFs
          </Button>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((f) => f !== file))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleCompare} disabled={files.length < 2 || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Compare PDFs
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && (
          <pre className="rounded-xl border border-input bg-muted/40 p-4 text-sm whitespace-pre-wrap">
            {result}
          </pre>
        )}
      </div>
    </DashboardLayout>
  );
}
