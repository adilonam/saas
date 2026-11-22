"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function LeverageMarginCalculatorPage() {
  const [positionSize, setPositionSize] = useState("");
  const [leverage, setLeverage] = useState("10");
  const [entryPrice, setEntryPrice] = useState("");

  const result = useMemo(() => {
    const size = parseFloat(positionSize) || 0;
    const lev = parseFloat(leverage) || 1;
    const price = parseFloat(entryPrice) || 0;

    if (size <= 0 || lev <= 0) return null;

    const totalValue = price > 0 ? size * price : size;
    const requiredMargin = totalValue / lev;
    const marginPercent = (1 / lev) * 100;

    return {
      totalValue,
      requiredMargin,
      marginPercent,
      leverage: lev,
    };
  }, [positionSize, leverage, entryPrice]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Leverage & Margin Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculate required margin for leveraged trading positions
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="position">Position Size</Label>
              <Input
                id="position"
                type="number"
                min="0"
                step="0.01"
                placeholder="10000"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-slate-500">Units or base currency</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leverage">Leverage</Label>
              <Input
                id="leverage"
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={leverage}
                onChange={(e) => setLeverage(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-slate-500">e.g., 10 for 10:1</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Entry Price (optional)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="50000"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-slate-500">Price per unit</p>
            </div>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Required Margin</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${result.requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {result.marginPercent.toFixed(2)}% of position value
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Position Value</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    ${result.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Leverage Ratio</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {result.leverage}:1
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Calculate Leverage and Margin</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Leverage allows traders to control larger positions with less capital. Margin is the amount of money you need to deposit to open and maintain a leveraged position. Understanding this relationship is crucial for risk management in trading.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Formula</h3>
          <p className="text-slate-600 dark:text-slate-300">
            The margin calculation is straightforward:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 space-y-2">
            <div>Required Margin = Position Value / Leverage</div>
            <div>Margin % = (1 / Leverage) × 100</div>
            <div>Position Value = Position Size × Entry Price</div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: Crypto Trading</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Bitcoin Position with 10:1 Leverage</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Position Size:</strong> 1 BTC</li>
              <li><strong>Entry Price:</strong> $50,000</li>
              <li><strong>Leverage:</strong> 10:1</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p><strong>Calculation:</strong></p>
              <p>Position Value = 1 × $50,000 = $50,000</p>
              <p>Required Margin = $50,000 / 10 = <strong>$5,000</strong></p>
              <p>Margin % = (1 / 10) × 100 = <strong>10%</strong></p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              You can control a $50,000 position with just $5,000 in margin. However, both profits and losses are magnified by 10×.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: Forex Trading</h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: EUR/USD with 50:1 Leverage</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Position Size:</strong> 100,000 EUR (1 standard lot)</li>
              <li><strong>Entry Price:</strong> 1.1000 USD</li>
              <li><strong>Leverage:</strong> 50:1</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p><strong>Calculation:</strong></p>
              <p>Position Value = 100,000 × 1.10 = $110,000</p>
              <p>Required Margin = $110,000 / 50 = <strong>$2,200</strong></p>
              <p>Margin % = (1 / 50) × 100 = <strong>2%</strong></p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Forex typically offers higher leverage than crypto. While this increases profit potential, it also significantly increases risk.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Understanding Leverage (Hebelwirkung / Hefboom)</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Leverage (German: Hebelwirkung, Dutch: Hefboom) amplifies both gains and losses. For international traders: the calculation works the same in all markets and currencies—simply convert your position value to your account currency and divide by leverage to find required margin.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Leverage Varies by Market and Jurisdiction</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Available leverage depends on your market, jurisdiction, broker, and account type. Different markets and regulatory regimes impose different limits:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Forex:</strong> Varies widely by jurisdiction; retail often lower than professional accounts</li>
            <li><strong>Crypto:</strong> Ranges from conservative to very high depending on exchange and local regulations</li>
            <li><strong>Stocks (Margin):</strong> Typically lower leverage with specific regulatory requirements</li>
            <li><strong>Futures:</strong> Moderate leverage levels depending on contract type</li>
            <li><strong>CFDs:</strong> Varies by asset class, broker, and regulatory framework</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 mt-4">
            Always check your broker's specific offerings and your local regulations before trading.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Risk Warning</h3>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4 my-4">
            <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">⚠️ Important Risk Considerations</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-sm">
              <li>Higher leverage = Higher risk of liquidation</li>
              <li>You can lose more than your initial margin in volatile markets</li>
              <li>Leverage does not increase the probability of profit—only the magnitude</li>
              <li>Always use stop losses when trading with leverage</li>
              <li>Start with lower leverage (2:1 to 5:1) until you understand the risks</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What is the difference between leverage and margin?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Leverage is the ratio of your position size to your capital (e.g., 10:1). Margin is the actual amount of money you need to deposit. They're inversely related: higher leverage means lower margin requirement.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What happens if my position goes against me?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                If losses reduce your account below the maintenance margin level, you'll receive a margin call. If you don't add funds or close positions, your broker will liquidate your position to prevent further losses.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What leverage should beginners use?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Beginners should start with low leverage (2:1 to 5:1) or no leverage at all. This reduces risk while you learn market behavior and risk management. Avoid maximum leverage offerings from brokers.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Is leverage trading legal everywhere?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Leverage limits vary significantly by jurisdiction. Different regions have different retail and professional leverage caps for forex, crypto, and other markets. Regulations are also evolving, particularly for crypto leverage. Always check your local regulations and your broker's compliance requirements before trading.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How do I calculate leverage if I know my margin?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                If you know your margin and position value, leverage = position value / margin. For example, a $10,000 position with $2,000 margin = 5:1 leverage.
              </p>
            </details>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/position-size-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Position Size Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate optimal position size based on risk tolerance
              </p>
            </Link>
            <Link
              href="/risk-reward-ratio-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Risk/Reward Ratio Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate risk/reward ratio for trades
              </p>
            </Link>
            <Link
              href="/forex-position-size-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Forex Position Size Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate lot size for forex trading
              </p>
            </Link>
            <Link
              href="/risk-per-trade-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Risk Per Trade Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate how much to risk per trade
              </p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
