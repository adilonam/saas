"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpTrayIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

type PdfTextWorkbenchProps = {
  pagePath: string;
  title: string;
  description: string;
  actionLabel: string;
  task: "translate" | "keywords" | "qa" | "outline" | "action_items";
  extraPromptLabel?: string;
  extraPromptPlaceholder?: string;
};

export default function PdfTextWorkbench({
  pagePath,
  title,
  description,
  actionLabel,
  task,
  extraPromptLabel,
  extraPromptPlaceholder,
}: PdfTextWorkbenchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    const canProceed = guardToolAccess(
      status,
      session,
      pathname,
      pagePath,
      router,
    );
    if (!canProceed) return;

    if (!file) {
      setError("Please upload a PDF file.");
      return;
    }
    if (extraPromptLabel && !prompt.trim()) {
      setError("Please enter your question.");
      return;
    }

    setIsWorking(true);
    setError(null);
    setResult("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const extractRes = await fetch("/api/pdf-to-text", { method: "POST", body: fd });
      const extractData = await extractRes.json();
      if (!extractRes.ok) {
        setError(extractData.error || "Failed to extract PDF text.");
        return;
      }

      const text = String(extractData.text || "").trim();
      if (!text) {
        setError("No text could be extracted from this PDF.");
        return;
      }

      setSourceText(text);

      if (task === "translate") {
        const aiRes = await fetch("/api/pdf-ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: "translate",
            text,
          }),
        });
        const aiData = await aiRes.json();
        if (!aiRes.ok) {
          setError(aiData.error || "Translation failed.");
          return;
        }
        setResult(String(aiData.text || ""));
        return;
      }

      if (task === "keywords" || task === "qa" || task === "outline" || task === "action_items") {
        const aiRes = await fetch("/api/pdf-ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task,
            text,
            prompt: prompt.trim(),
          }),
        });
        const aiData = await aiRes.json();
        if (!aiRes.ok) {
          setError(aiData.error || "AI processing failed.");
          return;
        }
        setResult(String(aiData.text || ""));
      }
    } catch (e) {
      console.error("PdfTextWorkbench error:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            disabled={isWorking}
          />

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isWorking}
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDF
          </Button>

          {file && (
            <p className="text-sm text-muted-foreground">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          {extraPromptLabel && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{extraPromptLabel}</label>
              <textarea
                className="w-full min-h-[90px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder={extraPromptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isWorking}
              />
            </div>
          )}

          <Button onClick={handleRun} disabled={isWorking || !file} className="gap-2">
            {isWorking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                {actionLabel}
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-foreground">Result</h2>
            <div className="rounded-xl border border-input bg-muted/40 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}

        {sourceText && (
          <details className="rounded-xl border border-input bg-card p-4">
            <summary className="cursor-pointer text-sm font-medium">Extracted OCR text</summary>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {sourceText}
            </pre>
          </details>
        )}
      </div>
    </DashboardLayout>
  );
}
