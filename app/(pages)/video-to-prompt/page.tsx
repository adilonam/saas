"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FilmIcon, ArrowUpTrayIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const PROMPT_TYPES = [
  { id: "general", label: "General Video Prompt", description: "Natural language description of the video" },
  { id: "structured", label: "Structured Prompt", description: "Subject, Environment & Visual Style for remixing" },
  { id: "flux", label: "Flux", description: "Optimized for Flux AI models, concise natural language" },
  { id: "midjourney", label: "Midjourney", description: "Tailored for Midjourney with parameters" },
  { id: "stable_diffusion", label: "Stable Diffusion", description: "Formatted for Stable Diffusion models" },
] as const;

const NUM_FRAMES = 6;

function extractFramesFromVideo(videoUrl: string): Promise<Blob[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }

    video.onloadeddata = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Could not read video duration"));
        return;
      }

      const times: number[] = [];
      for (let i = 0; i < NUM_FRAMES; i++) {
        const t = i === NUM_FRAMES - 1 ? Math.max(0, duration - 0.1) : (duration * i) / (NUM_FRAMES - 1);
        times.push(t);
      }

      const blobs: Blob[] = [];
      let index = 0;

      const captureFrame = () => {
        if (index >= times.length) {
          resolve(blobs);
          video.remove();
          canvas.remove();
          return;
        }

        const time = times[index];
        video.currentTime = time;
        video.onseeked = () => {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            canvas.toBlob(
              (blob) => {
                if (blob) blobs.push(blob);
                index++;
                captureFrame();
              },
              "image/jpeg",
              0.85,
            );
          } catch (e) {
            reject(e);
          }
        };
      };

      captureFrame();
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = videoUrl;
    video.load();
  });
}

export default function VideoToPromptPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [promptType, setPromptType] = useState<string>("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasActiveSubscription =
    session?.user?.subscriptionExpiresAt &&
    new Date(session.user.subscriptionExpiresAt) > new Date();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedVideo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedVideo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, [previewUrl]);

  const handleGenerate = async () => {
    if (status === "unauthenticated" || !session) {
      router.push("/signup?callbackUrl=" + encodeURIComponent("/video-to-prompt"));
      return;
    }

    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    if (!selectedVideo || !previewUrl) {
      setError("Please select a video first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const frameBlobs = await extractFramesFromVideo(previewUrl);
      if (frameBlobs.length === 0) {
        throw new Error("Could not extract frames from video.");
      }

      const formData = new FormData();
      formData.append("promptType", promptType);
      frameBlobs.forEach((blob, i) => {
        formData.append(`frame_${i}`, blob, `frame_${i}.jpg`);
      });

      const res = await fetch("/api/video-to-prompt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "subscription_required" || data.error === "Active subscription required") {
          router.push("/pricing");
          return;
        }
        throw new Error(data.error || "Failed to generate prompt");
      }

      setResult(data.prompt ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <FilmIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Video to Prompt
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload a video and get a prompt from key frames — for AI image/video generation (Flux, Midjourney, Stable Diffusion).
        </p>
      </div>

      {/* Upload area */}
      <div
        className="mb-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <video
              src={previewUrl}
              controls
              className="max-h-48 rounded-xl border border-slate-200 dark:border-slate-700"
              preload="metadata"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedVideo?.name} — click or drop another to replace
            </p>
          </div>
        ) : (
          <>
            <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Drag and drop a video here, or click to select
            </p>
          </>
        )}
      </div>

      {/* Prompt type grid */}
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        Choose prompt type
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {PROMPT_TYPES.map((type) => {
          const selected = promptType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setPromptType(type.id)}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                selected
                  ? "border-dashboard-primary bg-dashboard-primary/10 dark:bg-dashboard-primary/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 size-6 rounded-full bg-dashboard-primary flex items-center justify-center">
                  <CheckIcon className="size-4 text-white" />
                </div>
              )}
              <h3 className="font-bold text-slate-900 dark:text-white text-sm pr-10">
                {type.label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-4 mb-10">
        <Button
          onClick={handleGenerate}
          disabled={!selectedVideo || isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting frames & generating...
            </>
          ) : (
            <>
              <FilmIcon className="h-4 w-4" />
              Generate prompt
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Generated prompt
          </p>
          <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap wrap-break-word font-sans">
            {result}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl"
            onClick={() => navigator.clipboard.writeText(result)}
          >
            Copy to clipboard
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
