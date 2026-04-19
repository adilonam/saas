"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function ImageBatchToPdfPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!guardToolAccess(status, session, pathname, "/image-batch-to-pdf", router)) return;
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const pdfFiles: File[] = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/image-to-pdf", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed to convert ${file.name}`);
        }
        const blob = await res.blob();
        const pdfName = `${file.name.replace(/\.[^.]+$/, "")}.pdf`;
        pdfFiles.push(new File([blob], pdfName, { type: "application/pdf" }));
      }

      const zipFd = new FormData();
      for (const pdfFile of pdfFiles) zipFd.append("files", pdfFile);

      const zipRes = await fetch("/api/zip-create", { method: "POST", body: zipFd });
      if (!zipRes.ok) {
        const data = await zipRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to bundle ZIP.");
      }

      const zipBlob = await zipRes.blob();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "image-batch-pdfs.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Batch process failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Image Batch to PDF</h1>
          <p className="mt-1 text-muted-foreground">
            Convert multiple images to individual PDFs, then download all in one ZIP.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select images
          </Button>

          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">{files.length} image(s) selected</p>
          )}

          <Button onClick={handleRun} disabled={files.length === 0 || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Convert and download ZIP
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
