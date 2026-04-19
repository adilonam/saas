"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { extractActionItemsHeuristic } from "@/lib/study-meeting-utils";
import { Loader2 } from "lucide-react";

export default function ActionItemsExtractorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState(
    "Standup\n- [ ] Send deck to Alex\nTODO: book room for Q2\n* Action: review budget by Friday",
  );
  const [useAi, setUseAi] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/action-items-extractor")}`);
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

  const handleExtract = async () => {
    if (!gate()) return;
    setError(null);
    setUnlocked(true);

    if (!useAi) {
      setItems(extractActionItemsHeuristic(notes));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/action-items-extractor-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Extraction failed.");
        setItems([]);
        return;
      }
      const json = data.json as { items?: unknown };
      const raw = json?.items;
      const list = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
      setItems(list);
    } catch {
      setError("Request failed.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CheckCircleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Action item extractor</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Heuristics for checkboxes and TODO lines; optional AI for messy notes
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ain-notes">Notes</Label>
            <textarea
              id="ain-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              spellCheck={false}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="rounded border-slate-300"
            />
            Use AI extraction (better for prose)
          </label>
          <Button type="button" onClick={handleExtract} disabled={loading} className="gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Extract
          </Button>
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {unlocked && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">No items found. Try AI or add TODO / checkbox lines.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2 text-slate-800 dark:text-slate-100">
                  {items.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
