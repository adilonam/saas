"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ChurnRateCalculatorPage() {
  const [startCustomers, setStartCustomers] = useState("");
  const [endCustomers, setEndCustomers] = useState("");
  const [newCustomers, setNewCustomers] = useState("");

  const result = useMemo(() => {
    const start = parseFloat(startCustomers) || 0;
    const end = parseFloat(endCustomers) || 0;
    const newC = parseFloat(newCustomers) || 0;
    if (start <= 0) return null;
    const churned = start + newC - end;
    const churnRate = churned > 0 ? (churned / start) * 100 : 0;
    return {
      churned: Math.max(0, churned),
      churnRate,
      start,
      end,
      newCustomers: newC,
    };
  }, [startCustomers, endCustomers, newCustomers]);

  return (
    <DashboardLayout>
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
              Calculate customer churn rate and retention metrics
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
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                <p>Start: {result.start} → End: {result.end} (New: +{result.newCustomers})</p>
              </div>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How to Calculate Churn Rate</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Churn rate measures the percentage of customers who stop using your product or service during a specific period. It's a critical metric for subscription businesses, SaaS companies, gyms, and any business with recurring customers.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Formula</h3>
          <p className="text-slate-600 dark:text-slate-300">
            The standard churn rate formula is:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Churned Customers = (Start + New) - End<br/>
            Churn Rate = (Churned Customers / Customers at Start) × 100
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: SaaS Subscription</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Monthly SaaS Churn</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Start of month:</strong> 500 customers</li>
              <li><strong>New customers:</strong> 80 acquired</li>
              <li><strong>End of month:</strong> 520 customers</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p><strong>Calculation:</strong></p>
              <p>Churned = (500 + 80) - 520 = 60 customers lost</p>
              <p>Churn Rate = (60 / 500) × 100 = <strong>12% monthly churn</strong></p>
              <p>Retention Rate = 100% - 12% = <strong>88% retained</strong></p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Worked Example: Gym Membership</h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Example: Quarterly Gym Churn</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Start of quarter:</strong> 1,200 members</li>
              <li><strong>New signups:</strong> 200 members</li>
              <li><strong>End of quarter:</strong> 1,350 members</li>
            </ul>
            <div className="mt-3 space-y-1 text-slate-700 dark:text-slate-300">
              <p><strong>Calculation:</strong></p>
              <p>Churned = (1,200 + 200) - 1,350 = 50 members lost</p>
              <p>Churn Rate = (50 / 1,200) × 100 = <strong>4.17% quarterly churn</strong></p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">What's a Good Churn Rate?</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Acceptable churn varies significantly by industry, contract length, and customer type. Rather than comparing to generic benchmarks, track your churn against your own historical cohorts and consult published research specific to your industry and business model.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <strong>Key factors that affect churn:</strong>
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Contract length:</strong> Annual contracts typically have lower churn than monthly</li>
            <li><strong>Customer type:</strong> Enterprise/B2B generally has lower churn than consumer/B2C</li>
            <li><strong>Market maturity:</strong> Early-stage products typically have higher churn while finding product-market fit</li>
            <li><strong>Price point:</strong> Higher-priced products often have different churn patterns</li>
            <li><strong>Switching costs:</strong> Deeper integration = harder to leave = lower churn</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Why Churn Rate Matters</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li><strong>Revenue Impact:</strong> High churn directly reduces recurring revenue and growth</li>
            <li><strong>Customer Acquisition Cost:</strong> Acquiring new customers is significantly more expensive than retaining existing ones</li>
            <li><strong>Growth Sustainability:</strong> You must acquire enough new customers to offset churn and achieve net growth</li>
            <li><strong>Product Quality Signal:</strong> Rising churn indicates product-market fit issues or service problems</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Should I calculate churn rate monthly, quarterly, or annually?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                It depends on your business model. SaaS and subscription services typically track monthly churn for quick feedback. B2B companies often use annual churn. Use the period that matches your billing cycle and allows for actionable insights.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What's the difference between customer churn and revenue churn?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Customer churn counts the number of customers lost. Revenue churn (also called MRR churn) measures the revenue lost. If high-value customers churn, revenue churn will be worse than customer churn. Both metrics are important.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                How can I reduce customer churn?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Common strategies include: improving onboarding, providing excellent customer support, regularly engaging customers, adding value through new features, offering retention incentives, identifying at-risk customers early, and gathering exit feedback to fix root causes.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                Is negative churn possible?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Yes, in revenue terms! Negative churn occurs when expansion revenue from existing customers (upgrades, upsells) exceeds the revenue lost from churned customers. This is a strong indicator of product-market fit and sustainable growth.
              </p>
            </details>

            <details className="group bg-slate-50 dark:bg-slate-900/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="font-semibold cursor-pointer text-slate-900 dark:text-white">
                What's the relationship between churn rate and customer lifetime value?
              </summary>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Lower churn means longer customer lifetimes and higher lifetime value (LTV). Customer lifetime = 1 / churn rate. For example, 5% monthly churn means average customer lifetime is 20 months (1 / 0.05).
              </p>
            </details>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/ltv-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Customer Lifetime Value Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate LTV and customer profitability
              </p>
            </Link>
            <Link
              href="/cac-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Customer Acquisition Cost Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calculate how much it costs to acquire each customer
              </p>
            </Link>
            <Link
              href="/ltv-cac-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">LTV:CAC Ratio Calculator</h3>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
