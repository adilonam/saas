"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function PartialExitOptimizerPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [entry, setEntry] = useState(""); const [stop, setStop] = useState("");
  const [tp1, setTp1] = useState(""); const [tp2, setTp2] = useState(""); const [tp3, setTp3] = useState("");
  const [p1, setP1] = useState("50"); const [p2, setP2] = useState("30"); const [p3, setP3] = useState("20");
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/partial-exit-optimizer")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => {
    const e = parseFloat(entry); const s = parseFloat(stop); if (!e || !s || e === s) return null;
    const risk = Math.abs(e - s);
    const rows = [{t: parseFloat(tp1), p: parseFloat(p1)||0}, {t: parseFloat(tp2), p: parseFloat(p2)||0}, {t: parseFloat(tp3), p: parseFloat(p3)||0}].filter((x) => Number.isFinite(x.t) && x.t > 0 && x.p > 0);
    if (!rows.length) return null;
    const totalP = rows.reduce((a, b) => a + b.p, 0);
    const weightedR = rows.reduce((a, b) => a + (((b.t - e) / risk) * (b.p / totalP)), 0);
    return { weightedR, totalP };
  }, [entry, stop, tp1, tp2, tp3, p1, p2, p3]);

  return <DashboardLayout><div className="max-w-2xl mx-auto"><div className="flex items-center gap-3 mb-8"><ChartPieIcon className="size-7 text-emerald-600" /><h1 className="text-2xl font-bold">Partial Exit Optimizer</h1></div><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>Entry</Label><Input type="number" value={entry} onChange={(e)=>setEntry(e.target.value)} /></div><div><Label>Stop</Label><Input type="number" value={stop} onChange={(e)=>setStop(e.target.value)} /></div></div><div className="grid grid-cols-2 gap-3"><Input placeholder="TP1" type="number" value={tp1} onChange={(e)=>setTp1(e.target.value)} /><Input placeholder="TP1 %" type="number" value={p1} onChange={(e)=>setP1(e.target.value)} /><Input placeholder="TP2" type="number" value={tp2} onChange={(e)=>setTp2(e.target.value)} /><Input placeholder="TP2 %" type="number" value={p2} onChange={(e)=>setP2(e.target.value)} /><Input placeholder="TP3" type="number" value={tp3} onChange={(e)=>setTp3(e.target.value)} /><Input placeholder="TP3 %" type="number" value={p3} onChange={(e)=>setP3(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2" disabled={!entry || !stop}><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-3xl font-bold">{result.weightedR.toFixed(2)}R</p><p className="text-xs text-slate-500">Included exits: {result.totalP.toFixed(1)}%</p></div>}</div></div></DashboardLayout>;
}
