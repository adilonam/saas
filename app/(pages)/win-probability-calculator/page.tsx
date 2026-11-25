"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type Mode = "pwin" | "record" | "odds";

type FactorKey =
  | "relationship"
  | "solutionFit"
  | "price"
  | "pastPerformance"
  | "competition"
  | "incumbent";

interface FactorDef {
  key: FactorKey;
  label: string;
  hint: string;
  defaultWeight: number;
  defaultScore: number;
}

const PWIN_FACTORS: FactorDef[] = [
  {
    key: "relationship",
    label: "Customer relationship",
    hint: "Access to decision-makers, trust, and engagement quality",
    defaultWeight: 20,
    defaultScore: 3,
  },
  {
    key: "solutionFit",
    label: "Solution fit",
    hint: "How well your offering matches stated requirements",
    defaultWeight: 25,
    defaultScore: 3,
  },
  {
    key: "price",
    label: "Price competitiveness",
    hint: "Competitiveness of price vs value and likely alternatives",
    defaultWeight: 15,
    defaultScore: 3,
  },
  {
    key: "pastPerformance",
    label: "Past performance",
    hint: "Relevant delivery history, references, and proof points",
    defaultWeight: 15,
    defaultScore: 3,
  },
  {
    key: "competition",
    label: "Competitive position",
    hint: "Strength vs known or expected competitors (higher = stronger for you)",
    defaultWeight: 15,
    defaultScore: 3,
  },
  {
    key: "incumbent",
    label: "Incumbent / switching status",
    hint: "Whether you are incumbent or switching cost favors you (higher = better for you)",
    defaultWeight: 10,
    defaultScore: 3,
  },
];

const FAQ_ITEMS = [
  {
    q: "What is pWin (probability of win)?",
    a: "pWin is a capture-management estimate of how likely your team is to win a specific bid or proposal. It is usually a subjective, weighted assessment—not a historical win rate from a sports record or bookmaker odds.",
  },
  {
    q: "How does this pWin calculator work?",
    a: "You rate each factor on a 1–5 scale and assign weights that sum toward 100%. The tool computes a weighted average of (score ÷ 5), then expresses that as a percentage. The result is a transparent subjective estimate you can discuss with your team.",
  },
  {
    q: "Is the pWin percentage a statistical forecast?",
    a: "No. It reflects your scores and weights only. Different teams can rate the same opportunity differently. Use it for bid/no-bid discussion and pipeline hygiene—not as a guaranteed prediction.",
  },
  {
    q: "What is the difference between pWin, win rate, and implied odds?",
    a: "pWin (proposal mode) is a factor scorecard for a single opportunity. Win rate from record is wins ÷ (wins + losses) over past outcomes. Implied probability from decimal odds is 1 ÷ odds (common in sports betting markets).",
  },
  {
    q: "Should weights always add up to 100%?",
    a: "Yes for a clean interpretation. This calculator normalizes by the total weight you enter, so uneven totals still produce a result—but keeping weights near 100% makes reviews easier for your team.",
  },
];

