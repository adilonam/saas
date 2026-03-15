"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

type Unit = "metric" | "imperial";

function bmiCategory(bmi: number): { label: string; className: string } {
  if (bmi < 18.5) return { label: "Underweight", className: "text-sky-600 dark:text-sky-400" };
  if (bmi < 25) return { label: "Normal", className: "text-emerald-600 dark:text-emerald-400" };
  if (bmi < 30) return { label: "Overweight", className: "text-amber-600 dark:text-amber-400" };
  return { label: "Obese", className: "text-rose-600 dark:text-rose-400" };
}

function healthyWeightRange(heightM: number): [number, number] {
  const low = 18.5 * heightM * heightM;
  const high = 24.9 * heightM * heightM;
  return [Math.round(low * 10) / 10, Math.round(high * 10) / 10];
}

export default function BMICalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unit, setUnit] = useState<Unit>("metric");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/bmi-calculator")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  const { bmi, category, healthyRange, heightM } = useMemo(() => {
    let kg: number;
    let m: number;
    if (unit === "metric") {
      kg = parseFloat(weightKg) || 0;
      m = (parseFloat(heightCm) || 0) / 100;
    } else {
      const lb = parseFloat(weightLb) || 0;
      const ft = parseFloat(heightFt) || 0;
      const inVal = parseFloat(heightIn) || 0;
      kg = lb / 2.205;
      m = (ft * 12 + inVal) * 0.0254;
    }
    if (kg <= 0 || m <= 0) return { bmi: null, category: null, healthyRange: null, heightM: m };
    const b = kg / (m * m);
    const cat = bmiCategory(b);
    const range = m > 0 ? healthyWeightRange(m) : null;
    return {
      bmi: Math.round(b * 10) / 10,
      category: cat,
      healthyRange: range,
      heightM: m,
    };
  }, [unit, weightKg, heightCm, weightLb, heightFt, heightIn]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BMI Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Body Mass Index from weight and height
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setUnit("metric")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              unit === "metric"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Metric (kg, cm)
          </button>
          <button
            type="button"
            onClick={() => setUnit("imperial")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              unit === "imperial"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Imperial (lb, ft/in)
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {unit === "metric" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="weight-kg">Weight (kg)</Label>
                <Input
                  id="weight-kg"
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  placeholder="e.g. 70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height-cm">Height (cm)</Label>
                <Input
                  id="height-cm"
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  placeholder="e.g. 175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="weight-lb">Weight (lb)</Label>
                <Input
                  id="weight-lb"
                  type="number"
                  min="44"
                  max="660"
                  step="0.1"
                  placeholder="e.g. 154"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height-ft">Feet</Label>
                  <Input
                    id="height-ft"
                    type="number"
                    min="3"
                    max="8"
                    step="1"
                    placeholder="5"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-in">Inches</Label>
                  <Input
                    id="height-in"
                    type="number"
                    min="0"
                    max="11"
                    step="1"
                    placeholder="9"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {bmi != null && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your BMI</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{bmi}</p>
              {category && (
                <p className={`mt-2 font-semibold ${category.className}`}>{category.label}</p>
              )}
              {healthyRange && heightM > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Healthy weight range for your height:{" "}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {healthyRange[0]} – {healthyRange[1]} kg
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          BMI = weight (kg) ÷ height (m)². It is a screening tool and does not diagnose body fat or health.
        </p>
      </div>
    </DashboardLayout>
  );
}
