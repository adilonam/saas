"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ArrowDownTrayIcon, QrCodeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function QrGeneratePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [text, setText] = useState("https://example.com");
  const [boxSize, setBoxSize] = useState(8);
  const [border, setBorder] = useState(2);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleGenerate = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/qr-generate")}`,
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

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter text to encode.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResultSize(null);

    try {
      const res = await fetch("/api/qr-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, box_size: boxSize, border }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to generate QR");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch {
      setError("Something went wrong while generating. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <QrCodeIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Text QR Generator</h1>
            <p className="mt-1 text-muted-foreground">
              Generate a QR code from arbitrary text and download it as a PNG.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="qrText">
              Text
            </label>
            <textarea
              id="qrText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              disabled={isGenerating}
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="boxSize">
                Box size (1-40)
              </label>
              <input
                id="boxSize"
                type="number"
                min={1}
                max={40}
                value={boxSize}
                onChange={(e) => setBoxSize(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="border">
                Border (0-20)
              </label>
              <input
                id="border"
                type="number"
                min={0}
                max={20}
                value={border}
                onChange={(e) => setBorder(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isGenerating}
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4" />
                Generate QR
              </>
            )}
          </Button>
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
                <p className="text-sm font-medium text-foreground">QR ready</p>
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
            <img
              src={resultUrl}
              alt="QR code"
              className="max-w-[320px] w-full mx-auto rounded-lg border border-input bg-white"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

