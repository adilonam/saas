"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";

type QrFile = File;

export default function SmartQrBatchGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [entries, setEntries] = useState("https://example.com\nhttps://eprod.io");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!ensureAccess()) return;

    const lines = entries
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Please add at least one line.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedFiles: QrFile[] = [];

      for (let i = 0; i < lines.length; i += 1) {
        const text = lines[i];
        const qrRes = await fetch("/api/qr-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, box_size: 8, border: 2 }),
        });

        if (!qrRes.ok) {
          const data = await qrRes.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || `Failed on item ${i + 1}`);
        }

        const qrBlob = await qrRes.blob();
        generatedFiles.push(new File([qrBlob], `qr-${i + 1}.png`, { type: "image/png" }));
      }

      const zipFormData = new FormData();
      generatedFiles.forEach((file) => zipFormData.append("files", file));

      const zipRes = await fetch("/api/zip-create", {
        method: "POST",
        body: zipFormData,
      });

      if (!zipRes.ok) {
        const data = await zipRes.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to create ZIP");
      }

      const zipBlob = await zipRes.blob();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "smart-qr-batch.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Smart QR Batch Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Generate QR images in bulk (one line per value) and download all outputs as ZIP.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Lines to encode</label>
          <textarea
            value={entries}
            onChange={(e) => setEntries(e.target.value)}
            className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="One URL/text per line"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating batch...
            </>
          ) : (
            "Generate and download ZIP"
          )}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </DashboardLayout>
  );
}
