"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartPieIcon } from "@heroicons/react/24/outline";

export default function UtilizationCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [billable, setBillable] = useState("");
  const [available, setAvailable] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    // All tools are now free - no auth required
              setUnlocked(true);
            }}
            className="gap-2"
          >
            <ChartPieIcon className="h-4 w-4" />
            Calculate
          </Button>

          {unlocked && result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Utilization</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {result.pct.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Non-billable hours in period:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {result.nonBillable.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {unlocked && !result && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Enter billable hours and a positive capacity.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
