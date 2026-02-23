"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface SelectedFile {
  file: File;
  id: string;
}

interface SummaryResult {
  filename: string;
  total_pages: number;
  summary: string;
}

export default function SummarizePDFPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SummaryResult[]>([]);

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
    setResults([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
    setResults([]);
  };

  const handleSummarize = async () => {
    if (status === "unauthenticated" || !session) {
      router.push("/signup?callbackUrl=" + encodeURIComponent("/summarize-pdf"));
      return;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    setIsSummarizing(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/summarize-pdf", {
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
            router.push("/pricing");
            setIsSummarizing(false);
            return;
          }
          setError(errorData.error || "Failed to summarize PDFs");
        } catch {
          setError("Failed to summarize PDFs");
        }
        setIsSummarizing(false);
        return;
      }

      await update();

      const data = (await response.json()) as { summaries: SummaryResult[] };
      setResults(data.summaries || []);
    } catch (err) {
      console.error("Error summarizing PDFs:", err);
      setError("An error occurred while summarizing. Please try again.");
    } finally {
      setIsSummarizing(false);
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
    setResults([]);
  };

  return (
    <DashboardLayout>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <DocumentMagnifyingGlassIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Summarize PDFs
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload PDF files to extract text and get an AI-generated summary for
          each (1 token per PDF).
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
          disabled={isSummarizing}
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
          disabled={isSummarizing}
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
                  disabled={isSummarizing}
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
          onClick={handleSummarize}
          disabled={selectedFiles.length === 0 || isSummarizing}
          className="flex items-center gap-2 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90"
          size="lg"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <DocumentMagnifyingGlassIcon className="size-4" />
              Summarize PDFs
            </>
          )}
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFiles([]);
              setResults([]);
            }}
            disabled={isSummarizing}
            className="rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-6 mb-12">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Summaries
          </h2>
          {results.map((item, index) => (
            <div
              key={index}
              className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <DocumentTextIcon className="size-5 text-red-600 dark:text-red-400 shrink-0" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                  {item.filename}
                </h3>
                {item.total_pages > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.total_pages} page{item.total_pages !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          How it works
        </h3>
        <ol className="text-sm text-indigo-800 dark:text-indigo-400 list-decimal list-inside space-y-1">
          <li>Select or drag and drop one or more PDF files</li>
          <li>Click &quot;Summarize PDFs&quot; (requires sign-in and 1 token per PDF)</li>
          <li>Text is extracted via our backend, then summarized with AI (Groq)</li>
          <li>Each PDF&apos;s summary is shown in a card below</li>
        </ol>
      </div>
    </DashboardLayout>
  );
}
