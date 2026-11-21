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
type Sex = "male" | "female";
type Activity =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very active (intense daily)",
};

const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor BMR: 10*kg + 6.25*cm - 5*age + s (s: +5 male, -161 female)
function bmrMifflin(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const s = sex === "male" ? 5 : -161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export default function CalorieCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [unit, setUnit] = useState<Unit>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/calorie-calculator")}`);
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

  const { bmr, tdee } = useMemo(() => {
    let kg: number;
    let cm: number;
    if (unit === "metric") {
      kg = parseFloat(weightKg) || 0;
      cm = parseFloat(heightCm) || 0;
    } else {
      const lb = parseFloat(weightLb) || 0;
      const ft = parseFloat(heightFt) || 0;
      const inVal = parseFloat(heightIn) || 0;
      kg = lb / 2.205;
      cm = (ft * 12 + inVal) * 2.54;
    }
    const ageVal = Math.max(15, Math.min(120, parseFloat(age) || 0));
    if (kg <= 0 || cm <= 0 || ageVal < 15) return { bmr: null, tdee: null };
    const b = bmrMifflin(kg, cm, ageVal, sex);
    const factor = ACTIVITY_FACTORS[activity];
    return {
      bmr: Math.round(b),
      tdee: Math.round(b * factor),
    };
  }, [unit, sex, activity, age, weightKg, heightCm, weightLb, heightFt, heightIn]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calorie Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Daily calorie needs (TDEE) for maintain, lose, or gain weight
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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
          <button
            type="button"
            onClick={() => setSex("male")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sex === "male"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setSex("female")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sex === "female"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Female
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              min="15"
              max="120"
              step="1"
              placeholder="e.g. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

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

          <div className="space-y-2">
            <Label>Activity level</Label>
            <div className="flex flex-col gap-2">
              {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActivity(key)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activity === key
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {ACTIVITY_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {bmr != null && tdee != null && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Basal metabolic rate (BMR)</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{bmr.toLocaleString()} cal/day</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Daily maintenance (TDEE)</p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{tdee.toLocaleString()} cal/day</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lose ~0.5 kg/week</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{Math.round(tdee - 500).toLocaleString()} cal</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Maintain</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{tdee.toLocaleString()} cal</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gain ~0.5 kg/week</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{Math.round(tdee + 500).toLocaleString()} cal</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Uses the Mifflin-St Jeor equation for BMR. TDEE = BMR × activity factor. For weight change, ±500 cal/day is often used for ~0.5 kg/week; adjust with a professional if needed.
        </p>
      </div>
    </DashboardLayout>
  );
}
