"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const TEMPLATES: { label: string; body: string }[] = [
  {
    label: "Specific compliment",
    body: "I’ve been following how {{company}} ships {{concrete thing}} — especially {{detail}}. Quick idea that might shave a cycle off {{process}}.",
  },
  {
    label: "Peer pattern",
    body: "Teams like {{similar company}} recently moved {{X}} in-house and saw {{metric}} lift. Worth a 12-minute compare notes?",
  },
  {
    label: "Question-led",
    body: "Are you still the right person for {{topic}} at {{company}}? If not, who owns it today?",
  },
  {
    label: "Ultra-short",
    body: "{{first name}} — built a one-page teardown of {{area}} for {{company}}. Want me to send it?",
  },
  {
    label: "Trigger event",
    body: "Congrats on {{event}}. We help {{role}} with {{pain}} right after similar milestones — open to a short thread?",
  },
  {
    label: "Permission + value",
    body: "Mind if I share how we cut {{metric}} for a {{industry}} team your size? No deck — just a Loom link if it resonates.",
  },
];

export default function ColdEmailOpenerLibraryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unlocked, setUnlocked] = useState(false);
  const [context, setContext] = useState("");
  const [aiOut, setAiOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/cold-email-opener-library")}`,
      );
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

  const handleOpen = () => {
    if (!gate()) return;
    setUnlocked(true);
  };

  const handleAi = async () => {
    if (!unlocked) return;
    const c = context.trim();
    if (!c) {
      setError("Describe your offer, audience, and tone.");
      return;
    }
    setLoading(true);
    setError(null);
    setAiOut("");
    try {
      const res = await fetch("/api/cold-email-openers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: c }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not generate openers.");
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
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cold email opener library</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Replace placeholders like {"{{company}}"} — then use AI for fresh angles.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {!unlocked ? (
            <Button onClick={handleOpen} className="gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
              Open library
            </Button>
          ) : (
            <>
              <div className="space-y-4">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.label}
                    className="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-800/30 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
                      {t.label}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <Label htmlFor="ctx">Optional AI: your situation</Label>
                <textarea
                  id="ctx"
                  className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. I sell B2B analytics to ops leaders at mid-market manufacturers. Tone: direct, no fluff."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={loading}
                />
                <Button type="button" onClick={handleAi} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                      Generate openers with AI
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
