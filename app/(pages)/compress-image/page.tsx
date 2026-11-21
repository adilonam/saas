"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

type OutputFormat = "png" | "jpeg" | "webp";

export default function CompressImagePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [quality, setQuality] = useState<number | "">("");
  const [stripMetadata, setStripMetadata] = useState(true);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl(null);
    setResultSize(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/compress-image")}`,
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

    setIsCompressing(true);
    setError(null);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResultSize(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("output_format", outputFormat);
      if (maxWidth !== "") formData.append("max_width", String(maxWidth));
      if (maxHeight !== "") formData.append("max_height", String(maxHeight));
      if (quality !== "") formData.append("quality", String(quality));
      formData.append("strip_metadata", stripMetadata ? "true" : "false");

      const res = await fetch("/api/compress-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error || "Failed to compress image"
        );
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch {
      setError("Something went wrong while compressing. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    a.download = `compressed.${ext}`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <DocumentArrowDownIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Compress Image
            </h1>
            <p className="mt-1 text-muted-foreground">
              Resize and compress an image using the backend tool, then download the smaller result.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
              disabled={isCompressing}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose Image
            </Button>
            {file ? (
              <span className="text-sm text-muted-foreground truncate max-w-[260px]">
                {file.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No image selected</span>
            )}
          </div>

          {previewUrl && (
            <div className="rounded-lg border border-input bg-white/60 p-3">
              <p className="text-xs text-muted-foreground mb-2">Original preview</p>
              <Image
                src={previewUrl}
                alt="Original"
                width={1200}
                height={800}
                unoptimized
                className="max-h-64 w-full object-contain rounded-md border border-input"
              />
              {file && (
                <p className="text-xs text-muted-foreground mt-2">
                  Original size: {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output format</Label>
              <select
                id="outputFormat"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isCompressing}
              >
                <option value="jpeg">jpeg</option>
                <option value="png">png</option>
                <option value="webp">webp</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stripMetadata">Strip metadata</Label>
              <select
                id="stripMetadata"
                value={stripMetadata ? "true" : "false"}
                onChange={(e) => setStripMetadata(e.target.value === "true")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isCompressing}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWidth">Max width (optional)</Label>
              <input
                id="maxWidth"
                type="number"
                min={1}
                max={8192}
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value === "" ? "" : Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isCompressing}
              />
              <p className="text-xs text-muted-foreground">Leave blank to keep original</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxHeight">Max height (optional)</Label>
              <input
                id="maxHeight"
                type="number"
                min={1}
                max={8192}
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value === "" ? "" : Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isCompressing}
              />
              <p className="text-xs text-muted-foreground">Leave blank to keep original</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Quality (optional)</Label>
              <input
                id="quality"
                type="number"
                min={1}
                max={100}
                value={quality}
                onChange={(e) => setQuality(e.target.value === "" ? "" : Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isCompressing}
              />
              <p className="text-xs text-muted-foreground">Used for jpeg/webp</p>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCompress}
                disabled={!file || isCompressing}
                className="w-full gap-2"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compressing…
                  </>
                ) : (
                  <>
                    <PhotoIcon className="h-4 w-4" />
                    Compress
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {resultUrl && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-foreground">Compressed image ready</p>
                {resultSize != null && (
                  <p className="text-sm text-muted-foreground">
                    Output size: {(resultSize / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
            </div>
            <Image
              src={resultUrl}
              alt="Compressed"
              width={1200}
              height={800}
              unoptimized
              className="max-h-[520px] w-full object-contain rounded-lg border border-input bg-white"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

