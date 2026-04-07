export type TradingTool = {
  slug: string;
  title: string;
  shortDescription: string;
  keywords: string;
};

export const TRADING_TOOLS: TradingTool[] = [
  {
    slug: "order-block-detector",
    title: "Order Block Detector",
    shortDescription: "Flag candidate bullish or bearish order block zones from recent swing structure.",
    keywords: "order block smart money concept zone trading",
  },
  {
    slug: "liquidity-sweep-detector",
    title: "Liquidity Sweep Detector",
    shortDescription: "Spot potential stop hunts around prior highs and lows.",
    keywords: "liquidity sweep stop hunt equal highs lows",
  },
  {
    slug: "candlestick-pattern-scanner",
    title: "Candlestick Pattern Scanner",
    shortDescription: "Scan a sequence of candles for common reversal and continuation patterns.",
    keywords: "candlestick patterns engulfing doji hammer",
  },
  {
    slug: "multi-timeframe-confluence-checker",
    title: "Multi-Timeframe Confluence Checker",
    shortDescription: "Compare alignment across trend, structure, and momentum on multiple timeframes.",
    keywords: "mtf confluence trend alignment",
  },
  {
    slug: "correlated-asset-confirmation-tool",
    title: "Correlated Asset Confirmation Tool",
    shortDescription: "Check directional confirmation between a primary symbol and correlated markets.",
    keywords: "correlation confirmation intermarket",
  },
  {
    slug: "news-event-volatility-filter",
    title: "News Event Volatility Filter",
    shortDescription: "Estimate if upcoming events suggest reducing risk or skipping setups.",
    keywords: "news volatility filter risk",
  },
  {
    slug: "economic-calendar-impact-planner",
    title: "Economic Calendar Impact Planner",
    shortDescription: "Build a pre-event and post-event trade timing plan.",
    keywords: "economic calendar nfp cpi fomc planner",
  },
  {
    slug: "earnings-move-estimator",
    title: "Earnings Move Estimator",
    shortDescription: "Estimate likely post-earnings move scenarios with weighted outcomes.",
    keywords: "earnings move estimator implied move",
  },
  {
    slug: "gap-probability-estimator",
    title: "Gap Probability Estimator",
    shortDescription: "Score the likelihood of a gap up or gap down for the next session.",
    keywords: "gap probability premarket",
  },
  {
    slug: "pre-market-plan-builder",
    title: "Pre-Market Plan Builder",
    shortDescription: "Generate a structured checklist and scenarios before market open.",
    keywords: "premarket trading plan checklist",
  },
  {
    slug: "post-market-review-assistant",
    title: "Post-Market Review Assistant",
    shortDescription: "Turn daily execution notes into a structured review.",
    keywords: "post market review journal",
  },
  {
    slug: "trade-checklist-builder",
    title: "Trade Checklist Builder",
    shortDescription: "Create a repeatable pre-trade checklist with weighted criteria.",
    keywords: "trade checklist execution discipline",
  },
  {
    slug: "trading-plan-generator",
    title: "Trading Plan Generator",
    shortDescription: "Draft a complete rules-based trading plan from your constraints.",
    keywords: "trading plan strategy risk rules",
  },
  {
    slug: "prop-firm-rule-compliance-checker",
    title: "Prop-Firm Rule Compliance Checker",
    shortDescription: "Validate trade decisions against prop-firm style constraints.",
    keywords: "prop firm compliance max loss rules",
  },
  {
    slug: "daily-loss-limit-alert-tool",
    title: "Daily Loss Limit Alert Tool",
    shortDescription: "Track realized and open risk against a daily drawdown limit.",
    keywords: "daily loss limit drawdown alert",
  },
  {
    slug: "weekly-loss-limit-guardrail",
    title: "Weekly Loss Limit Guardrail",
    shortDescription: "Monitor performance and halt conditions against weekly limits.",
    keywords: "weekly loss guardrail risk cap",
  },
  {
    slug: "max-open-risk-checker",
    title: "Max Open Risk Checker",
    shortDescription: "Ensure total open-position risk does not exceed your cap.",
    keywords: "max open risk portfolio cap",
  },
  {
    slug: "position-netting-calculator",
    title: "Position Netting Calculator",
    shortDescription: "Net long and short exposures across entries to compute true risk.",
    keywords: "position netting exposure calculator",
  },
  {
    slug: "hedge-ratio-calculator",
    title: "Hedge Ratio Calculator",
    shortDescription: "Calculate a hedge size needed to offset directional exposure.",
    keywords: "hedge ratio beta hedge",
  },
  {
    slug: "pairs-trade-spread-analyzer",
    title: "Pairs Trade Spread Analyzer",
    shortDescription: "Track spread deviation and reversion levels between two assets.",
    keywords: "pairs trading spread zscore",
  },
  {
    slug: "cointegration-checker",
    title: "Cointegration Checker",
    shortDescription: "Run a lightweight stationarity proxy for pair relationship stability.",
    keywords: "cointegration pairs mean reversion",
  },
  {
    slug: "futures-basis-monitor",
    title: "Futures Basis Monitor",
    shortDescription: "Compare spot and futures prices to monitor basis conditions.",
    keywords: "futures basis contango backwardation",
  },
  {
    slug: "funding-rate-monitor",
    title: "Funding Rate Monitor",
    shortDescription: "Track funding bias and potential squeeze conditions over time.",
    keywords: "funding rate perpetuals crypto",
  },
  {
    slug: "open-interest-trend-analyzer",
    title: "Open Interest Trend Analyzer",
    shortDescription: "Analyze whether OI confirms or diverges from price trend.",
    keywords: "open interest trend divergence",
  },
  {
    slug: "cot-data-visualizer",
    title: "COT Data Visualizer",
    shortDescription: "Visualize commitment of traders positioning in a simple summary.",
    keywords: "cot report positioning",
  },
  {
    slug: "seasonality-analyzer",
    title: "Seasonality Analyzer",
    shortDescription: "Show month/day tendencies and sample bias for your instrument.",
    keywords: "seasonality monthly tendency",
  },
  {
    slug: "volume-profile-lite",
    title: "Volume Profile Lite",
    shortDescription: "Approximate high-volume and low-volume areas from uploaded ranges.",
    keywords: "volume profile poc value area",
  },
  {
    slug: "delta-imbalance-visualizer",
    title: "Delta Imbalance Visualizer",
    shortDescription: "Visualize buying vs selling pressure imbalance snapshots.",
    keywords: "delta imbalance orderflow",
  },
  {
    slug: "tape-speed-alert-tool",
    title: "Tape Speed Alert Tool",
    shortDescription: "Flag unusual burst activity in print rate or volume pace.",
    keywords: "tape speed time and sales alert",
  },
  {
    slug: "smart-alert-builder-price-indicator",
    title: "Smart Alert Builder (Price + Indicator)",
    shortDescription: "Compose compound alerts combining price levels and indicator states.",
    keywords: "smart alerts indicator confluence",
  },
  {
    slug: "journal-to-insight-ai-assistant",
    title: "Journal-to-Insight AI Assistant",
    shortDescription: "Convert journal entries into recurring edge and mistake themes.",
    keywords: "trading journal ai insights",
  },
  {
    slug: "psychology-trigger-tracker",
    title: "Psychology Trigger Tracker",
    shortDescription: "Track emotional triggers and context to reduce repeat mistakes.",
    keywords: "psychology trigger emotions discipline",
  },
  {
    slug: "discipline-scorecard",
    title: "Discipline Scorecard",
    shortDescription: "Score rule adherence across entries, exits, and risk management.",
    keywords: "discipline scorecard execution",
  },
  {
    slug: "trader-kpi-dashboard",
    title: "Trader KPI Dashboard",
    shortDescription: "Summarize key metrics like expectancy, hit rate, and drawdown.",
    keywords: "trader kpi dashboard expectancy",
  },
];

export function getTradingToolBySlug(slug: string): TradingTool | undefined {
  return TRADING_TOOLS.find((tool) => tool.slug === slug);
}
