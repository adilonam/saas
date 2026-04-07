"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function PdfToTextPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const handleExtract = async () => {
    setError(null);
    setText("");
    setTotalPages(null);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-to-text")}`);
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
      setError("Please select a PDF file.");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/pdf-to-text", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; detail?: string; text?: string; total_pages?: number }
        | null;

      if (!res.ok) {
        setError(data?.error || data?.detail || "Failed to extract text from PDF");
        return;
      }

      setText(data?.text || "");
      setTotalPages(typeof data?.total_pages === "number" ? data.total_pages : null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pdf-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">PDF to Text (OCR Extractor)</h1>
          <p className="mt-1 text-muted-foreground">Extract full OCR text from a PDF document.</p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose PDF
            </Button>
            <span className="text-sm text-muted-foreground truncate">{file?.name || "No file selected"}</span>
          </div>
          <Button onClick={handleExtract} disabled={!file || isProcessing} className="gap-2">
            {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" />Extracting...</> : <><DocumentTextIcon className="h-4 w-4" />Extract Text</>}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {totalPages !== null && <p className="text-sm text-muted-foreground">Detected pages: {totalPages}</p>}
        </div>

        {text && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Extracted text</h2>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download .txt
              </Button>
            </div>
            <textarea
              className="w-full min-h-[320px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={text}
              readOnly
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
