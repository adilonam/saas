"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { analyzePasswordStrength } from "@/lib/text-productivity";

export default function PasswordStrengthCheckerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzePasswordStrength> | null>(null);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/password-strength-checker")}`,
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
    setResult(analyzePasswordStrength(password));
    setUnlocked(true);
  };

  const barColor =
    result && result.score >= 80
      ? "bg-emerald-500"
      : result && result.score >= 60
        ? "bg-lime-500"
        : result && result.score >= 40
          ? "bg-amber-500"
          : result && result.score >= 20
            ? "bg-orange-500"
            : "bg-rose-500";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ShieldCheckIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Password Strength Checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Heuristic score and tips (passwords stay in your browser)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="psc-input">Password</Label>
            <Input
              id="psc-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-11 font-mono"
              placeholder="Type a password to analyze…"
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Check strength
          </Button>

          {unlocked && result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-lg font-semibold">{result.label}</p>
                <p className="text-2xl font-bold tabular-nums text-slate-700 dark:text-slate-200">
                  {result.score}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </p>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              {result.tips.length > 0 && (
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {result.tips.map((t) => (
                    <li key={t}>{t}</li>
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
