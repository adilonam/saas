"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Header from "components/Header";
import Footer from "components/Footer";
import DepositDialog from "components/DepositDialog";
import { Button } from "@/components/ui/button";
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Upload, Loader2 } from "lucide-react";

export default function PDFToWordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

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
    // Check authentication
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-to-word")}`,
      );
      return;
    }

    // Check token balance
    const userTokens = session.user.tokens ?? 0;
    if (userTokens <= 0) {
      setDepositDialogOpen(true);
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
            response.status === 400 &&
            errorData.error === "Insufficient tokens"
          ) {
            setDepositDialogOpen(true);
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

      // Update session to reflect new token balance
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Convert PDF to Word
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a PDF file and convert it to an editable Word document
              (.docx).
            </p>
          </div>
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
            Drag and drop a PDF file here, or
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isConverting}
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
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFile(null)}
              disabled={isConverting}
            >
              Clear
            </Button>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleConvert}
            disabled={!selectedFile || isConverting}
            className="flex items-center gap-2"
            size="lg"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5" />
                Convert to Word
              </>
            )}
          </Button>
          {selectedFile && (
            <Button
              variant="outline"
              onClick={() => setSelectedFile(null)}
              disabled={isConverting}
            >
              Remove File
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How to convert PDF to Word:
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-400 list-decimal list-inside space-y-1">
            <li>Select or drag and drop a PDF file.</li>
            <li>Review the selected file details.</li>
            <li>Click &quot;Convert to Word&quot; to start the conversion.</li>
            <li>Your .docx file will be downloaded automatically.</li>
          </ol>
        </div>
      </main>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={async () => {
          await update();
        }}
      />
      <Footer />
    </div>
  );
}
