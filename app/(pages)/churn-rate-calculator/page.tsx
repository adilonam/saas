"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "How do I use this churn rate calculator?",
    a: "Enter customers (or members) at the start of the period, at the end, and how many new customers you acquired. The calculator estimates customers lost and churn rate as a percentage of the starting base. Optionally add average revenue per customer to estimate churn impact (revenue lost).",
  },
  {
    q: "What is a gym churn rate calculator?",
    a: "It is the same membership churn math: start members, end members, and new signups in the period. Churned = (start + new) − end; churn rate = churned ÷ start × 100. Use monthly or quarterly periods that match how you report membership.",
  },
  {
    q: "What is a churn impact calculator?",
    a: "Churn impact estimates revenue lost from customers who left. A simple approach is churned customers × average revenue per customer for the period (for example monthly dues). This tool’s optional ARPU field does that arithmetic so you can discuss retention in money terms as well as headcount.",
  },
  {
    q: "Should I calculate churn monthly, quarterly, or annually?",
    a: "Match your billing and reporting cycle. Many SaaS and gym memberships track monthly churn for faster feedback; annual contracts often report annual churn. Keep the period consistent when comparing over time.",
  },
  {
    q: "What's the difference between customer churn and revenue churn?",
    a: "Customer churn counts accounts or members lost. Revenue churn measures recurring revenue lost. If higher-paying customers leave, revenue churn can look worse than customer churn. Track both when pricing tiers differ.",
  },
  {
    q: "Is this churn calculator free?",
    a: "Yes. It runs in your browser with no signup or payment.",
  },
];

