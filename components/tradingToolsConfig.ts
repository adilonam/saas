type ToolField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "number" | "text" | "select";
  step?: string;
  min?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
};

type ToolResult = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "danger";
};

type ToolDefinition = {
  title: string;
  description: string;
  formulaNote: string;
  fields: ToolField[];
};

const pct = (value: number) => `${value.toFixed(2)}%`;
const num = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

const performanceFields: ToolField[] = [
  { key: "wins", label: "Winning trades", placeholder: "e.g. 28", min: "0", step: "1" },
  { key: "losses", label: "Losing trades", placeholder: "e.g. 22", min: "0", step: "1" },
  { key: "avgWin", label: "Average win ($)", placeholder: "e.g. 140", min: "0", step: "0.01" },
  { key: "avgLoss", label: "Average loss ($)", placeholder: "e.g. 90", min: "0", step: "0.01" },
];

const toolDefinitions: Record<string, ToolDefinition> = {
  "calmar-ratio-calculator": {
    title: "Calmar Ratio Calculator",
    description: "Compare annualized return to maximum drawdown risk.",
    formulaNote: "Calmar Ratio = Annualized Return (%) / Max Drawdown (%). Higher is better.",
    fields: [
      { key: "annualReturn", label: "Annualized return (%)", placeholder: "e.g. 24", min: "0", step: "0.01" },
      { key: "maxDrawdown", label: "Maximum drawdown (%)", placeholder: "e.g. 12", min: "0.01", step: "0.01" },
    ],
  },
  "trade-journal-manual": {
    title: "Trade Journal (Manual)",
    description: "Quickly summarize manual trade stats from your notes.",
    formulaNote: "This tool computes win rate, expectancy, and total net from your manual trade summary.",
    fields: performanceFields,
  },
  "auto-trade-journal-csv": {
    title: "Auto Trade Journal from CSV",
    description: "Paste aggregate CSV metrics and get instant performance outputs.",
    formulaNote: "MVP mode: enter aggregated wins/losses and average outcome values extracted from your CSV.",
    fields: performanceFields,
  },
  "screenshot-note-trade-journal": {
    title: "Screenshot + Note Trade Journal",
    description: "Track outcomes tied to screenshot-driven setups and notes.",
    formulaNote: "MVP mode: summarize screenshot-tagged trades through aggregate outcomes.",
    fields: performanceFields,
  },
  "setup-tag-performance-analyzer": {
    title: "Setup Tag Performance Analyzer",
    description: "Evaluate if a setup tag is truly profitable.",
    formulaNote: "Expectancy = WinRate * AvgWin - LossRate * AvgLoss.",
    fields: performanceFields,
  },
  "session-performance-analyzer": {
    title: "Session Performance Analyzer",
    description: "Analyze trade quality by market session.",
    formulaNote: "Use this for one session bucket at a time (London, NY, Asia, etc.).",
    fields: performanceFields,
  },
  "day-of-week-performance-analyzer": {
    title: "Day-of-Week Performance Analyzer",
    description: "Check whether a day has edge or drag.",
    formulaNote: "Evaluate one weekday bucket at a time from your journal.",
    fields: performanceFields,
  },
  "time-of-day-edge-analyzer": {
    title: "Time-of-Day Edge Analyzer",
    description: "Measure edge during a specific intraday window.",
    formulaNote: "Use one time block (e.g. 09:30-10:30) per run.",
    fields: performanceFields,
  },
  "long-vs-short-performance-analyzer": {
    title: "Long vs Short Performance Analyzer",
    description: "Compare directional edge for longs vs shorts.",
    formulaNote: "Run once for long and once for short side to compare expectancy and hit rate.",
    fields: performanceFields,
  },
  "ab-strategy-comparator": {
    title: "A/B Strategy Comparator",
    description: "Compare two strategy variants by expectancy and net performance.",
    formulaNote: "Variant with higher expectancy and net value generally has stronger edge.",
    fields: [
      { key: "aWinRate", label: "Strategy A win rate (%)", placeholder: "e.g. 52", min: "0", step: "0.01" },
      { key: "aAvgR", label: "Strategy A average R", placeholder: "e.g. 0.35", step: "0.01" },
      { key: "bWinRate", label: "Strategy B win rate (%)", placeholder: "e.g. 45", min: "0", step: "0.01" },
      { key: "bAvgR", label: "Strategy B average R", placeholder: "e.g. 0.58", step: "0.01" },
      { key: "trades", label: "Trade count for each", placeholder: "e.g. 120", min: "1", step: "1" },
    ],
  },
  "strategy-backtest-lite": {
    title: "Strategy Backtest Lite (Rule-Based)",
    description: "Estimate expectancy and equity change from simple assumptions.",
    formulaNote: "Backtest Lite = trades * expectancy(R) * risk per trade.",
    fields: [
      { key: "trades", label: "Number of trades", placeholder: "e.g. 150", min: "1", step: "1" },
      { key: "winRate", label: "Win rate (%)", placeholder: "e.g. 48", min: "0", step: "0.01" },
      { key: "avgWinR", label: "Average win (R)", placeholder: "e.g. 1.8", min: "0", step: "0.01" },
      { key: "avgLossR", label: "Average loss (R)", placeholder: "e.g. 1", min: "0", step: "0.01" },
      { key: "riskPerTrade", label: "Risk per trade ($)", placeholder: "e.g. 100", min: "0", step: "0.01" },
    ],
  },
  "walk-forward-backtest-tool": {
    title: "Walk-Forward Backtest Tool",
    description: "Compare in-sample and out-of-sample robustness quickly.",
    formulaNote: "Robustness score rewards stable out-of-sample expectancy versus in-sample.",
    fields: [
      { key: "inSampleExp", label: "In-sample expectancy (R)", placeholder: "e.g. 0.42", step: "0.01" },
      { key: "outSampleExp", label: "Out-of-sample expectancy (R)", placeholder: "e.g. 0.28", step: "0.01" },
      { key: "outSampleTrades", label: "Out-of-sample trades", placeholder: "e.g. 80", min: "1", step: "1" },
    ],
  },
  "parameter-sensitivity-tester": {
    title: "Parameter Sensitivity Tester",
    description: "See how fragile performance is across parameter shifts.",
    formulaNote: "Sensitivity score = (Best - Worst) / |Base|. Lower generally means more stable.",
    fields: [
      { key: "base", label: "Base expectancy (R)", placeholder: "e.g. 0.40", step: "0.01" },
      { key: "best", label: "Best expectancy (R)", placeholder: "e.g. 0.55", step: "0.01" },
      { key: "worst", label: "Worst expectancy (R)", placeholder: "e.g. 0.22", step: "0.01" },
    ],
  },
  "regime-filter-tester": {
    title: "Regime Filter Tester",
    description: "Measure lift when a regime filter is enabled.",
    formulaNote: "Lift = Filtered expectancy - Unfiltered expectancy.",
    fields: [
      { key: "baseExp", label: "Unfiltered expectancy (R)", placeholder: "e.g. 0.18", step: "0.01" },
      { key: "filteredExp", label: "Filtered expectancy (R)", placeholder: "e.g. 0.34", step: "0.01" },
      { key: "tradesKeptPct", label: "Trades kept by filter (%)", placeholder: "e.g. 62", min: "0", step: "0.01" },
    ],
  },
  "volatility-regime-detector": {
    title: "Volatility Regime Detector",
    description: "Classify market state from ATR relative to its baseline.",
    formulaNote: "Regime uses ATR ratio vs baseline: low, normal, or high volatility.",
    fields: [
      { key: "atrNow", label: "Current ATR", placeholder: "e.g. 1.8", min: "0", step: "0.0001" },
      { key: "atrBaseline", label: "Baseline ATR (e.g. 100-bar avg)", placeholder: "e.g. 1.2", min: "0.0001", step: "0.0001" },
    ],
  },
  "trend-strength-detector": {
    title: "Trend Strength Detector (ADX-based)",
    description: "Classify trend quality using ADX and directional movement.",
    formulaNote: "Typical ADX interpretation: <20 weak, 20-25 developing, >25 trending.",
    fields: [
      { key: "adx", label: "ADX value", placeholder: "e.g. 28", min: "0", step: "0.01" },
      { key: "plusDi", label: "+DI", placeholder: "e.g. 31", min: "0", step: "0.01" },
      { key: "minusDi", label: "-DI", placeholder: "e.g. 18", min: "0", step: "0.01" },
    ],
  },
  "mean-reversion-detector": {
    title: "Mean Reversion Detector",
    description: "Flag stretched conditions likely to revert toward mean.",
    formulaNote: "Uses z-score of price vs moving average as a quick mean-reversion signal.",
    fields: [
      { key: "price", label: "Current price", placeholder: "e.g. 103.4", min: "0", step: "0.0001" },
      { key: "ma", label: "Moving average", placeholder: "e.g. 100", min: "0", step: "0.0001" },
      { key: "std", label: "Standard deviation", placeholder: "e.g. 1.8", min: "0.0001", step: "0.0001" },
    ],
  },
  "breakout-probability-tool": {
    title: "Breakout Probability Tool",
    description: "Estimate breakout confidence from range pressure and volume expansion.",
    formulaNote: "MVP heuristic combines close-position-in-range and volume ratio.",
    fields: [
      { key: "closeInRangePct", label: "Close position in range (%)", placeholder: "e.g. 88", min: "0", step: "0.01" },
      { key: "volumeRatio", label: "Volume ratio vs average", placeholder: "e.g. 1.6", min: "0", step: "0.01" },
    ],
  },
  "range-compression-detector": {
    title: "Range Compression Detector",
    description: "Detect contraction that can precede expansion moves.",
    formulaNote: "Compression % = (Current range / Average range) * 100. Lower means tighter market.",
    fields: [
      { key: "currentRange", label: "Current range", placeholder: "e.g. 1.2", min: "0", step: "0.0001" },
      { key: "avgRange", label: "Average range", placeholder: "e.g. 2.7", min: "0.0001", step: "0.0001" },
    ],
  },
  "support-resistance-mapper": {
    title: "Support/Resistance Mapper",
    description: "Generate simple support and resistance zones from high/low swings.",
    formulaNote: "Midpoint and 25/75 bands provide a practical map for reaction zones.",
    fields: [
      { key: "swingHigh", label: "Recent swing high", placeholder: "e.g. 4280", min: "0", step: "0.0001" },
      { key: "swingLow", label: "Recent swing low", placeholder: "e.g. 4190", min: "0", step: "0.0001" },
    ],
  },
  "pivot-levels-calculator": {
    title: "Pivot Levels Calculator",
    description: "Compute classic pivot point plus first support/resistance levels.",
    formulaNote: "Classic pivots use previous period high, low, and close.",
    fields: [
      { key: "high", label: "Previous high", placeholder: "e.g. 4312", min: "0", step: "0.0001" },
      { key: "low", label: "Previous low", placeholder: "e.g. 4256", min: "0", step: "0.0001" },
      { key: "close", label: "Previous close", placeholder: "e.g. 4284", min: "0", step: "0.0001" },
    ],
  },
  "vwap-bands-calculator": {
    title: "VWAP Bands Calculator",
    description: "Build upper/lower VWAP bands from standard deviation.",
    formulaNote: "Band = VWAP ± (multiplier * std dev).",
    fields: [
      { key: "vwap", label: "VWAP", placeholder: "e.g. 4288.5", min: "0", step: "0.0001" },
      { key: "std", label: "VWAP std dev", placeholder: "e.g. 6.2", min: "0", step: "0.0001" },
      { key: "multiplier", label: "Band multiplier", placeholder: "e.g. 2", min: "0", step: "0.1", defaultValue: "2" },
    ],
  },
  "fibonacci-confluence-tool": {
    title: "Fibonacci Confluence Tool",
    description: "Project key Fib retracement levels from a swing move.",
    formulaNote: "Retracements are measured from swing high/low: 38.2%, 50%, 61.8%, 78.6%.",
    fields: [
      { key: "high", label: "Swing high", placeholder: "e.g. 4310", min: "0", step: "0.0001" },
      { key: "low", label: "Swing low", placeholder: "e.g. 4200", min: "0", step: "0.0001" },
      {
        key: "trend",
        label: "Trend direction",
        type: "select",
        defaultValue: "up",
        options: [
          { value: "up", label: "Uptrend pullback" },
          { value: "down", label: "Downtrend bounce" },
        ],
      },
    ],
  },
  "market-structure-identifier": {
    title: "Market Structure Identifier",
    description: "Classify structure from sequence of highs and lows.",
    formulaNote: "Higher highs + higher lows imply bullish structure; inverse implies bearish.",
    fields: [
      { key: "prevHigh", label: "Previous high", placeholder: "e.g. 4250", min: "0", step: "0.0001" },
      { key: "latestHigh", label: "Latest high", placeholder: "e.g. 4288", min: "0", step: "0.0001" },
      { key: "prevLow", label: "Previous low", placeholder: "e.g. 4185", min: "0", step: "0.0001" },
      { key: "latestLow", label: "Latest low", placeholder: "e.g. 4212", min: "0", step: "0.0001" },
    ],
  },
  "swing-high-low-detector": {
    title: "Swing High/Low Detector",
    description: "Estimate swing thresholds using recent bar context.",
    formulaNote: "Swing width approximates how far the current price is from nearby extremes.",
    fields: [
      { key: "highestN", label: "Highest price in lookback", placeholder: "e.g. 4298", min: "0", step: "0.0001" },
      { key: "lowestN", label: "Lowest price in lookback", placeholder: "e.g. 4210", min: "0", step: "0.0001" },
      { key: "current", label: "Current price", placeholder: "e.g. 4262", min: "0", step: "0.0001" },
    ],
  },
  "supply-demand-zone-marker": {
    title: "Supply/Demand Zone Marker",
    description: "Generate zone bounds around impulse origin candles.",
    formulaNote: "Zone width is derived from impulse candle body/range settings.",
    fields: [
      { key: "originOpen", label: "Origin candle open", placeholder: "e.g. 4230", min: "0", step: "0.0001" },
      { key: "originClose", label: "Origin candle close", placeholder: "e.g. 4252", min: "0", step: "0.0001" },
      { key: "originHigh", label: "Origin candle high", placeholder: "e.g. 4258", min: "0", step: "0.0001" },
      { key: "originLow", label: "Origin candle low", placeholder: "e.g. 4226", min: "0", step: "0.0001" },
    ],
  },
  "fair-value-gap-detector": {
    title: "Fair Value Gap Detector",
    description: "Check if a 3-candle imbalance (FVG) exists and size it.",
    formulaNote: "Bullish FVG: candle1 high < candle3 low. Bearish FVG: candle1 low > candle3 high.",
    fields: [
      { key: "c1High", label: "Candle 1 high", placeholder: "e.g. 4238", min: "0", step: "0.0001" },
      { key: "c1Low", label: "Candle 1 low", placeholder: "e.g. 4224", min: "0", step: "0.0001" },
      { key: "c3High", label: "Candle 3 high", placeholder: "e.g. 4262", min: "0", step: "0.0001" },
      { key: "c3Low", label: "Candle 3 low", placeholder: "e.g. 4246", min: "0", step: "0.0001" },
    ],
  },
};

