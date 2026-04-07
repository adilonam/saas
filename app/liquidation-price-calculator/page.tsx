"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

type Side = "long" | "short";

export default function LiquidationPriceCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [side, setSide] = useState<Side>("long"); const [entry, setEntry] = useState("30000"); const [leverage, setLeverage] = useState("10"); const [mmr, setMmr] = useState("0.5"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/liquidation-price-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const e = parseFloat(entry); const l = parseFloat(leverage); const m = parseFloat(mmr) / 100; if (!e || !l || m < 0 || m >= 1) return null; const liquidation = side === "long" ? e * (1 - 1 / l + m) : e * (1 + 1 / l - m); return { liquidation }; }, [side, entry, leverage, mmr]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Liquidation Price Calculator</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Side</Label><select value={side} onChange={(e)=>setSide(e.target.value as Side)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="long">Long</option><option value="short">Short</option></select></div><div><Label>Entry</Label><Input type="number" value={entry} onChange={(e)=>setEntry(e.target.value)} /></div><div><Label>Leverage (x)</Label><Input type="number" step="0.1" value={leverage} onChange={(e)=>setLeverage(e.target.value)} /></div><div><Label>Maintenance margin rate (%)</Label><Input type="number" step="0.01" value={mmr} onChange={(e)=>setMmr(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2"><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Estimated liquidation price</p><p className="text-3xl font-bold">{result.liquidation.toFixed(4)}</p></div>}</div></div></DashboardLayout>;
}
