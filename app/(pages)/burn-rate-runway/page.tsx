"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";

export default function BurnRateRunwayPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [cash, setCash] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    // All tools are now free - no auth required
              setUnlocked(true);
            }}
            className="gap-2"
          >
            <PresentationChartLineIcon className="h-4 w-4" />
            Calculate runway
          </Button>

          {unlocked && result?.kind === "invalid" && (
            <p className="text-sm text-amber-600 dark:text-amber-400">Use a non-negative cash balance.</p>
          )}

          {unlocked && result?.kind === "surplus" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Net cash-flow positive</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Monthly surplus about{" "}
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
                  result.monthlyNet,
                )}
                . Runway is not shrinking from this snapshot; adjust if income is irregular.
              </p>
            </div>
          )}

          {unlocked && result?.kind === "runway" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Net monthly burn</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(result.netBurn)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Approx. runway</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.months.toFixed(1)} months
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                (~{Math.round(result.months * 4.33)} weeks at 4.33 weeks per month)
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
