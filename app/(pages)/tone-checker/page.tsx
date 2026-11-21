"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

export default function ToneCheckerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [channel, setChannel] = useState<"email" | "slack">("email");
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hints = useMemo(() => {
    const t = text.trim();
    if (!t) return null;
    const sentences = t.split(/[.!?]+/).filter(Boolean).length;
    const words = t.split(/\s+/).length;
    const caps = (t.match(/[A-Z]/g) ?? []).length;
    const ratio = t.length ? caps / t.length : 0;
    const exclaim = (t.match(/!/g) ?? []).length;
    return {
      words,
      sentences,
      shouty: ratio > 0.18,
      exclaim,
    };
  }, [text]);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/tone-checker")}`);
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

  const handleHeuristics = () => {
    if (!gate()) return;
    setUnlocked(true);
    setAiResult(null);
    setError(null);
  };

  const handleAi = async () => {
    if (!gate()) return;
    setUnlocked(true);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Paste a message first.");
      return;
    }
    setLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/tone-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed.");
        return;
      }
      setAiResult(typeof data.text === "string" ? data.text : "");
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tone checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Quick signals plus AI coaching for email or Slack
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ch"
                  checked={channel === "email"}
                  onChange={() => setChannel("email")}
                />
                Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ch"
                  checked={channel === "slack"}
                  onChange={() => setChannel("slack")}
                />
                Slack
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tc-text">Message</Label>
            <textarea
              id="tc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste draft…"
              spellCheck
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleHeuristics}>
              Show quick signals
            </Button>
            <Button type="button" onClick={handleAi} disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Analyze with AI
            </Button>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}

          {unlocked && hints && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4 text-sm space-y-1">
              <p className="font-medium text-slate-800 dark:text-slate-100">Quick signals</p>
              <p className="text-slate-600 dark:text-slate-300">
                ~{hints.words} words · ~{hints.sentences} sentence blocks
              </p>
              {hints.shouty && (
                <p className="text-amber-700 dark:text-amber-300">Many capitals — could read as loud or urgent.</p>
              )}
              {hints.exclaim > 2 && (
                <p className="text-amber-700 dark:text-amber-300">Several exclamation marks — check if that matches your intent.</p>
              )}
              {!hints.shouty && hints.exclaim <= 2 && (
                <p className="text-slate-500">No strong heuristic flags. AI can still find nuance.</p>
              )}
            </div>
          )}

          {aiResult != null && aiResult !== "" && (
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-900/15 p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-100 font-sans">
                {aiResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
