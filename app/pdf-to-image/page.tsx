"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function PDFToImagePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    imageUrls.forEach((u) => URL.revokeObjectURL(u));
    setFile(f);
    setImageUrls([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConvert = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/pdf-to-image")}`,
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
    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    setIsConverting(true);
    setError(null);
    const prevUrls = [...imageUrls];
    setImageUrls([]);
    prevUrls.forEach((u) => URL.revokeObjectURL(u));

    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const urls: string[] = [];
      const scale = 2;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        });
        await renderTask.promise;
        urls.push(canvas.toDataURL("image/png"));
      }

      setImageUrls(urls);
    } catch (err) {
      console.error(err);
      setError("Failed to convert PDF to images. Try a smaller file or another PDF.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAll = () => {
    imageUrls.forEach((dataUrl, i) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = (file?.name ?? "page").replace(/\.pdf$/i, "") + `-page-${i + 1}.png`;
      a.click();
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            PDF → Image Converter
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload a PDF and convert each page to a PNG image.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose PDF
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {file.name}
              </span>
            )}
          </div>

          <Button
            onClick={handleConvert}
            disabled={!file || isConverting}
            className="gap-2"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <DocumentIcon className="h-4 w-4" />
                Convert to images
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {imageUrls.length > 0 && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {imageUrls.length} page{imageUrls.length !== 1 ? "s" : ""}
              </p>
              <Button variant="outline" size="sm" onClick={downloadAll} className="gap-1.5">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download all
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="rounded-lg border border-input overflow-hidden bg-white">
                  <Image
                    src={url}
                    alt={`Page ${i + 1}`}
                    width={1200}
                    height={1600}
                    unoptimized
                    className="w-full h-auto block"
                  />
                  <div className="p-2 flex justify-between items-center border-t border-input">
                    <span className="text-xs text-muted-foreground">Page {i + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = (file?.name ?? "page").replace(/\.pdf$/i, "") + `-page-${i + 1}.png`;
                        a.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
