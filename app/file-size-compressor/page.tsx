"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FileSizeCompressorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image (JPEG, PNG, WebP).");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
      setCompressedBlob(null);
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
      setCompressedBlob(null);
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setError(null);
  };

  const handleCompress = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/file-size-compressor")}`,
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
    if (!file || !previewUrl) {
      setError("Please select an image first.");
      return;
    }

    setError(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = maxWidth > 0 && w > maxWidth ? maxWidth / w : 1;
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Could not create canvas.");
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Compression failed.");
            return;
          }
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          setCompressedBlob(blob);
          setCompressedUrl(URL.createObjectURL(blob));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => setError("Failed to load image.");
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(compressedBlob);
    a.download = (file?.name ?? "image").replace(/\.[^.]+$/, "") + "-compressed.jpg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            File Size Compressor
          </h1>
          <p className="mt-1 text-muted-foreground">
            Compress images by resizing and reducing quality. Output is JPEG.
          </p>
        </div>

        <div
          className="rounded-xl border-2 border-dashed border-input bg-muted/30 p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            {previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain border border-input"
                />
                <p className="text-sm text-muted-foreground">
                  {file?.name} — {file ? formatBytes(file.size) : ""}
                </p>
              </div>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Drop an image or click to select</p>
              </>
            )}
          </button>
        </div>

        {file && (
          <div className="space-y-4 rounded-xl border border-input bg-card p-6">
            <div className="space-y-2">
              <Label>Quality (0.1–1)</Label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">{Math.round(quality * 100)}%</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxWidth">Max width (px, 0 = keep original)</Label>
              <input
                id="maxWidth"
                type="number"
                min="0"
                max="4096"
                value={maxWidth}
                onChange={(e) => setMaxWidth(parseInt(e.target.value, 10) || 0)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleCompress} className="gap-2">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Compress
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {compressedBlob && compressedUrl && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Compressed size: {formatBytes(compressedBlob.size)}
            </p>
            <img
              src={compressedUrl}
              alt="Compressed"
              className="max-h-48 rounded-lg border border-input"
            />
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download compressed image
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
