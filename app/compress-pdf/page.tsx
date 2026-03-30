"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type PdfSetting = "screen" | "ebook" | "printer" | "prepress" | "default";

export default function CompressPDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfSettings, setPdfSettings] = useState<PdfSetting>("ebook");

  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [compressedUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    if (f.type !== "application/pdf" || !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    setFile(f);
    setCompressedUrl(null);
    setCompressedSize(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/compress-pdf")}`,
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
      setError("Please select a PDF first.");
      return;
    }

    setIsCompressing(true);
    setError(null);
    setCompressedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCompressedSize(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (pdfSettings) formData.append("pdf_settings", pdfSettings);

      const res = await fetch("/api/compress-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to compress PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
      setCompressedSize(blob.size);
    } catch {
      setError("Something went wrong while compressing. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = "compressed.pdf";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
            <DocumentArrowDownIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Compress PDF</h1>
            <p className="mt-1 text-muted-foreground">
              Upload a PDF, apply Ghostscript PDF settings, and download the optimized result.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose PDF
            </Button>
            {file ? (
              <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                {file.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No PDF selected</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              PDF Settings (Ghostscript)
            </label>
            <select
              value={pdfSettings}
              onChange={(e) => setPdfSettings(e.target.value as PdfSetting)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isCompressing}
            >
              <option value="screen">screen</option>
              <option value="ebook">ebook</option>
              <option value="printer">printer</option>
              <option value="prepress">prepress</option>
              <option value="default">default</option>
            </select>
          </div>

          <Button
            onClick={handleCompress}
            disabled={!file || isCompressing}
            className="gap-2"
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compressing…
              </>
            ) : (
              <>
                <DocumentIcon className="h-4 w-4" />
                Compress PDF
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {compressedUrl && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Compressed PDF ready</p>
                {compressedSize != null && (
                  <p className="text-sm text-muted-foreground">
                    Output size: {(compressedSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
            </div>

            <iframe
              src={compressedUrl}
              className="w-full h-[520px] rounded-lg border border-input bg-white"
              title="Compressed PDF preview"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

