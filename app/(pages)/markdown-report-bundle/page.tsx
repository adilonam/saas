"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function MarkdownReportBundlePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [markdownBlocks, setMarkdownBlocks] = useState<string>("# Report 1\n\nContent here.\n\n---\n\n# Report 2\n\nMore content.");
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const segments = useMemo(
    () => markdownBlocks.split(/\n---+\n/g).map((seg) => seg.trim()).filter(Boolean),
    [markdownBlocks]
  );

  const handleBuild = async () => {
    setError(null);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/markdown-report-bundle")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (!segments.length) {
      setError("Please add at least one markdown report.");
      return;
    }

    setIsBuilding(true);
    try {
      const pdfFiles: File[] = [];
      for (let i = 0; i < segments.length; i += 1) {
        const md = segments[i];
        const renderRes = await fetch("/api/markdown-to-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: md }),
        });
        if (!renderRes.ok) {
          const data = (await renderRes.json().catch(() => null)) as { error?: string; detail?: string } | null;
          throw new Error(data?.error || data?.detail || `Failed to render report ${i + 1}`);
        }
        const pdfBlob = await renderRes.blob();
        pdfFiles.push(new File([pdfBlob], `report-${i + 1}.pdf`, { type: "application/pdf" }));
      }

      const zipFormData = new FormData();
      pdfFiles.forEach((f) => zipFormData.append("files", f));
      const zipRes = await fetch("/api/zip-create", { method: "POST", body: zipFormData });
      if (!zipRes.ok) {
        const data = (await zipRes.json().catch(() => null)) as { error?: string; detail?: string } | null;
        throw new Error(data?.error || data?.detail || "Failed to bundle report ZIP");
      }

      const zipBlob = await zipRes.blob();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "markdown-report-bundle.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while bundling reports.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Markdown Report Packager</h1>
          <p className="mt-1 text-muted-foreground">
            Split reports with `---`, convert each Markdown block to PDF, and download one ZIP bundle.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <textarea
            className="w-full min-h-[260px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
            value={markdownBlocks}
            onChange={(e) => setMarkdownBlocks(e.target.value)}
            disabled={isBuilding}
          />
          <p className="text-xs text-muted-foreground">Detected reports: {segments.length}</p>
          <Button onClick={handleBuild} disabled={!segments.length || isBuilding} className="gap-2">
            {isBuilding ? <><Loader2 className="h-4 w-4 animate-spin" />Packaging...</> : <><DocumentArrowDownIcon className="h-4 w-4" />Build Bundle ZIP</>}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
