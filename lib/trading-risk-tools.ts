export type TradingRiskToolDefinition = {
  slug: string;
  title: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    min?: number;
    step?: number;
  }>;
};

export const TRADING_RISK_TOOLS: TradingRiskToolDefinition[] = [
  {
    slug: "portfolio-risk-heatmap",
    title: "Portfolio Risk Heatmap",
    description: "Estimate each position's risk contribution from weight and volatility.",
    fields: [
      { key: "weights", label: "Weights (%)", placeholder: "25,20,15,25,15" },
      { key: "vols", label: "Volatility (%)", placeholder: "18,30,12,22,10" },
    ],
  },
  {
    slug: "correlation-matrix-tool",
    title: "Correlation Matrix Tool",
    description: "Calculate pairwise correlations from returns entered asset-by-asset.",
    fields: [{ key: "returns", label: "Asset returns (line per asset)", placeholder: "0.01,0.02,-0.01\n0.00,0.01,-0.02\n0.02,0.03,0.01" }],
  },
  {
    slug: "beta-exposure-calculator",
    title: "Beta Exposure Calculator",
    description: "Portfolio beta from each position value and instrument beta.",
    fields: [
      { key: "values", label: "Position values", placeholder: "10000,15000,8000" },
      { key: "betas", label: "Position betas", placeholder: "1.2,0.8,1.5" },
    ],
  },
  {
    slug: "sector-exposure-analyzer",
    title: "Sector Exposure Analyzer",
    description: "Break down concentration by sector weights.",
    fields: [{ key: "sectorWeights", label: "Sector weights (%)", placeholder: "Technology:35\nHealthcare:20\nFinancials:25\nEnergy:20" }],
  },
  {
    slug: "currency-exposure-analyzer",
    title: "Currency Exposure Analyzer",
    description: "Estimate FX concentration by currency allocation.",
    fields: [{ key: "currencyWeights", label: "Currency weights (%)", placeholder: "USD:55\nEUR:20\nJPY:15\nGBP:10" }],
  },
  {
    slug: "concentration-risk-analyzer",
    title: "Concentration Risk Analyzer",
    description: "HHI and largest-position concentration score.",
    fields: [{ key: "positionWeights", label: "Position weights (%)", placeholder: "22,18,14,12,10,8,8,8" }],
  },
  {
    slug: "var-calculator",
    title: "VaR (Value at Risk) Calculator",
    description: "Parametric VaR from portfolio value, volatility, confidence, and horizon.",
    fields: [
      { key: "portfolioValue", label: "Portfolio value", placeholder: "100000" },
      { key: "dailyVol", label: "Daily volatility (%)", placeholder: "1.8" },
      { key: "confidence", label: "Confidence level (%)", placeholder: "95" },
      { key: "days", label: "Time horizon (days)", placeholder: "1", min: 1 },
    ],
  },
  {
    slug: "expected-shortfall-calculator",
    title: "Expected Shortfall Calculator",
    description: "Estimate average tail loss beyond VaR with normal approximation.",
    fields: [
      { key: "portfolioValue", label: "Portfolio value", placeholder: "100000" },
      { key: "dailyVol", label: "Daily volatility (%)", placeholder: "1.8" },
      { key: "confidence", label: "Confidence level (%)", placeholder: "95" },
      { key: "days", label: "Time horizon (days)", placeholder: "1", min: 1 },
    ],
  },
  {
    slug: "monte-carlo-equity-simulator",
    title: "Monte Carlo Equity Simulator",
    description: "Simulate expected ending equity from return, volatility, and number of trades.",
    fields: [
      { key: "startingEquity", label: "Starting equity", placeholder: "10000" },
      { key: "meanTradeReturn", label: "Mean return per trade (%)", placeholder: "0.35" },
      { key: "tradeVol", label: "Std dev per trade (%)", placeholder: "1.8" },
      { key: "trades", label: "Number of trades", placeholder: "120", min: 1 },
    ],
  },
  {
    slug: "equity-curve-analyzer",
    title: "Equity Curve Analyzer",
    description: "Compute total return and max drawdown from an equity curve.",
    fields: [{ key: "equitySeries", label: "Equity series", placeholder: "10000,10250,10100,10400,9900,10750" }],
  },
  {
    slug: "streak-probability-calculator",
    title: "Streak Probability Calculator",
    description: "Probability of at least one winning streak over N trades.",
    fields: [
      { key: "winRate", label: "Win rate (%)", placeholder: "48" },
      { key: "streakLength", label: "Streak length", placeholder: "5", min: 1 },
      { key: "trades", label: "Total trades", placeholder: "100", min: 1 },
    ],
  },
  {
    slug: "win-loss-streak-risk-estimator",
    title: "Win/Loss Streak Risk Estimator",
    description: "Estimate chance of at least one losing streak.",
    fields: [
      { key: "winRate", label: "Win rate (%)", placeholder: "48" },
      { key: "lossStreakLength", label: "Losing streak length", placeholder: "6", min: 1 },
      { key: "trades", label: "Total trades", placeholder: "100", min: 1 },
    ],
  },
  {
    slug: "risk-of-ruin-calculator",
    title: "Risk of Ruin Calculator",
    description: "Approximate probability of ruin from edge and risk per trade.",
    fields: [
      { key: "winRate", label: "Win rate (%)", placeholder: "48" },
      { key: "rewardRisk", label: "Reward-to-risk ratio", placeholder: "1.5" },
      { key: "riskPerTrade", label: "Risk per trade (%)", placeholder: "1.0" },
      { key: "ruinThreshold", label: "Ruin threshold drawdown (%)", placeholder: "50" },
    ],
  },
  {
    slug: "expectancy-calculator",
    title: "Expectancy Calculator",
    description: "Expected value per trade from win rate and average win/loss.",
    fields: [
      { key: "winRate", label: "Win rate (%)", placeholder: "48" },
      { key: "avgWin", label: "Average win (R or $)", placeholder: "1.6" },
      { key: "avgLoss", label: "Average loss (R or $)", placeholder: "1.0" },
    ],
  },
  {
    slug: "profit-factor-calculator",
    title: "Profit Factor Calculator",
    description: "Gross profit divided by gross loss.",
    fields: [
      { key: "grossProfit", label: "Gross profit", placeholder: "8500" },
      { key: "grossLoss", label: "Gross loss", placeholder: "5000" },
    ],
  },
  {
    slug: "sharpe-ratio-calculator",
    title: "Sharpe Ratio Calculator",
    description: "Risk-adjusted return using total volatility.",
    fields: [
      { key: "portfolioReturn", label: "Annual return (%)", placeholder: "18" },
      { key: "riskFreeRate", label: "Risk-free rate (%)", placeholder: "4.5" },
      { key: "volatility", label: "Annual volatility (%)", placeholder: "14" },
    ],
  },
  {
    slug: "sortino-ratio-calculator",
    title: "Sortino Ratio Calculator",
    description: "Risk-adjusted return using downside deviation.",
    fields: [
      { key: "portfolioReturn", label: "Annual return (%)", placeholder: "18" },
      { key: "targetReturn", label: "Target/required return (%)", placeholder: "4.5" },
      { key: "downsideDeviation", label: "Downside deviation (%)", placeholder: "9.5" },
    ],
  },
];

export const TRADING_RISK_TOOL_SLUGS = new Set(TRADING_RISK_TOOLS.map((tool) => tool.slug));
