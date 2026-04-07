"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "components/DashboardLayout";
import { TradingViewRoomTrading } from "components/TradingViewRoomTrading";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

interface AnalyzeResult {
  entryPrice: number;
  probability: number;
  takeProfit: number;
  stopLoss: number;
  direction: "BUY" | "SELL";
}

const CHART_SYMBOL = "BINANCE:BTCUSDT";

export default function TradingSignalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setChartImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePredict = async () => {
    if (status === "unauthenticated" || !session) {
      router.push("/signup?callbackUrl=" + encodeURIComponent("/trading-signal"));
      return;
    }
    const hasActiveSubscription =
      session.user?.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (!chartImage) {
      setError("Please upload a chart screenshot first");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", chartImage);
      const res = await fetch("/api/analyze-chart", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }
      setResult(data as AnalyzeResult);
    } catch (e) {
      console.error(e);
      setError("An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Trading Signal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Upload a chart screenshot and get AI analysis: entry price, probability, take profit and stop loss.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
                <ChartBarIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analyze chart</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload screenshot, get signal</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Screenshot of chart
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white file:mr-3 file:rounded-lg file:border-0 file:bg-dashboard-primary/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-dashboard-primary"
              />
              {previewUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-32">
                  <Image
                    src={previewUrl}
                    alt="Chart preview"
                    width={512}
                    height={128}
                    unoptimized
                    className="w-full h-32 object-contain bg-slate-100 dark:bg-slate-800"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handlePredict}
              disabled={isAnalyzing || !chartImage}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-4 w-4" />
                  Predict
                </>
              )}
            </Button>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{error}</p>
            )}
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
                <span className="text-slate-600 dark:text-slate-300">Entry price</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {typeof result.entryPrice === "number" ? result.entryPrice.toLocaleString() : result.entryPrice}
                </p>
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
                  {typeof result.takeProfit === "number" ? result.takeProfit.toLocaleString() : result.takeProfit}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-300">Stop loss</span>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {typeof result.stopLoss === "number" ? result.stopLoss.toLocaleString() : result.stopLoss}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xl">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Chart: {CHART_SYMBOL}
            </span>
          </div>
          <div className="w-full h-[500px] min-h-[400px] p-2">
            <TradingViewRoomTrading
              symbol={CHART_SYMBOL}
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
