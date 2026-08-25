"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { countryCodeToFlag } from "@/lib/dna-test/country-flag";
import type { DnaOrigin } from "@/lib/dna-test/normalize-origins";
import {
  ArrowUpTrayIcon,
  CameraIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function DnaTestForm() {
  const router = useRouter();
  const { assertAccess } = useSubscribedToolAccess("/dna-test");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [origins, setOrigins] = useState<DnaOrigin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const setImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setSelectedImage(file);
    setOrigins(null);
    setError(null);
    stopCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setImageFile(file);
  };

  const openWebcam = async () => {
    setCameraError(null);
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      // Fall back to capture file input (mobile-friendly).
      cameraInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError(
        "Could not access the camera. You can upload a selfie instead.",
      );
      cameraInputRef.current?.click();
    }
  };

  const captureFromWebcam = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError("Camera is not ready yet. Please wait a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture photo.");
          return;
        }
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setImageFile(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  const clearImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setSelectedImage(null);
    setOrigins(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!assertAccess()) return;

    if (!selectedImage) {
      setError("Please upload a selfie or take a photo first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setOrigins(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const res = await fetch("/api/dna-test", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        origins?: DnaOrigin[];
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (
          data.code === "subscription_required" ||
          data.error === "Active subscription required"
        ) {
          router.push("/pricing");
          return;
        }
        throw new Error(data.error || "Failed to analyze selfie");
      }

      if (!data.origins?.length) {
        throw new Error("No ancestry results returned.");
      }

      setOrigins(data.origins);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-muted-foreground/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Selfie preview"
                width={320}
                height={320}
                unoptimized
                className="max-h-64 rounded-xl object-contain border border-border"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 rounded-full bg-background border border-border p-1 shadow-sm hover:bg-muted"
                aria-label="Remove photo"
              >
                <XMarkIcon className="size-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedImage?.name ?? "selfie.jpg"}
            </p>
          </div>
        ) : cameraOpen ? (
          <div className="flex flex-col items-center gap-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-h-64 w-full max-w-sm rounded-xl border border-border object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={captureFromWebcam} className="gap-2">
                <CameraIcon className="size-4" />
                Capture photo
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ArrowUpTrayIcon className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              Drag and drop a selfie, or choose an option below
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <ArrowUpTrayIcon className="size-4" />
                Upload selfie
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={openWebcam}
              >
                <CameraIcon className="size-4" />
                Take photo
              </Button>
            </div>
          </>
        )}
      </div>

      {cameraError && (
        <p className="text-sm text-amber-600 dark:text-amber-400" role="status">
          {cameraError}
        </p>
      )}

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          role="alert"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleAnalyze}
        disabled={!selectedImage || isAnalyzing}
        className="gap-2"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <SparklesIcon className="h-4 w-4" />
            Analyze ancestry
          </>
        )}
      </Button>

      {origins && origins.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Estimated origins
          </h2>
          <ul className="space-y-3">
            {origins.map((o) => (
              <li
                key={o.countryCode}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3"
              >
                <span
                  className="text-2xl leading-none"
                  role="img"
                  aria-label={`${o.country} flag`}
                >
                  {countryCodeToFlag(o.countryCode)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-foreground truncate">
                      {o.country}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {o.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-dashboard-primary transition-all"
                      style={{ width: `${o.percentage}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Entertainment estimate only — not a real DNA or genetic test. Results
            are speculative guesses from facial appearance.
          </p>
        </div>
      )}
    </div>
  );
}
