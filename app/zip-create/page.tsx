"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";

interface SelectedFile {
  file: File;
  id: string;
}

export default function ZipCreatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const newFiles: SelectedFile[] = files.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleZip = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/zip-create")}`);
      return;
    }

    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setIsZipping(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/zip-create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(
          (errorData as { error?: string }).error || "Failed to create ZIP"
        );
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "archive.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSelectedFiles([]);
    } catch {
      setError("Something went wrong while creating the ZIP. Please try again.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <CubeIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Zip Create
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Select one or more files and package them into a single ZIP archive.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div
        className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-900/40"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Drag and drop files here, or
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          disabled={isZipping}
          className="rounded-xl"
        >
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isZipping}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Selected Files ({selectedFiles.length})
          </h2>
          <div className="space-y-2">
            {selectedFiles.map(({ file, id }) => (
              <div
                key={id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <DocumentTextIcon className="size-5 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
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
                  onClick={() => removeFile(id)}
                  disabled={isZipping}
                  className="shrink-0 rounded-xl"
                >
                  <XMarkIcon className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-10">
        <Button
          onClick={handleZip}
          disabled={selectedFiles.length === 0 || isZipping}
          className="gap-2"
        >
          {isZipping ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4" />
              Create ZIP
            </>
          )}
        </Button>
        {selectedFiles.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setSelectedFiles([])}
            disabled={isZipping}
            className="rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}

