"use client";

import { useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";

export default function ScreenshotToPdfReporterPage() {
  const { ensureAccess } = useToolAccess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!ensureAccess()) return;
    if (files.length === 0) {
      setError("Please select at least one screenshot.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfFiles: File[] = [];

      for (let i = 0; i < files.length; i += 1) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("quality", "95");
        formData.append("strip_metadata", "true");

        const res = await fetch("/api/image-to-pdf", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed on file ${i + 1}`);
        }

        const blob = await res.blob();
        const baseName = files[i].name.replace(/\.[^.]+$/, "") || `report-${i + 1}`;
        pdfFiles.push(new File([blob], `${baseName}.pdf`, { type: "application/pdf" }));
      }

      const zipBody = new FormData();
      pdfFiles.forEach((f) => zipBody.append("files", f));

      const zipRes = await fetch("/api/zip-create", {
        method: "POST",
        body: zipBody,
      });

      if (!zipRes.ok) {
        const data = await zipRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to create ZIP");
      }

      const zipBlob = await zipRes.blob();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "screenshot-pdf-reports.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Screenshot to PDF Reporter</h1>
          <p className="mt-1 text-muted-foreground">
            Upload screenshots, convert each image to PDF, and download them as a ZIP report pack.
          </p>
        </div>

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm"
          />
          <p className="text-sm text-muted-foreground">
            {files.length > 0 ? `${files.length} screenshot(s) selected` : "No files selected"}
          </p>
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Building report...
            </>
          ) : (
            "Convert screenshots to PDF ZIP"
          )}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </DashboardLayout>
  );
}
