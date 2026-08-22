"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

type Mode = "record" | "odds";

export default function WinProbabilityCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<Mode>("record");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [decimalOdds, setDecimalOdds] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/win-probability-calculator")}`,
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
    setResultUnlocked(true);
  };

  const result = useMemo(() => {
    if (mode === "record") {
      const w = parseInt(wins, 10) || 0;
      const l = parseInt(losses, 10) || 0;
      const total = w + l;
      if (total <= 0) return null;
      const winRate = (w / total) * 100;
      return { type: "record" as const, winRate, wins: w, losses: l, total };
    }
    const odds = parseFloat(decimalOdds) || 0;
    if (odds <= 0) return null;
    const impliedProb = (1 / odds) * 100;
    return { type: "odds" as const, impliedProb, decimalOdds: odds };
  }, [mode, wins, losses, decimalOdds]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Win Probability Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Win rate from record or implied probability from decimal odds
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("record")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "record"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            From record
          </button>
          <button
            type="button"
            onClick={() => setMode("odds")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "odds"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            From decimal odds
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {mode === "record" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="wins">Wins</Label>
                <Input
                  id="wins"
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="losses">Losses</Label>
                <Input
                  id="losses"
                  type="number"
                  min="0"
                  placeholder="e.g. 8"
                  value={losses}
                  onChange={(e) => setLosses(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="decimal-odds">Decimal odds</Label>
              <Input
                id="decimal-odds"
                type="number"
                min="1.01"
                step="0.01"
                placeholder="e.g. 2.50"
                value={decimalOdds}
                onChange={(e) => setDecimalOdds(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Implied probability = 1 ÷ decimal odds
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={
                (mode === "record" && (!wins || !losses || (parseInt(wins, 10) + parseInt(losses, 10)) <= 0)) ||
                (mode === "odds" && (!decimalOdds || parseFloat(decimalOdds) <= 0))
              }
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {result.type === "record" && (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Win rate</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {result.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.wins} W – {result.losses} L (total {result.total} games)
                  </p>
                </>
              )}
              {result.type === "odds" && (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Implied probability
                    </p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {result.impliedProb.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Decimal odds {result.decimalOdds.toFixed(2)}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          From record: win rate = wins ÷ (wins + losses). From odds: implied probability = 1 ÷
          decimal odds (e.g. 2.00 → 50%).
        </p>
      </div>
    </DashboardLayout>
  );
}
