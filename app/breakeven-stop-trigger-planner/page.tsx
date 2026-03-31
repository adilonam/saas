"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
export default function BreakevenStopTriggerPlannerPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [entry, setEntry] = useState(""); const [stop, setStop] = useState(""); const [triggerR, setTriggerR] = useState("1"); const [resultUnlocked, setResultUnlocked] = useState(false);
  const handleCalculate = () => { if (status === "unauthenticated" || !session) return router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/breakeven-stop-trigger-planner")}`); const has = session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date(); if (!has) return router.push("/pricing"); setResultUnlocked(true); };
  const result = useMemo(() => { const e = parseFloat(entry); const s = parseFloat(stop); const r = parseFloat(triggerR); if (!e || !s || !r || e === s) return null; const risk = Math.abs(e - s); return { triggerPrice: e + risk * r, risk }; }, [entry, stop, triggerR]);
  return <DashboardLayout><div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-8">Breakeven Stop Trigger Planner</h1><div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-4"><div><Label>Entry</Label><Input type="number" value={entry} onChange={(e)=>setEntry(e.target.value)} /></div><div><Label>Stop</Label><Input type="number" value={stop} onChange={(e)=>setStop(e.target.value)} /></div><div><Label>Trigger R</Label><Input type="number" step="0.1" value={triggerR} onChange={(e)=>setTriggerR(e.target.value)} /></div><Button onClick={handleCalculate} className="gap-2" disabled={!entry || !stop || !triggerR}><CalculatorIcon className="h-4 w-4" />Calculate</Button>{resultUnlocked && result && <div className="pt-4 border-t border-slate-200 dark:border-slate-700"><p className="text-3xl font-bold">{result.triggerPrice.toFixed(4)}</p><p className="text-xs text-slate-500">1R distance: {result.risk.toFixed(4)}</p></div>}</div></div></DashboardLayout>;
}
