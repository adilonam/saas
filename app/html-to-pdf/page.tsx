"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function HtmlToPdfPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [html, setHtml] = useState("<h1>Hello!</h1><p>Write HTML here…</p>");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRender = async () => {
    setError(null);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/html-to-pdf")}`);
      return;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    const trimmed = html.trim();
    if (!trimmed) {
      setError("Please enter some HTML.");
      return;
    }

    setIsRendering(true);
    try {
      const res = await fetch("/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string; detail?: string }
          | null;
        setError(data?.error || data?.detail || "Failed to render HTML PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "html.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">HTML to PDF</h1>
          <p className="mt-1 text-muted-foreground">
            Paste HTML and download a rendered PDF.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <label htmlFor="html" className="text-sm font-medium text-foreground">
            HTML input
          </label>
          <textarea
            id="html"
            className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
            placeholder="Enter HTML..."
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            disabled={isRendering}
            spellCheck={false}
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleRender} disabled={isRendering} className="gap-2">
              {isRendering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Rendering…
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Render PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setHtml("")}
              disabled={isRendering}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border border-input rounded-xl">
          <p className="text-sm text-muted-foreground">
            Uses our FastAPI renderer (`/fast-api/v1/html-to-pdf`).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

