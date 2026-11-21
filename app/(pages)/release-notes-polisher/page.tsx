"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function ReleaseNotesPolisherPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [draft, setDraft] = useState("");
  const [tone, setTone] = useState("professional and friendly");
  const [polished, setPolished] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/release-notes-polisher")}`);
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

  const handlePolish = async () => {
    if (!ensureAuth()) return;
    const t = draft.trim();
    if (!t) {
      setError("Paste release notes first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/release-notes-polisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setPolished(String(data.text || ""));
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Release notes polisher</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Optional AI pass for tone and clarity — facts stay yours.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Desired tone</label>
            <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. concise, enterprise, playful" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Draft release notes</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste bullets or paragraphs…"
            />
          </div>
          <Button type="button" onClick={handlePolish} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
            Polish with AI
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {polished && (
            <div>
              <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(polished)}>
                  Copy
                </Button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {polished}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
