"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function PDFMetadataPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageCount, setPageCount] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string | null> | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }
    setFile(selected);
    setError(null);
    setPageCount(null);
    setMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExtract = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-metadata")}`
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

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf-metadata", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (
          (response.status === 400 || response.status === 403) &&
          errorData?.error &&
          (errorData.error === "Insufficient tokens" ||
            errorData.error === "Active subscription required")
        ) {
          router.push("/pricing");
          return;
        }
        setError(errorData?.error || errorData?.detail || "Failed to extract metadata");
        return;
      }

      await update();

      const data = (await response.json()) as {
        page_count: number;
        metadata: Record<string, string | null>;
      };

      setPageCount(data.page_count);
      setMetadata(data.metadata);
    } catch (err) {
      console.error("pdf-metadata error:", err);
      setError("An error occurred while extracting metadata. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <DocumentTextIcon className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              PDF Metadata
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Extract page count and document metadata from a PDF.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              disabled={isLoading}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose PDF
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground truncate max-w-[240px]">
                {file.name}
              </span>
            )}
          </div>

          <Button onClick={handleExtract} disabled={!file || isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting…
              </>
            ) : (
              <>
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Extract metadata
              </>
            )}
          </Button>
        </div>

        {(pageCount != null || metadata != null) && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Results
            </h2>
            <div className="mb-4 text-sm text-slate-700 dark:text-slate-200">
              {pageCount != null && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Pages:</span>
                  <span>{pageCount}</span>
                </div>
              )}
            </div>

            {metadata && Object.keys(metadata).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded-xl bg-white/70 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 p-3"
                  >
                    <span className="text-sm font-medium text-slate-900 dark:text-white shrink-0">
                      {key}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 break-words">
                      {value ?? "null"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No metadata found for this document.
              </p>
            )}
          </div>
        )}

        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
            What you get:
          </h3>
          <ul className="text-sm text-indigo-800 dark:text-indigo-200 list-disc list-inside space-y-1">
            <li>Total page count.</li>
            <li>Standard PDF metadata keys like Title/Producer/Author when available.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

