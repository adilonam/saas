"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  PhotoIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function PDFToWordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else if (file) {
      setError("Please select a valid PDF file.");
      setSelectedFile(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0] || null;

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError(null);
    } else if (file) {
      setError("Please drop a valid PDF file.");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleConvert = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-to-word")}`,
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

    if (!selectedFile) {
      setError("Please select a PDF file to convert.");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/pdf-to-docx", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (
            (response.status === 403 || response.status === 400) &&
            (errorData.error === "Active subscription required" ||
              errorData.error === "Insufficient tokens")
          ) {
            router.push("/pricing");
            setIsConverting(false);
            return;
          }
          setError(
            errorData.error ||
              errorData.detail ||
              "Failed to convert PDF to Word.",
          );
        } catch {
          setError("Failed to convert PDF to Word.");
        }
        setIsConverting(false);
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        (selectedFile.name.replace(/\.pdf$/i, "") || "document") + ".docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error converting PDF to Word:", err);
      setError("An error occurred while converting. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
            <PhotoIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Convert PDF to Word
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload a PDF file and convert it to an editable Word document (.docx).
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
          Drag and drop a PDF file here, or
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          disabled={isConverting}
          className="rounded-xl"
        >
          Select PDF File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isConverting}
        />
      </div>

      {selectedFile && (
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DocumentTextIcon className="size-6 text-red-600 dark:text-red-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFile(null)}
            disabled={isConverting}
            className="rounded-xl shrink-0"
          >
            Clear
          </Button>
        </div>
      )}

      <div className="flex gap-4 mb-10">
        <Button
          onClick={handleConvert}
          disabled={!selectedFile || isConverting}
          className="flex items-center gap-2 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90"
          size="lg"
        >
          {isConverting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="size-4" />
              Convert to Word
            </>
          )}
        </Button>
        {selectedFile && (
          <Button
            variant="outline"
            onClick={() => setSelectedFile(null)}
            disabled={isConverting}
            className="rounded-xl"
          >
            Remove File
          </Button>
        )}
      </div>

      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-300 mb-2">
          How to convert PDF to Word:
        </h3>
        <ol className="text-sm text-rose-800 dark:text-rose-400 list-decimal list-inside space-y-1">
          <li>Select or drag and drop a PDF file.</li>
          <li>Review the selected file details.</li>
          <li>Click &quot;Convert to Word&quot; to start the conversion.</li>
          <li>Your .docx file will be downloaded automatically.</li>
        </ol>
      </div>
    </DashboardLayout>
  );
}
