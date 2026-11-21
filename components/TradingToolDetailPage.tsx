"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { getTradingToolByPath } from "@/lib/trading-tools";

type TradingToolDetailPageProps = {
  /** When the page is a static route (e.g. `/order-block-detector`), pass the URL segment; otherwise dynamic route params are used. */
  pathSegment?: string;
};

export default function TradingToolDetailPage({ pathSegment: pathSegmentProp }: TradingToolDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tool?: string }>();
  const pathSegment =
    pathSegmentProp ?? (typeof params?.tool === "string" ? params.tool : "");
  const { data: session, status } = useSession();

  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [notes, setNotes] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const tool = getTradingToolByPath(pathSegment);

  const handleRun = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/trading-tools")}`);
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

  const generatedResult = useMemo(() => {
    if (!tool) return null;
    const cleanSymbol = symbol.trim() || "N/A";
    const cleanTimeframe = timeframe.trim() || "N/A";
    const cleanNotes = notes.trim() || "No extra context provided.";

    return [
      `Tool: ${tool.title}`,
      `Symbol: ${cleanSymbol}`,
      `Timeframe: ${cleanTimeframe}`,
      "",
      "Execution Summary",
      `- Focus: ${tool.shortDescription}`,
      `- Context: ${cleanNotes}`,
      "",
      "Action Checklist",
      "- Confirm trend context on higher timeframe.",
      "- Validate risk budget before entry.",
      "- Define invalidation level and exit rules.",
      "- Log result for review and iteration.",
    ].join("\n");
  }, [notes, symbol, timeframe, tool]);

  if (!tool) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">Tool not found</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            This trading tool does not exist.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tool.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol / Asset</Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g. BTCUSDT, ES1!, AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Input
              id="timeframe"
              type="text"
              placeholder="e.g. 5m, 1h, 1D"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Market Context / Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your setup context, risk constraints, and execution plan."
              className="w-full min-h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-dashboard-primary/20"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              onClick={handleRun}
              disabled={!symbol.trim() || !timeframe.trim()}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Run Tool
            </Button>
          </div>

          {resultUnlocked && generatedResult && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Output
              </p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed rounded-xl bg-slate-100 dark:bg-slate-800 p-4 text-slate-800 dark:text-slate-100">
                {generatedResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
