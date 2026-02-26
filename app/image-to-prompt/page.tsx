"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PhotoIcon, ArrowUpTrayIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const PROMPT_TYPES = [
  { id: "general", label: "General Image Prompt", description: "Natural language description of the image" },
  { id: "structured", label: "Structured Prompt", description: "Splits into Subject, Environment & Visual Style for remixing" },
  { id: "graphic_design", label: "Graphic Design", description: "Replicates professional design aesthetics, including typography, layout, and subject details" },
  { id: "json", label: "JSON", description: "Translates visuals into machine-native JSON code" },
  { id: "flux", label: "Flux", description: "Optimized for state-of-the-art Flux AI models, concise natural language" },
  { id: "midjourney", label: "Midjourney", description: "Tailored for Midjourney generation with Midjourney parameters" },
  { id: "stable_diffusion", label: "Stable Diffusion", description: "Formatted for Stable Diffusion models" },
] as const;

export default function ImageToPromptPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [promptType, setPromptType] = useState<string>("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasActiveSubscription =
    session?.user?.subscriptionExpiresAt &&
    new Date(session.user.subscriptionExpiresAt) > new Date();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (status === "unauthenticated" || !session) {
      router.push("/signup?callbackUrl=" + encodeURIComponent("/image-to-prompt"));
      return;
    }

    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("promptType", promptType);

      const res = await fetch("/api/image-to-prompt", {
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
            <PhotoIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Image to Prompt
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Upload an image and get a prompt in the format you need for AI image generation.
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
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 rounded-xl object-contain border border-slate-200 dark:border-slate-700"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedImage?.name} — click or drop another to replace
            </p>
          </div>
        ) : (
          <>
            <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Drag and drop an image here, or click to select
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

      <Button
        onClick={handleGenerate}
        disabled={!selectedImage || isGenerating}
        className="flex items-center gap-2 rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 mb-10"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <PhotoIcon className="size-4" />
            Generate prompt
          </>
        )}
      </Button>

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
