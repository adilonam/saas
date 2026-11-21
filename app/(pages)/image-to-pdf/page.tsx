"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const DEFAULT_QUALITY = 85;

export default function ImageToPDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const [quality, setQuality] = useState<number>(DEFAULT_QUALITY);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setFile(null);
      setError("Please select a valid image file.");
      return;
    }

    setFile(selected);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setQuality(DEFAULT_QUALITY);
    setStripMetadata(true);
  };

  const handleConvert = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/image-to-pdf")}`
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
      setError("Please select an image first.");
      return;
    }

    if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
      setError("Quality must be an integer between 1 and 100.");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", String(quality));
      formData.append("strip_metadata", stripMetadata ? "true" : "false");

      const response = await fetch("/api/image-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (
          (response.status === 400 || response.status === 403) &&
          errorData?.error &&
          (errorData.error === "Insufficient tokens" ||
            errorData.error === "Active subscription required")
        ) {
          router.push("/pricing");
          return;
        }
        setError(errorData?.error || errorData?.detail || "Failed to convert image to PDF");
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.(png|jpe?g|webp|gif|bmp|tif?f)$/i, "") || "image";

      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFile();
    } catch (err) {
      console.error("image-to-pdf error:", err);
      setError("An error occurred while converting. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
              <PhotoIcon className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Image to PDF
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Convert an image (PNG/JPG/WebP/etc.) into a single-page PDF.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div
          className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/40"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropped = e.dataTransfer.files?.[0] ?? null;
            if (!dropped) return;
            if (!dropped.type.startsWith("image/")) {
              setFile(null);
              setError("Only image files are allowed.");
              return;
            }
            setFile(dropped);
            setError(null);
          }}
        >
          <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Drag and drop an image here, or
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isConverting}
            className="rounded-xl"
          >
            Select image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isConverting}
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PhotoIcon className="size-6 text-violet-600 dark:text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isConverting}
                className="rounded-xl"
                aria-label="Remove file"
              >
                <XMarkIcon className="size-4" />
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Quality (1-100)
                </label>
                <input
                  type="number"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  disabled={isConverting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Strip metadata
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    disabled={isConverting}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Best-effort removes EXIF/text metadata.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-10">
          <Button onClick={handleConvert} disabled={!file || isConverting} className="gap-2">
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4" />
                Convert to PDF
              </>
            )}
          </Button>
          {file && (
            <Button
              variant="outline"
              onClick={clearFile}
              disabled={isConverting}
              className="rounded-xl"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="p-6 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-2">
            Tips:
          </h3>
          <ul className="text-sm text-violet-800 dark:text-violet-200 list-disc list-inside space-y-1">
            <li>Quality affects JPEG/WebP embedded compression.</li>
            <li>Output is a single-page PDF created from your image.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

