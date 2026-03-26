"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { DocumentPlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function SplitPDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSplit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/split-pdf")}`
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

    setIsSplitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/split-pdf", {
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
        setError(errorData?.error || errorData?.detail || "Failed to split PDF");
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";

      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_pages.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFile();
    } catch (err) {
      console.error("split-pdf error:", err);
      setError("An error occurred while splitting. Please try again.");
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
              <DocumentPlusIcon className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Split PDF
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Upload a PDF and split it into one page per file (download as a ZIP).
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div
          className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/40"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropped = e.dataTransfer.files?.[0] ?? null;
            if (!dropped) return;
            if (dropped.type !== "application/pdf") {
              setFile(null);
              setError("Only PDF files are allowed.");
              return;
            }
            setFile(dropped);
            setError(null);
          }}
        >
          <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Drag and drop a PDF here, or
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isSplitting}
            className="rounded-xl"
          >
            Select PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSplitting}
          />
        </div>

        {file && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <DocumentPlusIcon className="size-6 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              disabled={isSplitting}
              className="rounded-xl"
              aria-label="Remove file"
            >
              <XMarkIcon className="size-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-4 mb-10">
          <Button
            onClick={handleSplit}
            disabled={!file || isSplitting}
            className="gap-2"
          >
            {isSplitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Splitting…
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4" />
                Split into pages
              </>
            )}
          </Button>
          {file && (
            <Button
              variant="outline"
              onClick={clearFile}
              disabled={isSplitting}
              className="rounded-xl"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="p-6 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-200 mb-2">
            How it works:
          </h3>
          <ol className="text-sm text-teal-800 dark:text-teal-200 list-decimal list-inside space-y-1">
            <li>Upload a PDF file.</li>
            <li>Click “Split into pages”.</li>
            <li>Download a ZIP with `page_001`, `page_002`, etc.</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}

