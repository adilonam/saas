"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function BulkZipBuilderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuild = async () => {
    setError(null);

    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/bulk-zip-builder")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (!files.length) {
      setError("Please choose at least one file.");
      return;
    }

    setIsBuilding(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetch("/api/zip-create", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
        setError(data?.error || data?.detail || "Failed to create ZIP");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bulk-archive.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Batch File Archive Builder</h1>
          <p className="mt-1 text-muted-foreground">Select many files and download one ZIP package.</p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <div className="flex items-center gap-4">
            <Button variant="outline" type="button" onClick={() => inputRef.current?.click()} disabled={isBuilding} className="gap-2">
              <ArrowUpTrayIcon className="h-4 w-4" />
              Choose Files
            </Button>
            <span className="text-sm text-muted-foreground">{files.length} file(s) selected</span>
          </div>
          <Button onClick={handleBuild} disabled={!files.length || isBuilding} className="gap-2">
            {isBuilding ? <><Loader2 className="h-4 w-4 animate-spin" />Building...</> : <><ArrowDownTrayIcon className="h-4 w-4" />Build ZIP</>}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
