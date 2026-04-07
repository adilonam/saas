"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { TRADING_TOOLS } from "@/lib/trading-tools";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function TradingToolsHubPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Trading Tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Quant, risk, execution, and journal tools for active traders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRADING_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="tool-card group flex items-start gap-4 p-6 rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 text-left"
          >
            <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <ChartBarIcon className="size-6" />
            </div>
            <div>
              <p className="font-bold text-base">{tool.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {tool.shortDescription}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
