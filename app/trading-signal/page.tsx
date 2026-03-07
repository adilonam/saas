"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { TradingViewRoomTrading } from "components/TradingViewRoomTrading";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface PredictResult {
  probability: number;
  takeProfit: number;
  stopLoss: number;
  direction: "BUY" | "SELL";
  symbol: string;
}

function mockPredict(symbol: string): PredictResult {
  const prob = 0.55 + Math.random() * 0.35;
  const direction = Math.random() > 0.5 ? "BUY" : "SELL";
  const base = direction === "BUY" ? 1.02 : 0.98;
  return {
    probability: Math.round(prob * 100),
    takeProfit: parseFloat((base * (1 + (direction === "BUY" ? 0.03 : -0.03))).toFixed(4)),
    stopLoss: parseFloat((base * (direction === "BUY" ? 0.98 : 1.02)).toFixed(4)),
    direction,
    symbol,
  };
}

export default function TradingSignalPage() {
  const [symbol, setSymbol] = useState("BINANCE:BTCUSDT");
  const [chartSymbol, setChartSymbol] = useState("BINANCE:BTCUSDT");
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);

  const handlePredict = async () => {
    setIsPredicting(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 800));
    setResult(mockPredict(symbol));
    setIsPredicting(false);
  };

  const applySymbolToChart = () => {
    setChartSymbol(symbol);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Trading Signal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          View the chart and run a mock prediction for probability, take profit and stop loss.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Predict panel */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
                <ChartBarIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Predict</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mock signal (demo)</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white"
                placeholder="e.g. BINANCE:BTCUSDT"
              />
            </div>
            <Button
              onClick={handlePredict}
              disabled={isPredicting}
              className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Predicting…
                </>
              ) : (
                <>
                  <ChartBarIcon className="size-5" />
                  Predict
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={applySymbolToChart}
              className="w-full rounded-xl border-slate-200 dark:border-slate-700 mt-2"
            >
              Apply symbol to chart
            </Button>
          </div>

          {result && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Signal result
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-300">Direction</span>
                <span
                  className={`font-bold ${
                    result.direction === "BUY"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {result.direction}
                </span>
                {result.direction === "BUY" ? (
                  <ArrowTrendingUpIcon className="size-5 text-emerald-500" />
                ) : (
                  <ArrowTrendingDownIcon className="size-5 text-rose-500" />
                )}
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-300">Probability (win)</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.probability}%
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-300">Take profit</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.takeProfit}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-300">Stop loss</span>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {result.stopLoss}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                Mock data — for demonstration only.
              </p>
            </div>
          )}
        </div>

        {/* Right: TradingView chart */}
        <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Chart: {chartSymbol}
            </span>
          </div>
          <div className="w-full h-[500px] min-h-[400px] p-2">
            <TradingViewRoomTrading
              symbol={chartSymbol}
              interval="D"
              style="1"
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
