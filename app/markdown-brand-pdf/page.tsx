"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function MarkdownBrandPdfPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [brandName, setBrandName] = useState("Eprod");
  const [primaryColor, setPrimaryColor] = useState("#1d4ed8");
  const [markdown, setMarkdown] = useState("# Monthly Report\n\n- KPI 1\n- KPI 2\n");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!guardToolAccess(status, session, pathname, "/markdown-brand-pdf", router)) return;
    if (!markdown.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const brandedMarkdown = `# ${brandName}\n\n> Brand color: ${primaryColor}\n\n${markdown}`;

      const res = await fetch("/api/markdown-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: brandedMarkdown }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to generate branded PDF.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "branded-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Could not generate PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Markdown to Branded PDF</h1>
          <p className="mt-1 text-muted-foreground">
            Add simple brand metadata to markdown and export as a PDF.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand name</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary color</label>
              <input
                type="color"
                className="h-10 w-20 rounded-lg border border-input bg-background p-1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Markdown</label>
            <textarea
              className="w-full min-h-[260px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || !markdown.trim()} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Generate branded PDF
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
