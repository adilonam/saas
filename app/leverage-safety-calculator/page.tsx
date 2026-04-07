"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScaleIcon, CalculatorIcon } from "@heroicons/react/24/outline";
export default function LeverageSafetyCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [stopMovePercent, setStopMovePercent] = useState("2"); const [maxLossPercent, setMaxLossPercent] = useState("1"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/leverage-safety-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const s = parseFloat(stopMovePercent); const l = parseFloat(maxLossPercent); if (!s || !l) return null; return { maxLeverage: l / s }; }, [stopMovePercent, maxLossPercent]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><div className="flex items-center gap-3 mb-8"><ScaleIcon className="size-7 text-violet-600" /><h1 className="text-2xl font-bold">Leverage Safety Calculator</h1></div><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Stop move (%)</Label><Input type="number" step="0.1" value={stopMovePercent} onChange={(e)=>setStopMovePercent(e.target.value)} /></div><div><Label>Max account loss (%)</Label><Input type="number" step="0.1" value={maxLossPercent} onChange={(e)=>setMaxLossPercent(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2"><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Approx safe leverage</p><p className="text-3xl font-bold">{result.maxLeverage.toFixed(2)}x</p></div>}</div></div></DashboardLayout>;
}
