"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BeakerIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { cn } from "components/lib/utils";
import { useToolAccess } from "@/lib/use-tool-access";

type Unit = "kg" | "lb";

const ACTIVITY: Record<string, number> = {
  low: 1,
  moderate: 1.1,
  high: 1.2,
  athlete: 1.35,
};

export default function WaterIntakeCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [activity, setActivity] = useState<keyof typeof ACTIVITY>("moderate");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return null;
    const kg = unit === "kg" ? w : w * 0.453592;
    const baseMl = kg * 35;
    const totalMl = Math.round(baseMl * ACTIVITY[activity]);
    const glasses = Math.round(totalMl / 250);
    return { kg, totalMl, glasses };
  }, [weight, unit, activity]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <BeakerIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Water Intake Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Rough daily fluid target from weight (~35 ml/kg) adjusted for activity
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Body weight</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                step="0.1"
                inputMode="decimal"
                placeholder={unit === "kg" ? "e.g. 70" : "e.g. 160"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity">Activity level</Label>
            <select
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value as keyof typeof ACTIVITY)}
              className={cn(
                "flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            >
              <option value="low">Light / desk work</option>
              <option value="moderate">Moderate exercise</option>
              <option value="high">Heavy exercise / heat</option>
              <option value="athlete">Very high output</option>
            </select>
          </div>

          <Button onClick={handleCalculate} disabled={!result} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Suggested daily fluids</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.totalMl.toLocaleString()} ml
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                ~{result.glasses} × 250 ml glasses · Weight used: {result.kg.toFixed(1)} kg
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          General guideline only; adjust for climate, health conditions, and doctor advice.
        </p>
      </div>
    </DashboardLayout>
  );
}
