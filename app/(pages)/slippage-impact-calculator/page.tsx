"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
export default function SlippageImpactCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [notional, setNotional] = useState(""); const [bps, setBps] = useState("5"); const [trades, setTrades] = useState("20"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/slippage-impact-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const n = parseFloat(notional); const b = parseFloat(bps); const t = parseFloat(trades); if (!n || b < 0 || t < 0) return null; const perTrade = n * (b / 10000); return { perTrade, total: perTrade * t }; }, [notional, bps, trades]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Slippage Impact Calculator</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Notional per trade</Label><Input type="number" value={notional} onChange={(e)=>setNotional(e.target.value)} /></div><div><Label>Slippage (bps)</Label><Input type="number" step="0.1" value={bps} onChange={(e)=>setBps(e.target.value)} /></div><div><Label>Trades</Label><Input type="number" value={trades} onChange={(e)=>setTrades(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2" disabled={!notional || !bps || !trades}><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Per trade</p><p className="text-3xl font-bold">${result.perTrade.toFixed(2)}</p><p className="text-sm text-slate-500">Total: ${result.total.toFixed(2)}</p></div>}</div></div></DashboardLayout>;
}
