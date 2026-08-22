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

export default function MarginCallPriceCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [side, setSide] = useState<Side>("long"); const [entry, setEntry] = useState("100"); const [units, setUnits] = useState("100"); const [equity, setEquity] = useState("2000"); const [mm, setMm] = useState("25"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/margin-call-price-calculator")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => {
    const e = parseFloat(entry); const q = parseFloat(units); const eq = parseFloat(equity); const m = parseFloat(mm) / 100;
    if (!e || !q || !eq || m <= 0 || m >= 1) return null;
    let callPrice: number;
    if (side === "long") { const borrowed = q * e - eq; if (borrowed < 0) return null; callPrice = borrowed / (q * (1 - m)); }
    else { callPrice = (eq + q * e) / (q * (1 + m)); }
    return Number.isFinite(callPrice) && callPrice > 0 ? { callPrice } : null;
  }, [side, entry, units, equity, mm]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Margin Call Price Calculator</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Side</Label><select value={side} onChange={(e)=>setSide(e.target.value as Side)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="long">Long</option><option value="short">Short</option></select></div><div><Label>Entry</Label><Input type="number" value={entry} onChange={(e)=>setEntry(e.target.value)} /></div><div><Label>Units</Label><Input type="number" value={units} onChange={(e)=>setUnits(e.target.value)} /></div><div><Label>Equity used</Label><Input type="number" value={equity} onChange={(e)=>setEquity(e.target.value)} /></div><div><Label>Maintenance margin (%)</Label><Input type="number" step="0.1" value={mm} onChange={(e)=>setMm(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2"><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-sm text-slate-500">Estimated margin call price</p><p className="text-3xl font-bold">{result.callPrice.toFixed(4)}</p></div>}</div></div></DashboardLayout>;
}
