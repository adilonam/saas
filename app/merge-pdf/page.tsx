"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import DepositDialog from "components/DepositDialog";
import { Button } from "@/components/ui/button";
import {
  Squares2X2Icon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface SelectedFile {
  file: File;
  id: string;
}

export default function MergePDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Some files are not PDFs. Only PDF files are allowed.");
      setTimeout(() => setError(null), 5000);
    }

    const newFiles: SelectedFile[] = pdfFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/merge-pdf")}`,
      );
      return;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      setDepositDialogOpen(true);
      return;
    }

    if (selectedFiles.length < 2) {
      setError("Please select at least 2 PDF files to merge");
      return;
    }

    setIsMerging(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/merge-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (
            (response.status === 400 || response.status === 403) &&
            (errorData.error === "Insufficient tokens" ||
              errorData.error === "Active subscription required")
          ) {
            setDepositDialogOpen(true);
            setIsMerging(false);
            return;
          }
          setError(errorData.error || "Failed to merge PDFs");
        } catch {
          setError("Failed to merge PDFs");
        }
        setIsMerging(false);
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSelectedFiles([]);
    } catch (err) {
      console.error("Error merging PDFs:", err);
      setError("An error occurred while merging PDFs. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Some files are not PDFs. Only PDF files are allowed.");
      setTimeout(() => setError(null), 5000);
    }

    const newFiles: SelectedFile[] = pdfFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  return (
    <DashboardLayout>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={async () => await update()}
      />

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
            <Squares2X2Icon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Merge PDFs
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Select multiple PDF files and merge them into a single document
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div
        className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/40"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Drag and drop PDF files here, or
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          disabled={isMerging}
          className="rounded-xl"
        >
          Select PDF Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isMerging}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Selected Files ({selectedFiles.length})
          </h2>
          <div className="space-y-2">
            {selectedFiles.map(({ file, id }) => (
              <div
                key={id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DocumentTextIcon className="size-5 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
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
                  onClick={() => removeFile(id)}
                  disabled={isMerging}
                  className="shrink-0 rounded-xl"
                >
                  <XMarkIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-10">
        <Button
          onClick={handleMerge}
          disabled={selectedFiles.length < 2 || isMerging}
          className="flex items-center gap-2 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90"
          size="lg"
        >
          {isMerging ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Merging...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="size-4" />
              Merge PDFs
            </>
          )}
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setSelectedFiles([])}
            disabled={isMerging}
            className="rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
          How to merge PDFs:
        </h3>
        <ol className="text-sm text-purple-800 dark:text-purple-400 list-decimal list-inside space-y-1">
          <li>Select or drag and drop at least 2 PDF files</li>
          <li>Review the selected files in the list</li>
          <li>Click &quot;Merge PDFs&quot; to combine them</li>
          <li>The merged PDF will be downloaded automatically</li>
        </ol>
      </div>
    </DashboardLayout>
  );
}
