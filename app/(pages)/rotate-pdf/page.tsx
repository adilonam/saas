"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const ROTATION_OPTIONS = [90, 180, -90, -180];

export default function RotatePDFPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<number>(90);
  const [pages, setPages] = useState<string>("");

  const [isRotating, setIsRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }
    setFile(selected);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setPages("");
    setRotation(90);
  };

  const handleRotate = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/rotate-pdf")}`
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

    if (rotation % 90 !== 0) {
      setError("Rotation must be a multiple of 90 degrees.");
      return;
    }

    const trimmedPages = pages.trim();
    if (trimmedPages) {
      const valid = /^\d+(,\s*\d+)*$/.test(trimmedPages);
      if (!valid) {
        setError("Pages must be like `1,3,5` (comma-separated page numbers).");
        return;
      }
    }

    setIsRotating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rotation", String(rotation));
      if (trimmedPages) formData.append("pages", trimmedPages);

      const response = await fetch("/api/rotate-pdf", {
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
        setError(errorData?.error || errorData?.detail || "Failed to rotate PDF");
        return;
      }

      await update();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, "") || "document";

      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_rotated.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      clearFile();
    } catch (err) {
      console.error("rotate-pdf error:", err);
      setError("An error occurred while rotating. Please try again.");
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600">
              <ArrowsRightLeftIcon className="size-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Rotate PDF
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Rotate a PDF (whole document or specific pages).
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
            if (dropped.type !== "application/pdf") {
              setFile(null);
              setError("Only PDF files are allowed.");
              return;
            }
            setFile(dropped);
            setError(null);
          }}
        >
          <ArrowUpTrayIcon className="size-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Drag and drop a PDF here, or
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isRotating}
            className="rounded-xl"
          >
            Select PDF
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isRotating}
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ArrowsRightLeftIcon className="size-6 text-sky-600 dark:text-sky-400 shrink-0" />
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
                disabled={isRotating}
                className="rounded-xl"
                aria-label="Remove file"
              >
                <XMarkIcon className="size-4" />
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Rotation
                </label>
                <select
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  disabled={isRotating}
                >
                  {ROTATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} degrees
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  Pages (optional)
                </label>
                <input
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="1,3,5"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                  disabled={isRotating}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Empty = all pages.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-10">
          <Button
            onClick={handleRotate}
            disabled={!file || isRotating}
            className="gap-2"
          >
            {isRotating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rotating…
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4" />
                Rotate PDF
              </>
            )}
          </Button>
          {file && (
            <Button
              variant="outline"
              onClick={clearFile}
              disabled={isRotating}
              className="rounded-xl"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="p-6 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-200 mb-2">
            Notes:
          </h3>
          <ul className="text-sm text-sky-800 dark:text-sky-200 list-disc list-inside space-y-1">
            <li>Rotation must be a multiple of 90 degrees.</li>
            <li>Pages are comma-separated, 1-based.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

