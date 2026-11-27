"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartBarIcon } from "@heroicons/react/24/outline";
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

  const FAQ_ITEMS = [
    {
      q: "How do I calculate leverage?",
      a: "Divide position value by the margin (capital) you post: Leverage = Position Value ÷ Margin. Example (illustrative): $20,000 position with $2,000 margin = 10:1 leverage. Or rearrange: Required Margin = Position Value ÷ Leverage.",
    },
    {
      q: "What is the difference between leverage ratio and margin?",
      a: "Leverage ratio (e.g. 10:1) describes how large the position is relative to your capital. Margin is the cash you must deposit. They are inverses: higher leverage means a lower margin percentage for the same position.",
    },
    {
      q: "How do I calculate leveraged profit or loss?",
      a: "Dollar P&L follows the full position (price change % × position value). Return on margin = P&L ÷ margin posted. Leverage magnifies percentage returns on your capital—not the chance of being right.",
    },
    {
      q: "Can I use this as a CFD or forex leverage calculator?",
      a: "Yes for a first-pass estimate: enter notional position value and leverage (or back into the ratio from margin). CFD and forex margin schedules differ by instrument and broker—confirm with your platform.",
    },
    {
      q: "Is this leverage calculator free?",
      a: "Yes. It runs in your browser with no signup or payment. Pair it with our position size and risk tools when sizing trades.",
    },
    {
      q: "What leverage should beginners use?",
      a: "Prefer low leverage (or none) until you size trades from risk limits rather than maximum buying power. Broker “up to” leverage is a product ceiling, not a recommendation.",
    },
  ];

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Leverage Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free leverage, margin &amp; position size calculator for forex, CFDs, and crypto. No signup.
            </p>
          </div>
        </div>

        <p className="mb-8 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
          Use this free <strong>leverage calculator</strong> to find required margin from position size and
          leverage, or to understand the leverage ratio behind a trade. For a full walkthrough of the
          formulas, see{" "}
          <a
            href="/blog/how-to-calculate-leverage-in-trading"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700"
          >
            how to calculate leverage in trading
          </a>
          .
        </p>

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
          <h2 className="text-2xl font-bold mb-4">How to Calculate Leverage</h2>
          <p className="text-slate-600 dark:text-slate-300">
            This free <strong>leverage calculator</strong> helps you convert between position size, leverage
            ratio, and required margin. Leverage lets you control a larger market position than the cash
            you post; margin is that cash deposit. The math is the same for forex, many CFDs, and crypto
            margin products—only broker rules and maximum ratios change.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Leverage Ratio vs Margin</h3>
          <p className="text-slate-600 dark:text-slate-300">
            <strong>Leverage ratio</strong> (for example 10:1) answers: how large is the position relative to
            my capital? <strong>Margin</strong> answers: how much cash must I deposit? They are inverses of
            each other for a given position:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 space-y-2 not-prose">
            <div>Leverage = Position Value / Margin</div>
            <div>Required Margin = Position Value / Leverage</div>
            <div>Margin % = (1 / Leverage) × 100</div>
            <div>Position Value = Position Size × Entry Price</div>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Enter position size and leverage above to see required margin. Optional entry price converts
            units × price into position value when you trade by quantity rather than notional currency.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: Crypto (illustrative)</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">Example: 1 unit at $50,000 with 10:1 leverage</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Position size:</strong> 1 unit</li>
              <li><strong>Entry price:</strong> $50,000</li>
              <li><strong>Leverage:</strong> 10:1</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>Position value = 1 × $50,000 = $50,000</p>
              <p>Required margin = $50,000 / 10 = <strong>$5,000</strong></p>
              <p>Margin % = 10%</p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Illustrative only. A 3% move on the position is about $1,500 of P&amp;L—roughly 30% of the
              $5,000 margin—before fees and funding.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: Forex (illustrative)</h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">Example: EUR/USD 1 standard lot at 50:1</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Position size:</strong> 100,000 EUR</li>
              <li><strong>Entry price:</strong> 1.1000 USD</li>
              <li><strong>Leverage:</strong> 50:1</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>Position value = 100,000 × 1.10 = $110,000</p>
              <p>Required margin = $110,000 / 50 = <strong>$2,200</strong></p>
              <p>Margin % = 2%</p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Illustrative only. Higher forex leverage reduces cash up front and shortens the distance to
              a margin call when price moves against you.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: CFD Leverage Ratio (illustrative)</h3>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">Example: Index CFD notional $8,000 at 20:1</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Notional CFD position:</strong> $8,000</li>
              <li><strong>Allowed leverage:</strong> 20:1</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>Required margin = $8,000 / 20 = <strong>$400</strong></p>
              <p>Or: leverage ratio = $8,000 / $400 = <strong>20:1</strong></p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              CFD leverage ratio calculators use the same margin formula; asset class and jurisdiction set
              the maximum ratio your broker allows.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Leverage Profit Calculator (Illustrative)</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 space-y-2">
            <div>P&amp;L = Position Value × Price Change %</div>
            <div>Return on Margin = P&amp;L / Required Margin</div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: 10:1 leverage, 2% favorable move</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Position value:</strong> $10,000</li>
              <li><strong>Margin at 10:1:</strong> $1,000</li>
              <li><strong>Price move:</strong> +2%</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>P&amp;L = $10,000 × 2% = <strong>$200</strong></p>
              <p>Return on margin = $200 / $1,000 = <strong>20%</strong></p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Illustrative only. A 2% adverse move would lose $200 (−20% on margin). Leverage does not change the dollar P&amp;L on the position—it changes how large that P&amp;L is relative to your capital.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Portfolio, CFD, and Options-Style Exposure</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Portfolio leverage:</strong> Total market exposure ÷ equity. Example: $40,000 exposure on $10,000 equity ≈ 4:1. Use the calculator with position value = exposure and leverage = exposure / equity (or enter leverage and read required margin as equity needed).</li>
            <li><strong>CFD leverage ratio:</strong> Same margin formula—notional CFD position ÷ posted margin. Asset class and broker rules set the maximum ratio.</li>
            <li><strong>Options leverage:</strong> Often thought of as notional controlled ÷ premium paid, but true risk depends on delta and time decay. This tool is a rough notional check, not a substitute for options Greeks.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Understanding Leverage (Hebelwirkung / Hefboom)</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Leverage (German: Hebelwirkung / Hebel; Dutch: hefboom) amplifies both gains and losses. The math is the same in any currency: convert position value to your account currency, then divide by leverage for required margin. We keep explanations in English rather than machine-translated pages so the formulas stay clear.
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
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                  {item.q}
                </summary>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools &amp; Guides</h2>
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
            <a
              href="/blog/how-to-calculate-leverage-in-trading"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors bg-white dark:bg-slate-800/50 sm:col-span-2"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Guide: How to Calculate Leverage</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Formulas, margin examples, CFD and portfolio leverage explained
              </p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
