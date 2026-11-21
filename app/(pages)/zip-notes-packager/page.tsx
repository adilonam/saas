"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ZipNotesPackagerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [titlePrefix, setTitlePrefix] = useState("note");
  const [notesRaw, setNotesRaw] = useState("First note\n---\nSecond note");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAccess = (): boolean => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/zip-notes-packager")}`);
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!ensureAccess()) return;

    const noteChunks = notesRaw
      .split("\n---\n")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!noteChunks.length) {
      setError("Please write at least one note. Use `---` on its own line to split notes.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      noteChunks.forEach((note, idx) => {
        const file = new File([note], `${titlePrefix || "note"}-${idx + 1}.txt`, {
          type: "text/plain",
        });
        formData.append("files", file);
      });

      const res = await fetch("/api/zip-create", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
        throw new Error(data?.error || data?.detail || "Failed to create ZIP file.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notes-pack.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">ZIP Notes Packager</h1>
          <p className="text-muted-foreground mt-1">
            Split your notes into text files and bundle them as one ZIP archive.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">File name prefix</label>
            <Input value={titlePrefix} onChange={(e) => setTitlePrefix(e.target.value)} disabled={isLoading} />
          </div>
          <div>
            <label className="text-sm font-medium">Notes (separate notes with `---`)</label>
            <textarea
              value={notesRaw}
              onChange={(e) => setNotesRaw(e.target.value)}
              className="mt-2 min-h-52 w-full rounded-md border border-input bg-background p-3 text-sm"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating ZIP...
              </>
            ) : (
              "Create ZIP Package"
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
