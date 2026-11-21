"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
export default function CommissionImpactCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [commission, setCommission] = useState("3.5"); const [lots, setLots] = useState("1"); const [trades, setTrades] = useState("20"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/commission-impact-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const c = parseFloat(commission); const l = parseFloat(lots); const t = parseFloat(trades); if (c < 0 || !l || t < 0) return null; const roundTurn = c * l * 2; return { roundTurn, total: roundTurn * t }; }, [commission, lots, trades]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Commission Impact Calculator</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Commission per side per lot</Label><Input type="number" step="0.01" value={commission} onChange={(e)=>setCommission(e.target.value)} /></div><div><Label>Lots</Label><Input type="number" step="0.01" value={lots} onChange={(e)=>setLots(e.target.value)} /></div><div><Label>Round-turn trades</Label><Input type="number" value={trades} onChange={(e)=>setTrades(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2"><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Round-turn commission</p><p className="text-3xl font-bold">${result.roundTurn.toFixed(2)}</p><p className="text-sm text-slate-500">Total: ${result.total.toFixed(2)}</p></div>}</div></div></DashboardLayout>;
}
