"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  DocumentPlusIcon,
  CodeBracketSquareIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function GeneratePDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState(
    "Generate me a LaTeX report for solving 2nd degree equations.",
  );
  const [latex, setLatex] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLatex = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/generate-pdf")}`,
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

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLatex("");

    try {
      const res = await fetch("/api/generate-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate LaTeX");
        return;
      }

      if (data.latex) {
        setLatex(data.latex);
      } else {
        setError("No LaTeX was generated.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetPdf = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/generate-pdf")}`,
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

    if (!latex.trim()) {
      setError("Generate LaTeX first, or paste LaTeX code.");
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      const res = await fetch("/api/latex-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to compile PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Something went wrong while compiling. Please try again.");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            AI Generate PDF (LaTeX)
          </h1>
          <p className="mt-1 text-muted-foreground">
            Describe what you want, get LaTeX code, then compile to PDF.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="prompt"
            className="text-sm font-medium text-foreground"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="e.g. A short article about solving quadratic equations with the discriminant formula and one example"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <Button
            onClick={handleGenerateLatex}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating LaTeX…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate LaTeX
              </>
            )}
          </Button>
        </div>

        {latex && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <CodeBracketSquareIcon className="h-4 w-4" />
                LaTeX code
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetPdf}
                disabled={isCompiling}
                className="gap-1.5"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compiling…
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Get PDF
                  </>
                )}
              </Button>
            </div>
            <textarea
              className="w-full max-h-[400px] min-h-[200px] overflow-auto rounded-lg border border-input bg-muted/50 p-4 text-xs text-foreground font-mono resize-y"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              spellCheck={false}
              placeholder="LaTeX code will appear here…"
            />
            <p className="text-xs text-muted-foreground">
              Edit the code if needed, then click &quot;Get PDF&quot; to compile.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
