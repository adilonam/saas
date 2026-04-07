"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function PdfRotateCompressPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState("90");
  const [pdfSettings, setPdfSettings] = useState("ebook");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!guardToolAccess(status, session, pathname, "/pdf-rotate-compress", router)) return;
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const rotateFd = new FormData();
      rotateFd.append("file", file);
      rotateFd.append("rotation", rotation);
      const rotateRes = await fetch("/api/rotate-pdf", { method: "POST", body: rotateFd });
      if (!rotateRes.ok) {
        const data = await rotateRes.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to rotate PDF.");
        return;
      }

      const rotatedBlob = await rotateRes.blob();
      const rotatedFile = new File([rotatedBlob], "rotated.pdf", { type: "application/pdf" });

      const compressFd = new FormData();
      compressFd.append("file", rotatedFile);
      compressFd.append("pdf_settings", pdfSettings);
      const compressRes = await fetch("/api/compress-pdf", { method: "POST", body: compressFd });
      if (!compressRes.ok) {
        const data = await compressRes.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to compress rotated PDF.");
        return;
      }

      const finalBlob = await compressRes.blob();
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rotated-compressed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Pipeline failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">PDF Rotate + Compress Pipeline</h1>
          <p className="mt-1 text-muted-foreground">
            Rotate a PDF first, then compress it in one action.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDF
          </Button>
          {file && <p className="text-sm text-muted-foreground">{file.name}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rotation</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={rotation}
                onChange={(e) => setRotation(e.target.value)}
              >
                <option value="90">90 deg</option>
                <option value="180">180 deg</option>
                <option value="-90">-90 deg</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Compression profile</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={pdfSettings}
                onChange={(e) => setPdfSettings(e.target.value)}
              >
                <option value="screen">screen</option>
                <option value="ebook">ebook</option>
                <option value="printer">printer</option>
                <option value="prepress">prepress</option>
                <option value="default">default</option>
              </select>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Rotate and compress
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
