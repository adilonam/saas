"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

function heuristics(text: string) {
  const len = text.length;
  const hasQ = text.includes("?");
  const hasNum = /\d/.test(text);
  const flags: string[] = [];
  if (len > 60) flags.push("Long for mobile (~50–60 chars often tests better).");
  if (len < 20) flags.push("Very short — ensure intent is clear.");
  if (!hasQ && len < 35) flags.push("Try a curiosity question variant for a B test.");
  if (hasNum) flags.push("Numbers can lift opens — keep them accurate.");
  return flags;
}

export default function SubjectLineAbLabPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [topic, setTopic] = useState("");
  const [aiOut, setAiOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/subject-line-ab-lab")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setUnlocked(true);
  };

  const tipsA = useMemo(() => heuristics(a), [a]);
  const tipsB = useMemo(() => heuristics(b), [b]);

  const handleAi = async () => {
    if (!unlocked) return;
    const parts: string[] = [];
    if (topic.trim()) parts.push(`Campaign / topic:\n${topic.trim()}`);
    if (a.trim() || b.trim()) {
      parts.push(`Candidate A: ${a.trim() || "(empty)"}\nCandidate B: ${b.trim() || "(empty)"}`);
    }
    if (parts.length === 0) {
      setError("Enter a topic or at least one subject line.");
      return;
    }
    setLoading(true);
    setError(null);
    setAiOut("");
    try {
      const res = await fetch("/api/subject-line-ab-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: parts.join("\n\n") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not generate ideas.");
        return;
      }
      setAiOut(data.text || "");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600">
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject line A/B idea lab</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Side-by-side checks plus optional AI pairs and critique.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {!unlocked ? (
            <Button onClick={handleOpen} className="gap-2">
              <SparklesIcon className="h-4 w-4" />
              Open lab
            </Button>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="la">Variant A</Label>
                  <Input
                    id="la"
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    placeholder="Subject A"
                    className="rounded-xl h-11"
                  />
                  <p className="text-xs text-slate-500">{a.length} characters</p>
                  {tipsA.length > 0 && (
                    <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc pl-4 space-y-1">
                      {tipsA.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lb">Variant B</Label>
                  <Input
                    id="lb"
                    value={b}
                    onChange={(e) => setB(e.target.value)}
                    placeholder="Subject B"
                    className="rounded-xl h-11"
                  />
                  <p className="text-xs text-slate-500">{b.length} characters</p>
                  {tipsB.length > 0 && (
                    <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc pl-4 space-y-1">
                      {tipsB.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label htmlFor="topic">Optional AI: campaign context</Label>
                <textarea
                  id="topic"
                  className="w-full min-h-[90px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. Re-engagement for churned trial users of a budgeting app."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                />
                <Button type="button" onClick={handleAi} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working…
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      AI: ideas & critique
                    </>
                  )}
                </Button>
                {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
                {aiOut && (
                  <pre className="whitespace-pre-wrap text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 p-4 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600">
                    {aiOut}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
