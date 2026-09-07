"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowUpTrayIcon,
  CameraIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

type DnaTestFormProps = {
  onSubmit: (file: File) => void | Promise<void>;
  submitting?: boolean;
  error?: string | null;
};

export default function DnaTestForm({
  onSubmit,
  submitting = false,
  error = null,
}: DnaTestFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

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
      setLocalError("Please choose a valid image file.");
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setSelectedImage(file);
    setLocalError(null);
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
    setLocalError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
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
      setLocalError("Camera is not ready yet. Please wait a moment.");
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
          setLocalError("Failed to capture photo.");
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
    setLocalError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setLocalError("Please upload a selfie or take a photo first.");
      return;
    }
    setLocalError(null);
    await onSubmit(selectedImage);
  };

  const displayError = localError || error;

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

      {displayError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          role="alert"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleAnalyze}
        disabled={!selectedImage || submitting}
        className="gap-2"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing…
          </>
        ) : (
          <>
            <SparklesIcon className="h-4 w-4" />
            Analyze ancestry
          </>
        )}
      </Button>
    </div>
  );
}
