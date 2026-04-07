"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function MultiTargetTakeProfitPlannerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [tp1, setTp1] = useState("");
  const [tp2, setTp2] = useState("");
  const [tp3, setTp3] = useState("");
  const [alloc1, setAlloc1] = useState("40");
  const [alloc2, setAlloc2] = useState("35");
  const [alloc3, setAlloc3] = useState("25");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/multi-target-take-profit-planner")}`);
    const hasActiveSubscription = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) return router.push("/pricing");
    setResultUnlocked(true);
  };

  const result = useMemo(() => {
    const e = parseFloat(entry); const s = parseFloat(stop);
    if (!e || !s || e === s) return null;
    const risk = Math.abs(e - s);
    const rows = [
      { label: "TP1", p: parseFloat(tp1), a: parseFloat(alloc1) || 0 },
      { label: "TP2", p: parseFloat(tp2), a: parseFloat(alloc2) || 0 },
      { label: "TP3", p: parseFloat(tp3), a: parseFloat(alloc3) || 0 },
    ].filter((r) => Number.isFinite(r.p) && r.p > 0 && r.a > 0);
    if (!rows.length) return null;
    const totalA = rows.reduce((n, r) => n + r.a, 0);
    const weightedR = rows.reduce((n, r) => n + (((r.p - e) / risk) * (r.a / totalA)), 0);
    return { rows, weightedR, totalA };
  }, [entry, stop, tp1, tp2, tp3, alloc1, alloc2, alloc3]);

  return <DashboardLayout><div className="max-w-2xl mx-auto">
    <div className="flex items-center gap-3 mb-8"><ChartBarIcon className="size-7 text-amber-600" /><h1 className="text-2xl font-bold">Multi-Target Take-Profit Planner</h1></div>
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>Entry</Label><Input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} /></div><div><Label>Stop</Label><Input type="number" value={stop} onChange={(e) => setStop(e.target.value)} /></div></div>
      <div className="grid grid-cols-2 gap-3"><Input placeholder="TP1" type="number" value={tp1} onChange={(e) => setTp1(e.target.value)} /><Input placeholder="TP1 %" type="number" value={alloc1} onChange={(e) => setAlloc1(e.target.value)} /><Input placeholder="TP2" type="number" value={tp2} onChange={(e) => setTp2(e.target.value)} /><Input placeholder="TP2 %" type="number" value={alloc2} onChange={(e) => setAlloc2(e.target.value)} /><Input placeholder="TP3" type="number" value={tp3} onChange={(e) => setTp3(e.target.value)} /><Input placeholder="TP3 %" type="number" value={alloc3} onChange={(e) => setAlloc3(e.target.value)} /></div>
      <Button onClick={handleCalculate} className="gap-2" disabled={!entry || !stop}><CalculatorIcon className="h-4 w-4" />Calculate</Button>
      {resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Weighted result</p><p className="text-3xl font-bold">{result.weightedR.toFixed(2)}R</p><p className="text-xs text-slate-500">Allocation sum: {result.totalA.toFixed(1)}%</p></div>}
    </div>
  </div></DashboardLayout>;
}
