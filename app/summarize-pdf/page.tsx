"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "components/Header";
import Footer from "components/Footer";
import DepositDialog from "components/DepositDialog";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2, FileSearch } from "lucide-react";

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
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
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

    const userTokens = session.user.tokens ?? 0;
    if (userTokens < selectedFiles.length) {
      setDepositDialogOpen(true);
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
            response.status === 400 &&
            errorData.error === "Insufficient tokens"
          ) {
            setDepositDialogOpen(true);
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Summarize PDFs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload PDF files to extract text and get an AI-generated summary for
            each (1 token per PDF).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div
          className="mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop PDF files here, or
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isSummarizing}
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Selected Files ({selectedFiles.length})
            </h2>
            <div className="space-y-2">
              {selectedFiles.map(({ file, id }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(id)}
                    disabled={isSummarizing}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleSummarize}
            disabled={selectedFiles.length === 0 || isSummarizing}
            className="flex items-center gap-2"
            size="lg"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4" />
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
            >
              Clear All
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Summaries
            </h2>
            {results.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {item.filename}
                  </h3>
                  {item.total_pages > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.total_pages} page{item.total_pages !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How it works
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-400 list-decimal list-inside space-y-1">
            <li>Select or drag and drop one or more PDF files</li>
            <li>Click &quot;Summarize PDFs&quot; (requires sign-in and 1 token per PDF)</li>
            <li>Text is extracted via our backend, then summarized with AI (Groq)</li>
            <li>Each PDF&apos;s summary is shown in a card below</li>
          </ol>
        </div>
      </main>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={async () => await update()}
      />
      <Footer />
    </div>
  );
}