function performanceResults(values: Record<string, number | string>): ToolResult[] | null {
  const wins = Number(values.wins || 0);
  const losses = Number(values.losses || 0);
  const avgWin = Number(values.avgWin || 0);
  const avgLoss = Number(values.avgLoss || 0);
  const total = wins + losses;
  if (total <= 0) return null;

  const winRate = (wins / total) * 100;
  const expectancy = (wins / total) * avgWin - (losses / total) * avgLoss;
  const net = wins * avgWin - losses * avgLoss;
  return [
    { label: "Win rate", value: pct(winRate), tone: winRate >= 50 ? "positive" : "danger" },
    { label: "Expectancy / trade", value: `$${num(expectancy)}`, tone: expectancy >= 0 ? "positive" : "danger" },
    { label: "Total net", value: `$${num(net)}`, tone: net >= 0 ? "positive" : "danger" },
  ];
}

export function getTradingToolDefinition(slug: string): ToolDefinition | null {
  return toolDefinitions[slug] ?? null;
}

export function getAllTradingToolSlugs() {
  return Object.keys(toolDefinitions);
}

export function computeTradingToolResults(
  slug: string,
  values: Record<string, number | string>,
): ToolResult[] | null {
  if (
    slug === "trade-journal-manual" ||
    slug === "auto-trade-journal-csv" ||
    slug === "screenshot-note-trade-journal" ||
    slug === "setup-tag-performance-analyzer" ||
    slug === "session-performance-analyzer" ||
    slug === "day-of-week-performance-analyzer" ||
    slug === "time-of-day-edge-analyzer" ||
    slug === "long-vs-short-performance-analyzer"
  ) {
    return performanceResults(values);
  }

  switch (slug) {
    case "calmar-ratio-calculator": {
      const annualReturn = Number(values.annualReturn || 0);
      const maxDrawdown = Number(values.maxDrawdown || 0);
      if (maxDrawdown <= 0) return null;
      const calmar = annualReturn / maxDrawdown;
      return [
        { label: "Calmar ratio", value: calmar.toFixed(2), tone: calmar >= 1 ? "positive" : "danger" },
        { label: "Risk-adjusted profile", value: calmar >= 1 ? "Healthy" : "Needs improvement" },
      ];
    }
    case "ab-strategy-comparator": {
      const trades = Math.max(1, Number(values.trades || 1));
      const aExp = Number(values.aAvgR || 0) * (Number(values.aWinRate || 0) / 100);
      const bExp = Number(values.bAvgR || 0) * (Number(values.bWinRate || 0) / 100);
      const winner = aExp === bExp ? "Tie" : aExp > bExp ? "Strategy A" : "Strategy B";
      return [
        { label: "Strategy A expectancy proxy (R)", value: aExp.toFixed(3) },
        { label: "Strategy B expectancy proxy (R)", value: bExp.toFixed(3) },
        { label: "Projected edge winner", value: winner, tone: winner === "Tie" ? "default" : "positive" },
        { label: "Projected R delta over sample", value: ((aExp - bExp) * trades).toFixed(2) + " R" },
      ];
    }
    case "strategy-backtest-lite": {
      const trades = Number(values.trades || 0);
      const winRate = Number(values.winRate || 0) / 100;
      const avgWinR = Number(values.avgWinR || 0);
      const avgLossR = Number(values.avgLossR || 0);
      const riskPerTrade = Number(values.riskPerTrade || 0);
      if (trades <= 0) return null;
      const expectancyR = winRate * avgWinR - (1 - winRate) * avgLossR;
      const pnl = trades * expectancyR * riskPerTrade;
      return [
        { label: "Expectancy", value: expectancyR.toFixed(3) + " R", tone: expectancyR >= 0 ? "positive" : "danger" },
        { label: "Projected P&L", value: `$${num(pnl)}`, tone: pnl >= 0 ? "positive" : "danger" },
      ];
    }
    case "walk-forward-backtest-tool": {
      const inSampleExp = Number(values.inSampleExp || 0);
      const outSampleExp = Number(values.outSampleExp || 0);
      const outSampleTrades = Number(values.outSampleTrades || 0);
      if (outSampleTrades <= 0) return null;
      const retention = inSampleExp === 0 ? 0 : (outSampleExp / inSampleExp) * 100;
      const score = Math.max(0, Math.min(100, retention)) * Math.min(1, outSampleTrades / 100);
      return [
        { label: "Out-of-sample retention", value: pct(retention), tone: retention >= 70 ? "positive" : "danger" },
        { label: "Robustness score", value: score.toFixed(1) + "/100", tone: score >= 60 ? "positive" : "danger" },
      ];
    }
    case "parameter-sensitivity-tester": {
      const base = Number(values.base || 0);
      const best = Number(values.best || 0);
      const worst = Number(values.worst || 0);
      const denom = Math.abs(base) <= 0.0001 ? 1 : Math.abs(base);
      const sensitivity = (best - worst) / denom;
      return [
        { label: "Sensitivity score", value: sensitivity.toFixed(2), tone: sensitivity <= 1 ? "positive" : "danger" },
        { label: "Stability", value: sensitivity <= 1 ? "Stable-ish" : "Fragile to parameter shifts" },
      ];
    }
    case "regime-filter-tester": {
      const baseExp = Number(values.baseExp || 0);
      const filteredExp = Number(values.filteredExp || 0);
      const kept = Number(values.tradesKeptPct || 0);
      const lift = filteredExp - baseExp;
      return [
        { label: "Expectancy lift", value: `${lift >= 0 ? "+" : ""}${lift.toFixed(3)} R`, tone: lift >= 0 ? "positive" : "danger" },
        { label: "Trades kept", value: pct(kept) },
      ];
    }
    case "volatility-regime-detector": {
      const atrNow = Number(values.atrNow || 0);
      const atrBaseline = Number(values.atrBaseline || 0);
      if (atrBaseline <= 0) return null;
      const ratio = atrNow / atrBaseline;
      const regime = ratio < 0.85 ? "Low volatility" : ratio > 1.2 ? "High volatility" : "Normal volatility";
      return [
        { label: "ATR ratio", value: ratio.toFixed(2) + "x" },
        { label: "Detected regime", value: regime, tone: ratio > 1.2 ? "danger" : "default" },
      ];
    }
    case "trend-strength-detector": {
      const adx = Number(values.adx || 0);
      const plusDi = Number(values.plusDi || 0);
      const minusDi = Number(values.minusDi || 0);
      const bias = plusDi === minusDi ? "Neutral bias" : plusDi > minusDi ? "Bullish bias" : "Bearish bias";
      const trend = adx < 20 ? "Weak / ranging" : adx < 25 ? "Developing trend" : "Strong trend";
      return [
        { label: "Trend strength", value: trend, tone: adx >= 25 ? "positive" : "default" },
        { label: "Directional bias", value: bias },
      ];
    }
    case "mean-reversion-detector": {
      const price = Number(values.price || 0);
      const ma = Number(values.ma || 0);
      const std = Number(values.std || 0);
      if (std <= 0) return null;
      const z = (price - ma) / std;
      const signal = Math.abs(z) >= 2 ? "Strong reversion setup" : Math.abs(z) >= 1 ? "Moderate stretch" : "Near mean";
      return [
        { label: "Z-score", value: z.toFixed(2), tone: Math.abs(z) >= 2 ? "danger" : "default" },
        { label: "Mean-reversion signal", value: signal },
      ];
    }
    case "breakout-probability-tool": {
      const closeInRangePct = Number(values.closeInRangePct || 0);
      const volumeRatio = Number(values.volumeRatio || 0);
      const score = Math.max(0, Math.min(100, closeInRangePct * 0.6 + Math.min(volumeRatio, 3) / 3 * 40));
      return [
        { label: "Breakout confidence", value: pct(score), tone: score >= 65 ? "positive" : "default" },
      ];
    }
    case "range-compression-detector": {
      const currentRange = Number(values.currentRange || 0);
      const avgRange = Number(values.avgRange || 0);
      if (avgRange <= 0) return null;
      const compressionPct = (currentRange / avgRange) * 100;
      return [
        { label: "Compression ratio", value: pct(compressionPct), tone: compressionPct < 70 ? "positive" : "default" },
        { label: "Condition", value: compressionPct < 70 ? "Compressed" : "Normal/expanded" },
      ];
    }
    case "support-resistance-mapper": {
      const high = Number(values.swingHigh || 0);
      const low = Number(values.swingLow || 0);
      if (high <= low) return null;
      const range = high - low;
      return [
        { label: "Support zone", value: `${num(low)} - ${num(low + range * 0.25)}` },
        { label: "Mid zone", value: `${num(low + range * 0.45)} - ${num(low + range * 0.55)}` },
        { label: "Resistance zone", value: `${num(low + range * 0.75)} - ${num(high)}` },
      ];
    }
    case "pivot-levels-calculator": {
      const high = Number(values.high || 0);
      const low = Number(values.low || 0);
      const close = Number(values.close || 0);
      if (high <= 0 || low <= 0 || close <= 0) return null;
      const p = (high + low + close) / 3;
      const r1 = 2 * p - low;
      const s1 = 2 * p - high;
      return [
        { label: "Pivot (P)", value: num(p) },
        { label: "Resistance 1 (R1)", value: num(r1) },
        { label: "Support 1 (S1)", value: num(s1) },
      ];
    }
    case "vwap-bands-calculator": {
      const vwap = Number(values.vwap || 0);
      const std = Number(values.std || 0);
      const multiplier = Number(values.multiplier || 2);
      return [
        { label: "Upper band", value: num(vwap + multiplier * std) },
        { label: "VWAP", value: num(vwap) },
        { label: "Lower band", value: num(vwap - multiplier * std) },
      ];
    }
    case "fibonacci-confluence-tool": {
      const high = Number(values.high || 0);
      const low = Number(values.low || 0);
      const trend = String(values.trend || "up");
      if (high <= low) return null;
      const range = high - low;
      const level = (ratio: number) => (trend === "up" ? high - range * ratio : low + range * ratio);
      return [
        { label: "38.2%", value: num(level(0.382)) },
        { label: "50.0%", value: num(level(0.5)) },
        { label: "61.8%", value: num(level(0.618)) },
        { label: "78.6%", value: num(level(0.786)) },
      ];
    }
    case "market-structure-identifier": {
      const prevHigh = Number(values.prevHigh || 0);
      const latestHigh = Number(values.latestHigh || 0);
      const prevLow = Number(values.prevLow || 0);
      const latestLow = Number(values.latestLow || 0);
      const bullish = latestHigh > prevHigh && latestLow > prevLow;
      const bearish = latestHigh < prevHigh && latestLow < prevLow;
      const structure = bullish ? "Bullish structure (HH + HL)" : bearish ? "Bearish structure (LH + LL)" : "Range / transition";
      return [{ label: "Detected structure", value: structure, tone: bullish ? "positive" : bearish ? "danger" : "default" }];
    }
    case "swing-high-low-detector": {
      const highest = Number(values.highestN || 0);
      const lowest = Number(values.lowestN || 0);
      const current = Number(values.current || 0);
      if (highest <= lowest) return null;
      const pos = ((current - lowest) / (highest - lowest)) * 100;
      return [
        { label: "Lookback swing range", value: `${num(lowest)} - ${num(highest)}` },
        { label: "Current location in range", value: pct(pos) },
      ];
    }
    case "supply-demand-zone-marker": {
      const open = Number(values.originOpen || 0);
      const close = Number(values.originClose || 0);
      const high = Number(values.originHigh || 0);
      const low = Number(values.originLow || 0);
      if (high <= low) return null;
      const demandLow = Math.min(open, close);
      const demandHigh = Math.max(open, close);
      return [
        { label: "Demand/Supply body zone", value: `${num(demandLow)} - ${num(demandHigh)}` },
        { label: "Full wick range", value: `${num(low)} - ${num(high)}` },
      ];
    }
    case "fair-value-gap-detector": {
      const c1High = Number(values.c1High || 0);
      const c1Low = Number(values.c1Low || 0);
      const c3High = Number(values.c3High || 0);
      const c3Low = Number(values.c3Low || 0);
      const bullishGap = c3Low - c1High;
      const bearishGap = c1Low - c3High;
      if (bullishGap > 0) {
        return [
          { label: "FVG type", value: "Bullish imbalance", tone: "positive" },
          { label: "Gap size", value: num(bullishGap) },
          { label: "Gap zone", value: `${num(c1High)} - ${num(c3Low)}` },
        ];
      }
      if (bearishGap > 0) {
        return [
          { label: "FVG type", value: "Bearish imbalance", tone: "danger" },
          { label: "Gap size", value: num(bearishGap) },
          { label: "Gap zone", value: `${num(c3High)} - ${num(c1Low)}` },
        ];
      }
      return [{ label: "FVG type", value: "No clear 3-candle gap detected" }];
    }
    default:
      return null;
  }
}
