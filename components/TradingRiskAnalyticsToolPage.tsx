"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CalculatorIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TRADING_RISK_TOOLS } from "@/lib/trading-risk-tools";

type FormState = Record<string, string>;

function parsePercent(value: string): number {
  return (parseFloat(value) || 0) / 100;
}

function parseNumberList(value: string): number[] {
  return value
    .split(/[,\s]+/)
    .map((part) => parseFloat(part.trim()))
    .filter((n) => Number.isFinite(n));
}

function parseNamedWeightLines(value: string): Array<{ name: string; weight: number }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, raw] = line.split(":");
      return { name: (name || "Unknown").trim(), weight: parseFloat((raw || "0").trim()) || 0 };
    });
}

function zScore(confidence: number): number {
  if (confidence >= 99) return 2.326;
  if (confidence >= 97.5) return 1.96;
  if (confidence >= 95) return 1.645;
  if (confidence >= 90) return 1.282;
  return 1.0;
}

function safePct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

type TradingRiskAnalyticsToolPageProps = {
  /** When the route is a static segment (e.g. `/var-calculator`), pass the slug; otherwise `[tool]` params are used. */
  slug?: string;
};

export default function TradingRiskAnalyticsToolPage({ slug: slugProp }: TradingRiskAnalyticsToolPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tool?: string }>();
  const { data: session, status } = useSession();
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const segment = slugProp ?? (typeof params?.tool === "string" ? params.tool : "");
  const tool = TRADING_RISK_TOOLS.find((item) => item.slug === segment);

  const [form, setForm] = useState<FormState>({});

  const result = useMemo(() => {
    if (!tool) return null;

    switch (tool.slug) {
      case "portfolio-risk-heatmap": {
        const weights = parseNumberList(form.weights || "");
        const vols = parseNumberList(form.vols || "");
        const len = Math.min(weights.length, vols.length);
        if (len === 0) return null;
        const rows = Array.from({ length: len }).map((_, i) => {
          const score = (weights[i] / 100) * (vols[i] / 100);
          return { asset: `Asset ${i + 1}`, score };
        });
        const total = rows.reduce((sum, row) => sum + row.score, 0);
        return rows.map((row) => `${row.asset}: ${safePct(total > 0 ? row.score / total : 0)} of risk`).join("\n");
      }
      case "correlation-matrix-tool": {
        const series = (form.returns || "")
          .split("\n")
          .map((line) => parseNumberList(line))
          .filter((arr) => arr.length > 1);
        if (series.length < 2) return null;
        const n = series.length;
        const matrix: string[] = [];
        for (let i = 0; i < n; i += 1) {
          const row: string[] = [];
          for (let j = 0; j < n; j += 1) {
            row.push(correlation(series[i], series[j]).toFixed(2));
          }
          matrix.push(row.join("  "));
        }
        return `Correlation matrix:\n${matrix.join("\n")}`;
      }
      case "beta-exposure-calculator": {
        const values = parseNumberList(form.values || "");
        const betas = parseNumberList(form.betas || "");
        const len = Math.min(values.length, betas.length);
        if (len === 0) return null;
        let totalValue = 0;
        let weightedBeta = 0;
        for (let i = 0; i < len; i += 1) {
          totalValue += values[i];
          weightedBeta += values[i] * betas[i];
        }
        const beta = totalValue > 0 ? weightedBeta / totalValue : 0;
        return `Portfolio beta: ${beta.toFixed(3)}`;
      }
      case "sector-exposure-analyzer":
      case "currency-exposure-analyzer": {
        const rows = parseNamedWeightLines(
          tool.slug === "sector-exposure-analyzer" ? form.sectorWeights || "" : form.currencyWeights || "",
        );
        if (!rows.length) return null;
        const total = rows.reduce((sum, row) => sum + row.weight, 0);
        const max = Math.max(...rows.map((row) => row.weight));
        const top = rows.find((row) => row.weight === max);
        return [
          ...rows.map((row) => `${row.name}: ${row.weight.toFixed(2)}%`),
          `Total allocation: ${total.toFixed(2)}%`,
          `Top concentration: ${top?.name || "N/A"} (${max.toFixed(2)}%)`,
        ].join("\n");
      }
      case "concentration-risk-analyzer": {
        const weights = parseNumberList(form.positionWeights || "").map((n) => n / 100);
        if (!weights.length) return null;
        const hhi = weights.reduce((sum, w) => sum + w * w, 0);
        const maxWeight = Math.max(...weights);
        return `HHI: ${hhi.toFixed(4)}\nLargest position: ${(maxWeight * 100).toFixed(2)}%`;
      }
      case "var-calculator":
      case "expected-shortfall-calculator": {
        const portfolioValue = parseFloat(form.portfolioValue || "0") || 0;
        const dailyVol = parsePercent(form.dailyVol || "0");
        const confidence = parseFloat(form.confidence || "95") || 95;
        const days = parseFloat(form.days || "1") || 1;
        if (portfolioValue <= 0 || dailyVol <= 0 || days <= 0) return null;
        const z = zScore(confidence);
        const horizonVol = dailyVol * Math.sqrt(days);
        const varValue = portfolioValue * z * horizonVol;
        if (tool.slug === "var-calculator") {
          return `${confidence.toFixed(1)}% VaR (${days.toFixed(0)}d): ${varValue.toFixed(2)}`;
        }
        const alpha = 1 - confidence / 100;
        const esMultiplier = alpha > 0 ? z / alpha : z;
        const esValue = portfolioValue * horizonVol * esMultiplier * 0.01;
        return `${confidence.toFixed(1)}% Expected Shortfall: ${esValue.toFixed(2)}`;
      }
      case "monte-carlo-equity-simulator": {
        const starting = parseFloat(form.startingEquity || "0") || 0;
        const mean = parsePercent(form.meanTradeReturn || "0");
        const vol = parsePercent(form.tradeVol || "0");
        const trades = parseInt(form.trades || "0", 10) || 0;
        if (starting <= 0 || trades <= 0) return null;
        const expectedEnding = starting * Math.pow(1 + mean, trades);
        const oneSigmaBand = expectedEnding * vol * Math.sqrt(trades);
        return `Expected ending equity: ${expectedEnding.toFixed(2)}\n1σ range: ${(expectedEnding - oneSigmaBand).toFixed(2)} to ${(expectedEnding + oneSigmaBand).toFixed(2)}`;
      }
      case "equity-curve-analyzer": {
        const curve = parseNumberList(form.equitySeries || "");
        if (curve.length < 2) return null;
        let peak = curve[0];
        let maxDrawdown = 0;
        for (const point of curve) {
          peak = Math.max(peak, point);
          const dd = peak > 0 ? (peak - point) / peak : 0;
          maxDrawdown = Math.max(maxDrawdown, dd);
        }
        const totalReturn = (curve[curve.length - 1] - curve[0]) / curve[0];
        return `Total return: ${safePct(totalReturn)}\nMax drawdown: ${safePct(maxDrawdown)}`;
      }
      case "streak-probability-calculator":
      case "win-loss-streak-risk-estimator": {
        const winRate = parsePercent(form.winRate || "0");
        const trades = parseInt(form.trades || "0", 10) || 0;
        const streakLength =
          parseInt(
            tool.slug === "streak-probability-calculator"
              ? form.streakLength || "0"
              : form.lossStreakLength || "0",
            10,
          ) || 0;
        if (trades <= 0 || streakLength <= 0) return null;
        const p = tool.slug === "streak-probability-calculator" ? winRate : 1 - winRate;
        const windows = Math.max(0, trades - streakLength + 1);
        const approx = 1 - Math.pow(1 - Math.pow(p, streakLength), windows);
        return `Probability of at least one ${streakLength}-trade ${
          tool.slug === "streak-probability-calculator" ? "win" : "loss"
        } streak: ${safePct(approx)}`;
      }
      case "risk-of-ruin-calculator": {
        const winRate = parsePercent(form.winRate || "0");
        const rewardRisk = parseFloat(form.rewardRisk || "0") || 0;
        const riskPerTrade = parsePercent(form.riskPerTrade || "0");
        const ruinThreshold = parsePercent(form.ruinThreshold || "0");
        if (rewardRisk <= 0 || riskPerTrade <= 0 || ruinThreshold <= 0) return null;
        const expectancy = winRate * rewardRisk - (1 - winRate);
        const edgeRatio = expectancy / Math.max(riskPerTrade, 0.0001);
        const roughRuin = Math.exp(-2 * Math.max(edgeRatio, 0.0001) * (ruinThreshold / riskPerTrade));
        return `Approximate risk of ruin: ${safePct(Math.min(1, roughRuin))}`;
      }
      case "expectancy-calculator": {
        const winRate = parsePercent(form.winRate || "0");
        const avgWin = parseFloat(form.avgWin || "0") || 0;
        const avgLoss = parseFloat(form.avgLoss || "0") || 0;
        if (avgWin <= 0 || avgLoss <= 0) return null;
        const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
        return `Expectancy per trade: ${expectancy.toFixed(4)}`;
      }
      case "profit-factor-calculator": {
        const grossProfit = parseFloat(form.grossProfit || "0") || 0;
        const grossLoss = parseFloat(form.grossLoss || "0") || 0;
        if (grossProfit <= 0 || grossLoss <= 0) return null;
        return `Profit factor: ${(grossProfit / grossLoss).toFixed(3)}`;
      }
      case "sharpe-ratio-calculator": {
        const ret = parsePercent(form.portfolioReturn || "0");
        const rf = parsePercent(form.riskFreeRate || "0");
        const vol = parsePercent(form.volatility || "0");
        if (vol <= 0) return null;
        return `Sharpe ratio: ${((ret - rf) / vol).toFixed(3)}`;
      }
      case "sortino-ratio-calculator": {
        const ret = parsePercent(form.portfolioReturn || "0");
        const target = parsePercent(form.targetReturn || "0");
        const downside = parsePercent(form.downsideDeviation || "0");
        if (downside <= 0) return null;
        return `Sortino ratio: ${((ret - target) / downside).toFixed(3)}`;
      }
      default:
        return null;
    }
  }, [form, tool]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt && new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  if (!tool) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto rounded-2xl border border-amber-300/70 bg-amber-50 dark:bg-amber-900/20 p-6">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
            <ExclamationTriangleIcon className="size-6" />
            <p className="font-semibold">Tool not found.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tool.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{tool.description}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {tool.fields.map((field) => {
            const isLong = field.placeholder.includes("\n");
            return (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {isLong ? (
                  <textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type="text"
                    min={field.min}
                    step={field.step}
                    placeholder={field.placeholder}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="rounded-xl h-11"
                  />
                )}
              </div>
            );
          })}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={!result} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Result</p>
              <pre className="text-sm leading-6 whitespace-pre-wrap text-slate-900 dark:text-white font-medium">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function correlation(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len < 2) return 0;
  const xa = a.slice(0, len);
  const xb = b.slice(0, len);
  const meanA = xa.reduce((sum, x) => sum + x, 0) / len;
  const meanB = xb.reduce((sum, x) => sum + x, 0) / len;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < len; i += 1) {
    const da = xa[i] - meanA;
    const db = xb[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA <= 0 || varB <= 0) return 0;
  return cov / Math.sqrt(varA * varB);
}