export default function WinProbabilityCalculatorPage() {
  const [mode, setMode] = useState<Mode>("pwin");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [decimalOdds, setDecimalOdds] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const [scores, setScores] = useState<Record<FactorKey, number>>(() =>
    Object.fromEntries(PWIN_FACTORS.map((f) => [f.key, f.defaultScore])) as Record<
      FactorKey,
      number
    >
  );
  const [weights, setWeights] = useState<Record<FactorKey, number>>(() =>
    Object.fromEntries(PWIN_FACTORS.map((f) => [f.key, f.defaultWeight])) as Record<
      FactorKey,
      number
    >
  );

  const handleCalculate = () => {
    setResultUnlocked(true);
  };

  const pwinResult = useMemo(() => {
    let totalWeight = 0;
    let weightedScore = 0;
    for (const f of PWIN_FACTORS) {
      const w = Math.max(0, weights[f.key] || 0);
      const s = Math.min(5, Math.max(1, scores[f.key] || 1));
      totalWeight += w;
      weightedScore += w * (s / 5);
    }
    if (totalWeight <= 0) return null;
    const pwin = (weightedScore / totalWeight) * 100;
    return { pwin, totalWeight };
  }, [scores, weights]);

  const result = useMemo(() => {
    if (mode === "pwin") {
      if (!pwinResult) return null;
      return { type: "pwin" as const, ...pwinResult };
    }
    if (mode === "record") {
      const w = parseInt(wins, 10) || 0;
      const l = parseInt(losses, 10) || 0;
      const total = w + l;
      if (total <= 0) return null;
      const winRate = (w / total) * 100;
      return { type: "record" as const, winRate, wins: w, losses: l, total };
    }
    const odds = parseFloat(decimalOdds) || 0;
    if (odds <= 0) return null;
    const impliedProb = (1 / odds) * 100;
    return { type: "odds" as const, impliedProb, decimalOdds: odds };
  }, [mode, wins, losses, decimalOdds, pwinResult]);

  const calculateDisabled =
    (mode === "pwin" && !pwinResult) ||
    (mode === "record" &&
      (!wins || !losses || parseInt(wins, 10) + parseInt(losses, 10) <= 0)) ||
    (mode === "odds" && (!decimalOdds || parseFloat(decimalOdds) <= 0));

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
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              pWin Calculator – Win Probability for Bids &amp; Records
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Free pWin calculator for proposals, plus win rate from a W/L record and implied
              probability from decimal odds. No signup.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              { id: "pwin" as const, label: "Proposal / bid pWin" },
              { id: "record" as const, label: "From record" },
              { id: "odds" as const, label: "From decimal odds" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setResultUnlocked(false);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === tab.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {mode === "pwin" && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Rate each capture factor from 1 (weak) to 5 (strong). Adjust weights to match how
                your organization scores opportunities. The result is a{" "}
                <strong>subjective estimate</strong>, not a statistical forecast.
              </p>
              <div className="space-y-5">
                {PWIN_FACTORS.map((f) => (
                  <div
                    key={f.key}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="sm:col-span-5">
                      <Label htmlFor={`score-${f.key}`}>{f.label}</Label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.hint}</p>
                    </div>
                    <div className="sm:col-span-3 space-y-1">
                      <Label htmlFor={`score-${f.key}`} className="text-xs">
                        Score (1–5)
                      </Label>
                      <Input
                        id={`score-${f.key}`}
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        value={scores[f.key]}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [f.key]: Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 1)),
                          }))
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="sm:col-span-4 space-y-1">
                      <Label htmlFor={`weight-${f.key}`} className="text-xs">
                        Weight (%)
                      </Label>
                      <Input
                        id={`weight-${f.key}`}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={weights[f.key]}
                        onChange={(e) =>
                          setWeights((prev) => ({
                            ...prev,
                            [f.key]: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total weight:{" "}
                {PWIN_FACTORS.reduce((sum, f) => sum + (weights[f.key] || 0), 0).toFixed(0)}%
                (normalized automatically if not exactly 100)
              </p>
            </>
          )}

          {mode === "record" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="wins">Wins</Label>
                <Input
                  id="wins"
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="losses">Losses</Label>
                <Input
                  id="losses"
                  type="number"
                  min="0"
                  placeholder="e.g. 8"
                  value={losses}
                  onChange={(e) => setLosses(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </>
          )}

          {mode === "odds" && (
            <div className="space-y-2">
              <Label htmlFor="decimal-odds">Decimal odds</Label>
              <Input
                id="decimal-odds"
                type="number"
                min="1.01"
                step="0.01"
                placeholder="e.g. 2.50"
                value={decimalOdds}
                onChange={(e) => setDecimalOdds(e.target.value)}
                className="rounded-xl h-11"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Implied probability = 1 ÷ decimal odds
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={calculateDisabled} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {result.type === "pwin" && (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Estimated pWin
                    </p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {result.pwin.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Subjective weighted scorecard estimate (weights total{" "}
                    {result.totalWeight.toFixed(0)}%). Use for discussion—not as a guarantee.
                  </p>
                </>
              )}
              {result.type === "record" && (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Win rate</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {result.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.wins} W – {result.losses} L (total {result.total} games)
                  </p>
                </>
              )}
              {result.type === "odds" && (
                <>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Implied probability
                    </p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {result.impliedProb.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Decimal odds {result.decimalOdds.toFixed(2)}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">How This Win Probability / pWin Calculator Works</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Searchers looking for a <strong>pWin calculator</strong> usually want a proposal or bid
            probability of win—common in government and enterprise capture management. Others want a
            classic <strong>win probability calculator</strong> from a win/loss record or from
            decimal odds. This page supports all three.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Proposal / bid pWin (scorecard)</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Each factor score (1–5) is converted to a fraction of max (score ÷ 5), then combined with
            your weights:
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            pWin % = Σ (weightᵢ × scoreᵢ / 5) / Σ weightᵢ × 100
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Default factors include customer relationship, solution fit, price competitiveness, past
            performance, competitive position, and incumbent/switching status. Adjust weights to
            match your capture process.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Illustrative example</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4 not-prose">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">
              Example (illustrative only)
            </p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-sm">
              <li>Relationship 4/5 (weight 20) → 0.80 × 20</li>
              <li>Solution fit 5/5 (weight 25) → 1.00 × 25</li>
              <li>Price 3/5 (weight 15) → 0.60 × 15</li>
              <li>Past performance 4/5 (weight 15) → 0.80 × 15</li>
              <li>Competition 3/5 (weight 15) → 0.60 × 15</li>
              <li>Incumbent 2/5 (weight 10) → 0.40 × 10</li>
            </ul>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              Weighted sum = 16 + 25 + 9 + 12 + 9 + 4 = 75 →{" "}
              <strong>pWin ≈ 75%</strong> when weights total 100. This is a team judgment, not a
              measured historical rate.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Win rate from record</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Win rate % = wins ÷ (wins + losses) × 100
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Implied probability from decimal odds</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm my-4">
            Implied probability % = (1 ÷ decimal odds) × 100
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Example: decimal odds 2.00 → 50% implied probability. Bookmaker odds include margin, so
            market-implied probabilities across outcomes usually sum to more than 100%.
          </p>
        </div>

        {/* FAQ */}
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

        {/* Related tools */}
        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold mb-4">Related Tools &amp; Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/probability-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Probability Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                General probability calculations for events and combinations
              </p>
            </Link>
            <Link
              href="/roi-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">ROI Calculator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Estimate return on investment for proposals and projects
              </p>
            </Link>
            <Link
              href="/task-prioritizer"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Task Prioritizer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rank work when deciding which bids to pursue
              </p>
            </Link>
            <Link
              href="/risk-reward-ratio-calculator"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Risk/Reward Ratio Calculator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Compare upside vs downside on an opportunity
              </p>
            </Link>
            <a
              href="/blog/how-to-calculate-pwin-for-bids-and-proposals"
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800/50 sm:col-span-2"
            >
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Guide: How to Calculate pWin for Bids and Proposals
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Weighted scorecard method, illustrative example, and bid/no-bid tips
              </p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
