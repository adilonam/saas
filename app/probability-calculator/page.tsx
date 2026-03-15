"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n <= 1) return 1;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function nCr(n: number, r: number): number {
  if (r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) return NaN;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export default function ProbabilityCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"single" | "multiple" | "combinations">("single");
  const [singleP, setSingleP] = useState("");
  const [eventA, setEventA] = useState("");
  const [eventB, setEventB] = useState("");
  const [nTotal, setNTotal] = useState("");
  const [kChoose, setKChoose] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/probability-calculator")}`);
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
    if (mode === "single") {
      const p = parseFloat(singleP);
      if (Number.isNaN(p) || p < 0 || p > 1) return null;
      return { type: "single", probability: p, percent: (p * 100).toFixed(2) };
    }
    if (mode === "multiple") {
      const a = parseFloat(eventA);
      const b = parseFloat(eventB);
      if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || a > 1 || b < 0 || b > 1) return null;
      const and = a * b;
      const or = a + b - and;
      return { type: "multiple", pAandB: and, pAorB: or };
    }
    const n = parseInt(nTotal, 10);
    const k = parseInt(kChoose, 10);
    if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return null;
    const comb = nCr(n, k);
    if (Number.isNaN(comb)) return null;
    return { type: "combinations", combinations: comb };
  }, [mode, singleP, eventA, eventB, nTotal, kChoose]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Probability Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Single probability, P(A and B) / P(A or B), or combinations (n choose k)
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["single", "multiple", "combinations"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {m === "single" ? "Single P" : m === "multiple" ? "A and B / A or B" : "Combinations"}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {mode === "single" && (
            <div className="space-y-2">
              <Label htmlFor="single-p">Probability (0 to 1)</Label>
              <Input
                id="single-p"
                type="number"
                min="0"
                max="1"
                step="0.01"
                placeholder="e.g. 0.25"
                value={singleP}
                onChange={(e) => setSingleP(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          )}
          {mode === "multiple" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="event-a">P(A) (0 to 1)</Label>
                <Input
                  id="event-a"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="e.g. 0.5"
                  value={eventA}
                  onChange={(e) => setEventA(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-b">P(B) (0 to 1)</Label>
                <Input
                  id="event-b"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="e.g. 0.3"
                  value={eventB}
                  onChange={(e) => setEventB(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </>
          )}
          {mode === "combinations" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="n-total">n (total items)</Label>
                <Input
                  id="n-total"
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  value={nTotal}
                  onChange={(e) => setNTotal(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="k-choose">k (choose)</Label>
                <Input
                  id="k-choose"
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  value={kChoose}
                  onChange={(e) => setKChoose(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result != null && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {result.type === "single" && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Probability</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.probability}</p>
                  <p className="text-slate-600 dark:text-slate-300">{result.percent}%</p>
                </>
              )}
              {result.type === "multiple" && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">P(A and B)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{result.pAandB.toFixed(4)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">P(A or B)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{result.pAorB.toFixed(4)}</p>
                </>
              )}
              {result.type === "combinations" && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Combinations (n choose k)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.combinations}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
