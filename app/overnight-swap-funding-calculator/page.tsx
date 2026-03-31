"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
export default function OvernightSwapFundingCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [swap, setSwap] = useState("-4.2"); const [lots, setLots] = useState("1"); const [nights, setNights] = useState("5"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/overnight-swap-funding-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const s = parseFloat(swap); const l = parseFloat(lots); const n = parseFloat(nights); if (!l || n < 0 || !Number.isFinite(s)) return null; return { total: s * l * n }; }, [swap, lots, nights]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Overnight Swap/Funding Calculator</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Swap/funding per lot per night</Label><Input type="number" step="0.01" value={swap} onChange={(e)=>setSwap(e.target.value)} /></div><div><Label>Lots</Label><Input type="number" step="0.01" value={lots} onChange={(e)=>setLots(e.target.value)} /></div><div><Label>Nights held</Label><Input type="number" value={nights} onChange={(e)=>setNights(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2"><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-3xl font-bold">{result.total >= 0 ? "+" : ""}${result.total.toFixed(2)}</p></div>}</div></div></DashboardLayout>;
}