export default function ChurnRateCalculatorPage() {
  const [startCustomers, setStartCustomers] = useState("");
  const [endCustomers, setEndCustomers] = useState("");
  const [newCustomers, setNewCustomers] = useState("");
  const [arpu, setArpu] = useState("");

  const result = useMemo(() => {
    const start = parseFloat(startCustomers) || 0;
    const end = parseFloat(endCustomers) || 0;
    const newC = parseFloat(newCustomers) || 0;
    const avgRevenue = parseFloat(arpu) || 0;
    if (start <= 0) return null;
    const churned = start + newC - end;
    const churnRate = churned > 0 ? (churned / start) * 100 : 0;
    const revenueLost =
      churned > 0 && avgRevenue > 0 ? Math.max(0, churned) * avgRevenue : null;
    return {
      churned: Math.max(0, churned),
      churnRate,
      start,
      end,
      newCustomers: newC,
      revenueLost,
      avgRevenue,
    };
  }, [startCustomers, endCustomers, newCustomers, arpu]);

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
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ChartPieIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Churn Rate Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free churn calculator — customer or gym membership churn, plus optional revenue impact
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start">Customers at period start</Label>
              <Input
                id="start"
                type="number"
                min="0"
                step="1"
                placeholder="500"
                value={startCustomers}
                onChange={(e) => setStartCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Customers at period end</Label>
              <Input
                id="end"
                type="number"
                min="0"
                step="1"
                placeholder="520"
                value={endCustomers}
                onChange={(e) => setEndCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New customers in period</Label>
              <Input
                id="new"
                type="number"
                min="0"
                step="1"
                placeholder="80"
                value={newCustomers}
                onChange={(e) => setNewCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="arpu">
              Avg revenue per customer (optional, for churn impact)
            </Label>
            <Input
              id="arpu"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 49"
              value={arpu}
              onChange={(e) => setArpu(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use the same currency and period as your reporting (for example monthly dues).
            </p>
          </div>

          {result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Churn (customers lost)
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.churned.toFixed(0)} customers
              </p>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                Churn rate: {result.churnRate.toFixed(2)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Retention rate: {(100 - result.churnRate).toFixed(2)}%
              </p>
              {result.revenueLost !== null && (
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Estimated churn impact (revenue lost):{" "}
                  {result.revenueLost.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    ({result.churned.toFixed(0)} × {result.avgRevenue})
                  </span>
                </p>
              )}
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                <p>
                  Start: {result.start} → End: {result.end} (New: +{result.newCustomers})
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Calculate Churn Rate</h2>
          <p className="text-slate-600 dark:text-slate-300">
            This free <strong>churn rate calculator</strong> (churn calculator) measures the
            percentage of customers or members who stop during a period. It suits subscription
            businesses, SaaS, gyms, and other recurring memberships.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Formula</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4 not-prose">
            Churned Customers = (Start + New) − End
            <br />
            Churn Rate = (Churned Customers / Customers at Start) × 100
            <br />
            Churn Impact (optional) = Churned × Avg revenue per customer
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            Worked Example: SaaS Subscription (illustrative)
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">Example: Monthly SaaS churn</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Start of month:</strong> 500 customers
              </li>
              <li>
                <strong>New customers:</strong> 80 acquired
              </li>
              <li>
                <strong>End of month:</strong> 520 customers
              </li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Calculation:</strong>
              </p>
              <p>Churned = (500 + 80) − 520 = 60 customers lost</p>
              <p>
                Churn Rate = (60 / 500) × 100 = <strong>12% monthly churn</strong>
              </p>
              <p>
                Retention Rate = 100% − 12% = <strong>88% retained</strong>
              </p>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Illustrative example only—not a benchmark for any industry.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            Gym / Membership Churn Rate
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            For gyms and clubs, treat “customers” as active members. Use the same formula with
            period start members, end members, and new signups (a gym churn rate calculator is
            just membership churn math). Cancelled or frozen memberships that leave your active
            base count as churned for that period.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2">
              Illustrative example: Quarterly gym membership churn
            </p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Start of quarter:</strong> 1,200 members
              </li>
              <li>
                <strong>New signups:</strong> 200 members
              </li>
              <li>
                <strong>End of quarter:</strong> 1,350 members
              </li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p>Churned = (1,200 + 200) − 1,350 = 50 members lost</p>
              <p>
                Churn Rate = (50 / 1,200) × 100 = <strong>4.17% quarterly churn</strong>
              </p>
              <p>
                If average dues were 40 per month, a simple impact estimate for those 50 members
                over one month would be 50 × 40 = 2,000 (illustrative currency units).
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            Churn Impact (Revenue Lost)
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            A basic <strong>churn impact calculator</strong> multiplies customers lost by average
            revenue per customer (ARPU) for the period. That turns a percentage into a money
            conversation for finance and retention planning. It is a starting estimate—it does
            not model upgrades, downgrades, or expansion revenue. For lifetime value after churn
            assumptions, use the{" "}
            <Link href="/ltv-calculator">LTV calculator</Link>.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">What&apos;s a Good Churn Rate?</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Acceptable churn varies by industry, contract length, and customer type. Rather than
            comparing to generic benchmarks, track your churn against your own historical cohorts
            and consult published research specific to your industry and business model.
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Contract length:</strong> Annual contracts typically have lower period churn
              than monthly
            </li>
            <li>
              <strong>Customer type:</strong> Enterprise/B2B often differs from consumer/B2C
            </li>
            <li>
              <strong>Market maturity:</strong> Early products often see higher churn while finding
              fit
            </li>
            <li>
              <strong>Switching costs:</strong> Deeper integration usually means harder to leave
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Why Churn Rate Matters</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              <strong>Revenue impact:</strong> Lost customers reduce recurring revenue unless
              replaced
            </li>
            <li>
              <strong>Acquisition pressure:</strong> New customers must cover churn before net
              growth
            </li>
            <li>
              <strong>Product signal:</strong> Rising churn can flag onboarding or service issues
            </li>
          </ul>
        </div>

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

        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools &amp; Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/ltv-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Customer Lifetime Value Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate LTV and customer profitability
              </p>
            </Link>
            <Link
              href="/cac-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Customer Acquisition Cost Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate how much it costs to acquire each customer
              </p>
            </Link>
            <Link
              href="/ltv-cac-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                LTV:CAC Ratio Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Measure customer acquisition efficiency
              </p>
            </Link>
            <Link
              href="/mrr-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">MRR Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate monthly recurring revenue metrics
              </p>
            </Link>
            <a
              href="/blog/how-to-calculate-churn-rate"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50 sm:col-span-2"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Guide: How to Calculate Churn Rate
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Formula, worked examples, and retention tips
              </p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
