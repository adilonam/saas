"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceiptPercentIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const PAGE = "/invoice-line-builder";

type Line = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxPct: number;
};

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function InvoiceLineBuilderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [lines, setLines] = useState<Line[]>([
    { id: rid(), description: "Service fee", quantity: 1, unitPrice: 100, discountPct: 0, taxPct: 10 },
  ]);
  const [unlocked, setUnlocked] = useState(false);

  const totals = useMemo(() => {
    let subAfterDisc = 0;
    let taxTotal = 0;
    for (const l of lines) {
      const gross = l.quantity * l.unitPrice;
      const afterDisc = gross * (1 - Math.min(100, Math.max(0, l.discountPct)) / 100);
      const tax = afterDisc * (Math.min(100, Math.max(0, l.taxPct)) / 100);
      subAfterDisc += afterDisc;
      taxTotal += tax;
    }
    return {
      subAfterDisc: round2(subAfterDisc),
      taxTotal: round2(taxTotal),
      grand: round2(subAfterDisc + taxTotal),
    };
  }, [lines]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setUnlocked(true);
  };

  const update = (id: string, patch: Partial<Line>) =>
    setLines((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addLine = () =>
    setLines((r) => [...r, { id: rid(), description: "", quantity: 1, unitPrice: 0, discountPct: 0, taxPct: 0 }]);

  const removeLine = (id: string) =>
    setLines((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center text-lime-700">
            <ReceiptPercentIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice line builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Per-line quantity, unit price, discount %, then tax % on the discounted line subtotal. No PDF export.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1">
              <PlusIcon className="h-4 w-4" />
              Line
            </Button>
          </div>

          <div className="overflow-x-auto space-y-4">
            {lines.map((l, idx) => {
              const gross = l.quantity * l.unitPrice;
              const afterDisc = gross * (1 - Math.min(100, Math.max(0, l.discountPct)) / 100);
              const tax = afterDisc * (Math.min(100, Math.max(0, l.taxPct)) / 100);
              const lineTotal = afterDisc + tax;
              return (
                <div
                  key={l.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Line {idx + 1}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(l.id)} disabled={lines.length <= 1}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input value={l.description} onChange={(e) => update(l.id, { description: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={l.quantity}
                        onChange={(e) => update(l.id, { quantity: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={l.unitPrice}
                        onChange={(e) => update(l.id, { unitPrice: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Disc %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={l.discountPct}
                        onChange={(e) => update(l.id, { discountPct: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tax %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={l.taxPct}
                        onChange={(e) => update(l.id, { taxPct: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Line subtotal after discount: {round2(afterDisc).toFixed(2)} + tax {round2(tax).toFixed(2)} ={" "}
                    <span className="text-slate-900 dark:text-white font-semibold">{round2(lineTotal).toFixed(2)}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <Button onClick={handleSubmit} className="gap-2">
            <ReceiptPercentIcon className="h-4 w-4" />
            Show totals
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Subtotal (after line discounts)</p>
                <p className="text-xl font-semibold font-mono">{totals.subAfterDisc.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Tax total</p>
                <p className="text-xl font-semibold font-mono">{totals.taxTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Grand total</p>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{totals.grand.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
