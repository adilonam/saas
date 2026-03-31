export type AdsToolConfig = {
  slug: string;
  title: string;
  description: string;
  inputs: Array<{
    key: string;
    label: string;
    placeholder: string;
  }>;
  calculate: (values: Record<string, number>) => Array<{ label: string; value: string }>;
};

const pct = (v: number, digits = 2) => `${v.toFixed(digits)}%`;
const money = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (v: number, digits = 2) =>
  v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const ADS_TOOLS: AdsToolConfig[] = [
  {
    slug: "cac-calculator",
    title: "CAC Calculator",
    description: "Customer acquisition cost from spend and acquired customers.",
    inputs: [
      { key: "spend", label: "Ad spend", placeholder: "10000" },
      { key: "customers", label: "New customers", placeholder: "125" },
    ],
    calculate: ({ spend, customers }) => [{ label: "CAC", value: money(spend / Math.max(customers, 1)) }],
  },
  {
    slug: "roas-calculator",
    title: "ROAS Calculator",
    description: "Return on ad spend from revenue and ad spend.",
    inputs: [
      { key: "revenue", label: "Revenue from ads", placeholder: "35000" },
      { key: "spend", label: "Ad spend", placeholder: "10000" },
    ],
    calculate: ({ revenue, spend }) => [
      { label: "ROAS", value: `${(revenue / Math.max(spend, 1)).toFixed(2)}x` },
      { label: "ROAS %", value: pct((revenue / Math.max(spend, 1)) * 100) },
    ],
  },
  {
    slug: "mer-calculator",
    title: "MER Calculator",
    description: "Marketing efficiency ratio (total revenue / total marketing spend).",
    inputs: [
      { key: "totalRevenue", label: "Total revenue", placeholder: "80000" },
      { key: "marketingSpend", label: "Total marketing spend", placeholder: "20000" },
    ],
    calculate: ({ totalRevenue, marketingSpend }) => [
      { label: "MER", value: `${(totalRevenue / Math.max(marketingSpend, 1)).toFixed(2)}x` },
    ],
  },
  {
    slug: "break-even-roas-calculator",
    title: "Break-Even ROAS Calculator",
    description: "Break-even ROAS from gross margin.",
    inputs: [{ key: "grossMarginPct", label: "Gross margin %", placeholder: "55" }],
    calculate: ({ grossMarginPct }) => [
      { label: "Break-even ROAS", value: `${(100 / Math.max(grossMarginPct, 0.01)).toFixed(2)}x` },
    ],
  },
  {
    slug: "ltv-calculator",
    title: "LTV Calculator",
    description: "Lifetime value from ARPU and churn rate.",
    inputs: [
      { key: "arpu", label: "ARPU (monthly)", placeholder: "120" },
      { key: "churnPct", label: "Monthly churn %", placeholder: "5" },
    ],
    calculate: ({ arpu, churnPct }) => [{ label: "LTV", value: money(arpu / (Math.max(churnPct, 0.01) / 100)) }],
  },
  {
    slug: "ltv-cac-calculator",
    title: "LTV:CAC Calculator",
    description: "Ratio of lifetime value to acquisition cost.",
    inputs: [
      { key: "ltv", label: "LTV", placeholder: "2400" },
      { key: "cac", label: "CAC", placeholder: "400" },
    ],
    calculate: ({ ltv, cac }) => [{ label: "LTV:CAC", value: `${(ltv / Math.max(cac, 1)).toFixed(2)} : 1` }],
  },
  {
    slug: "payback-period-calculator",
    title: "Payback Period Calculator",
    description: "CAC payback period in months from CAC and monthly gross profit.",
    inputs: [
      { key: "cac", label: "CAC", placeholder: "400" },
      { key: "monthlyGrossProfit", label: "Monthly gross profit per customer", placeholder: "80" },
    ],
    calculate: ({ cac, monthlyGrossProfit }) => [
      { label: "Payback period", value: `${num(cac / Math.max(monthlyGrossProfit, 0.01), 1)} months` },
    ],
  },
  {
    slug: "blended-cac-calculator",
    title: "Blended CAC Calculator",
    description: "Blended CAC across all paid channels.",
    inputs: [
      { key: "totalSpend", label: "Total paid spend", placeholder: "18000" },
      { key: "newCustomers", label: "Total new customers", placeholder: "240" },
    ],
    calculate: ({ totalSpend, newCustomers }) => [
      { label: "Blended CAC", value: money(totalSpend / Math.max(newCustomers, 1)) },
    ],
  },
  {
    slug: "incrementality-lift-calculator",
    title: "Incrementality Lift Calculator",
    description: "Lift between treatment and control conversion rates.",
    inputs: [
      { key: "controlRatePct", label: "Control conversion rate %", placeholder: "2.5" },
      { key: "testRatePct", label: "Test conversion rate %", placeholder: "3.1" },
    ],
    calculate: ({ controlRatePct, testRatePct }) => [
      { label: "Lift", value: pct(((testRatePct - controlRatePct) / Math.max(controlRatePct, 0.01)) * 100) },
    ],
  },
  {
    slug: "contribution-margin-calculator",
    title: "Contribution Margin Calculator",
    description: "Contribution margin % from revenue and variable costs.",
    inputs: [
      { key: "revenue", label: "Revenue", placeholder: "50000" },
      { key: "variableCosts", label: "Variable costs", placeholder: "18000" },
    ],
    calculate: ({ revenue, variableCosts }) => [
      { label: "Contribution margin", value: pct(((revenue - variableCosts) / Math.max(revenue, 1)) * 100) },
      { label: "Contribution profit", value: money(revenue - variableCosts) },
    ],
  },
  {
    slug: "budget-pacing-tracker",
    title: "Budget Pacing Tracker",
    description: "Check if spend is on pace against time elapsed.",
    inputs: [
      { key: "monthBudget", label: "Monthly budget", placeholder: "30000" },
      { key: "spendToDate", label: "Spend to date", placeholder: "12000" },
      { key: "monthElapsedPct", label: "Month elapsed %", placeholder: "35" },
    ],
    calculate: ({ monthBudget, spendToDate, monthElapsedPct }) => {
      const target = (monthBudget * monthElapsedPct) / 100;
      const delta = spendToDate - target;
      return [
        { label: "Target spend by now", value: money(target) },
        { label: "Pacing delta", value: money(delta) },
      ];
    },
  },
  {
    slug: "daily-budget-allocation-optimizer",
    title: "Daily Budget Allocation Optimizer",
    description: "Daily budget recommendation from monthly budget and days left.",
    inputs: [
      { key: "remainingBudget", label: "Remaining monthly budget", placeholder: "18000" },
      { key: "daysLeft", label: "Days left in month", placeholder: "18" },
    ],
    calculate: ({ remainingBudget, daysLeft }) => [
      { label: "Recommended daily budget", value: money(remainingBudget / Math.max(daysLeft, 1)) },
    ],
  },
  {
    slug: "channel-mix-optimizer",
    title: "Channel Mix Optimizer",
    description: "Suggest budget split by channel ROAS.",
    inputs: [
      { key: "searchRoas", label: "Search ROAS", placeholder: "4.2" },
      { key: "socialRoas", label: "Social ROAS", placeholder: "2.8" },
      { key: "displayRoas", label: "Display ROAS", placeholder: "1.6" },
    ],
    calculate: ({ searchRoas, socialRoas, displayRoas }) => {
      const sum = Math.max(searchRoas + socialRoas + displayRoas, 0.01);
      return [
        { label: "Search budget share", value: pct((searchRoas / sum) * 100) },
        { label: "Social budget share", value: pct((socialRoas / sum) * 100) },
        { label: "Display budget share", value: pct((displayRoas / sum) * 100) },
      ];
    },
  },
  {
    slug: "geo-budget-split-optimizer",
    title: "Geo Budget Split Optimizer",
    description: "Split budget by performance index of each geo.",
    inputs: [
      { key: "geoAIndex", label: "Geo A performance index", placeholder: "1.4" },
      { key: "geoBIndex", label: "Geo B performance index", placeholder: "1.1" },
      { key: "geoCIndex", label: "Geo C performance index", placeholder: "0.7" },
    ],
    calculate: ({ geoAIndex, geoBIndex, geoCIndex }) => {
      const total = Math.max(geoAIndex + geoBIndex + geoCIndex, 0.01);
      return [
        { label: "Geo A share", value: pct((geoAIndex / total) * 100) },
        { label: "Geo B share", value: pct((geoBIndex / total) * 100) },
        { label: "Geo C share", value: pct((geoCIndex / total) * 100) },
      ];
    },
  },
  {
    slug: "creative-budget-split-optimizer",
    title: "Creative Budget Split Optimizer",
    description: "Allocate budget by creative score.",
    inputs: [
      { key: "creativeAScore", label: "Creative A score", placeholder: "88" },
      { key: "creativeBScore", label: "Creative B score", placeholder: "74" },
      { key: "creativeCScore", label: "Creative C score", placeholder: "63" },
    ],
    calculate: ({ creativeAScore, creativeBScore, creativeCScore }) => {
      const total = Math.max(creativeAScore + creativeBScore + creativeCScore, 0.01);
      return [
        { label: "Creative A share", value: pct((creativeAScore / total) * 100) },
        { label: "Creative B share", value: pct((creativeBScore / total) * 100) },
        { label: "Creative C share", value: pct((creativeCScore / total) * 100) },
      ];
    },
  },
  {
    slug: "funnel-stage-budget-planner",
    title: "Funnel Stage Budget Planner",
    description: "Budget split across TOF, MOF, BOF funnel stages.",
    inputs: [
      { key: "tofWeight", label: "TOF weight", placeholder: "5" },
      { key: "mofWeight", label: "MOF weight", placeholder: "3" },
      { key: "bofWeight", label: "BOF weight", placeholder: "2" },
    ],
    calculate: ({ tofWeight, mofWeight, bofWeight }) => {
      const total = Math.max(tofWeight + mofWeight + bofWeight, 0.01);
      return [
        { label: "TOF share", value: pct((tofWeight / total) * 100) },
        { label: "MOF share", value: pct((mofWeight / total) * 100) },
        { label: "BOF share", value: pct((bofWeight / total) * 100) },
      ];
    },
  },
  {
    slug: "cpc-benchmark-checker",
    title: "CPC Benchmark Checker",
    description: "Compare your CPC against benchmark CPC.",
    inputs: [
      { key: "yourMetric", label: "Your CPC", placeholder: "1.95" },
      { key: "benchmark", label: "Benchmark CPC", placeholder: "2.20" },
    ],
    calculate: ({ yourMetric, benchmark }) => [
      { label: "Delta vs benchmark", value: pct(((yourMetric - benchmark) / Math.max(benchmark, 0.01)) * 100) },
    ],
  },
  {
    slug: "cpm-benchmark-checker",
    title: "CPM Benchmark Checker",
    description: "Compare your CPM against benchmark CPM.",
    inputs: [
      { key: "yourMetric", label: "Your CPM", placeholder: "9.80" },
      { key: "benchmark", label: "Benchmark CPM", placeholder: "11.20" },
    ],
    calculate: ({ yourMetric, benchmark }) => [
      { label: "Delta vs benchmark", value: pct(((yourMetric - benchmark) / Math.max(benchmark, 0.01)) * 100) },
    ],
  },
  {
    slug: "ctr-benchmark-checker",
    title: "CTR Benchmark Checker",
    description: "Compare your CTR against benchmark CTR.",
    inputs: [
      { key: "yourMetric", label: "Your CTR %", placeholder: "2.1" },
      { key: "benchmark", label: "Benchmark CTR %", placeholder: "1.8" },
    ],
    calculate: ({ yourMetric, benchmark }) => [
      { label: "Delta vs benchmark", value: pct(((yourMetric - benchmark) / Math.max(benchmark, 0.01)) * 100) },
    ],
  },
  {
    slug: "cvr-benchmark-checker",
    title: "CVR Benchmark Checker",
    description: "Compare your conversion rate against benchmark CVR.",
    inputs: [
      { key: "yourMetric", label: "Your CVR %", placeholder: "3.4" },
      { key: "benchmark", label: "Benchmark CVR %", placeholder: "2.9" },
    ],
    calculate: ({ yourMetric, benchmark }) => [
      { label: "Delta vs benchmark", value: pct(((yourMetric - benchmark) / Math.max(benchmark, 0.01)) * 100) },
    ],
  },
  {
    slug: "cpa-benchmark-checker",
    title: "CPA Benchmark Checker",
    description: "Compare your CPA against benchmark CPA.",
    inputs: [
      { key: "yourMetric", label: "Your CPA", placeholder: "42" },
      { key: "benchmark", label: "Benchmark CPA", placeholder: "50" },
    ],
    calculate: ({ yourMetric, benchmark }) => [
      { label: "Delta vs benchmark", value: pct(((yourMetric - benchmark) / Math.max(benchmark, 0.01)) * 100) },
    ],
  },
  {
    slug: "ad-frequency-health-checker",
    title: "Ad Frequency Health Checker",
    description: "Evaluate frequency against your chosen ceiling.",
    inputs: [
      { key: "frequency", label: "Current frequency", placeholder: "3.6" },
      { key: "maxHealthyFrequency", label: "Max healthy frequency", placeholder: "2.8" },
    ],
    calculate: ({ frequency, maxHealthyFrequency }) => [
      { label: "Over/under threshold", value: num(frequency - maxHealthyFrequency, 2) },
      { label: "Threshold usage", value: pct((frequency / Math.max(maxHealthyFrequency, 0.01)) * 100) },
    ],
  },
  {
    slug: "reach-vs-frequency-planner",
    title: "Reach vs Frequency Planner",
    description: "Estimate impressions from reach and target frequency.",
    inputs: [
      { key: "reach", label: "Target reach", placeholder: "120000" },
      { key: "frequency", label: "Target frequency", placeholder: "2.5" },
    ],
    calculate: ({ reach, frequency }) => [{ label: "Estimated impressions", value: num(reach * frequency, 0) }],
  },
  {
    slug: "impression-share-opportunity-estimator",
    title: "Impression Share Opportunity Estimator",
    description: "Estimate upside from current to target impression share.",
    inputs: [
      { key: "currentIsPct", label: "Current impression share %", placeholder: "42" },
      { key: "targetIsPct", label: "Target impression share %", placeholder: "65" },
      { key: "currentImpressions", label: "Current impressions", placeholder: "45000" },
    ],
    calculate: ({ currentIsPct, targetIsPct, currentImpressions }) => {
      const opportunity = (currentImpressions * Math.max(targetIsPct - currentIsPct, 0)) / Math.max(currentIsPct, 0.01);
      return [{ label: "Estimated additional impressions", value: num(opportunity, 0) }];
    },
  },
  {
    slug: "lost-is-budget-analyzer",
    title: "Lost IS (Budget) Analyzer",
    description: "Estimate recovered share from reducing budget lost IS.",
    inputs: [
      { key: "lostIsBudgetPct", label: "Lost IS (budget) %", placeholder: "22" },
      { key: "plannedReductionPct", label: "Planned reduction %", placeholder: "40" },
    ],
    calculate: ({ lostIsBudgetPct, plannedReductionPct }) => [
      { label: "Potential recovered IS", value: pct((lostIsBudgetPct * plannedReductionPct) / 100) },
    ],
  },
  {
    slug: "lost-is-rank-analyzer",
    title: "Lost IS (Rank) Analyzer",
    description: "Estimate recovered share from reducing rank lost IS.",
    inputs: [
      { key: "lostIsRankPct", label: "Lost IS (rank) %", placeholder: "18" },
      { key: "plannedReductionPct", label: "Planned reduction %", placeholder: "35" },
    ],
    calculate: ({ lostIsRankPct, plannedReductionPct }) => [
      { label: "Potential recovered IS", value: pct((lostIsRankPct * plannedReductionPct) / 100) },
    ],
  },
  {
    slug: "auction-insights-visualizer",
    title: "Auction Insights Visualizer",
    description: "Quickly compare your overlap and outranking metrics.",
    inputs: [
      { key: "overlapRatePct", label: "Overlap rate %", placeholder: "48" },
      { key: "outrankingSharePct", label: "Outranking share %", placeholder: "56" },
      { key: "topOfPageRatePct", label: "Top of page rate %", placeholder: "62" },
    ],
    calculate: ({ overlapRatePct, outrankingSharePct, topOfPageRatePct }) => [
      { label: "Competitive pressure index", value: pct((overlapRatePct + topOfPageRatePct) / 2) },
      { label: "Outranking edge", value: pct(outrankingSharePct - overlapRatePct) },
    ],
  },
  {
    slug: "creative-rotation-planner",
    title: "Creative Rotation Planner",
    description: "Plan weekly creative rotation pace from variants and test window.",
    inputs: [
      { key: "variants", label: "Total creative variants", placeholder: "12" },
      { key: "weeks", label: "Test window (weeks)", placeholder: "6" },
      { key: "weeklyBudget", label: "Weekly budget", placeholder: "2500" },
    ],
    calculate: ({ variants, weeks, weeklyBudget }) => [
      { label: "Variants per week", value: num(variants / Math.max(weeks, 1), 2) },
      { label: "Budget per variant", value: money((weeklyBudget * weeks) / Math.max(variants, 1)) },
    ],
  },
  {
    slug: "winner-loser-creative-analyzer",
    title: "Winner/Loser Creative Analyzer",
    description: "Compare winner and loser CPA to quantify efficiency gap.",
    inputs: [
      { key: "winnerCpa", label: "Winner CPA", placeholder: "28" },
      { key: "loserCpa", label: "Loser CPA", placeholder: "45" },
    ],
    calculate: ({ winnerCpa, loserCpa }) => [
      { label: "Winner efficiency gain", value: pct(((loserCpa - winnerCpa) / Math.max(loserCpa, 0.01)) * 100) },
    ],
  },
  {
    slug: "thumbstop-score-estimator",
    title: "Thumbstop Score Estimator",
    description: "Estimate thumbstop score from CTR and 3-second view rate.",
    inputs: [
      { key: "ctrPct", label: "CTR %", placeholder: "1.8" },
      { key: "threeSecViewPct", label: "3-second view rate %", placeholder: "32" },
    ],
    calculate: ({ ctrPct, threeSecViewPct }) => [
      { label: "Thumbstop score", value: `${num(Math.min(100, ctrPct * 20 + threeSecViewPct * 1.4), 1)} / 100` },
    ],
  },
  {
    slug: "video-ad-hook-tester",
    title: "Video Ad Hook Tester",
    description: "Benchmark first 3-second hold rate versus target.",
    inputs: [
      { key: "holdRatePct", label: "Observed 3-second hold %", placeholder: "28" },
      { key: "targetPct", label: "Target hold %", placeholder: "35" },
    ],
    calculate: ({ holdRatePct, targetPct }) => [
      { label: "Gap to target", value: pct(holdRatePct - targetPct) },
      { label: "Target attainment", value: pct((holdRatePct / Math.max(targetPct, 0.01)) * 100) },
    ],
  },
  {
    slug: "landing-page-message-match-checker",
    title: "Landing Page Message Match Checker",
    description: "Score message match from ad relevance and bounce rate.",
    inputs: [
      { key: "adRelevanceScore", label: "Ad relevance score (0-10)", placeholder: "8" },
      { key: "bounceRatePct", label: "Bounce rate %", placeholder: "44" },
    ],
    calculate: ({ adRelevanceScore, bounceRatePct }) => [
      { label: "Message match score", value: `${num(Math.max(0, Math.min(100, adRelevanceScore * 10 - bounceRatePct * 0.5)), 1)} / 100` },
    ],
  },
  {
    slug: "landing-page-cro-audit-tool",
    title: "Landing Page CRO Audit Tool",
    description: "Estimate CRO health from conversion rate and load speed.",
    inputs: [
      { key: "cvrPct", label: "Conversion rate %", placeholder: "3.2" },
      { key: "loadTimeSec", label: "Load time (sec)", placeholder: "2.8" },
    ],
    calculate: ({ cvrPct, loadTimeSec }) => [
      { label: "CRO audit score", value: `${num(Math.max(0, Math.min(100, cvrPct * 18 - loadTimeSec * 6 + 50)), 1)} / 100` },
    ],
  },
  {
    slug: "form-drop-off-analyzer",
    title: "Form Drop-Off Analyzer",
    description: "Measure form abandonment from starts and completions.",
    inputs: [
      { key: "starts", label: "Form starts", placeholder: "1200" },
      { key: "completions", label: "Form completions", placeholder: "420" },
    ],
    calculate: ({ starts, completions }) => [
      { label: "Drop-off rate", value: pct(((starts - completions) / Math.max(starts, 1)) * 100) },
      { label: "Completion rate", value: pct((completions / Math.max(starts, 1)) * 100) },
    ],
  },
  {
    slug: "funnel-leak-detector",
    title: "Funnel Leak Detector",
    description: "Find largest leak between visit and checkout stages.",
    inputs: [
      { key: "sessions", label: "Sessions", placeholder: "10000" },
      { key: "checkouts", label: "Checkouts started", placeholder: "950" },
      { key: "purchases", label: "Purchases", placeholder: "380" },
    ],
    calculate: ({ sessions, checkouts, purchases }) => [
      { label: "Visit → checkout rate", value: pct((checkouts / Math.max(sessions, 1)) * 100) },
      { label: "Checkout → purchase rate", value: pct((purchases / Math.max(checkouts, 1)) * 100) },
    ],
  },
  {
    slug: "checkout-friction-scanner",
    title: "Checkout Friction Scanner",
    description: "Estimate checkout friction from drop and error rates.",
    inputs: [
      { key: "checkoutDropPct", label: "Checkout drop-off %", placeholder: "62" },
      { key: "errorRatePct", label: "Payment error rate %", placeholder: "4" },
    ],
    calculate: ({ checkoutDropPct, errorRatePct }) => [
      { label: "Friction score", value: `${num(Math.min(100, checkoutDropPct * 1.1 + errorRatePct * 4), 1)} / 100` },
    ],
  },
  {
    slug: "ab-test-idea-generator",
    title: "A/B Test Idea Generator",
    description: "Prioritize ideas from impact and effort scores.",
    inputs: [
      { key: "impactScore", label: "Impact score (1-10)", placeholder: "8" },
      { key: "effortScore", label: "Effort score (1-10)", placeholder: "3" },
    ],
    calculate: ({ impactScore, effortScore }) => [
      { label: "ICE ratio", value: num(impactScore / Math.max(effortScore, 1), 2) },
    ],
  },
  {
    slug: "experiment-sample-size-calculator",
    title: "Experiment Sample Size Calculator",
    description: "Approximate sample size from baseline and minimum detectable effect.",
    inputs: [
      { key: "baselineCvrPct", label: "Baseline CVR %", placeholder: "2.5" },
      { key: "mdePct", label: "MDE % uplift", placeholder: "15" },
    ],
    calculate: ({ baselineCvrPct, mdePct }) => {
      const p = Math.max(baselineCvrPct / 100, 0.001);
      const mde = Math.max(mdePct / 100, 0.001);
      const perVariant = (16 * p * (1 - p)) / (mde * mde);
      return [{ label: "Estimated sample per variant", value: num(perVariant, 0) }];
    },
  },
  {
    slug: "experiment-duration-estimator",
    title: "Experiment Duration Estimator",
    description: "Estimate days needed from sample target and daily traffic.",
    inputs: [
      { key: "sampleNeeded", label: "Required sample", placeholder: "12000" },
      { key: "dailyTraffic", label: "Daily eligible traffic", placeholder: "900" },
      { key: "variants", label: "Number of variants", placeholder: "2" },
    ],
    calculate: ({ sampleNeeded, dailyTraffic, variants }) => [
      { label: "Estimated duration (days)", value: num((sampleNeeded * variants) / Math.max(dailyTraffic, 1), 1) },
    ],
  },
  {
    slug: "statistical-significance-checker",
    title: "Statistical Significance Checker",
    description: "Quick z-score confidence estimate for two conversion rates.",
    inputs: [
      { key: "controlRatePct", label: "Control CVR %", placeholder: "2.4" },
      { key: "variantRatePct", label: "Variant CVR %", placeholder: "2.9" },
      { key: "samplePerArm", label: "Sample per arm", placeholder: "5000" },
    ],
    calculate: ({ controlRatePct, variantRatePct, samplePerArm }) => {
      const p1 = controlRatePct / 100;
      const p2 = variantRatePct / 100;
      const se = Math.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / Math.max(samplePerArm, 1));
      const z = (p2 - p1) / Math.max(se, 0.000001);
      return [{ label: "Approx confidence", value: pct(Math.max(0, Math.min(99.9, (Math.abs(z) / 3) * 100))) }];
    },
  },
  {
    slug: "bayesian-test-analyzer",
    title: "Bayesian Test Analyzer",
    description: "Approximate probability variant beats control.",
    inputs: [
      { key: "controlConv", label: "Control conversions", placeholder: "120" },
      { key: "controlVisitors", label: "Control visitors", placeholder: "5000" },
      { key: "variantConv", label: "Variant conversions", placeholder: "145" },
      { key: "variantVisitors", label: "Variant visitors", placeholder: "5000" },
    ],
    calculate: ({ controlConv, controlVisitors, variantConv, variantVisitors }) => {
      const cr = controlConv / Math.max(controlVisitors, 1);
      const vr = variantConv / Math.max(variantVisitors, 1);
      const prob = Math.max(0, Math.min(0.999, 0.5 + (vr - cr) * 20));
      return [{ label: "P(variant > control)", value: pct(prob * 100) }];
    },
  },
  {
    slug: "holdout-test-planner",
    title: "Holdout Test Planner",
    description: "Plan holdout size and expected conversion loss.",
    inputs: [
      { key: "totalAudience", label: "Total audience", placeholder: "200000" },
      { key: "holdoutPct", label: "Holdout %", placeholder: "10" },
      { key: "expectedCvrPct", label: "Expected CVR %", placeholder: "2.8" },
    ],
    calculate: ({ totalAudience, holdoutPct, expectedCvrPct }) => {
      const holdoutAudience = (totalAudience * holdoutPct) / 100;
      return [
        { label: "Holdout audience", value: num(holdoutAudience, 0) },
        { label: "Expected holdout conversions", value: num((holdoutAudience * expectedCvrPct) / 100, 0) },
      ];
    },
  },
  {
    slug: "geo-lift-test-planner",
    title: "Geo Lift Test Planner",
    description: "Plan geo split and minimum spend by test regions.",
    inputs: [
      { key: "testGeos", label: "Test geos count", placeholder: "6" },
      { key: "controlGeos", label: "Control geos count", placeholder: "6" },
      { key: "spendPerGeo", label: "Planned spend per test geo", placeholder: "3000" },
    ],
    calculate: ({ testGeos, controlGeos, spendPerGeo }) => [
      { label: "Test/control ratio", value: num(testGeos / Math.max(controlGeos, 1), 2) },
      { label: "Total test spend", value: money(testGeos * spendPerGeo) },
    ],
  },
  {
    slug: "mmm-lite-simulator",
    title: "MMM Lite Simulator",
    description: "Simulate blended outcome from channel spend and response curves.",
    inputs: [
      { key: "searchSpend", label: "Search spend", placeholder: "12000" },
      { key: "socialSpend", label: "Social spend", placeholder: "9000" },
      { key: "responseFactor", label: "Average response factor", placeholder: "1.8" },
    ],
    calculate: ({ searchSpend, socialSpend, responseFactor }) => [
      { label: "Modeled revenue", value: money((searchSpend + socialSpend) * responseFactor) },
      { label: "Modeled blended ROAS", value: `${num(responseFactor, 2)}x` },
    ],
  },
  {
    slug: "attribution-model-comparator",
    title: "Attribution Model Comparator",
    description: "Compare first-click and last-click credit split.",
    inputs: [
      { key: "firstClickConv", label: "First-click conversions", placeholder: "140" },
      { key: "lastClickConv", label: "Last-click conversions", placeholder: "190" },
    ],
    calculate: ({ firstClickConv, lastClickConv }) => {
      const total = Math.max(firstClickConv + lastClickConv, 1);
      return [
        { label: "First-click share", value: pct((firstClickConv / total) * 100) },
        { label: "Last-click share", value: pct((lastClickConv / total) * 100) },
      ];
    },
  },
  {
    slug: "assisted-conversion-analyzer",
    title: "Assisted Conversion Analyzer",
    description: "Estimate assisted conversion contribution.",
    inputs: [
      { key: "assistedConv", label: "Assisted conversions", placeholder: "220" },
      { key: "lastClickConv", label: "Last-click conversions", placeholder: "180" },
    ],
    calculate: ({ assistedConv, lastClickConv }) => [
      { label: "Assisted share", value: pct((assistedConv / Math.max(assistedConv + lastClickConv, 1)) * 100) },
    ],
  },
  {
    slug: "time-lag-conversion-analyzer",
    title: "Time Lag Conversion Analyzer",
    description: "Estimate delayed conversion share beyond 7 days.",
    inputs: [
      { key: "convWithin7d", label: "Conversions within 7 days", placeholder: "320" },
      { key: "convAfter7d", label: "Conversions after 7 days", placeholder: "110" },
    ],
    calculate: ({ convWithin7d, convAfter7d }) => [
      { label: "Delayed conversion share", value: pct((convAfter7d / Math.max(convWithin7d + convAfter7d, 1)) * 100) },
    ],
  },
  {
    slug: "path-to-conversion-analyzer",
    title: "Path-to-Conversion Analyzer",
    description: "Estimate average touches per converted user.",
    inputs: [
      { key: "totalTouches", label: "Total pre-conversion touches", placeholder: "1800" },
      { key: "conversions", label: "Conversions", placeholder: "300" },
    ],
    calculate: ({ totalTouches, conversions }) => [{ label: "Avg touches per conversion", value: num(totalTouches / Math.max(conversions, 1), 2) }],
  },
  {
    slug: "view-through-impact-estimator",
    title: "View-Through Impact Estimator",
    description: "Estimate view-through conversion contribution.",
    inputs: [
      { key: "viewThroughConv", label: "View-through conversions", placeholder: "90" },
      { key: "clickThroughConv", label: "Click-through conversions", placeholder: "340" },
    ],
    calculate: ({ viewThroughConv, clickThroughConv }) => [
      { label: "View-through share", value: pct((viewThroughConv / Math.max(viewThroughConv + clickThroughConv, 1)) * 100) },
    ],
  },
  {
    slug: "utm-builder-pro",
    title: "UTM Builder Pro",
    description: "Estimate campaign taxonomy completeness score.",
    inputs: [
      { key: "requiredFields", label: "Required UTM fields", placeholder: "5" },
      { key: "filledFields", label: "Filled UTM fields", placeholder: "4" },
      { key: "validityChecksPassed", label: "Naming checks passed", placeholder: "3" },
    ],
    calculate: ({ requiredFields, filledFields, validityChecksPassed }) => [
      { label: "Completion score", value: pct((filledFields / Math.max(requiredFields, 1)) * 100) },
      { label: "Governance score", value: pct((validityChecksPassed / Math.max(requiredFields, 1)) * 100) },
    ],
  },
  {
    slug: "utm-governance-checker",
    title: "UTM Governance Checker",
    description: "Score naming quality and policy compliance for UTMs.",
    inputs: [
      { key: "urlsChecked", label: "URLs checked", placeholder: "120" },
      { key: "urlsCompliant", label: "URLs compliant", placeholder: "94" },
    ],
    calculate: ({ urlsChecked, urlsCompliant }) => [{ label: "Governance compliance", value: pct((urlsCompliant / Math.max(urlsChecked, 1)) * 100) }],
  },
  {
    slug: "url-parameter-qa-tool",
    title: "URL Parameter QA Tool",
    description: "Measure URL parameter integrity rate.",
    inputs: [
      { key: "urlsAudited", label: "URLs audited", placeholder: "200" },
      { key: "urlsPassingQa", label: "URLs passing QA", placeholder: "176" },
    ],
    calculate: ({ urlsAudited, urlsPassingQa }) => [{ label: "QA pass rate", value: pct((urlsPassingQa / Math.max(urlsAudited, 1)) * 100) }],
  },
  {
    slug: "pixel-event-qa-checklist",
    title: "Pixel Event QA Checklist",
    description: "Score event instrumentation coverage.",
    inputs: [
      { key: "requiredEvents", label: "Required events", placeholder: "10" },
      { key: "implementedEvents", label: "Implemented events", placeholder: "8" },
    ],
    calculate: ({ requiredEvents, implementedEvents }) => [{ label: "Event coverage", value: pct((implementedEvents / Math.max(requiredEvents, 1)) * 100) }],
  },
  {
    slug: "conversion-api-payload-validator",
    title: "Conversion API Payload Validator",
    description: "Estimate payload completeness from required fields.",
    inputs: [
      { key: "requiredFields", label: "Required payload fields", placeholder: "18" },
      { key: "providedFields", label: "Provided fields", placeholder: "14" },
    ],
    calculate: ({ requiredFields, providedFields }) => [{ label: "Payload completeness", value: pct((providedFields / Math.max(requiredFields, 1)) * 100) }],
  },
  {
    slug: "offline-conversion-import-formatter",
    title: "Offline Conversion Import Formatter",
    description: "Estimate import readiness based on valid rows.",
    inputs: [
      { key: "totalRows", label: "Total rows", placeholder: "1500" },
      { key: "validRows", label: "Valid rows", placeholder: "1370" },
    ],
    calculate: ({ totalRows, validRows }) => [{ label: "Import readiness", value: pct((validRows / Math.max(totalRows, 1)) * 100) }],
  },
  {
    slug: "meta-event-match-quality-helper",
    title: "Meta Event Match Quality Helper",
    description: "Estimate Meta match quality from key identifier coverage.",
    inputs: [
      { key: "availableSignals", label: "Available user signals", placeholder: "6" },
      { key: "sentSignals", label: "Signals sent", placeholder: "4" },
    ],
    calculate: ({ availableSignals, sentSignals }) => [{ label: "Estimated match quality", value: pct((sentSignals / Math.max(availableSignals, 1)) * 100) }],
  },
  {
    slug: "ga4-ads-mapping-helper",
    title: "GA4 Ads Mapping Helper",
    description: "Score GA4 event mapping completeness for ads reporting.",
    inputs: [
      { key: "requiredMappings", label: "Required mappings", placeholder: "12" },
      { key: "completedMappings", label: "Completed mappings", placeholder: "9" },
    ],
    calculate: ({ requiredMappings, completedMappings }) => [{ label: "Mapping coverage", value: pct((completedMappings / Math.max(requiredMappings, 1)) * 100) }],
  },
  {
    slug: "consent-mode-impact-estimator",
    title: "Consent Mode Impact Estimator",
    description: "Estimate modeled conversion gap from consent opt-in rate.",
    inputs: [
      { key: "optInRatePct", label: "Consent opt-in %", placeholder: "62" },
      { key: "baselineTrackedConv", label: "Baseline tracked conversions", placeholder: "500" },
    ],
    calculate: ({ optInRatePct, baselineTrackedConv }) => [
      { label: "Expected directly observed conversions", value: num((baselineTrackedConv * optInRatePct) / 100, 0) },
      { label: "Potential modeled share", value: pct(100 - optInRatePct) },
    ],
  },
  {
    slug: "cookie-loss-impact-simulator",
    title: "Cookie Loss Impact Simulator",
    description: "Estimate attribution loss from cookie drop.",
    inputs: [
      { key: "cookieRetentionPct", label: "Cookie retention %", placeholder: "70" },
      { key: "baselineAttribution", label: "Baseline attributed conversions", placeholder: "900" },
    ],
    calculate: ({ cookieRetentionPct, baselineAttribution }) => [
      { label: "Estimated attributed conversions", value: num((baselineAttribution * cookieRetentionPct) / 100, 0) },
      { label: "Estimated conversion loss", value: num((baselineAttribution * (100 - cookieRetentionPct)) / 100, 0) },
    ],
  },
  {
    slug: "lead-quality-scoring-tool",
    title: "Lead Quality Scoring Tool",
    description: "Score lead quality using fit, intent, and engagement.",
    inputs: [
      { key: "fitScore", label: "Fit score (0-100)", placeholder: "75" },
      { key: "intentScore", label: "Intent score (0-100)", placeholder: "68" },
      { key: "engagementScore", label: "Engagement score (0-100)", placeholder: "82" },
    ],
    calculate: ({ fitScore, intentScore, engagementScore }) => [
      { label: "Lead quality score", value: `${num((fitScore * 0.4 + intentScore * 0.35 + engagementScore * 0.25), 1)} / 100` },
    ],
  },
  {
    slug: "crm-revenue-attribution-mapper",
    title: "CRM Revenue Attribution Mapper",
    description: "Map CRM won revenue to paid media influence.",
    inputs: [
      { key: "wonRevenue", label: "Won revenue", placeholder: "250000" },
      { key: "paidInfluencedPct", label: "Paid-influenced %", placeholder: "38" },
    ],
    calculate: ({ wonRevenue, paidInfluencedPct }) => [{ label: "Paid-influenced revenue", value: money((wonRevenue * paidInfluencedPct) / 100) }],
  },
  {
    slug: "sales-cycle-length-impact-tool",
    title: "Sales Cycle Length Impact Tool",
    description: "Estimate cashflow delay impact from longer sales cycles.",
    inputs: [
      { key: "currentCycleDays", label: "Current cycle (days)", placeholder: "42" },
      { key: "targetCycleDays", label: "Target cycle (days)", placeholder: "30" },
      { key: "monthlyPipelineValue", label: "Monthly pipeline value", placeholder: "120000" },
    ],
    calculate: ({ currentCycleDays, targetCycleDays, monthlyPipelineValue }) => {
      const delayDays = Math.max(currentCycleDays - targetCycleDays, 0);
      return [
        { label: "Cycle delay", value: `${num(delayDays, 0)} days` },
        { label: "Delayed pipeline value", value: money((monthlyPipelineValue * delayDays) / 30) },
      ];
    },
  },
  {
    slug: "bid-strategy-recommender",
    title: "Bid Strategy Recommender",
    description: "Recommend bidding path from conversion volume and efficiency targets.",
    inputs: [
      { key: "weeklyConversions", label: "Weekly conversions", placeholder: "45" },
      { key: "targetCpa", label: "Target CPA", placeholder: "40" },
      { key: "currentCpa", label: "Current CPA", placeholder: "48" },
    ],
    calculate: ({ weeklyConversions, targetCpa, currentCpa }) => [
      { label: "Smart bidding readiness", value: weeklyConversions >= 30 ? "High" : "Low" },
      { label: "CPA gap", value: pct(((currentCpa - targetCpa) / Math.max(targetCpa, 0.01)) * 100) },
    ],
  },
  {
    slug: "target-cpa-feasibility-tool",
    title: "Target CPA Feasibility Tool",
    description: "Estimate target CPA feasibility from CPC and CVR assumptions.",
    inputs: [
      { key: "cpc", label: "CPC", placeholder: "2.1" },
      { key: "cvrPct", label: "CVR %", placeholder: "3.5" },
      { key: "targetCpa", label: "Target CPA", placeholder: "45" },
    ],
    calculate: ({ cpc, cvrPct, targetCpa }) => {
      const impliedCpa = cpc / Math.max(cvrPct / 100, 0.0001);
      return [{ label: "Feasibility gap", value: pct(((impliedCpa - targetCpa) / Math.max(targetCpa, 0.01)) * 100) }];
    },
  },
  {
    slug: "target-roas-feasibility-tool",
    title: "Target ROAS Feasibility Tool",
    description: "Estimate expected ROAS from CPC, CVR, and AOV.",
    inputs: [
      { key: "cpc", label: "CPC", placeholder: "1.6" },
      { key: "cvrPct", label: "CVR %", placeholder: "2.8" },
      { key: "aov", label: "AOV", placeholder: "95" },
    ],
    calculate: ({ cpc, cvrPct, aov }) => [{ label: "Expected ROAS", value: `${(((aov * (cvrPct / 100)) / Math.max(cpc, 0.01))).toFixed(2)}x` }],
  },
  { slug: "bid-cap-calculator", title: "Bid Cap Calculator", description: "Max bid from CPA and CVR.", inputs: [{ key: "targetCpa", label: "Target CPA", placeholder: "40" }, { key: "cvrPct", label: "CVR %", placeholder: "3.2" }], calculate: ({ targetCpa, cvrPct }) => [{ label: "Max CPC bid cap", value: money(targetCpa * (cvrPct / 100)) }] },
  { slug: "cost-cap-planner", title: "Cost Cap Planner", description: "Plan cost cap from baseline CPA and improvement goal.", inputs: [{ key: "currentCpa", label: "Current CPA", placeholder: "34" }, { key: "improvementPct", label: "Improvement %", placeholder: "15" }], calculate: ({ currentCpa, improvementPct }) => [{ label: "Suggested cost cap", value: money(currentCpa * (1 - improvementPct / 100)) }] },
  { slug: "manual-bid-simulator", title: "Manual Bid Simulator", description: "Simulate CPC under manual bid changes.", inputs: [{ key: "currentCpc", label: "Current CPC", placeholder: "1.4" }, { key: "bidChangePct", label: "Bid change %", placeholder: "20" }], calculate: ({ currentCpc, bidChangePct }) => [{ label: "Simulated CPC", value: money(currentCpc * (1 + bidChangePct / 100)) }] },
  { slug: "ad-rank-components-explainer", title: "Ad Rank Components Explainer", description: "Ad rank proxy from bid, CTR, and quality score.", inputs: [{ key: "bid", label: "Bid", placeholder: "2.2" }, { key: "ctrPct", label: "CTR %", placeholder: "4.1" }, { key: "qualityScore", label: "Quality score", placeholder: "7" }], calculate: ({ bid, ctrPct, qualityScore }) => [{ label: "Ad rank proxy", value: num(bid * ctrPct * qualityScore, 2) }] },
  { slug: "quality-score-improvement-planner", title: "Quality Score Improvement Planner", description: "Estimate QS lift from CTR gains.", inputs: [{ key: "currentQs", label: "Current QS", placeholder: "5" }, { key: "ctrLiftPct", label: "CTR lift %", placeholder: "12" }], calculate: ({ currentQs, ctrLiftPct }) => [{ label: "Projected QS", value: num(Math.min(10, currentQs + ctrLiftPct / 10), 1) }] },
  { slug: "search-terms-cleaner", title: "Search Terms Cleaner", description: "Estimate noise and cleaned query volume.", inputs: [{ key: "totalTerms", label: "Total terms", placeholder: "1200" }, { key: "irrelevantTerms", label: "Irrelevant terms", placeholder: "280" }], calculate: ({ totalTerms, irrelevantTerms }) => [{ label: "Noise ratio", value: pct((irrelevantTerms / Math.max(totalTerms, 1)) * 100) }] },
  { slug: "negative-keyword-generator", title: "Negative Keyword Generator", description: "Estimate negative theme count from noisy traffic.", inputs: [{ key: "irrelevantClicks", label: "Irrelevant clicks", placeholder: "180" }, { key: "themeDepth", label: "Theme depth", placeholder: "3" }], calculate: ({ irrelevantClicks, themeDepth }) => [{ label: "Suggested negative themes", value: num(irrelevantClicks / Math.max(themeDepth * 10, 1), 0) }] },
  { slug: "keyword-intent-classifier", title: "Keyword Intent Classifier", description: "Classify and quantify transactional keyword share.", inputs: [{ key: "totalKeywords", label: "Total keywords", placeholder: "250" }, { key: "transactionalKeywords", label: "Transactional keywords", placeholder: "95" }], calculate: ({ totalKeywords, transactionalKeywords }) => [{ label: "Transactional share", value: pct((transactionalKeywords / Math.max(totalKeywords, 1)) * 100) }] },
  { slug: "keyword-cluster-builder", title: "Keyword Cluster Builder", description: "Estimate cluster count from keyword universe.", inputs: [{ key: "totalKeywords", label: "Total keywords", placeholder: "300" }, { key: "clusterSize", label: "Target cluster size", placeholder: "12" }], calculate: ({ totalKeywords, clusterSize }) => [{ label: "Suggested clusters", value: num(totalKeywords / Math.max(clusterSize, 1), 0) }] },
  { slug: "keyword-gap-analyzer", title: "Keyword Gap Analyzer", description: "Measure keyword coverage gap versus competitors.", inputs: [{ key: "competitorKeywords", label: "Competitor keywords", placeholder: "420" }, { key: "yourKeywords", label: "Your keywords", placeholder: "280" }], calculate: ({ competitorKeywords, yourKeywords }) => [{ label: "Coverage gap", value: pct(((competitorKeywords - yourKeywords) / Math.max(competitorKeywords, 1)) * 100) }] },
  { slug: "long-tail-keyword-expander", title: "Long-Tail Keyword Expander", description: "Project long-tail opportunities.", inputs: [{ key: "seedKeywords", label: "Seed keywords", placeholder: "20" }, { key: "expansionFactor", label: "Expansion factor", placeholder: "6" }], calculate: ({ seedKeywords, expansionFactor }) => [{ label: "Projected long-tail terms", value: num(seedKeywords * expansionFactor, 0) }] },
  { slug: "match-type-mapper", title: "Match Type Mapper", description: "Suggest broad/phrase/exact distribution.", inputs: [{ key: "riskTolerancePct", label: "Scale risk tolerance %", placeholder: "40" }], calculate: ({ riskTolerancePct }) => [{ label: "Broad match share", value: pct(Math.min(70, riskTolerancePct)) }] },
  { slug: "shopping-feed-title-optimizer", title: "Shopping Feed Title Optimizer", description: "Estimate title quality from coverage.", inputs: [{ key: "keywordCoveragePct", label: "Keyword coverage %", placeholder: "62" }, { key: "attributeCoveragePct", label: "Attribute coverage %", placeholder: "70" }], calculate: ({ keywordCoveragePct, attributeCoveragePct }) => [{ label: "Title quality score", value: `${((keywordCoveragePct + attributeCoveragePct) / 2).toFixed(1)} / 100` }] },
  { slug: "shopping-feed-attribute-checker", title: "Shopping Feed Attribute Checker", description: "Check required attribute completeness.", inputs: [{ key: "requiredAttributes", label: "Required attributes", placeholder: "8" }, { key: "completedAttributes", label: "Completed attributes", placeholder: "6" }], calculate: ({ requiredAttributes, completedAttributes }) => [{ label: "Attribute completeness", value: pct((completedAttributes / Math.max(requiredAttributes, 1)) * 100) }] },
  { slug: "merchant-feed-error-diagnoser", title: "Merchant Feed Error Diagnoser", description: "Estimate feed disapproval severity.", inputs: [{ key: "totalSkus", label: "Total SKUs", placeholder: "2000" }, { key: "disapprovedSkus", label: "Disapproved SKUs", placeholder: "120" }], calculate: ({ totalSkus, disapprovedSkus }) => [{ label: "Disapproval rate", value: pct((disapprovedSkus / Math.max(totalSkus, 1)) * 100) }] },
  { slug: "product-group-bid-planner", title: "Product Group Bid Planner", description: "Estimate bid baseline for product groups.", inputs: [{ key: "avgCpa", label: "Average CPA", placeholder: "28" }, { key: "marginPct", label: "Margin %", placeholder: "50" }], calculate: ({ avgCpa, marginPct }) => [{ label: "Suggested bid", value: money(avgCpa * (marginPct / 100)) }] },
  { slug: "pmax-asset-group-builder", title: "PMax Asset Group Builder", description: "Estimate needed asset groups by catalog complexity.", inputs: [{ key: "productLines", label: "Product lines", placeholder: "5" }, { key: "regions", label: "Regions", placeholder: "3" }], calculate: ({ productLines, regions }) => [{ label: "Suggested asset groups", value: num(Math.max(productLines, 1) + Math.max(regions - 1, 0), 0) }] },
  { slug: "pmax-search-theme-generator", title: "PMax Search Theme Generator", description: "Estimate PMax search theme count.", inputs: [{ key: "categories", label: "Categories", placeholder: "4" }, { key: "intentLevels", label: "Intent levels", placeholder: "3" }], calculate: ({ categories, intentLevels }) => [{ label: "Search themes", value: num(categories * intentLevels, 0) }] },
  { slug: "creative-brief-generator", title: "Creative Brief Generator", description: "Estimate brief complexity and section count.", inputs: [{ key: "audiences", label: "Audience segments", placeholder: "3" }, { key: "channels", label: "Channels", placeholder: "2" }], calculate: ({ audiences, channels }) => [{ label: "Recommended brief sections", value: num(4 + audiences + channels, 0) }] },
  { slug: "hook-generator-for-ads", title: "Hook Generator for Ads", description: "Estimate hook variants from audiences and pain points.", inputs: [{ key: "audienceSegments", label: "Audience segments", placeholder: "4" }, { key: "painPoints", label: "Pain points", placeholder: "5" }], calculate: ({ audienceSegments, painPoints }) => [{ label: "Hook variants", value: num(audienceSegments * painPoints, 0) }] },
  { slug: "ugc-script-generator", title: "UGC Script Generator", description: "Estimate UGC script variant count.", inputs: [{ key: "angles", label: "Angles", placeholder: "4" }, { key: "durations", label: "Duration variants", placeholder: "3" }], calculate: ({ angles, durations }) => [{ label: "Script variants", value: num(angles * durations, 0) }] },
  { slug: "ad-angle-generator", title: "Ad Angle Generator", description: "Estimate ad angle opportunities.", inputs: [{ key: "audiences", label: "Audiences", placeholder: "3" }, { key: "valueProps", label: "Value props", placeholder: "4" }], calculate: ({ audiences, valueProps }) => [{ label: "Angle opportunities", value: num(audiences * valueProps, 0) }] },
  { slug: "offer-positioning-generator", title: "Offer Positioning Generator", description: "Estimate positioning routes by segment.", inputs: [{ key: "differentiators", label: "Differentiators", placeholder: "4" }, { key: "segments", label: "ICP segments", placeholder: "3" }], calculate: ({ differentiators, segments }) => [{ label: "Positioning routes", value: num(differentiators * segments, 0) }] },
  { slug: "headline-generator-rsa", title: "Headline Generator (RSA)", description: "Estimate RSA headline inventory needed.", inputs: [{ key: "adGroups", label: "Ad groups", placeholder: "6" }, { key: "headlinesPerGroup", label: "Headlines per group", placeholder: "12" }], calculate: ({ adGroups, headlinesPerGroup }) => [{ label: "Headline inventory", value: num(adGroups * headlinesPerGroup, 0) }] },
  { slug: "description-generator-rsa", title: "Description Generator (RSA)", description: "Estimate RSA description inventory needed.", inputs: [{ key: "adGroups", label: "Ad groups", placeholder: "6" }, { key: "descriptionsPerGroup", label: "Descriptions per group", placeholder: "4" }], calculate: ({ adGroups, descriptionsPerGroup }) => [{ label: "Description inventory", value: num(adGroups * descriptionsPerGroup, 0) }] },
  { slug: "primary-text-generator-meta", title: "Primary Text Generator (Meta)", description: "Estimate Meta primary text variants needed.", inputs: [{ key: "funnels", label: "Funnel stages", placeholder: "3" }, { key: "audiences", label: "Audiences", placeholder: "4" }], calculate: ({ funnels, audiences }) => [{ label: "Primary text variants", value: num(funnels * audiences * 2, 0) }] },
  { slug: "cta-variant-generator", title: "CTA Variant Generator", description: "Estimate CTA variants by funnel stage.", inputs: [{ key: "funnelStages", label: "Funnel stages", placeholder: "3" }, { key: "offers", label: "Offer variants", placeholder: "2" }], calculate: ({ funnelStages, offers }) => [{ label: "CTA variants", value: num(funnelStages * offers * 3, 0) }] },
  { slug: "ad-fatigue-detector", title: "Ad Fatigue Detector", description: "Estimate fatigue risk from trend changes.", inputs: [{ key: "frequencyGrowthPct", label: "Frequency growth %", placeholder: "30" }, { key: "ctrDeclinePct", label: "CTR decline %", placeholder: "18" }, { key: "cpaIncreasePct", label: "CPA increase %", placeholder: "22" }], calculate: ({ frequencyGrowthPct, ctrDeclinePct, cpaIncreasePct }) => [{ label: "Fatigue risk score", value: `${Math.min(100, (frequencyGrowthPct + ctrDeclinePct + cpaIncreasePct) / 3).toFixed(1)} / 100` }] },
];

export const ADS_TOOLS_BY_SLUG = Object.fromEntries(
  ADS_TOOLS.map((tool) => [tool.slug, tool]),
) as Record<string, AdsToolConfig>;
